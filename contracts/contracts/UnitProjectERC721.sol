// === File: contracts/UnitProjectERC721.sol ===
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./interfaces/IUnitProjectERC721.sol";
import "./interfaces/IBlueFireFactory.sol";

/**
 * @title UnitProjectERC721
 * @notice Individual Blue Fire project contract with ERC721 position NFTs
 * @dev Combines investment tracking with ERC721 tokens for position representation
 */
contract UnitProjectERC721 is IUnitProjectERC721, ERC721, ReentrancyGuard {
    using Address for address payable;

    /// @notice Precision for accumulator calculations
    uint256 public constant ACC_PRECISION = 1e18;
    
    /// @notice Interface version
    uint256 public constant PROJECT_INTERFACE_VERSION = 1;

    /// @notice Project identifier
    uint256 public projectId;
    
    /// @notice Factory contract address
    address public factory;
    
    /// @notice Admin address (from factory)
    address public admin;

    /// @notice Project metadata
    string public projectName;
    string public location;
    string public model;

    /// @notice Funding parameters
    uint256 public fundingCap;
    uint256 public totalFunded;
    
    /// @notice Project lifecycle state
    ProjectState public state;

    /// @notice Escrow management
    uint256 public escrowPrincipalRemaining;
    bool public fundsReleased;
    bool public escrowReleaseApproved;
    address public escrowBeneficiary;

    /// @notice Revenue distribution
    uint256 public accRevenuePerShare;
    address public aliceOperator;

    /// @notice Token tracking
    uint256 private _nextTokenId = 1;
    mapping(address => uint256) public investorToTokenId;
    
    /// @notice Per-token data
    mapping(uint256 => uint256) public funded;
    mapping(uint256 => uint256) public rewardDebt;

    /// @notice Initialization flag
    bool private _initialized;

    /// @notice Reserved storage for future upgrades
    uint256[40] private __gap;

    modifier onlyFactory() {
        require(msg.sender == factory, "NOT_FACTORY");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "NOT_ADMIN");
        _;
    }

    modifier onlyAlice() {
        require(msg.sender == aliceOperator, "NOT_ALICE");
        _;
    }

    modifier inState(ProjectState requiredState) {
        require(state == requiredState, "BAD_STATE");
        _;
    }

    modifier notGloballyPaused(IBlueFireFactory.PauseType pauseType) {
        require(!IBlueFireFactory(factory).isGloballyPaused(pauseType), "GLOBALLY_PAUSED");
        _;
    }

    constructor() ERC721("BlueFireProject", "BFP") {
        // Implementation contract - will be cloned
    }

    /**
     * @notice Initialize the project (called once by factory)
     */
    function initialize(
        uint256 _projectId,
        string calldata _name,
        string calldata _location,
        string calldata _model,
        uint256 _fundingCap,
        address _escrowBeneficiary,
        address _factory,
        address _admin
    ) external {
        require(!_initialized, "ALREADY_INIT");
        require(_factory != address(0), "ZERO_FACTORY");
        require(_admin != address(0), "ZERO_ADMIN");
        require(_fundingCap > 0, "ZERO_CAP");

        _initialized = true;
        projectId = _projectId;
        factory = _factory;
        admin = _admin;
        projectName = _name;
        location = _location;
        model = _model;
        fundingCap = _fundingCap;
        escrowBeneficiary = _escrowBeneficiary;
        state = ProjectState.SEEKING_FUNDING;

        emit ProjectInitialized(_projectId, _name, _fundingCap);
    }

    // Override ERC721 name and symbol functions for clone compatibility
    function name() public pure override returns (string memory) {
        return "BlueFireProject";
    }

    function symbol() public pure override returns (string memory) {
        return "BFP";
    }

    /**
     * @notice Fund the project and receive position NFT
     * @return tokenId The token ID minted for this investor
     */
    function fundProject() 
        external 
        payable 
        nonReentrant 
        inState(ProjectState.SEEKING_FUNDING)
        notGloballyPaused(IBlueFireFactory.PauseType.FUNDING)
        returns (uint256 tokenId) 
    {
        require(msg.value > 0, "ZERO_FUND");
        require(totalFunded + msg.value <= fundingCap, "CAP");

        address investor = msg.sender;
        
        // Check if investor already has a token
        tokenId = investorToTokenId[investor];
        
        if (tokenId == 0 && balanceOf(investor) == 0) {
            // First time investor - mint new token
            tokenId = _nextTokenId;
            _nextTokenId++;
            investorToTokenId[investor] = tokenId;
            _mint(investor, tokenId);
        }

        // Update funding for this position
        funded[tokenId] += msg.value;
        totalFunded += msg.value;

        emit FundingReceived(projectId, investor, tokenId, msg.value, totalFunded);

        // Check if funding cap reached
        if (totalFunded == fundingCap) {
            state = ProjectState.FUNDED;
            escrowPrincipalRemaining = totalFunded;
            emit FundingFinalized(projectId, totalFunded);
        }
    }

    /**
     * @notice Deposit revenue (only by Alice in operational state)
     */
    function payWaterRevenue() 
        external 
        payable 
        nonReentrant 
        onlyAlice 
        inState(ProjectState.OPERATIONAL)
        notGloballyPaused(IBlueFireFactory.PauseType.REVENUE)
    {
        require(msg.value > 0, "ZERO_REVENUE");
        require(totalFunded > 0, "NO_FUNDED");

        // Update accumulator
        accRevenuePerShare += (msg.value * ACC_PRECISION) / totalFunded;

        emit RevenueDeposited(projectId, msg.sender, msg.value, accRevenuePerShare);
    }

    /**
     * @notice Claim rewards for a specific token
     * @param tokenId Token ID to claim for
     * @return amount Amount claimed
     */
    function claim(uint256 tokenId) 
        external 
        nonReentrant 
        notGloballyPaused(IBlueFireFactory.PauseType.CLAIMS)
        returns (uint256 amount) 
    {
        require(ownerOf(tokenId) == msg.sender, "NOT_OWNER");
        
        amount = pendingRewards(tokenId);
        require(amount > 0, "NO_REWARDS");

        // Update reward debt
        rewardDebt[tokenId] = (funded[tokenId] * accRevenuePerShare) / ACC_PRECISION;

        // Transfer rewards
        payable(msg.sender).sendValue(amount);

        emit RewardsClaimed(projectId, msg.sender, tokenId, amount);
    }

    /**
     * @notice Claim all rewards for caller's tokens
     * @return totalAmount Total amount claimed
     */
    function claimAll() external nonReentrant notGloballyPaused(IBlueFireFactory.PauseType.CLAIMS) returns (uint256 totalAmount) {
        address investor = msg.sender;
        uint256 tokenId = investorToTokenId[investor];
        require(balanceOf(investor) > 0, "NO_TOKEN");

        totalAmount = pendingRewards(tokenId);
        require(totalAmount > 0, "NO_REWARDS");

        // Update reward debt
        rewardDebt[tokenId] = (funded[tokenId] * accRevenuePerShare) / ACC_PRECISION;

        // Transfer rewards
        payable(investor).sendValue(totalAmount);

        emit RewardsClaimed(projectId, investor, tokenId, totalAmount);
    }

    /**
     * @notice Calculate pending rewards for a token
     * @param tokenId Token ID
     * @return Pending reward amount
     */
    function pendingRewards(uint256 tokenId) public view returns (uint256) {
        if (funded[tokenId] == 0) return 0;
        
        uint256 accRewards = (funded[tokenId] * accRevenuePerShare) / ACC_PRECISION;
        return accRewards > rewardDebt[tokenId] ? accRewards - rewardDebt[tokenId] : 0;
    }

    // Admin Functions

    /**
     * @notice Set Alice operator (factory only)
     */
    function setAlice(address newAlice) external onlyFactory {
        address oldAlice = aliceOperator;
        aliceOperator = newAlice;
        
        emit AliceChanged(projectId, oldAlice, newAlice);
    }

    /**
     * @notice Update project metadata (factory only, seeking funding state)
     */
    function updateProjectMeta(
        string calldata name,
        string calldata _location,
        string calldata _model
    ) external onlyFactory inState(ProjectState.SEEKING_FUNDING) {
        projectName = name;
        location = _location;
        model = _model;
    }

    /**
     * @notice Set escrow beneficiary (factory only, before approval)
     */
    function setEscrowBeneficiary(address newBeneficiary) external onlyFactory {
        require(!escrowReleaseApproved, "ALREADY_APPROVED");
        escrowBeneficiary = newBeneficiary;
        
        emit EscrowBeneficiaryChanged(projectId, newBeneficiary);
    }

    /**
     * @notice Set project state (factory only)
     */
    function setState(ProjectState newState) external onlyFactory {
        state = newState;
        
        emit StateChanged(projectId, newState);
    }

    /**
     * @notice Approve escrow release (factory only)
     */
    function approveEscrowRelease() external onlyFactory inState(ProjectState.FUNDED) {
        escrowReleaseApproved = true;
        
        emit EscrowReleaseApproved(projectId);
    }

    /**
     * @notice Release escrow to beneficiary (factory only)
     */
    function releaseEscrow() external onlyFactory nonReentrant {
        require(escrowReleaseApproved, "NOT_APPROVED");
        require(!fundsReleased, "ALREADY_RELEASED");
        require(escrowPrincipalRemaining > 0, "NO_ESCROW");

        uint256 amount = escrowPrincipalRemaining;
        escrowPrincipalRemaining = 0;
        fundsReleased = true;

        // Transfer to beneficiary
        payable(escrowBeneficiary).sendValue(amount);

        emit EscrowReleased(projectId, escrowBeneficiary, amount);
    }

    // Future-Proof Stubs (revert for now)

    function splitPosition(uint256 /*tokenId*/, uint256 /*amount*/) external pure {
        revert("NOT_IMPLEMENTED");
    }

    function releaseEscrowTranche(uint256 /*amount*/) external pure {
        revert("NOT_IMPLEMENTED");
    }

    function cancelProject() external pure {
        revert("NOT_IMPLEMENTED");
    }

    // Multi-asset stubs (return zero address for now)

    function fundingAsset() external pure returns (address) {
        return address(0); // Native token
    }

    function revenueAsset() external pure returns (address) {
        return address(0); // Native token
    }

    // ERC721 Transfer Hook

    /**
     * @notice Override to implement transfer gating and update investor mapping
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        // Get current owner safely (will be address(0) for minting)
        address previousOwner;
        try this.ownerOf(tokenId) returns (address owner) {
            previousOwner = owner;
        } catch {
            previousOwner = address(0);
        }

        // Check transfer permissions BEFORE calling parent (skip for minting/burning)
        if (previousOwner != address(0) && to != address(0)) {
            require(IBlueFireFactory(factory).transfersAllowed(projectId), "XFER_DISABLED");
        }

        // Call parent implementation
        address returnedOwner = super._update(to, tokenId, auth);

        // Update investor mapping (Note: rewards travel with token)
        if (previousOwner != address(0) && to != address(0)) {
            // Transfer: clear old mapping, set new mapping
            investorToTokenId[previousOwner] = 0;
            investorToTokenId[to] = tokenId;
        } else if (to != address(0) && previousOwner == address(0)) {
            // Minting
            investorToTokenId[to] = tokenId;
        } else if (previousOwner != address(0) && to == address(0)) {
            // Burning
            investorToTokenId[previousOwner] = 0;
        }

        return returnedOwner;
    }

    /**
     * @notice Override to provide meaningful token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        // Simple URI for now - could be enhanced with metadata
        return string(abi.encodePacked(
            "data:application/json,{\"name\":\"",
            projectName,
            " Position #",
            _toString(tokenId),
            "\",\"description\":\"Blue Fire Project Position NFT\"}"
        ));
    }

    // Helper Functions

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
} 