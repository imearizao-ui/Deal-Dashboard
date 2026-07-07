import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DealCard from '../components/DealCard';
import UpdateModal from '../components/UpdateModal';
import Avatar, { getResponsableColor } from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import { STATUS_CONFIG, ALL_STATUSES } from '../lib/classify';

const DEALS = ['all', 'Maye', 'IPO', 'Arca', 'Villa Mallorca', 'Eurogaza', 'Team PLV', 'Zappas'];
const RESPONSABLES = ['all', 'Angeles', 'Alberto', 'Andrés'];
const ANDRES_VARIANTS = ['Andrés', 'Andres'];

export default function Dashboard() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDeal, setFilterDeal] = useState('all');
  const [filterResponsable, setFilterResponsable] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeResponsable, setActiveResponsable] = useState(null); // for update mode

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterDeal !== 'all') params.set('deal_name', filterDeal);
    if (filterStatus !== 'all') params.set('status', filterStatus);
    const res = await fetch(`/api/deals?${params}`);
    const data = await res.json();
    setDeals(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filterDeal, filterStatus]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  // Filter by responsable and search client-side
  const filtered = deals.filter(d => {
    if (filterResponsable !== 'all') {
      const r = (d.responsable || '').trim();
      if (filterResponsable === 'Andrés') {
        if (!ANDRES_VARIANTS.includes(r)) return false;
      } else {
        if (r !== filterResponsable) return false;
      }
    }
    if (search) {
      const q = search.toLowerCase();
      if (!(d.potencial || '').toLowerCase().includes(q) &&
          !(d.feedback || '').toLowerCase().includes(q) &&
          !(d.deal_name || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Summary counts
  const counts = {};
  ALL_STATUSES.forEach(s => { counts[s] = 0; });
  filtered.forEach(d => { if (counts[d.status] !== undefined) counts[d.status]++; else counts[d.status] = 1; });

  function handleSaved(dealId, newStatus) {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: newStatus } : d));
    setSelectedDeal(null);
  }

  return (
    <div className="min-h-screen bg-[#0f1729]">
      {/* Top nav */}
      <nav className="border-b border-white/8 bg-[#0f1729]/95 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">Deal Dashboard</span>
            <div className="flex items-center gap-1 ml-4">
              <span className="px-3 py-1.5 rounded-lg text-xs bg-indigo-600/20 text-indigo-300 font-medium">
                Deals
              </span>
              <Link href="/metrics" className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition">
                Métricas
              </Link>
              <Link href="/overview" className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition">
                Visión general
              </Link>
            </div>
          </div>

          {/* Responsable quick-select for updates */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 mr-1">Actualizar como:</span>
            {RESPONSABLES.filter(r => r !== 'all').map(r => {
              const c = getResponsableColor(r);
              const isActive = activeResponsable === r;
              return (
                <button
                  key={r}
                  onClick={() => setActiveResponsable(isActive ? null : r)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isActive
                      ? `${c.bg} ${c.text} ${c.border}`
                      : 'bg-transparent text-slate-500 border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Seguimiento de Deals</h1>
          <p className="text-slate-500 text-sm">
            {filtered.length} contactos
            {filterDeal !== 'all' && ` · ${filterDeal}`}
            {filterResponsable !== 'all' && ` · ${filterResponsable}`}
          </p>
        </div>

        {/* Status summary chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ALL_STATUSES.map(s => {
            const config = STATUS_CONFIG[s];
            if (!counts[s]) return null;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  filterStatus === s
                    ? config.color
                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                {config.label}
                <span className="font-mono">{counts[s]}</span>
              </button>
            );
          })}
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="px-3 py-1.5 rounded-full text-xs text-slate-500 hover:text-white border border-white/10 hover:border-white/20 transition"
            >
              × Limpiar
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar potencial, deal, feedback..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 transition"
            />
          </div>

          {/* Deal filter */}
          <select
            value={filterDeal}
            onChange={e => setFilterDeal(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition"
          >
            {DEALS.map(d => <option key={d} value={d}>{d === 'all' ? 'Todos los deals' : d}</option>)}
          </select>

          {/* Responsable filter */}
          <select
            value={filterResponsable}
            onChange={e => setFilterResponsable(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/60 transition"
          >
            {RESPONSABLES.map(r => <option key={r} value={r}>{r === 'all' ? 'Todos los responsables' : r}</option>)}
          </select>
        </div>

        {/* Active responsable banner */}
        {activeResponsable && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar name={activeResponsable} size="sm" />
              <span className="text-sm text-indigo-300">
                Haciendo clic en un deal lo actualizarás como <strong>{activeResponsable}</strong>
              </span>
            </div>
            <button onClick={() => setActiveResponsable(null)} className="text-slate-500 hover:text-white transition-colors text-xs">
              Cancelar
            </button>
          </div>
        )}

        {/* Deal grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-600">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No hay deals con estos filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
                onUpdate={(d) => setSelectedDeal(d)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Update modal */}
      {selectedDeal && (
        <UpdateModal
          deal={selectedDeal}
          responsable={activeResponsable || selectedDeal.responsable}
          onClose={() => setSelectedDeal(null)}
          onSaved={(newStatus) => handleSaved(selectedDeal.id, newStatus)}
        />
      )}
    </div>
  );
}
