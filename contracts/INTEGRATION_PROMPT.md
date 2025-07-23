# Blue Fire Platform - Contract Integration Guide

## System Overview

You are integrating with the **Blue Fire Platform**, a decentralized funding system for water-production machines. The platform uses two main smart contracts:

1. **BlueFireFactory** - Central management contract
2. **UnitProjectERC721** - Individual project contracts (ERC-721 NFT position tokens)

Each physical water machine maps 1:1 to an isolated UnitProjectERC721 contract that also functions as an ERC-721 NFT contract representing investment positions.

## Architecture Pattern

- **Factory Pattern**: BlueFireFactory creates project instances using EIP-1167 minimal proxy clones
- **NFT Positions**: Each investment creates/updates an ERC-721 token representing the investor's position
- **Pro-Rata Revenue**: Revenue is distributed proportionally based on investment amounts using an accumulator model
- **State Machine**: Projects flow through: SEEKING_FUNDING → FUNDED → OPERATIONAL → CLOSED

## User Types & Capabilities

### 1. Admin (BFC Multisig)
**Role**: Platform operator and project manager

**Key Functions**:
- `factory.createProject()` - Deploy new water machine projects
- `factory.setAlice()` - Assign operators to projects  
- `factory.approveEscrowRelease()` - Approve funding release (step 1 of 2)
- `factory.releaseEscrow()` - Release funds to beneficiary (step 2 of 2)
- `factory.setTransferability()` - Enable/disable NFT transfers
- `factory.setGlobalPause()` - Emergency pause functionality

**UI Considerations**:
- Multi-signature wallet integration required
- Two-step escrow release workflow (approve → release)
- Project management dashboard for monitoring all projects
- Access controls for sensitive operations

### 2. Investors (General Public)
**Role**: Fund projects and claim revenue rewards

**Core Journey**:
1. **Discover** → Browse available projects (`projects[projectId]`)
2. **Fund** → `project.fundProject{value: amount}()` (receives NFT)  
3. **Monitor** → `project.pendingRewards(tokenId)` (track earnings)
4. **Claim** → `project.claim(tokenId)` or `project.claimAll()` (receive ETH)
5. **Transfer** → `project.transferFrom()` (trade NFT positions, if enabled)

**Key View Functions**:
- `project.funded(tokenId)` - Amount invested by this position
- `project.pendingRewards(tokenId)` - Claimable rewards
- `project.totalFunded()` - Project funding progress
- `project.fundingCap()` - Maximum funding target
- `project.state()` - Current project lifecycle state

**UI Considerations**:
- Real-time funding progress bars
- Earnings dashboard with pending/claimed history
- NFT wallet integration for position management
- Transfer marketplace integration

### 3. Alice (Machine Operators)
**Role**: Operate water machines and deposit revenue

**Key Functions**:
- `project.payWaterRevenue{value: amount}()` - Deposit water sales revenue

**Requirements**:
- Only callable in OPERATIONAL state (after escrow release)
- Revenue automatically distributed pro-rata to all investors
- Updates accumulator for precise reward calculations

**UI Considerations**:
- Operator mobile app for revenue deposits
- Revenue reporting and analytics
- Machine status monitoring integration

## Critical User Flows

### Project Creation Flow (Admin)
```
1. Admin calls factory.createProject(name, location, model, cap, beneficiary)
2. Factory deploys new UnitProjectERC721 clone
3. Project starts in SEEKING_FUNDING state
4. Admin optionally calls factory.setAlice(projectId, operator)
```

### Investment Flow (Investor)
```
1. Investor calls project.fundProject{value: amount}()
2. If first investment: mint new NFT to investor
3. If repeat investment: add to existing NFT position
4. Update funded[tokenId] and totalFunded
5. If funding cap reached: auto-transition to FUNDED state
```

### Escrow Release Flow (Admin - Two Steps)
```
1. Admin calls factory.approveEscrowRelease(projectId)
2. Admin calls factory.releaseEscrow(projectId)  
3. Funds transferred to escrowBeneficiary
4. Project transitions to OPERATIONAL state
5. Alice can now deposit revenue
```

### Revenue & Claims Flow (Alice → Investors)
```
1. Alice calls project.payWaterRevenue{value: revenue}()
2. Accumulator updated: accRevenuePerShare += (revenue * PRECISION) / totalFunded
3. Investors call project.claim(tokenId) or project.claimAll()
4. Rewards calculated: (funded[tokenId] * accRevenuePerShare / PRECISION) - rewardDebt[tokenId]
5. ETH transferred to investor, rewardDebt updated
```

## State Management

### Project States
- **SEEKING_FUNDING**: Accepting investments, NFTs being minted
- **FUNDED**: Funding complete, awaiting escrow release
- **OPERATIONAL**: Revenue deposits active, rewards claimable
- **CLOSED**: Project ended (future functionality)

### State Transitions
- SEEKING_FUNDING → FUNDED: Automatic when `totalFunded == fundingCap`
- FUNDED → OPERATIONAL: Manual via admin `releaseEscrow()`
- Any state → Any state: Admin override via `setProjectState()`

## Integration Technical Details

### Contract Addresses & ABIs
```javascript
// Factory contract (single deployment)
const factoryContract = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);

// Project contracts (multiple instances)
const projectAddress = await factoryContract.getProjectAddress(projectId);
const projectContract = new ethers.Contract(projectAddress, PROJECT_ABI, provider);
```

### Key Events to Monitor
```solidity
// Factory Events
event ProjectCreated(uint256 indexed projectId, address indexed projectAddress, string name, uint256 fundingCap);
event ProjectStateChanged(uint256 indexed projectId, ProjectState newState);

// Project Events  
event FundingReceived(uint256 indexed projectId, address indexed investor, uint256 indexed tokenId, uint256 amount, uint256 totalFunded);
event RevenueDeposited(uint256 indexed projectId, address indexed alice, uint256 amount, uint256 accRevenuePerShare);
event RewardsClaimed(uint256 indexed projectId, address indexed investor, uint256 indexed tokenId, uint256 amount);
```

### Error Handling
```solidity
// Common revert reasons to handle in UI
"NOT_ADMIN"           // Access control failure
"CAP"                 // Investment exceeds funding cap  
"BAD_STATE"           // Operation not allowed in current state
"NO_REWARDS"          // No pending rewards to claim
"NOT_OWNER"           // Token ownership mismatch
"GLOBALLY_PAUSED"     // Emergency pause active
```

### Gas Optimization Notes
- Use `claimAll()` instead of `claim(tokenId)` for single-position investors
- Batch multiple view calls using multicall patterns
- Project deployment uses minimal proxy clones (low gas)

## Revenue Distribution Mathematics

### Accumulator Model
```solidity
// When revenue deposited:
accRevenuePerShare += (revenue * ACC_PRECISION) / totalFunded;

// When investor claims:
pendingRewards = (funded[tokenId] * accRevenuePerShare / ACC_PRECISION) - rewardDebt[tokenId];
rewardDebt[tokenId] = funded[tokenId] * accRevenuePerShare / ACC_PRECISION;
```

### Pro-Rata Example
- Project: 1000 ETH funding cap
- Investor A: 300 ETH (30% share)
- Investor B: 700 ETH (70% share)
- Revenue: 100 ETH deposited
- **Result**: A gets 30 ETH, B gets 70 ETH

## Security Considerations

### Access Controls
- Admin functions protected by `onlyAdmin` modifier
- Alice functions protected by `onlyAlice` modifier
- Transfer gating via `factory.transfersAllowed(projectId)`

### Reentrancy Protection
- All state-changing functions use `nonReentrant` modifier
- ETH transfers use OpenZeppelin's `sendValue()` for safety

### Global Pause System
```solidity
enum PauseType { FUNDING, REVENUE, CLAIMS }
```
- Emergency stop functionality for critical operations
- Granular control over different operation types

## Frontend Integration Patterns

### Real-Time Updates
```javascript
// Listen for funding progress
projectContract.on("FundingReceived", (projectId, investor, tokenId, amount, totalFunded) => {
  updateFundingProgress(projectId, totalFunded);
  refreshInvestorPosition(investor, tokenId);
});

// Listen for revenue deposits
projectContract.on("RevenueDeposited", (projectId, alice, amount, accRevenuePerShare) => {
  refreshAllPendingRewards(projectId);
});
```

### Wallet Integration
```javascript
// Connect investor wallet
const signer = provider.getSigner();
const projectWithSigner = projectContract.connect(signer);

// Fund project
const tx = await projectWithSigner.fundProject({ value: ethers.utils.parseEther("10") });
await tx.wait();
```

### Error Handling
```javascript
try {
  await projectContract.claim(tokenId);
} catch (error) {
  if (error.reason === "NO_REWARDS") {
    showMessage("No rewards available to claim");
  } else if (error.reason === "NOT_OWNER") {
    showMessage("You don't own this position");
  }
}
```

## Backend Integration Considerations

### Data Indexing
- Index all ProjectCreated events to discover projects
- Track FundingReceived events for investment history
- Monitor RevenueDeposited events for revenue analytics

### User Position Tracking
```sql
-- Example database schema
CREATE TABLE positions (
  token_id INT,
  project_id INT,
  owner_address VARCHAR(42),
  funded_amount DECIMAL(78,0),
  last_claim_block INT,
  created_at TIMESTAMP
);
```

### Analytics Requirements
- Total funds raised across all projects
- Revenue per project over time
- Investor ROI calculations
- Machine performance metrics

## Testing & Development

### Local Development
```bash
# Start local blockchain
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Run integration tests
npx hardhat test --network localhost
```

### Testnet Integration
- Use factory pattern for easy testing
- Mock Alice revenue deposits for demonstration
- Test with small amounts (wei/gwei) for cost efficiency

This integration guide provides the foundation for building user interfaces and backend systems that interact safely and effectively with the Blue Fire Platform smart contracts. 