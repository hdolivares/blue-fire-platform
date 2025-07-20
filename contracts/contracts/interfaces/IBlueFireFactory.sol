// === File: contracts/interfaces/IBlueFireFactory.sol ===
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IBlueFireFactory
 * @notice Interface for the Blue Fire Factory contract
 */
interface IBlueFireFactory {
    /// @notice Project lifecycle states
    enum ProjectState {
        SEEKING_FUNDING,
        FUNDED,
        OPERATIONAL,
        CLOSED,
        UNUSED1,
        UNUSED2
    }

    /// @notice Global pause types
    enum PauseType {
        FUNDING,
        REVENUE,
        CLAIMS
    }

    /// @notice Project metadata record
    struct ProjectRecord {
        address projectAddress;
        string name;
        string location;
        string model;
        uint256 fundingCap;
        address escrowBeneficiary;
        ProjectState state;
        bool transfersAllowed;
        bool escrowReleaseApproved;
        address aliceOperator;
        uint256 createdAt;
    }

    // Events
    event ProjectCreated(uint256 indexed projectId, address indexed projectAddress, string name, uint256 fundingCap);
    event ProjectMetaUpdated(uint256 indexed projectId, string name, string location, string model, uint256 cap);
    event ProjectStateChanged(uint256 indexed projectId, ProjectState newState);
    event TransferabilitySet(uint256 indexed projectId, bool enabled);
    event GlobalPauseSet(PauseType pauseType, bool enabled);
    event AliceChanged(uint256 indexed projectId, address indexed oldAlice, address indexed newAlice);
    event EscrowBeneficiaryChanged(uint256 indexed projectId, address indexed newBeneficiary);
    event EscrowReleaseApproved(uint256 indexed projectId);

    // Factory Management Functions
    function createProject(
        string calldata name,
        string calldata location,
        string calldata model,
        uint256 fundingCap,
        address escrowBeneficiary
    ) external returns (uint256 projectId);

    function setAlice(uint256 projectId, address newAlice) external;
    function updateProjectMeta(uint256 projectId, string calldata name, string calldata location, string calldata model) external;
    function setProjectState(uint256 projectId, ProjectState newState) external;
    function approveEscrowRelease(uint256 projectId) external;
    function releaseEscrow(uint256 projectId) external;
    function setTransferability(uint256 projectId, bool enabled) external;
    function setEscrowBeneficiary(uint256 projectId, address newBeneficiary) external;

    // Pause Controls
    function setGlobalPause(PauseType pauseType, bool enabled) external;

    // View Functions
    function admin() external view returns (address);
    function projectImplementation() external view returns (address);
    function nextProjectId() external view returns (uint256);
    function getProject(uint256 projectId) external view returns (ProjectRecord memory);
    function getProjectAddress(uint256 projectId) external view returns (address);
    function transfersAllowed(uint256 projectId) external view returns (bool);
    function isGloballyPaused(PauseType pauseType) external view returns (bool);
    function escrowReleaseApproved(uint256 projectId) external view returns (bool);
} 