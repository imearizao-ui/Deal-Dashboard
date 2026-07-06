import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { deal_id } = req.query;
  if (!deal_id) return res.status(400).json({ error: 'deal_id required' });

  const { data, error } = await supabase
    .from('deal_updates')
    .select('*')
    .eq('deal_id', deal_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json(data);
}
