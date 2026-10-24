module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  const q = String(req.query?.q || '').trim().slice(0, 100);
  if (q.length < 2) return res.status(200).json({ results: [] });
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Busca de jogos não configurada: falta RAWG_API_KEY no ambiente do servidor.' });
  try {
    const endpoint = new URL('https://api.rawg.io/api/games');
    endpoint.searchParams.set('key', apiKey);
    endpoint.searchParams.set('search', q);
    endpoint.searchParams.set('page_size', '7');
    endpoint.searchParams.set('search_precise', 'false');
    const upstream = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    if (!upstream.ok) {
      console.error('RAWG respondeu com status', upstream.status);
      return res.status(502).json({ error: 'O catálogo de jogos está temporariamente indisponível.' });
    }
    const payload = await upstream.json();
    const results = (Array.isArray(payload.results) ? payload.results : []).map(game => ({
      id: Number(game.id) || null,
      name: String(game.name || '').slice(0, 180),
      released: game.released || null,
      background_image: typeof game.background_image === 'string' && game.background_image.startsWith('https://') ? game.background_image : null,
      genres: (Array.isArray(game.genres) ? game.genres : []).map(g => String(g.name || '')).filter(Boolean).slice(0, 4),
      platforms: (Array.isArray(game.platforms) ? game.platforms : []).map(p => String(p.platform?.name || '')).filter(Boolean).slice(0, 8)
    }));
    return res.status(200).json({ results });
  } catch (error) {
    console.error('Falha ao consultar RAWG:', error);
    return res.status(502).json({ error: 'Não foi possível consultar o catálogo agora.' });
  }
}
