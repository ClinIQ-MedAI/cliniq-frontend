import React, { useState } from 'react';
import './PatientsTreated.css';
import { patientsData } from '../../Services/mockData';

const PatientsTreated = () => {
  const [patients, setPatients] = useState(patientsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredPatients = patients.filter(patient => {
   
    if (filterStatus !== 'all' && patient.status !== filterStatus) {
      return false;
    }
    
    
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      return (
        patient.name.toLowerCase().includes(searchLower) ||
        patient.department.toLowerCase().includes(searchLower) ||
        patient.condition.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

 
  const handleStatusChange = (id, newStatus) => {
    setPatients(patients.map(patient => 
      patient.id === id ? { ...patient, status: newStatus } : patient
    ));
  };

 
  const handleAddPatient = () => {
    const newPatient = {
      id: patients.length + 1,
      name: `New Patient ${patients.length + 1}`,
      age: Math.floor(Math.random() * 60) + 18,
      gender: ['Male', 'Female'][Math.floor(Math.random() * 2)],
      status: 'in-treatment',
      department: 'General',
      condition: 'Pending',
      visits: 1,
      lastVisit: new Date().toISOString().split('T')[0],
      nextAppointment: null,
      contact: '000-000-0000'
    };
    setPatients([...patients, newPatient]);
  };

 
  const handleDeletePatient = (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      setPatients(patients.filter(patient => patient.id !== id));
    }
  };

  // إحصائيات
  const stats = {
    total: patients.length,
    treated: patients.filter(p => p.status === 'treated').length,
    inTreatment: patients.filter(p => p.status === 'in-treatment').length,
    discharged: patients.filter(p => p.status === 'discharged').length
  };

  return (
    <div className="patients-treated-container">
    
      <div className="patients-header">
        <div>
          <h2>Patients Treated</h2>
          <p className="subtitle">Manage and track patient treatments</p>
        </div>
        
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item treated">
            <span className="stat-number">{stats.treated}</span>
            <span className="stat-label">Treated</span>
          </div>
          <div className="stat-item in-treatment">
            <span className="stat-number">{stats.inTreatment}</span>
            <span className="stat-label">In Treatment</span>
          </div>
          <div className="stat-item discharged">
            <span className="stat-number">{stats.discharged}</span>
            <span className="stat-label">Discharged</span>
          </div>
        </div>
      </div>

     
      <div className="patients-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search patients by name, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="treated">Treated</option>
            <option value="in-treatment">In Treatment</option>
            <option value="discharged">Discharged</option>
          </select>
          
          <button className="add-patient-btn" onClick={handleAddPatient}>
            + Add New Patient
          </button>
        </div>
      </div>

     
      <div className="patients-table-container">
        {filteredPatients.length === 0 ? (
          <div className="no-results">
            <p>No patients found</p>
            <button onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <table className="patients-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Status</th>
                <th>Department</th>
                <th>Condition</th>
                <th>Visits</th>
                <th>Last Visit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => (
                <tr key={patient.id} className="patient-row">
                  <td>
                    <div className="patient-info-cell">
                      <div className="patient-avatar">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="patient-name">{patient.name}</div>
                        <div className="patient-details">
                          {patient.age} yrs • {patient.gender}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select 
                      value={patient.status}
                      onChange={(e) => handleStatusChange(patient.id, e.target.value)}
                      className={`status-select ${patient.status}`}
                    >
                      <option value="in-treatment">In Treatment</option>
                      <option value="treated">Treated</option>
                      <option value="discharged">Discharged</option>
                    </select>
                  </td>
                  <td>{patient.department}</td>
                  <td>
                    <span className={`condition-badge ${patient.condition.toLowerCase()}`}>
                      {patient.condition}
                    </span>
                  </td>
                  <td>{patient.visits}</td>
                  <td>{patient.lastVisit}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => alert(`View details for ${patient.name}`)}
                      >
                        View
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeletePatient(patient.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PatientsTreated;