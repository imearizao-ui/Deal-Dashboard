import { useState, useEffect } from 'react';
import { ALL_STATUSES, STATUS_CONFIG } from '../lib/classify';
import StatusBadge from './StatusBadge';
import Avatar from './Avatar';

export default function UpdateModal({ deal, responsable, onClose, onSaved }) {
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('');
  const [nextFollowup, setNextFollowup] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!deal) return;
    fetchHistory();
  }, [deal]);

  async function fetchHistory() {
    setLoadingHistory(true);
    const res = await fetch(`/api/history?deal_id=${deal.id}`);
    const data = await res.json();
    setHistory(Array.isArray(data) ? data : []);
    setLoadingHistory(false);
  }

  async function handleSubmit() {
    if (!feedback && !status && !notes) {
      setError('Añade al menos un comentario, un estado o una nota.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/update-deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: deal.id,
          responsable,
          feedback,
          status: status || undefined,
          next_followup: nextFollowup || undefined,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved(data.status);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!deal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#1a2744] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">{deal.deal_name}</span>
                {deal.product_type && (
                  <span className="text-xs text-slate-500">· {deal.product_type}</span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-white">{deal.potencial}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Avatar name={deal.responsable} size="sm" />
                <span className="text-sm text-slate-400">{deal.responsable}</span>
                <StatusBadge status={deal.status} />
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors mt-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Existing feedback */}
          {deal.feedback && (
            <div className="mt-3 p-3 rounded-lg bg-white/5 text-sm text-slate-400 italic">
              "{deal.feedback}"
            </div>
          )}
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Feedback / novedad de esta semana
            </label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={3}
              placeholder="Ej: Tuvimos reunión el martes, están revisando la propuesta..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 resize-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Estado (opcional — se auto-clasifica)
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-[#0f1729] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition"
              >
                <option value="">Auto-clasificar</option>
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Próximo seguimiento
              </label>
              <input
                type="date"
                value={nextFollowup}
                onChange={e => setNextFollowup(e.target.value)}
                className="w-full bg-[#0f1729] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Nota interna (no visible en dashboard principal)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej: Hablar con Alberto antes de responder..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:border-white/20 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar actualización'}
            </button>
          </div>
        </div>

        {/* History */}
        {!loadingHistory && history.length > 0 && (
          <div className="border-t border-white/10 px-6 py-4 bg-white/[0.02]">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3">Historial</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.map(h => (
                <div key={h.id} className="flex items-start gap-2 text-xs">
                  <span className="text-slate-600 font-mono whitespace-nowrap mt-0.5">
                    {new Date(h.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className="text-slate-400">{h.responsable}:</span>
                  <span className="text-slate-300">{h.feedback || h.notes || '—'}</span>
                  {h.status && <StatusBadge status={h.status} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
