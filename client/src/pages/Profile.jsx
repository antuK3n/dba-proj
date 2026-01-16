import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdopterAdoptions, getAdopterFavorites, updateProfile } from '../services/api';
import './Profile.css';

function Profile() {
  const { user, refreshUser } = useAuth();
  const [adoptions, setAdoptions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [profileData, setProfileData] = useState({
    Full_Name: '',
    Email: '',
    Contact_No: '',
    Address: '',
    Housing_Type: '',
    Has_Other_Pets: '',
    Has_Children: '',
    Experience_Level: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        Full_Name: user.Full_Name || '',
        Email: user.Email || '',
        Contact_No: user.Contact_No || '',
        Address: user.Address || '',
        Housing_Type: user.Housing_Type || '',
        Has_Other_Pets: user.Has_Other_Pets || '',
        Has_Children: user.Has_Children || '',
        Experience_Level: user.Experience_Level || '',
        newPassword: '',
        confirmPassword: '',
      });
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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => {
      const updated = { ...prev, [name]: value };

      // Real-time password validation
      if (name === 'newPassword' || name === 'confirmPassword') {
        const newPass = name === 'newPassword' ? value : prev.newPassword;
        const confirmPass = name === 'confirmPassword' ? value : prev.confirmPassword;

        if (confirmPass && newPass !== confirmPass) {
          setPasswordError('Passwords do not match');
        } else if (newPass && newPass.length < 6) {
          setPasswordError('Password must be at least 6 characters');
        } else {
          setPasswordError('');
        }
      }

      return updated;
    });
  };

  const cancelEditing = () => {
    setEditing(false);
    setPasswordError('');
    // Reset form to original user data
    setProfileData({
      Full_Name: user.Full_Name || '',
      Email: user.Email || '',
      Contact_No: user.Contact_No || '',
      Address: user.Address || '',
      Housing_Type: user.Housing_Type || '',
      Has_Other_Pets: user.Has_Other_Pets || '',
      Has_Children: user.Has_Children || '',
      Experience_Level: user.Experience_Level || '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleSaveProfile = async () => {
    // Validate password if user is trying to change it
    if (profileData.newPassword || profileData.confirmPassword) {
      if (profileData.newPassword !== profileData.confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
      if (profileData.newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }
    }

    setSaving(true);
    try {
      const dataToSend = {
        Full_Name: profileData.Full_Name,
        Email: profileData.Email,
        Contact_No: profileData.Contact_No,
        Address: profileData.Address,
        Housing_Type: profileData.Housing_Type,
        Has_Other_Pets: profileData.Has_Other_Pets,
        Has_Children: profileData.Has_Children,
        Experience_Level: profileData.Experience_Level,
      };

      // Only include password if user entered a new one
      if (profileData.newPassword) {
        dataToSend.Password = profileData.newPassword;
      }

      await updateProfile(user.Adopter_ID, dataToSend);
      if (refreshUser) await refreshUser();
      setEditing(false);
      setPasswordError('');
      setProfileData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update profile');
      cancelEditing(); // Exit edit mode on failure
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <h1>Welcome, {user?.Full_Name}</h1>
        <p>Manage your profile and adoption applications</p>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-header">
            <h2>My Profile</h2>
            {!editing && (
              <button className="btn-edit" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
          {editing ? (
            <div className="profile-edit">
              <div className="edit-field">
                <label>Full Name</label>
                <input
                  type="text"
                  name="Full_Name"
                  value={profileData.Full_Name}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="edit-field">
                <label>Email</label>
                <input
                  type="email"
                  name="Email"
                  value={profileData.Email}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="edit-field">
                <label>Contact No</label>
                <input
                  type="tel"
                  name="Contact_No"
                  value={profileData.Contact_No}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="edit-field">
                <label>Address</label>
                <input
                  type="text"
                  name="Address"
                  value={profileData.Address}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="edit-field">
                <label>Housing Type</label>
                <select name="Housing_Type" value={profileData.Housing_Type} onChange={handleProfileChange}>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Condo">Condo</option>
                  <option value="Farm">Farm</option>
                </select>
              </div>
              <div className="edit-field">
                <label>Experience Level</label>
                <select name="Experience_Level" value={profileData.Experience_Level} onChange={handleProfileChange}>
                  <option value="First-time">First-time</option>
                  <option value="Experienced">Experienced</option>
                </select>
              </div>
              <div className="edit-field">
                <label>Has Other Pets</label>
                <select name="Has_Other_Pets" value={profileData.Has_Other_Pets} onChange={handleProfileChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="edit-field">
                <label>Has Children</label>
                <select name="Has_Children" value={profileData.Has_Children} onChange={handleProfileChange}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="edit-section-divider">
                <span>Change Password (optional)</span>
              </div>
              <div className="edit-field">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={profileData.newPassword}
                  onChange={handleProfileChange}
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div className="edit-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={profileData.confirmPassword}
                  onChange={handleProfileChange}
                  placeholder="Confirm new password"
                />
              </div>
              {passwordError && (
                <div className="password-error">{passwordError}</div>
              )}
              <div className="edit-actions">
                <button className="btn-save" onClick={handleSaveProfile} disabled={saving || passwordError}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="btn-cancel" onClick={cancelEditing}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-info">
              <p><strong>Name:</strong> {user?.Full_Name}</p>
              <p><strong>Email:</strong> {user?.Email}</p>
              <p><strong>Contact:</strong> {user?.Contact_No || 'Not provided'}</p>
              <p><strong>Address:</strong> {user?.Address || 'Not provided'}</p>
              <p><strong>Housing:</strong> {user?.Housing_Type}</p>
              <p><strong>Experience:</strong> {user?.Experience_Level}</p>
              <p><strong>Other Pets:</strong> {user?.Has_Other_Pets}</p>
              <p><strong>Children:</strong> {user?.Has_Children}</p>
            </div>
          )}
        </div>

        <div className="stats-card">
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

      <div className="profile-section">
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
                    Applied: {new Date(adoption.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="application-status">
                  <span className={`status ${adoption.Status.toLowerCase()}`}>
                    {adoption.Status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="profile-section">
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

export default Profile;
