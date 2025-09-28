# 🧪 Testing Guide

## Overview

This document provides comprehensive testing guidelines for the Pet Health Assistant system, covering unit tests, integration tests, E2E tests, and performance tests.

## 📋 Test Structure

### Backend Tests
```
backend/
├── tests/
│   ├── setup.js                    # Test setup configuration
│   ├── auth.test.js                # Authentication tests
│   ├── pets.test.js                # Pet management tests
│   ├── appointments.test.js        # Appointment tests
│   ├── upload.test.js              # File upload tests
│   ├── integration/
│   │   ├── appointment-workflow.test.js
│   │   └── pet-management-workflow.test.js
│   └── performance/
│       └── load-test.js            # Performance tests
├── jest.config.js                  # Jest configuration
└── package.json                    # Test scripts
```

### Frontend Tests
```
frontend/src/
├── setupTests.js                   # Test setup
├── tests/
│   ├── contexts/
│   │   └── AuthContext.test.js     # Context tests
│   ├── components/
│   │   └── ImageUpload.test.js     # Component tests
│   ├── pages/
│   │   └── Dashboard.test.js        # Page tests
│   └── e2e/
│       └── user-workflow.test.js   # E2E tests
└── package.json                    # Test scripts
```

## 🚀 Running Tests

### Backend Tests

```bash
# Run all tests
cd backend
npm test

# Run specific test types
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:performance    # Performance tests only
npm run test:all            # All tests with coverage

# Run tests in watch mode
npm run test:watch

# Run tests for CI
npm run test:ci
```

### Frontend Tests

```bash
# Run all tests
cd frontend
npm test

# Run specific test types
npm run test:unit           # Unit tests only
npm run test:e2e            # E2E tests only
npm run test:coverage       # Tests with coverage
npm run test:ci             # CI tests

# Run tests in watch mode
npm test -- --watch
```

## 📊 Test Coverage

### Coverage Targets
- **Backend**: 70% minimum coverage
- **Frontend**: 70% minimum coverage
- **Critical Paths**: 90% coverage

### Coverage Reports
- **Backend**: `backend/coverage/`
- **Frontend**: `frontend/coverage/`

## 🧪 Test Categories

### 1. Unit Tests
Test individual functions and components in isolation.

**Backend Unit Tests:**
- Authentication endpoints
- Pet CRUD operations
- Appointment management
- File upload functionality
- Input validation
- Error handling

**Frontend Unit Tests:**
- React components
- Context providers
- Custom hooks
- Utility functions
- Form validation

### 2. Integration Tests
Test complete workflows and API interactions.

**Integration Test Scenarios:**
- User registration → Login → Dashboard
- Pet creation → Health record → Nutrition plan
- Appointment booking → Confirmation → Completion
- File upload → Database storage → Retrieval

### 3. E2E Tests
Test complete user workflows from start to finish.

**E2E Test Scenarios:**
- User registration and onboarding
- Pet management workflow
- Appointment booking process
- Veterinarian patient management
- Admin user management

### 4. Performance Tests
Test system performance under various loads.

**Performance Test Scenarios:**
- API response times
- Concurrent request handling
- Memory usage monitoring
- Database query performance
- File upload performance

## 🔧 Test Configuration

### Backend Jest Configuration
```javascript
// backend/jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    'server.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

### Frontend Test Configuration
```javascript
// frontend/src/setupTests.js
import '@testing-library/jest-dom'

// Mock localStorage, sessionStorage, fetch, etc.
```

## 📝 Writing Tests

### Backend Test Example
```javascript
describe('Pets API', () => {
  it('should create new pet', async () => {
    const petData = {
      name: 'Test Pet',
      species: 'dog',
      breed: 'Golden Retriever'
    }

    const response = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${authToken}`)
      .send(petData)
      .expect(201)

    expect(response.body).toHaveProperty('success', true)
    expect(response.body.pet.name).toBe(petData.name)
  })
})
```

### Frontend Test Example
```javascript
describe('Dashboard Component', () => {
  it('should display user pets', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Fluffy')).toBeInTheDocument()
    })
  })
})
```

## 🐛 Debugging Tests

### Common Issues
1. **Mock Issues**: Ensure all external dependencies are mocked
2. **Async Issues**: Use `waitFor` for async operations
3. **State Issues**: Reset state between tests
4. **API Issues**: Mock API responses consistently

### Debug Commands
```bash
# Run specific test file
npm test -- auth.test.js

# Run tests with verbose output
npm test -- --verbose

# Run tests with debug output
DEBUG=* npm test
```

## 📈 Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:ci
```

## 🎯 Best Practices

### Test Writing
1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: One test, one assertion
4. **Mock External Dependencies**: Isolate units under test
5. **Test Edge Cases**: Include error scenarios

### Test Maintenance
1. **Keep Tests Updated**: Update tests when code changes
2. **Remove Dead Tests**: Delete obsolete tests
3. **Refactor Tests**: Keep tests clean and maintainable
4. **Monitor Coverage**: Track coverage trends

### Performance Testing
1. **Baseline Metrics**: Establish performance baselines
2. **Load Testing**: Test under realistic loads
3. **Memory Monitoring**: Watch for memory leaks
4. **Response Times**: Set acceptable response time limits

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🚨 Troubleshooting

### Common Test Failures
1. **Timeout Errors**: Increase test timeout
2. **Mock Errors**: Check mock implementations
3. **Async Errors**: Use proper async/await patterns
4. **Environment Errors**: Check test environment setup

### Getting Help
- Check test logs for detailed error messages
- Review test configuration files
- Ensure all dependencies are installed
- Verify test environment setup
