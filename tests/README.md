# Playwright E2E Tests

## Overview
End-to-end tests for the Melate Lottery application using Playwright.

## Structure
```
tests/
├── pages/              # Page Object Models
│   └── LoginPage.ts
└── login.spec.ts       # Login test specifications
```

## Running Tests

### Run all tests (headless)
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

## Test Credentials

**Valid Login:**
- Username: `super-user`
- Password: `support`

**Invalid Login:**
- Any other combination will fail

## Test Coverage

### Login Tests (`login.spec.ts`)
- ✅ Display login page elements
- ✅ Successful login with valid credentials
- ✅ Error message with invalid username
- ✅ Error message with invalid password
- ✅ Error handling with empty credentials
- ✅ Multiple login attempts
- ✅ Accessibility checks (ARIA labels, roles)

## Page Objects

### LoginPage
- `goto()` - Navigate to login page
- `login(username, password)` - Perform login
- `getErrorMessage()` - Get error text
- `isErrorVisible()` - Check if error is displayed
- `waitForSuccessfulLogin()` - Wait for login to complete

## Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:3000`
- Browser: Chromium (Chrome)
- Auto-starts dev server before tests
- Screenshots on failure
- Trace on retry

## CI/CD

Tests are configured to run in CI environments with:
- 2 retries on failure
- Sequential execution (not parallel)
- HTML report generation
