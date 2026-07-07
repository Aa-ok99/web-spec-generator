function cleanCode(code) {
  return code
    .replace(/^import\s+.*?['"].*?['"];?\s*$/gm, '')
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^export\s+/gm, '')
    .replace(/^(?:window|global|globalThis)\s*\.\s*(?:React|ReactDOM)\s*=.*;?\s*$/gm, '')
    .replace(/^(?:var|let|const)?\s*(?:window|global|globalThis)\s*=.*;?\s*$/gm, '')
    .replace(/^(?:React|ReactDOM)\s*\.\s*(?:render|createRoot|hydrate)\s*\(.*\)\s*;?\s*$/gm, '')
    .replace(/^createRoot\s*\(.*\)\s*;?\s*$/gm, '')
    .trim();
}

function build(code) {
  const cleaned = cleanCode(code);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script>window.process = { env: { NODE_ENV: 'production' } };</script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    #root { min-height: 100vh; }
    #loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; color: #666; font-size: 16px; }
    #error-display { display: none; padding: 20px; background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; margin: 20px; color: #991b1b; font-family: monospace; white-space: pre-wrap; font-size: 14px; }
  </style>
</head>
<body>
  <div id="loading"><div class="spinner" style="width:24px;height:24px;border:3px solid #e5e7eb;border-top-color:#6366f1;border-radius:50%;animation:spin .7s linear infinite;margin-right:12px;"></div><span>Loading preview...</span></div>
  <div id="root" style="display:none;"></div>
  <div id="error-display"></div>
  <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script>
    function showError(e) {
      document.getElementById('loading').style.display = 'none';
      var errDiv = document.getElementById('error-display');
      errDiv.style.display = 'block';
      errDiv.textContent = 'Error: ' + (e.message || e) + (e.stack ? '\\n\\n' + e.stack : '');
    }

    window.addEventListener('error', function(e) {
      showError(e.error || e.message);
      e.preventDefault();
    });

    try {
      var compiled = Babel.transform(\`${escaped(cleaned)}\`, {
        presets: ['react'],
        retainLines: true
      }).code;

      var renderCode = compiled + ';window.renderApp = function() { try { var root = ReactDOM.createRoot(document.getElementById("root")); root.render(React.createElement(App)); } catch(e) { showError(e); } };';

      var scriptEl = document.createElement('script');
      scriptEl.textContent = renderCode;
      document.body.appendChild(scriptEl);

      document.getElementById('loading').style.display = 'none';
      document.getElementById('root').style.display = '';

      if (typeof window.renderApp === 'function') window.renderApp();
    } catch(e) {
      showError(e);
    }
  </script>
</body>
</html>`;
}

function escaped(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${')
    .replace(/<\/script>/g, '<\\/script>');
}

module.exports = { build };
