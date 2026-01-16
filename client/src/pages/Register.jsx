import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({
    Email: '',
    Password: '',
    Full_Name: '',
    Contact_No: '',
    Address: '',
    Housing_Type: '',
    Has_Other_Pets: '',
    Has_Children: '',
    Experience_Level: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(formData);
      loginUser(res.data.user, res.data.token);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <h1>Create Account</h1>
        <p>Join us and find your perfect companion</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="Full_Name"
                value={formData.Full_Name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="Password"
                value={formData.Password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Contact Number *</label>
              <input
                type="tel"
                name="Contact_No"
                value={formData.Contact_No}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address *</label>
            <input
              type="text"
              name="Address"
              value={formData.Address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Housing Type *</label>
              <select name="Housing_Type" value={formData.Housing_Type} onChange={handleChange} required>
                <option value="" disabled>-- Select Housing Type --</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Condo">Condo</option>
                <option value="Farm">Farm</option>
              </select>
            </div>
            <div className="form-group">
              <label>Experience Level *</label>
              <select name="Experience_Level" value={formData.Experience_Level} onChange={handleChange} required>
                <option value="" disabled>-- Select Experience Level --</option>
                <option value="First-time">First-time Owner</option>
                <option value="Experienced">Experienced Owner</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Has Other Pets? *</label>
              <select name="Has_Other_Pets" value={formData.Has_Other_Pets} onChange={handleChange} required>
                <option value="" disabled>-- Select --</option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Has Children? *</label>
              <select name="Has_Children" value={formData.Has_Children} onChange={handleChange} required>
                <option value="" disabled>-- Select --</option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
