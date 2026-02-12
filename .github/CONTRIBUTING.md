# Contributing to Gospel Kit

Thank you for your interest in contributing to Gospel Kit! This guide will help
you get started.

## 🎯 Project Goals

Gospel Kit is a template for building church applications with MinistryPlatform.
Our goals are:

1. **Type Safety** - Enforce types throughout the stack
2. **Developer Experience** - Make it easy to build new features
3. **Best Practices** - Enforce patterns like audit logging
4. **Church Agnostic** - Work for any church using MP
5. **Well Documented** - Clear guides and examples

## 🚀 Getting Started

### Development Setup

```bash
# Clone the repository
git clone <repo-url>
cd gospel-kit-template

# Install dependencies
npm install

# Set up environment
cp apps/platform/.env.example apps/platform/.env
# Edit .env with your MP credentials

# Start development
npm run dev
```

### Project Structure

```
gospel-kit-template/
├── packages/          # Shared packages
│   ├── core/         # Framework-agnostic packages
│   └── nextjs/       # Next.js specific packages
├── apps/             # Applications
│   └── platform/     # Multi-tenant apps platform
├── database/         # SQL scripts and migrations
└── .claude/          # Development automation
    └── skills/       # Claude skills for development
```

## 📝 Development Guidelines

### Code Style

- **TypeScript** - All code must be TypeScript
- **ESLint** - Run `npm run lint` before committing
- **Formatting** - Use consistent formatting (2 spaces, semicolons)
- **Naming** - Follow MP conventions (snake_case for fields, PascalCase for
  types)

### Type Safety

Always use proper types:

```typescript
// ✅ Good - Type-safe
import { Event } from "@church/database";
const events = await tableService.getTableRecords<Event>("Events", {...});

// ❌ Bad - Using any
const events = await tableService.getTableRecords("Events", {...});
```

### Audit Logging

Always pass userId for CREATE/UPDATE operations:

```typescript
// ✅ Good - userId passed
await tableService.createTableRecords('Table', [data], userId);

// ❌ Bad - userId missing
await tableService.createTableRecords('Table', [data]);
```

### Error Handling

Provide clear error messages:

```typescript
// ✅ Good - Descriptive error
if (!session?.contactId) {
  return NextResponse.json(
    { error: 'Unauthorized - No user ID' },
    { status: 401 }
  );
}

// ❌ Bad - Generic error
if (!session?.contactId) {
  throw new Error('Error');
}
```

## 🔧 Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Keep commits focused and atomic
- Write descriptive commit messages
- Follow conventional commits format:
  ```
  feat: add new micro-app template
  fix: correct userId parameter in API route
  docs: update SETUP.md with new env var
  refactor: simplify table service error handling
  ```

### 3. Test Your Changes

Before committing:

```bash
# Build all packages
npm run build

# Run linting
npm run lint

# Test locally
npm run dev
```

**Manual Testing Checklist:**

- [ ] Changes work as expected
- [ ] No console errors
- [ ] Authentication still works
- [ ] Audit logging works ($userId passed)
- [ ] Responsive design (if UI changes)
- [ ] Works in Chrome, Firefox, Safari

### 4. Update Documentation

If your changes affect:

- **User-facing features** → Update README.md
- **Setup process** → Update SETUP.md
- **Development patterns** → Update Claude skills
- **API changes** → Update code comments
- **Environment variables** → Update .env.example

### 5. Submit a Pull Request

1. Push your branch to GitHub
2. Open a Pull Request to `main`
3. Fill out the PR template completely
4. Link related issues
5. Request review from maintainers

## 📦 Package-Specific Guidelines

### @church/ministry-platform

Core MP API client - changes here affect everything.

**Guidelines:**

- All API calls must go through this package
- Token management is automatic
- Always ensure valid token before API calls
- Log errors with context

**Adding New Methods:**

```typescript
// In TableService or ProcedureService
async newMethod(params: Type): Promise<ReturnType> {
  await this.client.ensureValidToken();
  // Implementation
}
```

### @church/database

Zod schemas for MP tables.

**Guidelines:**

- Baseline tables: Only include fields actually used
- Custom tables: Include ALL fields
- Always provide type exports
- Include metadata (table name, dependencies, usedBy)

**Adding New Schema:**

```typescript
import { z } from 'zod';

export const MyTableSchema = z.object({
  My_Table_ID: z.number(),
  Field_Name: z.string(),
  // ... other fields
});

export type MyTable = z.infer<typeof MyTableSchema>;

export const MyTableMeta = {
  table: 'My_Table',
  type: 'baseline' as const,
  usedBy: ['apps-platform'],
};
```

### @church/nextjs-auth

NextAuth configuration.

**Guidelines:**

- Don't modify core auth flow without discussion
- Test token refresh thoroughly
- Verify role fetching still works
- Check impersonation feature

### @church/nextjs-ui

Shared UI components.

**Guidelines:**

- Follow Shadcn UI patterns
- Keep components framework-agnostic
- Use TypeScript props interfaces
- Include JSDoc comments

## 🗄️ Database Changes

### Adding Stored Procedures

1. Create SQL file in `database/customizations/stored-procedures/`
2. Follow naming: `api_Custom_[Name]_JSON`
3. Include documentation in markdown file
4. Add TypeScript integration example
5. Update SETUP.md if required for all churches

### Adding Custom Tables

1. Create SQL file in `database/customizations/tables/`
2. Include all constraints and indexes
3. Add permissions grant
4. Create Zod schema in `@church/database`
5. Document in SETUP.md

## 🧪 Testing

### Manual Testing

Required before submitting PR:

1. Test in local development environment
2. Verify with real MP data
3. Check browser console for errors
4. Test authentication flow
5. Verify audit logging

### Automated Testing

CI runs automatically on PRs:

- Build check
- Lint check
- Type check
- Dependency security audit

## 🎨 Claude Skills

When adding new development patterns, update Claude skills:

### Creating a New Skill

1. Create file in `.claude/skills/[skill-name].md`
2. Include:
   - Clear description
   - Step-by-step instructions
   - Code examples
   - Best practices
   - Testing checklist
3. Keep church-agnostic
4. Test the skill instructions yourself

## 📋 Pull Request Checklist

Before requesting review:

- [ ] Code builds successfully (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Tested locally with real MP data
- [ ] Documentation updated
- [ ] `.env.example` updated (if new env vars)
- [ ] Zod schemas updated (if data structures changed)
- [ ] TypeScript types updated
- [ ] Commit messages follow conventions
- [ ] PR template filled out completely
- [ ] No secrets or credentials in code

## 🐛 Reporting Bugs

Use the bug report template when creating issues:

- Provide steps to reproduce
- Include console errors
- Specify environment (dev/prod)
- Include MP context if relevant

## 💡 Feature Requests

Use the feature request template:

- Describe the problem it solves
- Provide use cases
- Consider MP integration requirements
- Suggest UI/UX if applicable

## ❓ Questions

Use the question template or:

- Check existing documentation first
- Review Claude skills
- Search closed issues
- Check MP documentation

## 🔒 Security

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email the maintainers directly
3. Provide details and reproduction steps
4. Wait for response before disclosure

## 📄 License

By contributing, you agree that your contributions will be licensed under the
same license as the project.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Remember this is for churches - keep it professional

## 🎉 Recognition

Contributors will be recognized in the project README.

Thank you for contributing to Gospel Kit! Your work helps churches build better
applications. 🙏
