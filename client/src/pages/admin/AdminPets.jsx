import { useState, useEffect } from 'react';
import { getAdminPets, createAdminPet, updateAdminPet, deleteAdminPet } from '../../services/adminApi';
import './AdminCommon.css';

function AdminPets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [filters, setFilters] = useState({ species: '', status: '', search: '' });
  const [formData, setFormData] = useState({
    Pet_Name: '', Species: 'Dog', Breed: '', Age: '', Gender: 'Male',
    Color: '', Date_Arrived: new Date().toISOString().split('T')[0],
    Spayed_Neutered: 'No', Temperament: '',
    Special_Needs: '', Photo_URL: '', Status: 'Available'
  });

  useEffect(() => {
    fetchPets();
  }, [filters]);

  const fetchPets = async () => {
    try {
      const res = await getAdminPets(filters);
      setPets(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingPet(null);
    setFormData({
      Pet_Name: '', Species: 'Dog', Breed: '', Age: '', Gender: 'Male',
      Color: '', Date_Arrived: new Date().toISOString().split('T')[0],
      Spayed_Neutered: 'No', Temperament: '',
      Special_Needs: '', Photo_URL: '', Status: 'Available'
    });
    setShowModal(true);
  };

  const openEditModal = (pet) => {
    setEditingPet(pet);
    setFormData({
      Pet_Name: pet.Pet_Name, Species: pet.Species, Breed: pet.Breed || '',
      Age: pet.Age || '', Gender: pet.Gender, Color: pet.Color || '',
      Date_Arrived: pet.Date_Arrived?.split('T')[0] || '',
      Spayed_Neutered: pet.Spayed_Neutered,
      Temperament: pet.Temperament || '', Special_Needs: pet.Special_Needs || '',
      Photo_URL: pet.Photo_URL || '', Status: pet.Status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPet) {
        await updateAdminPet(editingPet.Pet_ID, formData);
      } else {
        await createAdminPet(formData);
      }
      setShowModal(false);
      fetchPets();
    } catch (error) {
      alert('Failed to save pet');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await deleteAdminPet(id);
        fetchPets();
      } catch (error) {
        alert('Failed to delete pet');
      }
    }
  };

  if (loading) return <div className="admin-loading">Loading pets...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Pet Management</h1>
        </div>
        <button className="btn-add" onClick={openAddModal}>Add Pet</button>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          name="search"
          placeholder="Search by name or breed..."
          value={filters.search}
          onChange={handleFilterChange}
        />
        <select name="species" value={filters.species} onChange={handleFilterChange}>
          <option value="">All Species</option>
          <option value="Dog">Dogs</option>
          <option value="Cat">Cats</option>
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Adopted">Adopted</option>
          <option value="Reserved">Reserved</option>
          <option value="Medical Hold">Medical Hold</option>
        </select>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Species</th>
              <th>Breed</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pets.map((pet) => (
              <tr key={pet.Pet_ID}>
                <td>
                  <img
                    src={pet.Photo_URL || 'https://via.placeholder.com/50?text=Pet'}
                    alt={pet.Pet_Name}
                    className="table-img"
                  />
                </td>
                <td><strong>{pet.Pet_Name}</strong></td>
                <td>{pet.Species}</td>
                <td>{pet.Breed}</td>
                <td>{pet.Age}</td>
                <td>{pet.Gender}</td>
                <td>
                  <span className={`badge ${pet.Status.toLowerCase().replace(' ', '-')}`}>
                    {pet.Status}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn-edit" onClick={() => openEditModal(pet)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(pet.Pet_ID)}>Delete</button>
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
            <h2>{editingPet ? 'Edit Pet' : 'Add New Pet'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" name="Pet_Name" value={formData.Pet_Name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Species *</label>
                  <select name="Species" value={formData.Species} onChange={handleChange} required>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Breed</label>
                  <input type="text" name="Breed" value={formData.Breed} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="text" name="Age" value={formData.Age} onChange={handleChange} placeholder="e.g., 2 years" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Gender *</label>
                  <select name="Gender" value={formData.Gender} onChange={handleChange} required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input type="text" name="Color" value={formData.Color} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date Arrived *</label>
                  <input type="date" name="Date_Arrived" value={formData.Date_Arrived} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="Status" value={formData.Status} onChange={handleChange}>
                    <option value="Available">Available</option>
                    <option value="Adopted">Adopted</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Medical Hold">Medical Hold</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Spayed/Neutered</label>
                <select name="Spayed_Neutered" value={formData.Spayed_Neutered} onChange={handleChange}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Temperament</label>
                <input type="text" name="Temperament" value={formData.Temperament} onChange={handleChange} placeholder="e.g., Friendly, Playful" />
              </div>
              <div className="form-group">
                <label>Photo URL</label>
                <input type="text" name="Photo_URL" value={formData.Photo_URL} onChange={handleChange} placeholder="Paste image URL here" />
                {formData.Photo_URL && (
                  <div className="photo-preview" style={{ marginTop: '0.5rem' }}>
                    <img
                      src={formData.Photo_URL}
                      alt="Preview"
                      style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Special Needs</label>
                <textarea name="Special_Needs" value={formData.Special_Needs} onChange={handleChange} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit">{editingPet ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPets;
