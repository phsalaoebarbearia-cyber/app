import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, Calendar, User, Users, Scissors, Clock, BarChart3,
  Heart, Settings, HelpCircle, LogOut, Menu, X, ChevronRight,
  CalendarDays, ClipboardList
} from 'lucide-react';

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const isValidPhoto = (photo) => {
  if (!photo) return false;
  return photo.startsWith('data:') || photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('./');
};

const clientNav = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/agendar', label: 'Agendar', icon: Calendar },
  { path: '/meus-agendamentos', label: 'Agendamentos', icon: ClipboardList },
  { path: '/favoritos', label: 'Favoritos', icon: Heart },
  { path: '/configuracoes', label: 'Configurações', icon: Settings },
  { path: '/ajuda', label: 'Ajuda', icon: HelpCircle },
];

const adminNav = [
  { path: '/', label: 'Dashboard', icon: BarChart3 },
  { path: '/barbeiros', label: 'Barbeiros', icon: Users },
  { path: '/servicos', label: 'Serviços', icon: Scissors },
  { path: '/agenda', label: 'Agenda', icon: CalendarDays },
  { path: '/agendamentos', label: 'Agendamentos', icon: ClipboardList },
  { path: '/horarios', label: 'Horários', icon: Clock },
  { path: '/clientes', label: 'Clientes', icon: Users },
];

const barberNav = [
  { path: '/', label: 'Minha Agenda', icon: Calendar },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user?.role === 'admin' ? adminNav : user?.role === 'barber' ? barberNav : clientNav;
  const roleLabel = user?.role === 'admin' ? 'Administrador' : user?.role === 'barber' ? 'Barbeiro' : 'Cliente';

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="./Logo_ph.png" alt="PH" />
          <div className="brand">
            <h2>PH Barbearia</h2>
            <p>Salão & Barbearia</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#888', display: 'none' }}
            className="close-sidebar-btn"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Menu</div>
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNav(item.path)}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">
              {isValidPhoto(user?.photo) ? (
                <img src={user.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <div className="info">
              <div className="name">{user?.name}</div>
              <div className="role">{roleLabel}</div>
            </div>
            <button
              onClick={logout}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4 }}
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <button
          className="menu-toggle"
          onClick={() => setSidebarOpen(true)}
          style={{
            display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 101,
            background: 'var(--secondary)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-sm)', color: 'white', padding: '8px 12px', cursor: 'pointer'
          }}
        >
          <Menu size={20} />
        </button>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .menu-toggle { display: flex !important; }
          .close-sidebar-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
}
