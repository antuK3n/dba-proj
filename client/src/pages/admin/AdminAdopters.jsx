import { useState, useEffect } from 'react';
import { getAdminAdopters, updateAdminAdopter, deleteAdminAdopter } from '../../services/adminApi';
import './AdminCommon.css';

function AdminAdopters() {
  const [adopters, setAdopters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdopter, setEditingAdopter] = useState(null);
  const [formData, setFormData] = useState({
    Full_Name: '', Contact_No: '', Address: '', Housing_Type: 'House',
    Has_Other_Pets: 'No', Has_Children: 'No', Experience_Level: 'First-time'
  });

  useEffect(() => {
    fetchAdopters();
  }, []);

  const fetchAdopters = async () => {
    try {
      const res = await getAdminAdopters();
      setAdopters(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openEditModal = (adopter) => {
    setEditingAdopter(adopter);
    setFormData({
      Full_Name: adopter.Full_Name, Contact_No: adopter.Contact_No || '',
      Address: adopter.Address || '', Housing_Type: adopter.Housing_Type || 'House',
      Has_Other_Pets: adopter.Has_Other_Pets || 'No',
      Has_Children: adopter.Has_Children || 'No',
      Experience_Level: adopter.Experience_Level || 'First-time'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAdminAdopter(editingAdopter.Adopter_ID, formData);
      setShowModal(false);
      fetchAdopters();
    } catch (error) {
      alert('Failed to update adopter');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this adopter? This will also delete their adoptions and favorites.')) {
      try {
        await deleteAdminAdopter(id);
        fetchAdopters();
      } catch (error) {
        alert('Failed to delete adopter');
      }
    }
  };

  if (loading) return <div className="admin-loading">Loading adopters...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Adopter Management</h1>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Housing</th>
              <th>Experience</th>
              <th>Adoptions</th>
              <th>Favorites</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adopters.map((adopter) => (
              <tr key={adopter.Adopter_ID}>
                <td><strong>{adopter.Full_Name}</strong></td>
                <td>{adopter.Email}</td>
                <td>{adopter.Contact_No || '-'}</td>
                <td>{adopter.Housing_Type || '-'}</td>
                <td>{adopter.Experience_Level}</td>
                <td>
                  <span className="count-badge">{adopter.adoption_count}</span>
                </td>
                <td>
                  <span className="count-badge">{adopter.favorites_count}</span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn-edit" onClick={() => openEditModal(adopter)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(adopter.Adopter_ID)}>Delete</button>
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
            <h2>Edit Adopter</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="Full_Name" value={formData.Full_Name} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="text" name="Contact_No" value={formData.Contact_No} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Housing Type</label>
                  <select name="Housing_Type" value={formData.Housing_Type} onChange={handleChange}>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="Farm">Farm</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" name="Address" value={formData.Address} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Has Other Pets</label>
                  <select name="Has_Other_Pets" value={formData.Has_Other_Pets} onChange={handleChange}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Has Children</label>
                  <select name="Has_Children" value={formData.Has_Children} onChange={handleChange}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Experience Level</label>
                <select name="Experience_Level" value={formData.Experience_Level} onChange={handleChange}>
                  <option value="First-time">First-time</option>
                  <option value="Experienced">Experienced</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAdopters;
