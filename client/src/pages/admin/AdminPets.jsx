import { useState, useEffect, Fragment, useRef } from 'react';
import { Info, Upload, X } from 'lucide-react';
import { getAdminPets, createAdminPet, updateAdminPet, deleteAdminPet } from '../../services/adminApi';
import { getSpecies, uploadImage } from '../../services/api';
import './AdminCommon.css';

function AdminPets() {
  const [pets, setPets] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [filters, setFilters] = useState({ species: '', status: '', search: '' });
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
    Pet_Name: '', Species: '', Breed: '', Age: '', Gender: 'Male',
    Color: '', Date_Arrived: new Date().toISOString().split('T')[0],
    Spayed_Neutered: 'No', Temperament: '',
    Special_Needs: '', Photo_URL: '', Status: 'Available'
  });

  useEffect(() => {
    fetchSpecies();
  }, []);

  useEffect(() => {
    fetchPets();
  }, [filters]);

  const fetchSpecies = async () => {
    try {
      const res = await getSpecies();
      setSpeciesList(res.data);
    } catch (error) {
      console.error('Error fetching species:', error);
    }
  };

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

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadImage(file);
      setFormData({ ...formData, Photo_URL: res.data.url });
    } catch (error) {
      alert('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setFormData({ ...formData, Photo_URL: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openAddModal = () => {
    setEditingPet(null);
    setFormData({
      Pet_Name: '', Species: '', Breed: '', Age: '', Gender: 'Male',
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

  const formatAge = (age) => {
    if (!age) return age;
    const trimmed = age.trim();
    // If it's just a number, add "year" or "years"
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed);
      return num === 1 ? '1 year' : `${num} years`;
    }
    return trimmed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        Age: formatAge(formData.Age)
      };
      if (editingPet) {
        await updateAdminPet(editingPet.Pet_ID, dataToSubmit);
      } else {
        await createAdminPet(dataToSubmit);
      }
      setShowModal(false);
      fetchPets();
      fetchSpecies(); // Refresh species list in case a new one was added
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
          {speciesList.map((species) => (
            <option key={species} value={species}>{species}s</option>
          ))}
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
              <Fragment key={pet.Pet_ID}>
                <tr className={expandedRows.has(pet.Pet_ID) ? 'row-expanded' : ''}>
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
                      <button
                        className={`btn-info-icon ${expandedRows.has(pet.Pet_ID) ? 'active' : ''}`}
                        onClick={() => toggleRowExpansion(pet.Pet_ID)}
                        title="More info"
                      >
                        <Info size={16} />
                      </button>
                      <button className="btn-edit" onClick={() => openEditModal(pet)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(pet.Pet_ID)}>Delete</button>
                    </div>
                  </td>
                </tr>
                {expandedRows.has(pet.Pet_ID) && (
                  <tr className="details-row">
                    <td colSpan="8">
                      <div className="details-content">
                        <div className="detail-item">
                          <span className="detail-label">Color</span>
                          <span className="detail-value">{pet.Color || 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Date Arrived</span>
                          <span className="detail-value">{pet.Date_Arrived ? new Date(pet.Date_Arrived).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Spayed/Neutered</span>
                          <span className="detail-value">{pet.Spayed_Neutered || 'Unknown'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Temperament</span>
                          <span className="detail-value">{pet.Temperament || 'Not assessed'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Special Needs</span>
                          <span className="detail-value">{pet.Special_Needs || 'None'}</span>
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
            <h2>{editingPet ? 'Edit Pet' : 'Add New Pet'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" name="Pet_Name" value={formData.Pet_Name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Species *</label>
                  <input type="text" name="Species" value={formData.Species} onChange={handleChange} required placeholder="e.g., Dog, Cat, Bird, Rabbit" />
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
                <label>Photo</label>
                {formData.Photo_URL ? (
                  <div className="image-preview-container">
                    <img
                      src={formData.Photo_URL}
                      alt="Preview"
                      className="image-preview"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=Error'; }}
                    />
                    <button type="button" className="btn-clear-image" onClick={clearImage}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`drop-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <Upload size={32} />
                    {uploading ? (
                      <p>Uploading...</p>
                    ) : (
                      <>
                        <p>Drag & drop an image here</p>
                        <span>or click to browse</span>
                      </>
                    )}
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
