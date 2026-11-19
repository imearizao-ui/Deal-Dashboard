import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

const QUIZ_ID = 'fundamentos';
const TIME = 20;
const MEDALS = ['🥇', '🥈', '🥉'];

const QUESTIONS = [
  { q: 'Según el curso, un buen prompt tiene 4 elementos…',
    o: ['Objetivo, contexto, fuente y expectativas', 'Saludo, pregunta, gracias y emoji', 'Mayúsculas, urgencia y mucha fe', 'Copiar, pegar, rezar y repetir'],
    a: 0, exp: 'Qué quieres, para qué, de dónde salen los datos y cómo lo quieres. Son nuestras 4 piezas de la chuleta con otro nombre.' },
  { q: 'Antes de pegar datos de un inversor en Copilot Chat, compruebas…',
    o: ['Que el escudo de «protegido» está activo', 'Que nadie mira la pantalla', 'Que es viernes', 'Nada, Copilot es Microsoft y punto'],
    a: 0, exp: 'El escudo indica entorno corporativo: los datos no salen ni entrenan modelos. Sin escudo, no se pega el dato.' },
  { q: 'Copilot te da una cifra de un deal con mucha seguridad. ¿Qué haces?',
    o: ['Usarla, sonaba convincente', 'Verificarla contra la fuente antes de usarla', 'Preguntarle «¿seguro?» y si dice que sí, adelante', 'Redondearla por si acaso'],
    a: 1, exp: 'La seguridad del tono no es información. Toda cifra generada se verifica contra la fuente — regla de la casa.' },
  { q: '¿Dónde abres Copilot Chat con la cuenta corporativa?',
    o: ['En copilot.cloud.microsoft o el icono de las apps M365', 'En cualquier web que ponga «IA gratis»', 'Solo desde el móvil personal', 'Pidiéndoselo a Almudena'],
    a: 0, exp: 'copilot.cloud.microsoft con la cuenta de la empresa, o el icono de Copilot en Word, Excel, Outlook y Teams.' },
  { q: '«Dirigir la IA con una intención clara» significa…',
    o: ['Escribirle en tono firme y serio', 'Decirle exactamente qué quieres conseguir', 'Usar muchas exclamaciones', 'Repetir el prompt tres veces'],
    a: 1, exp: '«Resúmeme esto» da un resultado mediocre; decir qué quieres, para quién y en qué formato lo cambia todo.' },
  { q: '¿Qué puede hacer Copilot Chat con un archivo que le adjuntas?',
    o: ['Nada, solo lee lo que escribes', 'Analizarlo y responder preguntas sobre él', 'Enviárselo a Microsoft por correo', 'Imprimirlo'],
    a: 1, exp: 'Adjuntas un documento y le preguntas sobre él: resúmenes, datos concretos, comparaciones. Módulo 4 del curso.' },
  { q: 'Un prompt que te ha funcionado muy bien…',
    o: ['Se guarda y se comparte con el equipo', 'Se borra para que no se gaste', 'Se usa solo una vez, trae mala suerte', 'Es secreto profesional de cada uno'],
    a: 0, exp: 'Los prompts buenos van a la biblioteca del equipo (y Copilot tiene su galería para guardarlos). No se empieza de cero cada vez.' },
  { q: 'El resultado que genera la IA…',
    o: ['Sale directo al cliente, para eso está', 'Lo revisa y lo firma una persona', 'Es responsabilidad de Microsoft', 'No lo lee nadie, con la IA basta'],
    a: 1, exp: 'La responsabilidad no se delega: la IA redacta, tú revisas y tú firmas. El becario brillante, de nuevo.' },
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

export default function QuizFundamentos() {
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
      q: item.q, exp: item.exp,
      opts: shuffle(item.o.map((t, i) => ({ t, correct: i === item.a }))),
    })));
    setQi(0); setScore(0); setHits(0); setPicked(null);
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
      setScore((s) => s + 100 + Math.round(timeLeft * 2));
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
      <Head><title>Quiz · Fundamentos de IA</title></Head>

      {screen === 'intro' && (
        <div className="card">
          <div className="big">🏆</div>
          <h1>Quiz · Fundamentos de IA</h1>
          <p className="sub">8 preguntas · {TIME} segundos cada una · responder rápido da puntos extra</p>
          <input value={nick} onChange={(e) => setNick(e.target.value)} maxLength={30}
            placeholder="Tu nombre (o nombre de guerra)" onKeyDown={(e) => e.key === 'Enter' && start()} />
          <button className="go" onClick={start} disabled={!nick.trim()}>¡A jugar!</button>
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
          <h1>{hits} de {order.length} · {score} puntos</h1>
          <p className="sub">Marcador en directo — se actualiza según va terminando la gente</p>
          <table>
            <thead><tr><th></th><th>Nombre</th><th>Puntos</th><th>Aciertos</th></tr></thead>
            <tbody>
              {board.map((r, i) => (
                <tr key={r.nick + i} className={r.nick.trim().toLowerCase() === nick.trim().toLowerCase() ? 'me' : ''}>
                  <td>{MEDALS[i] || i + 1}</td><td>{r.nick}</td><td>{r.score}</td><td>{r.hits}/8</td>
                </tr>
              ))}
            </tbody>
          </table>
          {boardNote && <p className="note">{boardNote}</p>}
          <button className="go" onClick={start}>Jugar otra vez</button>
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
