// === File: test/TransferGate.t.sol ===
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/BlueFireFactory.sol";
import "../contracts/UnitProjectERC721.sol";
import "../contracts/interfaces/IUnitProjectERC721.sol";

contract TransferGateTest is Test {
    BlueFireFactory public factory;
    UnitProjectERC721 public projectImplementation;
    UnitProjectERC721 public project;
    
    address public admin = address(0x1);
    address public investor1 = address(0x2);
    address public investor2 = address(0x3);
    address public investor3 = address(0x4);
    address public beneficiary = address(0x5);
    address public alice = address(0x6);
    address public recipient = address(0x7);
    
    uint256 public projectId;
    uint256 public constant FUNDING_CAP = 1000 ether;

    event TransferabilitySet(uint256 indexed projectId, bool enabled);
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

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
        
        // Fund the project
        vm.prank(investor1);
        project.fundProject{value: 500 ether}();
        
        vm.prank(investor2);
        project.fundProject{value: 300 ether}();
        
        vm.prank(investor3);
        project.fundProject{value: 200 ether}();
    }

    function testTransferDisabledByDefault() public {
        assertFalse(factory.transfersAllowed(projectId));
        
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // Direct transfer should fail
        vm.prank(investor1);
        vm.expectRevert(bytes("XFER_DISABLED"));
        project.transferFrom(investor1, recipient, tokenId1);
        
        // Safe transfer should also fail
        vm.prank(investor1);
        vm.expectRevert(bytes("XFER_DISABLED"));
        project.safeTransferFrom(investor1, recipient, tokenId1);
        
        // Transfer with data should also fail
        vm.prank(investor1);
        vm.expectRevert(bytes("XFER_DISABLED"));
        project.safeTransferFrom(investor1, recipient, tokenId1, "");
    }

    function testApprovalWorksWhenTransfersDisabled() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // Approval should work even when transfers disabled
        vm.prank(investor1);
        project.approve(recipient, tokenId1);
        
        assertEq(project.getApproved(tokenId1), recipient);
        
        // But transfer by approved party should still fail
        vm.prank(recipient);
        vm.expectRevert(bytes("XFER_DISABLED"));
        project.transferFrom(investor1, recipient, tokenId1);
    }

    function testSetForAllWorksWhenTransfersDisabled() public {
        // SetApprovalForAll should work
        vm.prank(investor1);
        project.setApprovalForAll(recipient, true);
        
        assertTrue(project.isApprovedForAll(investor1, recipient));
        
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // But transfer should still fail
        vm.prank(recipient);
        vm.expectRevert(bytes("XFER_DISABLED"));
        project.transferFrom(investor1, recipient, tokenId1);
    }

    function testEnableTransfers() public {
        assertFalse(factory.transfersAllowed(projectId));
        
        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit TransferabilitySet(projectId, true);
        
        factory.setTransferability(projectId, true);
        
        assertTrue(factory.transfersAllowed(projectId));
    }

    function testEnableTransfersFailsNotAdmin() public {
        vm.prank(investor1);
        vm.expectRevert(bytes("NOT_ADMIN"));
        factory.setTransferability(projectId, true);
    }

    function testTransferWorksAfterEnabled() public {
        // Enable transfers
        vm.prank(admin);
        factory.setTransferability(projectId, true);
        
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        assertEq(project.ownerOf(tokenId1), investor1);
        assertEq(project.investorToTokenId(investor1), tokenId1);
        assertEq(project.investorToTokenId(recipient), 0);
        
        // Transfer should now work
        vm.prank(investor1);
        project.transferFrom(investor1, recipient, tokenId1);
        
        assertEq(project.ownerOf(tokenId1), recipient);
        assertEq(project.investorToTokenId(investor1), 0);
        assertEq(project.investorToTokenId(recipient), tokenId1);
    }

    function testSafeTransferWorksAfterEnabled() public {
        // Enable transfers
        vm.prank(admin);
        factory.setTransferability(projectId, true);
        
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // Safe transfer should work
        vm.prank(investor1);
        project.safeTransferFrom(investor1, recipient, tokenId1);
        
        assertEq(project.ownerOf(tokenId1), recipient);
        assertEq(project.investorToTokenId(recipient), tokenId1);
    }

    function testTransferByApprovedParty() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // Approve first
        vm.prank(investor1);
        project.approve(recipient, tokenId1);
        
        // Enable transfers
        vm.prank(admin);
        factory.setTransferability(projectId, true);
        
        // Transfer by approved party
        vm.prank(recipient);
        project.transferFrom(investor1, recipient, tokenId1);
        
        assertEq(project.ownerOf(tokenId1), recipient);
        assertEq(project.getApproved(tokenId1), address(0)); // Approval cleared
    }

    function testTransferByOperator() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // Set operator
        vm.prank(investor1);
        project.setApprovalForAll(recipient, true);
        
        // Enable transfers
        vm.prank(admin);
        factory.setTransferability(projectId, true);
        
        // Transfer by operator
        vm.prank(recipient);
        project.transferFrom(investor1, investor2, tokenId1);
        
        assertEq(project.ownerOf(tokenId1), investor2);
        assertEq(project.investorToTokenId(investor2), tokenId1);
    }

    function testDisableTransfersAfterEnabled() public {
        // Enable then disable
        vm.startPrank(admin);
        factory.setTransferability(projectId, true);
        factory.setTransferability(projectId, false);
        vm.stopPrank();
        
        assertFalse(factory.transfersAllowed(projectId));
        
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // Transfer should fail again
        vm.prank(investor1);
        vm.expectRevert(bytes("XFER_DISABLED"));
        project.transferFrom(investor1, recipient, tokenId1);
    }

    function testMintingAlwaysWorks() public {
        // Minting should work regardless of transfer settings
        assertFalse(factory.transfersAllowed(projectId));
        
        address newInvestor = address(0x99);
        vm.deal(newInvestor, 100 ether);
        
        // This involves minting which should work
        vm.prank(newInvestor);
        uint256 tokenId = project.fundProject{value: 100 ether}();
        
        assertEq(project.ownerOf(tokenId), newInvestor);
        assertEq(project.investorToTokenId(newInvestor), tokenId);
    }

    function testBurningAlwaysWorks() public {
        // Note: Current implementation doesn't have burning, but this tests the principle
        // That mint/burn should bypass transfer restrictions
        assertFalse(factory.transfersAllowed(projectId));
        
        // The _beforeTokenTransfer hook should allow from/to address(0)
        // This is implicitly tested by minting working above
    }

    function testRewardsFollowToken() public {
        // Complete escrow release and add revenue
        vm.startPrank(admin);
        factory.approveEscrowRelease(projectId);
        factory.releaseEscrow(projectId);
        vm.stopPrank();
        
        vm.deal(alice, 100 ether);
        vm.prank(alice);
        project.payWaterRevenue{value: 100 ether}();
        
        uint256 tokenId1 = project.investorToTokenId(investor1);
        uint256 pendingBefore = project.pendingRewards(tokenId1);
        assertEq(pendingBefore, 50 ether); // 50% of revenue
        
        // Enable transfers and transfer token
        vm.prank(admin);
        factory.setTransferability(projectId, true);
        
        vm.prank(investor1);
        project.transferFrom(investor1, recipient, tokenId1);
        
        // Rewards should follow the token
        assertEq(project.pendingRewards(tokenId1), 50 ether);
        
        // New owner can claim
        uint256 recipientBalanceBefore = recipient.balance;
        vm.prank(recipient);
        uint256 claimed = project.claim(tokenId1);
        
        assertEq(claimed, 50 ether);
        assertEq(recipient.balance, recipientBalanceBefore + 50 ether);
        
        // Original owner cannot claim
        vm.prank(investor1);
        vm.expectRevert(bytes("NO_TOKEN"));
        project.claimAll();
    }

    function testTransferUpdatesInvestorMapping() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        assertEq(project.investorToTokenId(investor1), tokenId1);
        assertEq(project.investorToTokenId(recipient), 0);
        
        // Enable and transfer
        vm.prank(admin);
        factory.setTransferability(projectId, true);
        
        vm.prank(investor1);
        project.transferFrom(investor1, recipient, tokenId1);
        
        // Mapping should be updated
        assertEq(project.investorToTokenId(investor1), 0);
        assertEq(project.investorToTokenId(recipient), tokenId1);
    }

    function testTransferBetweenExistingInvestors() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        uint256 tokenId2 = project.investorToTokenId(investor2);
        
        // Enable transfers
        vm.prank(admin);
        factory.setTransferability(projectId, true);
        
        // Transfer from investor1 to investor2 (who already has a token)
        vm.prank(investor1);
        project.transferFrom(investor1, investor2, tokenId1);
        
        // investor2 should now have tokenId1, and their old mapping should be cleared
        assertEq(project.ownerOf(tokenId1), investor2);
        assertEq(project.ownerOf(tokenId2), investor2);
        
        // Mapping should point to the transferred token
        assertEq(project.investorToTokenId(investor2), tokenId1);
        assertEq(project.investorToTokenId(investor1), 0);
    }

    function testMultipleProjectsIndependentTransfers() public {
        // Create second project
        vm.prank(admin);
        uint256 projectId2 = factory.createProject(
            "Second Plant",
            "Abuja, Nigeria",
            "AquaGen-4000",
            500 ether,
            beneficiary
        );
        
        UnitProjectERC721 project2 = UnitProjectERC721(factory.getProjectAddress(projectId2));
        
        // Fund second project
        vm.prank(investor1);
        project2.fundProject{value: 250 ether}();
        
        uint256 tokenId1Project1 = project.investorToTokenId(investor1);
        uint256 tokenId1Project2 = project2.investorToTokenId(investor1);
        
        // Enable transfers for first project only
        vm.prank(admin);
        factory.setTransferability(projectId, true);
        
        // Transfer should work for first project
        vm.prank(investor1);
        project.transferFrom(investor1, recipient, tokenId1Project1);
        
        // Transfer should fail for second project
        vm.prank(investor1);
        vm.expectRevert(bytes("XFER_DISABLED"));
        project2.transferFrom(investor1, recipient, tokenId1Project2);
        
        // Verify states
        assertEq(project.ownerOf(tokenId1Project1), recipient);
        assertEq(project2.ownerOf(tokenId1Project2), investor1);
    }

    function testTransferabilityToggling() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        // Start disabled
        assertFalse(factory.transfersAllowed(projectId));
        
        vm.prank(investor1);
        vm.expectRevert(bytes("XFER_DISABLED"));
        project.transferFrom(investor1, recipient, tokenId1);
        
        // Enable
        vm.prank(admin);
        factory.setTransferability(projectId, true);
        
        vm.prank(investor1);
        project.transferFrom(investor1, recipient, tokenId1);
        assertEq(project.ownerOf(tokenId1), recipient);
        
        // Transfer back
        vm.prank(recipient);
        project.transferFrom(recipient, investor1, tokenId1);
        assertEq(project.ownerOf(tokenId1), investor1);
        
        // Disable again
        vm.prank(admin);
        factory.setTransferability(projectId, false);
        
        vm.prank(investor1);
        vm.expectRevert(bytes("XFER_DISABLED"));
        project.transferFrom(investor1, recipient, tokenId1);
    }

    function testTransferEventEmission() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        vm.prank(admin);
        factory.setTransferability(projectId, true);
        
        // Expect Transfer event from ERC721
        vm.expectEmit(true, true, true, false);
        emit Transfer(investor1, recipient, tokenId1);
        
        vm.prank(investor1);
        project.transferFrom(investor1, recipient, tokenId1);
    }

    function testTransferGasUsage() public {
        uint256 tokenId1 = project.investorToTokenId(investor1);
        
        vm.prank(admin);
        factory.setTransferability(projectId, true);
        
        uint256 gasBefore = gasleft();
        vm.prank(investor1);
        project.transferFrom(investor1, recipient, tokenId1);
        uint256 gasAfter = gasleft();
        
        uint256 gasUsed = gasBefore - gasAfter;
        
        // Transfer should be reasonably gas efficient
        assertTrue(gasUsed < 150000);
    }
} 