// Robust shim for process.env to prevent ReferenceErrors in browser environments during module evaluation
if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = { env: {} };
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Global error handler for early boot errors to provide user feedback
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Critical Boot Error:", { message, source, lineno, colno, error });
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 40px; color: white; background: #0b0e14; min-height: 100vh; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
        <div style="background: #1e293b; padding: 40px; border-radius: 24px; border: 1px solid #334155; max-width: 600px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          <div style="background: #ef444420; width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
            <svg style="width: 32px; height: 32px; color: #ef4444" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 style="color: white; margin-bottom: 16px; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">BOOT SEQUENCE INTERRUPTED</h1>
          <p style="color: #94a3b8; margin-bottom: 24px; font-size: 14px; line-height: 1.6;">The application encountered a critical error during startup. Check your environment variables or console for details.</p>
          <div style="text-align: left; background: #0b0e14; padding: 16px; border-radius: 12px; font-family: monospace; font-size: 12px; color: #f87171; overflow-x: auto; margin-bottom: 24px; border: 1px solid #ef444420; white-space: pre-wrap;">
            ${message}
          </div>
          <button onclick="window.location.reload()" style="background: #6366f1; color: white; border: none; padding: 14px 32px; border-radius: 14px; cursor: pointer; font-weight: 800; font-size: 14px; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.05em;">
            Restart System
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