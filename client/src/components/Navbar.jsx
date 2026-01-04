import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Pet Adoption Center</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/pets">Pets</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/favorites">Favorites</Link>
            <Link to="/adoptions">Adoptions</Link>
            <Link to="/vet-visits">Vet Visits</Link>
            <span className="user-name">Hi, {user.Full_Name}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
