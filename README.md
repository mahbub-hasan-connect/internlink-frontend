# InternLink — Frontend

InternLink is a full-stack internship-matching platform that connects students with recruiters through automated resume/profile data, a real-time application tracker, and an AI-driven skill-match score. This repository contains the React frontend.

**Backend repo:** [internlink-backend](https://github.com/mahbub-hasan-connect/internlink-backend)

## Features

- Public homepage and job listings page
- Student, Recruiter, and Admin dashboards, each with role-specific views and navigation
- Role-based route protection (students, recruiters, and admins only see what they're authorized for)
- Student profile creation/editing (skills, resume details)
- Recruiter job posting management and applicant review, with live AI match-score ranking
- Real-time application status tracking (Applied → Shortlisted → Interview → Offered / Hired / Rejected)
- In-app notifications
- Sticky navigation bar showing the logged-in user's name and role

## Tech Stack

- **Framework:** React 19 + Vite
- **Routing:** react-router-dom v7
- **HTTP client:** Axios (with JWT attached via request interceptor)
- **Styling:** inline styles with a shared design-token file (`theme.js`)

## Project Structure

```
src/
  api/         → axios client + API calls
  auth/        → JWT decoding, auth context
  components/  → shared UI (navbar, protected route wrapper)
  pages/       → route-level pages (per role)
  theme.js     → shared brand colors/tokens
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- The [backend API](https://github.com/mahbub-hasan-connect/internlink-backend) running locally at `https://localhost:7182`

### Setup

1. Clone the repo:
   ```
   git clone https://github.com/mahbub-hasan-connect/internlink-frontend.git
   cd internlink-frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Run the dev server:
   ```
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

> Make sure the backend is running first — this frontend expects the API at `https://localhost:7182`.

## Authentication

On login, a JWT is stored client-side and decoded to drive role-based UI (navbar badge, protected routes, dashboard content). The actual authorization boundary is enforced on the backend; the frontend's route protection is a UX convenience only.

## Team

Built as a group project by **Team Dreamcatchers**: Mst. Sadia Akter, Tanushree Debnath, Mahbub Hasan.
