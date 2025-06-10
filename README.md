# EduWMe Project

EduWMe is a modern, interactive e-learning platform designed to provide a gamified learning experience. It features courses, exercises, user progress tracking, a leaderboard, and a shop for virtual items.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Application](#running-the-application)
  - [Backend Server](#backend-server)
  - [Frontend Development Server](#frontend-development-server)
- [Seeding the Database](#seeding-the-database)
- [Development Guide](#development-guide)

## Tech Stack

### Frontend

- **Framework/Library**: React
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (with JIT compilation, dark mode support)
- **Routing**: React Router DOM
- **State Management**: React Context API (e.g., `AuthContext`, `ThemeContext`)
- **HTTP Client**: Fetch API

### Backend

- **Framework**: Express.js
- **Language**: TypeScript (compiled and run with Node.js)
- **Database**: MongoDB (with Mongoose ODM)
- **Validation**: Zod
- **API Security**: Helmet, Express Rate Limit
- **Middleware**: CORS, Cookie Parser, Compression

### Shared

- **Validation**: Zod schemas (potentially shared between frontend and backend, note the two `validators` directories)

## Project Structure

```
.
├── .env.example            # Example environment variables
├── api.ts                  # Backend API entry point
├── package.json            # Project dependencies and scripts
├── README.md               # This file
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration (base)
├── vite.config.ts          # Vite configuration
├── public/                 # Static assets for the frontend
│   └── vite.svg
├── server/                 # Backend source code
│   ├── controllers/        # Request handlers (business logic)
│   ├── middlewares/        # Custom Express middlewares
│   ├── models/             # Mongoose models for MongoDB
│   ├── routes/             # API route definitions
│   ├── utils/              # Utility functions, including seeding script
│   └── validators/         # Zod schemas for backend request validation
├── src/                    # Frontend source code (React application)
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Frontend entry point
│   ├── AuthContext.tsx     # Authentication context
│   ├── ThemeContext.tsx    # Theme (dark/light mode) context
│   ├── assets/             # Images, icons, etc.
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page-level components
│   └── styles/             # Global styles
└── validators/             # Zod schemas (potentially for client-side or shared validation)
```

## Features

- **User Authentication**: Secure user registration and login.
- **Course Management**: Organized learning content into stages (Course Batches) and individual Courses.
- **Interactive Exercises**: Various types of exercises with difficulty levels and animations.
- **User Progress Tracking**:
  - XP (Experience Points) accumulation.
  - Leveling system.
  - Gems (virtual currency).
  - Detailed progress for each course and exercise (not started, in progress, completed).
  - Progress bars for course batches.
- **Gamification**:
  - Leaderboard to rank users by XP.
  - Awarding XP and gems upon exercise completion.
- **Shop System**: (Inferred) Users can purchase items using gems.
- **Responsive Design**: UI adapts to different screen sizes.
- **Dark Mode**: Switch between light and dark themes.
- **Admin Functionalities**: (Inferred) Separate routes and potential capabilities for administrators.
- **API Security**: Measures like rate limiting and security headers.

## API Endpoints

The backend API is defined in `api.ts` and structured using Express routers in `server/routes/`. Key route prefixes include:

- **`/users`**: User registration, login, profile retrieval ([`server/routes/userRoutes.ts`](server/routes/userRoutes.ts)).
- **`/courses`**: Fetching course batches, courses, and handling exercise completion ([`server/routes/courseRoutes.ts`](server/routes/courseRoutes.ts)).
- **`/exercises`**: Fetching and potentially managing exercises ([`server/routes/exerciseRoutes.ts`](server/routes/exerciseRoutes.ts)).
- **`/shopitems`**: (Inferred) Managing shop items and purchases ([`server/routes/shopItemRoutes.ts`](server/routes/shopItemRoutes.ts)).
- **`/admin`**: (Inferred) Endpoints for administrative tasks ([`server/routes/adminRoutes.ts`](server/routes/adminRoutes.ts)).

Refer to the specific files in `server/routes/` for detailed endpoint definitions.

## Prerequisites

- Node.js (LTS version recommended, e.g., v18.x or v20.x)
- npm (comes with Node.js) or yarn
- MongoDB instance (running locally or on a cloud service)

## Environment Variables

Create a `.env` file in the root directory of the project by copying `.env.example`:

```bash
cp .env.example .env
```

Update the `.env` file with your specific configurations:

- `MONGO_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/eduwme_db`).
- `PORT`: The port for the backend server (defaults to `3000` if not set).
- `VITE_API_URL`: The base URL for your backend API, used by the frontend (e.g., `http://localhost:3000`). This should be set in a `.env` file in the root for Vite to pick up, or directly in frontend code if preferred. The `src/pages/Home.tsx` file suggests it's read from `import.meta.env.VITE_API_BASE_URL`.

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/MystiaFin/eduwme-client
    cd eduwme-client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## Running the Application

### Backend Server

The backend server is an Express application defined in `api.ts`.

1.  Ensure your MongoDB instance is running and accessible.
2.  Make sure you have configured your `.env` file with the `MONGO_URI` and other necessary variables.
3.  Start the backend server:
    ```bash
    npm run server
    ```
    This will typically start the server on the port specified in your `.env` file (or `3000` by default). You should see a "MongoDB connected" message if successful.

### Frontend Development Server

The frontend is a React application built with Vite.

1.  Ensure the backend server is running, as the frontend will make API calls to it.
2.  Make sure `VITE_API_BASE_URL` is correctly set in your environment (e.g., in the root `.env` file) to point to your running backend.
3.  Start the frontend development server:
    ```bash
    npm run dev
    ```
    Alternatively, to expose it on your local network:
    ```bash
    npm run host
    ```
4.  Open your browser and navigate to `http://localhost:5173` (or the address shown in the terminal, which might include an IP address if using `npm run host`).

## Seeding the Database

The project includes a script to seed the database with initial data (users, courses, exercises, etc.). This is useful for development and testing.

1.  Ensure the backend server is **not** running if the seed script connects to MongoDB independently, or ensure it **is** running if the script makes API calls (the provided `server/utils/seed.ts` connects directly to MongoDB).
2.  The seed script is located at [`server/utils/seed.ts`](server/utils/seed.ts).
3.  To run the seed script (assuming you have `ts-node` installed globally or as a dev dependency):
    ```bash
    npx ts-node server/utils/seed.ts
    ```
    If `ts-node` is not available or you prefer, you might need to compile it to JavaScript first and then run with Node, or adjust your `package.json` to include a script for seeding.
    **Note**: The seed script contains a `clearCollections` function that, if uncommented and called, will delete existing data in the specified collections. Be cautious when running this on a database with important data.

---

## Development Guide

This section provides additional information for developers working on the EduWMe project.

### Setting Up Your Development Environment

1.  **Prerequisites**: Ensure you have Node.js, npm, and MongoDB installed.
2.  **Clone & Install**:
    ```bash
    git clone <repository-url>
    cd eduwme-client
    npm install
    ```
3.  **Environment Configuration**:
    - Copy `.env.example` to `.env`.
    - Fill in `MONGO_URI` for your MongoDB instance.
    - Set `PORT` for the backend (e.g., `3000`).
    - Ensure `VITE_API_BASE_URL` is set for the frontend to connect to the backend (e.g., `http://localhost:3000` if `PORT` is `3000`).
4.  **Database Seeding (Optional but Recommended for New Setup)**:
    - Run the seed script as described in the [Seeding the Database](#seeding-the-database) section to populate your database with initial data.
    ```bash
    npx ts-node server/utils/seed.ts
    ```

### Running for Development

- **Start Backend**:
  ```bash
  npm run server
  ```
  (Monitors `api.ts` and related files for changes if using a tool like `nodemon` configured in `package.json` - the provided `npm run server` script from the original README implies this).
- **Start Frontend**:
  ```bash
  npm run dev
  ```
  (Vite provides Hot Module Replacement (HMR) for fast updates).

### Key Development Areas

- **Frontend Components**: Located in `src/components/` and `src/pages/`. Follow React best practices.
- **Styling**: Use Tailwind CSS utility classes. Custom global styles are in `src/styles/`. Dark mode is handled via Tailwind's `dark:` prefix and `ThemeContext`.
- **State Management**: Primarily uses React Context API (`AuthContext.tsx`, `ThemeContext.tsx`). For more complex state, consider if existing patterns are sufficient or if a more robust solution is needed.
- **Backend Logic**: Controllers in `server/controllers/` handle API request logic. Mongoose models in `server/models/` define data schemas.
- **API Routes**: Defined in `server/routes/`. When adding new endpoints, ensure proper validation and error handling.
- **Validation**: Zod is used for schema validation.
  - Backend: Schemas in `server/validators/` are used in controllers.
  - Frontend/Shared: Schemas in the root `validators/` directory can be used for client-side validation or shared DTOs. Ensure consistency if schemas are duplicated or similar.
- **Database Migrations**: For schema changes after initial setup, consider a migration strategy if not already in place (Mongoose itself doesn't enforce strict migrations like some SQL ORMs).

### Coding Conventions

- **TypeScript**: Adhere to strong typing and TypeScript best practices.
- **ESLint**: The project includes `eslint.config.js`. Ensure your code follows the linting rules. Run `npm run lint` (if such a script exists in `package.json`) to check.
- **Naming**: Follow consistent naming conventions for files, variables, functions, and components (e.g., PascalCase for components, camelCase for variables/functions).
- **Comments**: Write clear and concise comments where necessary, especially for complex logic.

### Adding New Features

1.  **Backend**:
    - Define Mongoose models in `server/models/` if new data structures are needed.
    - Create Zod validation schemas in `server/validators/`.
    - Implement controller logic in `server/controllers/`.
    - Define new routes in `server/routes/` and register them in `api.ts` if necessary.
2.  **Frontend**:
    - Create new components in `src/components/` or pages in `src/pages/`.
    - Update routing in `src/main.tsx` if adding new pages.
    - Fetch data using the Fetch API, ensuring `VITE_API_BASE_URL` is used.
    - Manage state using Context or local component state as appropriate.
    - Style using Tailwind CSS.

### Troubleshooting

- **CORS Errors**: Ensure your backend has CORS configured correctly, especially if frontend and backend run on different ports. The `cors` middleware is used in `api.ts`.
- **Database Connection Issues**: Verify `MONGO_URI` is correct and your MongoDB server is running and accessible.
- **Environment Variables Not Loaded**: For Vite (frontend), ensure variables are prefixed with `VITE_` and the dev server is restarted after changes to `.env`. For the backend, ensure `dotenv` is configured early (as seen in `server/utils/seed.ts` and implicitly by `api.ts` if it uses `process.env`).
