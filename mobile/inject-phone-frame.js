#!/usr/bin/env node
/**
 * Post-build script: injects phone-frame chrome into Expo's generated dist/index.html.
 * Run after `npx expo export --platform web`.
 */
const fs = require('fs');
const path = require('path');

const distHtml = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(distHtml, 'utf8');

// Replace Expo's #expo-reset style (which sets body{overflow:hidden} and
// #root{height:100%}) with our phone-frame layout rules.
html = html.replace(
  /<style id="expo-reset">.*?<\/style>/s,
  `<style id="expo-reset">
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html {
      height: 100%;
    }

    body {
      height: 100%;
      min-height: 100vh;
      overflow: auto;
      background: #020617;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .phone-frame {
      position: relative;
      width: 393px;
      height: 852px;
      border-radius: 50px;
      background: #0f172a;
      box-shadow:
        inset 0 0 0 2px #334155,
        0 0 0 8px #1e293b,
        0 0 0 10px #0f172a,
        0 0 0 11px #334155,
        0 60px 120px rgba(0, 0, 0, 0.8),
        0 20px 40px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      flex-shrink: 0;
    }

    /* Dynamic island notch */
    .phone-frame::before {
      content: '';
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 34px;
      background: #0f172a;
      border-radius: 20px;
      z-index: 9999;
      pointer-events: none;
    }

    /* Volume / power buttons */
    .phone-side-btn {
      position: absolute;
      width: 4px;
      border-radius: 2px;
      background: #334155;
    }
    .vol-up   { top: 140px; left: -12px; height: 36px; }
    .vol-down { top: 188px; left: -12px; height: 36px; }
    .power    { top: 180px; right: -12px; height: 56px; }

    #root {
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      visibility: hidden;
    }

    #root.app-ready {
      visibility: visible;
    }

    .page-label {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      color: #334155;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.08em;
      white-space: nowrap;
      pointer-events: none;
      user-select: none;
    }

    /* Mobile: full-screen, no frame */
    @media (max-width: 480px) {
      body {
        background: #ffffff;
        display: block;
      }
      .phone-frame {
        width: 100vw;
        height: 100vh;
        border-radius: 0;
        box-shadow: none;
        background: transparent;
      }
      .phone-frame::before,
      .phone-side-btn,
      .page-label {
        display: none;
      }
    }
  </style>`
);

// Strip Expo's pre-rendered SSR content from #root — leave it empty so the
// MutationObserver correctly detects when React hydrates and adds app-ready.
// This prevents the 1-2s flash of unstyled pre-rendered HTML (FOUC).
html = html.replace(/<div id="root">[\s\S]*?<\/div>(?=\s*<script)/, '<div id="root"></div>');

// Wrap <div id="root"> with phone-frame div
html = html.replace(
  '<div id="root"></div>',
  `<div class="phone-frame">
    <div class="phone-side-btn vol-up"></div>
    <div class="phone-side-btn vol-down"></div>
    <div class="phone-side-btn power"></div>
    <div id="root"></div>`
);

// Close the phone-frame div before </body>
html = html.replace(
  '</body>',
  `  </div><!-- /phone-frame -->
  <span class="page-label">QuickCover &nbsp;·&nbsp; Worker App &nbsp;·&nbsp; Demo</span>
  <script>
    // Reveal app only after React has hydrated — eliminates FOUC
    (function() {
      var root = document.getElementById('root');
      var observer = new MutationObserver(function() {
        if (root.children.length > 0) {
          root.classList.add('app-ready');
          observer.disconnect();
        }
      });
      observer.observe(root, { childList: true, subtree: true });
      // Safety fallback: always show after 200ms even if observer missed
      setTimeout(function() { root.classList.add('app-ready'); }, 200);
    })();
  </script>
</body>`
);

// Remove `defer` from the main entry script so JS executes immediately
// instead of after HTML parse — eliminates the window where empty root is visible
html = html.replace(/(<script src="[^"]*entry-[^"]*\.js") defer>/g, '$1>');

fs.writeFileSync(distHtml, html, 'utf8');
console.log('✅ Phone frame injected into dist/index.html');
