import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getDashboardActivity } from '../../services/adminApi';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        getDashboardStats(),
        getDashboardActivity(),
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to the PetHaven Admin Panel</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card pets">
          <div className="stat-icon">🐕</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.pets?.total_pets || 0}</span>
            <span className="stat-label">Total Pets</span>
          </div>
          <div className="stat-details">
            <span className="available">{stats?.pets?.available || 0} Available</span>
            <span className="adopted">{stats?.pets?.adopted || 0} Adopted</span>
          </div>
        </div>

        <div className="stat-card adopters">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.adopters?.total_adopters || 0}</span>
            <span className="stat-label">Total Adopters</span>
          </div>
        </div>

        <div className="stat-card adoptions">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.adoptions?.total_adoptions || 0}</span>
            <span className="stat-label">Total Adoptions</span>
          </div>
          <div className="stat-details">
            <span className="pending">{stats?.adoptions?.pending || 0} Pending</span>
            <span className="completed">{stats?.adoptions?.completed || 0} Completed</span>
          </div>
        </div>

        <div className="stat-card vet">
          <div className="stat-icon">🏥</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.vetVisits?.total_visits || 0}</span>
            <span className="stat-label">Vet Visits</span>
          </div>
        </div>

        <div className="stat-card vaccinations">
          <div className="stat-icon">💉</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.vaccinations?.total_vaccinations || 0}</span>
            <span className="stat-label">Vaccinations</span>
          </div>
          {stats?.vaccinations?.overdue > 0 && (
            <div className="stat-alert">
              {stats.vaccinations.overdue} Overdue
            </div>
          )}
        </div>
      </div>

      <div className="activity-section">
        <div className="activity-card">
          <div className="activity-header">
            <h2>Recent Adoption Applications</h2>
            <Link to="/admin/adoptions">View All</Link>
          </div>
          <div className="activity-list">
            {activity?.recentAdoptions?.length === 0 ? (
              <p className="no-data">No recent applications</p>
            ) : (
              activity?.recentAdoptions?.map((adoption) => (
                <div key={adoption.Adoption_ID} className="activity-item">
                  <img
                    src={adoption.Photo_URL || 'https://via.placeholder.com/50?text=Pet'}
                    alt={adoption.Pet_Name}
                  />
                  <div className="activity-info">
                    <strong>{adoption.Pet_Name}</strong>
                    <span>by {adoption.Adopter_Name}</span>
                  </div>
                  <span className={`status ${adoption.Status.toLowerCase()}`}>
                    {adoption.Status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="activity-card">
          <div className="activity-header">
            <h2>Recently Added Pets</h2>
            <Link to="/admin/pets">View All</Link>
          </div>
          <div className="activity-list">
            {activity?.recentPets?.length === 0 ? (
              <p className="no-data">No recent pets</p>
            ) : (
              activity?.recentPets?.map((pet) => (
                <div key={pet.Pet_ID} className="activity-item">
                  <img
                    src={pet.Photo_URL || 'https://via.placeholder.com/50?text=Pet'}
                    alt={pet.Pet_Name}
                  />
                  <div className="activity-info">
                    <strong>{pet.Pet_Name}</strong>
                    <span>{pet.Species} - {pet.Breed}</span>
                  </div>
                  <span className={`status ${pet.Status.toLowerCase().replace(' ', '-')}`}>
                    {pet.Status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
