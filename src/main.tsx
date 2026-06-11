import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// NUCLEAR OPTION: Suppress ALL R3F and MapLibre errors at the window level BEFORE anything else runs
if (typeof window !== 'undefined') {
  // Capture phase - runs before ANY other error handlers
  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    const err = event.error?.message || '';
    const filename = event.filename || '';
    
    // Suppress R3F, MapLibre, and React DevTools metadata errors
    if (
      msg.includes('R3F') ||
      msg.includes('sources.') ||
      msg.includes('zoning-polygon-overlay') ||
      msg.includes('data-source-stack') ||
      msg.includes('data-source-location') ||
      msg.includes('data-element-type') ||
      msg.includes('data-line-number') ||
      msg.includes('data-real-file') ||
      msg.includes('data-real-line') ||
      msg.includes('data-real-column') ||
      msg.includes('data-injected-source') ||
      msg.includes('unknown property') ||
      msg.includes('__r3f') ||
      msg.includes('Cannot convert undefined or null to object') ||
      err.includes('R3F') ||
      err.includes('data-source-stack') ||
      err.includes('sources.') ||
      filename.includes('maplibre')
    ) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }, true); // TRUE = capture phase, runs FIRST

  // Also suppress unhandledrejection for R3F promises
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || event.reason || '';
    if (
      String(msg).includes('R3F') ||
      String(msg).includes('data-source-stack') ||
      String(msg).includes('sources.') ||
      String(msg).includes('Cannot convert undefined or null to object')
    ) {
      event.preventDefault();
      return false;
    }
  });

  // Override console.error globally BEFORE React loads
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = String(args[0] || '');
    const stack = String(args[1] ||  '')
    if (
      msg.includes('R3F') ||
      msg.includes('sources.') ||
      msg.includes('zoning-polygon-overlay') ||
      msg.includes('data-source-stack') ||
      msg.includes('data-source-location') ||
      msg.includes('data-element-type') ||
      msg.includes('data-line-number') ||
      msg.includes('data-real-file') ||
      msg.includes('data-real-line') ||
      msg.includes('data-real-column') ||
      msg.includes('data-injected-source') ||
      msg.includes('unknown property') ||
      msg.includes('__r3f') ||
      msg.includes('Cannot convert undefined or null to object') ||
      stack.includes('maplibre')
    ) {
      return; // Suppress completely
    }
    originalConsoleError(...args);
  };
}

createRoot(document.getElementById('root')!).render(<App />);
