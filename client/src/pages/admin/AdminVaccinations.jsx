import { useState, useEffect, Fragment } from 'react';
import { Info } from 'lucide-react';
import { getAdminVaccinations, createAdminVaccination, updateAdminVaccination, deleteAdminVaccination, getAdminVetVisits } from '../../services/adminApi';
import './AdminCommon.css';

function AdminVaccinations() {
  const [vaccinations, setVaccinations] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  const [formData, setFormData] = useState({
    Visit_ID: '', Vaccine_Name: '', Date_Administered: new Date().toISOString().split('T')[0],
    Administered_By: '', Manufacturer: '', Next_Due_Date: '', Site: '',
    Reaction: '', Status: 'Completed', Cost: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vaccRes, visitsRes] = await Promise.all([
        getAdminVaccinations(),
        getAdminVetVisits()
      ]);
      setVaccinations(vaccRes.data);
      setVisits(visitsRes.data);
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
    setEditingVaccination(null);
    setFormData({
      Visit_ID: '', Vaccine_Name: '', Date_Administered: new Date().toISOString().split('T')[0],
      Administered_By: '', Manufacturer: '', Next_Due_Date: '', Site: '',
      Reaction: '', Status: 'Completed', Cost: ''
    });
    setShowModal(true);
  };

  const openEditModal = (vacc) => {
    setEditingVaccination(vacc);
    setFormData({
      Visit_ID: vacc.Visit_ID, Vaccine_Name: vacc.Vaccine_Name,
      Date_Administered: vacc.Date_Administered?.split('T')[0] || '',
      Administered_By: vacc.Administered_By || '', Manufacturer: vacc.Manufacturer || '',
      Next_Due_Date: vacc.Next_Due_Date?.split('T')[0] || '', Site: vacc.Site || '',
      Reaction: vacc.Reaction || '', Status: vacc.Status, Cost: vacc.Cost || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVaccination) {
        await updateAdminVaccination(editingVaccination.Vaccination_ID, formData);
      } else {
        await createAdminVaccination(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to save vaccination');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vaccination record?')) {
      try {
        await deleteAdminVaccination(id);
        fetchData();
      } catch (error) {
        alert('Failed to delete vaccination');
      }
    }
  };

  if (loading) return <div className="admin-loading">Loading vaccinations...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Vaccination Management</h1>
        </div>
        <button className="btn-add" onClick={openAddModal}>Add Vaccination</button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Pet</th>
              <th>Vaccine</th>
              <th>Date</th>
              <th>Administered By</th>
              <th>Next Due</th>
              <th>Status</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vaccinations.map((vacc) => (
              <Fragment key={vacc.Vaccination_ID}>
                <tr className={expandedRows.has(vacc.Vaccination_ID) ? 'row-expanded' : ''}>
                  <td>
                    <strong>{vacc.Pet_Name}</strong>
                    <br />
                    <span className="text-small">{vacc.Species}</span>
                  </td>
                  <td>{vacc.Vaccine_Name}</td>
                  <td>{new Date(vacc.Date_Administered).toLocaleDateString()}</td>
                  <td>{vacc.Administered_By || '-'}</td>
                  <td>{vacc.Next_Due_Date ? new Date(vacc.Next_Due_Date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`badge ${vacc.Status.toLowerCase()}`}>
                      {vacc.Status}
                    </span>
                  </td>
                  <td>P{vacc.Cost?.toLocaleString() || '0'}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className={`btn-info-icon ${expandedRows.has(vacc.Vaccination_ID) ? 'active' : ''}`}
                        onClick={() => toggleRowExpansion(vacc.Vaccination_ID)}
                        title="More info"
                      >
                        <Info size={16} />
                      </button>
                      <button className="btn-edit" onClick={() => openEditModal(vacc)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(vacc.Vaccination_ID)}>Delete</button>
                    </div>
                  </td>
                </tr>
                {expandedRows.has(vacc.Vaccination_ID) && (
                  <tr className="details-row">
                    <td colSpan="8">
                      <div className="details-content">
                        <div className="detail-item">
                          <span className="detail-label">Injection Site</span>
                          <span className="detail-value">{vacc.Site || 'Not recorded'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Reaction</span>
                          <span className="detail-value">{vacc.Reaction || 'None reported'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Manufacturer</span>
                          <span className="detail-value">{vacc.Manufacturer || 'Not specified'}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingVaccination ? 'Edit Vaccination' : 'Add Vaccination'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Vet Visit *</label>
                  <select name="Visit_ID" value={formData.Visit_ID} onChange={handleChange} required disabled={!!editingVaccination}>
                    <option value="">Select Visit</option>
                    {visits.map((visit) => (
                      <option key={visit.Visit_ID} value={visit.Visit_ID}>
                        {visit.Pet_Name} - {new Date(visit.Visit_Date).toLocaleDateString()} ({visit.Visit_Type})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Vaccine Name *</label>
                  <input type="text" name="Vaccine_Name" value={formData.Vaccine_Name} onChange={handleChange} required placeholder="e.g., Rabies, DHPP" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date Administered</label>
                  <input type="date" name="Date_Administered" value={formData.Date_Administered} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Next Due Date</label>
                  <input type="date" name="Next_Due_Date" value={formData.Next_Due_Date} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Administered By</label>
                  <input type="text" name="Administered_By" value={formData.Administered_By} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Manufacturer</label>
                  <input type="text" name="Manufacturer" value={formData.Manufacturer} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Injection Site</label>
                  <input type="text" name="Site" value={formData.Site} onChange={handleChange} placeholder="e.g., Left shoulder" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="Status" value={formData.Status} onChange={handleChange}>
                    <option value="Completed">Completed</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cost</label>
                  <input type="number" step="0.01" name="Cost" value={formData.Cost} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Reaction (if any)</label>
                <textarea name="Reaction" value={formData.Reaction} onChange={handleChange} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">{editingVaccination ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVaccinations;
