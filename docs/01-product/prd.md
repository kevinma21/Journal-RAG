# JournalPilot: Product Requrirements Document (PRD)

**Project:** JournalPilot

**Author:** Kevin Pratama

**Date:** September 2026

**Version:** 1.0

**Status:** Approved

# 1. Product Overview
## 1.1 Product Summary
JournalPilot is a multi-tenant, AI-augmented digital journal that transforms personal journal entries into a searchable and conversational personal memory system.

## 1.2 Product Vision
To transform traditional journaling from a passive archive into an intelligent personal memory system.

## 1.3 Product Principles
- Capture naturally
- Retrieve contextually
- Reflect from evidence
- Protect personal data\

## 1.4 Product Differentiation
| Traditional Journal | JournalPilot |
|---|---|
| Write | Write |
| Store | Store |
| Browse | Browse |
| Search | Semantic search |
| View photos | Understand photos |
| View locations | Query locations |
| Read old entries | Chat with memories |
| Manual reflection | AI-assisted reflection |

# 2. Problem Statement
## 2.1 Retrieval Problem
As a journal grows over time, finding specific memories through chronological browsing or keyword search becomes increasingly difficult.
## 2.2 Synthesis Problem
Individual journal entries capture isolated experiences, but users have limited ability to identify recurring patterns across time, location, and entries.
## 2.3 Multimodal Context Problem
Personal memories contain text, images, timestamps, and locations, but traditional journaling systems often treat these as separate pieces of information.
## 2.4 Reflection Problem
Users may accumulate substantial personal history without having an efficient way to periodically review and synthesize it.

# 3. Target Users
##  3.1 Primary Users
**Self Tracker -**
People who regularly record their activities, thoughts, habits, productivity, or experiences. 
##  3.2 Secondary Users
- Students
- Writers / deep thinkers
- professionals
- Entrepreneurs
##  3.3 User Needs
```text
"i wanna find what happened during a particular period"

"i wanna understand patterns in my productivity"

"i wanna remember what happened at a particualr place"

"i wanna an easier way to reflect on my week"
```

# 4. User Goals & Use Cases
## UC - 01 Record a Memory
As a user, I want to create a journal entry with text, images, time, and location so that I can preserve the context of an experience.
## UC - 02 Find am Old Memory
As a user, I want to ask JournalPilot about a past event so that I don't have to manually search through hundreds of entries.
## UC - 03 Explore a Time Period
As a user, I want to ask questions about a specific period so that I can understand what happened during that time.
## UC - 04 Explore a Location
As a user, I want to query entries associated with a location so that I can recall experiences from that place.
## UC - 05 Discover patterns
As a user, I want JournalPilot to identify recurring patterns across my entries.
## UC - 06 Weekly Reflection
As a user, I want an automatically generated weekly review so that I can reflect on my recent experiences.

# 5. Product Scope
## 5.1 MVP (Minimum Viable Product)
- Authentication
- Multiple Journal
- Journal Entries
- Markdown/rich text
- image attachement
- location tagging
- timeline
- calendar
- basic statistics
- multimodal ingestion
- Hybrid RAG
- AI chat
- weekly AI reflection
- Trash/Recovery
## 5.2 Post-MVP
- Subcription
- payment
- mobile application
- voice journaling
- more advanced AI agents
- Profile management
- settings
## 5.3 Out of Scope
- Clinical psychological assessment
- Social network
- Medical diagnosis
- Public journal sharing

# 6. Functional Requirements
## 6.1  Authentication & Account
- Sign up
- Login
- Google OAuth
- Password reset
- Logout
## 6.2 Profile & Preferences
- Profile information
- Language
- Timezone
- Theme
- Notification preferences
## 6.3 Journal Management
- Create journal
- Edit journal
- Delete journal
- Color/icon
- Switch between journals
## 6.4 Journal Entries
- Create entry
- Edit entry
- Delete entry
- Markdown/rich text
- Timestamp
- Images
- Location
- Entry metadata
## 6.5 Timeline
- Chronological feed
- Filter by journal
- Filter by date
- Search
- Entry preview
## 6.6 Calendar & Statistics
- Entry heatmap
- Daily/monthly/yearly statistics
- Word count
- Entry count
- Streaks
- Throwbacks
## 6.7 Places
- Map
- Location pins
- Clustering
- Location-based entry feed
## 6.8 Trash
- Recently deleted
- Restore
- Permanent deletion after 30 days

# 7. AI & Memory System
## 7.1 Multimodal Ingestion
- **text** - Journal text is processed and converted into embaddings
- **image** - Images are analyzed by a Vision LLM.
- **Location** - GPS coordinates are stored as geospatial meta data
- **time** - timestamp is retained as tempral metadata.

# 8. RAG Requiremens
## 8.1 Semantic Retrieval
Use embeddings + pgvector to find semantically relevant entries.
## 8.2 Temporal Retrieval
Allow queries such as:
- "last week"
- "last month"
- "during September"
- "before my internship"
## 8.3 Geospatial Retrieval
Allow queries based on location:
- "when I was in South Tangerang"
- "entries near my university"
- "what happened at this place?"
## 8.4 Hybrid Retrieval
**Combine:** Semantic + Time + Location + Journal Scope. before sending conext to the LLM
## 8.5 Conversational RAG
Users can ask follow-up questions while maintaining conversation context.
```text
Example:
"what were my biggest challenges last month?" ->
"was it worse when i worked from home" ->
"what did i do that helped"
```
# 9. Weekly AI Reflection
## 9.1 Scheduling
Every Sunday / defined weekly schedule.
## 9.2 Data Retrieval
Retrieve the previous 7 days.
## 9.3 Analysis
Identify:
- Recurring themes
- Notable events
- Productivity patterns
- Positive accomplishments
- Challenges
- Changes compared with previous periods
## 9.4 Output
Generate a weekly reflection. AI-generated insights must be grounded in retrieved journal entries, avoid presenting AI speculation as fact.

# 10. Non-Functional Requirements
## 10.1 Security
- User data isolation
- Authorization
- Secure authentication
- Secure media access
## 10.2 Privacy
- Journal entries are private by default.
- AI processing only uses authorized user data.
- Deleted data should eventually be permanently removed.
## 10.3 Performance
- Normal CRUD operations should be responsive.
- AI processing should happen asynchronously where appropriate.
- Long-running operations should not block normal API requests.
## 10.4 Reliability
- Failed background jobs can be retried.
- Users can see processing status.
- AI failures shouldn't corrupt journal data.
## 10.5 Scalability
The architecture should allow background AI processing and API workloads to scale independently.

# 11. MVP Definition
A user can create journal entries containing text, images, and location metadata, retrieve those memories through natural-language queries, and receive a weekly AI-generated reflection based on their journal history.
```
Sign Up
   ↓
Create Journal
   ↓
Write Entry
   ↓
Attach Image
   ↓
Attach Location
   ↓
Save
   ↓
AI Processing
   ↓
Journal Indexed
   ↓
Ask JournalPilot
   ↓
Retrieve Memories
   ↓
Receive Grounded Answer
   ↓
Receive Weekly Reflection
```
# 12. Success Criteria
**Product**
- User can create and retrieve entries.
- User can search memories conversationally.
- User can view entries by location and time.
- Weekly reflection is generated.

**AI/RAG**
- Relevant entries are retrieved.
- Time constraints are respected.
- Location constraints are respected.
- Responses are grounded in retrieved entries.
- The model does not invent memories

# 13. Constraints & Assumptions
**Constraint**
- Solo developer
- Web application initially
- Limited development time
- AI API cost must remain manageable
- Personal data must remain private

**Assumption**
- Users have smartphones/computers capable of providing location data.
- Users opt in to location tagging.
- AI providers are available through APIs.
- Users have internet connectivity.
# 14. Future Scope (my ideas)
- Voice Journaling
- Personalized AI Assistent
- Mobile App
- Advanced Analytics
- Local/On-device AI
