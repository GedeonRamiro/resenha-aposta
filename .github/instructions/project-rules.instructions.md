---
description: Describe when these instructions should be loaded by the agent based on task context
# applyTo: 'Describe when these instructions should be loaded by the agent based on task context' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

description: Coding standards, architecture and project rules for the backend using NestJS + Prisma + PostgreSQL
globs: src/**/*.ts
alwaysApply: true
---

# Project Rules (Backend)

These rules define **coding standards, architecture patterns, and best practices** for this backend project.

Project stack:

- NestJS
- Prisma
- PostgreSQL
- TypeScript

All generated code must follow these rules.

---

# Core Principles

1. **Controller Responsibility**

Controllers must only:

- Handle HTTP requests
- Validate DTOs
- Call Services
- Return formatted responses

Controllers must NOT contain business logic.

---

2. **Service Responsibility**

Services must contain:

- Business logic
- Database interaction
- Validations
- Error handling

---

3. **Database Access**

All database access must use **Prisma Client** through `PrismaService`.

Example:

```ts
@Injectable()
export class CameraService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.camera.findMany();
  }
}