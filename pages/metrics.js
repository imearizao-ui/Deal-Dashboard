import { useState, useEffect } from 'react';
import Link from 'next/link';
import { STATUS_CONFIG, ALL_STATUSES } from '../lib/classify';
import { getResponsableColor } from '../components/Avatar';

const DEAL_ORDER = ['Maye', 'IPO', 'Arca', 'Villa Mallorca', 'Eurogaza', 'Team PLV', 'Zappas'];

export default function Metrics() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/deals')
      .then(r => r.json())
      .then(data => {
        setDeals(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1729] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ---- Aggregations (all computed live from current data) ----
  const total = deals.length;
  const norm = r => (r || '').trim() === 'Andres' ? 'Andrés' : (r || '').trim();

  // Per status
  const byStatus = {};
  ALL_STATUSES.forEach(s => { byStatus[s] = 0; });
  deals.forEach(d => { byStatus[d.status] = (byStatus[d.status] || 0) + 1; });

  // Contacted = has fecha_envio or any seguimiento
  const contacted = deals.filter(d => d.fecha_envio || d.seguimiento_1).length;
  // Responded = has feedback
  const responded = deals.filter(d => d.feedback && d.feedback.trim()).length;
  const responseRate = contacted > 0 ? Math.round((responded / contacted) * 100) : 0;
  const active = byStatus['En proceso'] || 0;
  const descartados = byStatus['Descartado'] || 0;

  // Cross-tab: deal × status (mirrors the Excel Histórico matrix, aggregated)
  const dealNames = DEAL_ORDER.filter(n => deals.some(d => d.deal_name === n));
  const crossTab = dealNames.map(name => {
    const rows = deals.filter(d => d.deal_name === name);
    const statusCounts = {};
    ALL_STATUSES.forEach(s => { statusCounts[s] = rows.filter(d => d.status === s).length; });
    return {
      name,
      total: rows.length,
      contacted: rows.filter(d => d.fecha_envio || d.seguimiento_1).length,
      responded: rows.filter(d => d.feedback && d.feedback.trim()).length,
      statusCounts,
    };
  });

  // Per responsable
  const responsables = [...new Set(deals.map(d => norm(d.responsable)).filter(Boolean))].sort();
  const byResponsable = responsables.map(r => {
    const rows = deals.filter(d => norm(d.responsable) === r);
    return {
      name: r,
      total: rows.length,
      enProceso: rows.filter(d => d.status === 'En proceso').length,
      pendiente: rows.filter(d => d.status === 'Pendiente').length,
      sinRespuesta: rows.filter(d => d.status === 'Sin respuesta').length,
      descartado: rows.filter(d => d.status === 'Descartado').length,
    };
  });

  const maxDealTotal = Math.max(...crossTab.map(c => c.total), 1);

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
          </div>
          <div className="flex items-center gap-1">
            <Link href="/" className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition">
              Deals
            </Link>
            <span className="px-3 py-1.5 rounded-lg text-xs bg-indigo-600/20 text-indigo-300 font-medium">
              Métricas
            </span>
            <Link href="/overview" className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition">
              Visión general
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Métricas</h1>
          <p className="text-slate-500 text-sm">Calculadas en tiempo real sobre los datos actuales — se actualizan con cada cambio del equipo</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Total contactos', value: total, sub: 'en todos los deals' },
            { label: 'Contactados', value: contacted, sub: `${total > 0 ? Math.round((contacted / total) * 100) : 0}% del total` },
            { label: 'Con respuesta', value: responded, sub: `${responseRate}% tasa de respuesta` },
            { label: 'En proceso', value: active, sub: 'activos ahora', accent: 'text-emerald-400' },
            { label: 'Descartados', value: descartados, sub: `${total > 0 ? Math.round((descartados / total) * 100) : 0}% del total`, accent: 'text-red-400' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-[#1a2744]/80 border border-white/8 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.accent || 'text-white'}`}>{kpi.value}</p>
              <p className="text-xs text-slate-600 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Status distribution bar */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-white mb-3">Distribución por estado</h2>
          <div className="flex h-4 rounded-full overflow-hidden border border-white/10">
            {ALL_STATUSES.map(s => {
              const count = byStatus[s] || 0;
              if (!count) return null;
              const pct = (count / total) * 100;
              const dotColor = STATUS_CONFIG[s].dot;
              return (
                <div
                  key={s}
                  className={`${dotColor} opacity-80 hover:opacity-100 transition-opacity`}
                  style={{ width: `${pct}%` }}
                  title={`${STATUS_CONFIG[s].label}: ${count} (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            {ALL_STATUSES.map(s => {
              const count = byStatus[s] || 0;
              if (!count) return null;
              return (
                <div key={s} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                  {STATUS_CONFIG[s].label} <span className="font-mono text-slate-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-deal table (mirrors the Excel summary) */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-white mb-3">Resumen por deal</h2>
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">Deal</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 text-right">Total</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 text-right">Contactados</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 text-right">Respuestas</th>
                  {ALL_STATUSES.map(s => (
                    <th key={s} className="px-3 py-3 text-xs font-medium text-slate-400 text-right whitespace-nowrap">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${STATUS_CONFIG[s].dot}`} />
                      {STATUS_CONFIG[s].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crossTab.map((row, i) => (
                  <tr key={row.name} className={`border-t border-white/5 hover:bg-white/[0.03] transition ${i % 2 ? 'bg-white/[0.01]' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-indigo-400 uppercase tracking-wider">{row.name}</span>
                        <div className="hidden md:block flex-1 max-w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500/60 rounded-full" style={{ width: `${(row.total / maxDealTotal) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-white">{row.total}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{row.contacted}</td>
                    <td className="px-4 py-3 text-right text-slate-300">
                      {row.responded}
                      <span className="text-slate-600 text-xs ml-1">
                        ({row.contacted > 0 ? Math.round((row.responded / row.contacted) * 100) : 0}%)
                      </span>
                    </td>
                    {ALL_STATUSES.map(s => (
                      <td key={s} className={`px-3 py-3 text-right ${row.statusCounts[s] ? 'text-slate-300' : 'text-slate-700'}`}>
                        {row.statusCounts[s] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Per-responsable workload */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-white mb-3">Carga por responsable</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {byResponsable.map(r => {
              const c = getResponsableColor(r.name);
              const activos = r.total - r.descartado;
              return (
                <div key={r.name} className="bg-[#1a2744]/80 border border-white/8 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border font-semibold text-sm ${c.bg} ${c.text} ${c.border}`}>
                        {r.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="font-medium text-white text-sm">{r.name}</span>
                    </div>
                    <span className="text-lg font-bold text-white">{r.total}</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>En proceso</span><span className="text-emerald-400 font-mono">{r.enProceso}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Pendiente</span><span className="text-amber-400 font-mono">{r.pendiente}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Sin respuesta</span><span className="text-slate-300 font-mono">{r.sinRespuesta}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Descartados</span><span className="text-red-400 font-mono">{r.descartado}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-white/5 text-slate-300 font-medium">
                      <span>Activos</span><span className="font-mono">{activos}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
