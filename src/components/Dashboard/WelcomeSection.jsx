import React, { useState, useEffect } from 'react';
import './WelcomeSection.css';

const WelcomeSection = ({ doctorName }) => {
  const [dashboardStats, setDashboardStats] = useState({
    patientsTreated: 3000,
    percentageChange: 42,
    rating: 4.8,
    monthlyRevenue: 24580,
    totalAppointments: 324,
    activePatients: 1248
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      try {
        setTimeout(() => {
          const mockStats = {
            patientsTreated: Math.floor(Math.random() * 5000) + 2000,
            percentageChange: Math.floor(Math.random() * 100) + 10,
            rating: (Math.random() * 1 + 4.5).toFixed(1),
            monthlyRevenue: Math.floor(Math.random() * 50000) + 15000,
            totalAppointments: Math.floor(Math.random() * 500) + 200,
            activePatients: Math.floor(Math.random() * 2000) + 1000
          };

          setDashboardStats(mockStats);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(dashboardStats.rating);
    const hasHalfStar = dashboardStats.rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star">★</span>);
    }

    while (stars.length < 5) {
      stars.push(<span key={`empty-${stars.length}`} className="star empty">★</span>);
    }

    return stars;
  };

  return (
    <div className="welcome-section">
      <div className="welcome-header">
        <div className="welcome-text">
          <h1>
            {getGreeting()}, <span className="doctor-name">{doctorName}</span>
          </h1>
          <p className="welcome-subtitle">
            Overview of appointments, patients and announcements
          </p>
        </div>

        <div className="current-time">
          <span className="time">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="date">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      <div className="stats-cards">
        <div className="card stat-card">
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Overview</div>
            <div style={{ color: '#64748b', marginTop: 6 }}>
              Quick glance at your practice
            </div>

            <div className="small-stats-row" style={{ marginTop: 16 }}>
              <div className="small-stat-card">
                <div className="small-icon">👨‍⚕️</div>
                <div className="small-stat-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="small-number">
                      {isLoading ? '...' : dashboardStats.patientsTreated}
                    </div>
                    <div className="small-count">patients</div>
                  </div>
                  <div className="small-label">Patients Treated</div>
                </div>
              </div>

              <div className="small-stat-card">
                <div className="small-icon">⭐</div>
                <div className="small-stat-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="small-number">
                      {isLoading ? '...' : dashboardStats.rating}
                    </div>
                    <div className="small-count">/5</div>
                  </div>
                  <div className="small-label">Average Rating</div>
                  <div className="stars-row">{renderStars()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

WelcomeSection.defaultProps = {
  doctorName: 'Dr. Robert Harry'
};

export default WelcomeSection;
