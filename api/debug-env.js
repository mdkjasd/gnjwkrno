export default function handler(req, res) {
  res.json({
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "❌ brak",
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET ? "✅ ustawione" : "❌ brak",
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN ? "✅ ustawione" : "❌ brak",
    SUPABASE_URL: process.env.SUPABASE_URL ? "✅ ustawione" : "❌ brak",
    SUPABASE_KEY: process.env.SUPABASE_KEY ? "✅ ustawione" : "❌ brak"
  });
}
