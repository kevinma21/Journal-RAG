# JournalPilot Validation Conventions

## Purpose
 This package contains runtime validation schemas used by JournalPilot applications.

 Validation is implemented with zod.

 ## Location

 All reusable validation schemas belong under:
 
 packages/validation/src

 Schemas are organized by domain or product capibility.

 Example:

```
 /packages/validation/src/
 ├── journals/
 ├── entries/
 ├── media/
 ├── locations/
 └── conversations/
```

 ## File Naming

 Schema files use:

\<action>-\<resource>.schema.ts

 Example:

 create-journal.schema.ts
 update-query.schema.ts
 list-journal.schema.ts

 ## Schema Naming

 Schema constants use:

 \<action>-\<Resource>Schema

 Example:

 createJournalSchema
 updateEntrySchema
 listJournalSchema

 ## Type Naming

 Typescript types should be inferred from Zod schemas.

 Use:
 
 \<Action>\<Resource>Input

 Example:
 
 tyoe CreateJournalInput = z.infer<typeof createJournalInput>;

 The Zod schema is the single source of truth for runtime validation and its inferred input type.

 ## One Schema Per File

 Each schema should normally have its own file.

 Small reusable primitives may be grouped together when they clearly belong to the same domain.

 ## Responsibility

 Validation schemas are responsible for validating input shape and input constraints.

 They must not contain:

 - database access
 - Prisma or sql queries
 - authentication
 - authorization
 - business logic
 - NestJS controller logic
 - HTTP handling

## Framework Independence

The validation package should remain independent from framework-specific application code.

Schema should depend on Zod rather than NestJS, Prisma, or other application infrastructure.

## Validatiion Boundery

Validation should happen at application bounderies.

Controllers, route handlers, workers, and other external-input bounderies should use the appropriate schema before processing input.

## Types

Do not manually duplicate a TypeScript interface when the type can be infered from the Zod schema.

Prefer:

const schema = z.object(...);

over maintaining seperate schema and interface definitions.

## Share Usage

Schemas should be written so they can be reused by different JournalPilot applications when appropriate.

Wheter a particular schema is shared between fronted, API, or worker is determined by the shared DTO/schema strategy.