import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdoptions } from '../services/api';
import './Adoptions.css';

function Adoptions() {
  const { user } = useAuth();
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchAdoptions();
    }
  }, [user]);

  const fetchAdoptions = async () => {
    try {
      const res = await getAdoptions({ adopter_id: user.Adopter_ID });
      setAdoptions(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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
        <h1>My Adoptions</h1>
        <p>Track the status of your adoption applications</p>
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
        <button
          className={filter === 'returned' ? 'active' : ''}
          onClick={() => setFilter('returned')}
        >
          Returned ({adoptions.filter(a => a.Status === 'Returned').length})
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
