import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useAdminAuth } from './context/AdminAuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Pets from './pages/Pets';
import PetDetail from './pages/PetDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Adoptions from './pages/Adoptions';
import VetVisits from './pages/VetVisits';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPets from './pages/admin/AdminPets';
import AdminAdopters from './pages/admin/AdminAdopters';
import AdminAdoptions from './pages/admin/AdminAdoptions';
import AdminVetVisits from './pages/admin/AdminVetVisits';
import AdminVaccinations from './pages/admin/AdminVaccinations';
import AdminReports from './pages/admin/AdminReports';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function AdminProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return admin ? children : <Navigate to="/admin/login" />;
}

// Wrapper component to conditionally show Navbar (hide on admin routes)
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/pets/:id" element={<PetDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route path="/adoptions" element={<Adoptions />} />
          <Route path="/vet-visits" element={<VetVisits />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="pets" element={<AdminPets />} />
            <Route path="adopters" element={<AdminAdopters />} />
            <Route path="adoptions" element={<AdminAdoptions />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="vet-visits" element={<AdminVetVisits />} />
            <Route path="vaccinations" element={<AdminVaccinations />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
