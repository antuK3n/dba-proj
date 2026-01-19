import { useState, useEffect, Fragment } from 'react';
import { Info } from 'lucide-react';
import { getAdminAdoptions, cancelAdoption, completeAdoption, deleteAdminAdoption } from '../../services/adminApi';
import './AdminCommon.css';

function AdminAdoptions() {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this adoption?')) {
      try {
        await cancelAdoption(id);
        fetchAdoptions();
      } catch (error) {
        alert('Failed to cancel adoption');
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
    return a.Status.toLowerCase() === filter;
  });

  if (loading) return <div className="admin-loading">Loading adoptions...</div>;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Adoption Management</h1>
        </div>
      </div>

      <div className="filter-tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          All ({adoptions.length})
        </button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
          Pending ({adoptions.filter(a => a.Status === 'Pending').length})
        </button>
        <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>
          Completed ({adoptions.filter(a => a.Status === 'Completed').length})
        </button>
        <button className={filter === 'cancelled' ? 'active' : ''} onClick={() => setFilter('cancelled')}>
          Cancelled ({adoptions.filter(a => a.Status === 'Cancelled').length})
        </button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Pet</th>
              <th>Adopter</th>
              <th>Contact</th>
              <th>Fee</th>
              <th>Status</th>
              <th>Adoption Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdoptions.map((adoption) => (
              <Fragment key={adoption.Adoption_ID}>
                <tr className={expandedRows.has(adoption.Adoption_ID) ? 'row-expanded' : ''}>
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
                      <br />
                      <span className="text-small">{adoption.Adopter_Email}</span>
                    </div>
                  </td>
                  <td>{adoption.Contact_No || '-'}</td>
                  <td>P{adoption.Adoption_Fee?.toLocaleString() || '0'}</td>
                  <td>
                    <span className={`badge ${adoption.Status.toLowerCase()}`}>
                      {adoption.Status}
                    </span>
                  </td>
                  <td>{adoption.Adoption_Date ? new Date(adoption.Adoption_Date).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className={`btn-info-icon ${expandedRows.has(adoption.Adoption_ID) ? 'active' : ''}`}
                        onClick={() => toggleRowExpansion(adoption.Adoption_ID)}
                        title="More info"
                      >
                        <Info size={16} />
                      </button>
                      {adoption.Status === 'Pending' && (
                        <>
                          <button className="btn-complete" onClick={() => handleComplete(adoption.Adoption_ID)}>Complete</button>
                          <button className="btn-deny" onClick={() => handleCancel(adoption.Adoption_ID)}>Cancel</button>
                        </>
                      )}
                      <button className="btn-delete" onClick={() => handleDelete(adoption.Adoption_ID)}>Delete</button>
                    </div>
                  </td>
                </tr>
                {expandedRows.has(adoption.Adoption_ID) && (
                  <tr className="details-row">
                    <td colSpan="7">
                      <div className="details-content">
                        <div className="detail-item">
                          <span className="detail-label">Application Date</span>
                          <span className="detail-value">{adoption.Application_Date ? new Date(adoption.Application_Date).toLocaleDateString() : 'Not recorded'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Contract Signed</span>
                          <span className="detail-value">{adoption.Contract_Signed || 'No'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Address</span>
                          <span className="detail-value">{adoption.Address || 'Not provided'}</span>
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
    </div>
  );
}

export default AdminAdoptions;
