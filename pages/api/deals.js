import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { deal_name, responsable, status } = req.query;

  let query = supabase
    .from('deals')
    .select('*')
    .order('deal_name')
    .order('responsable')
    .order('potencial');

  if (deal_name && deal_name !== 'all') query = query.eq('deal_name', deal_name);
  if (responsable && responsable !== 'all') query = query.eq('responsable', responsable);
  if (status && status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json(data);
}
