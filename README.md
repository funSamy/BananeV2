# 🍌 BananeV2 - Gestion de Production de Bananes

A comprehensive production management system for banana cultivation, built as an integrated Progressive Web Application (PWA) with NestJS backend and React frontend.

## 🎯 Overview

BananeV2 is a single-server application that combines:

- **Backend API** (NestJS + Prisma + PostgreSQL/SQLite)
- **Frontend SPA** (React + Vite + TanStack Query)
- **PWA Support** (Offline-first, installable)
- **Windows Service** (Auto-start on system boot)

## 🚀 Quick Start

### Option 1: Use the Deployment Script (Recommended)

```powershell
# Run the interactive deployment script
.\deploy.ps1
```

This provides a menu-driven interface for:

- Building the application
- Installing/managing Windows service
- Running in development mode

### Option 2: Manual Commands

#### Development Mode

```powershell
# Terminal 1 - Backend
cd backend
yarn install
yarn start:dev

# Terminal 2 - Frontend
cd frontend
yarn install
yarn dev
```

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:1965/api/v1>

#### Production Build & Deploy

```powershell
# Build everything
cd backend
yarn build:full

# Start as service (requires Admin)
yarn service:install
yarn service:start
```

- Application: <http://localhost:1965>

## 📁 Project Structure

```
BananeV2/
├── backend/              # NestJS API server
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── users/       # User management
│   │   ├── production/  # Production tracking
│   │   ├── analytics/   # Analytics & reporting
│   │   └── service/     # Windows service setup
│   └── prisma/          # Database schema & migrations
│
├── frontend/            # React SPA
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities & API
│   └── public/          # Static assets
│
├── deploy.ps1           # Deployment script
└── DEPLOYMENT_GUIDE.md  # Detailed setup guide
```

## 🔑 Key Features

### Backend

- ✅ RESTful API with versioning (`/api/v1`)
- ✅ JWT authentication with OTP
- ✅ Role-based access control
- ✅ Prisma ORM with migrations
- ✅ Global error handling
- ✅ Request/Response interceptors
- ✅ Comprehensive testing

### Frontend

- ✅ Progressive Web App (PWA)
- ✅ Offline support
- ✅ Installable on desktop/mobile
- ✅ Responsive design
- ✅ Multi-language support (i18n)
- ✅ Dark/Light theme
- ✅ React Hook Form + Zod validation
- ✅ TanStack Query for data fetching

### Deployment

- ✅ Single-server architecture
- ✅ Windows Service integration
- ✅ Auto-start on system boot
- ✅ Production-ready builds
- ✅ Easy update mechanism

## 🛠️ Technology Stack

### Backend

- **Framework**: NestJS 10
- **Database**: Prisma + SQLite/PostgreSQL
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **OTP**: Speakeasy

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite 6
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v7
- **Charts**: Recharts
- **PWA**: Vite PWA Plugin

### DevOps

- **Service Management**: node-windows
- **Package Manager**: Yarn
- **Testing**: Jest + Supertest

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **Yarn**: Latest version
- **Windows OS**: For service functionality
- **Admin Rights**: For service installation

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)

```env
PORT=1965
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="7d"
NODE_ENV="production"
```

#### Frontend (`frontend/.env.production`)

```env
VITE_API_URL=/api/v1
```

## 📦 Service Management

### Install Service (Run as Administrator)

```powershell
cd backend
yarn service:install
```

### Control Service

```powershell
yarn service:start    # Start service
yarn service:stop     # Stop service
yarn service:restart  # Restart service
yarn service:uninstall # Remove service (Admin required)
```

### View Service

- Open Windows Services: `services.msc`
- Look for: **BananeV2 Production Manager**

## 🧪 Testing

### Backend Tests

```powershell
cd backend

# Unit tests
yarn test

# Watch mode
yarn test:watch

# Coverage
yarn test:cov

# Integration tests
yarn test:integration
```

### Frontend Tests

```powershell
cd frontend
yarn test
```

## 📖 Documentation

- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Frontend Docs](frontend/docs/)** - Frontend-specific documentation
- **[Backend API](backend/README.md)** - API documentation

## 🔄 Update Process

When making changes:

1. Stop the service:

   ```powershell
   cd backend
   yarn service:stop
   ```

2. Build updates:

   ```powershell
   yarn build:full
   ```

3. Restart service:

   ```powershell
   yarn service:start
   ```

Or use the script:

```powershell
.\deploy.ps1
# Choose option 7 (Restart Service)
```

## 🔐 Security Notes

For production deployment:

- ✅ Change default JWT_SECRET
- ✅ Use strong database passwords
- ✅ Enable HTTPS (via reverse proxy)
- ✅ Configure firewall rules
- ✅ Regular security updates
- ✅ Implement rate limiting
- ✅ Set up monitoring

## 🐛 Troubleshooting

### Service won't start

- Check logs: `C:\ProgramData\BananeV2 Production Manager\daemon\`
- Verify port availability: `netstat -ano | findstr :1965`
- Ensure build completed: Check `backend\dist` folder

### Frontend not loading

- Verify build exists: `ls frontend\dist`
- Rebuild: `cd frontend && yarn build:production`
- Restart service

### Database errors

- Run migrations: `cd backend && yarn migrate`
- Check DATABASE_URL in `.env`

### PWA not installing

- Use HTTPS in production
- Check manifest configuration
- Verify service worker registration

## 📝 License

This project is proprietary software.

## 👥 Support

For issues or questions:

1. Check the [Deployment Guide](DEPLOYMENT_GUIDE.md)
2. Review error logs
3. Verify all prerequisites are met
4. Ensure proper configuration

---

Made with ❤️ for efficient banana production management
