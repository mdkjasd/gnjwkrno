// /pages/api/antidebug.js
export default function handler(req, res) {
  const scriptToProtect = `
    // 🔒 Anty-debug payload
    setInterval(() => {
      if (window.console || window.devtools || window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.warn('⚠️ Debug wykryty (cicho zablokowane)');
      }
    }, 1000);
  `;

  res.status(200).json({
    script: scriptToProtect
  });
}
