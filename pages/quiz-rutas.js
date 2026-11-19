import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

const QUIZ_ID = 'rutas-copilot';
const TIME = 20;
const MEDALS = ['🥇', '🥈', '🥉'];

const QUESTIONS = [
  { q: 'Los 4 elementos de un buen prompt son…',
    o: ['Objetivo, contexto, fuente y expectativas', 'Saludo, pregunta, gracias y emoji', 'Mayúsculas, urgencia y mucha fe', 'Copiar, pegar, rezar y repetir'],
    a: 0, exp: 'Qué quieres, para qué, de dónde salen los datos y en qué formato. Nuestras 4 piezas de la chuleta.' },
  { q: '¿Dónde NO debes pegar datos de un inversor?',
    o: ['En Copilot con el escudo de «protegido»', 'En una cuenta gratuita personal de ChatGPT', 'En un Excel del OneDrive corporativo', 'En un correo interno del equipo'],
    a: 1, exp: 'Datos de clientes e inversores, solo en el entorno corporativo. Las cuentas personales gratuitas quedan fuera, siempre.' },
  { q: 'Copilot te da una cifra de un deal con total seguridad. ¿Qué haces?',
    o: ['Usarla, sonaba muy convincente', 'Verificarla contra la fuente antes de usarla', 'Preguntarle «¿seguro?» y si dice que sí, adelante', 'Redondearla por si acaso'],
    a: 1, exp: 'El aplomo no es información. Toda cifra generada se verifica contra la fuente — regla de la casa.' },
  { q: '«Grounding» (anclar la respuesta) significa que Copilot…',
    o: ['Responde más despacio pero más bonito', 'Basa la respuesta en tus datos y fuentes reales', 'Solo funciona con conexión a tierra', 'Guarda tus datos para entrenar modelos'],
    a: 1, exp: 'Una respuesta anclada en tus documentos, correos y datos es relevante y comprobable. Sin grounding, es texto genérico.' },
  { q: '¿Qué hace Copilot en Word?',
    o: ['Solo corrige faltas de ortografía', 'Borradores desde notas, resumir y reescribir', 'Imprimir más rápido', 'Cambiar la fuente a Comic Sans'],
    a: 1, exp: 'Borrador de un acta o propuesta a partir de notas, resumir documentos largos y reescribir con otro tono.' },
  { q: 'Para que Copilot resuma una reunión de Teams hace falta…',
    o: ['Que la reunión dure menos de 10 minutos', 'Activar la transcripción (o grabación)', 'Que todos tengan la cámara encendida', 'Pedirlo antes de empezar la reunión'],
    a: 1, exp: 'Sin transcripción no hay texto del que resumir. Actívala al empezar y tendrás resumen y acciones por persona.' },
  { q: 'Con licencia de M365 Copilot, ¿qué datos puede usar en sus respuestas?',
    o: ['Todos los archivos de la empresa, sin excepción', 'Solo lo que tú ya puedes ver: tus correos, reuniones y archivos', 'Lo que haya en internet, sin más', 'Los archivos de tus compañeros aunque no tengas acceso'],
    a: 1, exp: 'Copilot respeta los permisos: responde con los correos, reuniones y archivos a los que TÚ ya tienes acceso. Ni más ni menos.' },
  { q: 'Copilot en Excel funciona mejor cuando…',
    o: ['Los datos están en una tabla con nombre', 'El archivo pesa mucho', 'Hay muchas celdas combinadas y colores', 'Los números están escritos como texto'],
    a: 0, exp: 'Selecciona el rango → Insertar → Tabla, y ponle nombre. Sin tabla, Copilot «no ve» bien las filas. La regla de oro de los datos.' },
  { q: '¿Qué puede hacer Copilot en Outlook?',
    o: ['Enviar correos sin que los veas', 'Resumir hilos largos y redactar respuestas', 'Borrar el spam de toda la empresa', 'Responder solo en inglés'],
    a: 1, exp: 'Resume hilos de correo buscando qué te piden a ti, redacta respuestas y te da «coaching» de tono y claridad.' },
  { q: 'El resultado que genera Copilot…',
    o: ['Sale directo al cliente, para eso está', 'Lo revisa y lo firma una persona', 'Es responsabilidad de Microsoft', 'No lo lee nadie, con la IA basta'],
    a: 1, exp: 'La IA redacta; tú revisas y tú firmas. El becario brillante, siempre.' },
  { q: '🔥 BONUS · En Copilot Studio, ¿qué ventaja tiene conectar SharePoint como conocimiento frente a subir el archivo a mano?',
    o: ['Se sincroniza solo y respeta los permisos de cada usuario', 'Ninguna, es exactamente lo mismo', 'Los archivos subidos a mano responden más rápido', 'SharePoint solo funciona con PDFs'],
    a: 0, bonus: true,
    exp: 'El archivo subido es una copia estática: si cambia, hay que resubirlo. Conectado por SharePoint se actualiza solo y cada usuario solo obtiene respuestas de lo que ya puede ver.' },
  { q: '🔥 BONUS · ¿Qué ajuste de un agente evita que conteste «de su cosecha» cuando no encuentra el dato?',
    o: ['Desactivar las respuestas no fundamentadas (sin fuentes)', 'Subirle la creatividad al máximo', 'Ponerle más emojis en las instrucciones', 'Limitar las respuestas a 100 palabras'],
    a: 0, bonus: true,
    exp: 'En Copilot Studio se puede desactivar que responda sin fuentes (ungrounded): el agente solo contesta con el conocimiento conectado y, si no está, lo dice. Nuestra regla de la casa, hecha configuración.' },
  { q: '🔥 BONUS · Para que un flujo rellene una plantilla de Word automáticamente (contratos, fichas) hace falta…',
    o: ['El conector premium de Word en Power Automate', 'Nada, viene con cualquier cuenta', 'Un desarrollador y tres meses', 'Imprimir la plantilla primero'],
    a: 0, bonus: true,
    exp: 'La acción «Rellenar plantilla de Word» es un conector premium (licencia de Power Automate Premium). Está en la lista de la reunión con IT — y es la pieza del futuro agente de contratos.' },
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

export default function QuizRutas() {
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
      await fetch('/api/quiz-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz: QUIZ_ID, nick: nick.trim(), score, hits, ms }),
      });
      fetchBoard();
    } catch (e) { setBoardNote('Tu puntuación no se pudo guardar — dilo en voz alta 😅'); }
  }

  const cur = order[qi];

  return (
    <div className="wrap">
      <Head><title>Quiz · Rutas de Copilot</title></Head>

      {screen === 'intro' && (
        <div className="card">
          <div className="big">🏆</div>
          <h1>Quiz · Las rutas de Copilot</h1>
          <p className="sub">10 preguntas de las dos rutas + 3 BONUS para valientes 🔥 · {TIME} segundos cada una · rápido da puntos extra y las bonus valen más</p>
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
