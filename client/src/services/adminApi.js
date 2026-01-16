import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add admin auth token to requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors (401 = unauthorized, redirect to login)
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      // Only redirect if we're in admin routes
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const adminLogin = (data) => axios.post(`${API_URL}/auth/login`, data);
export const getAdminUser = () => adminApi.get('/auth/me');

// Dashboard
export const getDashboardStats = () => adminApi.get('/dashboard/stats');
export const getDashboardActivity = () => adminApi.get('/dashboard/activity');

// Pets
export const getAdminPets = (params) => adminApi.get('/pets', { params });
export const getAdminPet = (id) => adminApi.get(`/pets/${id}`);
export const createAdminPet = (data) => adminApi.post('/pets', data);
export const updateAdminPet = (id, data) => adminApi.put(`/pets/${id}`, data);
export const deleteAdminPet = (id) => adminApi.delete(`/pets/${id}`);

// Adopters
export const getAdminAdopters = () => adminApi.get('/adopters');
export const getAdminAdopter = (id) => adminApi.get(`/adopters/${id}`);
export const updateAdminAdopter = (id, data) => adminApi.put(`/adopters/${id}`, data);
export const deleteAdminAdopter = (id) => adminApi.delete(`/adopters/${id}`);

// Adoptions
export const getAdminAdoptions = (params) => adminApi.get('/adoptions', { params });
export const cancelAdoption = (id) => adminApi.put(`/adoptions/${id}/cancel`);
export const completeAdoption = (id) => adminApi.put(`/adoptions/${id}/complete`);
export const deleteAdminAdoption = (id) => adminApi.delete(`/adoptions/${id}`);

// Reports (JOINs and Stored Procedures)
export const getPendingApplications = () => adminApi.get('/adoptions/pending-applications');
export const getAdoptionReport = () => adminApi.get('/adoptions/report');
export const getMonthlyStats = (year, month) => adminApi.get(`/reports/monthly-stats/${year}/${month}`);

// Vet Visits
export const getAdminVetVisits = (params) => adminApi.get('/vet-visits', { params });
export const createAdminVetVisit = (data) => adminApi.post('/vet-visits', data);
export const updateAdminVetVisit = (id, data) => adminApi.put(`/vet-visits/${id}`, data);
export const deleteAdminVetVisit = (id) => adminApi.delete(`/vet-visits/${id}`);

// Vaccinations
export const getAdminVaccinations = (params) => adminApi.get('/vaccinations', { params });
export const createAdminVaccination = (data) => adminApi.post('/vaccinations', data);
export const updateAdminVaccination = (id, data) => adminApi.put(`/vaccinations/${id}`, data);
export const deleteAdminVaccination = (id) => adminApi.delete(`/vaccinations/${id}`);

// Admin Users (Super Admin only)
export const getAdminUsers = () => adminApi.get('/users');
export const createAdminUser = (data) => adminApi.post('/users', data);
export const toggleAdminActive = (id) => adminApi.put(`/users/${id}/toggle-active`);

export default adminApi;
