// === File: test/Factory.t.sol ===
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/BlueFireFactory.sol";
import "../contracts/UnitProjectERC721.sol";
import "../contracts/interfaces/IBlueFireFactory.sol";

contract FactoryTest is Test {
    BlueFireFactory public factory;
    UnitProjectERC721 public projectImplementation;
    
    address public admin = address(0x1);
    address public alice = address(0x2);
    address public beneficiary = address(0x3);

    event ProjectCreated(uint256 indexed projectId, address indexed projectAddress, string name, uint256 fundingCap);
    event ProjectMetaUpdated(uint256 indexed projectId, string name, string location, string model, uint256 cap);
    event AliceChanged(uint256 indexed projectId, address indexed oldAlice, address indexed newAlice);

    function setUp() public {
        vm.startPrank(admin);
        
        // Deploy implementation
        projectImplementation = new UnitProjectERC721();
        
        // Deploy factory
        factory = new BlueFireFactory(address(projectImplementation));
        
        vm.stopPrank();
    }

    function testCreateProject() public {
        vm.prank(admin);
        
        uint256 expectedProjectId = 1;
        
        vm.expectEmit(true, false, false, true);
        emit ProjectCreated(expectedProjectId, address(0), "Test Project", 1000 ether);
        
        uint256 projectId = factory.createProject(
            "Test Project",
            "Lagos, Nigeria",
            "AquaGen-3000",
            1000 ether,
            beneficiary
        );
        
        assertEq(projectId, expectedProjectId);
        assertEq(factory.nextProjectId(), 2);
        
        IBlueFireFactory.ProjectRecord memory project = factory.getProject(projectId);
        assertEq(project.name, "Test Project");
        assertEq(project.location, "Lagos, Nigeria");
        assertEq(project.model, "AquaGen-3000");
        assertEq(project.fundingCap, 1000 ether);
        assertEq(project.escrowBeneficiary, beneficiary);
        assertTrue(project.state == IBlueFireFactory.ProjectState.SEEKING_FUNDING);
        assertFalse(project.transfersAllowed);
        assertFalse(project.escrowReleaseApproved);
        assertEq(project.aliceOperator, address(0));
        assertTrue(project.projectAddress != address(0));
    }

    function testCreateProjectWithZeroBeneficiary() public {
        vm.prank(admin);
        
        uint256 projectId = factory.createProject(
            "Test Project",
            "Lagos, Nigeria",
            "AquaGen-3000",
            1000 ether,
            address(0) // Should default to admin
        );
        
        IBlueFireFactory.ProjectRecord memory project = factory.getProject(projectId);
        assertEq(project.escrowBeneficiary, admin);
    }

    function testCreateProjectFailsWithZeroCap() public {
        vm.prank(admin);
        
        vm.expectRevert(bytes("ZERO_CAP"));
        factory.createProject(
            "Test Project",
            "Lagos, Nigeria",
            "AquaGen-3000",
            0,
            beneficiary
        );
    }

    function testCreateProjectFailsWithEmptyName() public {
        vm.prank(admin);
        
        vm.expectRevert(bytes("EMPTY_NAME"));
        factory.createProject(
            "",
            "Lagos, Nigeria",
            "AquaGen-3000",
            1000 ether,
            beneficiary
        );
    }

    function testCreateProjectFailsNotAdmin() public {
        vm.prank(alice);
        
        vm.expectRevert(bytes("NOT_ADMIN"));
        factory.createProject(
            "Test Project",
            "Lagos, Nigeria",
            "AquaGen-3000",
            1000 ether,
            beneficiary
        );
    }

    function testSetAlice() public {
        vm.startPrank(admin);
        
        uint256 projectId = factory.createProject(
            "Test Project",
            "Lagos, Nigeria", 
            "AquaGen-3000",
            1000 ether,
            beneficiary
        );
        
        vm.expectEmit(true, true, true, false);
        emit AliceChanged(projectId, address(0), alice);
        
        factory.setAlice(projectId, alice);
        
        IBlueFireFactory.ProjectRecord memory project = factory.getProject(projectId);
        assertEq(project.aliceOperator, alice);
        
        vm.stopPrank();
    }

    function testSetAliceFailsNotAdmin() public {
        vm.prank(admin);
        uint256 projectId = factory.createProject(
            "Test Project",
            "Lagos, Nigeria",
            "AquaGen-3000", 
            1000 ether,
            beneficiary
        );
        
        vm.prank(alice);
        vm.expectRevert(bytes("NOT_ADMIN"));
        factory.setAlice(projectId, alice);
    }

    function testUpdateProjectMeta() public {
        vm.startPrank(admin);
        
        uint256 projectId = factory.createProject(
            "Test Project",
            "Lagos, Nigeria",
            "AquaGen-3000",
            1000 ether,
            beneficiary
        );
        
        vm.expectEmit(true, false, false, true);
        emit ProjectMetaUpdated(projectId, "Updated Project", "Updated Location", "Updated Model", 1000 ether);
        
        factory.updateProjectMeta(
            projectId,
            "Updated Project",
            "Updated Location", 
            "Updated Model"
        );
        
        IBlueFireFactory.ProjectRecord memory project = factory.getProject(projectId);
        assertEq(project.name, "Updated Project");
        assertEq(project.location, "Updated Location");
        assertEq(project.model, "Updated Model");
        
        vm.stopPrank();
    }

    function testUpdateProjectMetaFailsWhenFunded() public {
        vm.startPrank(admin);
        
        uint256 projectId = factory.createProject(
            "Test Project",
            "Lagos, Nigeria",
            "AquaGen-3000",
            1000 ether,
            beneficiary
        );
        
        // Change state to FUNDED
        factory.setProjectState(projectId, IBlueFireFactory.ProjectState.FUNDED);
        
        vm.expectRevert(bytes("NOT_SEEKING"));
        factory.updateProjectMeta(
            projectId,
            "Updated Project",
            "Updated Location",
            "Updated Model"
        );
        
        vm.stopPrank();
    }

    function testSetProjectState() public {
        vm.startPrank(admin);
        
        uint256 projectId = factory.createProject(
            "Test Project",
            "Lagos, Nigeria",
            "AquaGen-3000",
            1000 ether,
            beneficiary
        );
        
        factory.setProjectState(projectId, IBlueFireFactory.ProjectState.FUNDED);
        
        IBlueFireFactory.ProjectRecord memory project = factory.getProject(projectId);
        assertTrue(project.state == IBlueFireFactory.ProjectState.FUNDED);
        
        vm.stopPrank();
    }

    function testSetTransferability() public {
        vm.startPrank(admin);
        
        uint256 projectId = factory.createProject(
            "Test Project",
            "Lagos, Nigeria",
            "AquaGen-3000",
            1000 ether,
            beneficiary
        );
        
        assertFalse(factory.transfersAllowed(projectId));
        
        factory.setTransferability(projectId, true);
        assertTrue(factory.transfersAllowed(projectId));
        
        factory.setTransferability(projectId, false);
        assertFalse(factory.transfersAllowed(projectId));
        
        vm.stopPrank();
    }

    function testApproveEscrowRelease() public {
        vm.startPrank(admin);
        
        uint256 projectId = factory.createProject(
            "Test Project",
            "Lagos, Nigeria",
            "AquaGen-3000",
            1000 ether,
            beneficiary
        );
        
        // Must be in FUNDED state
        factory.setProjectState(projectId, IBlueFireFactory.ProjectState.FUNDED);
        
        factory.approveEscrowRelease(projectId);
        
        assertTrue(factory.escrowReleaseApproved(projectId));
        
        vm.stopPrank();
    }

    function testApproveEscrowReleaseFailsNotFunded() public {
        vm.startPrank(admin);
        
        uint256 projectId = factory.createProject(
            "Test Project",
            "Lagos, Nigeria",
            "AquaGen-3000",
            1000 ether,
            beneficiary
        );
        
        vm.expectRevert(bytes("NOT_FUNDED"));
        factory.approveEscrowRelease(projectId);
        
        vm.stopPrank();
    }

    function testGlobalPause() public {
        vm.startPrank(admin);
        
        assertFalse(factory.isGloballyPaused(IBlueFireFactory.PauseType.FUNDING));
        
        factory.setGlobalPause(IBlueFireFactory.PauseType.FUNDING, true);
        assertTrue(factory.isGloballyPaused(IBlueFireFactory.PauseType.FUNDING));
        
        factory.setGlobalPause(IBlueFireFactory.PauseType.FUNDING, false);
        assertFalse(factory.isGloballyPaused(IBlueFireFactory.PauseType.FUNDING));
        
        vm.stopPrank();
    }

    function testViewFunctions() public {
        vm.prank(admin);
        
        uint256 projectId = factory.createProject(
            "Test Project",
            "Lagos, Nigeria",
            "AquaGen-3000",
            1000 ether,
            beneficiary
        );
        
        assertEq(factory.admin(), admin);
        assertEq(factory.projectImplementation(), address(projectImplementation));
        assertEq(factory.nextProjectId(), 2);
        
        address projectAddress = factory.getProjectAddress(projectId);
        assertTrue(projectAddress != address(0));
        
        IBlueFireFactory.ProjectRecord memory project = factory.getProject(projectId);
        assertEq(project.projectAddress, projectAddress);
    }
} 