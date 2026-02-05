# Contributing to Nestly

Thank you for considering contributing to Nestly! This document provides guidelines and instructions for contributing.

---

## 🎯 Ways to Contribute

- **Report bugs** - Found something broken? Let us know!
- **Suggest features** - Have ideas for improvements?
- **Submit PRs** - Code contributions are welcome!
- **Improve docs** - Help make our documentation better
- **Share feedback** - User experience insights appreciated

---

## 🐛 Reporting Bugs

### Before Submitting
1. Check if the bug has already been reported in [Issues](https://github.com/uwaisishaq/nestly/issues)
2. Test on the latest version
3. Gather reproduction steps

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Tap on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Device:**
 - Device: [e.g. iPhone 15 Pro]
 - OS: [e.g. iOS 17.2]
 - App Version: [e.g. 1.2.2]
 - Build: [e.g. TestFlight build 41]

**Additional context**
Any other relevant information.
```

---

## 💡 Feature Requests

We love hearing your ideas! Please include:
- **Use case** - Why do you need this feature?
- **Proposed solution** - How would you implement it?
- **Alternatives** - What other options did you consider?
- **Design mockups** - Visual ideas welcome!

---

## 🔧 Development Setup

### Prerequisites
- macOS (for iOS development)
- Xcode 15+
- Node.js 20+
- iOS device or simulator
- Supabase account

### Setup Steps

1. **Fork and clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/nestly.git
   cd nestly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run `supabase/schema.sql` in SQL Editor
   - Deploy Edge Functions:
     ```bash
     npx supabase functions deploy unfurl
     npx supabase functions deploy classify
     ```

5. **Run the app**
   ```bash
   npx expo start
   # Press 'i' for iOS simulator
   ```

---

## 📝 Code Style

### TypeScript
- Use **TypeScript** for all new files
- Prefer **functional components** with hooks
- Use **explicit types** (avoid `any`)
- Add **JSDoc comments** for complex functions

### React Native
- Follow **React Native best practices**
- Use **Expo APIs** when available
- Prefer **Expo Router** for navigation
- Use **custom hooks** for reusable logic

### Formatting
- Use **Prettier** for formatting (auto-format on save)
- Run `npm run lint` before committing
- Keep lines **under 120 characters** when reasonable

### Naming Conventions
- **Components:** PascalCase (e.g., `SearchBar.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `usePosts.ts`)
- **Utilities:** camelCase (e.g., `deeplinks.ts`)
- **Types:** PascalCase (e.g., `Platform`, `Post`)

---

## 🏗 Architecture Guidelines

### File Organization
```
app/           # Screens (Expo Router)
components/    # Reusable UI components
hooks/         # Custom React hooks
lib/           # Utilities and services
constants/     # Theme, layout constants
types/         # TypeScript type definitions
```

### Component Structure
```typescript
// 1. Imports (React, RN, third-party, local)
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { theme } from '@/constants/theme';

// 2. Types
type Props = { title: string };

// 3. Component
export function MyComponent({ title }: Props) {
  // Logic here
  return <View>...</View>;
}

// 4. Styles (at bottom)
const styles = StyleSheet.create({...});
```

### State Management
- Use **React Context** for global state
- Use **local state** for component-specific data
- Use **custom hooks** to encapsulate logic
- Avoid prop drilling (lift to context when needed)

---

## 🧪 Testing

### Running Tests
```bash
# Run all tests
node --loader ts-node/esm tests/rules.test.ts
node --loader ts-node/esm tests/canonicalize.test.ts
node --loader ts-node/esm tests/deeplinks.parseIncomingShare.test.ts
```

### Writing Tests
- Add tests for **new utilities**
- Add tests for **complex logic**
- Test **edge cases**
- Keep tests **simple and focused**

---

## 🚀 Pull Request Process

### Before Submitting
1. **Test your changes** thoroughly
2. **Run the linter** (`npm run lint`)
3. **Update documentation** if needed
4. **Add tests** for new functionality
5. **Check for console warnings**

### PR Template
```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test these changes?

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass
```

### Review Process
1. Submit PR with clear description
2. Maintainer reviews within 3-7 days
3. Address feedback if requested
4. Once approved, PR will be merged
5. Your contribution will be credited!

---

## 🎨 Design Guidelines

### UI Principles
- **Immersive** - Full-screen content, minimal chrome
- **Smooth** - 60fps animations, haptic feedback
- **Glass** - Glassmorphic surfaces for depth
- **Dark-first** - Optimized for content viewing

### Component Patterns
- Use `Glass` for elevated surfaces
- Use `IconButton` for circular icon actions
- Use `Chip` for filter pills
- Use theme constants (never hardcoded colors)

### Accessibility
- Add `accessibilityLabel` to interactive elements
- Use `accessibilityRole` for semantic meaning
- Support Dynamic Type when possible
- Test with VoiceOver

---

## 🔐 Security

### Reporting Security Issues
**Do not** open public issues for security vulnerabilities.

Email security issues to: **uwaisishaq@example.com** (replace with your email)

We'll respond within 48 hours.

### Security Best Practices
- Never commit `.env` files
- Don't hardcode API keys
- Use RLS for database access
- Validate user input
- Sanitize URLs before opening

---

## 📞 Getting Help

- **Questions?** Open a [Discussion](https://github.com/uwaisishaq/nestly/discussions)
- **Bug found?** Open an [Issue](https://github.com/uwaisishaq/nestly/issues)
- **Need help?** Check [DOCS.md](./DOCS.md)

---

## 🙏 Recognition

Contributors will be:
- Listed in release notes
- Mentioned in README (if significant contribution)
- Credited in commit messages

Thank you for making Nestly better! ❤️

---

## 📜 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards
- **Be respectful** and professional
- **Be constructive** with feedback
- **Be patient** with newcomers
- **Be open** to different perspectives

### Enforcement
Instances of unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated.

---

<p align="center">
  <strong>Happy Contributing! 🚀</strong>
</p>

