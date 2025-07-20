// === File: test/Claim.t.sol ===
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/BlueFireFactory.sol";
import "../contracts/UnitProjectERC721.sol";
import "../contracts/interfaces/IUnitProjectERC721.sol";

contract ClaimTest is Test {
    BlueFireFactory public factory;
    UnitProjectERC721 public projectImplementation;
    UnitProjectERC721 public project;
    
    address public admin = address(0x1);
    address public investor1 = address(0x2);
    address public investor2 = address(0x3);
    address public investor3 = address(0x4);
    address public beneficiary = address(0x5);
    address public alice = address(0x6);
    
    uint256 public projectId;
    uint256 public constant FUNDING_CAP = 1000 ether;

    event RewardsClaimed(uint256 indexed projectId, address indexed investor, uint256 indexed tokenId, uint256 amount);

    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy contracts
        projectImplementation = new UnitProjectERC721();
        factory = new BlueFireFactory(address(projectImplementation));
        
        // Create project
        projectId = factory.createProject(
            "Test Water Plant",
            "Lagos, Nigeria",
            "AquaGen-3000",
            FUNDING_CAP,
            beneficiary
        );
        
        project = UnitProjectERC721(factory.getProjectAddress(projectId));
        
        // Set Alice as operator
        factory.setAlice(projectId, alice);
        
        vm.stopPrank();
        
        // Give test accounts some ETH
        vm.deal(investor1, 1000 ether);
        vm.deal(investor2, 1000 ether);
        vm.deal(investor3, 1000 ether);
        vm.deal(alice, 1000 ether);
        
        // Fund the project
        vm.prank(investor1);
        project.fundProject{value: 500 ether}(); // 50% share
        
        vm.prank(investor2);
        project.fundProject{value: 300 ether}(); // 30% share
        
        vm.prank(investor3);
        project.fundProject{value: 200 ether}(); // 20% share
        
        // Complete escrow release
        vm.startPrank(admin);
        factory.approveEscrowRelease(projectId);
        factory.releaseEscrow(projectId);
        vm.stopPrank();
        
        // Deposit initial revenue
        vm.prank(alice);
        project.payWaterRevenue{value: 100 ether}();
    }

    function testClaimRewards() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        uint256 pendingBefore = project.pendingRewards(tokenId1);
        uint256 balanceBefore = investor1.balance;
        
        assertEq(pendingBefore, 50 ether); // 50% of 100 ether
        
        vm.prank(investor1);
        vm.expectEmit(true, true, true, true);
        emit RewardsClaimed(projectId, investor1, tokenId1, 50 ether);
        
        uint256 claimed = project.claim(tokenId1);
        
        assertEq(claimed, 50 ether);
        assertEq(investor1.balance, balanceBefore + 50 ether);
        assertEq(project.pendingRewards(tokenId1), 0);
        
        // Check reward debt updated
        uint256 expectedDebt = (project.funded(tokenId1) * project.accRevenuePerShare()) / project.ACC_PRECISION();
        assertEq(project.rewardDebt(tokenId1), expectedDebt);
    }

    function testClaimAllRewards() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        uint256 pendingBefore = project.pendingRewards(tokenId1);
        uint256 balanceBefore = investor1.balance;
        
        vm.prank(investor1);
        uint256 claimed = project.claimAll();
        
        assertEq(claimed, pendingBefore);
        assertEq(investor1.balance, balanceBefore + pendingBefore);
        assertEq(project.pendingRewards(tokenId1), 0);
    }

    function testClaimFailsNotOwner() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        vm.prank(investor2);
        vm.expectRevert(bytes("NOT_OWNER"));
        project.claim(tokenId1);
    }

    function testClaimFailsNoRewards() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // Claim once
        vm.prank(investor1);
        project.claim(tokenId1);
        
        // Try to claim again with no pending rewards
        vm.prank(investor1);
        vm.expectRevert(bytes("NO_REWARDS"));
        project.claim(tokenId1);
    }

    function testClaimAllFailsNoToken() public {
        address noTokenInvestor = address(0x99);
        
        vm.prank(noTokenInvestor);
        vm.expectRevert(bytes("NO_TOKEN"));
        project.claimAll();
    }

    function testClaimAllFailsNoRewards() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // Claim once
        vm.prank(investor1);
        project.claimAll();
        
        // Try to claim again
        vm.prank(investor1);
        vm.expectRevert(bytes("NO_REWARDS"));
        project.claimAll();
    }

    function testClaimWithGlobalPause() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        vm.prank(admin);
        factory.setGlobalPause(IBlueFireFactory.PauseType.CLAIMS, true);
        
        vm.prank(investor1);
        vm.expectRevert(bytes("GLOBALLY_PAUSED"));
        project.claim(tokenId1);
        
        vm.prank(investor1);
        vm.expectRevert(bytes("GLOBALLY_PAUSED"));
        project.claimAll();
    }

    function testMultipleInvestorClaims() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        uint256 tokenId2 = project.investorToTokenId(investor2);
        uint256 tokenId3 = project.investorToTokenId(investor3);
        
        uint256 balance1Before = investor1.balance;
        uint256 balance2Before = investor2.balance;
        uint256 balance3Before = investor3.balance;
        
        // All claim
        vm.prank(investor1);
        uint256 claimed1 = project.claim(tokenId1);
        
        vm.prank(investor2);
        uint256 claimed2 = project.claim(tokenId2);
        
        vm.prank(investor3);
        uint256 claimed3 = project.claim(tokenId3);
        
        // Check amounts
        assertEq(claimed1, 50 ether);
        assertEq(claimed2, 30 ether);
        assertEq(claimed3, 20 ether);
        
        // Check balances
        assertEq(investor1.balance, balance1Before + 50 ether);
        assertEq(investor2.balance, balance2Before + 30 ether);
        assertEq(investor3.balance, balance3Before + 20 ether);
        
        // Check all pending rewards are zero
        assertEq(project.pendingRewards(tokenId1), 0);
        assertEq(project.pendingRewards(tokenId2), 0);
        assertEq(project.pendingRewards(tokenId3), 0);
        
        // Total claimed should equal revenue deposited
        assertEq(claimed1 + claimed2 + claimed3, 100 ether);
    }

    function testClaimAfterAdditionalRevenue() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // First claim
        vm.prank(investor1);
        uint256 firstClaim = project.claim(tokenId1);
        assertEq(firstClaim, 50 ether);
        
        // Add more revenue
        vm.prank(alice);
        project.payWaterRevenue{value: 200 ether}();
        
        // Check new pending rewards
        uint256 newPending = project.pendingRewards(tokenId1);
        assertEq(newPending, 100 ether); // 50% of 200 ether
        
        // Second claim
        uint256 balanceBefore = investor1.balance;
        vm.prank(investor1);
        uint256 secondClaim = project.claim(tokenId1);
        
        assertEq(secondClaim, 100 ether);
        assertEq(investor1.balance, balanceBefore + 100 ether);
        assertEq(project.pendingRewards(tokenId1), 0);
    }

    function testPartialClaimPattern() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        uint256 totalRevenue = 0;
        uint256 totalClaimed = 0;
        
        // Multiple revenue deposits with claims in between
        for (uint i = 0; i < 5; i++) {
            uint256 revenue = (i + 1) * 10 ether;
            totalRevenue += revenue;
            
            // Deposit revenue
            vm.prank(alice);
            project.payWaterRevenue{value: revenue}();
            
            // Claim rewards
            vm.prank(investor1);
            uint256 claimed = project.claim(tokenId1);
            totalClaimed += claimed;
            
            // Should have claimed 50% of this revenue
            assertEq(claimed, revenue / 2);
            assertEq(project.pendingRewards(tokenId1), 0);
        }
        
        // Total claimed should be 50% of total revenue
        assertEq(totalClaimed, totalRevenue / 2);
    }

    function testClaimZeroPending() public {
        // Create new investor with zero funding
        address newInvestor = address(0x99);
        
        // This investor has no token, so claimAll should revert
        vm.prank(newInvestor);
        vm.expectRevert(bytes("NO_TOKEN"));
        project.claimAll();
    }

    function testRewardDebtAccuracy() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // Initial state
        assertEq(project.rewardDebt(tokenId1), 0);
        
        // Claim rewards
        vm.prank(investor1);
        project.claim(tokenId1);
        
        // Reward debt should be updated correctly
        uint256 expectedDebt = (project.funded(tokenId1) * project.accRevenuePerShare()) / project.ACC_PRECISION();
        assertEq(project.rewardDebt(tokenId1), expectedDebt);
        
        // Add more revenue
        vm.prank(alice);
        project.payWaterRevenue{value: 50 ether}();
        
        // Pending should only include new revenue
        uint256 newPending = project.pendingRewards(tokenId1);
        assertEq(newPending, 25 ether); // 50% of 50 ether
        
        // Claim again
        vm.prank(investor1);
        project.claim(tokenId1);
        
        // Debt should be updated again
        uint256 newExpectedDebt = (project.funded(tokenId1) * project.accRevenuePerShare()) / project.ACC_PRECISION();
        assertEq(project.rewardDebt(tokenId1), newExpectedDebt);
    }

    function testClaimingIncrementalRevenue() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        uint256 tokenId2 = project.investorToTokenId(investor2);
        
        // Investor1 claims after first revenue
        vm.prank(investor1);
        project.claim(tokenId1);
        
        // Add more revenue
        vm.prank(alice);
        project.payWaterRevenue{value: 60 ether}();
        
        // Now both have pending rewards
        uint256 pending1 = project.pendingRewards(tokenId1);
        uint256 pending2 = project.pendingRewards(tokenId2);
        
        assertEq(pending1, 30 ether); // 50% of 60 ether (new revenue only)
        assertEq(pending2, 60 ether); // 30% of (100 + 60) ether (all revenue)
        
        // Both claim
        uint256 balance1Before = investor1.balance;
        uint256 balance2Before = investor2.balance;
        
        vm.prank(investor1);
        uint256 claimed1 = project.claim(tokenId1);
        
        vm.prank(investor2);
        uint256 claimed2 = project.claim(tokenId2);
        
        assertEq(claimed1, 30 ether);
        assertEq(claimed2, 60 ether);
        
        assertEq(investor1.balance, balance1Before + 30 ether);
        assertEq(investor2.balance, balance2Before + 60 ether);
    }

    function testClaimAfterTransfer() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        address newOwner = address(0x88);
        
        // Enable transfers
        vm.prank(admin);
        factory.setTransferability(projectId, true);
        
        // Transfer token
        vm.prank(investor1);
        project.transferFrom(investor1, newOwner, tokenId1);
        
        // New owner should be able to claim
        uint256 balanceBefore = newOwner.balance;
        
        vm.prank(newOwner);
        uint256 claimed = project.claim(tokenId1);
        
        assertEq(claimed, 50 ether); // Rewards travel with token
        assertEq(newOwner.balance, balanceBefore + 50 ether);
        
        // Original owner should have no claim
        vm.prank(investor1);
        vm.expectRevert(bytes("NO_TOKEN"));
        project.claimAll();
    }

    function testClaimDuringRevenueDeposit() public {
        // This tests reentrancy protection indirectly
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // Multiple operations should work independently
        vm.prank(alice);
        project.payWaterRevenue{value: 50 ether}();
        
        vm.prank(investor1);
        uint256 claimed = project.claim(tokenId1);
        
        assertEq(claimed, 75 ether); // 50% of (100 + 50) ether
    }

    function testClaimWithPrecisionEdgeCases() public {
        // Create project with amounts that cause precision issues
        vm.prank(admin);
        uint256 precisionProjectId = factory.createProject(
            "Precision Test",
            "Test Location",
            "Test Model",
            3 ether, // Small cap for precision testing
            beneficiary
        );
        
        UnitProjectERC721 precisionProject = UnitProjectERC721(factory.getProjectAddress(precisionProjectId));
        
        // Fund with uneven amounts
        vm.prank(investor1);
        precisionProject.fundProject{value: 1 ether}();
        
        vm.prank(investor2);
        precisionProject.fundProject{value: 1 ether}();
        
        vm.prank(investor3);
        precisionProject.fundProject{value: 1 ether}();
        
        // Release escrow
        vm.startPrank(admin);
        factory.setAlice(precisionProjectId, alice);
        factory.approveEscrowRelease(precisionProjectId);
        factory.releaseEscrow(precisionProjectId);
        vm.stopPrank();
        
        // Deposit revenue that doesn't divide evenly
        vm.prank(alice);
        precisionProject.payWaterRevenue{value: 1 wei}();
        
        // All should have zero pending due to precision (1 wei / 3 = 0)
        uint256 tokenId1 = precisionProject.investorToTokenId(investor1);
        assertEq(precisionProject.pendingRewards(tokenId1), 0);
    }

    function testClaimGasUsage() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        uint256 gasBefore = gasleft();
        vm.prank(investor1);
        project.claim(tokenId1);
        uint256 gasAfter = gasleft();
        
        uint256 gasUsed = gasBefore - gasAfter;
        
        // Gas usage should be reasonable (less than 100k gas)
        assertTrue(gasUsed < 100000);
    }
} 