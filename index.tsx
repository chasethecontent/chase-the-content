
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global error handler for early boot errors
window.onerror = (message, source, lineno, colno, error) => {
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `
      <div style="padding: 40px; color: white; background: #0b0e14; height: 100vh; font-family: sans-serif;">
        <h1 style="color: #ef4444;">Critical Boot Error</h1>
        <p style="color: #94a3b8;">The application failed to initialize. This is usually due to missing environment variables or a script error.</p>
        <pre style="background: #1e293b; padding: 20px; border-radius: 8px; overflow: auto; border: 1px solid #334155;">${message}</pre>
        <button onclick="window.location.reload()" style="background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 20px;">
          Try Reloading
        </button>
      </div>
    `;
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
