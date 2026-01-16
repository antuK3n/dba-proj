import { useState, useEffect } from 'react';
import { getVetVisits } from '../services/api';
import './VetVisits.css';

function VetVisits() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const visitsRes = await getVetVisits();
      setVisits(visitsRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="vet-visits-page">
      <div className="page-header">
        <h1>Veterinary Visits</h1>
        <p className="page-subtitle">View medical records and vaccinations</p>
      </div>

      <div className="visits-list">
        {visits.length === 0 ? (
          <div className="empty-state">
            <p>No veterinary visits recorded yet.</p>
          </div>
        ) : (
          visits.map((visit) => (
            <div key={visit.Visit_ID} className="visit-card">
              <div className="visit-image">
                <img
                  src={visit.Photo_URL || 'https://via.placeholder.com/150?text=Pet'}
                  alt={visit.Pet_Name}
                />
              </div>
              <div className="visit-content">
                <div className="visit-header">
                  <div className="pet-info">
                    <h3>{visit.Pet_Name}</h3>
                    <span>{visit.Species} - {visit.Breed}</span>
                  </div>
                  <div className="visit-meta">
                    <span className={`visit-type ${visit.Visit_Type.toLowerCase()}`}>
                      {visit.Visit_Type}
                    </span>
                    <span className="visit-date">
                      {new Date(visit.Visit_Date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="visit-details">
                  {visit.Veterinarian_Name && (
                    <div className="visit-detail-item">
                      <span className="label">Vet</span>
                      <span className="value">{visit.Veterinarian_Name}</span>
                    </div>
                  )}
                  {visit.Weight && (
                    <div className="visit-detail-item">
                      <span className="label">Weight</span>
                      <span className="value">{visit.Weight} kg</span>
                    </div>
                  )}
                  {visit.Temperature && (
                    <div className="visit-detail-item">
                      <span className="label">Temp</span>
                      <span className="value">{visit.Temperature} C</span>
                    </div>
                  )}
                  {visit.Diagnosis && (
                    <div className="visit-detail-item">
                      <span className="label">Diagnosis</span>
                      <span className="value">{visit.Diagnosis}</span>
                    </div>
                  )}
                  {visit.General_Notes && (
                    <div className="visit-detail-item">
                      <span className="label">Notes</span>
                      <span className="value">{visit.General_Notes}</span>
                    </div>
                  )}
                  {visit.Procedure_Cost && (
                    <div className="visit-detail-item">
                      <span className="label">Cost</span>
                      <span className="value">P{visit.Procedure_Cost}</span>
                    </div>
                  )}
                  {visit.Next_Visit_Date && (
                    <div className="visit-detail-item">
                      <span className="label">Next Visit</span>
                      <span className="value">{new Date(visit.Next_Visit_Date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VetVisits;
