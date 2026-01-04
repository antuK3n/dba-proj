import { useState, useEffect } from 'react';
import { getAdminAdoptions, approveAdoption, denyAdoption, completeAdoption, deleteAdminAdoption } from '../../services/adminApi';
import './AdminCommon.css';

function AdminAdoptions() {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAdoptions();
  }, []);

  const fetchAdoptions = async () => {
    try {
      const res = await getAdminAdoptions();
      setAdoptions(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveAdoption(id);
      fetchAdoptions();
    } catch (error) {
      alert('Failed to approve adoption');
    }
  };

  const handleDeny = async (id) => {
    if (window.confirm('Are you sure you want to deny this adoption?')) {
      try {
        await denyAdoption(id);
        fetchAdoptions();
      } catch (error) {
        alert('Failed to deny adoption');
      }
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeAdoption(id);
      fetchAdoptions();
    } catch (error) {
      alert('Failed to complete adoption');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this adoption record?')) {
      try {
        await deleteAdminAdoption(id);
        fetchAdoptions();
      } catch (error) {
        alert('Failed to delete adoption');
      }
    }
  };

  const filteredAdoptions = adoptions.filter((a) => {
    if (filter === 'all') return true;
    return a.Approval_Status.toLowerCase() === filter;
  });

  if (loading) return <div className="admin-loading">Loading adoptions...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Adoption Management</h1>
          <p>Review and manage adoption applications</p>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          All ({adoptions.length})
        </button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
          Pending ({adoptions.filter(a => a.Approval_Status === 'Pending').length})
        </button>
        <button className={filter === 'approved' ? 'active' : ''} onClick={() => setFilter('approved')}>
          Approved ({adoptions.filter(a => a.Approval_Status === 'Approved').length})
        </button>
        <button className={filter === 'denied' ? 'active' : ''} onClick={() => setFilter('denied')}>
          Denied ({adoptions.filter(a => a.Approval_Status === 'Denied').length})
        </button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Pet</th>
              <th>Adopter</th>
              <th>Contact</th>
              <th>Applied</th>
              <th>Fee</th>
              <th>Approval</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdoptions.map((adoption) => (
              <tr key={adoption.Adoption_ID}>
                <td>
                  <div className="cell-with-img">
                    <img
                      src={adoption.Photo_URL || 'https://via.placeholder.com/40?text=Pet'}
                      alt={adoption.Pet_Name}
                      className="table-img-sm"
                    />
                    <div>
                      <strong>{adoption.Pet_Name}</strong>
                      <span>{adoption.Species}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <strong>{adoption.Adopter_Name}</strong>
                    <span className="text-small">{adoption.Adopter_Email}</span>
                  </div>
                </td>
                <td>{adoption.Contact_No || '-'}</td>
                <td>{new Date(adoption.Application_Date).toLocaleDateString()}</td>
                <td>P{adoption.Adoption_Fee?.toLocaleString() || '0'}</td>
                <td>
                  <span className={`badge ${adoption.Approval_Status.toLowerCase()}`}>
                    {adoption.Approval_Status}
                  </span>
                </td>
                <td>
                  <span className={`badge ${adoption.Status.toLowerCase()}`}>
                    {adoption.Status}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    {adoption.Approval_Status === 'Pending' && (
                      <>
                        <button className="btn-approve" onClick={() => handleApprove(adoption.Adoption_ID)}>Approve</button>
                        <button className="btn-deny" onClick={() => handleDeny(adoption.Adoption_ID)}>Deny</button>
                      </>
                    )}
                    {adoption.Approval_Status === 'Approved' && adoption.Status !== 'Completed' && (
                      <button className="btn-complete" onClick={() => handleComplete(adoption.Adoption_ID)}>Complete</button>
                    )}
                    <button className="btn-delete" onClick={() => handleDelete(adoption.Adoption_ID)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminAdoptions;
