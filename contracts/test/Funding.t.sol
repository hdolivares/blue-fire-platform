// === File: test/Funding.t.sol ===
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/BlueFireFactory.sol";
import "../contracts/UnitProjectERC721.sol";
import "../contracts/interfaces/IUnitProjectERC721.sol";

contract FundingTest is Test {
    BlueFireFactory public factory;
    UnitProjectERC721 public projectImplementation;
    UnitProjectERC721 public project;
    
    address public admin = address(0x1);
    address public investor1 = address(0x2);
    address public investor2 = address(0x3);
    address public investor3 = address(0x4);
    address public beneficiary = address(0x5);
    
    uint256 public projectId;
    uint256 public constant FUNDING_CAP = 1000 ether;

    event FundingReceived(uint256 indexed projectId, address indexed investor, uint256 indexed tokenId, uint256 amount, uint256 totalFunded);
    event FundingFinalized(uint256 indexed projectId, uint256 totalFunded);

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
        
        vm.stopPrank();
        
        // Give test accounts some ETH
        vm.deal(investor1, 1000 ether);
        vm.deal(investor2, 1000 ether); 
        vm.deal(investor3, 1000 ether);
    }

    function testFirstFunding() public {
        uint256 fundAmount = 100 ether;
        
        vm.prank(investor1);
        
        vm.expectEmit(true, true, true, true);
        emit FundingReceived(projectId, investor1, 1, fundAmount, fundAmount);
        
        uint256 tokenId = project.fundProject{value: fundAmount}();
        
        assertEq(tokenId, 1);
        assertEq(project.totalFunded(), fundAmount);
        assertEq(project.funded(tokenId), fundAmount);
        assertEq(project.ownerOf(tokenId), investor1);
        assertEq(project.investorToTokenId(investor1), tokenId);
        assertEq(project.balanceOf(investor1), 1);
        assertTrue(project.state() == IUnitProjectERC721.ProjectState.SEEKING_FUNDING);
    }

    function testMultipleFundingsFromSameInvestor() public {
        vm.startPrank(investor1);
        
        // First funding
        uint256 tokenId1 = project.fundProject{value: 100 ether}();
        assertEq(tokenId1, 1);
        assertEq(project.funded(tokenId1), 100 ether);
        
        // Second funding - should add to same token
        uint256 tokenId2 = project.fundProject{value: 50 ether}();
        assertEq(tokenId2, tokenId1); // Same token
        assertEq(project.funded(tokenId1), 150 ether); // Cumulative
        assertEq(project.totalFunded(), 150 ether);
        assertEq(project.balanceOf(investor1), 1); // Still only one token
        
        vm.stopPrank();
    }

    function testMultipleInvestors() public {
        // Investor 1
        vm.prank(investor1);
        uint256 tokenId1 = project.fundProject{value: 200 ether}();
        
        // Investor 2
        vm.prank(investor2);
        uint256 tokenId2 = project.fundProject{value: 300 ether}();
        
        // Investor 3
        vm.prank(investor3);
        uint256 tokenId3 = project.fundProject{value: 100 ether}();
        
        assertEq(tokenId1, 1);
        assertEq(tokenId2, 2);
        assertEq(tokenId3, 3);
        
        assertEq(project.funded(tokenId1), 200 ether);
        assertEq(project.funded(tokenId2), 300 ether);
        assertEq(project.funded(tokenId3), 100 ether);
        
        assertEq(project.totalFunded(), 600 ether);
        
        assertEq(project.ownerOf(tokenId1), investor1);
        assertEq(project.ownerOf(tokenId2), investor2);
        assertEq(project.ownerOf(tokenId3), investor3);
    }

    function testFundingCapReached() public {
        // Fund exactly to cap
        vm.prank(investor1);
        project.fundProject{value: 600 ether}();
        
        vm.prank(investor2);
        
        vm.expectEmit(true, false, false, true);
        emit FundingFinalized(projectId, FUNDING_CAP);
        
        project.fundProject{value: 400 ether}();
        
        assertEq(project.totalFunded(), FUNDING_CAP);
        assertTrue(project.state() == IUnitProjectERC721.ProjectState.FUNDED);
        assertEq(project.escrowPrincipalRemaining(), FUNDING_CAP);
    }

    function testOverfundPrevented() public {
        // Fund close to cap
        vm.prank(investor1);
        project.fundProject{value: 900 ether}();
        
        // Try to overfund
        vm.prank(investor2);
        vm.expectRevert(bytes("CAP"));
        project.fundProject{value: 200 ether}();
        
        // Fund exactly to cap
        vm.prank(investor2);
        project.fundProject{value: 100 ether}();
        
        assertEq(project.totalFunded(), FUNDING_CAP);
        assertTrue(project.state() == IUnitProjectERC721.ProjectState.FUNDED);
    }

    function testZeroFundingReverts() public {
        vm.prank(investor1);
        
        vm.expectRevert("ZERO_FUND");
        project.fundProject{value: 0}();
    }

    function testFundingAfterCapReached() public {
        // Reach funding cap
        vm.prank(investor1);
        project.fundProject{value: FUNDING_CAP}();
        
        assertTrue(project.state() == IUnitProjectERC721.ProjectState.FUNDED);
        
        // Try to fund after cap reached
        vm.prank(investor2);
        vm.expectRevert("BAD_STATE");
        project.fundProject{value: 1 ether}();
    }

    function testFundingWithGlobalPause() public {
        // Set global funding pause
        vm.prank(admin);
        factory.setGlobalPause(IBlueFireFactory.PauseType.FUNDING, true);
        
        vm.prank(investor1);
        vm.expectRevert("GLOBALLY_PAUSED");
        project.fundProject{value: 100 ether}();
        
        // Unpause and try again
        vm.prank(admin);
        factory.setGlobalPause(IBlueFireFactory.PauseType.FUNDING, false);
        
        vm.prank(investor1);
        uint256 tokenId = project.fundProject{value: 100 ether}();
        assertEq(tokenId, 1);
    }

    function testFundingInWrongState() public {
        // Change state to OPERATIONAL
        vm.prank(admin);
        factory.setProjectState(projectId, IBlueFireFactory.ProjectState.OPERATIONAL);
        
        vm.prank(investor1);
        vm.expectRevert("BAD_STATE");
        project.fundProject{value: 100 ether}();
    }

    function testTokenURI() public {
        vm.prank(investor1);
        uint256 tokenId = project.fundProject{value: 100 ether}();
        
        string memory uri = project.tokenURI(tokenId);
        assertTrue(bytes(uri).length > 0);
        
        // Should contain project name and token ID
        assertTrue(keccak256(bytes(uri)) != keccak256(bytes("")));
    }

    function testNonExistentTokenURI() public {
        vm.expectRevert("NO_TOKEN");
        project.tokenURI(999);
    }

    function testERC721StandardFunctions() public {
        vm.prank(investor1);
        uint256 tokenId = project.fundProject{value: 100 ether}();
        
        assertEq(project.name(), "BlueFireProject");
        assertEq(project.symbol(), "BFP");
        assertEq(project.ownerOf(tokenId), investor1);
        assertEq(project.balanceOf(investor1), 1);
        assertTrue(project.getApproved(tokenId) == address(0));
        assertFalse(project.isApprovedForAll(investor1, investor2));
    }

    function testFundingProgressView() public {
        assertEq(project.totalFunded(), 0);
        assertEq(project.fundingCap(), FUNDING_CAP);
        
        vm.prank(investor1);
        project.fundProject{value: 300 ether}();
        
        assertEq(project.totalFunded(), 300 ether);
        
        vm.prank(investor2);
        project.fundProject{value: 200 ether}();
        
        assertEq(project.totalFunded(), 500 ether);
        
        // Check percentage funded
        assertEq((project.totalFunded() * 100) / FUNDING_CAP, 50); // 50%
    }

    function testFuzzingFunding(uint256 amount) public {
        vm.assume(amount > 0 && amount <= FUNDING_CAP);
        
        vm.prank(investor1);
        uint256 tokenId = project.fundProject{value: amount}();
        
        assertEq(project.funded(tokenId), amount);
        assertEq(project.totalFunded(), amount);
        assertEq(project.ownerOf(tokenId), investor1);
    }

    function testMultipleInvestorsExactCap() public {
        uint256 amount1 = 333 ether;
        uint256 amount2 = 333 ether;
        uint256 amount3 = 334 ether; // Total = 1000 ether
        
        vm.prank(investor1);
        project.fundProject{value: amount1}();
        
        vm.prank(investor2);
        project.fundProject{value: amount2}();
        
        vm.prank(investor3);
        project.fundProject{value: amount3}();
        
        assertEq(project.totalFunded(), FUNDING_CAP);
        assertTrue(project.state() == IUnitProjectERC721.ProjectState.FUNDED);
    }
} 