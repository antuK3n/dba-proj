import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdopterAdoptions, getAdopterFavorites } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [adoptions, setAdoptions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        getAdopterAdoptions(user.Adopter_ID),
        getAdopterFavorites(user.Adopter_ID),
      ])
        .then(([adoptionsRes, favoritesRes]) => {
          setAdoptions(adoptionsRes.data);
          setFavorites(favoritesRes.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.Full_Name}</h1>
        <p>Manage your profile and adoption applications</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card profile-card">
          <h2>My Profile</h2>
          <div className="profile-info">
            <p><strong>Email:</strong> {user?.Email}</p>
            <p><strong>Contact:</strong> {user?.Contact_No || 'Not provided'}</p>
            <p><strong>Address:</strong> {user?.Address || 'Not provided'}</p>
            <p><strong>Housing:</strong> {user?.Housing_Type}</p>
            <p><strong>Experience:</strong> {user?.Experience_Level}</p>
            <p><strong>Other Pets:</strong> {user?.Has_Other_Pets}</p>
            <p><strong>Children:</strong> {user?.Has_Children}</p>
          </div>
        </div>

        <div className="dashboard-card stats-card">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-number">{adoptions.length}</span>
              <span className="stat-label">Applications</span>
            </div>
            <div className="stat">
              <span className="stat-number">{favorites.length}</span>
              <span className="stat-label">Favorites</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {adoptions.filter(a => a.Status === 'Completed').length}
              </span>
              <span className="stat-label">Adopted</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>My Applications</h2>
          <Link to="/adoptions" className="view-all">View All</Link>
        </div>
        {adoptions.length === 0 ? (
          <p className="empty-message">
            No applications yet. <Link to="/pets">Browse pets</Link> to start your adoption journey!
          </p>
        ) : (
          <div className="applications-list">
            {adoptions.slice(0, 3).map((adoption) => (
              <div key={adoption.Adoption_ID} className="application-card">
                <img
                  src={adoption.Photo_URL || 'https://via.placeholder.com/100?text=Pet'}
                  alt={adoption.Pet_Name}
                />
                <div className="application-info">
                  <h3>{adoption.Pet_Name}</h3>
                  <p>{adoption.Species} - {adoption.Breed}</p>
                  <p className="application-date">
                    Applied: {new Date(adoption.Application_Date).toLocaleDateString()}
                  </p>
                </div>
                <div className="application-status">
                  <span className={`status ${adoption.Approval_Status.toLowerCase()}`}>
                    {adoption.Approval_Status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>My Favorites</h2>
          <Link to="/favorites" className="view-all">View All</Link>
        </div>
        {favorites.length === 0 ? (
          <p className="empty-message">
            No favorites yet. <Link to="/pets">Browse pets</Link> and save your favorites!
          </p>
        ) : (
          <div className="favorites-grid">
            {favorites.slice(0, 4).map((fav) => (
              <Link to={`/pets/${fav.Pet_ID}`} key={fav.Favorite_ID} className="favorite-card">
                <img
                  src={fav.Photo_URL || 'https://via.placeholder.com/150?text=Pet'}
                  alt={fav.Pet_Name}
                />
                <div className="favorite-info">
                  <h4>{fav.Pet_Name}</h4>
                  <p>{fav.Breed}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
