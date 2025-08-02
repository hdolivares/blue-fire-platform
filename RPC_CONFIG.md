# RPC URL Configuration

This project now supports configurable RPC URLs through environment variables for easy network switching.

## Frontend Configuration

Create a `.env.local` file in the `frontend/` directory:

```env
# Blue Fire Platform Environment Configuration

# Blockchain RPC URL - Change this to switch networks easily
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.rootstock.io/pcUMq8MauxoiT8suuCGXZaB8DA2vYD-T

# Other blockchain configuration (optional overrides)
# NEXT_PUBLIC_CHAIN_ID=31
# NEXT_PUBLIC_FACTORY_ADDRESS=0x9f715843A5bcF6d8afBa99FAed3d8F5634a3310b
```

## Backend Configuration

Set environment variables for the backend (or add to your `.env` file):

```env
# Backend RPC URL
BLOCKCHAIN_RPC_URL=https://rpc.testnet.rootstock.io/pcUMq8MauxoiT8suuCGXZaB8DA2vYD-T

# Other backend config
BLUE_FIRE_FACTORY_ADDRESS=0x9f715843A5bcF6d8afBa99FAed3d8F5634a3310b
BLOCKCHAIN_CHAIN_ID=31
```

## How It Works

### Frontend
- `frontend/src/config/blockchain.ts` - Contains the RPC URL configuration
- Reads from `NEXT_PUBLIC_RPC_URL` environment variable
- Falls back to the default RSK Testnet URL if not set

### Backend
- `backend/src/config/blockchain.ts` - Contains the RPC URL configuration
- Reads from `BLOCKCHAIN_RPC_URL` environment variable
- Falls back to the default RSK Testnet URL if not set

## Switching Networks

To switch to a different network:

1. **Update RPC URL**: Change the `NEXT_PUBLIC_RPC_URL` and `BLOCKCHAIN_RPC_URL` variables
2. **Update Chain ID**: Set `NEXT_PUBLIC_CHAIN_ID` and `BLOCKCHAIN_CHAIN_ID` if needed
3. **Update Contract Addresses**: Set factory address if deploying to a new network
4. **Restart**: Restart both frontend and backend to pick up new environment variables

## Example Network Configurations

### RSK Testnet (Current)
```env
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.rootstock.io/pcUMq8MauxoiT8suuCGXZaB8DA2vYD-T
NEXT_PUBLIC_CHAIN_ID=31
```

### Local Anvil (Development)
```env
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=31337
```

### RSK Mainnet (Production)
```env
NEXT_PUBLIC_RPC_URL=https://public-node.rsk.co
NEXT_PUBLIC_CHAIN_ID=30
``` 