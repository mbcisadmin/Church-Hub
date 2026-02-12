# Upstream Workflow

> How to manage fixes between church forks and the Gospel Kit template.

**Note:** This only applies when working in a **church fork** of
gospel-kit-template. If you're in the template repository itself, skip this.

## Understanding the Fork Relationship

```
gospel-kit-template (canonical)
    ↓ clone
Church Deployment (church fork)
    ↓ you fix a bug
Should it go back to template?
    ↓ yes
Document in UPSTREAM_FIXES.md
    ↓ later
Backport to gospel-kit-template
    ↓ benefit
All other churches get the fix
```

## When Fixing Bugs in a Church Fork

**Always ask:** "Is this a template bug or church-specific?"

### Template Bug (Backport to gospel-kit-template)

- Bug in core packages (`@church/ministry-platform`, `@church/database`, etc.)
- Bug in shared UI components (`@church/nextjs-ui`)
- Bug in auth flow (`@church/nextjs-auth`)
- General MinistryPlatform integration issues
- **Action:** Document in `UPSTREAM_FIXES.md` → Backport later

### Church-Specific (Keep in fork only)

- Bug in church-specific business logic
- Church-specific stored procedures
- Hardcoded church data or workflows
- Custom features only this church uses
- **Action:** Fix in fork, don't backport

## Using UPSTREAM_FIXES.md

### 1. When you fix a template bug

Use the `/mark-upstream` skill (recommended):

```
/mark-upstream
```

Or manually add to `UPSTREAM_FIXES.md`:

```markdown
### Fix API Token Refresh Logic

**Issue:** Access tokens weren't refreshing properly when expired, causing 401
errors.

**Fix Applied:**

- File: `packages/core/ministry-platform/src/client.ts:45-60`
- Commit: `abc123def`
- Date: 2024-12-05

**Details:** Changed token refresh to check expiration 5 minutes before actual
expiry instead of waiting for 401 response.
```

### 2. Periodically review UPSTREAM_FIXES.md

- When you have 5+ pending fixes
- Before deploying to other churches
- During template maintenance sessions

### 3. Backporting to template

1. Open gospel-kit-template repository
2. Apply each fix from `UPSTREAM_FIXES.md`
3. Test thoroughly in template
4. Commit with reference to church fork
5. Mark as "Applied to Template" in church fork's `UPSTREAM_FIXES.md`
6. Pull latest template into other church forks

## First Church Fork Will Expose Everything

The first church to use gospel-kit-template will discover:

- Bugs in core packages
- Missing features
- Integration issues
- Documentation gaps

**This is expected and valuable!** Document everything in `UPSTREAM_FIXES.md`
so:

- Future churches benefit from fixes
- Template becomes battle-tested
- Common patterns emerge

## Example Workflow

**Scenario:** You're building a church's deployment and discover the token
refresh is broken.

1. **Fix it in the church fork:**

   ```typescript
   // packages/core/ministry-platform/src/client.ts
   // Fix the token refresh logic
   ```

2. **Document for upstream:**

   ```bash
   /mark-upstream
   # Claude asks for details, adds to UPSTREAM_FIXES.md
   ```

3. **Continue building church features**

4. **Later (weekly/monthly), backport fixes:**
   - Review `UPSTREAM_FIXES.md` in church fork
   - Apply fixes to gospel-kit-template
   - Pull template updates into church fork
   - Next church deployment gets fixes automatically
