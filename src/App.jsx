import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Clock3, Leaf, ShieldCheck, Sparkles } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firebaseConfigured } from './firebase';
import { friendlyAuthError, signInWithGoogle, signOutUser } from './services/auth';
import { saveCompletedSession } from './services/studyHistory';
import Header from './components/Header.jsx';
import Timer from './components/Timer.jsx';
import History from './components/History.jsx';
import './styles.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!firebaseConfigured);
  const [authLoading, setAuthLoading] = useState(false);
  const [page, setPage] = useState('home');
  const [mode, setMode] = useState('pomodoro');
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setAuthReady(true);
      if (!currentUser && page === 'history') setPage('home');
    });
  }, [page]);

  async function login() {
    setAuthLoading(true); setToast('');
    try { await signInWithGoogle(); setToast('Que bom ter você por aqui! ♡'); }
    catch (error) { setToast(friendlyAuthError(error)); }
    finally { setAuthLoading(false); }
  }
  async function logout() {
    try { await signOutUser(); setPage('home'); setToast('Você saiu da sua conta. Até logo!'); }
    catch { setToast('Não foi possível sair agora. Tente novamente.'); }
  }
  const handleComplete = useCallback(async seconds => {
    if (!user) {
      setToast('Sessão concluída! Entre com Google para salvar seu histórico. ♡');
      return;
    }
    setSaving(true);
    try {
      const result = await saveCompletedSession(seconds);
      setToast(result.saved ? 'Sessão salva no seu histórico. Mandou bem! ♡' : 'Entre com Google para salvar seu histórico.');
    } catch {
      setToast('Sessão concluída, mas não conseguimos salvar. Confira sua conexão.');
    } finally { setSaving(false); }
  }, [user]);

  function chooseMode(nextMode) { setMode(nextMode); setPage('timer'); setToast(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  const showHome = () => { setPage('home'); setToast(''); };
  const showHistory = () => { setPage('history'); setToast(''); };

  return <div className="app-shell">
    <Header user={user} onLogin={login} onLogout={logout} onHome={showHome} onHistory={showHistory} activePage={page} loading={authLoading || !authReady}/>
    {!firebaseConfigured && <div className="config-banner"><ShieldCheck size={18}/><span><b>Modo de demonstração:</b> configure as variáveis Firebase em <code>.env.local</code> para ativar login e histórico.</span></div>}
    {page === 'home' && <main className="home-page">
      <section className="hero-copy"><div className="eyebrow"><Sparkles size={15}/> UM RESPIRO NA ROTINA</div><h1>Olá, estudante! <span className="paw">✿</span><br/>Vamos focar um pouquinho?</h1><p>Escolha seu jeitinho de estudar hoje. Prepare um cantinho confortável, respire fundo e vamos nessa.</p>
        <div className="hero-note"><div className="image-placeholder hero-cat"><img src="src/assets/cafe.png" alt="desenho de uma xicara de café" /></div><div><b>Seu ritmo, suas conquistas.</b><small>Não precisa ser perfeito. Só precisa começar. ♡</small></div></div>
      </section>
      <section className="method-section"><div className="section-title"><span>✦</span><div><h2>Como você quer estudar?</h2><p>Escolha um método para começar</p></div></div>
        <div className="method-grid">
          <button className="method-card pomodoro-card" onClick={() => chooseMode('pomodoro')}><div className="method-art image-placeholder"><img src="src/assets/purrstudy-pomodoro.png" alt="Desenho de um gato dormindo em cima de livros ao lado de um cronometro" /></div><div className="method-copy"><span className="method-kicker">FOCO COM PAUSAS</span><h3>Método Pomodoro</h3><p>Estude em blocos de 25 minutos com pausas curtas para recarregar a energia.</p><span className="method-link">Começar a focar <ArrowRight size={17}/></span></div></button>
          <button className="method-card free-card" onClick={() => chooseMode('free')}><div className="method-art image-placeholder"><img src="src/assets/purrstudy-cronometrolivre.png" alt="" /></div><div className="method-copy"><span className="method-kicker">NO SEU TEMPO</span><h3>Cronômetro livre</h3><p>Defina sua própria meta e estude no ritmo que combina com você.</p><span className="method-link">Escolher meu tempo <ArrowRight size={17}/></span></div></button>
        </div>
        <div className="gentle-tip"><div className="tip-icon"><Leaf size={19}/></div><p><b>Uma dica carinhosa</b><br/>Deixe o celular de lado, separe seu café e comemore cada pequeno avanço</p><span>♡</span></div>
      </section>
    </main>}
    {page === 'timer' && <Timer key={mode} mode={mode} onBack={showHome} onComplete={handleComplete}/>}
    {page === 'history' && user && <History user={user}/>}
    <footer className="site-footer"><div className="footer-mark">♡</div><span>Feito com carinho para seus momentos de foco.</span><span className="footer-status">{saving ? 'Salvando sessão…' : 'Respire. Você está indo bem.'}</span></footer>
    {toast && <div className="toast" role="status"><span>{toast}</span><button onClick={() => setToast('')} aria-label="Fechar aviso">×</button></div>}
  </div>;
}