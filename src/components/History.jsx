import React from 'react';
import { useEffect, useState } from 'react';
import { BookOpen, RefreshCw, Clock3, CheckCircle2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDate, formatDuration, getRecentHistory } from '../services/studyHistory';

export default function History({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try { setItems(await getRecentHistory()); }
    catch { setError('Não foi possível carregar seu histórico. Confira sua conexão e as regras do Firestore.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [user?.uid]);

  const chartData = [...items].reverse().map(item => ({
    dia: formatDate(item.data),
    minutos: Math.round((item.tempoTotalSegundos || 0) / 60),
  }));
  const totalSeconds = items.reduce((sum, item) => sum + (item.tempoTotalSegundos || 0), 0);
  const totalSessions = items.reduce((sum, item) => sum + (item.sessoesConcluidas || 0), 0);

  return <main className="history-page">
    <div className="page-heading"><div className="eyebrow"><BookOpen size={15}/> SEU CANTINHO DE CONQUISTAS</div><h1>Olha só o quanto você já avançou!</h1><p>Cada sessão conta. Estamos orgulhosos de você. ♡</p></div>
    <div className="stats-grid">
      <article className="stat-card lilac"><span className="stat-icon"><Clock3/></span><small>Tempo estudado · registros recentes</small><strong>{formatDuration(totalSeconds)}</strong></article>
      <article className="stat-card peach"><span className="stat-icon"><CheckCircle2/></span><small>Sessões concluídas</small><strong>{totalSessions}</strong></article>
    </div>
    <section className="history-panel">
      <div className="panel-heading"><div><h2>Seu ritmo de estudos</h2><p>Minutos registrados por dia</p></div><button className="icon-button" onClick={load} aria-label="Atualizar histórico"><RefreshCw size={17}/></button></div>
      {loading ? <p className="empty-state">Carregando seu histórico…</p> : error ? <p className="error-state">{error}</p> : items.length === 0 ? <div className="empty-state"><div className="image-placeholder tiny-cat">IMAGEM<br/>DO GATO</div><h3>Seu primeiro capítulo começa hoje!</h3><p>Conclua uma sessão de foco para ela aparecer aqui.</p></div> :
        <div className="chart-wrap"><ResponsiveContainer width="100%" height={250}><BarChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee4f2"/><XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: '#766b84', fontSize: 12 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: '#766b84', fontSize: 12 }}/><Tooltip formatter={(value) => [`${value} min`, 'Estudo']} contentStyle={{ borderRadius: 12, border: '1px solid #e8ddf0' }}/><Bar dataKey="minutos" fill="#a38bd3" radius={[8,8,2,2]} maxBarSize={42}/></BarChart></ResponsiveContainer></div>}
    </section>
    <section className="history-panel entries-panel"><div className="panel-heading"><div><h2>Últimos registros</h2><p>Um pouquinho por dia faz diferença.</p></div></div>
      {items.length > 0 && <div className="history-list">{items.map(item => <div className="history-row" key={item.data}><div className="date-dot">♡</div><div className="history-date"><b>{formatDate(item.data)}</b><small>{item.sessoesConcluidas || 0} sessões concluídas</small></div><strong>{formatDuration(item.tempoTotalSegundos)}</strong></div>)}</div>}
    </section>
  </main>;
}