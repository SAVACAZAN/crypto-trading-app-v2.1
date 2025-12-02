/**
 * Block DevTools, Right-click, and Detect DevTools Opening
 * Client-side only plugin for Nuxt 3
 *
 * TEMPORARILY DISABLED FOR DEBUGGING
 */

export default defineNuxtPlugin(() => {
  // DISABLED - Return early for debugging
  return;

  // Only run on client-side
  if (process.server) return;

  // 🔒 Block Right-Click (Context Menu)
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    console.warn('⚠️ Right-click is disabled on this site.');
  });

  // 🔒 Block DevTools Keyboard Shortcuts
  document.addEventListener('keydown', (event) => {
    if (
      event.key === 'F12' || // F12
      (event.ctrlKey && event.shiftKey && event.key === 'I') || // Ctrl+Shift+I
      (event.ctrlKey && event.shiftKey && event.key === 'J') || // Ctrl+Shift+J
      (event.ctrlKey && event.shiftKey && event.key === 'C') || // Ctrl+Shift+C (Inspect)
      (event.ctrlKey && event.key === 'U') || // Ctrl+U (View Source)
      (event.metaKey && event.altKey && event.key === 'I') || // Cmd+Option+I (Mac)
      (event.metaKey && event.altKey && event.key === 'J') || // Cmd+Option+J (Mac)
      (event.metaKey && event.altKey && event.key === 'C') // Cmd+Option+C (Mac)
    ) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('⚠️ DevTools shortcuts are disabled.');
    }
  });

  // 🔍 Detect DevTools Opening (Advanced Detection)
  let devtoolsOpen = false;
  let detectionInterval = null;

  const detectDevTools = () => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const orientation = widthThreshold ? 'vertical' : 'horizontal';

    // Method 1: Window size difference
    if (widthThreshold || heightThreshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        handleDevToolsOpen();
      }
    } else {
      if (devtoolsOpen) {
        devtoolsOpen = false;
        handleDevToolsClose();
      }
    }

    // Method 2: Console debug detection
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function () {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          handleDevToolsOpen();
        }
      }
    });

    // Trigger detection
    console.log('%c', element);

    // Method 3: Debugger detection
    const before = new Date().getTime();
    debugger; // This will pause if DevTools are open
    const after = new Date().getTime();

    if (after - before > 100) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        handleDevToolsOpen();
      }
    }
  };

  // 🚨 Handle DevTools Opening
  const handleDevToolsOpen = () => {
    console.clear();
    console.log('%c🚫 ACCESS DENIED', 'color: #f87171; font-size: 40px; font-weight: bold;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #f87171;');
    console.log('%cDevTools detected! This action has been logged.', 'color: #fbbf24; font-size: 16px;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #f87171;');

    // Show modal/overlay (optional)
    showAccessDeniedOverlay();
  };

  // ✅ Handle DevTools Closing
  const handleDevToolsClose = () => {
    console.log('%c✅ DevTools closed', 'color: #10b981; font-size: 14px;');
    hideAccessDeniedOverlay();
  };

  // 🎨 Show "Access Denied" Overlay
  const showAccessDeniedOverlay = () => {
    // Remove existing overlay if present
    const existingOverlay = document.getElementById('devtools-overlay');
    if (existingOverlay) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'devtools-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(20px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      animation: fadeIn 0.3s ease;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      </style>
      <div style="text-align: center; animation: pulse 2s infinite;">
        <div style="font-size: 100px; margin-bottom: 20px;">🚫</div>
        <h1 style="color: #f87171; font-size: 48px; margin: 0; font-weight: bold;">ACCESS DENIED</h1>
        <p style="color: #fbbf24; font-size: 20px; margin-top: 20px;">
          DevTools have been detected and disabled.
        </p>
        <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-top: 10px;">
          Please close DevTools to continue using this application.
        </p>
        <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 20px;">
          This action has been logged for security purposes.
        </p>
      </div>
    `;

    document.body.appendChild(overlay);
  };

  // 🗑️ Hide "Access Denied" Overlay
  const hideAccessDeniedOverlay = () => {
    const overlay = document.getElementById('devtools-overlay');
    if (overlay) {
      overlay.remove();
    }
  };

  // 🔄 Start Detection (check every 1 second)
  detectionInterval = setInterval(detectDevTools, 1000);

  // 🧹 Cleanup on app unmount
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    });
  }

  console.log('%c🛡️ DevTools Protection Active', 'color: #10b981; font-size: 14px; font-weight: bold;');
});
