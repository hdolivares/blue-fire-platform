# Blue Fire Platform

A modular on-chain funding and revenue distribution platform for water-production machines. Each physical machine maps 1:1 to an isolated on-chain "Unit Project" contract that also functions as an ERC-721 position NFT contract.

## Architecture

The Blue Fire platform consists of two main contracts:

1. **BlueFireFactory**: Central factory that deploys and manages individual project instances
2. **UnitProjectERC721**: Individual project contracts that combine investment tracking with ERC-721 position NFTs

## Key Features

- **Per-Project Isolation**: Each machine has its own dedicated contract instance
- **ERC-721 Position NFTs**: Investors receive cumulative position tokens representing their stake
- **Pro-Rata Revenue Distribution**: O(1) claims using accumulator model
- **Escrow Management**: Two-step principal release process with admin approval
- **Transfer Gating**: NFT transfers disabled by default, controllable per-project
- **Future-Proofing**: Reserved storage and stub functions for planned features

## Lifecycle

Projects follow a strict state machine:

1. **SEEKING_FUNDING**: Project is open for investment
2. **FUNDED**: Funding cap reached, awaiting escrow release approval
3. **OPERATIONAL**: Escrow released, revenue distribution active
4. **CLOSED**: Project concluded
5. **UNUSED1/UNUSED2**: Reserved for future states

## Funding & Escrow Flow

1. Factory creates project with funding cap and metadata
2. Investors call `fundProject()` with ETH, receiving position NFTs
3. When funding cap reached, project transitions to FUNDED state
4. Admin approves escrow release via factory
5. Admin or authorized party releases escrow to beneficiary
6. Project transitions to OPERATIONAL state
7. Operator (Alice) can now deposit revenue

## Revenue Distribution Formula

The platform uses an accumulator model for O(1) reward claims:

```
accRevenuePerShare += (revenueDeposit * PRECISION) / totalFunded
pendingRewards = (funded[tokenId] * accRevenuePerShare / PRECISION) - rewardDebt[tokenId]
```

Where `PRECISION = 1e18` for high-precision arithmetic.

## Security Considerations

- **Reentrancy Protection**: All external calls protected with ReentrancyGuard
- **Checks-Effects-Interactions**: Proper CEI pattern implementation
- **Access Control**: Factory-based authorization with admin roles
- **State Guards**: Strict lifecycle enforcement preventing invalid transitions
- **Overflow Protection**: SafeCast and careful arithmetic
- **Transfer Restrictions**: NFT transfers gated by factory settings

## Actors

- **Admin (BFC)**: Factory owner, approves escrow releases, manages operators
- **Investors**: Fund projects and claim revenue rewards
- **Alice (Operator)**: Deposits revenue from water sales operations
- **Factory**: Central registry and access control
- **Beneficiaries**: Receive released escrow funds

## Future Extension Hooks

The platform includes reserved functionality for future features:

- `splitPosition()`: Split position NFTs into smaller denominations
- `releaseEscrowTranche()`: Partial escrow releases
- `cancelProject()`: Project cancellation with refunds
- Multi-token support for different funding/revenue assets
- Enhanced transfer hooks and compliance features

## Usage

### Deploying a Project

```solidity
BlueFireFactory factory = BlueFireFactory(factoryAddress);
uint256 projectId = factory.createProject(
    "Water Plant #1",
    "Lagos, Nigeria", 
    "AquaGen-3000",
    1000 ether, // funding cap
    address(0) // beneficiary (defaults to admin)
);
```

### Funding a Project

```solidity
UnitProjectERC721 project = UnitProjectERC721(projectAddress);
project.fundProject{value: 10 ether}();
```

### Claiming Rewards

```solidity
uint256 pending = project.pendingRewards(tokenId);
project.claim(tokenId);
```

### Depositing Revenue (Alice)

```solidity
project.payWaterRevenue{value: 5 ether}();
```

## Testing

Run the test suite with Foundry:

```bash
forge test
forge test --gas-report
forge coverage
```

## Deployment

1. Deploy factory with admin address
2. Create projects via factory
3. Set up operators (Alice) per project
4. Configure transfer permissions as needed

## Assumptions

- Native token (ETH) used for funding and revenue in v1
- Single revenue stream per project initially
- Admin is trusted multisig (BFC)
- Operators are project-specific and trusted
- No automatic refunds on cancellation (manual admin process)
- Dust amounts in revenue distribution handled via precision model
- NFT transfer behavior: unclaimed rewards travel with token (no auto-claim)

## License

SPDX-License-Identifier: MIT 