# Local Testing Guide - Blue Fire Platform

## 🚀 **Quick Setup (One-Time)**

### **1. Start Anvil (Local Blockchain)**
```bash
# Start anvil with pre-funded accounts
anvil --port 8545 --accounts 10 --balance 10000 --host 0.0.0.0
```

**Anvil provides:**
- ✅ **10 test accounts** with 10,000 ETH each
- ✅ **Instant block mining** (no waiting)  
- ✅ **Predictable addresses** and private keys
- ✅ **Chain ID 31337** (localhost)
- ✅ **Compatible with MetaMask** and all Web3 wallets

### **2. Deploy Contracts**
```bash
# Deploy factory and create test project
forge script script/DeployLocal.s.sol --rpc-url http://localhost:8545 --broadcast
```

### **3. Test Complete User Flows**
```bash
# Run full integration test (funding → escrow → revenue → claims)
forge script script/TestInteractions.s.sol --rpc-url http://localhost:8545 --broadcast
```

## 📋 **Test Account Setup**

After deployment, you'll have these **ready-to-use test accounts**:

| Role | Address | Private Key | Purpose |
|------|---------|-------------|---------|
| **Admin** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec...` | Create projects, manage escrow |
| **Investor 1** | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e9...` | Fund projects, claim rewards |  
| **Investor 2** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111af...` | Fund projects, claim rewards |
| **Alice** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111af...` | Deposit machine revenue |

## 🔗 **Frontend Integration**

### **MetaMask Setup**
```
Network Name: Anvil Local
RPC URL: http://localhost:8545  
Chain ID: 31337
Currency Symbol: ETH
```

### **Web3 Connection (ethers.js)**
```javascript
// Connect to local anvil
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

// Contract addresses (from deployment)
const FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const PROJECT_ADDRESS = "0xCafac3dD18aC6c6e92c921884f9E4176737C052c";

// Connect contracts
const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
const project = new ethers.Contract(PROJECT_ADDRESS, PROJECT_ABI, provider);
```

### **Test User Interactions**
```javascript
// Connect investor wallet  
const signer = provider.getSigner("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
const projectWithSigner = project.connect(signer);

// Fund project (30% of 100 ETH cap)
const tx = await projectWithSigner.fundProject({ 
  value: ethers.utils.parseEther("30") 
});
await tx.wait();

// Check pending rewards
const pending = await project.pendingRewards(0);
console.log("Pending rewards:", ethers.utils.formatEther(pending), "ETH");

// Claim rewards
const claimTx = await projectWithSigner.claim(0);
await claimTx.wait();
```

## 🔄 **Testing Workflows**

### **Complete Investment Flow**
```bash
# 1. Deploy contracts
forge script script/DeployLocal.s.sol --rpc-url http://localhost:8545 --broadcast

# 2. Test all user interactions
forge script script/TestInteractions.s.sol --rpc-url http://localhost:8545 --broadcast

# Expected output:
# ✅ Investor 1 funds 30 ETH → receives NFT token ID 0
# ✅ Investor 2 funds 70 ETH → receives NFT token ID 1  
# ✅ Project transitions to FUNDED state automatically
# ✅ Admin releases 100 ETH escrow to beneficiary
# ✅ Alice deposits 20 ETH revenue
# ✅ Investor 1 claims 6 ETH (30% of 20 ETH)
# ✅ Investor 2 claims 14 ETH (70% of 20 ETH)
```

### **Reset for Fresh Testing**
```bash
# Kill anvil
pkill anvil

# Restart with fresh state
anvil --port 8545 --accounts 10 --balance 10000 --host 0.0.0.0

# Re-deploy contracts
forge script script/DeployLocal.s.sol --rpc-url http://localhost:8545 --broadcast
```

## 🧪 **Testing Specific Features**

### **Test Revenue Distribution**
```bash
# Deploy first
forge script script/DeployLocal.s.sol --rpc-url http://localhost:8545 --broadcast

# Then test just funding + revenue
cast send 0xCafac3dD18aC6c6e92c921884f9E4176737C052c \
  "fundProject()" \
  --value 30ether \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://localhost:8545
```

### **Test State Transitions**
```bash
# Check project state
cast call 0xCafac3dD18aC6c6e92c921884f9E4176737C052c "state()" --rpc-url http://localhost:8545

# States: 0=SEEKING_FUNDING, 1=FUNDED, 2=OPERATIONAL, 3=CLOSED
```

### **Test Error Conditions**
```bash
# Try to fund more than cap (should fail)
cast send 0xCafac3dD18aC6c6e92c921884f9E4176737C052c \
  "fundProject()" \
  --value 101ether \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://localhost:8545
# Expected: "CAP" error
```

## 🔧 **Alternative Testing Options**

### **1. Hardhat Network** (Alternative to Anvil)
```bash
# If you prefer Hardhat
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers

# Start Hardhat node
npx hardhat node

# Deploy to Hardhat (same as anvil)
forge script script/DeployLocal.s.sol --rpc-url http://localhost:8545 --broadcast
```

### **2. Testnet Deployment**
```bash
# Deploy to Sepolia testnet
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.infura.io/v3/YOUR_KEY \
  --private-key YOUR_PRIVATE_KEY \
  --broadcast \
  --verify
```

### **3. Mainnet Fork Testing**
```bash
# Fork mainnet for realistic testing
anvil --fork-url https://mainnet.infura.io/v3/YOUR_KEY --port 8545
```

## 📊 **Monitoring & Debugging**

### **View All Events**
```bash
# Get all events from a transaction
cast receipt 0x[TX_HASH] --rpc-url http://localhost:8545
```

### **Check Account Balances**
```bash
# Check ETH balance
cast balance 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --rpc-url http://localhost:8545

# Check NFT ownership  
cast call 0xCafac3dD18aC6c6e92c921884f9E4176737C052c \
  "ownerOf(uint256)" 0 \
  --rpc-url http://localhost:8545
```

### **Real-Time Event Monitoring**
```bash
# Watch for funding events
cast logs \
  --address 0xCafac3dD18aC6c6e92c921884f9E4176737C052c \
  --sig "FundingReceived(uint256,address,uint256,uint256,uint256)" \
  --rpc-url http://localhost:8545
```

## ⚡ **Performance Tips**

- **Fast iterations**: Anvil mines blocks instantly
- **Predictable state**: Same addresses and keys every restart  
- **No gas costs**: Unlimited ETH for testing
- **Easy reset**: Kill and restart anvil for fresh state
- **Real Web3**: Full compatibility with production tools

## 🎯 **Integration Testing Checklist**

✅ **Admin can create projects**
✅ **Investors can fund and receive NFTs** 
✅ **Funding progress updates in real-time**
✅ **Escrow release works (two-step process)**
✅ **Revenue distributes proportionally**
✅ **Claims transfer correct ETH amounts**
✅ **NFT transfers work when enabled**
✅ **Error handling works for edge cases**
✅ **Events emit correctly for UI updates**
✅ **Gas usage is reasonable**

---

**Anvil + Forge = Fastest way to test contract interactions after integration!** 🚀 