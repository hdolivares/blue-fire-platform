# Blue Fire Platform

A **blockchain-based water production investment platform** that enables investors to fund water production machines while providing operators with tools to manage projects and track performance. Built with modern web technologies and deployed on RSK blockchain.

## 🎯 Overview

Blue Fire Platform is a **DeFi platform for water infrastructure funding** where each physical water machine maps 1:1 to an isolated blockchain smart contract. Investors purchase ERC-721 NFT position tokens to fund projects and receive pro-rata revenue distributions from water sales.

### Key Features

- **🌊 Water Infrastructure Funding**: Fund water production machines through blockchain
- **🎫 NFT Position Tokens**: ERC-721 tokens representing investment positions
- **📊 Real-time Performance Tracking**: Monitor project performance and revenue
- **👥 Multi-role System**: Admin, Operator, and Investor dashboards
- **🔐 Secure Authentication**: JWT-based authentication with role-based access
- **📱 Modern UI/UX**: Responsive design with smooth animations
- **⚡ Blockchain Integration**: Direct smart contract interaction
- **📧 Email Notifications**: Automated notifications via Brevo
- **📁 File Management**: Cloud storage via Cloudinary

## 🏗️ Architecture

### Tech Stack

#### Backend
- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js
- **File Storage**: Cloudinary
- **Email Service**: Brevo (formerly Sendinblue)
- **Blockchain**: Ethers.js v6

#### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Lottie Web
- **Charts**: Chart.js with React wrapper
- **State Management**: React Context API

#### Blockchain
- **Network**: RSK Testnet (Chain ID: 31)
- **Language**: Solidity ^0.8.20
- **Framework**: Foundry
- **Contracts**: BlueFireFactory + UnitProjectERC721

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd blue-fire-platform
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run start:dev
```

3. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Environment Configuration**

Create `.env` file in the `backend` directory:
```bash
# Database
DATABASE_URL=mongodb://localhost:27017/blue-fire

# Authentication
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000

# External Services
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
BREVO_API_KEY=your-brevo-key

# Blockchain
BLOCKCHAIN_RPC_URL=https://rpc.testnet.rootstock.io/3hsyiYuxA5dnq4wRX8fvq2PiU6JBjm-T
STAKING_VAULT_ADDRESS=contract-address
UNIT_CONTROLLER_ADDRESS=contract-address
```

### Development Commands

#### Backend
```bash
npm run start:dev      # Development server with hot reload
npm run build          # Build for production
npm run start:prod     # Start production server
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run seed           # Seed database with sample data
```

#### Frontend
```bash
npm run dev            # Development server with Turbopack
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Lint code
```

#### Smart Contracts
```bash
cd contracts
forge test             # Run tests
forge test --gas-report # Gas optimization report
forge coverage         # Test coverage
```

## 🔐 User Roles & Capabilities

### 👨‍💼 Admin
- **Project Creation**: Create and manage water machine projects
- **User Management**: Manage users and assign roles
- **Analytics Dashboard**: Comprehensive platform analytics
- **Blockchain Deployment**: Deploy projects to blockchain
- **Operator Assignment**: Assign operators to projects
- **Investor Management**: Track and manage all investors
- **Escrow Management**: Control fund releases via two-step process

### 💰 Investor
- **Project Discovery**: Browse and filter available projects
- **Investment Management**: Fund projects and track portfolio
- **Performance Monitoring**: View project performance and returns
- **Revenue Claims**: Claim earned rewards from water sales
- **NFT Management**: Manage position tokens (transfer when enabled)

### 🔧 Operator (Alice)
- **Project Management**: View assigned projects and details
- **Performance Reporting**: Submit performance data and metrics
- **Revenue Deposits**: Deposit water sales revenue to blockchain
- **Request System**: Submit requests for resources and support

## 🔗 Blockchain Integration

### Smart Contract Architecture

The platform uses two main contracts:

1. **BlueFireFactory**: Central factory that deploys project instances
2. **UnitProjectERC721**: Individual project contracts with ERC-721 NFT positions

### Project Lifecycle

```
SEEKING_FUNDING → FUNDED → OPERATIONAL → CLOSED
```

1. **SEEKING_FUNDING**: Project is open for investment
2. **FUNDED**: Funding cap reached, awaiting escrow release
3. **OPERATIONAL**: Revenue distribution active
4. **CLOSED**: Project concluded

### Revenue Distribution

Uses an accumulator model for O(1) reward claims:
```
accRevenuePerShare += (revenueDeposit * PRECISION) / totalFunded
pendingRewards = (funded[tokenId] * accRevenuePerShare / PRECISION) - rewardDebt[tokenId]
```

### Network Configuration

- **Network**: RSK Testnet
- **Chain ID**: 31
- **RPC URL**: `https://rpc.testnet.rootstock.io/3hsyiYuxA5dnq4wRX8fvq2PiU6JBjm-T`

## 📁 Project Structure

```
blue-fire-platform/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication
│   │   ├── users/          # User management
│   │   ├── projects/       # Project management
│   │   ├── investments/    # Investment tracking
│   │   ├── performance/    # Performance data
│   │   ├── admin/          # Admin functionality
│   │   ├── operators/      # Operator management
│   │   ├── investors/      # Investor functionality
│   │   ├── email/          # Email service
│   │   ├── cloudinary/     # File upload service
│   │   └── services/       # Blockchain service
│   └── package.json
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utility libraries
│   │   └── types/         # TypeScript definitions
│   └── package.json
├── contracts/              # Smart contracts
│   ├── contracts/
│   │   ├── BlueFireFactory.sol
│   │   ├── UnitProjectERC721.sol
│   │   └── interfaces/
│   ├── test/              # Test files
│   └── foundry.toml
└── README.md
```

## 🛣️ API Endpoints

### Authentication
```http
POST /auth/login              # User login
POST /auth/register           # User registration
POST /auth/forgot-password    # Password reset request
POST /auth/reset-password     # Password reset
```

### Projects (Public)
```http
GET  /projects               # List all projects
GET  /projects/:id           # Get project details
POST /projects               # Create project (Admin only)
GET  /performance/:projectId # Get performance data
```

### Admin Routes
```http
GET    /admin/dashboard                           # Dashboard stats
GET    /admin/investors                          # All investors
GET    /admin/investments                        # All investments
GET    /admin/investor-stats                     # Investor statistics
PATCH  /admin/projects/:id/assign-operator       # Assign operator
```

### Investor Routes
```http
GET /investors/my-portfolio      # My portfolio
GET /investors/portfolio-summary # Portfolio summary
POST /investments                # Log investment
GET /investments/:id/claimable   # Claimable rewards
```

### Operator Routes
```http
GET /operators           # List operators (Admin only)
GET /operators/my-project # My assigned project
```

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
forge test             # Run all tests
forge test --gas-report # Gas optimization
forge coverage         # Coverage report
```

### Backend
```bash
cd backend
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
```

### Test Coverage
- **Smart Contracts**: 100% coverage (97 tests)
- **Backend**: ~60% coverage
- **Frontend**: Manual testing

## 🚀 Deployment

### Production Setup

1. **Environment Variables**: Configure production environment variables
2. **Database**: Set up production MongoDB instance
3. **File Storage**: Configure Cloudinary for production
4. **Email Service**: Set up Brevo for production
5. **Blockchain**: Deploy contracts to RSK Mainnet

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### SSL Configuration

The project includes SSL setup scripts and nginx configuration for secure deployment.

## 📊 Development Status

- **Backend**: ~95% Complete
- **Frontend**: ~90% Complete  
- **Smart Contracts**: 100% Complete & Tested
- **Integration**: ~80% Complete
- **Testing**: 100% (Smart Contracts), ~60% (Backend/Frontend)

## 🔮 Roadmap

### Planned Features
- **Real-time Notifications**: WebSocket integration
- **Mobile Application**: Native mobile app
- **Advanced Analytics**: Enhanced reporting and insights
- **Multi-language Support**: Internationalization
- **API Documentation**: Swagger/OpenAPI documentation
- **Automated Testing**: E2E test suite
- **Caching Layer**: Redis integration
- **Microservices**: Modular architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the architecture diagrams in `ARCHITECTURE_DIAGRAMS.md`

## 🙏 Acknowledgments

- Built with modern web technologies
- Powered by RSK blockchain
- Integrated with Cloudinary and Brevo services

---

**Blue Fire Platform** - Revolutionizing water infrastructure funding through blockchain technology.