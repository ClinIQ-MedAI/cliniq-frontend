import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { NavLink } from 'react-router-dom';

const styles = {
  container: {
    width: '220px',
    height: '100vh',
    background: '#f8fafc',
    borderRight: '1px solid #e6edf3',
    padding: '20px 16px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  logo: { fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '22px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '6px' },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#475569',
    cursor: 'pointer'
  },
  navItemActive: {
    background: '#ffffff',
    boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
    color: '#0f172a'
  },
  small: { fontSize: '13px', color: '#94a3b8' },
  footer: { marginTop: 'auto', fontSize: '14px', color: '#94a3b8', paddingTop: '16px' }
};

function NavItem({ icon, children, to }) {
  return (
    <NavLink to={to} style={({ isActive }) => ({ textDecoration: 'none', display: 'flex', width: '100%' })}>
      {({ isActive }) => (
        <div style={{ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
            {icon}
          </span>
          <span>{children}</span>
        </div>
      )}
    </NavLink>
  );
}

function Sidebar() {
  const { user } = useUser();

  return (
    <aside style={styles.container} aria-label="Sidebar">
      <div style={styles.logo}>Hospital <span style={{ color: '#2563eb', fontWeight: 800 }}>logo</span></div>

      <nav style={styles.nav} aria-label="Main navigation">
        <NavItem
          to="/doctor-dashboard"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="8" height="8" rx="1" stroke="#2563eb" strokeWidth="1.5"/>
              <rect x="13" y="3" width="8" height="8" rx="1" stroke="#2563eb" strokeWidth="1.5"/>
              <rect x="3" y="13" width="8" height="8" rx="1" stroke="#2563eb" strokeWidth="1.5"/>
              <rect x="13" y="13" width="8" height="8" rx="1" stroke="#2563eb" strokeWidth="1.5"/>
            </svg>
          }
        >
          Dashboard
        </NavItem>
        <NavItem
          to="/appointments"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7h18" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M7 11h10" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5 15h14" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          }
        >
          Appointment requests
        </NavItem>
        <NavItem
          to="/tables"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="#64748b" strokeWidth="1.5"/>
              <path d="M8 8v8" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 8v8" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          }
        >
          Tables
        </NavItem>
        <NavItem
          to="/articles"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7h16" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M4 12h16" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M4 17h16" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          }
        >
          Articles
        </NavItem>
        <NavItem
          to="/profile"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="3" stroke="#64748b" strokeWidth="1.5"/>
              <path d="M5 20c1.5-3 4-5 7-5s5.5 2 7 5" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          }
        >
          Profile
        </NavItem>
      </nav>

      <button style={styles.footer} aria-label="Log out">
        <span style={styles.avatar} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>{user?.name}</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sign out</span>
        </div>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 17l5-5m0 0l-5-5m5 5H9" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
    </aside>
  );
}

export default Sidebar;