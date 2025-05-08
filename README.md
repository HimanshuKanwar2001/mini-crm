# LeadPilot AI - Mini CRM Platform

LeadPilot AI is a Next.js application designed as a mini AI-Powered Customer Relationship Management (CRM) platform. It helps manage leads, track conversations, and leverage AI for suggestions and summaries.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Key Technologies Used](#key-technologies-used)

## Features

- **Lead Management**: Add, edit, delete, and view leads in both table and Kanban board formats.
- **Status Tracking**: Drag-and-drop leads between statuses on the Kanban board.
- **Conversation Logging**: Record various types of interactions (email, call, meeting) for each lead.
- **AI-Powered Next Step Suggestions**: Get intelligent recommendations for engaging with leads.
- **AI-Powered Conversation Summaries**: Automatically generate concise summaries from conversation notes.
- **Activity Log**: View a comprehensive history of all actions taken within the CRM.
- **Dashboard**: Visualize key metrics like total leads, conversion rates, and leads by status.
- **Filtering & Searching**: Easily find leads and activities.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 18.x or later (LTS recommended). You can download it from [nodejs.org](https://nodejs.org/).
- **npm** (comes with Node.js) or **yarn**: A package manager for JavaScript.
- **Google AI API Key**: To use the AI-powered features, you will need an API key from Google AI Studio (for Gemini models). You can get one [here](https://makersuite.google.com/app/apikey).

## Environment Setup

1.  **Create an Environment File**:
    At the root of the project, create a file named `.env`.

2.  **Add Environment Variables**:
    Open the `.env` file and add your Google AI API Key:

    ```env
    GOOGLE_API_KEY=your_google_ai_api_key_here
    ```

    Replace `your_google_ai_api_key_here` with the actual API key you obtained from Google AI Studio.

    *Note: The application uses `localStorage` to persist lead and activity data for demonstration purposes. No external database setup is required for the basic CRM functionalities.*

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

1.  **Start the Genkit Development Server**:
    This server handles the AI-powered flows.
    Open a terminal window and run:
    ```bash
    npm run genkit:dev
    ```
    Or for automatic reloading on changes:
    ```bash
    npm run genkit:watch
    ```
    By default, the Genkit server usually starts on port `3400` (unless configured otherwise, but for this project, the default port is expected). The Genkit UI will be available at `http://localhost:4000/dev-ui`.

2.  **Start the Next.js Development Server**:
    This server runs the main web application.
    Open another terminal window and run:
    ```bash
    npm run dev
    ```
    The Next.js application will start on `http://localhost:9002` (as specified in `package.json`).

3.  **Access the Application**:
    Open your web browser and navigate to `http://localhost:9002`.

## Project Structure

Here's a brief overview of the key directories:

```
.
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── (pages)/        # Page components (e.g., dashboard, activity-log)
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main leads page (homepage)
│   ├── ai/                 # Genkit AI related files
│   │   ├── flows/          # AI flow definitions (e.g., suggestions, summaries)
│   │   ├── schemas/        # Zod schemas for AI flow inputs/outputs
│   │   ├── dev.ts          # Genkit development server entry point
│   │   └── genkit.ts       # Genkit global configuration
│   ├── components/         # Reusable React components
│   │   ├── ai/             # AI-related UI components
│   │   ├── conversations/  # Conversation management UI
│   │   ├── dashboard/      # Dashboard specific components
│   │   ├── layout/         # Layout components (e.g., header)
│   │   ├── leads/          # Lead management UI (table, kanban, forms)
│   │   └── ui/             # ShadCN UI components (Button, Card, etc.)
│   ├── data/               # Mock data and static option lists
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
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
- **Genkit (Firebase Genkit)**: Toolkit for building AI-powered features, integrated with Google AI (Gemini).
- **Zod**: TypeScript-first schema declaration and validation library.
- **React Hook Form**: For managing form state and validation.
- **Lucide React**: Icon library.
- **Recharts**: Composable charting library (used for the dashboard).
- **date-fns**: For date formatting.
```