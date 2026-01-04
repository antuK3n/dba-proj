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

  const handleStatusUpdate = async (id, status, approvalStatus) => {
    try {
      await updateAdoption(id, {
        Status: status,
        Approval_Status: approvalStatus,
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
    return a.Approval_Status.toLowerCase() === filter;
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
          Pending ({adoptions.filter(a => a.Approval_Status === 'Pending').length})
        </button>
        <button
          className={filter === 'approved' ? 'active' : ''}
          onClick={() => setFilter('approved')}
        >
          Approved ({adoptions.filter(a => a.Approval_Status === 'Approved').length})
        </button>
        <button
          className={filter === 'denied' ? 'active' : ''}
          onClick={() => setFilter('denied')}
        >
          Denied ({adoptions.filter(a => a.Approval_Status === 'Denied').length})
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
                <th>Application Date</th>
                <th>Status</th>
                <th>Approval</th>
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
                  <td>{new Date(adoption.Application_Date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${adoption.Status.toLowerCase()}`}>
                      {adoption.Status}
                    </span>
                  </td>
                  <td>
                    <span className={`approval-badge ${adoption.Approval_Status.toLowerCase()}`}>
                      {adoption.Approval_Status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      {adoption.Approval_Status === 'Pending' && (
                        <>
                          <button
                            className="btn-approve"
                            onClick={() => handleStatusUpdate(adoption.Adoption_ID, 'Applied', 'Approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn-deny"
                            onClick={() => handleStatusUpdate(adoption.Adoption_ID, 'Cancelled', 'Denied')}
                          >
                            Deny
                          </button>
                        </>
                      )}
                      {adoption.Approval_Status === 'Approved' && adoption.Status !== 'Completed' && (
                        <button
                          className="btn-complete"
                          onClick={() => handleStatusUpdate(adoption.Adoption_ID, 'Completed', 'Approved')}
                        >
                          Complete
                        </button>
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
