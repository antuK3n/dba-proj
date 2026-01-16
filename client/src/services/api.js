import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Pets
export const getPets = (params) => api.get('/pets', { params });
export const getPet = (id) => api.get(`/pets/${id}`);
export const createPet = (data) => api.post('/pets', data);
export const updatePet = (id, data) => api.put(`/pets/${id}`, data);
export const deletePet = (id) => api.delete(`/pets/${id}`);
export const getPetVetHistory = (id) => api.get(`/pets/${id}/vet-history`);

// Featured Pets (Subqueries)
export const getPopularPets = () => api.get('/pets/popular');
export const getNewArrivals = () => api.get('/pets/new-arrivals');

// Search by Species (Stored Procedure)
export const searchPetsBySpecies = (species) => api.get(`/pets/search-by-species/${species}`);

// Adopters
export const getAdopters = () => api.get('/adopters');
export const getAdopter = (id) => api.get(`/adopters/${id}`);
export const getAdopterAdoptions = (id) => api.get(`/adopters/${id}/adoptions`);
export const getAdopterFavorites = (id) => api.get(`/adopters/${id}/favorites`);

// Adoptions
export const getAdoptions = (params) => api.get('/adoptions', { params });
export const getAdoption = (id) => api.get(`/adoptions/${id}`);
export const createAdoption = (data) => api.post('/adoptions', data);
export const updateAdoption = (id, data) => api.put(`/adoptions/${id}`, data);
export const deleteAdoption = (id) => api.delete(`/adoptions/${id}`);

// Vet Visits
export const getVetVisits = (params) => api.get('/vet-visits', { params });
export const getVetVisit = (id) => api.get(`/vet-visits/${id}`);
export const createVetVisit = (data) => api.post('/vet-visits', data);
export const updateVetVisit = (id, data) => api.put(`/vet-visits/${id}`, data);
export const deleteVetVisit = (id) => api.delete(`/vet-visits/${id}`);

// Vaccinations
export const getVaccinations = (params) => api.get('/vaccinations', { params });
export const createVaccination = (data) => api.post('/vaccinations', data);
export const updateVaccination = (id, data) => api.put(`/vaccinations/${id}`, data);
export const deleteVaccination = (id) => api.delete(`/vaccinations/${id}`);

// Favorites
export const getFavorites = (params) => api.get('/favorites', { params });
export const addFavorite = (data) => api.post('/favorites', data);
export const removeFavorite = (id) => api.delete(`/favorites/${id}`);
export const checkFavorite = (adopterId, petId) => api.get(`/favorites/check/${adopterId}/${petId}`);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getCurrentUser = () => api.get('/auth/me');

// Profile
export const updateProfile = (id, data) => api.put(`/adopters/${id}`, data);

export default api;
