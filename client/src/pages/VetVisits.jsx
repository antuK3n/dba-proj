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
        <div>
          <h1>Veterinary Visits</h1>
          <p>View medical records and vaccinations</p>
        </div>
      </div>

      <div className="visits-list">
        {visits.length === 0 ? (
          <div className="empty-state">
            <p>No veterinary visits recorded yet.</p>
          </div>
        ) : (
          visits.map((visit) => (
            <div key={visit.Visit_ID} className="visit-card">
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
                {visit.Veterinarian_Name && <p><strong>Vet:</strong> {visit.Veterinarian_Name}</p>}
                {visit.Weight && <p><strong>Weight:</strong> {visit.Weight} kg</p>}
                {visit.Temperature && <p><strong>Temp:</strong> {visit.Temperature} C</p>}
                {visit.Diagnosis && <p><strong>Diagnosis:</strong> {visit.Diagnosis}</p>}
                {visit.General_Notes && <p><strong>Notes:</strong> {visit.General_Notes}</p>}
                {visit.Procedure_Cost && <p><strong>Cost:</strong> P{visit.Procedure_Cost}</p>}
                {visit.Next_Visit_Date && (
                  <p><strong>Next Visit:</strong> {new Date(visit.Next_Visit_Date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VetVisits;
