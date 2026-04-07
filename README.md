# GrowTeens

GrowTeens is a youth empowerment platform focused on helping African teenagers build digital, entrepreneurial, and leadership skills. The platform combines structured courses, mentorship, community, AI learning tools, and admin workflows for managing programs, users, and Canvas LMS sync.

## Table of Contents

- [GrowTeens](#growteens)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Setup and Installation](#setup-and-installation)
    - [Prerequisites](#prerequisites)
    - [Server Setup](#server-setup)
    - [Client Setup](#client-setup)
  - [Running the Application](#running-the-application)
  - [Canvas LMS Integration](#canvas-lms-integration)
    - [Canvas Setup](#canvas-setup)
    - [Canvas Usage Guide](#canvas-usage-guide)
    - [Supported Operations](#supported-operations)
    - [Troubleshooting](#troubleshooting)

## Overview

GrowTeens is built as a monorepo with:

- `server/` for the Express + Prisma backend
- `client/` for the Next.js frontend used by admins and users

The platform supports role-based access, structured learning content, mentorship experiences, AI-powered study tools, and admin operations such as course management, program management, user management, and Canvas LMS synchronization.

## Features

- **User Registration & Authentication:** Secure signup, login, verification, and role-based access for teenagers, mentors, sponsors, and admins.
- **Course Management:** Create and manage courses, modules, units, publishing state, and enrollment workflows.
- **Program Management:** Group courses into learning tracks and manage program visibility.
- **Canvas LMS Integration:** Admin-only bidirectional integration for connecting Canvas, importing courses, pushing local courses, syncing enrollments, and reviewing sync history.
- **AI Learning Tools:** Session-based chatbot experience and flashcard generation/support flows.
- **Mentorship & Community:** Support for mentorship workflows and community-oriented platform features.
- **Responsive Frontend:** Built with Next.js and Tailwind CSS.
- **Backend API:** Express + Prisma REST API backed by PostgreSQL.

## Tech Stack

- **Frontend**
  - Next.js App Router
  - React
  - Tailwind CSS
  - NextAuth
- **Backend**
  - Node.js
  - Express
  - Prisma ORM
  - PostgreSQL
- **Integrations**
  - Canvas LMS REST API v1
  - OpenAI
  - Cloudinary
  - Nodemailer

## Project Structure

```text
grow-teens/
├── client/                  # Next.js frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.local
├── server/                  # Express backend + Prisma
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── .env
├── README.md
└── CLAUDE.md
```

## Setup and Installation

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL

### Server Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   ```env
   DATABASE_URL="postgresql://your_username:your_password@your_host:5432/growteens"
   PORT=8080
   NODE_ENV=development
   JWT_SECRET="your-jwt-secret"
   ```

4. Run Prisma setup:

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Start the backend:

   ```bash
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   ```env
   NEXT_PUBLIC_API_URL="http://localhost:8080"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Start the frontend:

   ```bash
   npm run dev
   ```

## Running the Application

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`

Run both apps together when testing authentication, admin flows, or Canvas LMS integration.

## Canvas LMS Integration

GrowTeens includes an admin-only, bidirectional Canvas LMS integration. It allows admins to connect a Canvas instance, import Canvas courses into GrowTeens, push GrowTeens courses to Canvas, sync enrollments, and inspect sync history.

At a high level, the integration lives in:

- **Backend controller:** `server/src/controllers/canvas.ts`
- **Backend routes:** `server/src/routes/canvas.ts`
- **Frontend service:** `client/src/services/canvasService.ts`
- **Admin UI:** `client/src/app/(protected)/admin/canvas/page.tsx`

Current admin UI entrypoint:

- `/admin/canvas`

Key backend interfaces:

- `GET /api/v1/canvas/config`
- `POST /api/v1/canvas/config`
- `GET /api/v1/canvas/courses`
- `POST /api/v1/canvas/sync/import`
- `POST /api/v1/canvas/sync/push/:courseId`
- `POST /api/v1/canvas/sync/enrollments/:courseId`
- `GET /api/v1/canvas/sync/logs`

Other backend-supported sync endpoints exist as well and are noted below under supported operations.

### Canvas Setup

Before using Canvas integration, make sure you have:

- the backend running
- the frontend running
- an **ADMIN** account in GrowTeens
- a valid Canvas domain
- a Canvas API token
- the correct Canvas account ID

Setup notes:

- Enter the Canvas domain in the format `myschool.instructure.com`
- Do not enter a full API URL such as `https://myschool.instructure.com/api/v1`
- The backend validates the Canvas connection when you save the configuration
- The config is stored only after verification succeeds

### Canvas Usage Guide

1. Sign in with an **ADMIN** account.
2. Open `Admin > Canvas Integration` or go directly to `/admin/canvas`.
3. Enter your Canvas domain, account ID, and API token, then save the configuration.
4. Use `Import` or `Import All` in the Canvas Courses section to bring Canvas courses into GrowTeens.
5. Use `Push` or `Update` in the GrowTeens Courses section to create or update Canvas courses from local GrowTeens courses.
6. Use `Sync Enrollments` for courses that are already linked to Canvas.
7. Review `Sync History` to confirm successful operations or inspect failures.

### Supported Operations

**Currently available in the admin UI**

- Save and update Canvas configuration
- Retrieve and list Canvas courses
- Import one Canvas course or import all available Canvas courses
- Push a GrowTeens course to Canvas
- Update a previously linked GrowTeens course in Canvas
- Sync enrollments for linked courses
- View sync history and status logs

**Available in the backend API but not yet exposed in the current admin UI**

- Import modules from Canvas
- Import quizzes from Canvas
- Import assignments from Canvas
- Sync quiz results / grades back to Canvas

This split is important: the backend supports more Canvas sync operations than the current `client` admin UI exposes.

### Troubleshooting

- **401 / Unauthorized:** Make sure you are logged in with an `ADMIN` account.
- **Connection failed:** Recheck the Canvas domain, API token, and account ID.
- **No courses found:** Confirm the Canvas account actually has courses and that the configured account ID is correct.
- **Not linked:** A Canvas course may not have been imported into GrowTeens yet, or a GrowTeens course may not have been pushed to Canvas yet.

