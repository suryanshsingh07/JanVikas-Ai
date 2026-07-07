<div align="center">

<img src="https://img.shields.io/badge/JanVikas-AI-blue?style=for-the-badge&logo=react" alt="JanVikas AI" />

# 🏛️ JanVikas AI

### AI-Powered Multilingual Development Intelligence Platform for Government Officials

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/atlas)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [System Architecture](#-system-architecture)
- [Data Flow](#-data-flow)
- [AI Pipeline](#-ai-pipeline)
- [User Roles & Flows](#-user-roles--flows)
- [Database Schema](#-database-schema)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Quick Start](#-quick-start)
- [Demo Credentials](#-demo-credentials)
- [API Routes](#-api-routes)
- [Future Scope](#-future-scope)

---

## 🚨 Problem Statement

Government Officials receive **thousands of development requests** every month through WhatsApp, emails, grievance portals, direct meetings, and social media — with no intelligent system to organize, prioritize, or act on them.

**The 5 Critical Gaps:**

| Gap | Current State | Impact |
|-----|--------------|--------|
| Data Silos | Issues in 10+ different channels | No unified view |
| Duplicates | Same road request submitted 100+ times | Wasted processing |
| Language Barrier | Requests in 12+ Indian languages | Misinterpretation |
| No Prioritization | Manual and subjective | Poor resource allocation |
| No Accountability | Zero tracking after submission | Citizen distrust |

---

## 💡 Solution

**JanVikas AI** — a production-ready, AI-powered platform that acts as the **intelligence layer** between citizens and their government officials.

```
CITIZEN PROBLEM → AI PROCESSING → OFFICIAL ACTION → CITIZEN RESOLUTION
```

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph CLIENT["🌐 Client Layer (React + Vite)"]
        LANDING[Landing Page]
        AUTH[Auth Pages]
        CITIZEN_UI[Citizen Dashboard]
        OFFICIAL_UI[Official Dashboard]
        ADMIN_UI[Admin Dashboard]
    end

    subgraph BACKEND["⚙️ Backend Layer (Node.js + Express)"]
        API[REST API Server :5000]
        AUTH_MW[JWT Middleware]
        RATE[Rate Limiter]
        VALID[Input Validator]
        
        subgraph ROUTES["API Routes"]
            R_AUTH[/api/auth]
            R_SUB[/api/submissions]
            R_PROJ[/api/projects]
            R_AI[/api/ai]
            R_ANALYTICS[/api/analytics]
        end
        
        subgraph CONTROLLERS["Controllers"]
            C_AUTH[authController]
            C_SUB[submissionController]
            C_PROJ[projectController]
            C_AI[aiController]
        end
    end

    subgraph AI_ENGINE["🧠 AI Engine (Algorithmic)"]
        NLP[NLP Processor]
        DEDUP[Duplicate Detector]
        PRIORITY[Priority Scorer]
        CLUSTER[Semantic Clusterer]
        SUMMARY[Executive Summarizer]
    end

    subgraph DATA["💾 Data Layer"]
        MONGO[(MongoDB Atlas)]
        FIREBASE[(Firebase Storage)]
    end

    CLIENT --> API
    API --> AUTH_MW
    AUTH_MW --> ROUTES
    ROUTES --> CONTROLLERS
    CONTROLLERS --> AI_ENGINE
    CONTROLLERS --> DATA
    AI_ENGINE --> DATA
```

---

## 🔄 Data Flow

```mermaid
sequenceDiagram
    participant C as 👤 Citizen
    participant FE as 🖥️ Frontend
    participant API as ⚙️ API Server
    participant AI as 🧠 AI Engine
    participant DB as 💾 MongoDB
    participant OFFICIAL as 🏛️ Official Dashboard

    C->>FE: Submit Issue (text/voice/photo)
    FE->>API: POST /api/submissions
    API->>AI: Analyze submission
    
    AI->>AI: Language Detection
    AI->>AI: Keyword Extraction
    AI->>AI: Duplicate Detection (Cosine Similarity)
    AI->>AI: Priority Scoring (6-factor formula)
    AI->>AI: Category Classification
    
    AI-->>API: Return AI Analysis Result
    API->>DB: Save submission with AI metadata
    DB-->>API: Saved document
    API-->>FE: 201 Created + tracking ID
    FE-->>C: Show tracking ID + confirmation
    
    Note over OFFICIAL: Async - Official views dashboard
    OFFICIAL->>API: GET /api/submissions (filtered)
    API->>DB: Query with filters
    DB-->>API: Paginated results
    API-->>OFFICIAL: Ranked submissions by AI score
    
    OFFICIAL->>API: PATCH /api/submissions/:id/status
    API->>DB: Update status
    API->>DB: Create notification
    DB-->>C: Push notification via WebSocket/polling
```

---

## 🧠 AI Pipeline

```mermaid
flowchart LR
    INPUT["📥 Raw Submission\n(Text / Voice / Image)"] --> LANG["🌐 Language\nDetection"]
    LANG --> TRANS["📝 Translation\n(to English for processing)"]
    TRANS --> KEYWORD["🔑 Keyword\nExtraction\n(TF-IDF)"]
    KEYWORD --> DEDUP{"🔍 Duplicate\nCheck\n(Cosine Similarity)"}
    
    DEDUP -->|"Similarity > 85%"| MERGE["🔗 Merge with\nExisting Issue\n(increment vote count)"]
    DEDUP -->|"New issue"| SCORE["⚖️ Priority\nScoring"]
    
    SCORE --> P1["📍 Geographic\nWeight (×0.20)"]
    SCORE --> P2["📊 Frequency\nWeight (×0.25)"]
    SCORE --> P3["⚠️ Severity\nWeight (×0.30)"]
    SCORE --> P4["📋 Category\nWeight (×0.15)"]
    SCORE --> P5["✅ Gov Dataset\nGap (×0.10)"]
    
    P1 & P2 & P3 & P4 & P5 --> FINAL["🎯 Final Priority\nScore (0-10)"]
    FINAL --> SAVE["💾 Save to\nMongoDB"]
    MERGE --> SAVE
    SAVE --> CLUSTER["🏷️ Cluster into\nSemantic Topics"]
    CLUSTER --> REPORT["📋 Official Executive\nSummary Report"]
```

---

## 👥 User Roles & Flows

```mermaid
stateDiagram-v2
    [*] --> Landing
    Landing --> Login: Click Sign In
    Landing --> Register: Click Sign Up
    
    Login --> CitizenDashboard: role = citizen
    Login --> OfficialDashboard: role = official
    Login --> AdminDashboard: role = admin
    
    state CitizenDashboard {
        [*] --> Home
        Home --> SubmitIssue: + New Issue
        Home --> MySubmissions: View All
        MySubmissions --> TrackSubmission: Click Issue
        Home --> Notifications
        Home --> Profile
    }
    
    state OfficialDashboard {
        [*] --> Overview
        Overview --> AIRecommendations: View Priority Queue
        Overview --> MapView: Geospatial Heatmap
        Overview --> Analytics: Charts & Trends
        Overview --> Projects: Manage Projects
        Overview --> AIInsights: Executive Summary
    }
    
    state AdminDashboard {
        [*] --> SystemOverview
        SystemOverview --> UserManagement: Manage Users
        SystemOverview --> ContentModeration: Review Flagged
        SystemOverview --> OpenDatasets: Manage Integrations
        SystemOverview --> Reports: Generate Reports
    }
    
    CitizenDashboard --> [*]: Logout
    OfficialDashboard --> [*]: Logout
    AdminDashboard --> [*]: Logout
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        enum role "citizen|mp|admin"
        string state
        string district
        string constituency
        object officialDetails
        boolean isVerified
        boolean isActive
        date lastLogin
    }

    SUBMISSION {
        ObjectId _id PK
        ObjectId citizen FK
        string title
        string description
        enum category
        enum status "pending|reviewing|approved|in_progress|resolved|rejected"
        string originalLanguage
        object location
        array images
        number votes
        object aiAnalysis "priorityScore|keywords|duplicateOf|severity"
        object audioData
    }

    PROJECT {
        ObjectId _id PK
        ObjectId createdBy FK
        string title
        string description
        enum status
        number estimatedBudget
        number actualCost
        object location
        array linkedSubmissions FK
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK
        string title
        string message
        enum type
        boolean isRead
        object data
    }

    USER ||--o{ SUBMISSION : "citizen submits"
    USER ||--o{ PROJECT : "official creates"
    USER ||--o{ NOTIFICATION : "receives"
    PROJECT }o--o{ SUBMISSION : "addresses"
    SUBMISSION ||--o| SUBMISSION : "duplicateOf"
```

---

## ✨ Features

### 👤 Citizen Module
| Feature | Description |
|---------|-------------|
| 🎤 Voice Submission | Speech-to-text issue filing in Indian languages |
| 📍 Geo-tagging | Auto-detect location for spatial mapping |
| 🖼️ Photo Upload | Firebase-backed image storage for evidence |
| 🔍 Issue Tracker | Real-time status updates with timeline |
| 🔔 Smart Notifications | Instant alerts when Official acts on issues |
| 🌐 12 Languages | Full UI & submission support for all major Indian languages |

### 🏛️ Official Module
| Feature | Description |
|---------|-------------|
| 🧠 AI Recommendations | Priority-scored queue of actionable issues |
| 🗺️ Geospatial Heatmap | Leaflet map with clustered issue markers |
| 📊 Analytics Dashboard | Recharts-powered trend analysis |
| 🔍 Duplicate Detection | AI-merged duplicate submissions with vote counts |
| 📋 Executive Summary | LLM-style AI-generated weekly/monthly reports |
| 📁 Project Manager | Full CRUD project management linked to submissions |

### 🛡️ Admin Module
| Feature | Description |
|---------|-------------|
| 👥 User Management | Activate/deactivate citizens & MPs |
| 🚫 Content Moderation | AI + manual review of flagged content |
| 🗃️ Open Datasets | Integrate government data (PMGSY, JJM, SBM) |
| 📈 System Reports | National-level analytics and CSV exports |
| ⚙️ National Oversight | Cross-constituency project monitoring |

---

## 🛠️ Tech Stack

### Frontend
```
React 18 + Vite 5          →  Fast HMR dev server
TailwindCSS 3              →  Utility-first styling
Framer Motion              →  Smooth page/component animations
React Router v6            →  Client-side routing with role guards
React Hook Form            →  Form state & validation
Recharts                   →  Analytics charts
React Leaflet              →  Interactive geospatial maps
Axios                      →  HTTP client with JWT interceptors
react-hot-toast            →  Toast notifications
Lucide React               →  Icon library
```

### Backend
```
Node.js 20 + Express 5     →  REST API server
Mongoose 8                 →  MongoDB ODM with schema validation
bcryptjs                   →  Password hashing (12 salt rounds)
jsonwebtoken               →  JWT auth (7d expiry)
express-rate-limit         →  DDoS protection
express-validator          →  Input sanitization
helmet                     →  HTTP security headers
morgan                     →  HTTP request logging
compression                →  Response compression
```

### Database & Storage
```
MongoDB Atlas              →  Cloud NoSQL database (geospatial index)
Firebase Storage           →  Image & audio file storage
```

---

## 📁 Folder Structure

```
JanVikas-Ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/          # Navbar, Sidebar, ThemeToggle, LoadingSpinner
│   │   ├── context/             # AuthContext, ThemeContext, NotificationContext
│   │   ├── hooks/               # useAuth, useTheme, useGeolocation, usePagination
│   │   ├── layouts/             # MainLayout, DashboardLayout, AuthLayout
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register, ForgotPassword
│   │   │   ├── citizen/         # Dashboard, Submit, Track, Profile, Notifications
│   │   │   ├── official/        # Dashboard, Analytics, Map, Projects, AIInsights
│   │   │   └── admin/           # Dashboard, Users, Moderation, Reports, Datasets
│   │   ├── routes/              # AppRoutes, ProtectedRoute, RoleRoute
│   │   ├── services/            # api.js, authService, submissionService, aiService...
│   │   ├── styles/              # index.css (Tailwind + CSS variables)
│   │   └── utils/               # helpers.js, formatters.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/
    ├── config/                  # db.js (MongoDB), firebase.js
    ├── controllers/             # authController, submissionController, aiController...
    ├── middlewares/             # auth.js (JWT), rateLimiter, validate, errorHandler
    ├── models/                  # User, Submission, Project, Notification
    ├── routes/                  # auth, submissions, projects, analytics, ai, users
    ├── services/                # aiService (priority engine, dedup, clustering)
    ├── utils/                   # helpers.js, logger.js
    ├── validators/              # authValidator, submissionValidator
    └── server.js
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/JanVikas-Ai.git
cd JanVikas-Ai
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env    # Fill in your MongoDB URI and JWT secret
npm run dev             # Starts on http://localhost:5000
```

### 3. Seed Demo Data
```bash
cd backend
node fix-seeds.js       # Creates the 3 demo users with hashed passwords
```

### 4. Setup Frontend
```bash
cd frontend
npm install
npm run dev             # Starts on http://localhost:5173
```

---

## 🔑 Demo Credentials

> ⚡ On the Login page, click the colored buttons to **auto-fill** demo credentials instantly!

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 🏠 **Citizen** | `citizen@test.com` | `Password123` | Submit & track issues |
| 🏛️ **Official** | `official@test.com` | `Password123` | Full Official dashboard + AI insights |
| 🛡️ **Admin** | `admin@test.com` | `Password123` | System-wide administration |

---

## 📈 Analytics & Big Data Architecture

```mermaid
graph TD
    A[Citizen Interactions] --> B(Ingestion Layer)
    B --> C{Data Processing}
    C -->|Real-time| D[Stream Analytics]
    C -->|Batch| E[Data Lake]
    
    D --> F[Geospatial Mapping]
    D --> G[Sentiment Analysis]
    
    E --> H[Predictive Budgeting]
    E --> I[Resource Allocation]
    
    F & G & H & I --> J((Analytics Dashboard))
```

---

## 🌐 API Routes

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/me` | Get current user (protected) |
| PUT | `/api/auth/profile` | Update profile (protected) |
| PUT | `/api/auth/change-password` | Change password (protected) |

### Submissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/submissions` | Create new submission |
| GET | `/api/submissions` | Get all submissions (filtered) |
| GET | `/api/submissions/:id` | Get single submission |
| PATCH | `/api/submissions/:id/status` | Update status (MP/Admin) |
| POST | `/api/submissions/:id/vote` | Upvote a submission |
| GET | `/api/submissions/map` | Get geo-coordinates for map |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/recommendations` | AI-ranked priority queue for MP |
| GET | `/api/ai/duplicates` | Detected duplicate clusters |
| GET | `/api/ai/summary` | Executive summary for district |
| GET | `/api/ai/clusters` | Semantic topic clusters |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | KPI stats for dashboard |
| GET | `/api/analytics/trends` | Monthly trend data |
| GET | `/api/analytics/categories` | Category breakdown |

---

## 🔮 Future Scope

```mermaid
roadmap
    title JanVikas AI Roadmap
    section Phase 1 - Current (MVP)
        Citizen submission portal          : done, 2024-01, 2024-03
        AI priority engine                 : done, 2024-02, 2024-03
        Official dashboard + analytics     : done, 2024-02, 2024-04
        Admin panel                        : done, 2024-03, 2024-04
    section Phase 2 - Enhancement
        WhatsApp Bot integration           : 2024-05, 2024-06
        Real LLM integration (Gemini API)  : 2024-05, 2024-07
        Push notifications via FCM         : 2024-06, 2024-07
        Mobile app (React Native)          : 2024-06, 2024-08
    section Phase 3 - Scale
        Multi-constituency Official accounts : 2024-09, 2024-10
        Government API integration (Data.gov.in) : 2024-09, 2024-11
        Blockchain audit trail             : 2024-10, 2024-12
        National deployment                : 2024-11, 2025-01
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Made with ❤️ for India's Democracy
  
  <br/>
  
  **JanVikas AI** — *Empowering the Voice of Every Citizen*
</div>
