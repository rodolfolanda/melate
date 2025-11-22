import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object Model for Login Page
 * Encapsulates all interactions with the login screen
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly loginTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Using getByRole for accessibility-first selectors
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByRole('alert');
    
    // Using text content for static elements
    this.loginTitle = page.getByText('Melate Lottery');
  }

  /**
   * Navigate to the login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Perform login with provided credentials
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Get the error message text (if visible)
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Check if error message is visible
   */
  async isErrorVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Check if login page is displayed
   */
  async isLoginPageVisible(): Promise<boolean> {
    return await this.loginTitle.isVisible();
  }

  /**
   * Wait for successful login (login page should disappear)
   */
  async waitForSuccessfulLogin(): Promise<void> {
    await this.loginTitle.waitFor({ state: 'hidden' });
  }
}
