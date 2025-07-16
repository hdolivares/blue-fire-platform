# Blue Fire Platform - Architecture Diagrams

## 🏗️ Detailed System Architecture

### High-Level System Overview
```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile App - Future]
    end
    
    subgraph "Frontend Layer (Next.js 15)"
        C[React Components]
        D[Auth Context]
        E[Role-based Routing]
        F[API Client - Axios]
        G[State Management]
    end
    
    subgraph "Backend Layer (NestJS)"
        H[API Gateway]
        I[Authentication Service]
        J[Business Logic Services]
        K[Data Access Layer]
    end
    
    subgraph "External Services"
        L[Cloudinary - File Storage]
        M[Brevo - Email Service]
        N[RSK Blockchain Network]
        O[Smart Contracts]
    end
    
    subgraph "Data Layer"
        P[MongoDB Database]
        Q[Redis Cache - Future]
    end
    
    A --> C
    B --> C
    C --> D
    C --> E
    C --> F
    F --> H
    H --> I
    H --> J
    J --> K
    K --> P
    J --> L
    J --> M
    J --> N
    N --> O
```

## 🔐 Authentication & Authorization Flow

### Complete Auth Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant E as Email Service
    
    Note over U,E: Registration Flow
    U->>F: Fill registration form
    F->>B: POST /auth/register
    B->>DB: Check email uniqueness
    B->>B: Hash password
    B->>DB: Create user record
    B-->>F: Registration success
    F-->>U: Redirect to login
    
    Note over U,E: Login Flow
    U->>F: Enter credentials
    F->>B: POST /auth/login
    B->>DB: Validate credentials
    DB-->>B: User data with roles
    B->>B: Generate JWT token
    B-->>F: JWT token + user data
    F->>F: Store token in localStorage
    F->>F: Decode user roles
    F-->>U: Redirect to role-based dashboard
    
    Note over U,E: Protected Route Access
    U->>F: Navigate to protected route
    F->>F: Check token existence
    F->>B: API request with Authorization header
    B->>B: Validate JWT token
    B->>B: Check user roles
    B-->>F: Authorized response
    F-->>U: Display protected content
```

### Role-Based Access Control
```mermaid
graph TB
    subgraph "User Authentication"
        A[User Login] --> B[JWT Token Generation]
        B --> C[Token Storage]
        C --> D[Role Extraction]
    end
    
    subgraph "Role Hierarchy"
        E[Admin Role] --> F[Full Access]
        G[Operator Role] --> H[Project Management]
        I[Investor Role] --> J[Investment Access]
    end
    
    subgraph "Route Protection"
        K[Route Request] --> L{Token Valid?}
        L -->|No| M[Redirect to Login]
        L -->|Yes| N{Has Required Role?}
        N -->|No| O[Access Denied]
        N -->|Yes| P[Allow Access]
    end
    
    D --> E
    D --> G
    D --> I
    K --> L
```

## 🛣️ API Route Structure

### Complete API Endpoint Map
```mermaid
graph TB
    subgraph "Public Routes"
        A[GET /] --> A1[Health Check]
        B[GET /projects] --> B1[List All Projects]
        C[GET /projects/:id] --> C1[Get Project Details]
        D[POST /projects] --> D1[Create Project]
        E[GET /performance/:projectId] --> E1[Get Performance Data]
    end
    
    subgraph "Authentication Routes"
        F[POST /auth/login] --> F1[User Login]
        G[POST /auth/register] --> G1[User Registration]
        H[POST /auth/forgot-password] --> H1[Password Reset Request]
        I[POST /auth/reset-password] --> I1[Password Reset]
    end
    
    subgraph "Admin Routes"
        J[GET /admin/dashboard] --> J1[Dashboard Statistics]
        K[GET /admin/investors] --> K1[All Investors]
        L[GET /admin/investments] --> L1[All Investments]
        M[GET /admin/investor-stats] --> M1[Investor Statistics]
        N[PATCH /admin/projects/:id/assign-operator] --> N1[Assign Operator]
    end
    
    subgraph "Operator Routes"
        O[GET /operators] --> O1[List Operators]
        P[GET /operators/my-project] --> P1[My Assigned Project]
    end
    
    subgraph "Investor Routes"
        Q[GET /investors/my-portfolio] --> Q1[My Portfolio]
        R[GET /investors/portfolio-summary] --> R1[Portfolio Summary]
    end
    
    subgraph "Investment Routes"
        S[POST /investments] --> S1[Log Investment]
        T[GET /investments/:projectId/claimable] --> T1[Claimable Rewards]
    end
```

## 🎨 Frontend Component Architecture

### Component Hierarchy
```mermaid
graph TB
    subgraph "Root Layout"
        A[RootLayout] --> B[AuthProvider]
        A --> C[AnimatedGradientProvider]
        A --> D[Header]
        A --> E[ClientLoadingOverlay]
        A --> F[ClientAdminBar]
    end
    
    subgraph "Authentication Components"
        G[LoginForm] --> G1[StyledInput]
        G --> G2[GlowingButton]
        H[RegistrationForm] --> H1[StyledInput]
        H --> H2[GlowingButton]
        I[ProtectedRoute] --> I1[Role Check]
    end
    
    subgraph "Dashboard Components"
        J[ProjectCard] --> J1[Project Image]
        J --> J2[Project Stats]
        K[PortfolioCard] --> K1[Investment Summary]
        L[StatCard] --> L1[Metric Display]
        M[BookingCalendar] --> M1[Date Picker]
    end
    
    subgraph "Admin Components"
        N[AdminBar] --> N1[Navigation]
        O[CreateProjectForm] --> O1[File Upload]
        O --> O2[Form Validation]
        P[ClientAdminBar] --> P1[Quick Actions]
    end
    
    subgraph "Utility Components"
        Q[LoadingOverlay] --> Q1[Spinner]
        R[UserMenu] --> R1[Profile Options]
        S[Navigation] --> S1[Menu Items]
    end
    
    B --> G
    B --> H
    B --> I
    D --> S
    D --> R
```

## 🔄 Data Flow Patterns

### Investment Process Flow
```mermaid
sequenceDiagram
    participant I as Investor
    participant F as Frontend
    participant B as Backend
    participant BC as Blockchain
    participant DB as Database
    participant C as Cloudinary
    
    Note over I,C: Project Discovery
    I->>F: Browse projects
    F->>B: GET /projects
    B->>DB: Fetch projects
    DB-->>B: Project list
    B-->>F: Projects data
    F-->>I: Display projects
    
    Note over I,C: Investment Decision
    I->>F: Select project & amount
    F->>F: Validate wallet connection
    F->>BC: Execute smart contract
    BC-->>F: Transaction hash
    F->>B: POST /investments
    B->>DB: Save investment record
    B-->>F: Investment confirmed
    F-->>I: Success notification
    
    Note over I,C: Portfolio Update
    I->>F: View portfolio
    F->>B: GET /investors/my-portfolio
    B->>DB: Fetch investments
    DB-->>B: Portfolio data
    B-->>F: Updated portfolio
    F-->>I: Display portfolio
```

### Project Management Flow
```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant B as Backend
    participant C as Cloudinary
    participant DB as Database
    participant O as Operator
    
    Note over A,O: Project Creation
    A->>F: Create project form
    F->>B: POST /projects (with images)
    B->>C: Upload images
    C-->>B: Image URLs
    B->>DB: Save project
    B-->>F: Project created
    F-->>A: Success notification
    
    Note over A,O: Operator Assignment
    A->>F: Assign operator
    F->>B: PATCH /admin/projects/:id/assign-operator
    B->>DB: Update project operator
    B-->>F: Assignment confirmed
    F-->>A: Operator assigned
    
    Note over A,O: Project Management
    O->>F: View assigned project
    F->>B: GET /operators/my-project
    B->>DB: Fetch project data
    DB-->>B: Project details
    B-->>F: Project information
    F-->>O: Display project dashboard
```

## 🗄️ Database Relationships

### Entity Relationship Diagram
```mermaid
erDiagram
    USER {
        string _id PK
        string firstName
        string lastName
        string email UK
        string country
        string walletAddress UK
        string password
        array roles
        string passwordResetToken
        date passwordResetExpires
        date createdAt
        date updatedAt
    }
    
    PROJECT {
        string _id PK
        string projectName
        number fundingGoal
        number currentFunding
        string location
        number avgHumidity
        number avgTemperature
        string imageUrl
        array imageUrls
        string status
        string operator FK
        string unitControllerAddress
        number avgDailyWaterProduction
        date waterSoldUntil
        date createdAt
        date updatedAt
    }
    
    INVESTMENT {
        string _id PK
        string user FK
        string project FK
        number amount
        date createdAt
        date updatedAt
    }
    
    PERFORMANCE_DATA {
        string _id PK
        string projectId FK
        date date
        number waterProduced
        number waterSold
        number revenue
        number expenses
        date createdAt
        date updatedAt
    }
    
    USER ||--o{ INVESTMENT : "makes"
    USER ||--o{ PROJECT : "operates"
    PROJECT ||--o{ INVESTMENT : "receives"
    PROJECT ||--o{ PERFORMANCE_DATA : "tracks"
```

## 🔧 Module Dependencies

### Backend Module Structure
```mermaid
graph TB
    subgraph "Core Modules"
        A[AppModule] --> B[CommonModule]
        A --> C[UsersModule]
        A --> D[AuthModule]
    end
    
    subgraph "Business Modules"
        A --> E[ProjectsModule]
        A --> F[InvestmentsModule]
        A --> G[PerformanceModule]
        A --> H[InvestorsModule]
    end
    
    subgraph "Admin Modules"
        A --> I[AdminModule]
        A --> J[OperatorsModule]
    end
    
    subgraph "External Integrations"
        A --> K[EmailModule]
        A --> L[CloudinaryModule]
    end
    
    subgraph "Dependencies"
        D --> C
        E --> C
        F --> C
        G --> E
        H --> C
        I --> C
        J --> C
        K --> C
        L --> E
    end
```

## 🚀 Deployment Architecture

### Production Deployment Flow
```mermaid
graph TB
    subgraph "Development"
        A[Local Development] --> B[Git Repository]
    end
    
    subgraph "CI/CD Pipeline"
        B --> C[Code Review]
        C --> D[Automated Testing]
        D --> E[Build Process]
    end
    
    subgraph "Infrastructure"
        E --> F[Container Build]
        F --> G[Image Registry]
        G --> H[Load Balancer]
    end
    
    subgraph "Services"
        H --> I[Frontend Container]
        H --> J[Backend Container]
        H --> K[Database Cluster]
        H --> L[Redis Cache]
    end
    
    subgraph "External Services"
        I --> M[Cloudinary]
        J --> N[Brevo Email]
        J --> O[RSK Blockchain]
    end
```

## 📊 Performance Monitoring

### System Monitoring Architecture
```mermaid
graph TB
    subgraph "Application Layer"
        A[Frontend App] --> B[Backend API]
        B --> C[Database]
    end
    
    subgraph "Monitoring Tools"
        D[Error Tracking] --> A
        E[Performance Monitoring] --> B
        F[Database Monitoring] --> C
        G[Log Aggregation] --> B
    end
    
    subgraph "Alerts & Notifications"
        H[Error Alerts] --> I[Team Notifications]
        J[Performance Alerts] --> I
        K[Security Alerts] --> I
    end
    
    subgraph "Analytics"
        L[User Analytics] --> A
        M[Business Metrics] --> B
        N[System Health] --> C
    end
```

---

These diagrams provide a comprehensive view of the Blue Fire Platform's architecture, showing the relationships between components, data flows, and system interactions. Each diagram focuses on a specific aspect of the system to help understand the overall design and implementation. 