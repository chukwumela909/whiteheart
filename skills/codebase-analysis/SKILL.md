---
name: codebase-analysis
description: Deep-scan a codebase to map its tech stack, libraries, architecture, data flow, features, and gaps. Use when user asks to review, analyze, understand, or audit an existing codebase, or wants to know what exists, how it works, or what's missing/incomplete.
---

# Codebase Analysis

## Quick Start

When triggered, run the full analysis workflow below. Present findings in a structured report grouped by section.

## Workflow

### 1. Tech Stack & Dependencies

- [ ] Read `package.json`, `requirements.txt`, `Gemfile`, `go.mod`, or equivalent
- [ ] List every runtime dependency with its purpose (e.g., `next` → React framework, `stripe` → payments)
- [ ] List dev dependencies and their roles (linting, testing, building)
- [ ] Identify the language(s), framework(s), runtime version(s)
- [ ] Note CSS approach (Tailwind, CSS Modules, styled-components, etc.)
- [ ] Note database / ORM / data layer (Supabase, Prisma, Drizzle, etc.)

### 2. Project Structure & Architecture

- [ ] Map the top-level directory layout and explain each folder's purpose
- [ ] Identify architectural pattern (MVC, feature-based, route-based, monorepo, etc.)
- [ ] Identify entry points (pages, routes, handlers)
- [ ] List middleware, config files, and environment setup
- [ ] Note any monorepo or workspace configuration

### 3. Features & Pages

- [ ] Enumerate every user-facing page/route with its purpose
- [ ] For each feature, summarize: what it does, which files implement it, key components involved
- [ ] Identify shared/reusable components and where they're used
- [ ] Note any admin or internal-only features separately

### 4. Data Flow & State Management

- [ ] Identify how data is fetched (REST, GraphQL, server actions, RPC)
- [ ] Map client-side state management (Context, Redux, Zustand, signals, etc.)
- [ ] Trace the data lifecycle for key features: user action → API/server → database → response → UI
- [ ] Document authentication/authorization flow
- [ ] Identify any caching strategies

### 5. Key Functions, Classes & Modules

- [ ] List exported utility functions and helpers with brief descriptions
- [ ] List significant classes/components and their responsibilities
- [ ] Identify custom hooks (React) or composables (Vue) and what they manage
- [ ] Note any notable patterns: factories, singletons, observers, etc.

### 6. Gaps, Incomplete Work & Issues

- [ ] Look for TODO, FIXME, HACK, XXX comments in the codebase
- [ ] Identify empty or stub files/functions
- [ ] Check for pages/routes that exist but have placeholder content
- [ ] Note missing tests or test files
- [ ] Flag unused imports, dead code, or orphaned files
- [ ] Identify missing error handling or loading states
- [ ] Check for hardcoded values that should be configurable
- [ ] Note any security concerns (exposed keys, missing auth checks)

## Output Format

Present the report using this structure:

```
## Tech Stack
| Category | Tool/Library | Purpose |
|----------|-------------|---------|
| ...      | ...         | ...     |

## Architecture
[Brief description + folder map]

## Features
### Feature Name
- **Files**: list of key files
- **How it works**: brief explanation
- **Data flow**: source → processing → destination

## State & Data Flow
[Diagrams or step-by-step traces]

## Key Code
| Name | Type | Location | Purpose |
|------|------|----------|---------|
| ...  | ...  | ...      | ...     |

## Gaps & Incomplete Work
- [ ] Description of gap — location/context
```

## Tips

- Start broad (dependencies, structure) then go deep (data flow, gaps)
- Use search tools aggressively — grep for patterns like `TODO|FIXME|HACK|XXX`
- Read config files first — they reveal the most about a project quickly
- Trace one complete user flow end-to-end to understand the data architecture
- When reporting gaps, distinguish between "not started" vs "partially implemented"
