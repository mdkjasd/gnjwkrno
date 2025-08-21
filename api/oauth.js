// /pages/api/oauth.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const guildId = '1407523175889108992';
const botToken = process.env.DISCORD_BOT_TOKEN;

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send('Brak kodu Discord');

  try {
    // 1. Pobierz access_token z Discorda
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'https://gnjwkrno.vercel.app/api/oauth' // musi być identyczne jak w Discord Developer Portal
      })
    });

    const tokenData = await tokenRes.json();

    // 🔎 Debug token response
    if (!tokenData.access_token) {
      console.error("❌ Discord token error:", tokenData);
      return res.status(401).json({
        error: "Błąd tokenu Discord",
        details: tokenData
      });
    }

    // 2. Dane użytkownika
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const userData = await userRes.json();
    const { id, username, avatar } = userData;

    if (!id) {
      console.error("❌ Discord user fetch error:", userData);
      return res.status(500).json({
        error: "Błąd danych użytkownika Discord",
        details: userData
      });
    }

    // 3. Pobranie ról użytkownika z serwera
    const memberRes = await fetch(
      `https://discord.com/api/guilds/${guildId}/members/${id}`,
      { headers: { Authorization: `Bot ${botToken}` } }
    );

    if (!memberRes.ok) {
      const errData = await memberRes.json();
      console.error("❌ Discord member fetch error:", errData);
      return res.status(403).json({
        error: "Nie jesteś członkiem serwera Discord",
        details: errData
      });
    }

    const memberData = await memberRes.json();
    const roles = memberData.roles || [];

    // 4. Zapis do Supabase
    const { error } = await supabase
      .from('users')
      .upsert(
        {
          discord_id: id,
          username,
          avatar,
          roles,
          last_login: new Date()
        },
        { onConflict: 'discord_id' }
      );

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({
        error: "Błąd Supabase",
        details: error
      });
    }

    // 5. Przekierowanie
    return res.redirect(`/main.html?discord_id=${id}`);
  } catch (err) {
    console.error('❌ Błąd ogólny:', err);
    return res.status(500).json({ error: "Błąd logowania", details: err.message });
  }
}
