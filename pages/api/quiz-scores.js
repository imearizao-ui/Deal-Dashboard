import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const quiz = String(req.query.quiz || 'fundamentos').slice(0, 50);
    const { data, error } = await supabase
      .from('quiz_scores')
      .select('nick, score, hits, ms, created_at')
      .eq('quiz', quiz)
      .order('score', { ascending: false })
      .order('ms', { ascending: true })
      .limit(200);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ scores: data });
  }

  if (req.method === 'POST') {
    const { quiz, nick, score, hits, ms } = req.body || {};
    const row = {
      quiz: String(quiz || 'fundamentos').slice(0, 50),
      nick: String(nick || 'Anónimo').slice(0, 30).trim() || 'Anónimo',
      score: Math.max(0, Math.min(10000, parseInt(score, 10) || 0)),
      hits: Math.max(0, Math.min(50, parseInt(hits, 10) || 0)),
      ms: Math.max(0, Math.min(3600000, parseInt(ms, 10) || 0)),
    };
    const { error } = await supabase.from('quiz_scores').insert(row);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
