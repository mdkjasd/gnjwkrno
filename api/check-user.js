// /pages/api/check-role.js
import { createClient } from '@supabase/supabase-js';

// łączymy się z Supabase używając ENV z Vercela
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ID roli klienta (ustaw w Environment Variables na Vercelu)
const CLIENT_ROLE_ID = process.env.DISCORD_CLIENT_ROLE_ID;

export default async function handler(req, res) {
  const discord_id = req.query.discord_id;

  if (!discord_id) {
    return res.status(400).json({ error: 'Brak discord_id' });
  }

  // pobierz role użytkownika z Supabase
  const { data, error } = await supabase
    .from('users')
    .select('roles')
    .eq('discord_id', discord_id)
    .single();

  if (error || !data) {
    return res.status(403).json({ error: 'Nie znaleziono użytkownika' });
  }

  const hasClientRole = data.roles?.includes(CLIENT_ROLE_ID);

  if (!hasClientRole) {
    return res.status(403).json({ error: 'Brak roli klienta – dostęp zabroniony' });
  }

  return res.status(200).json({ roles: data.roles });
}
