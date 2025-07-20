// === File: contracts/interfaces/IUnitProjectERC721.sol ===
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title IUnitProjectERC721
 * @notice Interface for individual Blue Fire project contracts
 */
interface IUnitProjectERC721 is IERC721 {
    /// @notice Project lifecycle states (mirrors factory)
    enum ProjectState {
        SEEKING_FUNDING,
        FUNDED,
        OPERATIONAL,
        CLOSED,
        UNUSED1,
        UNUSED2
    }

    // Events
    event ProjectInitialized(uint256 indexed projectId, string name, uint256 fundingCap);
    event FundingReceived(uint256 indexed projectId, address indexed investor, uint256 indexed tokenId, uint256 amount, uint256 totalFunded);
    event FundingFinalized(uint256 indexed projectId, uint256 totalFunded);
    event EscrowReleaseApproved(uint256 indexed projectId);
    event EscrowReleased(uint256 indexed projectId, address indexed beneficiary, uint256 amount);
    event RevenueDeposited(uint256 indexed projectId, address indexed alice, uint256 amount, uint256 accRevenuePerShare);
    event RewardsClaimed(uint256 indexed projectId, address indexed investor, uint256 indexed tokenId, uint256 amount);
    event EscrowBeneficiaryChanged(uint256 indexed projectId, address indexed newBeneficiary);
    event StateChanged(uint256 indexed projectId, ProjectState newState);
    event AliceChanged(uint256 indexed projectId, address indexed oldAlice, address indexed newAlice);

    // Initialization
    function initialize(
        uint256 projectId,
        string calldata name,
        string calldata location,
        string calldata model,
        uint256 fundingCap,
        address escrowBeneficiary,
        address factory,
        address admin
    ) external;

    // Funding
    function fundProject() external payable returns (uint256 tokenId);

    // Revenue & Claims
    function payWaterRevenue() external payable;
    function claim(uint256 tokenId) external returns (uint256 amount);
    function claimAll() external returns (uint256 totalAmount);

    // Admin Functions
    function setAlice(address newAlice) external;
    function updateProjectMeta(string calldata name, string calldata location, string calldata model) external;
    function setEscrowBeneficiary(address newBeneficiary) external;
    function setState(ProjectState newState) external;
    function approveEscrowRelease() external;
    function releaseEscrow() external;

    // Future-Proof Stubs (revert for now)
    function splitPosition(uint256 tokenId, uint256 amount) external;
    function releaseEscrowTranche(uint256 amount) external;
    function cancelProject() external;

    // View Functions
    function projectId() external view returns (uint256);
    function factory() external view returns (address);
    function admin() external view returns (address);
    function state() external view returns (ProjectState);
    function fundingCap() external view returns (uint256);
    function totalFunded() external view returns (uint256);
    function escrowPrincipalRemaining() external view returns (uint256);
    function fundsReleased() external view returns (bool);
    function escrowBeneficiary() external view returns (address);
    function aliceOperator() external view returns (address);
    function accRevenuePerShare() external view returns (uint256);
    function funded(uint256 tokenId) external view returns (uint256);
    function rewardDebt(uint256 tokenId) external view returns (uint256);
    function pendingRewards(uint256 tokenId) external view returns (uint256);
    function escrowReleaseApproved() external view returns (bool);
    
    // Multi-asset stubs
    function fundingAsset() external view returns (address);
    function revenueAsset() external view returns (address);
    
    // Interface version
    function PROJECT_INTERFACE_VERSION() external pure returns (uint256);
} 