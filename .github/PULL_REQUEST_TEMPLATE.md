## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Style/UI update (changes that don't affect functionality)
- [ ] ♻️ Refactoring (code change that neither fixes a bug nor adds a feature)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update
- [ ] 🔧 Configuration change
- [ ] 🗄️ Database change (migration, stored procedure, etc.)

## Related Issues

<!-- Link to related issues using #issue-number -->

Closes #

## Changes Made

<!-- List the specific changes made in this PR -->

-
-
-

## MinistryPlatform Changes

<!-- If this PR requires MP changes, list them here -->

- [ ] New/updated stored procedures
- [ ] Database schema changes (tables, columns)
- [ ] OAuth client configuration updates
- [ ] API procedure registration
- [ ] Security/permission changes

**Required MP Changes:**
<!-- Describe what needs to be done in MP for this to work -->

## Testing Checklist

<!-- Mark completed items with an "x" -->

### Local Testing
- [ ] Tested locally with `npm run dev`
- [ ] Verified changes work as expected
- [ ] No console errors
- [ ] Checked responsive design (if UI changes)
- [ ] Tested authentication flow (if auth changes)
- [ ] Verified MP API integration (if backend changes)

### Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (if applicable)

### Data Testing
- [ ] Tested with production-like data
- [ ] Verified edge cases (empty data, large datasets, etc.)
- [ ] Checked audit logging ($userId parameter passed)

## Database/MP Setup Required

<!-- If MP setup is needed, provide SQL scripts or instructions -->

<details>
<summary>SQL Scripts (if applicable)</summary>

```sql
-- Paste any SQL that needs to be run
```

</details>

**MP Admin Console Steps:**
<!-- List steps needed in MP Admin Console -->

1.
2.

## Screenshots/Videos

<!-- Add screenshots or videos demonstrating the changes -->

### Before
<!-- Screenshot of current state -->

### After
<!-- Screenshot of new state -->

## Environment Variables

<!-- List any new or changed environment variables -->

**New variables:**
```env
VARIABLE_NAME=description
```

**Updated variables:**
```env
VARIABLE_NAME=new_description
```

## Breaking Changes

<!-- If this is a breaking change, describe what breaks and how to migrate -->

**What breaks:**
-

**Migration path:**
-

## Checklist

<!-- Final checklist before requesting review -->

- [ ] Code follows the project's coding conventions
- [ ] Self-review of code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (README, SETUP.md, etc.)
- [ ] No new warnings or errors introduced
- [ ] Changes are backward compatible (or breaking changes documented)
- [ ] Environment variables documented in `.env.example`
- [ ] Database changes documented with migration scripts
- [ ] TypeScript types updated (if data structures changed)
- [ ] Zod schemas updated (if MP data structures changed)
- [ ] Claude skills updated (if development patterns changed)

## Additional Notes

<!-- Any additional information for reviewers -->

## Post-Merge Tasks

<!-- Tasks that need to be done after merging -->

- [ ] Deploy to production
- [ ] Run database migrations
- [ ] Update MP stored procedures
- [ ] Notify team of changes
- [ ] Update production environment variables
- [ ] Other:

---

**Reviewer Notes:**
<!-- Space for reviewers to add comments -->
