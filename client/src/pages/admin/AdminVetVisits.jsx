import { useState, useEffect } from 'react';
import { getAdminVetVisits, createAdminVetVisit, updateAdminVetVisit, deleteAdminVetVisit, getAdminPets } from '../../services/adminApi';
import './AdminCommon.css';

function AdminVetVisits() {
  const [visits, setVisits] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [formData, setFormData] = useState({
    Pet_ID: '', Visit_Date: new Date().toISOString().split('T')[0],
    Veterinarian_Name: '', Visit_Type: 'Checkup', Weight: '', Temperature: '',
    Diagnosis: '', General_Notes: '', Procedure_Cost: '', Next_Visit_Date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [visitsRes, petsRes] = await Promise.all([
        getAdminVetVisits(),
        getAdminPets()
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

  const openAddModal = () => {
    setEditingVisit(null);
    setFormData({
      Pet_ID: '', Visit_Date: new Date().toISOString().split('T')[0],
      Veterinarian_Name: '', Visit_Type: 'Checkup', Weight: '', Temperature: '',
      Diagnosis: '', General_Notes: '', Procedure_Cost: '', Next_Visit_Date: ''
    });
    setShowModal(true);
  };

  const openEditModal = (visit) => {
    setEditingVisit(visit);
    setFormData({
      Pet_ID: visit.Pet_ID, Visit_Date: visit.Visit_Date?.split('T')[0] || '',
      Veterinarian_Name: visit.Veterinarian_Name || '', Visit_Type: visit.Visit_Type,
      Weight: visit.Weight || '', Temperature: visit.Temperature || '',
      Diagnosis: visit.Diagnosis || '', General_Notes: visit.General_Notes || '',
      Procedure_Cost: visit.Procedure_Cost || '', Next_Visit_Date: visit.Next_Visit_Date?.split('T')[0] || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVisit) {
        await updateAdminVetVisit(editingVisit.Visit_ID, formData);
      } else {
        await createAdminVetVisit(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to save vet visit');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vet visit? Related vaccinations will also be deleted.')) {
      try {
        await deleteAdminVetVisit(id);
        fetchData();
      } catch (error) {
        alert('Failed to delete vet visit');
      }
    }
  };

  if (loading) return <div className="admin-loading">Loading vet visits...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Vet Visits Management</h1>
          <p>Track and manage veterinary visits</p>
        </div>
        <button className="btn-add" onClick={openAddModal}>Add Visit</button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Pet</th>
              <th>Date</th>
              <th>Type</th>
              <th>Veterinarian</th>
              <th>Weight</th>
              <th>Diagnosis</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr key={visit.Visit_ID}>
                <td>
                  <strong>{visit.Pet_Name}</strong>
                  <br />
                  <span className="text-small">{visit.Species}</span>
                </td>
                <td>{new Date(visit.Visit_Date).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${visit.Visit_Type.toLowerCase()}`}>
                    {visit.Visit_Type}
                  </span>
                </td>
                <td>{visit.Veterinarian_Name || '-'}</td>
                <td>{visit.Weight ? `${visit.Weight} kg` : '-'}</td>
                <td className="truncate">{visit.Diagnosis || '-'}</td>
                <td>P{visit.Procedure_Cost?.toLocaleString() || '0'}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn-edit" onClick={() => openEditModal(visit)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(visit.Visit_ID)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingVisit ? 'Edit Vet Visit' : 'Add Vet Visit'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Pet *</label>
                  <select name="Pet_ID" value={formData.Pet_ID} onChange={handleChange} required disabled={!!editingVisit}>
                    <option value="">Select Pet</option>
                    {pets.map((pet) => (
                      <option key={pet.Pet_ID} value={pet.Pet_ID}>{pet.Pet_Name} ({pet.Species})</option>
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
                  <label>Visit Type *</label>
                  <select name="Visit_Type" value={formData.Visit_Type} onChange={handleChange} required>
                    <option value="Checkup">Checkup</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Treatment">Treatment</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Veterinarian</label>
                  <input type="text" name="Veterinarian_Name" value={formData.Veterinarian_Name} onChange={handleChange} />
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
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">{editingVisit ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVetVisits;
