import { useState, useEffect, Fragment } from 'react';
import { Info, Pencil, Check, X } from 'lucide-react';
import { getAdminAdoptions, updateAdoption, cancelAdoption, completeAdoption, returnAdoption, deleteAdminAdoption } from '../../services/adminApi';
import './AdminCommon.css';

function AdminAdoptions() {
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [editingFee, setEditingFee] = useState(null);
  const [feeValue, setFeeValue] = useState('');

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

  const handleReturn = async (id) => {
    if (window.confirm('Are you sure you want to mark this adoption as returned? The pet will be set back to Available.')) {
      try {
        await returnAdoption(id);
        fetchAdoptions();
      } catch (error) {
        alert('Failed to return adoption');
      }
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

  const startEditFee = (adoption) => {
    setEditingFee(adoption.Adoption_ID);
    setFeeValue(adoption.Adoption_Fee || '');
  };

  const cancelEditFee = () => {
    setEditingFee(null);
    setFeeValue('');
  };

  const saveFee = async (id) => {
    try {
      await updateAdoption(id, { Adoption_Fee: parseFloat(feeValue) || 0 });
      setEditingFee(null);
      setFeeValue('');
      fetchAdoptions();
    } catch (error) {
      alert('Failed to update fee');
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
        <button className={filter === 'returned' ? 'active' : ''} onClick={() => setFilter('returned')}>
          Returned ({adoptions.filter(a => a.Status === 'Returned').length})
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
                  <td>
                    {editingFee === adoption.Adoption_ID ? (
                      <div className="inline-edit">
                        <input
                          type="number"
                          value={feeValue}
                          onChange={(e) => setFeeValue(e.target.value)}
                          className="fee-input"
                          autoFocus
                        />
                        <button className="btn-icon-sm btn-save" onClick={() => saveFee(adoption.Adoption_ID)} title="Save">
                          <Check size={14} />
                        </button>
                        <button className="btn-icon-sm btn-cancel" onClick={cancelEditFee} title="Cancel">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="fee-display">
                        <span>P{adoption.Adoption_Fee?.toLocaleString() || '0'}</span>
                        {adoption.Status === 'Pending' && (
                          <button className="btn-icon-sm btn-edit" onClick={() => startEditFee(adoption)} title="Edit fee">
                            <Pencil size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
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
                      {adoption.Status === 'Completed' && (
                        <button className="btn-return" onClick={() => handleReturn(adoption.Adoption_ID)}>Return</button>
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
