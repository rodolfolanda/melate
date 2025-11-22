import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

export function Login(): React.JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error } = useAuth();

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Melate Lottery</h1>
          <p className="login-subtitle">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} aria-label="Login form" className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-label="Username"
              data-testid="username-input"
              className="form-input"
              placeholder="Enter your username"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              data-testid="password-input"
              className="form-input"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div role="alert" className="login-error" data-testid="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            data-testid="login-button"
          >
            Login
          </button>
        </form>

        <div className="login-footer">
          <p className="login-hint">
            Hint: super-user / support
          </p>
        </div>
      </div>
    </div>
  );
}
