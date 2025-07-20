// === File: test/Escrow.t.sol ===
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/BlueFireFactory.sol";
import "../contracts/UnitProjectERC721.sol";
import "../contracts/interfaces/IUnitProjectERC721.sol";

contract EscrowTest is Test {
    BlueFireFactory public factory;
    UnitProjectERC721 public projectImplementation;
    UnitProjectERC721 public project;
    
    address public admin = address(0x1);
    address public investor1 = address(0x2);
    address public investor2 = address(0x3);
    address public beneficiary = address(0x4);
    address public alice = address(0x5);
    
    uint256 public projectId;
    uint256 public constant FUNDING_CAP = 1000 ether;

    event EscrowReleaseApproved(uint256 indexed projectId);
    event EscrowReleased(uint256 indexed projectId, address indexed beneficiary, uint256 amount);

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
        
        // Fund the project to completion
        vm.prank(investor1);
        project.fundProject{value: 600 ether}();
        
        vm.prank(investor2);
        project.fundProject{value: 400 ether}();
        
        // Verify project is funded
        assertEq(project.totalFunded(), FUNDING_CAP);
        assertTrue(project.state() == IUnitProjectERC721.ProjectState.FUNDED);
        assertEq(project.escrowPrincipalRemaining(), FUNDING_CAP);
    }

    function testApproveEscrowRelease() public {
        assertFalse(project.escrowReleaseApproved());
        
        vm.prank(admin);
        vm.expectEmit(true, false, false, false);
        emit EscrowReleaseApproved(projectId);
        
        factory.approveEscrowRelease(projectId);
        
        assertTrue(project.escrowReleaseApproved());
        assertTrue(factory.escrowReleaseApproved(projectId));
    }

    function testApproveEscrowReleaseFailsNotFunded() public {
        // Create new project that's not funded
        vm.prank(admin);
        uint256 newProjectId = factory.createProject(
            "Unfunded Project",
            "Test Location",
            "Test Model",
            1000 ether,
            beneficiary
        );
        
        vm.prank(admin);
        vm.expectRevert(bytes("NOT_FUNDED"));
        factory.approveEscrowRelease(newProjectId);
    }

    function testApproveEscrowReleaseFailsNotAdmin() public {
        vm.prank(investor1);
        vm.expectRevert(bytes("NOT_ADMIN"));
        factory.approveEscrowRelease(projectId);
    }

    function testReleaseEscrow() public {
        // Approve release first
        vm.prank(admin);
        factory.approveEscrowRelease(projectId);
        
        uint256 beneficiaryBalanceBefore = beneficiary.balance;
        uint256 projectBalanceBefore = address(project).balance;
        
        assertEq(projectBalanceBefore, FUNDING_CAP);
        assertFalse(project.fundsReleased());
        
        vm.prank(admin);
        vm.expectEmit(true, true, false, true);
        emit EscrowReleased(projectId, beneficiary, FUNDING_CAP);
        
        factory.releaseEscrow(projectId);
        
        uint256 beneficiaryBalanceAfter = beneficiary.balance;
        uint256 projectBalanceAfter = address(project).balance;
        
        // Check balances
        assertEq(beneficiaryBalanceAfter, beneficiaryBalanceBefore + FUNDING_CAP);
        assertEq(projectBalanceAfter, 0);
        
        // Check state
        assertTrue(project.fundsReleased());
        assertEq(project.escrowPrincipalRemaining(), 0);
        assertTrue(project.state() == IUnitProjectERC721.ProjectState.OPERATIONAL);
        
        // Check factory state
        IBlueFireFactory.ProjectRecord memory projectRecord = factory.getProject(projectId);
        assertTrue(projectRecord.state == IBlueFireFactory.ProjectState.OPERATIONAL);
    }

    function testReleaseEscrowFailsNotApproved() public {
        vm.prank(admin);
        vm.expectRevert(bytes("NOT_APPROVED"));
        factory.releaseEscrow(projectId);
    }

    function testReleaseEscrowFailsNotAdmin() public {
        vm.prank(admin);
        factory.approveEscrowRelease(projectId);
        
        vm.prank(investor1);
        vm.expectRevert(bytes("NOT_ADMIN"));
        factory.releaseEscrow(projectId);
    }

    function testReleaseEscrowFailsAlreadyReleased() public {
        // Approve and release
        vm.startPrank(admin);
        factory.approveEscrowRelease(projectId);
        factory.releaseEscrow(projectId);
        
        // Try to release again
        vm.expectRevert(bytes("ALREADY_RELEASED"));
        project.releaseEscrow();
        
        vm.stopPrank();
    }

    function testReleaseEscrowFailsWrongState() public {
        // Change state to something other than FUNDED
        vm.prank(admin);
        factory.setProjectState(projectId, IBlueFireFactory.ProjectState.SEEKING_FUNDING);
        
        vm.prank(admin);
        vm.expectRevert(bytes("NOT_FUNDED"));
        factory.approveEscrowRelease(projectId);
    }

    function testSetEscrowBeneficiary() public {
        address newBeneficiary = address(0x99);
        
        vm.prank(admin);
        factory.setEscrowBeneficiary(projectId, newBeneficiary);
        
        assertEq(project.escrowBeneficiary(), newBeneficiary);
        
        IBlueFireFactory.ProjectRecord memory projectRecord = factory.getProject(projectId);
        assertEq(projectRecord.escrowBeneficiary, newBeneficiary);
    }

    function testSetEscrowBeneficiaryFailsAfterApproval() public {
        // Approve release first
        vm.prank(admin);
        factory.approveEscrowRelease(projectId);
        
        address newBeneficiary = address(0x99);
        
        vm.prank(admin);
        vm.expectRevert(bytes("ALREADY_APPROVED"));
        factory.setEscrowBeneficiary(projectId, newBeneficiary);
    }

    function testSetEscrowBeneficiaryFailsZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(bytes("ZERO_ADDR"));
        factory.setEscrowBeneficiary(projectId, address(0));
    }

    function testSetEscrowBeneficiaryFailsNotAdmin() public {
        vm.prank(investor1);
        vm.expectRevert(bytes("NOT_ADMIN"));
        factory.setEscrowBeneficiary(projectId, address(0x99));
    }

    function testEscrowReleaseWithDifferentBeneficiary() public {
        address newBeneficiary = address(0x99);
        
        // Change beneficiary before approval
        vm.prank(admin);
        factory.setEscrowBeneficiary(projectId, newBeneficiary);
        
        // Approve and release
        vm.startPrank(admin);
        factory.approveEscrowRelease(projectId);
        
        uint256 newBeneficiaryBalanceBefore = newBeneficiary.balance;
        
        factory.releaseEscrow(projectId);
        
        uint256 newBeneficiaryBalanceAfter = newBeneficiary.balance;
        
        assertEq(newBeneficiaryBalanceAfter, newBeneficiaryBalanceBefore + FUNDING_CAP);
        
        vm.stopPrank();
    }

    function testRevenueDepositFailsBeforeEscrowRelease() public {
        vm.prank(alice);
        vm.expectRevert(bytes("BAD_STATE"));
        project.payWaterRevenue{value: 1 ether}();
    }

    function testRevenueDepositWorksAfterEscrowRelease() public {
        // Complete escrow release process
        vm.startPrank(admin);
        factory.approveEscrowRelease(projectId);
        factory.releaseEscrow(projectId);
        vm.stopPrank();
        
        // Now Alice can deposit revenue
        vm.deal(alice, 10 ether);
        vm.prank(alice);
        project.payWaterRevenue{value: 1 ether}();
        
        assertEq(address(project).balance, 1 ether);
    }

    function testCompleteEscrowFlow() public {
        uint256 originalBeneficiaryBalance = beneficiary.balance;
        uint256 originalProjectBalance = address(project).balance;
        
        // Step 1: Approve escrow release
        vm.prank(admin);
        factory.approveEscrowRelease(projectId);
        assertTrue(project.escrowReleaseApproved());
        
        // Step 2: Release escrow
        vm.prank(admin);
        factory.releaseEscrow(projectId);
        
        // Verify all changes
        assertEq(beneficiary.balance, originalBeneficiaryBalance + FUNDING_CAP);
        assertEq(address(project).balance, 0);
        assertTrue(project.fundsReleased());
        assertEq(project.escrowPrincipalRemaining(), 0);
        assertTrue(project.state() == IUnitProjectERC721.ProjectState.OPERATIONAL);
        
        // Step 3: Verify Alice can now operate
        vm.deal(alice, 10 ether);
        vm.prank(alice);
        project.payWaterRevenue{value: 2 ether}();
        
        assertEq(address(project).balance, 2 ether);
    }

    function testMultipleProjects() public {
        address beneficiary2 = address(0x88);
        
        // Create second project
        vm.prank(admin);
        uint256 projectId2 = factory.createProject(
            "Second Plant",
            "Abuja, Nigeria",
            "AquaGen-4000",
            500 ether,
            beneficiary2
        );
        
        UnitProjectERC721 project2 = UnitProjectERC721(factory.getProjectAddress(projectId2));
        
        // Fund second project
        vm.deal(investor1, 500 ether);
        vm.prank(investor1);
        project2.fundProject{value: 500 ether}();
        
        // Release first project
        vm.startPrank(admin);
        factory.approveEscrowRelease(projectId);
        factory.releaseEscrow(projectId);
        
        // Release second project  
        factory.approveEscrowRelease(projectId2);
        factory.releaseEscrow(projectId2);
        vm.stopPrank();
        
        // Verify both releases worked independently
        assertEq(beneficiary.balance, FUNDING_CAP);
        assertEq(beneficiary2.balance, 500 ether);
        assertTrue(project.state() == IUnitProjectERC721.ProjectState.OPERATIONAL);
        assertTrue(project2.state() == IUnitProjectERC721.ProjectState.OPERATIONAL);
    }
} 