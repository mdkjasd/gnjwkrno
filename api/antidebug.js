// /pages/api/antidebug.js
import crypto from "crypto";

export default async function handler(req, res) {
  const { fp } = req.query;
  const secretBase = "xertisolemoner";
  const scriptToProtect = `
    // 🔒 Anty-debug payload
    let check = setInterval(() => {
      const devtoolsOpen = window.outerWidth - window.innerWidth > 160 || 
                           window.outerHeight - window.innerHeight > 160;
      if (devtoolsOpen) {
        document.body.innerHTML = '';
        alert('Debug wykryty!');
      }
    }, 1000);
  `;

  if (!fp) return res.status(400).json({ error: "Brak fingerprintu" });

  const key = crypto.pbkdf2Sync(secretBase + fp, "anti-debug-salt", 100000, 32, "sha256");
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(JSON.stringify({ script: scriptToProtect }), "utf8", "base64");
  encrypted += cipher.final("base64");

  const hash = crypto.createHash("sha256").update(scriptToProtect).digest("hex");

  res.status(200).json({
    iv: iv.toString("base64"),
    data: encrypted,
    hash,
  });
}
