import React from 'react';
import { LogIn, LogOut, House, ChartNoAxesColumn } from 'lucide-react';
import Logo from './Logo.jsx';

export default function Header({ user, onLogin, onLogout, onHome, onHistory, activePage, loading }) {
  return <header className="topbar">
    <button className="brand-button" onClick={onHome} aria-label="Ir para o início"><Logo compact /></button>
    <nav className="top-actions" aria-label="Navegação principal">
      <button className={`nav-link ${activePage === 'home' ? 'selected' : ''}`} onClick={onHome}><House size={17}/> Início</button>
      {user && <button className={`nav-link ${activePage === 'history' ? 'selected' : ''}`} onClick={onHistory}><ChartNoAxesColumn size={17}/> Meu histórico</button>}
      {user
        ? <button className="login-button subtle" onClick={onLogout}><LogOut size={16}/> Sair</button>
        : <button className="login-button" onClick={onLogin} disabled={loading}><LogIn size={16}/> {loading ? 'Entrando…' : 'Entrar com Google'}</button>}
    </nav>
  </header>;
}