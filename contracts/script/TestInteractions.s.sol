// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import "../contracts/BlueFireFactory.sol";
import "../contracts/UnitProjectERC721.sol";
import "../contracts/interfaces/IBlueFireFactory.sol";

contract TestInteractions is Script {
    // Deployed contract addresses (from previous deployment)
    BlueFireFactory factory = BlueFireFactory(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512);
    UnitProjectERC721 project = UnitProjectERC721(0xCafac3dD18aC6c6e92c921884f9E4176737C052c);
    
    // Anvil test accounts
    address admin = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address investor1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    address investor2 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    address alice = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    
    // Private keys for anvil accounts
    uint256 adminKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint256 investor1Key = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
    uint256 investor2Key = 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a;

    function run() external {
        console.log("=== TESTING BLUE FIRE PLATFORM INTERACTIONS ===\n");
        
        // Test 1: Investor funding flow
        testInvestorFunding();
        
        // Test 2: Complete escrow release
        testEscrowRelease();
        
        // Test 3: Revenue deposit and claiming
        testRevenueAndClaims();
        
        console.log("\n=== ALL TESTS COMPLETED SUCCESSFULLY ===");
    }
    
    function testInvestorFunding() public {
        console.log("1. TESTING INVESTOR FUNDING FLOW");
        console.log("================================");
        
        // Investor 1 funds 30 ETH (30% of 100 ETH cap)
        vm.startBroadcast(investor1Key);
        uint256 tokenId1 = project.fundProject{value: 30 ether}();
        vm.stopBroadcast();
        
        console.log("Investor 1 funded 30 ETH, received token ID:", tokenId1);
        console.log("Total funded:", project.totalFunded() / 1e18, "ETH");
        
        // Investor 2 funds 70 ETH (70% of 100 ETH cap) - should complete funding
        vm.startBroadcast(investor2Key);
        uint256 tokenId2 = project.fundProject{value: 70 ether}();
        vm.stopBroadcast();
        
        console.log("Investor 2 funded 70 ETH, received token ID:", tokenId2);
        console.log("Total funded:", project.totalFunded() / 1e18, "ETH");
        console.log("Project state:", uint(project.state()), "(1 = FUNDED)");
        
        // Verify investor positions
        console.log("Investor 1 position:", project.funded(tokenId1) / 1e18, "ETH");
        console.log("Investor 2 position:", project.funded(tokenId2) / 1e18, "ETH");
        console.log("");
    }
    
    function testEscrowRelease() public {
        console.log("2. TESTING ESCROW RELEASE FLOW");
        console.log("==============================");
        
        uint256 beneficiaryBalanceBefore = investor1.balance;
        console.log("Beneficiary balance before:", beneficiaryBalanceBefore / 1e18, "ETH");
        
        // Admin approves and releases escrow (two-step process)
        vm.startBroadcast(adminKey);
        
        // First sync the factory state (factory and project track state separately)
        factory.setProjectState(1, IBlueFireFactory.ProjectState.FUNDED);
        
        factory.approveEscrowRelease(1);
        console.log("Escrow release approved");
        
        factory.releaseEscrow(1);
        console.log("Escrow released to beneficiary");
        vm.stopBroadcast();
        
        uint256 beneficiaryBalanceAfter = investor1.balance;
        console.log("Beneficiary balance after:", beneficiaryBalanceAfter / 1e18, "ETH");
        console.log("Received:", (beneficiaryBalanceAfter - beneficiaryBalanceBefore) / 1e18, "ETH");
        console.log("Project state:", uint(project.state()), "(2 = OPERATIONAL)");
        console.log("");
    }
    
    function testRevenueAndClaims() public {
        console.log("3. TESTING REVENUE DEPOSIT AND CLAIMS");
        console.log("=====================================");
        
        // Alice deposits revenue
        vm.startBroadcast(investor2Key); // Using investor2Key as Alice
        project.payWaterRevenue{value: 20 ether}();
        vm.stopBroadcast();
        
        console.log("Alice deposited 20 ETH revenue");
        
        // Check pending rewards
        uint256 pending1 = project.pendingRewards(0);
        uint256 pending2 = project.pendingRewards(1);
        
        console.log("Investor 1 pending rewards:", pending1 / 1e18, "ETH (30% of 20 ETH = 6 ETH)");
        console.log("Investor 2 pending rewards:", pending2 / 1e18, "ETH (70% of 20 ETH = 14 ETH)");
        
        // Investors claim rewards
        uint256 investor1BalanceBefore = investor1.balance;
        uint256 investor2BalanceBefore = investor2.balance;
        
        vm.startBroadcast(investor1Key);
        uint256 claimed1 = project.claim(0);
        vm.stopBroadcast();
        
        vm.startBroadcast(investor2Key);
        uint256 claimed2 = project.claim(1);
        vm.stopBroadcast();
        
        console.log("Investor 1 claimed:", claimed1 / 1e18, "ETH");
        console.log("Investor 2 claimed:", claimed2 / 1e18, "ETH");
        
        uint256 investor1BalanceAfter = investor1.balance;
        uint256 investor2BalanceAfter = investor2.balance;
        
        console.log("Investor 1 balance change:", (investor1BalanceAfter - investor1BalanceBefore) / 1e18, "ETH");
        console.log("Investor 2 balance change:", (investor2BalanceAfter - investor2BalanceBefore) / 1e18, "ETH");
        
        // Verify no pending rewards left
        console.log("Investor 1 remaining pending:", project.pendingRewards(0));
        console.log("Investor 2 remaining pending:", project.pendingRewards(1));
        console.log("");
    }
} 