import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { LayoutDashboard, Dog, Users, ClipboardList, BarChart3, Stethoscope, Syringe, LogOut } from 'lucide-react';
import './AdminLayout.css';

function AdminLayout() {
  const { admin, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/pets', label: 'Pets', icon: Dog },
    { path: '/admin/adopters', label: 'Adopters', icon: Users },
    { path: '/admin/adoptions', label: 'Adoptions', icon: ClipboardList },
    { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { path: '/admin/vet-visits', label: 'Vet Visits', icon: Stethoscope },
    { path: '/admin/vaccinations', label: 'Vaccinations', icon: Syringe },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <span>PetHaven</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={isActive(item.path) ? 'active' : ''}
            >
              <span className="nav-icon"><item.icon size={20} /></span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="admin-info">
            <span className="admin-name">{admin?.Full_Name}</span>
            {admin?.Role && <span className="admin-role">{admin.Role}</span>}
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
