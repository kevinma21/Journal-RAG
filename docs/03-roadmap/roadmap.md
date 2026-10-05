# JournalPilot — Development Roadmap

**Project:** JournalPilot  
**Document:** Roadmap  
**Version:** 1.0  
**Status:** Final  
**Date:** October 2026  
**Author:** Kevin Pratama

---

## 1. Roadmap Overview

### 1.1 Purpose

This roadmap translates the approved JournalPilot PRD, architecture, and data model into an implementation sequence.

JournalPilot is a solo-developed, web-first, multi-tenant AI-augmented digital journal. The MVP focuses on:

- secure authentication and tenant isolation
- journal and entry management
- multimodal memories
- asynchronous AI ingestion
- hybrid RAG
- grounded conversational AI
- weekly AI reflection
- reliability, security, testing, and deployment

The roadmap is intentionally organized around **vertical product capabilities**, rather than around individual technologies.

---

### 1.2 Development Strategy

```text
Foundation
    ↓
Authentication
    ↓
Journal & Entries
    ↓
Multimodal Memories
    ↓
AI Ingestion
    ↓
Hybrid RAG
    ↓
Weekly Reflection
    ↓
MVP Hardening
    ↓
MVP Release
```

The implementation should follow this principle:

> Build the smallest complete path through the system before expanding individual subsystems.

---

### 1.3 MVP Goal

A user should be able to:

```text
Sign up
  ↓
Create a journal
  ↓
Write an entry
  ↓
Attach an image
  ↓
Add a location
  ↓
Save the entry
  ↓
Background AI processing
  ↓
Memory indexed
  ↓
Ask a question
  ↓
Retrieve relevant memories
  ↓
Receive a grounded answer
  ↓
Receive a weekly reflection
```

---

# 2. Technology Stack

This section defines the implementation technologies used throughout the roadmap.

The roadmap distinguishes between:

- **Core** — required for the architecture/MVP.
- **Recommended** — strongly recommended implementation tooling.
- **Supporting** — useful for development, testing, observability, and deployment.
- **Post-MVP** — intentionally deferred.

---

## 2.1 Application Stack

| Area | Technology | Role | Priority |
|---|---|---|---|
| Frontend | Next.js | Web application | Core |
| Frontend language | TypeScript | Type-safe application code | Core |
| Backend | NestJS | REST API and application backend | Core |
| Runtime | Node.js | Frontend/backend runtime | Core |
| API validation | Zod | Runtime schema validation at application boundaries | Recommended |
| API documentation | Swagger / OpenAPI | API documentation and testing | Recommended |
| ORM | Prisma | Type-safe relational database access | Recommended |
| SQL | PostgreSQL SQL | Relational queries, extensions, migrations where needed | Core |
| Styling | Tailwind CSS | UI styling | Recommended |
| UI components | Accessible component primitives | Reusable UI components | Recommended |
| Rich text | Markdown / Markdown parser | Journal content representation | Core |

### Prisma and PostgreSQL extensions

Prisma is the recommended ORM for standard relational operations.

PostGIS and pgvector may require SQL migrations, raw SQL, or Prisma-supported extension mechanisms where ORM abstractions are insufficient.

Do not force every database operation through the ORM.

---

## 2.2 Authentication and Storage

| Technology | Role | Priority |
|---|---|---|
| Supabase Auth | User authentication and identity | Core |
| Supabase Storage | Image/media object storage | Core |
| Signed URLs | Secure direct media upload/download | Core |
| PostgreSQL | Application data | Core |

Authentication identity must come from the authenticated server context.

The API must never trust an arbitrary `user_id` sent by the client.

---

## 2.3 Database and Search

| Technology | Role | Priority |
|---|---|---|
| PostgreSQL | Authoritative application data store | Core |
| pgvector | Vector embeddings and semantic retrieval | Core |
| PostGIS | Location/geospatial queries | Core |
| PostgreSQL indexes | Query performance | Core |
| Full-text search / PostgreSQL text search | Optional lexical retrieval support | Recommended |

PostgreSQL remains the source of truth.

Redis is not a source of truth.

---

## 2.4 Background Processing

| Technology | Role | Priority |
|---|---|---|
| Redis | Queue/cache infrastructure | Core |
| BullMQ | Background job queue | Core |
| NestJS worker | AI ingestion and asynchronous processing | Core |

Typical flow:

```text
NestJS API
    ↓
Create/Update Journal Entry
    ↓
Create AI Processing record
    ↓
Add BullMQ job
    ↓
Redis
    ↓
Worker
    ↓
AI Provider
    ↓
PostgreSQL
```

---

## 2.5 AI Stack

| Technology | Role | Priority |
|---|---|---|
| AI Provider Abstraction | Prevent provider lock-in | Core |
| OpenAI | LLM / embeddings / multimodal processing where selected | Core provider |
| Gemini | Alternative AI provider | Optional provider |
| Embeddings | Semantic memory representation | Core |
| LLM | Chat and reflection generation | Core |
| Vision-capable model | Image understanding | Core for multimodal AI |
| Structured JSON output | Reliable AI metadata | Recommended |

The application should depend on an internal interface such as:

```text
AIProvider
├── generateText()
├── generateStructuredOutput()
├── generateEmbedding()
└── analyzeImage()
```

The rest of the application should not directly depend on provider-specific SDK behavior.

---

## 2.6 Development and Infrastructure

| Technology | Role | Priority |
|---|---|---|
| Docker | Reproducible local infrastructure | Core |
| Docker Compose | Local service orchestration | Core |
| Supabase CLI | Local Supabase development when useful | Recommended |
| Git | Version control | Core |
| GitHub | Repository and collaboration | Recommended |
| Environment variables | Secrets/configuration | Core |
| `.env.example` | Document required configuration | Core |

Local infrastructure should remain simple.

Recommended local setup:

```text
Docker / Docker Compose
│
├── Redis
│
└── PostgreSQL
    ├── pgvector
    └── PostGIS
```

If the local Supabase stack is used, the Supabase CLI may manage the local PostgreSQL/Auth/Storage environment instead of maintaining a separate PostgreSQL container.

Do not run both approaches unnecessarily.

---

## 2.7 Testing Stack

| Technology | Role | Priority |
|---|---|---|
| Vitest or Jest | Unit testing | Recommended |
| NestJS testing utilities | Backend tests | Core |
| React Testing Library | Frontend component tests | Recommended |
| Supertest | API/integration testing | Recommended |
| Playwright | End-to-end browser testing | Recommended |
| Test PostgreSQL database | Integration tests | Core |
| Test Redis instance | Queue tests | Recommended |

Testing should focus on behavior and system boundaries rather than implementation details.

---

## 2.8 Code Quality

| Technology | Role | Priority |
|---|---|---|
| ESLint | Static analysis | Core |
| Prettier | Formatting | Recommended |
| TypeScript strict mode | Type safety | Core |
| Husky | Git hooks | Optional |
| lint-staged | Run checks on changed files | Optional |

Avoid adding tooling simply because it is popular.

---

## 2.9 CI/CD and Deployment

| Technology | Role | Priority |
|---|---|---|
| GitHub Actions | CI pipeline | Recommended |
| Production hosting for Next.js | Frontend deployment | Required for release |
| Production hosting for NestJS | API deployment | Required for release |
| Worker hosting | BullMQ worker deployment | Required for AI processing |
| Supabase | Managed PostgreSQL/Auth/Storage | Core |
| Redis hosting | Production queue infrastructure | Required for AI processing |
| HTTPS/TLS | Secure communication | Required |
| Secret management | Production credentials | Required |

The exact hosting provider is intentionally not fixed in the roadmap.

---

## 2.10 Observability

Start simple.

| Technology / Practice | Role | Priority |
|---|---|---|
| Structured application logs | Debugging and operations | Core |
| Request/error logging | API troubleshooting | Core |
| Job status logging | AI pipeline troubleshooting | Core |
| Health checks | Service availability | Recommended |
| Error tracking service | Production error visibility | Recommended |
| Metrics | Performance and reliability | Later |
| Distributed tracing | Cross-service tracing | Post-MVP unless needed |

Do not introduce a large observability stack before the application needs it.

---

# 3. Technology Rules

## 3.1 Technologies We Will Use

The MVP stack is:

```text
Frontend
├── Next.js
├── TypeScript
├── Tailwind CSS
└── React

Backend
├── NestJS
├── TypeScript
├── Zod
└── Swagger / OpenAPI

Data
├── PostgreSQL
├── Prisma
├── pgvector
└── PostGIS

Auth & Media
├── Supabase Auth
└── Supabase Storage

Async Processing
├── Redis
└── BullMQ

AI
├── AI Provider Abstraction
├── OpenAI
├── Gemini (optional provider)
├── Embeddings
└── Vision-capable LLM

Development
├── Git
├── GitHub
├── Docker
└── Docker Compose

Testing
├── Unit tests
├── Integration tests
└── Playwright E2E tests

CI/CD
└── GitHub Actions
```

---

## 3.2 Technologies We Will Not Add to MVP

Avoid:

- Kubernetes
- Kafka
- RabbitMQ
- microservices
- service mesh
- Elasticsearch
- separate vector database
- separate geospatial database
- GraphQL unless a concrete requirement appears
- event sourcing
- CQRS infrastructure
- complex distributed tracing
- self-hosted model infrastructure
- multiple AI providers in production unless needed

The goal is a production-quality **modular monolith**, not a distributed system.

---

# 4. Definition of Done

## 4.1 Feature-Level Definition of Done

A feature is complete when:

- the backend behavior is implemented
- validation is implemented
- authorization is enforced
- tenant/user scope is enforced
- database changes are complete
- frontend behavior is complete where applicable
- loading/error/empty states are handled
- relevant tests exist
- logs exist for important asynchronous operations
- the feature works through the intended user flow
- documentation is updated if the architecture or behavior changed

---

## 4.2 Phase-Level Definition of Done

A phase is complete when:

1. its functionality works end-to-end
2. security boundaries are enforced
3. relevant tests pass
4. obvious failure cases are handled
5. the phase exit criteria are satisfied
6. no unnecessary infrastructure was introduced

---

# 5. Phase 0 — Project Foundation

## Goal

Create the repository, applications, development environment, database foundation, and engineering conventions.

## Tasks

### Repository

- [x] Initialize Git repository
- [x] Create GitHub repository
- [x] Establish branch strategy
- [x] Create README
- [x] Create `.gitignore`
- [x] Create `.env.example`

### Frontend

- [x] Initialize Next.js application
- [ ] Configure TypeScript
- [ ] Enable strict mode
- [ ] Configure Tailwind CSS
- [ ] Establish application layout
- [ ] Establish frontend folder conventions

### Backend

- [ ] Initialize NestJS application
- [ ] Configure TypeScript
- [ ] Establish module structure
- [ ] Establish API versioning
- [ ] Establish global error handling
- [ ] Establish request validation

### Validation

- [ ] Add Zod
- [ ] Define validation conventions
- [ ] Validate API input at boundaries
- [ ] Define shared DTO/schema strategy

### Database

- [ ] Configure PostgreSQL
- [ ] Enable pgvector
- [ ] Enable PostGIS
- [ ] Configure Prisma
- [ ] Establish database migration strategy
- [ ] Implement initial schema foundation

### Supabase

- [ ] Configure Supabase project
- [ ] Configure Supabase Auth
- [ ] Configure Supabase Storage
- [ ] Define storage bucket structure
- [ ] Configure local development strategy

### Redis / BullMQ

- [ ] Add Redis
- [ ] Add BullMQ
- [ ] Create worker application/module
- [ ] Create basic health check job
- [ ] Define job naming conventions

### Docker

- [ ] Create Docker configuration
- [ ] Create Docker Compose configuration
- [ ] Add local Redis
- [ ] Add local PostgreSQL if using containerized PostgreSQL
- [ ] Document local setup

### API Documentation

- [ ] Configure Swagger/OpenAPI
- [ ] Document initial health endpoint
- [ ] Establish API response conventions

### Code Quality

- [ ] Configure ESLint
- [ ] Configure Prettier
- [ ] Add formatting scripts
- [ ] Add lint scripts
- [ ] Add type-check scripts

## Deliverables

```text
Next.js app
NestJS API
Worker
PostgreSQL
pgvector
PostGIS
Redis
BullMQ
Supabase Auth
Supabase Storage
Prisma
Zod
Docker
Swagger
ESLint
Prettier
```

## Exit Criteria

- [ ] Frontend starts locally
- [ ] API starts locally
- [ ] Worker starts locally
- [ ] Database connection works
- [ ] pgvector is available
- [ ] PostGIS is available
- [ ] Redis connection works
- [ ] A BullMQ test job executes
- [ ] Supabase Auth configuration works
- [ ] Storage configuration works
- [ ] Swagger is accessible
- [ ] Lint/type checks pass

---

# 6. Phase 1 — Authentication & User

## Goal

Create secure user authentication and the foundation for tenant isolation.

## Features

- [ ] Sign up
- [ ] Login
- [ ] Logout
- [ ] Password reset
- [ ] Google authentication
- [ ] Session handling
- [ ] Authenticated API requests
- [ ] User identity extraction
- [ ] Authorization guards
- [ ] User ownership checks

## Technologies

```text
Next.js
NestJS
TypeScript
Supabase Auth
Zod
PostgreSQL
Prisma
Swagger
```

## Security Requirements

- [ ] Never trust client-provided `user_id`
- [ ] Derive identity from authenticated context
- [ ] Protect authenticated routes
- [ ] Protect database access by ownership
- [ ] Protect storage access
- [ ] Validate all input
- [ ] Handle expired/invalid sessions

## Exit Criteria

A user can securely authenticate and access only their own application resources.

---

# 7. Phase 2 — Journal & Entry Management

## Goal

Implement the core journaling product before introducing AI.

## Journal Management

- [ ] Create journal
- [ ] Rename journal
- [ ] Delete journal
- [ ] List journals
- [ ] Select active journal

## Entry Management

- [ ] Create entry
- [ ] Edit entry
- [ ] Delete entry
- [ ] Restore entry
- [ ] Permanently delete entry
- [ ] List entries
- [ ] View entry
- [ ] Search/filter basic entries
- [ ] Store `occurred_at`
- [ ] Store `created_at`
- [ ] Store `updated_at`
- [ ] Support Markdown/rich content

## Timeline

- [ ] Chronological timeline
- [ ] Date filtering
- [ ] Pagination
- [ ] Entry detail view

## Trash

- [ ] Soft deletion
- [ ] Trash listing
- [ ] Restore
- [ ] Permanent deletion

## Technologies

```text
Next.js
React
TypeScript
Tailwind CSS
NestJS
Zod
Prisma
PostgreSQL
Swagger/OpenAPI
```

## Exit Criteria

The user can create, edit, browse, delete, and restore journal entries without AI functionality.

---

# 8. Phase 3 — Multimodal Journal

## Goal

Turn journal entries into multimodal memories containing images, timestamps, and locations.

## Image Upload

- [ ] Add media records
- [ ] Generate signed upload URLs
- [ ] Direct client upload to Supabase Storage
- [ ] Validate file type
- [ ] Validate file size
- [ ] Store media metadata
- [ ] Generate secure access URLs
- [ ] Handle upload failures

## Location

- [ ] Add location to entry
- [ ] Store coordinates
- [ ] Use PostGIS geography/geometry types as appropriate
- [ ] Reverse geocoding integration if required
- [ ] Display location
- [ ] Query nearby entries

## Calendar

- [ ] Calendar view
- [ ] Entries by day
- [ ] Date filtering
- [ ] Month navigation

## Statistics

- [ ] Entry count
- [ ] Entries over time
- [ ] Journal activity
- [ ] Basic statistics

## Places

- [ ] Group memories by location
- [ ] Show places associated with memories
- [ ] Basic geospatial exploration

## Technologies

```text
Next.js
Tailwind CSS
NestJS
Zod
Prisma
PostgreSQL
PostGIS
Supabase Storage
Signed URLs
```

## Exit Criteria

A journal entry can contain text, images, timestamps, and location information and can be explored through timeline/calendar/place views.

---

# 9. Phase 4 — AI Ingestion & Memory Indexing

## Goal

Convert journal data into searchable AI memory asynchronously.

## Processing Pipeline

```text
Journal Entry
     ↓
Create AI Processing record
     ↓
BullMQ Job
     ↓
Redis
     ↓
Worker
     ↓
AI Provider
     ↓
Derived Metadata
     ↓
Embeddings
     ↓
PostgreSQL / pgvector
```

## Background Processing

- [ ] Create AI processing records
- [ ] Define processing states
- [ ] Add jobs to BullMQ
- [ ] Implement worker
- [ ] Implement retries
- [ ] Implement failure handling
- [ ] Implement idempotency
- [ ] Store processing errors
- [ ] Allow retrying failed processing

## Text Processing

- [ ] Prepare journal content
- [ ] Generate embeddings
- [ ] Store embeddings
- [ ] Associate embeddings with source entry
- [ ] Support embedding versioning

## Image Processing

- [ ] Retrieve image securely
- [ ] Send image to vision-capable model
- [ ] Generate image description
- [ ] Generate useful image metadata/tags
- [ ] Store derived metadata
- [ ] Generate image embeddings if required by the final retrieval strategy

## AI Provider Abstraction

- [ ] Define provider interface
- [ ] Implement OpenAI provider
- [ ] Optionally implement Gemini provider
- [ ] Normalize provider responses
- [ ] Centralize AI configuration
- [ ] Centralize AI error handling

## Technologies

```text
NestJS
BullMQ
Redis
PostgreSQL
Prisma
pgvector
OpenAI
Gemini (optional)
AI provider abstraction
Docker
```

## Exit Criteria

New journal content is processed asynchronously and becomes searchable without blocking the journal-writing experience.

If AI processing fails, the original journal entry remains usable.

---

# 10. Phase 5 — Hybrid RAG & AI Chat

## Goal

Allow users to ask natural-language questions about their own memories.

## Retrieval Foundation

Implement retrieval using:

1. semantic similarity
2. temporal constraints
3. geospatial constraints
4. journal scope
5. optional lexical/text matching

## Semantic Retrieval

- [ ] Vector similarity search
- [ ] Top-K retrieval
- [ ] Similarity threshold
- [ ] Metadata filtering
- [ ] User ownership filtering

## Temporal Retrieval

Support queries such as:

```text
What did I do last week?
What happened in January?
What was I doing around my birthday?
```

Implement:

- [ ] Date extraction
- [ ] Date range construction
- [ ] Temporal filtering
- [ ] Temporal + semantic retrieval

## Geospatial Retrieval

Support queries such as:

```text
What did I write when I was in Bandung?
What memories do I have around this place?
```

Implement:

- [ ] Location extraction
- [ ] Radius/nearby queries
- [ ] Spatial filtering
- [ ] Spatial + semantic retrieval

## Hybrid Retrieval

Example:

```text
User Query
   ↓
Query Understanding
   ├── Semantic intent
   ├── Time constraint
   ├── Location constraint
   └── Journal constraint
           ↓
      Retrieval
           ↓
   Candidate Memories
           ↓
       Ranking
           ↓
    Context Assembly
           ↓
          LLM
           ↓
    Grounded Answer
```

## Conversational RAG

- [ ] Conversation creation
- [ ] Message storage
- [ ] Conversation history
- [ ] Follow-up questions
- [ ] Context-aware retrieval
- [ ] Conversation scoping
- [ ] User authorization checks

## Grounding

- [ ] Include retrieved memory context
- [ ] Prevent unsupported claims
- [ ] Distinguish retrieved facts from generated interpretation
- [ ] Return source references where useful
- [ ] Handle insufficient evidence
- [ ] Avoid inventing memories

## Technologies

```text
NestJS
PostgreSQL
pgvector
PostGIS
Prisma
OpenAI
Gemini (optional)
Zod
BullMQ/Redis where asynchronous work is needed
```

## Exit Criteria

A user can ask natural-language questions and receive answers grounded in their authorized journal memories.

---

# 11. Phase 6 — Weekly AI Reflection

## Goal

Generate a recurring reflection based on the user's recent journal activity.

## Scheduling

- [ ] Define weekly schedule
- [ ] Create reflection generation job
- [ ] Use BullMQ for asynchronous execution
- [ ] Prevent duplicate generation
- [ ] Support failed-job retry

## Weekly Retrieval

The reflection should consider the previous seven days.

Retrieve:

- journal entries
- important events
- recurring themes
- notable accomplishments
- challenges
- productivity/activity patterns
- meaningful changes

## Reflection Generation

The AI should generate:

- [ ] Weekly summary
- [ ] Recurring themes
- [ ] Notable events
- [ ] Accomplishments
- [ ] Challenges
- [ ] Observed patterns
- [ ] Comparison with previous periods where supported by evidence

## Grounding Requirements

- [ ] Reflection must be based on journal evidence
- [ ] No speculation presented as fact
- [ ] Empty/low-data weeks handled gracefully
- [ ] Source entries retained
- [ ] Generation status persisted

## Reflection UI

- [ ] Reflection list
- [ ] Reflection detail
- [ ] Reflection date range
- [ ] Source memories
- [ ] Generation status

## Technologies

```text
NestJS
BullMQ
Redis
PostgreSQL
Prisma
OpenAI / Gemini
Next.js
```

## Exit Criteria

A user receives a weekly reflection that is grounded in their journal history and generated asynchronously.

---

# 12. Phase 7 — MVP Hardening

## Goal

Turn the functional system into a reliable MVP suitable for real use.

---

## 12.1 Security

- [ ] Authentication audit
- [ ] Authorization audit
- [ ] Tenant isolation audit
- [ ] Storage access audit
- [ ] Input validation audit
- [ ] File upload validation
- [ ] Rate limiting
- [ ] Secret management
- [ ] Secure headers
- [ ] HTTPS
- [ ] CORS configuration
- [ ] Error response sanitization
- [ ] AI prompt/input safety review

Critical rule:

> Every retrieval path must enforce user/journal ownership.

---

## 12.2 Reliability

- [ ] Database error handling
- [ ] AI provider timeout handling
- [ ] AI provider retry strategy
- [ ] BullMQ retry strategy
- [ ] Idempotent AI jobs
- [ ] Failed processing visibility
- [ ] Graceful API errors
- [ ] Graceful worker shutdown
- [ ] Health checks

---

## 12.3 Performance

Measure:

- [ ] API latency
- [ ] database query performance
- [ ] vector retrieval latency
- [ ] geospatial query latency
- [ ] AI processing time
- [ ] queue wait time
- [ ] frontend load performance

Optimize only after measuring.

---

## 12.4 Testing

### Unit Tests

Test:

- [ ] validation
- [ ] domain/application logic
- [ ] retrieval logic
- [ ] date parsing
- [ ] location filtering
- [ ] authorization rules

### Integration Tests

Test:

- [ ] API + PostgreSQL
- [ ] API + Prisma
- [ ] API + Redis/BullMQ
- [ ] AI processing state transitions
- [ ] retrieval queries

### End-to-End Tests

Use Playwright for:

- [ ] signup/login
- [ ] create journal
- [ ] create entry
- [ ] upload image
- [ ] add location
- [ ] browse timeline
- [ ] ask AI question
- [ ] view reflection
- [ ] delete/restore entry

---

## 12.5 Observability

Implement:

- [ ] structured logs
- [ ] request IDs
- [ ] job IDs
- [ ] processing status logs
- [ ] error logs
- [ ] health endpoints
- [ ] production error tracking

Do not introduce a complex observability platform unless the system requires it.

---

## 12.6 CI/CD

GitHub Actions should run:

```text
Push / Pull Request
        ↓
Install dependencies
        ↓
Lint
        ↓
Type Check
        ↓
Unit Tests
        ↓
Integration Tests
        ↓
Build
        ↓
E2E Tests where appropriate
```

Production deployment should include:

- [ ] frontend deployment
- [ ] API deployment
- [ ] worker deployment
- [ ] database migration process
- [ ] environment variables
- [ ] secrets
- [ ] HTTPS
- [ ] health checks

---

# 13. MVP Release

## 13.1 MVP Feature Checklist

### Authentication

- [ ] Signup
- [ ] Login
- [ ] Logout
- [ ] Password reset
- [ ] Google authentication

### Journaling

- [ ] Multiple journals
- [ ] Create/edit/delete entries
- [ ] Markdown/rich text
- [ ] Timeline
- [ ] Calendar
- [ ] Trash/recovery

### Multimodal

- [ ] Image attachments
- [ ] Location tagging
- [ ] Places
- [ ] Basic statistics

### AI

- [ ] Async AI ingestion
- [ ] Text embeddings
- [ ] Image understanding
- [ ] Hybrid RAG
- [ ] Temporal retrieval
- [ ] Geospatial retrieval
- [ ] AI chat
- [ ] Conversational follow-ups
- [ ] Weekly reflection

### Engineering

- [ ] Tenant isolation
- [ ] Validation
- [ ] Error handling
- [ ] Testing
- [ ] Logging
- [ ] CI/CD
- [ ] Production deployment

---

# 14. MVP Acceptance Criteria

The MVP is ready when:

### Data

- [ ] Users can create and manage journals.
- [ ] Users can create and manage entries.
- [ ] Entries support text, time, images, and location.
- [ ] Deleted entries can be recovered before permanent deletion.

### Retrieval

- [ ] Users can retrieve relevant memories.
- [ ] Semantic retrieval works.
- [ ] Time constraints are respected.
- [ ] Location constraints are respected.
- [ ] Journal/user scope is always respected.

### AI

- [ ] AI processing runs asynchronously.
- [ ] AI failures do not destroy original journal data.
- [ ] AI answers are grounded in retrieved memories.
- [ ] The system does not present unsupported memories as facts.
- [ ] Weekly reflections are grounded in journal evidence.

### Security

- [ ] Users cannot access another user's journals.
- [ ] Users cannot access another user's media.
- [ ] Users cannot retrieve another user's embeddings or AI metadata.
- [ ] Conversation retrieval respects ownership.

### Reliability

- [ ] Failed background jobs can be retried.
- [ ] Important processing states are persisted.
- [ ] API failures are handled gracefully.
- [ ] Critical flows have automated tests.

---

# 15. MVP End-to-End Technical Flow

## 15.1 Journal Entry Creation

```text
Next.js
   ↓
NestJS API
   ↓
Zod Validation
   ↓
Authentication Guard
   ↓
Authorization
   ↓
Prisma / PostgreSQL
   ↓
Journal Entry Created
   ↓
BullMQ Job
   ↓
Redis
   ↓
AI Worker
```

---

## 15.2 Image Upload

```text
Next.js
   ↓
NestJS
   ↓
Authorize user
   ↓
Generate signed URL
   ↓
Supabase Storage
   ↓
Upload image directly
   ↓
NestJS / PostgreSQL
   ↓
Media metadata
```

---

## 15.3 AI Ingestion

```text
Journal Entry
     ↓
BullMQ
     ↓
Redis
     ↓
Worker
     ↓
AI Provider
 ┌───┴──────────────┐
 │                  │
Text              Image
 │                  │
Embedding       Description
 │                  │
 └───────┬──────────┘
         ↓
PostgreSQL
 ├── AI Processing
 ├── AI Metadata
 └── Embedding / pgvector
```

---

## 15.4 RAG

```text
User Question
      ↓
NestJS API
      ↓
Authentication
      ↓
Query Understanding
      ↓
┌────────────────────────────┐
│ Semantic Retrieval         │
│ Temporal Filtering         │
│ Geospatial Filtering       │
│ Journal Scope              │
│ User Scope                 │
└─────────────┬──────────────┘
              ↓
       Candidate Memories
              ↓
           Ranking
              ↓
       Context Assembly
              ↓
          AI Provider
              ↓
      Grounded Response
              ↓
          Next.js
```

---

# 16. Development Order

The recommended implementation order is:

```text
01. Repository + tooling
02. Next.js foundation
03. NestJS foundation
04. PostgreSQL + Prisma
05. Supabase Auth
06. Tenant authorization
07. Journal CRUD
08. Entry CRUD
09. Trash/recovery
10. Supabase Storage
11. Image attachments
12. PostGIS locations
13. Timeline/calendar
14. Redis + BullMQ
15. AI processing state
16. AI provider abstraction
17. Text embeddings
18. Image understanding
19. pgvector retrieval
20. Temporal retrieval
21. Geospatial retrieval
22. Hybrid RAG
23. Conversation/chat
24. Weekly reflection
25. Testing
26. Security hardening
27. Observability
28. CI/CD
29. Deployment
30. MVP release
```

---

# 17. Technology Introduction by Phase

| Technology | Phase Introduced | Main Purpose |
|---|---:|---|
| Git | 0 | Version control |
| GitHub | 0 | Repository |
| Next.js | 0 | Frontend |
| React | 0 | UI |
| TypeScript | 0 | Type safety |
| Tailwind CSS | 0 | Styling |
| NestJS | 0 | Backend |
| Zod | 0 | Runtime validation |
| Swagger/OpenAPI | 0 | API documentation |
| PostgreSQL | 0 | Primary database |
| Prisma | 0 | ORM |
| pgvector | 0 | Vector storage |
| PostGIS | 0 | Geospatial data |
| Supabase Auth | 0/1 | Authentication |
| Supabase Storage | 0/3 | Media storage |
| Docker | 0 | Local infrastructure |
| Docker Compose | 0 | Local service orchestration |
| Redis | 0/4 | Queue infrastructure |
| BullMQ | 0/4 | Background jobs |
| OpenAI | 4 | AI processing |
| Gemini | 4+ | Optional alternative provider |
| Playwright | 7 | E2E testing |
| Vitest/Jest | 7 | Unit testing |
| Supertest | 7 | API integration testing |
| GitHub Actions | 7 | CI/CD |
| Error tracking | 7 | Production diagnostics |

---

# 18. Recommended Repository Structure

```text
journalpilot/
│
├── apps/
│   ├── web/                    # Next.js
│   ├── api/                    # NestJS
│   └── worker/                 # BullMQ worker
│
├── packages/
│   ├── shared/                 # Shared types/utilities
│   ├── validation/             # Zod schemas
│   └── config/                 # Shared configuration
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── supabase/
│   └── migrations/             # SQL requiring Supabase/Postgres extensions
│
├── tests/
│   └── e2e/
│
├── docs/
│   ├── 01-product/
│   ├── 02-architecture/
│   ├── 03-roadmap/
│   ├── 04-design/
│   └── 05-engineering/
│
├── docker/
│
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json                  # Only if a monorepo task runner is adopted
├── .env.example
├── README.md
└── ...
```

### Monorepo note

A monorepo is useful because JournalPilot contains a web application, API, and worker.

However, **Turborepo is optional**.

Do not introduce Turborepo merely for complexity. Add it if shared packages and build orchestration justify it.

---

# 19. Environment Configuration

At minimum, separate:

```text
.env.local
.env.test
.env.production
```

Example configuration categories:

```text
Application
├── NODE_ENV
├── API_URL
└── WEB_URL

Database
├── DATABASE_URL
└── DIRECT_DATABASE_URL

Supabase
├── SUPABASE_URL
├── SUPABASE_ANON_KEY
└── SUPABASE_SERVICE_ROLE_KEY

Redis
└── REDIS_URL

AI
├── OPENAI_API_KEY
└── GEMINI_API_KEY

Security
└── application-specific secrets
```

Never commit secrets to Git.

---

# 20. Post-MVP Roadmap

The following capabilities are intentionally deferred.

## Product

- [ ] Profile management
- [ ] Settings and preferences
- [ ] Voice journaling
- [ ] Mobile application
- [ ] Advanced AI agents
- [ ] Personalized AI assistant
- [ ] Advanced analytics
- [ ] Subscription
- [ ] Payment
- [ ] Local/on-device AI

## Infrastructure

Only introduce infrastructure when the product requires it.

Potential future technologies:

- object/CDN optimization
- dedicated search infrastructure
- advanced observability
- model routing
- model hosting
- mobile push infrastructure
- workflow orchestration

None of these are required for MVP.

---

# 21. Future Architecture Considerations

The following should be considered only when scale or product requirements justify them:

```text
Current
Modular Monolith
      ↓
If scale requires it
      ↓
Extract selected workloads
```

Possible future extraction targets:

- AI processing worker
- search/retrieval service
- notification service
- analytics pipeline

Do not split services before there is a concrete operational or scaling reason.

---

# 22. Engineering Principles

## 22.1 PostgreSQL Is the Source of Truth

Redis, AI providers, and derived indexes must not become authoritative data stores.

---

## 22.2 Original Memories Are Immutable in Meaning

AI-derived data can be regenerated.

The original journal entry is the source of truth.

```text
Original Entry
      ↓
Derived AI Data
      ↓
Can be regenerated
```

---

## 22.3 AI Must Be Asynchronous

Writing a journal entry should not depend on a successful AI request.

```text
Save Entry
   ↓
Success
   ↓
User continues using app

AI Processing
   ↓
Background
```

---

## 22.4 Every Query Is Tenant-Aware

Every resource retrieval must answer:

```text
Who owns this data?
```

and enforce the answer at the server/database layer.

---

## 22.5 Validate at Boundaries

Use Zod and backend validation for:

- API requests
- query parameters
- uploaded metadata
- AI structured outputs
- configuration where appropriate

Types alone are not runtime validation.

---

## 22.6 Prefer Vertical Slices

Instead of building every backend subsystem first:

```text
Bad:
Database → API → AI → UI → Testing

Preferred:
Entry creation
→ database
→ API
→ UI
→ authorization
→ tests
→ complete feature
```

Then move to the next capability.

---

## 22.7 Measure Before Optimizing

Do not add:

- Elasticsearch
- Kafka
- Kubernetes
- distributed tracing
- additional databases

unless actual requirements justify them.

---

# 23. Final MVP Technology Summary

The final intended MVP stack is:

```text
                    JOURNALPILOT
                         │
        ┌────────────────┴────────────────┐
        │                                 │
     Frontend                          Backend
        │                                 │
   Next.js + TS                       NestJS + TS
   React                              Zod
   Tailwind CSS                       Swagger
        │                                 │
        └───────────────┬─────────────────┘
                        │
                     PostgreSQL
                        │
             ┌──────────┼──────────┐
             │          │          │
          Prisma    pgvector    PostGIS
             │          │          │
             └──────────┼──────────┘
                        │
             ┌──────────┴──────────┐
             │                     │
        Supabase Auth       Supabase Storage
             │                     │
             └──────────┬──────────┘
                        │
                  Async Processing
                        │
                 Redis + BullMQ
                        │
                      Worker
                        │
                AI Provider Layer
                 ┌──────┴──────┐
                 │             │
               OpenAI        Gemini
             (primary)      (optional)
                        │
                 Embeddings / LLM
                        │
                    Hybrid RAG
                        │
                Weekly Reflection
                        │
                 ┌──────┴──────┐
                 │             │
              Docker        GitHub
                 │             │
            Local Dev       CI/CD
```

This is the technology boundary for the MVP. New technologies should require a concrete reason to be added.
