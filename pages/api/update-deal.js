import { supabase } from '../../lib/supabase';
import { classifyStatus } from '../../lib/classify';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { deal_id, responsable, feedback, status: manualStatus, next_followup, notes } = req.body;

  if (!deal_id || !responsable) {
    return res.status(400).json({ error: 'deal_id and responsable are required' });
  }

  // Determine status: use manual override or auto-classify from feedback
  const newStatus = manualStatus || classifyStatus(feedback);

  // Fetch current deal to merge seguimiento dates
  const { data: deal, error: fetchErr } = await supabase
    .from('deals')
    .select('seguimiento_1, seguimiento_2, seguimiento_3, fecha_envio')
    .eq('id', deal_id)
    .single();

  if (fetchErr) return res.status(500).json({ error: fetchErr.message });

  // Advance seguimiento: fill the first empty slot with next_followup date
  const seg = {
    seguimiento_1: deal.seguimiento_1,
    seguimiento_2: deal.seguimiento_2,
    seguimiento_3: deal.seguimiento_3,
  };
  if (next_followup) {
    if (!seg.seguimiento_1) seg.seguimiento_1 = next_followup;
    else if (!seg.seguimiento_2) seg.seguimiento_2 = next_followup;
    else seg.seguimiento_3 = next_followup;
  }

  // Update deal
  const updatePayload = {
    status: newStatus,
    ...seg,
  };
  if (feedback) updatePayload.feedback = feedback;

  const { error: updateErr } = await supabase
    .from('deals')
    .update(updatePayload)
    .eq('id', deal_id);

  if (updateErr) return res.status(500).json({ error: updateErr.message });

  // Log the update
  const { error: logErr } = await supabase.from('deal_updates').insert({
    deal_id,
    responsable,
    feedback: feedback || null,
    status: newStatus,
    next_followup: next_followup || null,
    notes: notes || null,
  });

  if (logErr) console.error('Log error (non-fatal):', logErr.message);

  res.status(200).json({ success: true, status: newStatus });
}
