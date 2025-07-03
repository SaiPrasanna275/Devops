# MedTracker Pro - Medication Management System

## Overview

MedTracker Pro is a comprehensive medication tracking application designed for busy small business owners. The system provides medication management, adherence tracking, smart reminders, and AI-powered insights to help users maintain their health while managing their professional responsibilities.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom medical-themed color palette
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Database**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple
- **AI Integration**: OpenAI GPT-4o for personalized health insights

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM with schema-first approach
- **Schema Validation**: Zod for runtime type validation
- **Migration System**: Drizzle Kit for database migrations

## Key Components

### Core Entities
1. **Medications**: Core medication information including name, dosage, frequency, and scheduling
2. **Medication Logs**: Tracking of medication intake with status (taken, missed, pending)
3. **AI Insights**: Personalized health recommendations and adherence insights

### Frontend Components
- **Dashboard**: Main interface with stats cards, today's schedule, and medication list
- **Medication Management**: Forms for adding/editing medications
- **AI Insights Panel**: Displays personalized health recommendations
- **Statistics Cards**: Real-time adherence metrics and key performance indicators
- **Today's Schedule**: Current day medication timeline with status tracking

### Backend Services
- **Medication CRUD Operations**: Full medication lifecycle management
- **Logging System**: Comprehensive medication adherence tracking
- **AI Service**: OpenAI integration for generating personalized insights
- **Statistics Service**: Real-time calculation of adherence metrics

## Data Flow

1. **User Interaction**: Users interact with React components to manage medications
2. **API Requests**: TanStack Query handles HTTP requests to Express.js backend
3. **Data Validation**: Zod schemas validate incoming data on both client and server
4. **Database Operations**: Drizzle ORM manages PostgreSQL operations
5. **AI Processing**: OpenAI service analyzes user data to generate insights
6. **Real-time Updates**: Query invalidation ensures UI stays synchronized

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon Database
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI component primitives
- **react-hook-form**: Form state management with validation
- **date-fns**: Date manipulation utilities

### AI & Analytics
- **OpenAI**: GPT-4o integration for health insights and smart reminders
- **connect-pg-simple**: PostgreSQL session storage

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Development Environment
- **Frontend**: Vite development server with hot module replacement
- **Backend**: tsx for TypeScript execution with automatic restarts
- **Database**: Neon Database with connection pooling
- **Environment**: Replit-optimized development setup

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations ensure schema consistency
- **Deployment**: Single command deployment with `npm start`

### Key Architectural Decisions

1. **Monorepo Structure**: Shared schema and types between client/server for consistency
2. **Schema-First Design**: Drizzle schema serves as single source of truth
3. **AI Integration**: OpenAI GPT-4o chosen for advanced health insights
4. **Serverless Database**: Neon Database selected for scalability and cost-effectiveness
5. **Component Library**: Radix UI + shadcn/ui for accessible, customizable components
6. **Type Safety**: End-to-end TypeScript with runtime validation via Zod

## DevOps & Production Architecture

### Container Strategy
- **Docker**: Multi-stage builds with Alpine Linux for security and size optimization
- **Security**: Non-root user execution, health checks, and vulnerability scanning
- **Registry**: GitHub Container Registry for automated image management

### Orchestration
- **Kubernetes**: Full production-ready manifests for EKS deployment
- **Scaling**: Horizontal pod autoscaling with resource limits and requests
- **Networking**: Ingress with SSL/TLS termination and rate limiting
- **Storage**: Persistent volumes for database and cache layers

### Infrastructure as Code
- **Terraform**: Complete AWS infrastructure provisioning
- **Components**: EKS cluster, RDS PostgreSQL, ElastiCache Redis, VPC, security groups
- **Security**: WAF protection, encryption at rest/transit, IAM roles with least privilege
- **Monitoring**: CloudWatch integration with custom metrics

### CI/CD Pipeline
- **GitHub Actions**: Automated testing, building, and deployment
- **Security**: Vulnerability scanning with Trivy, dependency auditing
- **Environments**: Separate staging and production deployment workflows
- **Quality Gates**: Linting, type checking, and test coverage requirements

### Monitoring & Observability
- **Metrics**: Prometheus integration with custom application metrics
- **Dashboards**: Grafana for real-time monitoring and alerting
- **Health Checks**: Comprehensive endpoint monitoring
- **Logging**: Structured logging with error tracking

### Security Implementation
- **Network**: WAF with DDoS protection and rate limiting
- **Data**: Encryption at rest and in transit with AWS KMS
- **Secrets**: AWS Secrets Manager for credential management
- **Access**: RBAC with service accounts and minimal permissions
- **Scanning**: Automated vulnerability detection in CI/CD

## Changelog
```
Changelog:
- June 29, 2025. Initial medication tracking application setup with AI features
- June 29, 2025. Added comprehensive DevOps infrastructure:
  * Docker containerization with multi-stage builds
  * Kubernetes manifests for production deployment
  * Terraform infrastructure as code for AWS
  * GitHub Actions CI/CD pipeline
  * Prometheus/Grafana monitoring stack
  * Security hardening with WAF, encryption, and scanning
  * Health checks and metrics endpoints
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```