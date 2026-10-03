# JournalPilot — User Flows

**Project:** JournalPilot  
**Document:** User Flows  
**Version:** 1.0  
**Status:** Final  
**Date:** October 2026  
**Author:** Kevin Pratama

---

# 1. Document Overview

## 1.1 Purpose

This document defines the primary user flows of JournalPilot: how a user moves through the product from an action to the resulting outcome.

JournalPilot is a multi-tenant, AI-augmented digital journal that transforms personal journal entries into a searchable and conversational personal memory system.

This document focuses on user actions, visible system responses, alternative paths, failure states, and relationships between major product capabilities. Detailed implementation belongs in the architecture and engineering documentation.

## 1.2 Scope

MVP flows covered:

- Authentication
- Journal management
- Journal entries
- Image attachments
- Location tagging
- Timeline and calendar
- Places and basic statistics
- Asynchronous AI ingestion
- Hybrid RAG
- AI chat and conversational follow-ups
- Weekly AI reflection
- Trash and recovery

Post-MVP capabilities such as mobile, voice journaling, subscriptions, profile management, settings, and advanced AI agents are outside the primary MVP flows.

## 1.3 Relationship to Other Documents

```text
PRD
  ↓ What should we build?
ARCHITECTURE
  ↓ How is the system structured?
DATA-MODEL
  ↓ How is the data represented?
ROADMAP
  ↓ In what order do we build it?
USER-FLOWS
  ↓ How does the user move through the product?
DESIGN-SYSTEM
  ↓ How should the interface look and behave?
TESTING
  ↓ How do we verify that it works?
```

---

# 2. User Flow Principles

## 2.1 Capture Naturally

Creating a memory should require as little friction as practical. A user can create an entry with text and optionally add experience time, images, and location.

## 2.2 Retrieve Contextually

Memory retrieval may use semantic meaning, time, location, journal scope, and conversation context rather than relying only on exact keywords.

## 2.3 Keep AI Grounded in User Data

AI answers and reflections should be grounded in retrieved journal evidence. When relevant memories cannot be found, the system should communicate that limitation rather than inventing a memory.

## 2.4 Preserve User Control

The original journal entry remains usable even when asynchronous AI processing is delayed or fails. AI-generated information is derived from user data and is not the original source of truth.

## 2.5 Handle Important States

Important flows should account for loading, empty, validation, authentication, authorization, network, AI-processing, and retry states.

---

# 3. Authentication Flow

## 3.1 Sign Up

```text
User
 ↓
Open Sign Up
 ↓
Enter credentials
 ↓
Validate
 ↓
Create account
 ↓
Establish session
 ↓
Open JournalPilot
```

Alternative paths:

- Invalid input → show validation errors.
- Account creation failure → show an appropriate error.
- Verification required → instruct the user to verify the account.

## 3.2 Log In

```text
User
 ↓
Open Login
 ↓
Enter credentials
 ↓
Authenticate
 ↓
Session established
 ↓
Open JournalPilot
```

Invalid credentials or network failures should produce actionable errors without exposing sensitive information.

## 3.3 Google Authentication

```text
User
 ↓
Continue with Google
 ↓
Google authentication
 ↓
Callback
 ↓
Session established
 ↓
Open JournalPilot
```

## 3.4 Password Reset

```text
User
 ↓
Forgot Password
 ↓
Enter email
 ↓
Request reset
 ↓
Reset instructions
 ↓
Set new password
 ↓
Return to Login
```

## 3.5 Session Management

Protected functionality requires an authenticated session. User identity must come from the authenticated server context rather than an arbitrary client-supplied user ID.

## 3.6 Log Out

```text
User → Log Out → Session terminated → Authentication screen
```

---

# 4. Journal Management Flow

## 4.1 Create Journal

```text
User
 ↓
Journal Management
 ↓
Create Journal
 ↓
Enter information
 ↓
Validate
 ↓
Journal created
 ↓
Select journal
```

The journal belongs to the authenticated user and can contain journal entries.

## 4.2 View and Switch Journals

```text
Open Journal Management
 ↓
Retrieve accessible journals
 ↓
Display journals
 ↓
User selects journal
 ↓
Selected journal becomes active
```

Entries and applicable AI retrieval are scoped to the selected journal.

## 4.3 Edit Journal

```text
Open Journal → Edit → Save → Validate → Journal updated
```

## 4.4 Delete Journal

```text
Select Delete
 ↓
Confirm
 ↓
Validate ownership
 ↓
Delete according to product/data policy
 ↓
Update journal list
```

---

# 5. Journal Entry Flow

## 5.1 Create Entry

**Goal:** Record a memory with optional contextual information.

```text
User
 ↓
Open Journal
 ↓
New Entry
 ↓
Write content (Auto-saves draft locally)
 ↓
Optionally set occurred_at
 ↓
Optionally add image
 ↓
Optionally add location
 ↓
Save
 ↓
Validate
 ↓
Persist entry (Clears local draft)
 ↓
Queue AI processing
 ↓
Entry available
```

Postconditions:

- The original entry is persisted.
- The entry belongs to the selected journal.
- AI processing may continue asynchronously.

## 5.2 Edit Entry

```text
Open Entry
 ↓
Edit content / metadata
 ↓
Save
 ↓
Validate
 ↓
Entry updated
 ↓
Relevant derived AI data may be reprocessed
```

## 5.3 View Entry

Display the entry content and applicable experience time, media, location, and processing status.

## 5.4 Delete Entry

```text
Delete → Confirm → Move to Trash → Remove from normal views
```

## 5.5 Restore Entry

```text
Trash → Select Entry → Restore → Entry returns to normal views
```

## 5.6 Entry Timestamps

JournalPilot distinguishes:

- `occurred_at` — when the experience happened.
- `created_at` — when the record was created.
- `updated_at` — when the record was last modified.

`occurred_at` is the primary experience-time context for memory exploration.

---

# 6. Multimodal Entry Flow

## 6.1 Add and Upload Image

```text
User selects image
 ↓
Client requests upload authorization
 ↓
System validates authentication + access
 ↓
Signed upload URL
 ↓
Client uploads directly to storage
 ↓
Media metadata recorded
 ↓
AI processing queued
 ↓
Image attached to entry
```

The application API should not normally handle large image binaries during upload.

## 6.2 Remove Image

```text
Open Entry
 ↓
Select Image
 ↓
Remove
 ↓
Confirm if required
 ↓
Media association removed
 ↓
Storage / derived-data cleanup handled as appropriate
```

## 6.3 AI Image Processing

```text
Image
 ↓
AI Processing Job
 ↓
Vision / Image Analysis
 ↓
Derived metadata
 ↓
Optional embedding
 ↓
Memory becomes searchable
```

AI-derived information remains distinguishable from user-authored content.

## 6.4 Image Processing Failure

```text
Image uploaded
 ↓
AI processing fails
 ↓
Entry remains available
 ↓
Failure status recorded
 ↓
Retry
```

---

# 7. Location Flow

## 7.1 Add Location

```text
Create / Edit Entry
 ↓
Select Location
 ↓
Choose / provide location
 ↓
Validate
 ↓
Save
 ↓
Location associated with entry
```

## 7.2 View Location

```text
Open Entry → View associated location
```

## 7.3 Explore Memories by Location

```text
User asks about a location
        OR
User opens Places
 ↓
Identify location constraint
 ↓
Retrieve associated memories
 ↓
Display relevant entries
```

## 7.4 Location Failure / Empty State

If location cannot be resolved, is incomplete, or has no associated memories, show the relevant state without preventing normal journaling.

---

# 8. Timeline & Calendar Flow

## 8.1 Timeline

```text
Open Timeline
 ↓
Retrieve accessible entries
 ↓
Order by occurred_at
 ↓
Display chronological memories
```

## 8.2 Calendar

```text
Open Calendar
 ↓
Select date / period
 ↓
Retrieve entries
 ↓
Display entries for selected period
```

## 8.3 Navigate Dates / Periods

Users can move between supported day, week, and month views. The selected period determines the displayed entries.

---

# 9. Places & Statistics Flow

## 9.1 Places

```text
Open Places
 ↓
Retrieve entries with location data
 ↓
Group / display locations
 ↓
Select place
 ↓
View associated memories
```

## 9.2 Basic Statistics

```text
Open Statistics
 ↓
Retrieve journal data
 ↓
Calculate supported metrics
 ↓
Display statistics
```

## 9.3 Empty / Insufficient Data

If there is insufficient data, show an empty state rather than implying meaningful patterns from a small sample.

---

# 10. AI Ingestion Flow

## 10.1 Entry Saved

```text
Entry Saved
 ↓
Create AI Processing Job
 ↓
Queue Job
 ↓
User continues using JournalPilot
```

AI processing does not need to block entry creation.

## 10.2 Background Processing

Possible operations include:

- text embedding generation
- image understanding
- image description/tag generation
- image embedding when required
- AI metadata generation
- memory index updates

## 10.3 Processing Status

```text
Pending → Processing → Completed
                    ↘ Failed → Retry
```

## 10.4 Text Embedding

```text
Journal Content → Embedding Model → Vector → Store → Semantic Retrieval
```

## 10.5 Failure and Retry

```text
AI Job
 ↓
Failure
 ↓
Persist failure state
 ↓
Retry according to retry policy
 ↓
Completed
```

Retries should be safe and idempotent where practical. AI failure must not corrupt the original entry.

---

# 11. AI Chat / RAG Flow

## 11.1 Start Conversation

```text
User
 ↓
Open AI Chat
 ↓
Start Conversation
 ↓
Conversation created
 ↓
Enter question
```

A conversation belongs to the authenticated user and may be associated with a journal.

## 11.2 Ask a Question

Example questions:

```text
"What did I do last weekend?"
"What happened when I visited Bandung?"
"What patterns do you notice in my productivity this month?"
```

## 11.3 Query Understanding

```text
User Question
      ↓
Query Understanding
      ↓
 ┌────┼─────────────┐
 ↓    ↓             ↓
Time Location    Semantic
 └────┼─────────────┘
      ↓
Journal Scope
```

## 11.4 Retrieve Relevant Memories

Retrieval can combine:

- semantic similarity
- temporal constraints
- geospatial constraints
- journal scope
- relational filters

```text
Query
 ↓
Hybrid Retrieval
 ↓
Candidate Memories
```

## 11.5 Build Context

```text
Retrieved Memories
 ↓
Rank / Filter
 ↓
Build Context
 ↓
Provide Context to LLM
```

Only memories the user is authorized to access may enter the retrieval context.

## 11.6 Generate Grounded Answer

```text
Question + Retrieved Memories
 ↓
LLM
 ↓
Grounded Answer
```

Unsupported assumptions should not be presented as remembered facts.

## 11.7 No Relevant Memories

```text
Question
 ↓
Retrieval
 ↓
No sufficiently relevant memories
 ↓
Tell user that relevant memories were not found
```

The system should not fabricate an answer to fill the gap.

## 11.8 Retrieval / AI Failure

```text
Question
 ↓
Retrieval or AI failure
 ↓
Error state
 ↓
Retry
```

Stored journal data remains unaffected.

---

# 12. Conversational Follow-Up Flow

## 12.1 Follow-Up Question

```text
Question 1
 ↓
Answer 1
 ↓
Follow-Up Question
 ↓
New Retrieval + Conversation Context
 ↓
Answer 2
```

## 12.2 Preserve Context

Conversation context helps interpret references in follow-up questions.

Example:

```text
User: What did I do in Bandung last month?
JournalPilot: ...
User: What about the food?
JournalPilot: ...
```

## 12.3 New Retrieval

A follow-up should not rely only on the previous answer.

```text
Conversation Context + New Question
 ↓
Query Understanding
 ↓
New Retrieval
 ↓
Relevant Memories
```

## 12.4 Context-Aware Answer

```text
Conversation Context
+ New Retrieved Memories
+ New Question
 ↓
LLM
 ↓
Grounded Answer
```

## 12.5 Scope

Conversation context must never override user or journal authorization boundaries.

---

# 13. Weekly AI Reflection Flow

## 13.1 Schedule

JournalPilot generates a weekly reflection on the defined weekly schedule using the previous seven days as the intended reflection period.

```text
Weekly Schedule
 ↓
Reflection Job
 ↓
Retrieve Previous 7 Days
```

## 13.2 Retrieve Evidence

```text
Weekly Reflection Job
 ↓
Identify previous 7-day period
 ↓
Retrieve relevant entries
 ↓
Apply user / journal scope
 ↓
Prepare evidence
```

## 13.3 Generate Reflection

Potential areas include:

- recurring themes
- notable events
- productivity patterns
- accomplishments
- challenges
- comparisons supported by available evidence

```text
Weekly Evidence
 ↓
AI Reflection Generation
 ↓
Grounded Reflection
```

The reflection should not present speculation as fact.

## 13.4 Display Reflection

```text
Reflection Generated
 ↓
Store Reflection
 ↓
User opens Weekly Reflection
 ↓
Read Reflection
```

## 13.5 Insufficient Data

If the available evidence is limited, communicate that limitation instead of drawing strong conclusions.

## 13.6 Generation Failure

```text
Reflection Job
 ↓
Failure
 ↓
Persist failure state
 ↓
Retry
 ↓
Generate and store reflection
```

Journal entries remain unaffected.

---

# 14. Trash & Recovery Flow

## 14.1 Move Entry to Trash

```text
Delete Entry
 ↓
Confirm
 ↓
Move to Trash
 ↓
Hide from normal views
```

## 14.2 View Trash

```text
Open Trash
 ↓
Retrieve trashed entries
 ↓
Display entries
```

## 14.3 Restore

```text
Trash
 ↓
Select Entry
 ↓
Restore
 ↓
Entry becomes active
 ↓
Return to normal views
```

## 14.4 Permanently Delete

```text
Trash
 ↓
Select Entry
 ↓
Permanently Delete
 ↓
Confirm
 ↓
Permanent deletion process
```

Associated derived data and media should be handled according to the data model and deletion policy.

## 14.5 Empty Trash

```text
Empty Trash
 ↓
Confirm
 ↓
Permanently delete eligible entries
 ↓
Trash empty
```

---

# 15. Cross-Cutting States

## 15.1 Loading

Communicate progress for operations such as loading entries, uploading media, AI processing, retrieval, and reflection generation.

## 15.2 Empty

Examples:

- no journals
- no entries
- no entries for a date
- no memories for a location
- no conversations
- no weekly reflection
- no relevant memories

Empty states should explain the next useful action where appropriate.

## 15.3 Validation Errors

Invalid input should be identified close to the relevant field or action.

## 15.4 Authentication Errors

```text
Protected Action
 ↓
Authentication Check
 ↓
Not Authenticated
 ↓
Prompt for Login
```

## 15.5 Authorization Errors

```text
Request
 ↓
Authorization Check
 ↓
Access Denied
 ↓
Do Not Expose Protected Data
```

The system should not reveal whether another user's private resource exists.

## 15.6 AI Processing States

```text
Pending → Processing → Completed
                    ↘ Failed → Retry
```

## 15.7 Network Errors

```text
Action
 ↓
Network Failure
 ↓
Show Error
 ↓
Retry
```

Retries should avoid duplicate operations where practical.

---

# 16. MVP User Journey

## 16.1 First-Time User

```text
Sign Up
   ↓
Authentication
   ↓
Created Journal Automatically by systems
   ↓
Create First Entry
   ↓
Write Memory
   ↓
Add Image
   ↓
Add Location
   ↓
Save Entry
   ↓
AI Processing
   ↓
Memory Indexed
   ↓
Open AI Chat
   ↓
Ask Question
   ↓
Retrieve Relevant Memory
   ↓
Grounded Answer
   ↓
Weekly Reflection
```

## 16.2 Returning User

```text
Log In
 ↓
Open Journal
 ↓
Browse Timeline / Calendar
        OR
Ask AI about a Memory
        OR
Open Weekly Reflection
 ↓
Continue Journaling / Exploring
```

## 16.3 End-to-End Journal → AI Flow

```text
User
 ↓
Sign Up / Log In
 ↓
Create Journal
 ↓
Create Entry
 ↓
Add Image
 ↓
Add Location
 ↓
Save
 ↓
Entry Persisted
 ↓
Background AI Processing
 ↓
Memory Indexed
 ↓
Ask JournalPilot
 ↓
Query Understanding
 ↓
Hybrid Retrieval
 ├── Semantic
 ├── Temporal
 ├── Geospatial
 └── Journal Scope
 ↓
Rank Results
 ↓
Build Context
 ↓
LLM
 ↓
Grounded Answer
 ↓
User
```

---

# 17. Core Flow Diagrams

## 17.1 Authentication

```text
User
 ↓
Sign Up / Login
 ↓
Authentication
 ↓
Session Established
 ↓
JournalPilot
```

## 17.2 Entry Creation

```text
User
 ↓
Create Entry
 ↓
Write Content
 ↓
Optional Image / Location / Occurred Time
 ↓
Save
 ↓
Validate
 ↓
Persist Entry
 ↓
Queue AI Processing
```

## 17.3 Image Upload

```text
User
 ↓
Select Image
 ↓
Request Upload Authorization
 ↓
Validate Authentication + Access
 ↓
Signed URL
 ↓
Direct Upload
 ↓
Supabase Storage
 ↓
Media Metadata
 ↓
AI Processing Job
```

## 17.4 AI Ingestion

```text
Entry / Media
 ↓
Create Job
 ↓
Queue
 ↓
Worker
 ↓
AI Provider
 ├── Embedding
 ├── Image Understanding
 └── AI Metadata
 ↓
Store Derived Data
 ↓
Memory Indexed
```

## 17.5 AI Chat / RAG

```text
User Question
      ↓
Query Understanding
      ↓
 ┌────┼─────────────┐
 ↓    ↓             ↓
Time Location    Semantic
 └────┼─────────────┘
      ↓
User + Journal Scope
      ↓
Retrieve Memories
      ↓
Rank / Filter
      ↓
Build Context
      ↓
LLM
      ↓
Grounded Answer
      ↓
User
```

## 17.6 Weekly Reflection

```text
Weekly Schedule
      ↓
Reflection Job
      ↓
Retrieve Previous 7 Days
      ↓
Apply User / Journal Scope
      ↓
Analyze Journal Evidence
      ↓
Generate Reflection
      ↓
Store Reflection
      ↓
User Views Reflection
```

---

# 18. MVP Flow Coverage

| Flow | MVP | Post-MVP | Purpose |
|---|:---:|:---:|---|
| Authentication | ✓ | | Account and session access |
| Google Authentication | ✓ | | Alternative authentication |
| Journal Management | ✓ | | Organize memories |
| Entry Management | ✓ | | Record memories |
| Image Upload | ✓ | | Preserve visual context |
| Location | ✓ | | Preserve geographic context |
| Timeline | ✓ | | Browse memories chronologically |
| Calendar | ✓ | | Explore memories by date |
| Places | ✓ | | Explore memories by location |
| Statistics | ✓ | | View basic journal activity |
| AI Ingestion | ✓ | | Transform entries into searchable memory data |
| Hybrid RAG | ✓ | | Retrieve memories contextually |
| AI Chat | ✓ | | Conversational memory retrieval |
| Conversational Follow-Up | ✓ | | Continue memory exploration |
| Weekly Reflection | ✓ | | Reflect on recent experiences |
| Trash / Recovery | ✓ | | Recover deleted entries |
| Voice Journaling | | ✓ | Deferred |
| Mobile App | | ✓ | Deferred |
| Advanced AI Agents | | ✓ | Deferred |
| Profile Management | | ✓ | Deferred |
| Settings | | ✓ | Deferred |
| Subscription / Payment | | ✓ | Deferred |

---

# 19. Flow-to-Product Mapping

| User Goal | Primary Flow | Supporting Flows |
|---|---|---|
| Record a memory | Journal Entry | Image, Location |
| Find an old memory | AI Chat / RAG | Conversational Follow-Up |
| Explore a time period | Timeline / Calendar | AI Chat / RAG |
| Explore a location | Places / Location | AI Chat / RAG |
| Discover patterns | AI Chat / RAG | Weekly Reflection |
| Reflect on the week | Weekly AI Reflection | AI Ingestion |

---

# 20. Design Boundaries

The following responsibilities belong to other project documents and should not be duplicated here.

### Architecture

Defines application components, API boundaries, worker architecture, database architecture, storage, AI provider abstraction, and infrastructure decisions.

### Data Model

Defines entities, relationships, fields, ownership, derived data, and persistence rules.

### Roadmap

Defines implementation order, phases, deliverables, exit criteria, and release sequence.

### Design System

Defines visual language, typography, colors, spacing, components, interaction patterns, and accessibility conventions.

### Testing

Defines unit, integration, API, UI, end-to-end, security, failure, and acceptance verification.

---

# 21. Final User Flow Principle

JournalPilot should provide a continuous path from **capturing a memory** to **understanding and retrieving that memory**:

```text
Capture
   ↓
Store
   ↓
Enrich
   ↓
Process
   ↓
Index
   ↓
Retrieve
   ↓
Understand
   ↓
Reflect
```

The central product experience is:

```text
Write a memory
      ↓
JournalPilot understands its context
      ↓
Memory becomes searchable
      ↓
User asks about the past
      ↓
JournalPilot retrieves relevant evidence
      ↓
AI explains the retrieved memories
      ↓
User can continue the conversation
      ↓
JournalPilot periodically helps reflect
```

The original user-authored memory remains the source of truth. AI-generated information is derived, replaceable, and should remain grounded in the available journal evidence.
