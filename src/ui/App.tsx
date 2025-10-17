import { useState } from 'react';

function App(): React.JSX.Element {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎰 Lottery Number Generator</h1>
        <p>AI-Powered Smart Number Generation</p>
      </header>
      
      <main className="app-main">
        <div className="welcome-card">
          <h2>Welcome!</h2>
          <p>This is your new React UI for the lottery number generator.</p>
          <button onClick={() => setCount((count) => count + 1)}>
            Test Button: count is {count}
          </button>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Powered by AI & TypeScript ✨</p>
      </footer>
    </div>
  );
}

export default App;
