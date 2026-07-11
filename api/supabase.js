module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { tabla } = req.query;
  if (!tabla) return res.status(400).json({ error: 'Falta parámetro tabla' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Credenciales no configuradas en Vercel' });
  }

  try {
    if (req.method === 'GET') {
      const rows = [];
      const pageSize = 1000;
      let from = 0;
      const maxPages = 30;

      for (let page = 0; page < maxPages; page++) {
        const to = from + pageSize - 1;
        const url = `${supabaseUrl}/rest/v1/${tabla}?select=*`;
        const response = await fetch(url, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Range: `${from}-${to}`,
            Prefer: 'count=exact'
          }
        });
        if (!response.ok) {
          const txt = await response.text();
          return res.status(response.status).json({ error: `Error ${response.status} en ${tabla}: ${txt}` });
        }
        const data = await response.json();
        if (!data || data.length === 0) break;
        if (page > 0 && data.length === pageSize) {
          const lastBatch = rows.slice(-pageSize);
          const same = lastBatch.length > 0 && JSON.stringify(lastBatch) === JSON.stringify(data);
          if (same) break;
        }
        rows.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const response = await fetch(`${supabaseUrl}/rest/v1/${tabla}`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(req.body)
      });
      if (!response.ok) {
        const txt = await response.text();
        return res.status(response.status).json({ error: `Error ${response.status}: ${txt}` });
      }
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
