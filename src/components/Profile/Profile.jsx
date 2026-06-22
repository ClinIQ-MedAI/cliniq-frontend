import React, { useEffect, useState } from "react";
import "./Profile.css";

export default function Profile({ onUpdateDoctorInfo }) {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const initialProfile = {
      name: "Dr. Mohamed Akram",
      specialty: "Cardiologist",
      degree: "M.B.B.S, Cardiology Specialist",
      hospital: "Cliniq Hospital",
      location: "Cairo, Egypt",
      experience: "10+ Years",
      workingHours: "9am - 5pm Mon to Fri",
      awards: "Best Cardiologist Award, 2023",
      image: "/mohamed.jpg",
      specialties: [
        "Heart Disease",
        "Pediatric Cardiology",
        "Cardiac Surgery",
        "Preventive Cardiology",
      ],
    };
    
    setProfile(initialProfile);
    setEditForm(initialProfile);
  }, []);

  const handleEditClick = () => setIsEditing(true);
  const handleSaveClick = () => {
    setProfile({ ...editForm });
    setIsEditing(false);
    // إرسال البيانات المحدثة إلى الـ App إذا كان فيه prop
    if (onUpdateDoctorInfo) {
      onUpdateDoctorInfo({
        name: editForm.name,
        specialty: editForm.specialty,
        image: editForm.image
      });
    }
  };
  
  const handleCancelClick = () => {
    setEditForm({ ...profile });
    setIsEditing(false);
  };
  
  const handleInputChange = (e) => {
    setEditForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const handleSpecialtyChange = (index, value) => {
    const updatedSpecialties = [...editForm.specialties];
    updatedSpecialties[index] = value;
    setEditForm(prev => ({
      ...prev,
      specialties: updatedSpecialties
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditForm(prev => ({
          ...prev,
          image: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!profile) {
    return <div className="profile-loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        
        {/* زر Edit Profile */}
        <div className="profile-edit-btn-container">
          <button className="profile-edit-btn" onClick={handleEditClick}>
            <svg className="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        </div>

       
        <div className="profile-content">
          
          {/* قسم صورة الدكتور والمعلومات */}
          <div className="profile-doctor-section">
            <div className="doctor-image-container">
              {isEditing ? (
                <div className="edit-image-container">
                  <div className="doctor-image-edit">
                    <img 
                      src={editForm.image || profile.image} 
                      alt={editForm.name} 
                      className="doctor-image" 
                    />
                    <label className="change-image-btn">
                      Change Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="image-input"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="doctor-image-display">
                  <img src={profile.image} alt={profile.name} className="doctor-image" />
                </div>
              )}
              
              <div className="doctor-name-display">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="edit-input doctor-name-input"
                    placeholder="Doctor Name"
                  />
                ) : (
                  <h1 className="doctor-name">{profile.name}</h1>
                )}
                {isEditing ? (
                  <input
                    type="text"
                    name="specialty"
                    value={editForm.specialty}
                    onChange={handleInputChange}
                    className="edit-input doctor-specialty-input"
                    placeholder="Specialty"
                  />
                ) : (
                  <p className="doctor-specialty">{profile.specialty}</p>
                )}
              </div>
            </div>
          </div>

        
          <div className="profile-header">
            <h1 className="profile-main-title">Profile Details</h1>
            <div className="title-divider"></div>
          </div>

       
          <div className="profile-section">
            <h2 className="profile-section-title">SPECIALTY</h2>
            {isEditing ? (
              <div className="specialty-edit-container">
                {editForm.specialties.map((spec, index) => (
                  <input
                    key={index}
                    type="text"
                    value={spec}
                    onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                    className="edit-input specialty-input"
                    placeholder={`Specialty ${index + 1}`}
                  />
                ))}
              </div>
            ) : (
              <ul className="specialty-list">
                {profile.specialties.map((spec, index) => (
                  <li key={index} className="specialty-item">
                    <span className="specialty-bullet">•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* خط فاصل */}
          <div className="content-divider"></div>

          {/* قسم AWARDS */}
          <div className="profile-section">
            <h2 className="profile-section-title">AWARDS</h2>
            {isEditing ? (
              <input
                type="text"
                name="awards"
                value={editForm.awards}
                onChange={handleInputChange}
                className="edit-input"
                placeholder="Awards"
              />
            ) : (
              <p className="profile-info-text">{profile.awards}</p>
            )}
          </div>

          <div className="content-divider"></div>

         
          <div className="profile-section">
            <h2 className="profile-section-title">OPENING HOURS</h2>
            {isEditing ? (
              <input
                type="text"
                name="workingHours"
                value={editForm.workingHours}
                onChange={handleInputChange}
                className="edit-input"
                placeholder="Working Hours"
              />
            ) : (
              <p className="profile-info-text">{profile.workingHours}</p>
            )}
          </div>

     
          <div className="content-divider"></div>

          <div className="profile-section">
            <h2 className="profile-section-title">EXPERIENCE</h2>
            {isEditing ? (
              <input
                type="text"
                name="experience"
                value={editForm.experience}
                onChange={handleInputChange}
                className="edit-input"
                placeholder="Experience"
              />
            ) : (
              <p className="profile-info-text">{profile.experience}</p>
            )}
          </div>

       
          {isEditing && (
            <div className="edit-buttons-container">
              <button className="save-btn" onClick={handleSaveClick}>Save Changes</button>
              <button className="cancel-btn" onClick={handleCancelClick}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}