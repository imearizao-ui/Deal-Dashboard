import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getResponsableColor } from '../components/Avatar';

// ---- Structure (confirmed with Elizabeth) ----
const STRUCTURE = [
  {
    key: 'iod',
    label: 'IOD',
    leaves: [
      { path: 'iod/facturacion', label: 'Facturación' },
      { path: 'iod/operaciones-vivas', label: 'Operaciones vivas' },
      { path: 'iod/potenciales-operaciones', label: 'Potenciales operaciones' },
      { path: 'iod/captacion-cliente', label: 'Captación cliente' },
      { path: 'iod/captacion-inversores', label: 'Captación inversores' },
    ],
  },
  {
    key: 'asset',
    label: 'Asset Management',
    groups: [
      {
        key: 'arka',
        label: 'Arka — Captación',
        leaves: [
          { path: 'asset/arka/viviendas-pipeline', label: 'Viviendas en pipeline' },
          { path: 'asset/arka/analisis-compra', label: 'Análisis y compra' },
        ],
      },
      {
        key: 'agro',
        label: 'AGRO (tierras)',
        leaves: [
          { path: 'asset/agro/proyectos-analisis', label: 'Proyectos — análisis' },
          { path: 'asset/agro/ejecucion/cliente', label: 'Ejecución · Cliente' },
          { path: 'asset/agro/ejecucion/comprador', label: 'Ejecución · Comprador' },
          { path: 'asset/agro/ejecucion/financiacion', label: 'Ejecución · Financiación' },
        ],
      },
    ],
  },
  {
    key: 'ma',
    label: 'M&A — Análisis',
    leaves: [{ path: 'ma/analisis', label: 'Análisis' }],
  },
  {
    key: 'fincorp',
    label: 'Finanzas Corporativas',
    leaves: [{ path: 'fincorp/general', label: 'General' }],
  },
  {
    key: 'cfo',
    label: 'Interim CFO — Dirección Financiera',
    leaves: [{ path: 'cfo/general', label: 'General' }],
  },
];

const ITEM_STATUSES = {
  'Pendiente': { color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  'En curso': { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  'Completado': { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', dot: 'bg-blue-400' },
  'Bloqueado': { color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400' },
};

const OWNERS = ['Angeles', 'Alberto', 'Andrés'];

function fmtDate(d) {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' });
  } catch { return d; }
}

function isOverdue(d, status) {
  if (!d || status === 'Completado') return false;
  return new Date(d) < new Date(new Date().toDateString());
}

// ---- Item edit modal ----
function ItemModal({ item, sectionPath, sectionLabel, onClose, onSaved, onDeleted }) {
  const isNew = !item?.id;
  const [form, setForm] = useState({
    company: item?.company || '',
    goal: item?.goal || '',
    status: item?.status || 'Pendiente',
    next_steps: item?.next_steps || '',
    owner: item?.owner || '',
    due_date: item?.due_date || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function save() {
    if (!form.company.trim()) { setError('La compañía es obligatoria.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/overview-items', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? { ...form, section_path: sectionPath } : { ...form, id: item.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved(data);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function remove() {
    if (!confirm('¿Eliminar este elemento?')) return;
    setSaving(true);
    const res = await fetch('/api/overview-items', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    });
    if (res.ok) onDeleted(item.id);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#1a2744] border border-white/10 rounded-2xl shadow-2xl">
        <div className="px-6 pt-5 pb-4 border-b border-white/10 flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-0.5">{sectionLabel}</p>
            <h2 className="text-lg font-semibold text-white">{isNew ? 'Nuevo elemento' : form.company}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition mt-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Compañía</label>
            <input type="text" value={form.company} onChange={e => set('company', e.target.value)}
              placeholder="Nombre de la compañía o activo"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Objetivo</label>
            <input type="text" value={form.goal} onChange={e => set('goal', e.target.value)}
              placeholder="Ej: Cerrar mandato, firmar LOI, completar due diligence..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Estado</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full bg-[#0f1729] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition">
                {Object.keys(ITEM_STATUSES).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Responsable</label>
              <select value={form.owner} onChange={e => set('owner', e.target.value)}
                className="w-full bg-[#0f1729] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition">
                <option value="">Sin asignar</option>
                {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Próximos pasos</label>
            <textarea value={form.next_steps} onChange={e => set('next_steps', e.target.value)} rows={2}
              placeholder="Qué hay que hacer a continuación..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 resize-none transition" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Fecha objetivo</label>
            <input type="date" value={form.due_date || ''} onChange={e => set('due_date', e.target.value)}
              className="w-full bg-[#0f1729] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition" />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            {!isNew && (
              <button onClick={remove} disabled={saving}
                className="px-4 py-2.5 rounded-lg border border-red-500/30 text-sm text-red-400 hover:bg-red-500/10 transition disabled:opacity-50">
                Eliminar
              </button>
            )}
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-slate-400 hover:text-white hover:border-white/20 transition">
              Cancelar
            </button>
            <button onClick={save} disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Leaf section: item list ----
function LeafSection({ leaf, items, onEdit, onAdd }) {
  const leafItems = items.filter(i => i.section_path === leaf.path);

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden bg-[#1a2744]/60">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03]">
        <span className="text-sm font-medium text-slate-200">{leaf.label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 font-mono">{leafItems.length}</span>
          <button onClick={() => onAdd(leaf)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition font-medium">
            + Añadir
          </button>
        </div>
      </div>

      {leafItems.length === 0 ? (
        <p className="px-4 py-3 text-xs text-slate-600 italic">Sin elementos todavía</p>
      ) : (
        <div className="divide-y divide-white/5">
          {leafItems.map(item => {
            const st = ITEM_STATUSES[item.status] || ITEM_STATUSES['Pendiente'];
            const overdue = isOverdue(item.due_date, item.status);
            const oc = item.owner ? getResponsableColor(item.owner) : null;
            return (
              <div key={item.id} onClick={() => onEdit(item, leaf)}
                className="px-4 py-3 hover:bg-white/[0.03] cursor-pointer transition group">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-sm font-medium text-white group-hover:text-indigo-100 transition">{item.company}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${st.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {item.status}
                    </span>
                    {item.owner && (
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-semibold ${oc.bg} ${oc.text} ${oc.border}`}
                        title={item.owner}>
                        {item.owner.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                {item.goal && <p className="text-xs text-slate-400 mb-1">🎯 {item.goal}</p>}
                {item.next_steps && <p className="text-xs text-slate-500 mb-1">→ {item.next_steps}</p>}
                {item.due_date && (
                  <p className={`text-xs font-mono ${overdue ? 'text-red-400' : 'text-slate-600'}`}>
                    {overdue ? '⚠ Vencido: ' : 'Objetivo: '}{fmtDate(item.due_date)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Main page ----
export default function Overview() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { item, leaf }
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    fetch('/api/overview-items')
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const toggle = key => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  function handleSaved(saved) {
    setItems(prev => {
      const exists = prev.some(i => i.id === saved.id);
      return exists ? prev.map(i => (i.id === saved.id ? saved : i)) : [...prev, saved];
    });
    setModal(null);
  }

  function handleDeleted(id) {
    setItems(prev => prev.filter(i => i.id !== id));
    setModal(null);
  }

  function sectionCount(section) {
    const paths = [];
    (section.leaves || []).forEach(l => paths.push(l.path));
    (section.groups || []).forEach(g => g.leaves.forEach(l => paths.push(l.path)));
    return items.filter(i => paths.includes(i.section_path)).length;
  }

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <nav className="border-b border-white/8 bg-[#0f1729]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">Deal Dashboard</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition">Deals</Link>
            <Link href="/metrics" className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition">Métricas</Link>
            <span className="px-3 py-1.5 rounded-lg text-xs bg-indigo-600/20 text-indigo-300 font-medium">Visión general</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Visión general</h1>
          <p className="text-slate-500 text-sm">Compañía · objetivo · estado · próximos pasos · responsable · fecha objetivo</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {STRUCTURE.map(section => (
              <div key={section.key}>
                <button onClick={() => toggle(section.key)}
                  className="w-full flex items-center justify-between mb-3 group">
                  <div className="flex items-center gap-2.5">
                    <svg className={`w-4 h-4 text-slate-500 transition-transform ${collapsed[section.key] ? '-rotate-90' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <h2 className="text-base font-semibold text-white group-hover:text-indigo-200 transition">{section.label}</h2>
                  </div>
                  <span className="text-xs text-slate-600 font-mono">{sectionCount(section)} elementos</span>
                </button>

                {!collapsed[section.key] && (
                  <div className="pl-6 space-y-3">
                    {(section.leaves || []).map(leaf => (
                      <LeafSection key={leaf.path} leaf={leaf} items={items}
                        onEdit={(item, l) => setModal({ item, leaf: l })}
                        onAdd={l => setModal({ item: null, leaf: l })} />
                    ))}
                    {(section.groups || []).map(group => (
                      <div key={group.key}>
                        <h3 className="text-sm font-medium text-indigo-300/80 mb-2 mt-4">{group.label}</h3>
                        <div className="space-y-3">
                          {group.leaves.map(leaf => (
                            <LeafSection key={leaf.path} leaf={leaf} items={items}
                              onEdit={(item, l) => setModal({ item, leaf: l })}
                              onAdd={l => setModal({ item: null, leaf: l })} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <ItemModal
          item={modal.item}
          sectionPath={modal.leaf.path}
          sectionLabel={modal.leaf.label}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
