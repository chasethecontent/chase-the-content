
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Global error handler for early boot errors to provide user feedback
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Critical Boot Error:", { message, source, lineno, colno, error });
  const root = document.getElementById('root');
  if (root && (root.innerHTML === '' || root.innerHTML.includes('Initializing'))) {
    root.innerHTML = `
      <div style="padding: 40px; color: white; background: #0b0e14; min-height: 100vh; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
        <div style="background: #1e293b; padding: 40px; border-radius: 24px; border: 1px solid #334155; max-width: 600px; width: 100%;">
          <h1 style="color: #ef4444; margin-bottom: 16px; font-size: 24px;">Connection Failed</h1>
          <p style="color: #94a3b8; margin-bottom: 24px;">The application encountered a critical error during startup. This is often caused by incorrect API keys or browser compatibility issues.</p>
          <div style="text-align: left; background: #0b0e14; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; color: #f87171; overflow-x: auto; margin-bottom: 24px; border: 1px solid #ef444420;">
            ${message}
          </div>
          <button onclick="window.location.reload()" style="background: #6366f1; color: white; border: none; padding: 12px 32px; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 14px; transition: transform 0.2s;">
            Retry Connection
          </button>
        </div>
      </div>
    `;
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Target container 'root' not found in document.");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
