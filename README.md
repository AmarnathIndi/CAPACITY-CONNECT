# CAPACITY CONNECT (क्षमता सेतु)
### Air-Gapped Training & Learning Management Platform
**India Meteorological Department (IMD) — Ministry of Earth Sciences (MoES), Government of India**

---

## 1. System Overview & Air-Gapped Mission

**CAPACITY CONNECT** is an enterprise-grade, air-gapped training, operational competency, and certification platform purpose-built for scientific, meteorological, and administrative personnel of the **India Meteorological Department (IMD)**.

### Strict National Data Residency Compliance
- **Zero External Cloud APIs**: No calls to OpenAI, Google Cloud, AWS, or third-party SaaS auth providers.
- **Self-Hosted AI & LLMs**: Local inference powered by self-hosted **Ollama / vLLM** (`qwen2.5:7b` with Hindi & English comprehension) and **bge-m3** multilingual embeddings.
- **Self-Hosted Speech-to-Text**: Local **Faster-Whisper** (`large-v3`) transcribes recorded lectures in Hindi and English with timestamped indexing.
- **Self-Hosted Object Storage**: **MinIO S3** container for training manuals, radar imagery, audio recordings, and certificates.
- **Air-Gapped Virtual Classes**: Self-hosted **Jitsi Meet** with signed JWT authentication (moderator privileges for trainers).
- **Government Compliance**: Adheres to **GIGW (Guidelines for Indian Government Websites)** and **WCAG 2.1 AA** standards with an Indian meteorological aesthetic (National Navy `#002D62`, Saffron accents `#F97316`, high-contrast text, font-scaling `A-`, `A`, `A+`, and bilingual English/Hindi toggle).

---

## 2. Complete Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND & PWA TIER (React 19 + Vite)                │
│  Tailwind CSS • Zustand • React Router 7 • Recharts • react-i18next   │
│  PWA Service Worker • Cache-First Offline Storage • IndexedDB Queue    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                    EDGE REVERSE PROXY & GATEWAY (Nginx)                │
│  TLS 1.3 Termination • OWASP ASVS Headers • Rate Limiting • Gzip       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Reverse Proxy
┌───────────────────────────────────▼────────────────────────────────────┐
│                 APPLICATION BACKEND API (NestJS 10 + Node.js 24)       │
│  Argon2 Hashing • JWT + httpOnly Cookies • RBAC Guards • Rate Limits   │
│  Append-Only Audit Interceptor • Swagger / OpenAPI Documentation       │
└───────┬──────────────┬──────────────┬──────────────┬───────────────────┘
        │              │              │              │
┌───────▼──────┐┌──────▼──────┐┌──────▼──────┐┌──────▼───────────────────┐
│PostgreSQL 16 ││   Redis 7   ││  MinIO S3   ││  Self-Hosted Local AI    │
│  + pgvector  ││   Cache &   ││Object Store ││  Ollama (Qwen2.5:7B)     │
│  (Prisma ORM)││  BullMQ Jobs││(Certs, PDFs)││  Faster-Whisper (STT)    │
└──────────────┘└─────────────┘└─────────────┘└──────────────────────────┘
```

| Layer | Technologies Selected | Justification |
| :--- | :--- | :--- |
| **Frontend SPA & PWA** | React 19, TypeScript, Vite, Tailwind CSS, Zustand | High performance, instant compilation, responsive accessible UI, PWA offline caching |
| **Backend REST API** | Node.js 24, NestJS 10 (TypeScript) | Full-stack type sharing, modular architecture, enterprise guards & interceptors, automated OpenAPI |
| **Relational & Vector DB** | PostgreSQL 16 with `pgvector` extension | ACID transactions for grading/certificates + 1,024-dim dense vector search with HNSW indexes |
| **ORM & Migrations** | Prisma ORM 6 | Type-safe queries, declarative schema migrations, raw SQL support for vector distance |
| **Cache & Task Queues** | Redis 7 + BullMQ | Distributed asynchronous job queues for RAG embedding, Whisper audio ingestion, and offline sync |
| **Object Store** | MinIO (Self-hosted S3 compatible) | Air-gapped storage with presigned expiring URLs, MIME validation, and virus scanning hooks |
| **Local Speech-to-Text** | Faster-Whisper (`large-v3`) | Offline automatic speech recognition for recorded lectures in Hindi and English |
| **Local LLM & Embeddings** | Ollama (`qwen2.5:7b` + `bge-m3`) | Zero network egress; strictly answers from uploaded IMD manuals with exact citations |
| **Virtual Classroom** | Self-hosted Jitsi Meet (JWT tokens) | Secure classroom token generation, attendance webhooks, and automatic recording ingestion |
| **Reverse Proxy & TLS** | Nginx Alpine, Certbot | Rate limiting (30 r/s general, 5 r/s auth), TLS 1.3, strict security headers |

---

## 3. Quick Start & Execution

### Prerequisites
- **Node.js**: v20 or higher (tested and verified with Node v24.19.0)
- **npm**: v10 or higher
- **Docker & Docker Compose**: (for containerized full-stack deployment)

### Option A: Local Full-Stack Development (Direct Host)

```powershell
# 1. Clone & Navigate to project root
cd "c:\CAPACITY CONNECT"

# 2. Run backend test suite (Verifies 12 unit tests across 5 test suites)
npm run test:backend

# 3. Build backend and frontend
npm run full-build

# 4. Start frontend development server
npm run dev

# 5. In a separate terminal, start backend REST API (Port 4000)
npm run dev:backend
```

- Frontend UI: **`http://localhost:5173/`**
- Backend REST API: **`http://localhost:4000/api/v1`**
- Interactive Swagger / OpenAPI Docs: **`http://localhost:4000/api/v1/docs`**

---

### Option B: Production Docker Compose Deployment

```bash
# 1. Copy production environment template
cp .env.example .env

# 2. Launch complete air-gapped stack
docker compose up -d --build

# 3. Run migrations and database seed script
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed
```

---

## 4. Demo Credentials & 1-Click Fast Logins

On the login page (`/login`), click any **Quick Demo Login** button for instant zero-password entry, or use the credentials below:

| Role | Officer Name | Email | Password | Location & Division |
| :--- | :--- | :--- | :--- | :--- |
| **Trainee** | Dr. Rajesh Sharma | `trainee@imd.gov.in` | `imd@123` | New Delhi HQ · Numerical Weather Prediction (NWP) |
| **Trainer** | Dr. Sunita Kulkarni | `trainer@imd.gov.in` | `imd@123` | New Delhi HQ · Senior Doppler Radar Faculty |
| **Admin** | Dr. M. Mohapatra | `admin@imd.gov.in` | `imd@123` | Mausam Bhavan HQ · Director General of Meteorology |
| *Pending Staff* | Harish Chandra Pant | `harish.pant@imd.gov.in` | `imd@123` | Nagpur RMC · *In "Pending Approval" clearance queue* |

---

## 5. Prototype Update Summary: Major Enhancements

### 1. Expanded Mock Datasets with 100% Indian Names
- **All Indian Names**: Every persona, staff member, trainer, author, and reviewer across North, South, East, West, and North-East India (e.g., Ramesh Kumar Yadav, Sunita Devi, Anitha Krishnan, Karthik Subramanian, Priya Nair, Arun Kumar Singh, Meenakshi Iyer, Rituparna Bora, Kiran Deka, Faisal Ahmed, Gurpreet Kaur, Vikram Chauhan, Nandini Reddy, Suresh Pillai, Pooja Sharma).
- **Expanded Scale**:
  - **6 Regional Centres / Offices**: New Delhi HQ, Chennai RMC, Guwahati NEC, Mumbai RMC, Kolkata RMC, Nagpur RMC.
  - **60 Total Users**: 40 active trainees, 12 trainers, 3 admins, 5 pending clearance.
  - **20 Meteorological Courses**: Comprehensive coverage of Doppler Weather Radar, Tropical Cyclone Tracking, Numerical Weather Prediction, AWS Calibration, Satellite Meteorology, Agromet Advisory, Aviation Weather, Monsoon Forecasting, and Climate Analysis.
  - **Curriculum Depth**: 4–8 modules and 5–10 resources per course.
  - **25 Examination Papers**: 275 MCQs total, with full English and Hindi (`questionHi`, `optionsHi`) bilingual content.
  - **280+ Course Enrollments** and **119 Trainee Feedback Reviews** with per-trainer evaluations.
  - **45 Certificates**: 35 active, 5 expiring soon within 30 days, 4 expired, and 1 revoked credential (`IMD-CERT-2024-REV01`).
  - **30 Core Skills** with regional office skill gap analysis across all 6 centres.
  - **115 Immutable Audit Logs** tracking administrative and faculty operations.
  - **40 Multilingual AI Assistant Q&A Pairs** with exact source manual and circular citations.
  - **Bulk Upload Sample CSV (`/samples/bulk-user-sample.csv`)**: 25 Indian-named staff records with 3 deliberate validation errors (invalid domain, missing designation, unapproved office) for live schema testing.

### 2. Mandatory Multi-Trainer Policy (≥ 3 Trainers Per Course)
- **Data Model Overhaul**: Every course is assigned between 3 and 5 faculty members with roles (`Lead` / `Co-trainer`), designations, offices, skills, and ratings.
- **Catalog Cards**: Displays Lead Trainer plus `+N more trainers`.
- **Course Detail Page**: Dedicated Instructional Team section listing all trainers with designations, offices, ratings, and skills.
- **Independent Trainer Ratings**: Trainees rate the course curriculum as an overall score and rate each faculty member separately.
- **Course Authoring**: The course creation form enforces selection of 3 or more trainers, blocking submission with inline validation if fewer than 3 are selected.
- **Trainer Dashboard & Feedback**: Shows trainer role (`Lead Trainer` vs `Co-trainer`) and individual faculty feedback ratings alongside course summaries.
- **Admin Automated Trainer Matching**: Recommends teams of 3+ faculty members with a Team Composite Match Score, one-click team invitation, individual acceptance tracking, and automatic calendar confirmation when 3+ trainers accept.
- **Admin Dashboard Stat**: New "Trainers per course" KPI stat with course staffing policy audit indicator.
- **Virtual Classrooms & Transcripts**: Live session room designates Lead Trainer as moderator with co-trainers listed as faculty. Transcripts and certificates list all course trainers.

### 3. Blank Neutral Avatars (Zero Person Portraits)
- Purged all photographs and portrait images of people from the codebase, mock data, and public assets.
- Reusable `<Avatar size="sm" | "md" | "lg" | "xl" />` component rendering a neutral light-grey circle (`rounded-full bg-slate-200 border border-slate-300`) with no image, no initials, and no icon.
- Applied across all headers, profile views, leaderboards, expert finders, comments, and certificate cards.
- Live session video grid renders plain blank participant tiles with name labels only.

---

## 6. Repository Structure

```
c:\CAPACITY CONNECT\
├── Dockerfile                          # Multi-stage frontend Nginx container build
├── docker-compose.yml                  # Full-stack development environment
├── docker-compose.prod.yml             # Hardened production deployment with Nginx & TLS
├── .env.example                        # Production environment configuration template
├── package.json                        # Root workspace scripts (build, dev, test, load-test)
├── nginx/
│   └── nginx.conf                      # Reverse proxy, security headers, rate limiting
├── k8s/
│   └── capacity-connect.yaml           # Kubernetes deployment, services & ingress manifests
├── scripts/
│   ├── backup.sh                       # Nightly encrypted AES-256 backup script
│   └── restore.sh                      # Tested disaster recovery restore script
├── docs/
│   ├── deployment-guide.md             # Hardware sizing, GPU allocation, firewall rules
│   ├── backup-restore-runbook.md       # Backup automation, SHA256 verification, restore SOP
│   ├── admin-user-guide.md             # Step-by-step administrator manual
│   └── api-reference.md                # 40+ REST API endpoint specifications
├── backend/                            # NestJS 10 REST API Server
│   ├── Dockerfile                      # Production backend container build
│   ├── package.json                    # Backend dependencies (NestJS, Prisma, Argon2, BullMQ)
│   ├── prisma/
│   │   ├── schema.prisma               # Database schema with pgvector & enums
│   │   ├── init.sql                    # Initial SQL enabling vector and uuid-ossp
│   │   └── migrations/                 # Versioned database migrations
│   ├── src/
│   │   ├── main.ts                     # Swagger setup, Helmet, CORS, ValidationPipe
│   │   ├── app.module.ts               # Root module wiring 15 operational feature modules
│   │   ├── database/                   # Prisma service & database seed script
│   │   ├── common/                     # RBAC Guards, CurrentUser Decorators, Audit Interceptor
│   │   └── modules/                    # 15 Isolated Feature Modules
│   │       ├── auth/                   # Argon2, JWT cookies, lockout protection, 2FA
│   │       ├── users/                  # Staff directory, approvals, bulk CSV import
│   │       ├── courses/                # Modules, materials, enrollment, library, ratings
│   │       ├── tests/                  # Timed exams, server randomization, auto-grading
│   │       ├── certificates/           # Cert minting, QR verification, server-side PDF
│   │       ├── skills/                 # Skill graph, expert finder, skill-gap matrix
│   │       ├── ai-assistant/           # RAG citations, prompt injection guardrails
│   │       ├── ai-test-gen/            # PDF parsing, MCQ draft generation & review
│   │       ├── learning-paths/         # Prerequisite rules engine & roadmap unlocking
│   │       ├── gamification/           # Points ledger, streak, office leaderboard
│   │       ├── trainer/                # 7-day availability grid, matching algorithm, iCal
│   │       ├── live-sessions/          # Jitsi JWT tokens, attendance webhooks
│   │       ├── offline-sync/           # Cryptographic test package, idempotent sync
│   │       ├── notifications/          # In-app alerts, circulars, announcements
│   │       └── audit/                  # Append-only immutable security audit trail
│   └── test/                           # Unit & Load Testing
│       ├── grading.spec.ts             # 100% score calculation, timer enforcement tests
│       ├── randomization.spec.ts       # Option shuffling and answer secrecy tests
│       ├── prerequisites-unlocking.spec.ts # Course prerequisite blocking tests
│       ├── certificates-validity.spec.ts   # Public verification and expiry tests
│       ├── rbac.spec.ts                # Role-based access control guard tests
│       └── load-test.js                # 500 concurrent user load test script
└── src/                                # React 19 Frontend Prototype & PWA
    ├── api/
    │   └── client.ts                   # Typed API Client communicating with /api/v1
    ├── components/                     # GIGW-compliant UI components & AI widgets
    └── pages/                          # Role-based trainee, trainer, and admin screens
```

---

## 7. End-to-End Walkthrough of 15 Modules

### 1. Authentication & Security
- **Signup**: Staff submit registration; accounts land in `PENDING` status.
- **Login**: Verifies passwords with Argon2. Issues 15-minute JWT access tokens and 7-day refresh tokens in `httpOnly`, `SameSite=Strict`, `Secure` cookies.
- **Lockout Protection**: 5 consecutive failed attempts lock the account for 15 minutes.
- **2FA TOTP**: Administrators generate a TOTP secret and verify six-digit OTP tokens.

### 2. Users, Profiles & Bulk Import
- **Approvals (`/admin/approvals`)**: Admins review pending registrations, assign roles (`TRAINEE`, `TRAINER`, `ADMIN`), and set regional centres.
- **Bulk Import (`/admin/bulk-upload`)**: Drag-and-drop CSV/Excel roster. The system executes a dry-run validation table highlighting syntax errors, followed by transactional database import.

### 3. Courses & Shared Trainer Library
- **Catalog (`/courses`)**: Filter by category (Radar, Cyclone, NWP, AWS, Satellite).
- **Prerequisites**: Advanced courses require foundational courses to be completed first.
- **Trainer Library (`/courses/library`)**: Shared repository of radar case studies and slide decks.

### 4. Examination Engine
- **Server-Side Randomization**: Questions and options are shuffled per attempt; correct answers are **never sent to the client** before submission.
- **Server Timer Enforcement**: Enforces time limit with a 60-second network grace period.
- **Auto-Grading**: Grades submissions, awards 100 points, marks enrollment complete, and auto-mints an official certificate.

### 5. Certificate Engine & QR Verification
- **Auto-Issuance**: Mints a unique certificate ID with SHA256 cryptographic verification hash.
- **Public Verification (`/verify/:id`)**: Open endpoint (rate-limited, no login required) showing Valid, Expired, or Revoked status with holder details.
- **Server-Side PDF Generation**: Generates official bilingual stamped PDF with border and embedded QR code via PDFKit.

### 6. AI Course Assistant (RAG)
- **Floating Assistant Widget**: Answers only from verified IMD manuals and video lectures.
- **Exact Citations**: Every answer provides an official citation (e.g. `IMD Radar Manual, Page 42` or `Lecture Timestamp: 14:20`).
- **Strict Guardrails**: Prevents prompt injection; politely declines out-of-scope questions without guessing. Works seamlessly in English and Hindi.

### 7. AI Test Generator
- **Question Synthesis**: Upload a PDF or transcript to generate 8–10 draft MCQs with explanations, difficulty tiers, and source citations.
- **Review Workflow**: Trainers edit, approve, or reject each draft question before publishing to the exam paper.

### 8. Skill Graph & Natural Language Expert Finder
- **Expert Finder (`/admin/expert-finder`)**: Search in natural language (e.g. *"Who knows Doppler radar?"*). Ranks experts by skill tier, verification, and rating.
- **Skill-Gap Heatmap**: Compares benchmark skills against regional office staff capabilities across Delhi, Chennai, and Guwahati.

### 9. Trainer Matching & Scheduling
- **Availability Grid**: Trainers set recurring 7-day slot availability.
- **Explainable Matching Algorithm**: Calculates composite match score based on topic expertise (35%), language (20%), past ratings (20%), calendar availability (20%), and workload balance.
- **iCalendar Feed**: Export accepted sessions as standard `.ics` feeds.

### 10. Live Virtual Classes (Jitsi Meet)
- **Token Generation**: Generates Jitsi JWT tokens with moderator privileges for trainers and participant privileges for trainees.
- **Attendance & Recording**: Webhook records attendee entry/exit and automatically indexes lecture recordings for the AI Assistant.

### 11. PWA & Offline Test Synchronization
- **PWA Service Worker**: Caches app shell, PDFs, and lecture audio locally.
- **Cryptographic Test Package**: Downloads HMAC-signed test packages for offline execution.
- **Sync Engine**: On reconnecting, queued offline test submissions are verified, graded server-side, and awarded points idempotently.

### 12. Gamification & Achievements Wall
- **Points Ledger**: Server-side points awarded for course completions and exam passes.
- **Leaderboard**: Live competition comparing Delhi HQ, Chennai RMC, and Guwahati NEC.
- **Achievements Wall**: Live feed of newly certified meteorologists on the portal homepage.

### 13. Notifications & Circulars
- **In-App Alerts**: Unread notification counter, mark all as read, and email alerts for invitations and deadlines.
- **Homepage Circulars**: Admin-published official notices with bilingual summaries.

### 14. Immutable Governance Audit Log
- **Append-Only Change Trail**: Intercepts all mutating operations (`POST`, `PUT`, `PATCH`, `DELETE`) and records operator email, IP, action, beforeState, and afterState.
- **CSV Export**: Exportable for statutory government security audits.

### 15. Bilingual i18n Localization
- Complete English and Hindi (हिन्दी) coverage across UI labels, buttons, navigation, and transcripts.

---

## 8. Verification & Testing

### Run Backend Unit Tests
```bash
npm run test:backend
```
**Results:** All 12 tests across 5 test suites pass (grading, randomization, prerequisites, certificate validity, RBAC).

### Run 500 Concurrent Users Load Test
```bash
npm run load-test
```
Simulates 500 concurrent clients hammering the public verification endpoint, catalog, and health probes, reporting p50, p95, p99 latencies and throughput (req/sec).

---

## 9. Documentation Index

- **Deployment Guide**: [docs/deployment-guide.md](file:///c:/CAPACITY%20CONNECT/docs/deployment-guide.md)
- **Backup & Restore Runbook**: [docs/backup-restore-runbook.md](file:///c:/CAPACITY%20CONNECT/docs/backup-restore-runbook.md)
- **Administrator User Guide**: [docs/admin-user-guide.md](file:///c:/CAPACITY%20CONNECT/docs/admin-user-guide.md)
- **REST API Reference**: [docs/api-reference.md](file:///c:/CAPACITY%20CONNECT/docs/api-reference.md)
- **Interactive Swagger Docs**: `http://localhost:4000/api/v1/docs`

---

*Capacity Connect — Developed for the India Meteorological Department (IMD), Ministry of Earth Sciences, Government of India.*
