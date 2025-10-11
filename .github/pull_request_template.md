## Description

<!-- Provide a clear and concise description of what this PR does -->

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] Dependency update

## Related Issues

<!-- Link to related issues using: Closes #<issue_number>, Fixes #<issue_number>, or Relates to #<issue_number> -->

Closes #

## Changes Made

<!-- List the specific changes made in this PR -->

-
-
-

## Testing

<!-- Describe the testing you've done -->

### Manual Testing

- [ ] Uploaded images successfully
- [ ] AI descriptions generated correctly
- [ ] Images appear in the gallery
- [ ] Search functionality works
- [ ] Responsive design verified (mobile/tablet/desktop)
- [ ] Dark mode tested
- [ ] Error states handled properly

### Build & Code Quality

- [ ] `pnpm build` runs successfully
- [ ] `pnpm check` passes (Biome linting)
- [ ] `pnpm format` applied
- [ ] TypeScript types are correct (no `any` types added)

## Workflow Changes (if applicable)

<!-- If you modified workflow steps, confirm: -->

- [ ] All steps use `"use step"` directive
- [ ] Workflow uses `"use workflow"` directive
- [ ] Error handling implemented (RetryableError/FatalError)
- [ ] Context-aware retries with `getStepMetadata()`
- [ ] `maxRetries` configured appropriately
- [ ] Logging includes step IDs and timestamps

## Database Changes (if applicable)

- [ ] Schema updated in `lib/schema.ts`
- [ ] `pnpm db:push` tested locally
- [ ] Breaking changes documented

## Screenshots/Videos

<!-- Add screenshots or videos to demonstrate your changes, especially for UI updates -->

## Performance Impact

<!-- Describe any performance implications of your changes -->

- [ ] No performance impact
- [ ] Performance improved
- [ ] Performance impact (explain below)

<!-- If there's a performance impact, explain it here -->

## Breaking Changes

<!-- List any breaking changes and migration steps required -->

- [ ] No breaking changes
- [ ] Breaking changes (describe below)

<!-- If there are breaking changes, describe them and the migration path here -->

## Documentation

- [ ] README.md updated (if functionality changed)
- [ ] CONTRIBUTING.md updated (if development process changed)
- [ ] Code comments added for complex logic
- [ ] Environment variables documented (if new ones added)

## Checklist

- [ ] My code follows the project's code style (Biome)
- [ ] I have performed a self-review of my code
- [ ] I have commented complex or hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have tested this locally end-to-end
- [ ] All existing functionality still works

## Additional Notes

<!-- Add any additional information, context, or concerns about the PR here -->

## Reviewers

<!-- Tag specific people if you want their review: @username -->

/cc
