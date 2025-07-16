# Blue Fire Platform - Developer Quick Reference

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- Git

### Setup Commands
```bash
# Clone and setup
git clone <repository>
cd blue-fire-platform

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure environment variables
npm run start:dev

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev
```

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=mongodb://localhost:27017/blue-fire
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
PORT=3001

# External services
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
BREVO_API_KEY=your-brevo-key

# Blockchain
STAKING_VAULT_ADDRESS=contract-address
UNIT_CONTROLLER_ADDRESS=contract-address
```

---

## 🛠️ Development Commands

### Backend
```bash
npm run start:dev      # Development server with hot reload
npm run build          # Build for production
npm run start:prod     # Start production server
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run seed           # Seed database with sample data
npm run lint           # Lint code
npm run format         # Format code with Prettier
```

### Frontend
```bash
npm run dev            # Development server with Turbopack
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Lint code
```

---

## 📁 Project Structure

### Backend Structure
```
backend/src/
├── auth/              # Authentication & authorization
├── users/             # User management
├── projects/          # Project management
├── investments/       # Investment tracking
├── performance/       # Performance data
├── admin/             # Admin functionality
├── operators/         # Operator management
├── investors/         # Investor functionality
├── email/             # Email service
├── cloudinary/        # File upload service
├── common/            # Shared utilities
└── contracts/         # Smart contract ABIs
```

### Frontend Structure
```
frontend/src/
├── app/               # Next.js App Router pages
├── components/        # Reusable React components
├── context/           # React Context providers
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── types/             # TypeScript type definitions
└── contracts/         # Smart contract configurations
```

---

## 🔐 Authentication & Roles

### User Roles
- **Admin**: Full platform access
- **Operator**: Project management
- **Investor**: Investment access

### Role Decorators
```typescript
// Backend - Controller level
@AdminOnly()
@OperatorOnly()
@InvestorOnly()
@AdminOrOperator()

// Frontend - Component level
const { isAdmin, isOperator, isInvestor } = useRoles();
```

### Protected Routes
```typescript
// Backend
@Auth('Admin')  // Requires Admin role
@Public()       // Public access

// Frontend
<ProtectedRoute roles={['Admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

---

## 🛣️ API Endpoints Quick Reference

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

---

## 🗄️ Database Models

### User Schema
```typescript
{
  firstName: string;
  lastName: string;
  email: string;           // Unique
  country: string;
  walletAddress: string;   // Unique
  password: string;        // Hashed
  roles: string[];         // ['Admin', 'Operator', 'Investor']
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}
```

### Project Schema
```typescript
{
  projectName: string;
  fundingGoal: number;
  currentFunding: number;
  location: string;
  avgHumidity: number;
  avgTemperature: number;
  imageUrl: string;
  imageUrls: string[];
  status: 'SEEKING_FUNDING' | 'OPERATIONAL' | 'COMPLETED';
  operator?: User;         // Reference
  unitControllerAddress?: string;
  avgDailyWaterProduction: number;
  waterSoldUntil?: Date;
}
```

### Investment Schema
```typescript
{
  user: string;            // User reference
  project: string;         // Project reference
  amount: number;
}
```

---

## 🔧 Common Patterns

### Backend Service Pattern
```typescript
@Injectable()
export class ExampleService {
  constructor(
    @InjectModel(Example.name) private exampleModel: Model<Example>,
    private configService: ConfigService,
  ) {}

  async create(createDto: CreateExampleDto): Promise<Example> {
    const newExample = new this.exampleModel(createDto);
    return newExample.save();
  }

  async findAll(): Promise<Example[]> {
    return this.exampleModel.find().exec();
  }

  async findById(id: string): Promise<Example> {
    const example = await this.exampleModel.findById(id).exec();
    if (!example) {
      throw new NotFoundException(`Example with ID "${id}" not found`);
    }
    return example;
  }
}
```

### Frontend Component Pattern
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRoles } from '@/hooks/useRoles';

interface ComponentProps {
  // Props interface
}

export default function ExampleComponent({ }: ComponentProps) {
  const { user, token } = useAuth();
  const { isAdmin, isOperator } = useRoles();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

---

## 🔗 External Integrations

### Cloudinary (File Upload)
```typescript
// Backend
@Post('upload')
@UseInterceptors(FilesInterceptor('images'))
async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
  const urls = [];
  for (const file of files) {
    const result = await this.cloudinaryService.uploadImage(file);
    urls.push(result.secure_url);
  }
  return urls;
}
```

### Blockchain Integration
```typescript
// Smart contract interaction
const provider = new ethers.JsonRpcProvider('https://public-node.testnet.rsk.co');
const contract = new ethers.Contract(address, abi, provider);
const result = await contract.methodName(params);
```

### Email Service
```typescript
// Send email
await this.emailService.sendPasswordReset(email, resetToken);
```

---

## 🧪 Testing

### Backend Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test specific file
npm run test -- auth.service.spec.ts
```

### Frontend Testing
```bash
# Run tests (when configured)
npm run test

# Test specific component
npm run test -- ComponentName.test.tsx
```

---

## 🐛 Debugging

### Backend Debugging
```bash
# Debug mode
npm run start:debug

# Logs
console.log('Debug info');
this.logger.debug('Debug message');
this.logger.error('Error message', error.stack);
```

### Frontend Debugging
```bash
# Browser dev tools
console.log('Debug info');

# React dev tools
# Install React Developer Tools extension
```

---

## 📦 Deployment

### Backend Deployment
```bash
# Build
npm run build

# Start production
npm run start:prod

# Environment variables required
DATABASE_URL=
JWT_SECRET=
FRONTEND_URL=
```

### Frontend Deployment
```bash
# Build
npm run build

# Start production
npm run start

# Environment variables
NEXT_PUBLIC_API_URL=
```

---

## 🔍 Common Issues & Solutions

### CORS Issues
```typescript
// Backend - main.ts
app.enableCors({
  origin: configService.get('FRONTEND_URL'),
  credentials: true,
});
```

### Authentication Issues
```typescript
// Check token in localStorage
const token = localStorage.getItem('token');

// Verify token format
const payload = JSON.parse(atob(token.split('.')[1]));
```

### Database Connection
```typescript
// Check MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});
```

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

This quick reference provides essential information for developers working on the Blue Fire Platform. For detailed information, refer to the main project overview and architecture diagrams. 