# Abstraction Guidelines

> When to abstract code into shared packages vs keep it local to an app.

This is the **most important decision** when building with Church Hub.

## Decision Framework

Ask these questions **in order**:

### 1. What type of code is this?

**UI Components** (carousel, modal, table, form inputs)

- ✅ Church-agnostic design? → Abstract to `@church/nextjs-ui` **immediately**
- ❌ Has hardcoded church branding? → Keep local, abstract later

**Business Logic** (annual meeting flow, budget approval process)

- ❌ Keep in app until needed in 3+ places (Rule of Three)
- ✅ Exception: Core MP patterns → Abstract to `@church/ministry-platform`

**Data Models** (Contact schema, Event schema)

- ✅ Standard MP tables? → Abstract to `@church/database` **immediately**
- ❌ Church-specific custom tables? → Keep local until proven reusable

**Utilities** (date formatting, string parsing, calculations)

- ✅ Pure functions with no coupling? → Abstract to appropriate package
- ❌ Uses church-specific logic? → Keep local

### 2. Is it church-agnostic?

✅ **Abstract immediately if:**

- No hardcoded church names, colors, or content
- Works for any church using MinistryPlatform
- Example: Carousel component, MP API wrapper, Contact schema

❌ **Keep local if:**

- References a specific church's data/logic
- Has church-specific business rules
- Example: Annual meeting content, specific approval workflow

### 3. Was it designed to be reusable?

✅ **Abstract immediately if:**

- You're building it thinking "other churches will use this"
- It's a common UI pattern (modal, dropdown, table)
- It's a standard MP integration pattern

❌ **Keep local if:**

- You're solving a specific one-off problem
- Uncertain if other churches need it
- Prototype/experiment stage

### 4. Is it tightly coupled?

✅ **Can abstract if:**

- Standalone component/function
- Clear inputs/outputs (props, parameters)
- No dependencies on app-specific state/context

❌ **Keep local if:**

- Deeply integrated with app's state management
- Uses app-specific routing/context
- Hard to extract cleanly

## Practical Examples

### Example 1: New Carousel Component

```
❓ What type? → UI Component
❓ Church-agnostic? → Yes (no hardcoded content)
❓ Designed to be reusable? → Yes (common UI pattern)
❓ Tightly coupled? → No (just takes items prop)

✅ DECISION: Abstract to @church/nextjs-ui immediately
```

```typescript
// packages/nextjs/ui/carousel/carousel.tsx
export function Carousel({ items, autoPlay }: CarouselProps) {
  // Implementation
}

// apps/platform/src/app/page.tsx
import { Carousel } from '@church/nextjs-ui/carousel';
```

### Example 2: Church-Specific Registration Flow

```
❓ What type? → Business Logic
❓ Church-agnostic? → No (church-specific content/flow)
❓ Designed to be reusable? → No (specific to one church)
❓ Tightly coupled? → Yes (uses church-specific MP tables)

❌ DECISION: Keep in apps/platform
⏳ IF other churches need it later AND you can make it generic → Abstract then
```

### Example 3: MP API Helper - Get Contact with Households

```
❓ What type? → Data Pattern (MP API)
❓ Church-agnostic? → Yes (all churches have Contacts)
❓ Designed to be reusable? → Yes (common MP pattern)
❓ Tightly coupled? → No (just API call)

✅ DECISION: Abstract to @church/ministry-platform immediately
```

```typescript
// packages/core/ministry-platform/src/contacts.ts
export async function getContactWithHouseholds(
  contactId: number,
  userId: number // Always require for audit logging!
) {
  // Implementation
}
```

### Example 4: Church Budget Calculator

```
❓ What type? → Business Logic / Utility
❓ Church-agnostic? → No (church-specific budget structure)
❓ Designed to be reusable? → No (church-specific)
❓ Tightly coupled? → Yes (uses church-specific budget categories)

❌ DECISION: Keep in apps/platform
```

## Quick Reference Table

| Code Type        | Church-Agnostic? | Reusable Intent? | Coupled? | Decision                                      |
| ---------------- | ---------------- | ---------------- | -------- | --------------------------------------------- |
| UI Component     | ✅               | ✅               | ❌       | **Abstract now** to @church/nextjs-ui         |
| UI Component     | ❌               | -                | -        | Keep local, maybe abstract later              |
| Business Logic   | ✅               | ✅               | ❌       | Consider abstracting                          |
| Business Logic   | ❌               | -                | -        | **Keep local** (Rule of Three)                |
| MP API Pattern   | ✅               | ✅               | ❌       | **Abstract now** to @church/ministry-platform |
| Data Schema (MP) | ✅               | ✅               | ❌       | **Abstract now** to @church/database          |
| Utility Function | ✅               | -                | ❌       | **Abstract now**                              |
| Custom Logic     | ❌               | -                | -        | **Keep local**                                |
