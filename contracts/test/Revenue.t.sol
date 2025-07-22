// === File: test/Revenue.t.sol ===
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/BlueFireFactory.sol";
import "../contracts/UnitProjectERC721.sol";
import "../contracts/interfaces/IUnitProjectERC721.sol";

contract RevenueTest is Test {
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
    uint256 public constant PRECISION = 1e18;

    event RevenueDeposited(uint256 indexed projectId, address indexed alice, uint256 amount, uint256 accRevenuePerShare);

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
        
        // Verify operational state
        assertTrue(project.state() == IUnitProjectERC721.ProjectState.OPERATIONAL);
    }

    function testFirstRevenueDeposit() public {
        uint256 revenueAmount = 100 ether;
        uint256 expectedAccRevenue = (revenueAmount * PRECISION) / FUNDING_CAP;
        
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit RevenueDeposited(projectId, alice, revenueAmount, expectedAccRevenue);
        
        project.payWaterRevenue{value: revenueAmount}();
        
        assertEq(project.accRevenuePerShare(), expectedAccRevenue);
        assertEq(address(project).balance, revenueAmount);
    }

    function testRevenueDepositFailsNotAlice() public {
        vm.prank(investor1);
        vm.expectRevert(bytes("NOT_ALICE"));
        project.payWaterRevenue{value: 1 ether}();
    }

    function testRevenueDepositFailsWrongState() public {
        // Change to wrong state
        vm.prank(admin);
        factory.setProjectState(projectId, IBlueFireFactory.ProjectState.FUNDED);
        
        vm.prank(alice);
        vm.expectRevert(bytes("BAD_STATE"));
        project.payWaterRevenue{value: 1 ether}();
    }

    function testRevenueDepositFailsZeroAmount() public {
        vm.prank(alice);
        vm.expectRevert(bytes("ZERO_REVENUE"));
        project.payWaterRevenue{value: 0}();
    }

    function testRevenueDepositWithGlobalPause() public {
        vm.prank(admin);
        factory.setGlobalPause(IBlueFireFactory.PauseType.REVENUE, true);
        
        vm.prank(alice);
        vm.expectRevert(bytes("GLOBALLY_PAUSED"));
        project.payWaterRevenue{value: 1 ether}();
    }

    function testPendingRewardsCalculation() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        uint256 tokenId2 = project.investorToTokenId(investor2);
        uint256 tokenId3 = project.investorToTokenId(investor3);
        
        // Initially no pending rewards
        assertEq(project.pendingRewards(tokenId1), 0);
        assertEq(project.pendingRewards(tokenId2), 0);
        assertEq(project.pendingRewards(tokenId3), 0);
        
        // Deposit revenue
        vm.prank(alice);
        project.payWaterRevenue{value: 100 ether}();
        
        // Check pending rewards (should be proportional to investment)
        uint256 pending1 = project.pendingRewards(tokenId1);
        uint256 pending2 = project.pendingRewards(tokenId2);
        uint256 pending3 = project.pendingRewards(tokenId3);
        
        assertEq(pending1, 50 ether); // 50% of 100 ether
        assertEq(pending2, 30 ether); // 30% of 100 ether  
        assertEq(pending3, 20 ether); // 20% of 100 ether
        
        // Total should equal revenue deposited
        assertEq(pending1 + pending2 + pending3, 100 ether);
    }

    function testMultipleRevenueDeposits() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // First deposit
        vm.prank(alice);
        project.payWaterRevenue{value: 50 ether}();
        
        uint256 pending1After1st = project.pendingRewards(tokenId1);
        assertEq(pending1After1st, 25 ether); // 50% of 50 ether
        
        // Second deposit
        vm.prank(alice);
        project.payWaterRevenue{value: 100 ether}();
        
        uint256 pending1After2nd = project.pendingRewards(tokenId1);
        assertEq(pending1After2nd, 75 ether); // 50% of 150 ether total
        
        // Third deposit
        vm.prank(alice);
        project.payWaterRevenue{value: 50 ether}();
        
        uint256 pending1After3rd = project.pendingRewards(tokenId1);
        assertEq(pending1After3rd, 100 ether); // 50% of 200 ether total
    }

    function testAccumulatorPrecision() public {
        // Test with amounts that might cause precision issues
        vm.prank(alice);
        project.payWaterRevenue{value: 1 wei}();
        
        uint256 tokenId1 = project.investorToTokenId(investor1);
        uint256 pending = project.pendingRewards(tokenId1);
        
        // With 1 wei revenue and 500 ether funding (50% share)
        // Expected: 1 wei * 50% = 0.5 wei, rounds down to 0
        assertEq(pending, 0);
        
        // Test with slightly larger amount
        vm.prank(alice);
        project.payWaterRevenue{value: 1000}();
        
        uint256 pendingAfter = project.pendingRewards(tokenId1);
        assertEq(pendingAfter, 500); // 50% of 1000 wei
    }

    function testRevenueDistributionWithDifferentShares() public {
        // Create new project with specific funding amounts
        vm.prank(admin);
        uint256 newProjectId = factory.createProject(
            "Test Shares",
            "Test Location",
            "Test Model",
            1200 ether,
            beneficiary
        );
        
        UnitProjectERC721 newProject = UnitProjectERC721(factory.getProjectAddress(newProjectId));
        
        // Fund with specific amounts for easy math
        vm.prank(investor1);
        newProject.fundProject{value: 600 ether}(); // 50%
        
        vm.prank(investor2);
        newProject.fundProject{value: 400 ether}(); // 33.33%
        
        vm.prank(investor3);
        newProject.fundProject{value: 200 ether}(); // 16.67%
        
        // Release escrow
        vm.startPrank(admin);
        factory.setAlice(newProjectId, alice);
        factory.approveEscrowRelease(newProjectId);
        factory.releaseEscrow(newProjectId);
        vm.stopPrank();
        
        // Deposit revenue
        vm.prank(alice);
        newProject.payWaterRevenue{value: 120 ether}();
        
        uint256 tokenId1 = newProject.investorToTokenId(investor1);
        uint256 tokenId2 = newProject.investorToTokenId(investor2);
        uint256 tokenId3 = newProject.investorToTokenId(investor3);
        
        // Check proportional distribution
        assertEq(newProject.pendingRewards(tokenId1), 60 ether);  // 50% of 120
        assertEq(newProject.pendingRewards(tokenId2), 40 ether);  // 33.33% of 120
        assertEq(newProject.pendingRewards(tokenId3), 20 ether);  // 16.67% of 120
    }

    function testRevenueWithNoFunding() public {
        // Create project with no funding
        vm.prank(admin);
        uint256 emptyProjectId = factory.createProject(
            "Empty Project",
            "Test Location",
            "Test Model",
            1000 ether,
            beneficiary
        );
        
        UnitProjectERC721 emptyProject = UnitProjectERC721(factory.getProjectAddress(emptyProjectId));
        
        vm.startPrank(admin);
        factory.setAlice(emptyProjectId, alice);
        factory.setProjectState(emptyProjectId, IBlueFireFactory.ProjectState.OPERATIONAL);
        vm.stopPrank();
        
        vm.prank(alice);
        vm.expectRevert(bytes("NO_FUNDED"));
        emptyProject.payWaterRevenue{value: 1 ether}();
    }

    function testLargeRevenueDeposit() public {
        uint256 largeRevenue = 10000 ether;
        
        vm.deal(alice, largeRevenue);
        vm.prank(alice);
        project.payWaterRevenue{value: largeRevenue}();
        
        uint256 tokenId1 = project.investorToTokenId(investor1);
        uint256 tokenId2 = project.investorToTokenId(investor2);
        uint256 tokenId3 = project.investorToTokenId(investor3);
        
        // Check proportional distribution
        assertEq(project.pendingRewards(tokenId1), 5000 ether); // 50%
        assertEq(project.pendingRewards(tokenId2), 3000 ether); // 30%
        assertEq(project.pendingRewards(tokenId3), 2000 ether); // 20%
        
        // Total should equal revenue
        uint256 totalPending = project.pendingRewards(tokenId1) + 
                              project.pendingRewards(tokenId2) + 
                              project.pendingRewards(tokenId3);
        assertEq(totalPending, largeRevenue);
    }

    function testAccumulatorOverflow() public {
        // Test with very large revenue to check for overflow
        uint256 maxRevenue = type(uint256).max / PRECISION / 2;
        
        vm.deal(alice, maxRevenue);
        vm.prank(alice);
        project.payWaterRevenue{value: maxRevenue}();
        
        // Should not revert and should calculate correctly
        uint256 tokenId1 = project.investorToTokenId(investor1);
        uint256 pending = project.pendingRewards(tokenId1);
        
        assertTrue(pending > 0);
        assertEq(pending, maxRevenue / 2); // 50% share
    }

    function testFuzzRevenueDistribution(uint256 revenue) public {
        vm.assume(revenue > 0 && revenue <= 1000000 ether);
        
        vm.deal(alice, revenue);
        vm.prank(alice);
        project.payWaterRevenue{value: revenue}();
        
        uint256 tokenId1 = project.investorToTokenId(investor1);
        uint256 tokenId2 = project.investorToTokenId(investor2);
        uint256 tokenId3 = project.investorToTokenId(investor3);
        
        uint256 pending1 = project.pendingRewards(tokenId1);
        uint256 pending2 = project.pendingRewards(tokenId2);
        uint256 pending3 = project.pendingRewards(tokenId3);
        
        // Check proportions are approximately correct (allowing for rounding)
        uint256 total = pending1 + pending2 + pending3;
        assertTrue(total <= revenue && total >= revenue - 3); // Max 3 wei rounding error
        
        // Check individual proportions
        uint256 expected1 = (revenue * 500 ether) / FUNDING_CAP;
        uint256 expected2 = (revenue * 300 ether) / FUNDING_CAP;
        uint256 expected3 = (revenue * 200 ether) / FUNDING_CAP;
        
        assertTrue(pending1 <= expected1 && pending1 >= expected1 - 1);
        assertTrue(pending2 <= expected2 && pending2 >= expected2 - 1);
        assertTrue(pending3 <= expected3 && pending3 >= expected3 - 1);
    }

    function testRevenueAfterAdditionalFunding() public {
        // Test that revenue is distributed correctly if more funding happens
        // (though this shouldn't be possible in current implementation)
        
        // First revenue deposit
        vm.prank(alice);
        project.payWaterRevenue{value: 100 ether}();
        
        uint256 tokenId1 = project.investorToTokenId(investor1);
        uint256 pending1 = project.pendingRewards(tokenId1);
        assertEq(pending1, 50 ether); // 50% of 100 ether
        
        // Second revenue deposit
        vm.prank(alice);
        project.payWaterRevenue{value: 50 ether}();
        
        uint256 pending1After = project.pendingRewards(tokenId1);
        assertEq(pending1After, 75 ether); // 50% of 150 ether total
    }
} 