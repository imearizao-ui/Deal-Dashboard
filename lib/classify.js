/**
 * Auto-classifies Spanish feedback text into deal statuses.
 * Used both on seed import and when team members submit updates.
 */

const STATUS = {
  EN_PROCESO: 'En proceso',
  PENDIENTE: 'Pendiente',
  DESCARTADO: 'Descartado',
  CON_FEEDBACK: 'Con feedback',
  SIN_RESPUESTA: 'Sin respuesta',
  SIN_CONTACTO: 'Sin contacto',
};

const REJECTION_KEYWORDS = [
  'no interesad', 'no encaja', 'no avanzan', 'descartar', 'descartado',
  'no vamos a avanzar', 'no entran', 'no hacen', 'no les encaja',
  'no termina de cuadrar', 'no es un tipo', 'no hay un buen encaje',
  'decidido no avanzar', 'cerrado por no contestar', 'no podemos continuar',
  'no es una inversión para nosotros', 'no tenemos previsto',
  'no tenemos capacidad', 'no encaja en este momento', 'no nos encaja',
  'no es para nosotros', 'no es un producto', 'no vamos a continuar',
  'no contestan', 'no nos interesa', 'no es algo que', 'preferimos no avanzar',
  'desafortunadamente, no', 'hemos decidido no', 'no termina de cuadrarnos',
  'la sucursal no quiere', 'no hacen hipoteca',
];

const ACTIVE_KEYWORDS = [
  'nda firmado', 'reunión presencial', 'cierro call', 'enviado modelo financiero',
  'preparando presentación', 'pre-comité', 'nos interesan dos activos',
  'firmado y enviada información', 'enviado nda', 'firmado', 'en riesgos',
  'ha pasado el pre-comité', 'call ', 'reunión el', 'queda con',
];

const WAITING_KEYWORDS = [
  'a la espera', 'pendiente', 'primer contacto', 'seguimiento hecho',
  'en riesgos y a', 'a la espera de feedback', 'pendiente de recibir',
];

export function classifyStatus(feedback, fechaEnvio = null) {
  if (!feedback || !feedback.trim()) {
    return fechaEnvio ? STATUS.SIN_RESPUESTA : STATUS.SIN_CONTACTO;
  }

  const fb = feedback.toLowerCase();

  for (const kw of REJECTION_KEYWORDS) {
    if (fb.includes(kw)) return STATUS.DESCARTADO;
  }
  for (const kw of ACTIVE_KEYWORDS) {
    if (fb.includes(kw)) return STATUS.EN_PROCESO;
  }
  for (const kw of WAITING_KEYWORDS) {
    if (fb.includes(kw)) return STATUS.PENDIENTE;
  }

  return STATUS.CON_FEEDBACK;
}

export const STATUS_CONFIG = {
  [STATUS.EN_PROCESO]: {
    label: 'En proceso',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    sort: 1,
  },
  [STATUS.PENDIENTE]: {
    label: 'Pendiente',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
    sort: 2,
  },
  [STATUS.CON_FEEDBACK]: {
    label: 'Con feedback',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400',
    sort: 3,
  },
  [STATUS.SIN_RESPUESTA]: {
    label: 'Sin respuesta',
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    dot: 'bg-slate-400',
    sort: 4,
  },
  [STATUS.SIN_CONTACTO]: {
    label: 'Sin contacto',
    color: 'bg-slate-600/20 text-slate-500 border-slate-600/30',
    dot: 'bg-slate-500',
    sort: 5,
  },
  [STATUS.DESCARTADO]: {
    label: 'Descartado',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
    sort: 6,
  },
};

export const ALL_STATUSES = Object.keys(STATUS_CONFIG);
export { STATUS };
