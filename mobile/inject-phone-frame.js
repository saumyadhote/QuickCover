#!/usr/bin/env node
/**
 * Post-build script: injects phone-frame chrome into Expo's generated dist/index.html.
 * Run after `npx expo export --platform web`.
 */
const fs = require('fs');
const path = require('path');

const distHtml = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(distHtml, 'utf8');

const frameCSS = `
<style id="phone-frame-css">
  * { box-sizing: border-box; }

  html, body {
    height: 100%;
    background: #020617;
    margin: 0;
    padding: 0;
  }

  body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* Override Expo's default body overflow:hidden so the frame is visible */
  #expo-reset { display: none !important; }

  html, body, #root {
    overflow: visible !important;
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

  /* Volume / power buttons (decorative) */
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
    width: 393px !important;
    height: 852px !important;
    overflow: hidden !important;
    border-radius: 50px;
    display: flex !important;
    flex-direction: column;
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
      width: 100vw !important;
      height: 100vh !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      background: transparent !important;
    }
    .phone-frame::before,
    .phone-side-btn,
    .page-label {
      display: none !important;
    }
    #root {
      width: 100% !important;
      height: 100% !important;
      border-radius: 0 !important;
    }
  }
</style>`;

// Inject CSS into <head>
html = html.replace('</head>', frameCSS + '</head>');

// Wrap <div id="root"> with phone-frame div
html = html.replace(
  '<div id="root">',
  `<div class="phone-frame">
    <div class="phone-side-btn vol-up"></div>
    <div class="phone-side-btn vol-down"></div>
    <div class="phone-side-btn power"></div>
    <div id="root">`
);

// Close the phone-frame div before </body>
html = html.replace(
  '</body>',
  `  </div><!-- /phone-frame -->
  <span class="page-label">QuickCover &nbsp;·&nbsp; Worker App &nbsp;·&nbsp; Demo</span>
</body>`
);

fs.writeFileSync(distHtml, html, 'utf8');
console.log('✅ Phone frame injected into dist/index.html');
