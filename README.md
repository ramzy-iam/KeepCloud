# KeepCloud

<div align="center">
  <img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45" alt="Nx logo">
  <h3>Modern Cloud Storage Platform</h3>
  <p>A full-stack cloud storage solution built with NestJS, React, and AWS</p>
</div>

---

## 🚀 Overview

KeepCloud is a modern, scalable cloud storage platform that provides secure file management, sharing, and organization capabilities. Built with a microservices architecture using NestJS for the backend and React for the frontend, all orchestrated within an Nx monorepo.

### ✨ Key Features

- **📁 File Management**: Upload, organize, and manage files with nested folder structures
- **🗑️ Trash System**: Soft delete with restoration capabilities
- **🔍 Smart Search**: Find files and folders with intelligent suggestions
- **👥 Sharing**: Share files and folders with other users
- **🏷️ File Organization**: Automatic file categorization and tagging
- **📊 Storage Analytics**: Track usage and manage storage limits
- **🔐 Authentication**: Secure Google OAuth integration
- **☁️ AWS Integration**: Leverages S3 for storage and SQS for background processing
- **📱 Responsive UI**: Modern interface built with Tailwind CSS and Radix UI

## 🏗️ Architecture

### Applications

- **`apps/api`**: NestJS backend API with serverless deployment support
- **`apps/web`**: React frontend application with React Router

### Core Libraries

- **`libs/core/db`**: Database layer with Prisma ORM and TypeORM
- **`libs/core/services`**: Business logic and service layer
- **`libs/core/web/react`**: Shared React components and utilities
- **`libs/commons`**: Shared utilities, DTOs, and constants
- **`libs/storage/api`**: Storage-specific API endpoints
- **`libs/files/api`**: File management API endpoints
- **`libs/iam/api`**: Identity and Access Management
- **`libs/processors`**: Background job processors

## 🛠️ Technology Stack

### Backend

- **Framework**: NestJS with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Google OAuth
- **Cloud Storage**: AWS S3
- **Queue Management**: BullMQ with Redis
- **Background Jobs**: AWS SQS
- **Logging**: Winston

### Frontend

- **Framework**: React 19 with React Router 7
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **State Management**: Jotai
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form with Zod validation

### DevOps & Deployment

- **Monorepo**: Nx workspace
- **Deployment**: Serverless Framework
- **Testing**: Jest with React Testing Library
- **Linting**: ESLint with TypeScript support
- **Bundling**: Vite for frontend, Webpack for backend

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- AWS Account (S3 & SQS)
- Google OAuth credentials

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd KeepCloud
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Configure your environment variables
   # - Database connection
   # - AWS credentials
   # - Google OAuth keys
   # - Redis connection
   ```

4. **Database Setup**

   ```bash
   # Run migrations
   npx prisma migrate dev

   # Seed the database
   npx prisma db seed
   ```

## 🏃‍♂️ Development

### Start Development Servers

**Backend API:**

```bash
npx nx serve api
```

**Frontend Web App:**

```bash
npx nx serve web
```

**View All Available Tasks:**

```bash
npx nx show project api
npx nx show project web
```

### Building for Production

**Build API:**

```bash
npx nx build api
```

**Build Web App:**

```bash
npx nx build web
```

### Testing

**Run All Tests:**

```bash
npx nx test
```

**Run Specific Project Tests:**

```bash
npx nx test core-services
npx nx test web
```

### Database Operations

**Generate Prisma Client:**

```bash
npx prisma generate
```

**Run Migrations:**

```bash
npx prisma migrate dev
```

**View Database:**

```bash
npx prisma studio
```

## 📊 Project Structure

```
KeepCloud/
├── apps/
│   ├── api/                    # NestJS Backend API
│   ├── api-e2e/               # End-to-end tests for API
│   └── web/                   # React Frontend Application
├── libs/
│   ├── commons/               # Shared utilities and constants
│   │   └── backend/           # Backend-specific common utilities
│   ├── core/
│   │   ├── db/                # Database layer (Prisma/TypeORM)
│   │   ├── services/          # Business logic services
│   │   └── web/react/         # React-specific utilities
│   ├── files/api/             # File management API
│   ├── iam/api/               # Identity & Access Management
│   ├── processors/            # Background job processors
│   └── storage/api/           # Storage-specific API endpoints
└── scripts/                   # Build and deployment scripts
```

## 🔧 Key Components

### Storage System

- **Nested Set Model**: Efficient hierarchical file/folder organization
- **S3 Integration**: Secure cloud storage with presigned URLs
- **File Processing**: Background jobs for file operations
- **Trash Management**: Soft delete with restoration capabilities

### Authentication & Security

- **Google OAuth**: Secure authentication flow
- **JWT Tokens**: Stateless session management
- **User Storage Limits**: Configurable storage quotas
- **File Access Control**: Secure file sharing and permissions

### Background Processing

- **Queue System**: Redis-backed job processing with BullMQ
- **File Operations**: Async file uploads, moves, and deletions
- **Storage Cleanup**: Automated cleanup of orphaned files
- **Tag Management**: Automatic file metadata extraction

## 🚀 Deployment

### Serverless Deployment (AWS)

The API is configured for serverless deployment using the Serverless Framework:

```bash
# Deploy to staging
serverless deploy --stage staging

# Deploy to production
serverless deploy --stage production
```

### Environment Configuration

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://..."

# AWS
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
FILE_BUCKET="keepcloud-files"
SQS_QUEUE_URL="..."

# Authentication
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
JWT_SECRET="..."

# Redis
REDIS_URL="redis://..."

# Application
LOG_LEVEL="info"
NODE_ENV="production"
```

### Docker Support

```bash
# Start services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📈 Monitoring & Logging

- **Structured Logging**: Winston-based logging with multiple transports
- **Error Tracking**: Comprehensive error handling and reporting
- **Performance Monitoring**: Built-in metrics and health checks
- **Queue Monitoring**: Job processing status and failure handling

## 🧪 Testing Strategy

- **Unit Tests**: Jest for service and utility testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full application flow testing
- **Component Tests**: React component testing with Testing Library

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Core Endpoints

**Authentication:**

- `POST /auth/google` - Google OAuth login
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/profile` - Get user profile

**Storage:**

- `GET /storage/my-storage` - Get user's root files/folders
- `GET /storage/trash` - Get trashed items
- `POST /storage/resources/:id/trash` - Move to trash
- `POST /storage/resources/:id/restore` - Restore from trash
- `PATCH /storage/resources/:id/rename` - Rename file/folder

**Files:**

- `POST /files/presigned-post` - Get upload URL
- `POST /files` - Create file record
- `GET /files/:id/download` - Download file
- `DELETE /files/:id` - Delete file

## 🔐 Security Features

- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **File Upload Security**: Presigned URLs and content type validation
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 📚 Additional Resources

- [Nx Documentation](https://nx.dev) - Monorepo management
- [NestJS Documentation](https://nestjs.com) - Backend framework
- [React Router Documentation](https://reactrouter.com) - Frontend routing
- [Prisma Documentation](https://prisma.io) - Database ORM
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/) - Cloud storage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ using modern web technologies</p>
</div>
