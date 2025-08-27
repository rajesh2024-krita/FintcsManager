# Overview

Fintcs is a comprehensive Finance Management System designed for cooperative societies and their members. The system provides role-based access control with four distinct user roles: Super Admin (system-wide control), Society Admin (society-specific management), User (read-only access), and Member (personal financial data access). Built with a modern full-stack architecture, the application handles core financial operations including society management, user administration, member profiles, loan processing, monthly demand calculations, voucher management, and comprehensive reporting.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/UI components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for theming support (light/dark mode)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with built-in caching, synchronization, and error handling
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Authentication**: Context-based auth provider with JWT token management and role-based access control

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Authentication**: JWT-based stateless authentication with bcrypt for password hashing
- **Middleware**: Role-based authorization middleware for protecting routes based on user permissions
- **File Uploads**: Multer for handling member photo/signature uploads
- **API Design**: RESTful API structure with consistent error handling and logging

## Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations with PostgreSQL
- **Schema**: Comprehensive relational schema with proper foreign key relationships
- **Tables**: users (authentication), societies, systemUsers (EDP-based), members, loans, monthlyDemands, vouchers, pendingEdits
- **Enums**: PostgreSQL enums for user roles, loan types, payment modes, and status fields
- **Migrations**: Drizzle Kit for database schema migrations and version control

## Key Features & Business Logic
- **Role-Based Access**: Hierarchical permission system with route guards and API-level authorization
- **Society Management**: Multi-tenant architecture supporting multiple cooperative societies
- **Loan Processing**: Complex loan calculation logic with installments, interest, and payment tracking
- **Monthly Demand**: Automated calculation of member dues including shares, loans, and deductions
- **Voucher System**: Double-entry bookkeeping with debit/credit voucher management
- **Reporting**: Comprehensive financial reports with filtering and export capabilities
- **Member Management**: Complete member lifecycle with photo/signature uploads and profile management

## Development & Deployment
- **Development**: Hot module replacement with Vite, TypeScript strict mode, and runtime error overlay
- **Build Process**: Separate client (Vite) and server (ESBuild) build pipelines
- **Code Quality**: Consistent alias paths for imports, strict TypeScript configuration
- **Environment**: Environment-based configuration with proper development/production separation

# External Dependencies

## Database & Hosting
- **Neon Database**: Serverless PostgreSQL database with connection pooling via @neondatabase/serverless
- **WebSocket Support**: Native WebSocket support for real-time database connections

## UI & Styling
- **Radix UI**: Comprehensive set of accessible UI primitives for dialogs, dropdowns, forms, and navigation
- **Tailwind CSS**: Utility-first CSS framework with PostCSS for processing
- **Lucide React**: Consistent icon library for UI elements
- **Class Variance Authority**: Type-safe component variant handling

## Authentication & Security
- **JWT (jsonwebtoken)**: Stateless authentication tokens
- **bcrypt**: Password hashing and verification
- **CORS**: Cross-origin resource sharing configuration

## File Handling & Utilities
- **Multer**: Multipart form data handling for file uploads (member photos/signatures)
- **nanoid**: Unique ID generation for various entities

## Development Tools
- **Replit Integration**: Custom Vite plugins for Replit environment including cartographer and runtime error modal
- **TypeScript**: Full type safety across frontend and backend with shared schema types
- **Drizzle Kit**: Database schema management and migration tools

## Build & Bundling
- **Vite**: Fast frontend build tool with HMR and optimized production builds
- **ESBuild**: High-performance JavaScript bundler for server-side code
- **TSX**: TypeScript execution for development server