import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeContext, useThemeState } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';

function Root(): React.JSX.Element {
  const themeState = useThemeState();
  
  return (
    <ThemeContext.Provider value={themeState}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeContext.Provider>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );
}
