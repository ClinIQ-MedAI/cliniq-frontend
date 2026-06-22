import React from 'react';
import './Header.css';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-left" />
      <div className="header-right">
        <div className="search">
          <input placeholder="Search" aria-label="Search" />
        </div>

        <button className="icon-btn" aria-label="Notifications">🔔</button>
        <button className="icon-btn" aria-label="Theme toggle">🌙</button>
        <div className="avatar">
          <div className="avatar-circle">DR</div>
        </div>
      </div>
    </header>
  );
}
