import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdoptions, updateAdoption } from '../services/api';
import './Adoptions.css';

function Adoptions() {
  const { user } = useAuth();
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAdoptions();
  }, []);

  const fetchAdoptions = async () => {
    try {
      const res = await getAdoptions();
      setAdoptions(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateAdoption(id, {
        Status: status,
        Adoption_Date: status === 'Completed' ? new Date().toISOString().split('T')[0] : null,
        Contract_Signed: status === 'Completed' ? 'Yes' : 'No',
      });
      fetchAdoptions();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const filteredAdoptions = adoptions.filter((a) => {
    if (filter === 'all') return true;
    return a.Status.toLowerCase() === filter;
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="adoptions-page">
      <div className="page-header">
        <h1>Adoption Applications</h1>
        <p>Manage and track all adoption applications</p>
      </div>

      <div className="filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({adoptions.length})
        </button>
        <button
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Pending ({adoptions.filter(a => a.Status === 'Pending').length})
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed ({adoptions.filter(a => a.Status === 'Completed').length})
        </button>
        <button
          className={filter === 'cancelled' ? 'active' : ''}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled ({adoptions.filter(a => a.Status === 'Cancelled').length})
        </button>
      </div>

      {filteredAdoptions.length === 0 ? (
        <div className="empty-state">
          <p>No applications found.</p>
        </div>
      ) : (
        <div className="adoptions-table">
          <table>
            <thead>
              <tr>
                <th>Pet</th>
                <th>Adopter</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Adoption Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdoptions.map((adoption) => (
                <tr key={adoption.Adoption_ID}>
                  <td>
                    <div className="pet-cell">
                      <img
                        src={adoption.Photo_URL || 'https://via.placeholder.com/50?text=Pet'}
                        alt={adoption.Pet_Name}
                      />
                      <div>
                        <strong>{adoption.Pet_Name}</strong>
                        <span>{adoption.Species} - {adoption.Breed}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="adopter-cell">
                      <strong>{adoption.Adopter_Name}</strong>
                      <span>{adoption.Adopter_Email}</span>
                    </div>
                  </td>
                  <td>P{adoption.Adoption_Fee?.toLocaleString() || '0'}</td>
                  <td>
                    <span className={`status-badge ${adoption.Status.toLowerCase()}`}>
                      {adoption.Status}
                    </span>
                  </td>
                  <td>
                    {adoption.Adoption_Date
                      ? new Date(adoption.Adoption_Date).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <div className="actions">
                      {adoption.Status === 'Pending' && (
                        <>
                          <button
                            className="btn-complete"
                            onClick={() => handleStatusUpdate(adoption.Adoption_ID, 'Completed')}
                          >
                            Complete
                          </button>
                          <button
                            className="btn-deny"
                            onClick={() => handleStatusUpdate(adoption.Adoption_ID, 'Cancelled')}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <Link to={`/pets/${adoption.Pet_ID}`} className="btn-view">
                        View Pet
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Adoptions;
