
# LeadPilot AI - Mini CRM Platform

LeadPilot AI is a Next.js application designed as a mini AI-Powered Customer Relationship Management (CRM) platform. It helps manage leads, track conversations, and leverage AI for suggestions and summaries.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Running the Application](#running_the_application)
- [Project Structure](#project-structure)
- [Key Technologies Used](#key-technologies-used)

## Features

- **Lead Management**: Add, edit, delete, and view leads in both table and Kanban board formats.
- **Status Tracking**: Drag-and-drop leads between statuses on the Kanban board.
- **Conversation Logging**: Record various types of interactions (email, call, meeting) for each lead.
- **Follow-up Reminders**: Set and view upcoming follow-up reminders in a dedicated "Follow-ups" tab.
- **AI-Powered Next Step Suggestions**: Get intelligent recommendations for engaging with leads.
- **AI-Powered Conversation Summaries**: Automatically generate concise summaries from conversation notes.
- **Activity Log**: View a comprehensive history of all actions taken within the CRM.
- **Dashboard**: Visualize key metrics like total leads, conversion rates, and leads by status.
- **Filtering & Searching**: Easily find leads and activities.
- **MongoDB Integration**: Persists lead and activity data in a MongoDB database.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 18.x or later (LTS recommended). You can download it from [nodejs.org](https://nodejs.org/).
- **npm** (comes with Node.js) or **yarn**: A package manager for JavaScript.
- **MongoDB**: You can use a cloud-hosted service like MongoDB Atlas (recommended) or install MongoDB Community Server locally (Version 4.x or later).
  - For MongoDB Atlas, sign up at [cloud.mongodb.com](https://cloud.mongodb.com/).
  - For local installation, download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community).
- **Google AI API Key**: To use the AI-powered features, you will need an API key from Google AI Studio (for Gemini models). You can get one [here](https://makersuite.google.com/app/apikey).

## Environment Setup

1.  **Create an Environment File**:
    At the root of the project, create a file named `.env`.

2.  **Add Environment Variables**:
    Open the `.env` file and add your Google AI API Key and MongoDB connection details:

    ```env
    GOOGLE_API_KEY=your_google_ai_api_key_here
    MONGODB_URI=mongodb+srv://<your_username>:<your_password>@<your_cluster_address>/<your_database_name>?retryWrites=true&w=majority
    MONGODB_DB_NAME=crm-database
    ```

    - Replace `your_google_ai_api_key_here` with the actual API key you obtained from Google AI Studio.
    - **`MONGODB_URI`**:
        - **For MongoDB Atlas (Recommended)**: Replace `<your_username>`, `<your_password>`, `<your_cluster_address>`, and `<your_database_name>` with your actual MongoDB Atlas credentials and cluster information. Ensure your Atlas cluster's IP whitelist allows connections from your IP address or `0.0.0.0/0` (for development, be cautious with this in production). The `<your_database_name>` in the URI should match `MONGODB_DB_NAME`.
        - **For Local MongoDB**: If you choose to use a local MongoDB instance, the URI would be something like `mongodb://localhost:27017`. If your local MongoDB requires authentication, include credentials: `mongodb://user:password@localhost:27017`.
    - **`MONGODB_DB_NAME`**: The name of the database LeadPilot AI will use. `crm-database` is the default. This name should also be used in your `MONGODB_URI` if you are using MongoDB Atlas.

    **Important**: After creating or modifying the `.env` file, you **must restart your Next.js development server** for the changes to take effect.

## Installation

1.  **Clone the Repository (if applicable)**:
    If you have the project as a git repository, clone it:
    ```bash
    git clone <repository_url>
    cd <project_directory>
    ```
    If you received the files directly, navigate to the project's root directory.

2.  **Install Dependencies**:
    Open your terminal in the project's root directory and run one of the following commands:

    Using npm:
    ```bash
    npm install
    ```

    Or using yarn:
    ```bash
    yarn install
    ```

## Running the Application

The application consists of two main parts: the Next.js frontend and the Genkit AI flow server. You'll need to run them in separate terminal windows.

1.  **Start your MongoDB Server (if using local MongoDB)**:
    If you installed MongoDB locally, ensure your MongoDB instance is running. You might start it with a command like `mongod` (this command can vary based on your OS and installation method). If you are using a cloud service like MongoDB Atlas, it should already be running.

2.  **Start the Genkit Development Server**:
    This server handles the AI-powered flows.
    Open a terminal window and run:
    ```bash
    npm run genkit:dev
    ```
    Or for automatic reloading on changes:
    ```bash
    npm run genkit:watch
    ```
    By default, the Genkit server usually starts on port `3400`. The Genkit UI will be available at `http://localhost:4000/dev-ui`.

3.  **Start the Next.js Development Server**:
    This server runs the main web application.
    Open another terminal window and run:
    ```bash
    npm run dev
    ```
    The Next.js application will start on `http://localhost:9002` (as specified in `package.json`). **Remember to restart this server if you change environment variables in `.env`**.

4.  **Access the Application**:
    Open your web browser and navigate to `http://localhost:9002`.

## Project Structure

Here's a brief overview of the key directories:

```
.
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── (pages)/        # Page components (e.g., dashboard, activity-log, follow-ups)
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main leads page (homepage)
│   ├── actions/            # Server Actions for data mutation (e.g. leadActions.ts, activityActions.ts)
│   ├── ai/                 # Genkit AI related files
│   │   ├── flows/          # AI flow definitions (e.g., suggestions, summaries)
│   │   ├── schemas/        # Zod schemas for AI flow inputs/outputs
│   │   ├── dev.ts          # Genkit development server entry point
│   │   └── genkit.ts       # Genkit global configuration
│   ├── components/         # Reusable React components
│   │   ├── ai/             # AI-related UI components
│   │   ├── conversations/  # Conversation management UI
│   │   ├── dashboard/      # Dashboard specific components
│   │   ├── follow-ups/     # Follow-up list UI components
│   │   ├── layout/         # Layout components (e.g., header)
│   │   ├── leads/          # Lead management UI (table, kanban, forms)
│   │   └── ui/             # ShadCN UI components (Button, Card, etc.)
│   ├── data/               # Mock data and static option lists (less used now with DB)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions (e.g. utils.ts, mongodb.ts)
│   ├── services/           # External service integrations (e.g., LinkedIn mock)
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── .env                    # Environment variables (needs to be created)
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Technologies Used

- **Next.js (App Router)**: React framework for server-side rendering and static site generation.
- **TypeScript**: Superset of JavaScript for type safety.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **ShadCN UI**: Reusable UI components built with Radix UI and Tailwind CSS.
- **MongoDB**: NoSQL document database for data persistence (MongoDB Atlas recommended).
- **`mongodb` (Node.js Driver)**: For interacting with MongoDB.
- **Genkit (Firebase Genkit)**: Toolkit for building AI-powered features, integrated with Google AI (Gemini).
- **Zod**: TypeScript-first schema declaration and validation library.
- **React Hook Form**: For managing form state and validation.
- **Lucide React**: Icon library.
- **Recharts**: Composable charting library (used for the dashboard).
- **date-fns**: For date formatting.
