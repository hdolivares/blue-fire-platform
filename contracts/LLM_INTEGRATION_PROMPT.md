# Blue Fire Platform Integration Prompt

## Task
You are integrating a **decentralized water infrastructure funding platform** with a UI/backend. The platform allows investors to fund water-production machines and receive pro-rata revenue distributions via ERC-721 NFT position tokens.

## Smart Contract Architecture

**Two Main Contracts:**
1. **BlueFireFactory** (central management) 
2. **UnitProjectERC721** (individual water machine projects + ERC-721 NFTs)

**Pattern:** Factory creates project clones using EIP-1167 minimal proxies. Each investment creates/updates an NFT representing the investor's position.

## User Stories & Contract Interactions

### 👨‍💼 ADMIN USER (BFC Multisig)
**WHO**: Platform operators managing water infrastructure projects

**USER STORIES:**
- As an admin, I want to **create new water machine projects** so investors can fund them
- As an admin, I want to **assign operators** to manage deployed machines  
- As an admin, I want to **release funding** to machine operators via two-step escrow
- As an admin, I want to **control NFT transfers** for regulatory compliance
- As an admin, I want **emergency pause controls** for platform security

**CONTRACT CALLS:**
```solidity
// Create new project
factory.createProject(name, location, model, fundingCap, beneficiary) → returns projectId

// Assign machine operator  
factory.setAlice(projectId, operatorAddress)

// Two-step escrow release
factory.approveEscrowRelease(projectId)  // Step 1
factory.releaseEscrow(projectId)         // Step 2

// Controls
factory.setTransferability(projectId, enabled)
factory.setGlobalPause(pauseType, enabled)
```

**UI REQUIREMENTS:**
- Multi-sig wallet integration (admin access control)
- Project management dashboard
- Two-step approval workflow for fund releases
- Global pause/unpause controls

---

### 💰 INVESTOR USER (General Public)
**WHO**: People funding water infrastructure for profit

**USER STORIES:**
- As an investor, I want to **browse available projects** to find investment opportunities
- As an investor, I want to **fund projects with ETH** and receive NFT positions
- As an investor, I want to **track my earnings** from water machine revenue
- As an investor, I want to **claim my accumulated rewards** when ready
- As an investor, I want to **transfer/trade my position NFTs** (if enabled)

**CONTRACT CALLS:**
```solidity
// Fund project (receives NFT)
project.fundProject{value: ethAmount}() → returns tokenId

// Check earnings
project.pendingRewards(tokenId) → returns claimableAmount
project.funded(tokenId) → returns myInvestment

// Claim rewards
project.claim(tokenId) → returns claimedAmount
project.claimAll() → returns totalClaimed

// View project info
project.totalFunded() → returns currentFunding
project.fundingCap() → returns maxFunding  
project.state() → returns currentState

// Transfer NFT (if enabled)
project.transferFrom(from, to, tokenId)
```

**UI REQUIREMENTS:**
- Project discovery/browsing interface
- Investment flow with funding progress bars
- Earnings dashboard with real-time updates
- One-click reward claiming
- NFT wallet integration
- Position transfer marketplace

---

### ⚙️ ALICE USER (Machine Operators)
**WHO**: On-ground operators managing water machines

**USER STORIES:**
- As an operator, I want to **deposit water sales revenue** so investors get paid
- As an operator, I want to **track machine performance** and revenue history

**CONTRACT CALLS:**
```solidity
// Deposit revenue (distributes to all investors automatically)
project.payWaterRevenue{value: revenueAmount}()
```

**UI REQUIREMENTS:**
- Mobile-first operator app
- Simple revenue deposit interface
- Machine performance tracking
- Revenue history reports

## Critical Technical Flows

### 🔄 PROJECT LIFECYCLE
```
SEEKING_FUNDING → FUNDED → OPERATIONAL → CLOSED
     ↑               ↑           ↑
  Creation      Full Funding  Escrow Release
```

### 💸 REVENUE DISTRIBUTION MATH
**Pro-Rata Model:** Each investor gets percentage equal to their funding share
```
Example:
- Project: 1000 ETH funding cap
- Investor A: 300 ETH → 30% share
- Investor B: 700 ETH → 70% share  
- Revenue: 100 ETH deposited
- Result: A gets 30 ETH, B gets 70 ETH
```

### 🔐 SECURITY MODEL
- **Access Control**: Only authorized users can call restricted functions
- **Two-Step Escrow**: Admin must approve then release funds separately
- **Reentrancy Protection**: All state changes protected from attacks
- **Global Pause**: Emergency stop for critical operations

## Key Events to Monitor

```solidity
// Project creation
ProjectCreated(projectId, projectAddress, name, fundingCap)

// Investment activity  
FundingReceived(projectId, investor, tokenId, amount, totalFunded)

// Revenue & rewards
RevenueDeposited(projectId, alice, amount, accRevenuePerShare)
RewardsClaimed(projectId, investor, tokenId, amount)

// State changes
ProjectStateChanged(projectId, newState)
```

## Integration Requirements

### FRONTEND NEEDS:
1. **Web3 Wallet Integration** - MetaMask, WalletConnect, etc.
2. **Real-Time Updates** - Event listening for live data
3. **NFT Display** - Show position tokens in wallet
4. **Error Handling** - User-friendly contract error messages
5. **Mobile Responsive** - Operator app needs mobile-first design

### BACKEND NEEDS:
1. **Event Indexing** - Monitor all contract events
2. **User Position Tracking** - Database of investor positions
3. **Analytics** - ROI calculations, revenue reports
4. **Notification System** - Alert users of rewards/state changes

### STATE MANAGEMENT:
- Track project states for UI logic
- Cache user positions for performance
- Monitor funding progress in real-time
- Calculate pending rewards efficiently

## Error Handling

**Common Contract Errors:**
- `"NOT_ADMIN"` → User doesn't have admin privileges
- `"CAP"` → Investment would exceed funding cap
- `"BAD_STATE"` → Operation not allowed in current project state
- `"NO_REWARDS"` → No pending rewards to claim
- `"NOT_OWNER"` → User doesn't own the NFT position
- `"GLOBALLY_PAUSED"` → Emergency pause is active

## Integration Success Criteria

✅ **Admin can create projects and manage escrow releases**
✅ **Investors can fund projects and receive NFT positions**  
✅ **Real-time funding progress updates work correctly**
✅ **Revenue deposits automatically update all investor rewards**
✅ **Reward claiming transfers correct ETH amounts**
✅ **NFT transfers work when enabled**
✅ **Error states are handled gracefully**
✅ **Mobile operator interface works offline-first**

## Technical Notes

- Use **ethers.js** or **web3.js** for contract interaction
- Implement **multicall** for efficient batch view calls
- Consider **subgraph** for complex data queries
- Use **IPFS** for project metadata and images
- Implement **optimistic UI updates** for better UX

Build the integration focusing on these three core user journeys, ensuring each user type can accomplish their goals efficiently and securely. 