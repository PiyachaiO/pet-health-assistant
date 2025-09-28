# 🤝 Contributing to Pet Health Assistant

Thank you for your interest in contributing to the Pet Health Assistant project! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Code Style](#code-style)
- [Testing](#testing)

## 📜 Code of Conduct

This project follows a code of conduct that we expect all contributors to follow:

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be constructive in feedback
- Focus on what's best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Supabase account (for database)

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/your-username/pet-health-assistant.git
   cd pet-health-assistant
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment setup**
   ```bash
   # Copy environment file
   cp backend/env.example backend/.env
   
   # Edit with your Supabase credentials
   # SUPABASE_URL=your_supabase_url
   # SUPABASE_ANON_KEY=your_supabase_anon_key
   # SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## 🔧 Development Guidelines

### Project Structure

```
pet-health-assistant/
├── backend/                 # Node.js API server
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication, validation
│   ├── routes/             # API routes
│   └── uploads/            # File uploads
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API services
└── database/               # Database schemas
```

### Code Style

#### JavaScript/React
- Use ES6+ features
- Use functional components with hooks
- Use meaningful variable and function names
- Add comments for complex logic
- Use consistent indentation (2 spaces)

#### CSS/Styling
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Use consistent spacing and colors
- Avoid inline styles when possible

#### Backend
- Use async/await for asynchronous operations
- Add proper error handling
- Use middleware for common functionality
- Follow RESTful API conventions

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add tests if applicable
   - Update documentation

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: your feature description"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Fill out the PR template

## 📝 Pull Request Process

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] Self-review of your code has been performed
- [ ] Code has been commented, particularly in hard-to-understand areas
- [ ] Tests have been added/updated (if applicable)
- [ ] Documentation has been updated
- [ ] No new warnings or errors

### PR Template

When creating a Pull Request, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🐛 Issue Reporting

### Before Creating an Issue

1. Check if the issue already exists
2. Search through closed issues
3. Verify the issue with the latest version

### Issue Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Version: [e.g., 1.0.0]

## Additional Context
Any other context about the problem
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
npm test
```

### Manual Testing
- Test all user flows
- Test different user roles
- Test responsive design
- Test file uploads
- Test error scenarios

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex algorithms
- Explain business logic
- Add inline comments for clarity

### API Documentation
- Document all endpoints
- Include request/response examples
- Document authentication requirements
- Include error codes and messages

## 🔒 Security

### Security Guidelines
- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Validate all user inputs
- Follow secure coding practices
- Report security vulnerabilities privately

### Reporting Security Issues
- Email: security@pethealth.com
- Include detailed description
- Provide steps to reproduce
- Include potential impact

## 📞 Support

### Getting Help
- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Join our community Discord (if available)
- Contact maintainers for urgent issues

### Community Guidelines
- Be respectful and constructive
- Help others when you can
- Share knowledge and best practices
- Follow the project's code of conduct

## 🎯 Contribution Ideas

### Good First Issues
- Documentation improvements
- UI/UX enhancements
- Bug fixes
- Test coverage improvements
- Performance optimizations

### Feature Requests
- New functionality
- Integration improvements
- User experience enhancements
- Performance improvements

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Pet Health Assistant! 🐾
