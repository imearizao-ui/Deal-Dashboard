import StatusBadge from './StatusBadge';
import Avatar from './Avatar';

export default function DealCard({ deal, onUpdate }) {
  const hasFollowupDates = deal.seguimiento_1 || deal.seguimiento_2 || deal.seguimiento_3;

  function formatDate(d) {
    if (!d || d === 'None' || d === 'nan') return null;
    try {
      return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' });
    } catch {
      return d;
    }
  }

  const lastContact = deal.seguimiento_3 || deal.seguimiento_2 || deal.seguimiento_1 || deal.fecha_envio;
  const lastContactStr = formatDate(lastContact);

  // Days since last contact
  let daysSince = null;
  if (lastContact && !lastContact.includes('Enviado') && !lastContact.includes('Pendiente')) {
    try {
      const diff = (Date.now() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24);
      if (!isNaN(diff) && diff > 0) daysSince = Math.floor(diff);
    } catch {}
  }

  const isStale = daysSince !== null && daysSince > 30 && !['Descartado', 'En proceso'].includes(deal.status);

  return (
    <div
      className={`group relative bg-[#1a2744]/80 border rounded-xl p-4 transition-all duration-200 hover:bg-[#1a2744] hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 cursor-pointer ${
        isStale ? 'border-amber-500/20' : 'border-white/8'
      }`}
      onClick={() => onUpdate(deal)}
    >
      {/* Stale indicator */}
      {isStale && (
        <div className="absolute top-3 right-3">
          <span className="text-amber-400" title={`Sin contacto hace ${daysSince} días`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      )}

      {/* Deal name badge */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-xs font-mono text-indigo-400/80 uppercase tracking-widest">{deal.deal_name}</span>
        {deal.product_type && (
          <span className="text-xs text-slate-600 truncate">· {deal.product_type}</span>
        )}
      </div>

      {/* Potencial name */}
      <h3 className="font-semibold text-white text-sm leading-snug mb-3 pr-6 group-hover:text-indigo-100 transition-colors">
        {deal.potencial}
      </h3>

      {/* Status + Responsable */}
      <div className="flex items-center justify-between mb-3">
        <StatusBadge status={deal.status} />
        <div className="flex items-center gap-1.5">
          <Avatar name={deal.responsable} size="sm" />
          <span className="text-xs text-slate-500">{deal.responsable}</span>
        </div>
      </div>

      {/* Feedback snippet */}
      {deal.feedback && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3 italic">
          "{deal.feedback}"
        </p>
      )}

      {/* Dates */}
      <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
        <div className="text-xs text-slate-600">
          {deal.fecha_envio ? (
            <span>Enviado: <span className="text-slate-500">{formatDate(deal.fecha_envio)}</span></span>
          ) : (
            <span className="text-slate-700">Sin fecha de envío</span>
          )}
        </div>
        {lastContactStr && (
          <div className="text-xs text-slate-600">
            Último: <span className={`${isStale ? 'text-amber-500' : 'text-slate-500'}`}>{lastContactStr}</span>
          </div>
        )}
      </div>

      {/* Update CTA on hover */}
      <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-950/40 backdrop-blur-[1px]">
        <span className="bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg">
          Actualizar
        </span>
      </div>
    </div>
  );
}
