// === File: contracts/BlueFireFactory.sol ===
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IBlueFireFactory.sol";
import "./interfaces/IUnitProjectERC721.sol";

/**
 * @title BlueFireFactory
 * @notice Central factory for deploying and managing Blue Fire water projects
 * @dev Uses EIP-1167 minimal proxy clones for gas-efficient project deployment
 */
contract BlueFireFactory is IBlueFireFactory, Ownable, ReentrancyGuard {
    using Clones for address;

    /// @notice Current project ID counter
    uint256 public nextProjectId = 1;

    /// @notice Implementation contract for project clones
    address public immutable projectImplementation;

    /// @notice Admin address (factory owner)
    address public immutable admin;

    /// @notice Mapping of project ID to project records
    mapping(uint256 => ProjectRecord) public projects;

    /// @notice Global pause states
    mapping(PauseType => bool) public globalPauses;

    modifier onlyAdmin() {
        require(msg.sender == admin, "NOT_ADMIN");
        _;
    }

    modifier validProject(uint256 projectId) {
        require(projects[projectId].projectAddress != address(0), "INVALID_PROJECT");
        _;
    }

    constructor(address _projectImplementation) Ownable(msg.sender) {
        require(_projectImplementation != address(0), "ZERO_IMPL");
        projectImplementation = _projectImplementation;
        admin = msg.sender;
    }

    /**
     * @notice Create a new project instance
     * @param name Project name
     * @param location Project location
     * @param model Equipment model
     * @param fundingCap Maximum funding amount
     * @param escrowBeneficiary Beneficiary for escrow release (admin if zero address)
     * @return projectId The ID of the newly created project
     */
    function createProject(
        string calldata name,
        string calldata location,
        string calldata model,
        uint256 fundingCap,
        address escrowBeneficiary
    ) external onlyAdmin returns (uint256 projectId) {
        require(fundingCap > 0, "ZERO_CAP");
        require(bytes(name).length > 0, "EMPTY_NAME");

        projectId = nextProjectId++;
        
        // Deploy minimal proxy clone
        address projectAddress = projectImplementation.clone();
        
        // Set beneficiary to admin if not specified
        address beneficiary = escrowBeneficiary == address(0) ? admin : escrowBeneficiary;
        
        // Store project record
        projects[projectId] = ProjectRecord({
            projectAddress: projectAddress,
            name: name,
            location: location,
            model: model,
            fundingCap: fundingCap,
            escrowBeneficiary: beneficiary,
            state: ProjectState.SEEKING_FUNDING,
            transfersAllowed: false,
            escrowReleaseApproved: false,
            aliceOperator: address(0),
            createdAt: block.timestamp
        });

        // Initialize the clone
        IUnitProjectERC721(projectAddress).initialize(
            projectId,
            name,
            location,
            model,
            fundingCap,
            beneficiary,
            address(this),
            admin
        );

        emit ProjectCreated(projectId, projectAddress, name, fundingCap);
    }

    /**
     * @notice Set the operator (Alice) for a project
     * @param projectId Project ID
     * @param newAlice New operator address
     */
    function setAlice(uint256 projectId, address newAlice) external onlyAdmin validProject(projectId) {
        address oldAlice = projects[projectId].aliceOperator;
        projects[projectId].aliceOperator = newAlice;
        
        IUnitProjectERC721(projects[projectId].projectAddress).setAlice(newAlice);
        
        emit AliceChanged(projectId, oldAlice, newAlice);
    }

    /**
     * @notice Update project metadata (only while seeking funding)
     * @param projectId Project ID
     * @param name New project name
     * @param location New project location
     * @param model New equipment model
     */
    function updateProjectMeta(
        uint256 projectId,
        string calldata name,
        string calldata location,
        string calldata model
    ) external onlyAdmin validProject(projectId) {
        require(projects[projectId].state == ProjectState.SEEKING_FUNDING, "NOT_SEEKING");
        require(bytes(name).length > 0, "EMPTY_NAME");

        projects[projectId].name = name;
        projects[projectId].location = location;
        projects[projectId].model = model;

        IUnitProjectERC721(projects[projectId].projectAddress).updateProjectMeta(name, location, model);

        emit ProjectMetaUpdated(projectId, name, location, model, projects[projectId].fundingCap);
    }

    /**
     * @notice Set project state
     * @param projectId Project ID
     * @param newState New project state
     */
    function setProjectState(uint256 projectId, ProjectState newState) external onlyAdmin validProject(projectId) {
        projects[projectId].state = newState;
        
        IUnitProjectERC721(projects[projectId].projectAddress).setState(IUnitProjectERC721.ProjectState(uint8(newState)));
        
        emit ProjectStateChanged(projectId, newState);
    }

    /**
     * @notice Approve escrow release for a project
     * @param projectId Project ID
     */
    function approveEscrowRelease(uint256 projectId) external onlyAdmin validProject(projectId) {
        require(projects[projectId].state == ProjectState.FUNDED, "NOT_FUNDED");
        
        projects[projectId].escrowReleaseApproved = true;
        
        IUnitProjectERC721(projects[projectId].projectAddress).approveEscrowRelease();
        
        emit EscrowReleaseApproved(projectId);
    }

    /**
     * @notice Release escrow funds to beneficiary
     * @param projectId Project ID
     */
    function releaseEscrow(uint256 projectId) external onlyAdmin validProject(projectId) nonReentrant {
        require(projects[projectId].escrowReleaseApproved, "NOT_APPROVED");
        require(projects[projectId].state == ProjectState.FUNDED, "NOT_FUNDED");

        // Update state to operational
        projects[projectId].state = ProjectState.OPERATIONAL;

        // Release escrow through project contract
        IUnitProjectERC721(projects[projectId].projectAddress).releaseEscrow();

        emit ProjectStateChanged(projectId, ProjectState.OPERATIONAL);
    }

    /**
     * @notice Set transfer permissions for a project
     * @param projectId Project ID
     * @param enabled Whether transfers are allowed
     */
    function setTransferability(uint256 projectId, bool enabled) external onlyAdmin validProject(projectId) {
        projects[projectId].transfersAllowed = enabled;
        
        emit TransferabilitySet(projectId, enabled);
    }

    /**
     * @notice Set escrow beneficiary for a project
     * @param projectId Project ID
     * @param newBeneficiary New beneficiary address
     */
    function setEscrowBeneficiary(uint256 projectId, address newBeneficiary) external onlyAdmin validProject(projectId) {
        require(newBeneficiary != address(0), "ZERO_ADDR");
        require(!projects[projectId].escrowReleaseApproved, "ALREADY_APPROVED");

        projects[projectId].escrowBeneficiary = newBeneficiary;
        
        IUnitProjectERC721(projects[projectId].projectAddress).setEscrowBeneficiary(newBeneficiary);
        
        emit EscrowBeneficiaryChanged(projectId, newBeneficiary);
    }

    /**
     * @notice Set global pause for specific operation type
     * @param pauseType Type of operation to pause
     * @param enabled Whether to pause or unpause
     */
    function setGlobalPause(PauseType pauseType, bool enabled) external onlyAdmin {
        globalPauses[pauseType] = enabled;
        
        emit GlobalPauseSet(pauseType, enabled);
    }

    // View Functions

    /**
     * @notice Get complete project record
     * @param projectId Project ID
     * @return ProjectRecord struct
     */
    function getProject(uint256 projectId) external view returns (ProjectRecord memory) {
        return projects[projectId];
    }

    /**
     * @notice Get project contract address
     * @param projectId Project ID
     * @return Project contract address
     */
    function getProjectAddress(uint256 projectId) external view returns (address) {
        return projects[projectId].projectAddress;
    }

    /**
     * @notice Check if transfers are allowed for a project
     * @param projectId Project ID
     * @return Whether transfers are allowed
     */
    function transfersAllowed(uint256 projectId) external view returns (bool) {
        return projects[projectId].transfersAllowed;
    }

    /**
     * @notice Check if a specific operation type is globally paused
     * @param pauseType Type of operation
     * @return Whether the operation is paused
     */
    function isGloballyPaused(PauseType pauseType) external view returns (bool) {
        return globalPauses[pauseType];
    }

    /**
     * @notice Check if escrow release is approved for a project
     * @param projectId Project ID
     * @return Whether escrow release is approved
     */
    function escrowReleaseApproved(uint256 projectId) external view returns (bool) {
        return projects[projectId].escrowReleaseApproved;
    }
} 