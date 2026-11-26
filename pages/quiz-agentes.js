import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

const QUIZ_ID = 'agentes';
const TIME = 20;
const MEDALS = ['🥇', '🥈', '🥉'];

const QUESTIONS = [
  { q: 'Un agente, a diferencia de Copilot Chat…',
    o: ['Lleva instrucciones fijas y conocimiento propio', 'Es más rápido escribiendo', 'Solo funciona en inglés', 'No necesita que nadie lo revise'],
    a: 0, exp: 'Copilot Chat es un generalista al que se lo explicas todo cada vez. Un agente tiene un puesto: instrucciones escritas una vez y sus propios archivos de conocimiento.' },
  { q: 'Las tres piezas de un agente bien hecho son…',
    o: ['Instrucciones, conocimiento y límites', 'Velocidad, emojis y buena suerte', 'Licencia, logo y nombre molón', 'Internet, más internet y paciencia'],
    a: 0, exp: 'Qué debe hacer (instrucciones), con qué datos (conocimiento) y qué hacer cuando no sabe (límites). Si falta una, es un chat con otro nombre.' },
  { q: '¿Dónde se crea un agente SIN licencia de pago?',
    o: ['En Agent Builder: copilot.cloud.microsoft → Agentes → Crear agente', 'En Copilot Studio, que es gratis', 'En Excel, con una macro', 'No se puede sin pagar'],
    a: 0, exp: 'Agent Builder viene incluido: instrucciones + archivos subidos, sin licencia. Así se hicieron los 2 agentes de la tarea.' },
  { q: 'Abres Copilot Studio y te sale una pantalla pidiendo licencia. ¿Qué significa?',
    o: ['Es normal: Studio requiere licencia (o prueba de 60 días)', 'Que tu ordenador está infectado', 'Que lo has roto', 'Que Microsoft te ha bloqueado la cuenta'],
    a: 0, exp: 'Copilot Studio es la herramienta "pro" (agentes conectados a SharePoint y flujos) y va con licencia aparte. El módulo se puede leer igual; practicar, no. La tarea era en Agent Builder.' },
  { q: 'Le preguntas a tu agente por el «Edificio Estrella», que NO está en sus datos. Un buen agente…',
    o: ['Dice que no tiene ese dato en su información', 'Se inventa una cifra razonable', 'Responde con el edificio que más se le parezca', 'Te cuelga la conversación'],
    a: 0, exp: 'La prueba nº 2 de la tarea: ante un dato que no existe en su conocimiento, el agente lo dice. Si inventa, suspende — por convincente que suene.' },
  { q: 'En el asistente de actas, nadie dijo quién se encarga de una acción. El agente debe…',
    o: ['Escribir [PENDIENTE] en el responsable', 'Asignársela al jefe, por si acaso', 'Inventar un nombre que suene bien', 'Borrar esa acción del acta'],
    a: 0, exp: 'Regla de las instrucciones: lo que no se dijo en la reunión no se rellena — se marca [PENDIENTE]. Un acta con datos inventados es peor que un hueco.' },
  { q: 'Las «pruebas de aceptación» de un agente sirven para…',
    o: ['Comprobar que funciona antes de fiarse de él', 'Rellenar papeleo de Microsoft', 'Medir lo rápido que escribe', 'Presumir en la demo'],
    a: 0, exp: 'Un agente no se entrega "cuando responde": se entrega cuando pasa sus pruebas — acierta con sus datos, no inventa y mantiene el formato. Hoy las pasamos en vivo.' },
  { q: 'El enlace del curso de la semana ahora abre «Redactar, analizar y presentar con Microsoft Copilot». ¿Qué ha pasado?',
    o: ['Microsoft renombró y amplió el curso: es el correcto', 'Es un virus, cerrad el navegador', 'Nos hemos equivocado de curso', 'El curso antiguo era mejor y ya no existe'],
    a: 0, exp: 'Microsoft renombra sus cursos cada poco. Es el mismo contenido ampliado a 7 módulos; esta semana bastaba con «Prepárese para trabajar con Copilot» y el de datos con IA.' },
  { q: 'Copilot en Excel, sobre una tabla con nombre, puede…',
    o: ['Analizar, añadir columnas con fórmulas explicadas y crear gráficos', 'Solo cambiar colores de celdas', 'Enviar el archivo a tus contactos', 'Convertir el Excel en PowerPoint y poco más'],
    a: 0, exp: 'Le pides «¿qué inmuebles tienen la ocupación más baja?» o «añade la renta anual por m²» y lo hace — enseñándote la fórmula. Eso haremos hoy sobre la copia del Rent Roll.' },
  { q: 'El archivo que subes como conocimiento a un agente en Agent Builder…',
    o: ['Es una copia: si el original cambia, hay que resubirlo', 'Se actualiza solo cada noche', 'Se borra a los 7 días', 'Lo puede ver toda la empresa automáticamente'],
    a: 0, exp: 'Subir un archivo crea una foto fija de ese momento. Para conocimiento que se actualiza solo (SharePoint) hace falta Copilot Studio — por eso está en la lista de licencias.' },
  { q: '🔥 BONUS · ¿Qué instrucciones hacen mejor a un agente?',
    o: ['Las que dan formato de salida y dicen qué hacer cuando falte un dato', 'Una sola línea: «sé útil y amable»', 'Cuantas más páginas, mejor, aunque se contradigan', 'Ninguna: los agentes aprenden solos'],
    a: 0, bonus: true,
    exp: 'Las instrucciones buenas definen el puesto: qué produce (con el formato exacto), con qué fuentes y qué hace ante un hueco ([PENDIENTE], «no tengo ese dato»). Vago entra, vago sale.' },
  { q: '🔥 BONUS · ¿Por qué un agente de Agent Builder NO puede leer el SharePoint de la empresa?',
    o: ['Sin licencia solo usa la web y los archivos que le subas', 'Porque SharePoint está anticuado', 'Porque los agentes odian las carpetas', 'Sí puede, si se lo pides por favor'],
    a: 0, bonus: true,
    exp: 'Agent Builder gratuito = web + archivos subidos a mano. Conectar SharePoint (sincronizado y respetando permisos) es cosa de Copilot Studio con licencia — la decisión de hoy.' },
  { q: '🔥 BONUS · ¿Qué diferencia hay entre tu «perfil para Copilot» y las instrucciones de un agente?',
    o: ['El perfil te describe a ti y aplica a tus chats; las instrucciones definen el puesto del agente', 'Son lo mismo con distinto nombre', 'El perfil es de pago y las instrucciones gratis', 'Las instrucciones las escribe Microsoft'],
    a: 0, bonus: true,
    exp: 'El perfil (Configuración → Personalización) le cuenta a Copilot quién eres TÚ, y mejora todas tus conversaciones. Las instrucciones del agente definen SU trabajo, igual para cualquiera que lo use. Hoy revisamos los dos.' },
];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dedupeBoard(rows) {
  const best = new Map();
  for (const r of rows) {
    const k = (r.nick || '').trim().toLowerCase();
    const prev = best.get(k);
    if (!prev || r.score > prev.score || (r.score === prev.score && r.ms < prev.ms)) best.set(k, r);
  }
  return Array.from(best.values()).sort((x, y) => y.score - x.score || x.ms - y.ms);
}

export default function QuizAgentes() {
  const [screen, setScreen] = useState('intro');
  const [nick, setNick] = useState('');
  const [order, setOrder] = useState([]);
  const [qi, setQi] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [board, setBoard] = useState([]);
  const [boardNote, setBoardNote] = useState('');
  const [spectator, setSpectator] = useState(false);
  const startRef = useRef(0);
  const timerRef = useRef(null);

  async function fetchBoard() {
    try {
      const r = await fetch(`/api/quiz-scores?quiz=${QUIZ_ID}`);
      const j = await r.json();
      if (j.scores) { setBoard(dedupeBoard(j.scores)); setBoardNote(''); }
    } catch (e) { setBoardNote('No se pudo cargar el marcador.'); }
  }

  useEffect(() => { fetchBoard(); }, []);

  useEffect(() => {
    if (screen !== 'end') return;
    const id = setInterval(fetchBoard, 5000);
    return () => clearInterval(id);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'quiz' || picked !== null) return;
    setTimeLeft(TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); setPicked(-1); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, qi]);

  function start() {
    const n = nick.trim();
    if (!n) return;
    try { localStorage.setItem('quiz_nick', n); } catch (e) {}
    setOrder(QUESTIONS.map((item) => ({
      q: item.q, exp: item.exp, bonus: !!item.bonus,
      opts: shuffle(item.o.map((t, i) => ({ t, correct: i === item.a }))),
    })));
    setQi(0); setScore(0); setHits(0); setPicked(null);
    setSpectator(false);
    startRef.current = Date.now();
    setScreen('quiz');
  }

  useEffect(() => {
    try { const n = localStorage.getItem('quiz_nick'); if (n) setNick(n); } catch (e) {}
  }, []);

  function pick(i) {
    if (picked !== null) return;
    clearInterval(timerRef.current);
    setPicked(i);
    if (order[qi].opts[i].correct) {
      setScore((s) => s + (order[qi].bonus ? 150 + Math.round(timeLeft * 3) : 100 + Math.round(timeLeft * 2)));
      setHits((h) => h + 1);
    }
  }

  async function next() {
    if (qi + 1 < order.length) { setQi(qi + 1); setPicked(null); return; }
    const ms = Date.now() - startRef.current;
    setScreen('end');
    try {
      const r = await fetch('/api/quiz-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz: QUIZ_ID, nick: nick.trim(), score, hits, ms }),
      });
      if (!r.ok) throw new Error('save failed');
      fetchBoard();
    } catch (e) { setBoardNote('⚠️ Tu puntuación NO se pudo guardar — apúntala y dilo en voz alta.'); }
  }

  const cur = order[qi];

  return (
    <div className="wrap">
      <Head><title>Quiz · Agentes de Copilot</title></Head>

      {screen === 'intro' && (
        <div className="card">
          <div className="big">🤖</div>
          <h1>Quiz · Agentes de Copilot</h1>
          <p className="sub">10 preguntas de agentes y el curso de la semana + 3 BONUS 🔥 · {TIME} segundos cada una · rápido da puntos extra y las bonus valen más</p>
          <input value={nick} onChange={(e) => setNick(e.target.value)} maxLength={30}
            placeholder="Tu nombre (o nombre de guerra)" onKeyDown={(e) => e.key === 'Enter' && start()} />
          <button className="go" onClick={start} disabled={!nick.trim()}>¡A jugar!</button>
          <button className="watch" onClick={() => { setSpectator(true); fetchBoard(); setScreen('end'); }}>Solo ver el marcador 👀</button>
          {board.length > 0 && (
            <p className="teaser">Ya han jugado {board.length}: {board.slice(0, 3).map((r, i) => `${MEDALS[i] || ''} ${r.nick} (${r.score})`).join(' · ')}</p>
          )}
        </div>
      )}

      {screen === 'quiz' && cur && (
        <div className="card">
          <div className="top">
            <span>Pregunta {qi + 1} / {order.length}</span>
            <span className={timeLeft <= 5 ? 'timer low' : 'timer'}>⏱ {timeLeft}s</span>
            <span>⭐ {score}</span>
          </div>
          <h2>{cur.q}</h2>
          <div className="opts">
            {cur.opts.map((o, i) => {
              let cls = 'opt';
              if (picked !== null) {
                if (o.correct) cls += ' right';
                else if (picked === i) cls += ' wrong';
                else cls += ' dim';
              }
              return <button key={i} className={cls} onClick={() => pick(i)}>{o.t}</button>;
            })}
          </div>
          {picked !== null && (
            <div className="exp">
              <p><b>{picked >= 0 && cur.opts[picked].correct ? '¡Eso es!' : picked === -1 ? '¡Tiempo!' : 'No era esa…'}</b> {cur.exp}</p>
              <button className="go" onClick={next}>{qi + 1 < order.length ? 'Siguiente →' : 'Ver marcador 🏆'}</button>
            </div>
          )}
        </div>
      )}

      {screen === 'end' && (
        <div className="card">
          <div className="big">🏆</div>
          <h1>{spectator ? 'Marcador en directo' : `${hits} de ${QUESTIONS.length} · ${score} puntos`}</h1>
          <p className="sub">Marcador en directo — se actualiza según va terminando la gente</p>
          <table>
            <thead><tr><th></th><th>Nombre</th><th>Puntos</th><th>Aciertos</th></tr></thead>
            <tbody>
              {board.map((r, i) => (
                <tr key={r.nick + i} className={r.nick.trim().toLowerCase() === nick.trim().toLowerCase() ? 'me' : ''}>
                  <td>{MEDALS[i] || i + 1}</td><td>{r.nick}</td><td>{r.score}</td><td>{r.hits}/{QUESTIONS.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {boardNote && <p className="note">{boardNote}</p>}
          {!spectator && <button className="go" onClick={start}>Jugar otra vez</button>}
        </div>
      )}

      <style jsx global>{`
        html, body { margin: 0; padding: 0; background: #141118; }
      `}</style>
      <style jsx>{`
        .wrap { min-height: 100vh; background: #141118; color: #f4f1ea; display: flex; align-items: center; justify-content: center; padding: 24px 16px; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; }
        .card { width: 100%; max-width: 680px; background: #1e1926; border-radius: 20px; padding: 32px 28px; box-shadow: 0 8px 40px rgba(0,0,0,0.5); }
        h1 { font-size: 28px; margin: 8px 0; }
        h2 { font-size: 24px; line-height: 1.35; margin: 18px 0; }
        .big { font-size: 56px; }
        .sub { color: #b9b3c4; font-size: 16px; }
        .teaser { color: #b9b3c4; font-size: 14px; margin-top: 18px; }
        .note { color: #ffb4a2; font-size: 14px; }
        input { width: 100%; box-sizing: border-box; margin-top: 16px; padding: 14px 16px; border-radius: 12px; border: 1px solid #3a3346; background: #141118; color: #f4f1ea; font-size: 17px; }
        .go { margin-top: 16px; width: 100%; padding: 14px; border: none; border-radius: 12px; background: #ffd23f; color: #141118; font-size: 18px; font-weight: 700; cursor: pointer; }
        .go:disabled { opacity: 0.4; cursor: default; }
        .watch { margin-top: 10px; width: 100%; padding: 12px; border: 1px solid #3a3346; border-radius: 12px; background: transparent; color: #b9b3c4; font-size: 16px; cursor: pointer; }
        .top { display: flex; justify-content: space-between; color: #b9b3c4; font-size: 15px; font-weight: 600; }
        .timer.low { color: #ff6b6b; }
        .opts { display: flex; flex-direction: column; gap: 10px; }
        .opt { text-align: left; padding: 14px 16px; border-radius: 12px; border: 1px solid #3a3346; background: #262031; color: #f4f1ea; font-size: 16px; cursor: pointer; }
        .opt.right { background: #1f4d2e; border-color: #3dbb6a; }
        .opt.wrong { background: #55222a; border-color: #d35858; }
        .opt.dim { opacity: 0.45; }
        .exp { margin-top: 16px; background: #262031; border-radius: 12px; padding: 16px; font-size: 15px; line-height: 1.5; color: #d8d3e0; }
        table { width: 100%; margin-top: 18px; border-collapse: collapse; font-size: 16px; }
        th { text-align: left; color: #b9b3c4; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 6px 8px; }
        td { padding: 10px 8px; border-top: 1px solid #2c2537; }
        tr.me td { background: #2a2140; border-radius: 6px; font-weight: 700; }
      `}</style>
    </div>
  );
}
