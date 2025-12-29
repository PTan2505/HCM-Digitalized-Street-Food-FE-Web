# HCM Digitalized Street Food - Frontend Web

A modern React web application for managing digitalized street food services in Ho Chi Minh City.

## Tech Stack

### Core Framework

- **React 19** - Latest version with improved performance and modern features
- **TypeScript 5.8** - Strict type checking enabled for enhanced code safety
- **Vite 7** - Lightning-fast build tool with HMR (Hot Module Replacement)

### State Management

- **Redux Toolkit 2.11** - Modern Redux with simplified setup and built-in best practices
- **React Redux 9.2** - Official React bindings for Redux

### Routing

- **React Router 7.8** - Client-side routing with the latest router API

### HTTP Client

- **Axios 1.11** - Promise-based HTTP client with interceptors for token management and request/response handling

### UI Framework & Styling

- **Material-UI (MUI) 7.3** - Comprehensive React component library with customizable theming
- **Tailwind CSS 4** - Utility-first CSS framework with custom theme configuration
- **Emotion 11** - CSS-in-JS library for styled components

### Form Handling & Validation

- **React Hook Form 7.62** - Performant form library with minimal re-renders
- **Zod 4.1** - TypeScript-first schema validation
- **@hookform/resolvers 5.2** - Validation resolver for React Hook Form

### Code Quality & Linting

- **ESLint 9** - Configured with TypeScript-aware rules and strict type checking
- **TypeScript ESLint 8** - Type-aware linting with `recommendedTypeChecked` preset
- **Prettier 3.6** - Code formatter with Tailwind CSS plugin for class sorting

### Development Tools

- **vite-tsconfig-paths** - Automatic path resolution from tsconfig
- **@tailwindcss/vite** - Tailwind CSS integration for Vite

## Project Structure

```
src/
├── app/              # Application setup (store, router, providers)
├── features/         # Feature-based modules (isolated by domain)
├── components/       # Shared/reusable components
├── lib/             # External integrations (API client)
├── config/          # Configuration files (axios, MUI theme)
├── slices/          # Redux slices
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
└── constants/       # Application constants
```

```
src/features/awesome-feature
├── api/              # Exported API request declarations and api hooks related to a specific feature
├── assets/         # Assets folder can contain all the static files for a specific feature
├── components/       # Components scoped to a specific feature
├── hooks/             # Hooks scoped to a specific feature
├── slices/          # Redux slices for a specific feature
├── utils/           # Utility functions for a specific feature
├── types/           # Typescript types used within the feature
```

## Key Features

### Authentication & Security

- JWT token management with automatic refresh
- Axios interceptors for authentication headers
- Separate admin and customer login flows
- Secure token storage with localStorage

### API Architecture

- Type-safe API client wrapper around Axios
- Centralized error handling and response formatting
- Request/response interceptors for token refresh
- Standardized API response types

### Code Organization

- Feature-based architecture with enforced boundaries via ESLint
- Path aliases for clean imports (`@app/*`, `@components/*`, etc.)
- Strict TypeScript configuration with comprehensive type safety
- Custom Tailwind utilities for typography and theming

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url_here
```
