const COLORS = {
  Angeles: { bg: 'bg-violet-500/30', text: 'text-violet-300', border: 'border-violet-500/40' },
  Alberto: { bg: 'bg-sky-500/30', text: 'text-sky-300', border: 'border-sky-500/40' },
  Andrés: { bg: 'bg-rose-500/30', text: 'text-rose-300', border: 'border-rose-500/40' },
  Andres: { bg: 'bg-rose-500/30', text: 'text-rose-300', border: 'border-rose-500/40' },
};

const DEFAULT = { bg: 'bg-slate-500/30', text: 'text-slate-300', border: 'border-slate-500/40' };

export function getResponsableColor(name) {
  return COLORS[name] || DEFAULT;
}

export default function Avatar({ name, size = 'md' }) {
  const c = getResponsableColor(name);
  const initials = name ? name.slice(0, 2).toUpperCase() : '??';
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : size === 'lg' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border font-semibold ${sizeClass} ${c.bg} ${c.text} ${c.border}`}
      title={name}
    >
      {initials}
    </span>
  );
}
