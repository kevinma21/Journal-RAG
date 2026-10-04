# JournalPilot — Testing Strategy

**Project:** JournalPilot  
**Document:** Testing Strategy  
**Version:** 1.0  
**Status:** Final  
**Date:** October 2026  
**Author:** Kevin Pratama

---

# 1. Testing Overview

## 1.1 Purpose

This document defines how JournalPilot will verify application behavior, user journeys, security boundaries, asynchronous processing, AI retrieval, and user-facing states.

The goal is not to maximize test count. The goal is to build a small, reliable testing system that gives confidence in the behaviors that matter most to JournalPilot.

JournalPilot is a multi-tenant AI-augmented journal. Therefore, testing must protect two especially important properties:

1. A user's memories must remain isolated from every other user.
2. AI responses must remain grounded in the correct journal memories and retrieval scope.

## 1.2 Testing Goals

Testing should provide confidence that:

- users can authenticate and maintain valid sessions;
- users can only access resources they are authorized to access;
- journals and entries can be created, edited, deleted, and recovered correctly;
- journal content remains usable when background AI processing fails;
- media uploads and processing behave correctly;
- temporal and geographic constraints are respected;
- semantic retrieval returns relevant memories;
- AI responses are grounded in retrieved evidence;
- important loading, empty, saving, processing, and error states are handled;
- the interface remains usable across supported screen sizes;
- accessibility requirements are preserved;
- database and background-job behavior remain reliable as the application evolves.

## 1.3 Testing Principles

### Test behavior, not implementation details

Tests should verify observable behavior and business rules rather than internal implementation structure.

### Protect tenant isolation first

Any path that can expose another user's data is a critical defect.

### Test critical journeys end to end

A feature should not be considered reliable only because its individual functions pass unit tests.

### Treat AI as a separate evaluation problem

Traditional deterministic tests are necessary but insufficient for retrieval and generated responses.

### Preserve user data when AI fails

AI processing is asynchronous and derived. Failure in AI processing must not make the original journal entry unusable.

### Make important states visible

Saving, processing, loading, empty, error, retry, and recovery states are part of product behavior and must be tested.

### Prefer a small reliable suite

A smaller set of stable, high-value tests is better than a large suite that is slow or fragile.

### Test security at the application boundary

Authorization and tenant-aware filtering should be tested from the perspective of a real request, not only through isolated helper functions.

---

# 2. Testing Scope

## 2.1 In Scope

The MVP testing scope covers:

- Authentication
- Session handling
- Journal management
- Journal entries
- Draft saving and persistence
- Image upload and media metadata
- Location tagging
- Timeline
- Calendar
- Places
- Statistics
- Trash and recovery
- Asynchronous AI ingestion
- Embedding generation
- Image understanding
- Hybrid retrieval
- AI chat
- Conversational follow-ups
- Retrieval evidence
- Weekly AI reflection
- Authorization
- Tenant isolation
- Accessibility
- Responsive behavior
- Error handling
- Retry behavior
- Database migrations
- Background workers

## 2.2 Out of Scope for MVP

The following are outside the MVP testing scope unless implementation introduces a specific dependency:

- Mobile application testing
- Voice journaling
- Advanced AI agents
- Subscription and payment flows
- Production-scale distributed load testing
- Kubernetes-specific testing
- Multi-provider production failover testing
- Self-hosted model evaluation

These areas may receive their own testing strategy when the corresponding product capabilities are introduced.

---

# 3. Testing Strategy

## 3.1 Testing Layers

```text
                    End-to-End
                         ▲
                         │
                 Integration Tests
                         ▲
                         │
                    Unit Tests
                         ▲
                         │
               Static / Type Checks
```

| Layer | Main Question |
|---|---|
| Static checks | Does the codebase satisfy basic structural/type constraints? |
| Unit | Does isolated business logic behave correctly? |
| Integration | Do modules, database access, authorization, and workers work together correctly? |
| End-to-End | Can a real user complete a critical product journey? |
| AI Evaluation | Does retrieval and generated output remain relevant and grounded? |
| Accessibility / UI | Is the user-facing experience usable and accessible? |

## 3.2 Test Distribution

No fixed percentage is required.

The project should generally prefer:

- many fast unit tests for deterministic business logic;
- a meaningful integration suite for authorization, persistence, and background processing;
- a smaller set of high-value E2E tests for critical journeys;
- a dedicated AI evaluation set for retrieval and grounded-generation behavior.

## 3.3 What Should Not Be Tested

Avoid tests for:

- trivial framework behavior;
- simple property forwarding;
- implementation details that have no observable product impact;
- duplicate coverage that verifies the same behavior at unnecessary layers;
- exact generated wording when only semantic correctness matters.

---

# 4. Testing Environment

## 4.1 Local Development Environment

Tests should be runnable locally without requiring the production environment.

The local environment should provide the dependencies required by the current test layer, including:

- application API;
- web application;
- PostgreSQL;
- queue/worker infrastructure;
- object storage or a test storage substitute;
- AI provider mocks/stubs for deterministic tests.

## 4.2 Test Database

The test database should be isolated from development data.

Test runs should not depend on:

- personal records;
- manually created development data;
- production data.

Test fixtures should be deterministic and reproducible.

## 4.3 Test Storage

Media tests should use isolated test storage.

Tests should cover:

- authorized upload;
- unauthorized upload;
- invalid metadata;
- invalid file type;
- oversized file;
- upload success;
- upload failure;
- metadata persistence.

## 4.4 AI Provider Dependency

Deterministic application tests should not depend on live AI providers unless the test explicitly targets provider integration.

For normal automated testing:

```text
Application
    ↓
AI abstraction
    ↓
Test provider / mock
```

Live provider calls should be reserved for dedicated AI evaluation or integration checks where their cost and nondeterministic output are acceptable.

---

# 5. Unit Testing

## 5.1 Purpose

Unit tests verify isolated deterministic logic.

They should be fast and independent from:

- network requests;
- external AI providers;
- persistent databases;
- object storage;
- real queues.

## 5.2 Validation

Test:

- required fields;
- valid and invalid input;
- text length constraints;
- date/time validation;
- location input validation;
- media metadata validation;
- conversation input validation.

Examples:

```text
rejects an empty journal title when a title is required
accepts a valid journal entry
rejects an invalid coordinate
rejects unsupported media metadata
```

## 5.3 Authorization Logic

Test reusable authorization rules in isolation where practical.

Examples:

```text
allows access when resource belongs to current user
denies access when resource belongs to another user
denies access when journal ownership cannot be established
```

Important: these unit tests do not replace request-level authorization and tenant-isolation tests.

## 5.4 Date and Time Logic

Test:

- occurred_at handling;
- created_at handling;
- relative time ranges;
- daily boundaries;
- weekly boundaries;
- monthly boundaries;
- timezone-sensitive calculations.

Examples:

```text
"last week" resolves to the correct range
entries are grouped by occurred_at rather than created_at
weekly reflection uses the intended seven-day period
```

## 5.5 Retrieval Query Logic

Test deterministic parts of query understanding and filtering.

Examples:

```text
extracts a date range from a supported query
extracts a location constraint
preserves journal scope
combines semantic, temporal, and geographic filters
```

## 5.6 Ranking Logic

Where ranking is implemented deterministically, test:

- score ordering;
- tie handling;
- scope filtering;
- minimum relevance thresholds.

## 5.7 Worker State Logic

Test legal state transitions such as:

```text
Pending → Processing → Completed
Pending → Processing → Failed
Failed → Retry
```

Invalid transitions should be rejected where the implementation defines such rules.

---

# 6. Integration Testing

## 6.1 Purpose

Integration tests verify that application modules work correctly with real dependencies such as PostgreSQL, storage, and the queue.

## 6.2 API + Database

Test:

- authentication/session validation;
- journal CRUD;
- entry CRUD;
- entry timestamps;
- media metadata;
- location persistence;
- conversation persistence;
- trash/recovery;
- weekly reflection persistence;
- AI processing state.

## 6.3 Multi-Tenant Isolation

This is a critical testing area.

Every tenant-aware data access path should have explicit isolation coverage.

Minimum expectations:

```text
User A → can access User A journal
User A → cannot access User B journal

User A → can access User A entry
User A → cannot access User B entry

User A → cannot retrieve User B media metadata
User A → cannot retrieve User B conversation
User A → cannot retrieve User B AI evidence
User A → cannot retrieve User B weekly reflection
```

Test both:

- direct resource access;
- indirect access through search and AI retrieval.

## 6.4 Database Constraints

Verify:

- foreign-key relationships;
- required fields;
- uniqueness constraints;
- ownership relationships;
- deletion behavior;
- recovery behavior;
- nullable and optional relationships.

## 6.5 Transactional Behavior

Where a user action requires multiple database changes, test whether the operation:

- completes all required changes;
- does not leave partial state after failure;
- remains consistent after retry where required.

---

# 7. Background Worker Testing

## 7.1 Job Creation

Verify that application actions create the correct jobs.

Examples:

```text
new entry → processing job
new image → image processing job
eligible reflection period → reflection job
```

## 7.2 Processing Lifecycle

Verify:

```text
Queued
  ↓
Processing
  ↓
Completed
```

and:

```text
Queued
  ↓
Processing
  ↓
Failed
  ↓
Retry
```

## 7.3 Failure Behavior

Test:

- AI timeout;
- provider error;
- malformed provider result;
- transient storage failure;
- database failure;
- worker restart;
- retry exhaustion.

The original journal entry must remain available even if AI processing fails.

## 7.4 Idempotency

Retried jobs must not create unintended duplicates.

Test idempotency for:

- embeddings;
- AI processing results;
- media analysis;
- indexing;
- weekly reflection generation where applicable.

---

# 8. End-to-End Testing

## 8.1 Purpose

E2E tests verify critical journeys from the user's perspective.

Do not attempt to represent every possible UI path with E2E tests. Focus on the flows that represent the core product.

## 8.2 Authentication

Critical flow:

```text
Sign up
  ↓
Authenticated session
  ↓
Application
```

Also cover:

- login;
- logout;
- password reset;
- Google authentication when available.

## 8.3 First-Time User Journey

The first-time user flow should verify:

```text
Authenticate
  ↓
Journal created automatically
  ↓
Journal becomes available
  ↓
User creates first entry
```

## 8.4 Journal Management

Test:

```text
Create journal
  ↓
Open / switch journal
  ↓
Edit journal
  ↓
Delete journal
```

Where deletion is recoverable, verify the expected recovery behavior.

## 8.5 Journal Entry Journey

Critical flow:

```text
Create entry
  ↓
Write content
  ↓
Save
  ↓
Persist entry
  ↓
Entry appears in journal
```

Also test:

- edit;
- delete;
- restore;
- timestamp behavior;
- local draft behavior.

## 8.6 Draft / Auto-Save Behavior

The editor should cover:

```text
Write content
  ↓
Local draft exists
  ↓
Persist successfully
  ↓
Local draft clears
```

Failure case:

```text
Write content
  ↓
Persistence fails
  ↓
Local draft remains available
```

## 8.7 Multimodal Entry

Test:

```text
Create entry
  ↓
Attach image
  ↓
Upload media
  ↓
Add location
  ↓
Save entry
  ↓
Background processing begins
```

## 8.8 Timeline and Calendar

Verify:

- entries appear in chronological order;
- date filtering works;
- journal filtering works;
- calendar reflects available entries;
- selected date displays the correct memories.

The timeline should use the experience timestamp (`occurred_at`) for temporal ordering.

## 8.9 Places

Verify:

```text
Entry with location
  ↓
Location appears in Places
  ↓
Location can be explored
  ↓
Associated memories can be opened
```

Also test empty and failure states.

## 8.10 Statistics

Verify that statistics reflect persisted journal data.

Examples:

- entry count;
- word count;
- streak;
- other MVP-defined statistics.

Statistics should not be silently based on stale or unrelated records.

## 8.11 AI Ingestion

Critical path:

```text
Entry saved
  ↓
AI processing job
  ↓
Text embedding
  ↓
Image understanding when applicable
  ↓
Index updated
  ↓
Memory becomes retrievable
```

The test should also verify a failed ingestion path.

## 8.12 AI Chat

Critical path:

```text
User asks question
  ↓
Query interpreted
  ↓
Relevant memories retrieved
  ↓
Context assembled
  ↓
AI response generated
  ↓
Evidence displayed
```

Verify that the response is associated with the correct user and journal scope.

## 8.13 Conversational Follow-Up

Test:

```text
Question
  ↓
Answer
  ↓
Follow-up
  ↓
Conversation context retained
  ↓
Retrieval scope preserved
```

A follow-up must not accidentally widen access beyond the authorized scope.

## 8.14 Weekly Reflection

Verify:

```text
Previous seven days retrieved
  ↓
Relevant evidence selected
  ↓
Reflection generated
  ↓
Reflection persisted
```

Test both normal and no-data cases.

## 8.15 Trash and Recovery

Critical flow:

```text
Delete
  ↓
Trash
  ↓
Restore
  ↓
Entry available again
```

Also verify that permanent deletion, where implemented, is clearly separated from recoverable deletion.

---

# 9. AI and RAG Evaluation

## 9.1 Why AI Requires Separate Evaluation

Traditional tests can verify that the pipeline executes successfully, but they cannot alone establish that retrieved memories are relevant or that generated responses are grounded.

AI evaluation therefore has two major areas:

1. Retrieval quality
2. Grounded response quality

## 9.2 Retrieval Evaluation

### Semantic Retrieval

Verify that conceptually related memories can be retrieved even when the query does not use identical wording.

### Temporal Retrieval

Test queries involving:

```text
last week
last month
during September
before a specific event
```

The returned memories must respect the requested time scope.

### Geographic Retrieval

Test queries involving:

```text
in Jakarta
near my university
at this place
```

The geographic constraint must be respected.

### Journal Scope

When the query is scoped to a journal, retrieval must not return another journal's memories.

## 9.3 Retrieval Evaluation Dataset

Maintain a small curated dataset containing:

- known journal entries;
- known timestamps;
- known locations;
- journal membership;
- expected relevant memories.

For each evaluation query, record the expected retrieval behavior.

Example:

```text
Query:
"What did I write about TypeScript last month?"

Expected:
- entries from the requested time period;
- entries relevant to TypeScript;
- only memories within the authorized journal scope.
```

## 9.4 Grounded Response Evaluation

A grounded response should satisfy:

- claims are supported by retrieved memories;
- evidence corresponds to the response;
- dates and locations are not invented;
- unsupported conclusions are not presented as facts;
- the assistant can acknowledge when evidence is insufficient.

## 9.5 No Relevant Memories

When retrieval finds no sufficiently relevant memories, the assistant should not invent an answer.

Expected behavior:

```text
No relevant memories
  ↓
Explain that evidence was insufficient
  ↓
Offer a useful way to refine the query
```

## 9.6 AI Failure Evaluation

Test:

- provider timeout;
- provider error;
- malformed output;
- unavailable retrieval;
- empty retrieval;
- processing failure;
- retry behavior.

User-facing errors should remain understandable and must not expose provider-specific implementation details.

---

# 10. Frontend and UI Testing

## 10.1 Component Behavior

Test reusable components for:

- default state;
- interaction;
- focus;
- disabled state;
- loading;
- success;
- error;
- empty state where applicable.

## 10.2 Form Testing

Verify:

- labels;
- validation;
- error messages;
- submit behavior;
- disabled behavior;
- successful persistence;
- recovery after failure.

## 10.3 AI Chat UI

Test:

- opening and closing the assistant;
- message alignment;
- multiline input;
- send button state;
- loading/thinking state;
- streaming behavior if implemented;
- evidence interaction;
- error state;
- no-relevant-memory state.

## 10.4 Responsive Testing

### Desktop

- persistent sidebar;
- multi-column layouts where appropriate;
- floating AI assistant.

### Tablet

- reduced or collapsible navigation;
- preserved content hierarchy;
- reduced column density.

### Mobile

- drawer or alternate navigation;
- vertically stacked content;
- near-full-screen AI experience where appropriate;
- editor receives priority for vertical space.

## 10.5 Visual Regression

Visual regression testing should be introduced only for stable, high-value surfaces.

Potential targets:

- authentication;
- journal dashboard;
- editor;
- timeline;
- AI assistant.

Do not snapshot every component automatically. Visual tests should remain maintainable.

---

# 11. Accessibility Testing

## 11.1 Keyboard Navigation

All interactive controls must be reachable and usable with the keyboard.

## 11.2 Focus

Verify:

- visible focus;
- logical focus order;
- focus trapping where required;
- focus restoration after dialogs.

## 11.3 Color Contrast

Verify that color is not the only mechanism used to communicate:

- active;
- success;
- error;
- warning;
- processing;
- disabled.

Pair color with text, icons, borders, or position.

## 11.4 Labels and Semantics

Verify:

- form controls have labels;
- icon-only controls have accessible names;
- buttons are semantically buttons;
- navigation is semantically navigable;
- dialogs expose appropriate semantics.

## 11.5 Reduced Motion

Verify that `prefers-reduced-motion: reduce` removes or reduces non-essential animation.

---

# 12. Security Testing

## 12.1 Authentication

Test:

- invalid credentials;
- expired sessions;
- logged-out requests;
- missing authentication context.

## 12.2 Authorization

Verify that every protected resource checks ownership or the appropriate authorization boundary.

Never trust arbitrary `user_id` values supplied by the client.

## 12.3 Tenant Isolation

Tenant isolation must be tested through:

- direct API access;
- list endpoints;
- search;
- RAG retrieval;
- conversation access;
- evidence access;
- media access.

## 12.4 Input Validation

Test malicious or invalid inputs at application boundaries.

Examples:

- malformed JSON;
- unexpected fields;
- invalid IDs;
- invalid dates;
- invalid coordinates;
- oversized content;
- unsupported file metadata.

## 12.5 File Upload Security

Test:

- type validation;
- size validation;
- authorization;
- storage path ownership;
- invalid or malformed uploads.

## 12.6 AI Data Isolation

AI retrieval must obey the same authorization boundary as normal application data.

A user must never be able to cause the AI system to retrieve another user's:

- entries;
- media;
- embeddings;
- conversations;
- reflections;
- metadata.

---

# 13. Data and Migration Testing

## 13.1 Migration Validation

A clean environment should be able to:

```text
Create database
  ↓
Apply migrations
  ↓
Start application
  ↓
Run tests
```

## 13.2 Migration Safety

Schema changes should verify:

- existing records remain valid;
- relationships remain intact;
- new constraints behave as expected;
- rollback strategy is understood where required.

## 13.3 Test Fixtures

Fixtures should be:

- deterministic;
- minimal;
- easy to understand;
- representative of realistic application data.

Fixtures should include examples with:

- multiple journals;
- multiple dates;
- multiple locations;
- images;
- long entries;
- deleted entries;
- AI processing states.

## 13.4 Test Data Reset

Tests should be able to reset their data to a known starting state.

One test should not depend on state created by another test unless the test explicitly represents a multi-step journey.

---

# 14. Reliability Testing

## 14.1 Failure Isolation

A failure in one subsystem should not unnecessarily make unrelated functionality unavailable.

Example:

```text
AI provider fails
    ↓
Entry remains readable and editable
```

## 14.2 Retry Behavior

Retries should be verified for operations where retry is expected.

Test:

- retry succeeds;
- retry remains idempotent;
- retry exhaustion produces a clear failed state.

## 14.3 Recovery

Every recoverable failure should provide an appropriate recovery path where possible:

```text
Failure
  ↓
Explain
  ↓
Retry / Correct / Go Back
```

---

# 15. Performance Testing

MVP performance testing should focus on meaningful product behavior rather than premature large-scale load testing.

## 15.1 Frontend

Measure important surfaces such as:

- initial application load;
- journal list rendering;
- large entry rendering;
- image loading;
- AI chat responsiveness.

## 15.2 API

Measure common operations such as:

- journal listing;
- entry listing;
- entry creation;
- search;
- retrieval.

## 15.3 Database

Observe expensive queries involving:

- journal filtering;
- temporal filtering;
- geographic filtering;
- vector similarity search.

## 15.4 Background Processing

Measure:

- job queue delay;
- processing duration;
- retry frequency;
- AI processing completion time.

Performance optimization should follow observed bottlenecks rather than assumptions.

---

# 16. Continuous Integration

## 16.1 Pull Request Checks

The baseline CI sequence should be:

```text
Lint
  ↓
Type Check
  ↓
Unit Tests
  ↓
Integration Tests
  ↓
Build
```

E2E tests may be included in CI when their runtime and infrastructure remain practical.

## 16.2 E2E Execution

Recommended approach for MVP:

- fast tests on regular pull requests where practical;
- broader E2E coverage on the main branch or release workflow;
- avoid making the entire CI pipeline dependent on paid AI calls.

## 16.3 AI Evaluation in CI

AI evaluation should normally use deterministic fixtures or controlled test providers.

Live provider evaluation should be intentionally scoped because:

- outputs can vary;
- provider availability can change;
- calls may incur cost;
- failures may be unrelated to application code.

---

# 17. Testing Tools

The project should use tools that fit the actual implementation rather than introducing tools unnecessarily.

Initial recommended toolset:

| Area | Tool |
|---|---|
| Unit testing | Vitest or Jest |
| API / integration | Supertest or framework-compatible HTTP testing |
| Frontend | Testing Library |
| E2E | Playwright |
| Accessibility | Automated accessibility checks + manual keyboard testing |
| CI | GitHub Actions |

These choices are implementation defaults, not architectural constraints. The final tool selection should be recorded when the corresponding implementation phase begins.

---

# 18. Test Naming and Organization

## 18.1 Test Naming

Use behavior-oriented test names.

Good:

```text
rejects access to an entry owned by another user
restores a deleted entry
keeps a local draft after persistence failure
returns no memories when retrieval finds no relevant evidence
```

Avoid:

```text
testEntryService2
shouldWork
handlesThing
```

## 18.2 Test Organization

Tests should follow the application structure where practical.

Example:

```text
apps/
├── web/
│   └── ...
├── api/
│   └── ...
└── worker/
    └── ...

tests/
├── unit/
├── integration/
├── e2e/
└── ai/
```

The exact repository layout may be adjusted to fit the final monorepo structure.

---

# 19. Definition of Done

A feature is considered test-complete when applicable checks have passed.

## 19.1 Feature-Level

```text
Implementation complete
✓
Validation covered
✓
Authorization covered
✓
Relevant unit tests
✓
Relevant integration tests
✓
Critical E2E path covered
✓
Loading / empty / error states covered
✓
Accessibility checked
✓
Tenant isolation checked
✓
Documentation updated
```

Not every feature requires every test layer. Coverage should match feature risk.

## 19.2 Phase-Level

A roadmap phase is complete when:

- all phase acceptance criteria are satisfied;
- applicable automated tests pass;
- critical user flows remain functional;
- regressions are resolved;
- security boundaries are verified;
- no known blocking defects remain.

---

# 20. MVP Testing Coverage

| Area | Unit | Integration | E2E | AI Eval | Accessibility |
|---|:---:|:---:|:---:|:---:|:---:|
| Authentication | ✓ | ✓ | ✓ | | ✓ |
| Journal Management | ✓ | ✓ | ✓ | | ✓ |
| Journal Entries | ✓ | ✓ | ✓ | | ✓ |
| Draft / Auto-Save | ✓ | ✓ | ✓ | | ✓ |
| Image Upload | ✓ | ✓ | ✓ | ✓ | ✓ |
| Location | ✓ | ✓ | ✓ | ✓ | ✓ |
| Timeline | ✓ | ✓ | ✓ | | ✓ |
| Calendar | ✓ | ✓ | ✓ | | ✓ |
| Places | ✓ | ✓ | ✓ | | ✓ |
| Statistics | ✓ | ✓ | ✓ | | ✓ |
| Trash / Recovery | ✓ | ✓ | ✓ | | ✓ |
| AI Ingestion | ✓ | ✓ | ✓ | ✓ | |
| Hybrid RAG | ✓ | ✓ | ✓ | ✓ | |
| AI Chat | ✓ | ✓ | ✓ | ✓ | ✓ |
| Conversational Follow-ups | ✓ | ✓ | ✓ | ✓ | ✓ |
| Weekly Reflection | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tenant Isolation | ✓ | ✓ | ✓ | ✓ | |
| Security Boundaries | ✓ | ✓ | ✓ | | |

---

# 21. Testing Workflow During Development

Testing should happen continuously rather than only before release.

The expected workflow for a feature is:

```text
Plan
  ↓
Implement
  ↓
Unit Tests
  ↓
Integration Tests
  ↓
UI / Accessibility Checks
  ↓
E2E for Critical Flow
  ↓
Review
  ↓
Merge
```

For AI-related functionality:

```text
Implement
  ↓
Pipeline Tests
  ↓
Retrieval Evaluation
  ↓
Groundedness Evaluation
  ↓
Failure / Retry Tests
  ↓
E2E
  ↓
Review
```

---

# 22. Final Testing Principles

1. **Protect user data first.** Tenant isolation is a release-blocking concern.
2. **Test critical behavior, not implementation details.**
3. **Use unit tests for deterministic logic.**
4. **Use integration tests for persistence, authorization, and worker behavior.**
5. **Use E2E tests for the product's most important user journeys.**
6. **Treat AI retrieval and grounded generation as dedicated evaluation problems.**
7. **Keep original journal data usable when AI processing fails.**
8. **Test important loading, empty, saving, processing, error, and recovery states.**
9. **Make accessibility part of feature completion.**
10. **Automate repetitive checks while keeping the suite fast enough for everyday development.**
11. **Measure performance before optimizing.**
12. **Prefer a small reliable test suite over a large fragile one.**
13. **Expand testing when the product or risk profile expands.**
