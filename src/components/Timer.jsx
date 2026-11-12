import React from 'react';
import { useEffect, useRef, useState } from 'react';
import gatinhoPomodoro from '../assets/gatinhopomodoro.png';
import gatinhoLivre from '../assets/gatinhotempolivre.png';
import {
  Play,
  Pause,
  RotateCcw,
  Bell,
  BellOff,
  Check,
  ArrowLeft,
  Save,
} from 'lucide-react';

function clock(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;

  return h
    ? [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
    : [m, s].map(n => String(n).padStart(2, '0')).join(':');
}

export default function Timer({ mode, onBack, onComplete }) {
  const pomodoro = mode === 'pomodoro';

  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [freeMinutes, setFreeMinutes] = useState(60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('focus');
  const [cycle, setCycle] = useState(1);
  const [notice, setNotice] = useState('');
  const [finishing, setFinishing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof Notification !== 'undefined' &&
      Notification.permission === 'granted'
  );

  const endAt = useRef(null);
  const notified = useRef(false);

  useEffect(() => {
    if (!running) return undefined;

    const interval = window.setInterval(() => {
      if (pomodoro) {
        const next = Math.max(
          0,
          Math.ceil((endAt.current - Date.now()) / 1000)
        );

        setRemaining(next);

        if (next === 0 && !notified.current) {
          notified.current = true;
          setRunning(false);

          const completedSeconds =
            phase === 'focus' ? focusMinutes * 60 : breakMinutes * 60;

          if (phase === 'focus') {
            onComplete(completedSeconds);
            setNotice('Bloco de foco concluído! Hora de descansar um pouquinho. ♡');
            sendNotification(
              'PurrStudy — pausa merecida!',
              'Você concluiu seu bloco de foco. Hora de descansar!'
            );
            setPhase('break');
            setRemaining(breakMinutes * 60);
          } else {
            setNotice('Pausa concluída! Pronto para mais um ciclo?');
            sendNotification(
              'PurrStudy — de volta ao foco!',
              'Sua pausa acabou. Vamos estudar?'
            );
            setCycle(c => c + 1);
            setPhase('focus');
            setRemaining(focusMinutes * 60);
          }
        }
      } else {
        const next = Math.max(
          0,
          Math.floor((Date.now() - endAt.current) / 1000)
        );
        setElapsed(next);
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [running, pomodoro, phase, focusMinutes, breakMinutes, onComplete]);

  async function sendNotification(title, body) {
    if (
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

  try {
    // primeiro tenta o metodo compativel com navegadores moveis
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;

      if (registration.showNotification) {
        await registration.showNotification(title, {
          body,
          tag: 'purrstudy-timer',
          icon: '/favicon.ico',
        });

        return;
      }
    }

    // mantem compatibilidade com navegadores de pc
    new Notification(title, {
      body,
      tag: 'purrstudy-timer',
    });
  } catch (error) {
    console.warn('Não foi possível exibir a notificação:', error);
  }
}

async function enableNotifications() {
  if (
    typeof Notification === 'undefined' ||
    !('Notification' in window)
  ) {
    setNotice(
      'Este navegador não oferece notificações. Você ainda pode usar o cronômetro normalmente.'
    );
    return;
  }

  try {
    // solicita permissao apos o clique do usuario
    const permission = await Notification.requestPermission();
    const enabled = permission === 'granted';

    if (enabled && 'serviceWorker' in navigator) {
      await navigator.serviceWorker.ready;
    }

    setNotificationsEnabled(enabled);

    setNotice(
      enabled
        ? 'Notificações ativadas! Você receberá avisos ao terminar.'
        : 'Permissão não concedida. Você pode ativá-la nas configurações do navegador.'
    );
  } catch (error) {
    console.error('Erro ao ativar notificações:', error);

    setNotificationsEnabled(false);
    setNotice(
      'Não foi possível ativar as notificações neste navegador.'
    );
  }
}
  

  function start() {
    notified.current = false;

    if (pomodoro) {
      endAt.current = Date.now() + remaining * 1000;
    } else {
      endAt.current = Date.now() - elapsed * 1000;
    }

    setRunning(true);
    setNotice('');
  }

  function pause() {
    if (pomodoro && endAt.current) {
      setRemaining(
        Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
      );
    }

    if (!pomodoro && endAt.current) {
      setElapsed(
        Math.max(0, Math.floor((Date.now() - endAt.current) / 1000))
      );
    }

    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setPhase('focus');
    setCycle(1);
    setElapsed(0);
    setRemaining(pomodoro ? focusMinutes * 60 : freeMinutes * 60);
    endAt.current = null;
    notified.current = false;
    setFinishing(false);
    setNotice('');
  }

  function updateFocus(value) {
    const minutes = Number(value);
    setFocusMinutes(minutes);

    if (phase === 'focus' && !running) {
      setRemaining(minutes * 60);
    }
  }

  function updateFree(value) {
    const minutes = Number(value);
    setFreeMinutes(minutes);

    if (!running) {
      setElapsed(0);
      setRemaining(minutes * 60);
      endAt.current = null;
      setNotice('');
    }
  }

  async function finishFreeSession() {
    if (pomodoro || finishing) return;

    // calcula o tempo exato mesmo se o usuário clicar enquanto o contador roda
    const seconds = running && endAt.current
      ? Math.max(0, Math.floor((Date.now() - endAt.current) / 1000))
      : elapsed;

    if (seconds < 1) {
      setNotice('Comece a estudar antes de finalizar sua sessão. ♡');
      return;
    }

    setRunning(false);
    setFinishing(true);
    endAt.current = null;

    // zera o contador apos capturar o tempo para impedir salvamentos duplicados
    setElapsed(0);
    setRemaining(freeMinutes * 60);
    setNotice(`Sessão de ${clock(seconds)} finalizada! ♡`);

    try {
      await onComplete(seconds);
    } finally {
      setFinishing(false);
    }
  }

  const displaySeconds = pomodoro ? remaining : elapsed;

  const progress = pomodoro
    ? 1 -
      remaining /
        ((phase === 'focus' ? focusMinutes : breakMinutes) * 60)
    : Math.min(1, elapsed / (freeMinutes * 60));

  const circumference = 2 * Math.PI * 112;

  return (
    <main className={`timer-page ${pomodoro ? 'pomodoro-page' : 'free-page'}`}>
      <div className="timer-topline">
        <button className="text-button" onClick={onBack}>
          <ArrowLeft size={17} />
          Voltar
        </button>

        <span className="mode-pill">
          {pomodoro ? '🍅 Método Pomodoro' : '◷ Cronômetro Livre'}
        </span>
      </div>

      <section className="timer-intro">
        <h1>
          {pomodoro
            ? phase === 'focus'
              ? 'Hora de focar!'
              : 'Pausa para respirar'
            : 'No seu ritmo ♡'}
        </h1>

        <p>
          {pomodoro
            ? phase === 'focus'
              ? `Foco por ${focusMinutes} minutos, depois uma pausa de ${breakMinutes}.`
              : 'Alongue-se, beba água e descanse os olhos.'
            : 'Defina o tempo que quiser e comece a estudar!'}
        </p>
      </section>

      <section className="timer-card">
        <div className="timer-stage">
          <div className="timer-cat timer-cat-overlay">
            <img
              src={pomodoro ? gatinhoPomodoro : gatinhoLivre}
              alt={
                pomodoro
                  ? 'Gatinho do método Pomodoro'
                  : 'Gatinho do cronômetro livre'
              }
            />
          </div>

          <div
            className="timer-ring"
            role="timer"
            aria-label={`Tempo ${clock(displaySeconds)}`}
          >
            <svg viewBox="0 0 250 250" aria-hidden="true">
              <circle className="ring-track" cx="125" cy="125" r="112" />
              <circle
                className="ring-progress"
                cx="125"
                cy="125"
                r="112"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
              />
            </svg>

            <div className="timer-readout">
              <strong>{clock(displaySeconds)}</strong>
              <span>
                {pomodoro
                  ? phase === 'focus'
                    ? 'Tempo de estudo'
                    : 'Tempo de pausa'
                  : 'Tempo de estudo'}
              </span>

              <div className="timer-controls">
                <button
                  className="round-action primary-action"
                  onClick={running ? pause : start}
                  aria-label={running ? 'Pausar' : 'Iniciar'}
                  title={running ? 'Pausar' : 'Iniciar'}
                >
                  {running
                    ? <Pause fill="currentColor" size={21} />
                    : <Play fill="currentColor" size={21} />}
                </button>

                <button
                  className="round-action"
                  onClick={reset}
                  aria-label="Reiniciar"
                  title="Reiniciar"
                >
                  <RotateCcw size={19} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {pomodoro ? (
          <>
            <div className="timer-meta">
              <div>
                <span>🍅</span>
                <div>
                  <small>Ciclos</small>
                  <b>{cycle} / 4</b>
                </div>
              </div>

              <div className="meta-divider" />

              <div>
                <span>◷</span>
                <div>
                  <small>{phase === 'focus' ? 'Pausa' : 'Pausa atual'}</small>
                  <b>{breakMinutes} min</b>
                </div>
              </div>
            </div>

            <div className="timer-settings">
              <label>
                Tempo de foco
                <select
                  value={focusMinutes}
                  disabled={running}
                  onChange={e => updateFocus(e.target.value)}
                >
                  <option value="15">15 minutos</option>
                  <option value="25">25 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="50">50 minutos</option>
                </select>
              </label>

              <label>
                Pausa
                <select
                  value={breakMinutes}
                  disabled={running}
                  onChange={e => {
                    const value = Number(e.target.value);
                    setBreakMinutes(value);

                    if (!running && phase === 'break') {
                      setRemaining(value * 60);
                    }
                  }}
                >
                  <option value="5">5 minutos</option>
                  <option value="10">10 minutos</option>
                  <option value="15">15 minutos</option>
                </select>
              </label>
            </div>
          </>
        ) : (
          <>
            <div className="free-settings">
              <label>Tempos sugeridos</label>

              <div className="preset-row">
                {[15, 30, 45, 60, 90, 120].map(min => (
                  <button
                    key={min}
                    className={`preset ${freeMinutes === min ? 'active' : ''}`}
                    onClick={() => updateFree(min)}
                    disabled={running}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>

            <button
              className="finish-session-button"
              onClick={finishFreeSession}
              disabled={finishing || (elapsed < 1 && !running)}
            >
              <Save size={17} />
              {finishing ? 'Salvando sessão…' : 'Finalizar e salvar sessão'}
            </button>
          </>
        )}

        <button
          className={`notification-toggle ${notificationsEnabled ? 'enabled' : ''}`}
          onClick={enableNotifications}
        >
          {notificationsEnabled
            ? <Bell size={16} />
            : <BellOff size={16} />}
          {notificationsEnabled
            ? 'Notificações ativadas'
            : 'Ativar avisos de pausa'}
        </button>

        {notice && (
          <p className="notice" role="status">
            <Check size={15} />
            {notice}
          </p>
        )}

        <p className="soft-reminder">
          ♡ {pomodoro
            ? 'Disciplina é dar pequenos passos todos os dias.'
            : 'Seu tempo, suas regras!'}
        </p>
      </section>
    </main>
  );
}