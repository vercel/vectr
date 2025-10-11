# Contributing to Vectr

Thank you for your interest in contributing to Vectr! We're excited to have you help us build a better AI-powered image search application.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/vectr.git`
3. Install dependencies: `pnpm install`
4. Set up your environment variables (see [README.md](../README.md#setup))
5. Create a new branch: `git checkout -b feature/your-feature-name`
6. Make your changes
7. Test your changes locally with `pnpm dev`
8. Run linting and formatting: `pnpm check && pnpm format`
9. Commit your changes with clear, descriptive commit messages
10. Push to your fork
11. Submit a Pull Request

## Development Workflow

### Local Development

```bash
# Start the development server
pnpm dev

# Run linting checks
pnpm check

# Format code
pnpm format
```

### Testing Your Changes

Before submitting a PR, please ensure:

1. The app builds successfully: `pnpm build`
2. All linting checks pass: `pnpm check`
3. Code is properly formatted: `pnpm format`
4. Test the full workflow:
   - Upload an image
   - Verify it appears in the UI
   - Check that the description is generated
   - Test semantic search functionality

## Pull Request Guidelines

- Ensure your PR addresses a specific issue or adds value to the project
- Include a clear description of the changes and why they're needed
- Keep changes focused and atomic - one feature/fix per PR
- Follow existing code style and conventions
- Update documentation (README.md) if you're changing functionality
- Add comments to explain complex workflow logic or error handling
- If you're modifying workflow steps, ensure retry logic and error handling are preserved

## Code Style

- **Formatting**: We use [Biome](https://biomejs.dev/) for linting and formatting
- **TypeScript**: Use strict typing - avoid `any` types
- **Components**: Follow React best practices and use functional components
- **Workflow Steps**: Each step should:
  - Use `"use step"` directive
  - Include comprehensive error handling with `RetryableError` and `FatalError`
  - Use `getStepMetadata()` for context-aware retries
  - Have appropriate `maxRetries` configuration
  - Include logging with step IDs
- **Naming**: Use descriptive names for variables, functions, and files
- **Comments**: Add comments to explain "why", not "what" (code should be self-documenting)

## Project-Specific Guidelines

### Working with Vercel Workflow

If you're modifying workflow logic:

- Each step should be isolated in its own file
- Always use `"use step"` directive for steps
- Always use `"use workflow"` directive for workflows
- Implement proper error classification:
  - `RetryableError`: Temporary failures (rate limits, network issues)
  - `FatalError`: Permanent failures (invalid data, constraint violations)
  - Generic `Error`: Automatic retry with exponential backoff
- Include retry configuration: `functionName.maxRetries = N`
- Use `getStepMetadata()` for attempt tracking and logging

### Search Index Changes

If you're modifying how data is indexed in Upstash:

1. Update `index-image.ts` to change metadata structure
2. Test locally to ensure search results include all needed data
3. Document any breaking changes in your PR
4. Consider backward compatibility with existing indexed data

### UI Changes

If you're modifying the UI:

- Use existing shadcn/ui components where possible
- Follow Tailwind CSS 4 conventions
- Ensure responsive design (mobile-first)
- Test dark mode compatibility
- Maintain accessibility standards

## Reporting Issues

When reporting bugs or requesting features:

- Use the GitHub issue tracker
- Check if the issue already exists before creating a new one
- For bugs, include:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Screenshots if applicable
  - Browser/environment details
- For features, explain:
  - The use case
  - Why it would benefit users
  - Potential implementation approach

## Areas for Contribution

We welcome contributions in these areas:

- **UI/UX improvements**: Better image gallery, search interface, upload feedback
- **Performance**: Optimize image loading, caching strategies
- **Features**: Batch uploads, image editing, advanced search filters
- **Error handling**: Better error messages, retry strategies
- **Documentation**: Tutorials, examples, API documentation
- **Testing**: Unit tests, integration tests, E2E tests
- **Accessibility**: ARIA labels, keyboard navigation
- **Internationalization**: Multi-language support

## Questions or Need Help?

- Open a GitHub issue for questions
- Check the [README.md](../README.md) for setup and architecture details
- Review existing PRs and issues for similar discussions

## Code of Conduct

Please be respectful and constructive in all interactions. We're building a welcoming community where everyone can contribute.

## License

By contributing to Vectr, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Vectr!
