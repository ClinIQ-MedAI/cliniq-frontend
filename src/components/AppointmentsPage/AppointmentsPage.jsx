import React, { useState } from 'react';
import './AppointmentsPage.css'; // سننشئ هذا الملف بعدين

const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

function AppointmentsPage() {
  // بيانات المثال - نفس البيانات اللي في الداشبورد + أكتر
  const [appointments, setAppointments] = useState([
    { id: 1, name: 'Shyam Khamo', disease: 'Heart Disease', date: '01/27', status: 'pending', visits: 3 },
    { id: 2, name: 'Jean Lee Un', disease: 'Heart Disease', date: '01/27', status: 'approved', visits: 2 },
    { id: 3, name: 'Clara Brook', disease: 'Heart Disease', date: '01/27', status: 'pending', visits: 5 },
    { id: 4, name: 'Ahmed Ali', disease: 'Cardiovascular', date: '01/28', status: 'approved', visits: 7 },
    { id: 5, name: 'Sarah Johnson', disease: 'Pediatric Cardiology', date: '01/28', status: 'rejected', visits: 1 },
    { id: 6, name: 'Michael Brown', disease: 'Heart Disease', date: '01/29', status: 'pending', visits: 4 },
    { id: 7, name: 'Emma Wilson', disease: 'Cardiac Surgery', date: '01/29', status: 'approved', visits: 6 },
    { id: 8, name: 'David Lee', disease: 'Preventive Cardiology', date: '01/30', status: 'pending', visits: 2 },
    { id: 9, name: 'Lisa Garcia', disease: 'Heart Disease', date: '01/30', status: 'approved', visits: 3 },
    { id: 10, name: 'Robert Chen', disease: 'Pediatric Cardiology', date: '01/31', status: 'pending', visits: 4 },
  ]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;

  // Filter state
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    // Filter by status
    if (filterStatus !== 'all' && appointment.status !== filterStatus) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !appointment.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !appointment.disease.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Pagination calculations
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  // Handle approval/rejection
  const handleStatusChange = (id, newStatus) => {
    setAppointments(prev =>
      prev.map(appointment =>
        appointment.id === id 
          ? { ...appointment, status: newStatus } 
          : appointment
      )
    );
  };

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  return (
    <div className="appointments-page">
      {/* Header */}
      <header className="appointments-header">
        <h1>Appointment Requests</h1>
        <p className="subtitle">Manage and review all appointment requests</p>
      </header>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{appointments.length}</div>
          <div className="stat-label">Total Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-number pending">
            {appointments.filter(a => a.status === 'pending').length}
          </div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number approved">
            {appointments.filter(a => a.status === 'approved').length}
          </div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number rejected">
            {appointments.filter(a => a.status === 'rejected').length}
          </div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or disease..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="status-filters">
          <button
            className={`status-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button
            className={`status-filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Pending
          </button>
          <button
            className={`status-filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('approved')}
          >
            Approved
          </button>
          <button
            className={`status-filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Disease</th>
              <th>Date</th>
              <th>Visits</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentAppointments.map(appointment => (
              <tr key={appointment.id}>
                <td>
                  <div className="patient-cell">
                    <div className="patient-avatar">
                      {getInitials(appointment.name)}
                    </div>
                    <div className="patient-info">
                      <div className="patient-name">{appointment.name}</div>
                    </div>
                  </div>
                </td>
                <td>{appointment.disease}</td>
                <td>{appointment.date}</td>
                <td>
                  <span className="visits-badge">{appointment.visits} visits</span>
                </td>
                <td>
                  <span className={`status-badge ${appointment.status}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className={`action-btn approve ${appointment.status === 'approved' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(appointment.id, 'approved')}
                      title="Approve"
                    >
                      ✓
                    </button>
                    <button
                      className={`action-btn reject ${appointment.status === 'rejected' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(appointment.id, 'rejected')}
                      title="Reject"
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

      {/* Pagination */}
      {filteredAppointments.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {indexOfFirstAppointment + 1} to {Math.min(indexOfLastAppointment, filteredAppointments.length)} of {filteredAppointments.length} appointments
          </div>
          
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {filteredAppointments.length === 0 && (
        <div className="no-results">
          <p>No appointments found matching your criteria.</p>
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setFilterStatus('all');
              setSearchTerm('');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;