import { useState, useEffect } from 'react';
import { getAdoptionReport, getMonthlyStats } from '../../services/adminApi';
import './AdminCommon.css';
import './AdminReports.css';

function AdminReports() {
  const [activeTab, setActiveTab] = useState('report');
  const [adoptionReport, setAdoptionReport] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (activeTab === 'report') fetchAdoptionReport();
    if (activeTab === 'stats') fetchMonthlyStats();
  }, [activeTab, selectedYear, selectedMonth]);

  const fetchAdoptionReport = async () => {
    setLoading(true);
    try {
      const res = await getAdoptionReport();
      setAdoptionReport(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyStats = async () => {
    setLoading(true);
    try {
      const res = await getMonthlyStats(selectedYear, selectedMonth);
      setMonthlyStats(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
        </div>
      </div>

      <div className="report-tabs">
        <button
          className={`report-tab ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          Adoption Report
        </button>
        <button
          className={`report-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Monthly Statistics
        </button>
      </div>

      {loading && <div className="admin-loading">Loading...</div>}

      {/* Adoption Management Report */}
      {activeTab === 'report' && !loading && (
        <div className="report-section">
          <div className="report-header">
            <h2>Adoption Management Report</h2>
          </div>

          {adoptionReport.length === 0 ? (
            <div className="no-data">No adoption records</div>
          ) : (
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Applied</th>
                    <th>Pet</th>
                    <th>Adopter</th>
                    <th>Housing</th>
                    <th>Experience</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Completed</th>
                    <th>Contract</th>
                  </tr>
                </thead>
                <tbody>
                  {adoptionReport.map((record) => (
                    <tr key={record.Adoption_ID}>
                      <td>#{record.Adoption_ID}</td>
                      <td>{formatDate(record.Application_Date)}</td>
                      <td>
                        <strong>{record.Pet_Name}</strong>
                        <br />
                        <span className="text-small">{record.Species} - {record.Breed}</span>
                      </td>
                      <td>
                        <strong>{record.Full_Name}</strong>
                        <br />
                        <span className="text-small">{record.Email}</span>
                      </td>
                      <td>{record.Housing_Type}</td>
                      <td>{record.Experience_Level}</td>
                      <td>P{record.Adoption_Fee?.toLocaleString() || '0'}</td>
                      <td>
                        <span className={`badge ${record.Status.toLowerCase()}`}>
                          {record.Status}
                        </span>
                      </td>
                      <td>{formatDate(record.Adoption_Date)}</td>
                      <td>{record.Contract_Signed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Monthly Adoption Statistics */}
      {activeTab === 'stats' && !loading && (
        <div className="report-section">
          <div className="report-header">
            <h2>Monthly Adoption Statistics</h2>
          </div>

          <div className="stats-filters">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
              {months.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button className="btn-refresh" onClick={fetchMonthlyStats}>
              Refresh
            </button>
          </div>

          {monthlyStats && (
            <div className="stats-cards">
              <div className="stat-card-report">
                <div className="stat-number">{monthlyStats.total_adoptions || 0}</div>
                <div className="stat-label">Total Adoptions</div>
              </div>
              <div className="stat-card-report completed">
                <div className="stat-number">{monthlyStats.completed || 0}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card-report pending">
                <div className="stat-number">{monthlyStats.pending || 0}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card-report cancelled">
                <div className="stat-number">{monthlyStats.cancelled || 0}</div>
                <div className="stat-label">Cancelled</div>
              </div>
              <div className="stat-card-report returned">
                <div className="stat-number">{monthlyStats.returned || 0}</div>
                <div className="stat-label">Returned</div>
              </div>
              <div className="stat-card-report revenue">
                <div className="stat-number">P{parseFloat(monthlyStats.total_revenue || 0).toLocaleString()}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
              <div className="stat-card-report avg">
                <div className="stat-number">P{parseFloat(monthlyStats.avg_fee || 0).toLocaleString()}</div>
                <div className="stat-label">Average Fee</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminReports;
