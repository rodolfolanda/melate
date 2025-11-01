import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeContext, useThemeState } from './hooks/useTheme';

function Root(): React.JSX.Element {
  const themeState = useThemeState();
  
  return (
    <ThemeContext.Provider value={themeState}>
      <App />
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
