# Contributing to Xbox Cloud Gaming Client

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/xbox-cloud-gaming-client.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Make your changes
6. Test your changes: `npm test`
7. Commit with clear messages: `git commit -m 'Add feature: description'`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Open a Pull Request

## Development Setup

### Prerequisites
- Node.js 16+
- npm 8+
- FFmpeg
- Git

### Installation

```bash
git clone https://github.com/Ytbeast186/xbox-cloud-gaming-client.git
cd xbox-cloud-gaming-client
npm install
cp .env.example .env
```

### Running Development Server

```bash
npm run dev
```

## Coding Standards

- Follow ESLint rules: `npm run lint`
- Use consistent naming conventions
- Write meaningful commit messages
- Add comments for complex logic
- Keep functions small and focused
- Use async/await for asynchronous code

## Testing

- Write tests for new features
- Run tests before submitting PR: `npm test`
- Aim for >80% code coverage
- Test edge cases and error scenarios

## Commit Messages

Format: `[Type] Subject`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Adding tests

Example: `[feat] Add adaptive bitrate streaming`

## Pull Request Process

1. Update README if needed
2. Add/update tests
3. Ensure all tests pass
4. Ensure no linting errors
5. Provide clear PR description
6. Link related issues
7. Wait for review and address feedback

## Issues

- Search existing issues before creating new ones
- Use clear, descriptive titles
- Provide steps to reproduce for bugs
- Include error messages and logs
- Specify your environment (OS, Node version, etc.)

## Feature Requests

- Clearly describe the feature
- Explain the use case
- Provide examples if possible
- Consider implementation approach

## Questions?

Feel free to open an issue for questions or start a discussion!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
