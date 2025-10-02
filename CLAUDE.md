# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js TypeScript admin REST API for "niebieskie-aparaty" (blue cameras) built with Express. It provides both REST API endpoints and MVC web views for managing users, events, and files with AWS S3 integration and DynamoDB storage.

## Development Commands

- `npm run dev` - Start development server with nodemon (watches src/ for changes)
- `npm run build` - Compile TypeScript and copy views/public assets to dist/
- `npm start` - Run production server from dist/
- `npm run lint` - Run ESLint on TypeScript files
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm test` - Run Jest tests

## Architecture

### Domain-Driven Design Structure
The codebase follows DDD principles with clear separation:

- `src/apps/[domain]/domain/` - Domain entities and facades (UserFacade, EventFacade, FileFacade)
- `src/apps/[domain]/infrastructure/mvc/` - MVC controllers and routes (server-side rendered views)
- `src/apps/[domain]/infrastructure/rest/` - REST API controllers and routes

### Dependency Injection
Uses TSyringe container for dependency injection. Domain facades are registered as singletons in `src/container.ts`:
- UserFacade → UserFacadeImpl
- EventFacade → EventFacadeImpl  
- FileFacade → FileFacadeImpl

### Key Infrastructure
- **Database**: AWS DynamoDB with connection setup in `src/config/db.ts`
- **File Storage**: AWS S3 with configuration in `src/config/s3config.ts`
- **Authentication**: Passport.js with JWT, Google OAuth, and local strategies
- **Session Management**: Express sessions with admin authentication middleware
- **API Documentation**: Swagger UI at `/api-docs` (requires admin session)
- **Views**: EJS templating with responsive views for CRUD operations
- **File Upload**: Support for large file uploads with progress tracking

### Route Structure
- `/api/*` - REST API endpoints (users, events, files, auth)
- `/users`, `/events`, `/files` - MVC routes for server-side rendered views
- `/upload` - File upload functionality
- `/api-docs` - Swagger documentation (admin-protected)
- Root `/` redirects to `/api-docs`

### Security Features
- Helmet.js with CSP configuration for S3 bucket access
- JWT token authentication for API endpoints
- Session-based authentication for MVC views
- Admin authentication middleware for sensitive operations
- Input validation and error handling middleware

### Development Notes
- Uses `reflect-metadata` for decorator support
- Views and public assets are copied during build process
- Supports both development (`src/`) and production (`dist/`) asset paths
- Comprehensive logging with Winston
- Environment-based configuration with dotenv