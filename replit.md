# Cleaning Company Quote Calculator

## Overview

This is a full-stack web application for calculating cleaning service quotes. The application provides an interactive interface for clients to get instant quotes for different types of cleaning services (General, Deep/Spring, and Move-In/Move-Out) based on property size and optional add-on services. The system includes both customer-facing and admin views with detailed pricing breakdowns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Framework**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack Query) for server state
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (DatabaseStorage replaces MemStorage)
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Design**: RESTful API with JSON responses
- **Quote Persistence**: Quotes saved to database with full calculation history

### Build System
- **Frontend Build**: Vite with React plugin
- **Backend Build**: esbuild for server bundling
- **Development**: Hot reload with Vite dev server
- **TypeScript**: Shared type definitions across client/server

## Key Components

### Quote Calculation System
- **Service Types**: Three main service categories with different pricing tiers
- **Property Configuration**: Bedroom/bathroom count selector (1-6 beds, 1-3 baths)
- **Add-on Services**: 11 optional services with fixed pricing
- **Pricing Logic**: Hour-based calculations with customizable hourly rates
- **Customizable Rates**: Real-time adjustment of client hourly rate and cleaner cost rate
- **Discount System**: Optional promotional discount toggle
- **Quote Persistence**: Save quotes to database with complete calculation breakdown

### User Interface Components
- **Quote Form**: Interactive form with real-time quote updates
- **Service Selection**: Radio buttons for service type selection
- **Pricing Configuration**: Input fields for customizable hourly rates
- **Property Selectors**: Dropdown menus for bedroom/bathroom counts
- **Add-on Checkboxes**: Multi-select checkboxes for optional services
- **Quote Display**: Detailed breakdown showing costs, taxes, and margins
- **Admin View**: Toggle for detailed profit analysis with labor breakdown
- **Quote History**: Database-backed quote history with filtering and search
- **Quick Profit Preview**: Real-time profit metrics in pricing configuration

### Data Management
- **Schema Validation**: Zod schemas for request/response validation
- **Type Safety**: Shared TypeScript types between client and server
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Data Flow

### Quote Calculation Flow
1. **User Input**: User selects service type, property size, and add-ons
2. **Real-time Updates**: Form changes trigger automatic quote recalculation
3. **API Request**: Client sends validated data to `/api/calculate-quote`
4. **Server Processing**: Server validates input and calculates pricing
5. **Response**: Server returns detailed quote breakdown with all calculations
6. **UI Update**: Client displays formatted quote results

### Pricing Calculation Logic
- **Base Service**: Hours determined by bedroom/bathroom combination
- **Add-on Services**: Fixed hourly rates for additional services
- **Cost Calculation**: Hours × hourly rate for each component
- **Discount Application**: Optional percentage discount on subtotal
- **Tax Calculation**: GST (10%) applied to net amount
- **Margin Analysis**: Profit calculation based on cleaner pay rates

## External Dependencies

### UI and Styling
- **Radix UI**: Comprehensive component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe CSS class management

### Data and Validation
- **Zod**: Schema validation for type-safe data handling
- **Drizzle ORM**: Type-safe database queries and migrations
- **React Hook Form**: Performant form handling with validation

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **ESBuild**: Fast TypeScript/JavaScript bundler
- **TSX**: TypeScript execution for development server

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Assets**: Static files served from build directory
- **Types**: Shared schema types compiled for both environments

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL` environment variable
- **Development**: Local development server with hot reload
- **Production**: Express server serves both API and static files

### Database Management
- **Migrations**: Drizzle Kit manages database schema changes
- **Schema**: Centralized schema definitions in `shared/schema.ts`
- **Connection**: Neon Database serverless connection for scalability
- **Tables**: Users and Quotes tables with full relational structure
- **Storage Layer**: DatabaseStorage class implements IStorage interface

## Recent Changes (January 2025)

### Database Integration
- **Date**: January 15, 2025
- **Changes**: 
  - Replaced in-memory storage with PostgreSQL database
  - Added quotes table with comprehensive quote data storage
  - Implemented quote saving and history retrieval functionality
  - Added database connection layer with Neon Database

### Enhanced Pricing Controls
- **Date**: January 15, 2025
- **Changes**:
  - Added customizable hourly rate inputs for client billing
  - Added customizable cleaner rate inputs for cost calculation
  - Implemented real-time profit analysis with detailed breakdown
  - Added hourly profit calculations and margin analysis

### User Interface Improvements
- **Date**: January 15, 2025
- **Changes**:
  - Added pricing configuration section with rate controls
  - Enhanced admin profit analysis with labor breakdown
  - Implemented quote history view with database integration
  - Added save quote functionality with database persistence

The application now provides a complete business management solution with persistent quote storage, customizable pricing controls, and comprehensive profit analysis, making it suitable for both customer-facing quote generation and internal business management.