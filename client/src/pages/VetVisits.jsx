import { useState, useEffect } from 'react';
import { getVetVisits, getPets, createVetVisit, createVaccination } from '../services/api';
import './VetVisits.css';

function VetVisits() {
  const [visits, setVisits] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [formData, setFormData] = useState({
    Pet_ID: '',
    Visit_Date: new Date().toISOString().split('T')[0],
    Veterinarian_Name: '',
    Visit_Type: 'Checkup',
    Weight: '',
    Temperature: '',
    Diagnosis: '',
    General_Notes: '',
    Procedure_Cost: '',
    Next_Visit_Date: '',
  });
  const [vaccinationData, setVaccinationData] = useState({
    Vaccine_Name: '',
    Date_Administered: new Date().toISOString().split('T')[0],
    Administered_By: '',
    Manufacturer: '',
    Next_Due_Date: '',
    Site: '',
    Reaction: '',
    Cost: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [visitsRes, petsRes] = await Promise.all([
        getVetVisits(),
        getPets(),
      ]);
      setVisits(visitsRes.data);
      setPets(petsRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVaccinationChange = (e) => {
    setVaccinationData({ ...vaccinationData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVetVisit(formData);
      setShowForm(false);
      setFormData({
        Pet_ID: '',
        Visit_Date: new Date().toISOString().split('T')[0],
        Veterinarian_Name: '',
        Visit_Type: 'Checkup',
        Weight: '',
        Temperature: '',
        Diagnosis: '',
        General_Notes: '',
        Procedure_Cost: '',
        Next_Visit_Date: '',
      });
      fetchData();
    } catch (error) {
      alert('Failed to create visit');
    }
  };

  const handleVaccinationSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVaccination({
        ...vaccinationData,
        Visit_ID: selectedVisitId,
      });
      setShowVaccinationForm(false);
      setSelectedVisitId(null);
      setVaccinationData({
        Vaccine_Name: '',
        Date_Administered: new Date().toISOString().split('T')[0],
        Administered_By: '',
        Manufacturer: '',
        Next_Due_Date: '',
        Site: '',
        Reaction: '',
        Cost: '',
      });
      alert('Vaccination added successfully');
    } catch (error) {
      alert('Failed to add vaccination');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="vet-visits-page">
      <div className="page-header">
        <div>
          <h1>Veterinary Visits</h1>
          <p>Track medical records and vaccinations</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          Add New Visit
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>New Veterinary Visit</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Pet *</label>
                  <select name="Pet_ID" value={formData.Pet_ID} onChange={handleChange} required>
                    <option value="">Select Pet</option>
                    {pets.map((pet) => (
                      <option key={pet.Pet_ID} value={pet.Pet_ID}>
                        {pet.Pet_Name} ({pet.Species})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Visit Date *</label>
                  <input type="date" name="Visit_Date" value={formData.Visit_Date} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Veterinarian Name</label>
                  <input type="text" name="Veterinarian_Name" value={formData.Veterinarian_Name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Visit Type *</label>
                  <select name="Visit_Type" value={formData.Visit_Type} onChange={handleChange} required>
                    <option value="Checkup">Checkup</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Treatment">Treatment</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" step="0.01" name="Weight" value={formData.Weight} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Temperature (C)</label>
                  <input type="number" step="0.01" name="Temperature" value={formData.Temperature} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Cost</label>
                  <input type="number" step="0.01" name="Procedure_Cost" value={formData.Procedure_Cost} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Diagnosis</label>
                <textarea name="Diagnosis" value={formData.Diagnosis} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>General Notes</label>
                <textarea name="General_Notes" value={formData.General_Notes} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Next Visit Date</label>
                <input type="date" name="Next_Visit_Date" value={formData.Next_Visit_Date} onChange={handleChange} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Create Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVaccinationForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Vaccination</h2>
            <form onSubmit={handleVaccinationSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Vaccine Name *</label>
                  <input type="text" name="Vaccine_Name" value={vaccinationData.Vaccine_Name} onChange={handleVaccinationChange} required />
                </div>
                <div className="form-group">
                  <label>Date Administered *</label>
                  <input type="date" name="Date_Administered" value={vaccinationData.Date_Administered} onChange={handleVaccinationChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Administered By</label>
                  <input type="text" name="Administered_By" value={vaccinationData.Administered_By} onChange={handleVaccinationChange} />
                </div>
                <div className="form-group">
                  <label>Manufacturer</label>
                  <input type="text" name="Manufacturer" value={vaccinationData.Manufacturer} onChange={handleVaccinationChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Site</label>
                  <input type="text" name="Site" value={vaccinationData.Site} onChange={handleVaccinationChange} placeholder="e.g., Left shoulder" />
                </div>
                <div className="form-group">
                  <label>Cost</label>
                  <input type="number" step="0.01" name="Cost" value={vaccinationData.Cost} onChange={handleVaccinationChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Next Due Date</label>
                <input type="date" name="Next_Due_Date" value={vaccinationData.Next_Due_Date} onChange={handleVaccinationChange} />
              </div>
              <div className="form-group">
                <label>Reaction (if any)</label>
                <textarea name="Reaction" value={vaccinationData.Reaction} onChange={handleVaccinationChange} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowVaccinationForm(false); setSelectedVisitId(null); }}>Cancel</button>
                <button type="submit" className="btn-submit">Add Vaccination</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <div className="visit-actions">
                <button
                  className="btn-vaccination"
                  onClick={() => { setSelectedVisitId(visit.Visit_ID); setShowVaccinationForm(true); }}
                >
                  Add Vaccination
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VetVisits;
