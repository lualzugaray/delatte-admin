import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaCoffee,
  FaUsers,
  FaThList,
  FaRegComments,
  FaFlag,
  FaTimes,
  FaBars,
} from 'react-icons/fa';
import logo from '../assets/logo.png';
import '../styles/sidebar.css';

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = [
    { to: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/cafes', icon: <FaCoffee />, label: 'Cafés' },
    { to: '/users', icon: <FaUsers />, label: 'Usuarios' },
    { to: '/categories', icon: <FaThList />, label: 'Categorías' },
    { to: '/reviews', icon: <FaRegComments />, label: 'Reseñas' },
    { to: '/reports', icon: <FaFlag />, label: 'Denuncias' },
  ];

  const handleMobileToggle = () => setIsMobileOpen(prev => !prev);
  const handleLinkClick = () => setIsMobileOpen(false);

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={handleMobileToggle}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1005, // elevated above sidebar logo
          color: 'white',
          background: 'var(--color-primary)',
          border: 'none',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div
        className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={handleMobileToggle}
        style={{ zIndex: 1000 }}
      />

      <aside
        className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{ zIndex: 1001 }}
      >
        <div className="sidebar-header">
          <img
            src={logo}
            alt="DeLatte logo"
            className="sidebar-logo"
          />
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {links.map(({ to, icon, label }) => (
              <li key={to} className="sidebar-nav-item">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `sidebar-nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={handleLinkClick}
                >
                  <span className="sidebar-nav-icon">{icon}</span>
                  <span className="sidebar-nav-label">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="sidebar-logout-btn">
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
