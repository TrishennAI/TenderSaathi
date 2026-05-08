# Contributing to TenderSaathi

Thank you for your interest in contributing to TenderSaathi! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/TenderSaathi.git
   cd TenderSaathi
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```
5. **Run the development server**:
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### 1. Create a Branch

Create a new branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation updates
- `refactor/` — Code refactoring
- `test/` — Test additions or updates
- `chore/` — Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Run build to check for errors
npm run build

# Run E2E tests (if applicable)
npm run test:e2e
```

### 4. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add user profile editing feature"
```

Commit message format:
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, etc.)
- `refactor:` — Code refactoring
- `test:` — Test additions or updates
- `chore:` — Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference to related issues
- Screenshots (if UI changes)
- Testing notes

## 🎨 Code Style

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Export types from `lib/types.ts`

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Add JSDoc comments for complex components

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: kebab-case (`user-profile.ts`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Types/Interfaces**: PascalCase (`UserProfile`)

### File Organization

```
component-name/
├── ComponentName.tsx       # Main component
├── ComponentName.test.tsx  # Tests (if applicable)
└── index.ts               # Re-export
```

## 🧪 Testing

- Write E2E tests for critical user flows
- Test both happy paths and error cases
- Test responsive design
- Test both light and dark themes
- Test both English and Hindi locales

## 📝 Documentation

- Update README.md for user-facing changes
- Update docs/ for architectural changes
- Add JSDoc comments for public APIs
- Update CHANGELOG.md (if exists)

## 🔍 Code Review Process

1. **Self-review** your code before submitting
2. **Address feedback** from reviewers promptly
3. **Keep PRs focused** — one feature/fix per PR
4. **Be responsive** to questions and suggestions

## 🐛 Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs

## 💡 Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:
- Clear description
- Problem statement
- Proposed solution
- Benefits and drawbacks

## 🚫 What NOT to Commit

- `.env.local` or any file with secrets
- `node_modules/`
- `.next/` build output
- Personal IDE settings (unless beneficial to all)
- Large binary files
- Commented-out code (use git history instead)

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions
- Keep discussions professional

## 📞 Questions?

- Check [docs/SETUP.md](./docs/SETUP.md) for setup help
- Review [docs/PRODUCT.md](./docs/PRODUCT.md) for architecture
- Open a GitHub Discussion for general questions
- Contact maintainers for sensitive issues

## 🙏 Thank You!

Your contributions make TenderSaathi better for everyone. We appreciate your time and effort!

---

**Happy Coding! 🚀**
