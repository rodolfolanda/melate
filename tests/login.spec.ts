import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login page', async () => {
    await expect(loginPage.loginTitle).toBeVisible();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should login successfully with valid credentials', async () => {
    // Arrange
    const validUsername = 'super-user';
    const validPassword = 'support';

    // Act
    await loginPage.login(validUsername, validPassword);

    // Assert - login page should disappear
    await loginPage.waitForSuccessfulLogin();
    await expect(loginPage.loginTitle).not.toBeVisible();
  });

  test('should show error message with invalid username', async () => {
    // Arrange
    const invalidUsername = 'wrong-user';
    const validPassword = 'support';

    // Act
    await loginPage.login(invalidUsername, validPassword);

    // Assert
    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Invalid username or password');
  });

  test('should show error message with invalid password', async () => {
    // Arrange
    const validUsername = 'super-user';
    const invalidPassword = 'wrong-password';

    // Act
    await loginPage.login(validUsername, invalidPassword);

    // Assert
    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Invalid username or password');
  });

  test('should show error message with empty credentials', async () => {
    // Act
    await loginPage.login('', '');

    // Assert - HTML5 validation should prevent submission
    // Or if it goes through, error should be shown
    const isLoginPageStillVisible = await loginPage.isLoginPageVisible();
    expect(isLoginPageStillVisible).toBe(true);
  });

  test('should allow multiple login attempts after failure', async () => {
    // First attempt - invalid
    await loginPage.login('wrong-user', 'wrong-pass');
    await expect(loginPage.errorMessage).toBeVisible();

    // Second attempt - valid
    await loginPage.login('super-user', 'support');
    await loginPage.waitForSuccessfulLogin();
    await expect(loginPage.loginTitle).not.toBeVisible();
  });

  test('should have accessible form elements', async () => {
    // Check ARIA labels and roles
    await expect(loginPage.usernameInput).toHaveAttribute('aria-label', 'Username');
    await expect(loginPage.passwordInput).toHaveAttribute('aria-label', 'Password');
    
    // Check password input type
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });
});
