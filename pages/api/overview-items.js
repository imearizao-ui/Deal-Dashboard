import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('overview_items')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { section_path, company, goal, status, next_steps, owner, due_date } = req.body;
    if (!section_path || !company) {
      return res.status(400).json({ error: 'section_path y company son obligatorios' });
    }
    const { data, error } = await supabase
      .from('overview_items')
      .insert({
        section_path,
        company,
        goal: goal || null,
        status: status || 'Pendiente',
        next_steps: next_steps || null,
        owner: owner || null,
        due_date: due_date || null,
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const { id, company, goal, status, next_steps, owner, due_date } = req.body;
    if (!id) return res.status(400).json({ error: 'id es obligatorio' });
    const { data, error } = await supabase
      .from('overview_items')
      .update({
        company,
        goal: goal || null,
        status: status || 'Pendiente',
        next_steps: next_steps || null,
        owner: owner || null,
        due_date: due_date || null,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id es obligatorio' });
    const { error } = await supabase.from('overview_items').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
