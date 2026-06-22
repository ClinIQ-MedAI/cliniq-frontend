import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import WelcomeSection from './WelcomeSection';
import MonthlyRevenue from './MonthlyRevenue';
import { patientsData } from '../../Services/mockData';
import './Dashboard.css';

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const Card = ({ children }) => (
  <div className="card">{children}</div>
);

const AppointmentsTable = () => {
  const [rows, setRows] = useState([
    { id: 1, name: 'Shyam Khamo', disease: 'Heart Disease', date: '01/27', status: 'pending' },
    { id: 2, name: 'Jean Lee Un', disease: 'Heart Disease', date: '01/27', status: 'pending' },
    { id: 3, name: 'Clara Brook', disease: 'Heart Disease', date: '01/27', status: 'pending' }
  ]);

  const setApproval = (id, target) => {
    setRows(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: r.status === target ? 'pending' : target } : r
      )
    );
  };

  return (
    <div className="card-content">
      <table>
        <colgroup>
          <col style={{ width: '35%' }} />
          <col style={{ width: '35%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '15%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Name</th>
            <th>Disease</th>
            <th style={{ textAlign: 'right' }}>Date</th>
            <th style={{ textAlign: 'center' }}>Approval</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.disease}</td>
              <td style={{ textAlign: 'right' }}>{row.date}</td>
              <td style={{ textAlign: 'center' }}>
                <div className="approval-buttons">
                  <button
                    onClick={() => setApproval(row.id, 'approved')}
                    className={`approve-btn ${row.status === 'approved' ? 'approved' : ''}`}
                    style={{
                      background: row.status === 'approved' ? '#10b981' : 'transparent',
                      color: row.status === 'approved' ? 'white' : '#64748b'
                    }}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setApproval(row.id, 'rejected')}
                    className={`reject-btn ${row.status === 'rejected' ? 'rejected' : ''}`}
                    style={{
                      background: row.status === 'rejected' ? '#ef4444' : 'transparent',
                      color: row.status === 'rejected' ? 'white' : '#64748b'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="dashboard-root">
      <WelcomeSection doctorName={user?.name} />

      {/* Main Grid */}
      <div className="dashboard-grid">
        
        {/* Left Column */}
        <div className="left-col">
          <Card>
            <h3>Appointment requests</h3>
            <AppointmentsTable />
          </Card>

          <Card>
            <h3>Monthly Revenue</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <MonthlyRevenue compact={false} />
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <aside className="right-col">
          <Card>
            <h4>Most visited clients</h4>
            <ul className="clients-list">
              {patientsData.slice(0, 3).map(p => (
                <li key={p.id} className="client-item">
                  <div className="client-info">
                    <div 
                      className="client-avatar"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg,#6b8cff,#00b4ff)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        flexShrink: 0
                      }}
                    >
                      {getInitials(p.name)}
                    </div>

                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {p.condition || 'Heart Disease'}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                    {p.visits ?? 0} times
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h4>Announcements</h4>
            <ul className="announcements-list">
              <li className="announcement-item">
                Meeting has been rescheduled for 28 may...
              </li>
              <li className="announcement-item">
                We request our doctor to use our website...
              </li>
              <li className="announcement-item" style={{ borderBottom: 'none' }}>
                Dr Faisal has completed 400 surgery. Congrats...
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}