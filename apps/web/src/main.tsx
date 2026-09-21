import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './tokens.css';

// Scaffold shell only. The guided workspace (ADR-013) is built in M7.
function App() {
  return (
    <main className="shell">
      <h1>1stStep OS</h1>
      <p>Foundation scaffold. No product features yet.</p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
