import { useState, useEffect } from 'react';
import { getPets } from '../services/api';
import PetCard from '../components/PetCard';
import './Pets.css';

function Pets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    species: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchPets();
  }, [filters]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.species) params.species = filters.species;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const res = await getPets(params);
      setPets(res.data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="pets-page">
      <div className="pets-header">
        <h1>Available Pets</h1>
        <p>Find your new best friend from our loving animals</p>
      </div>

      <div className="filters">
        <input
          type="text"
          name="search"
          placeholder="Search by name or breed..."
          value={filters.search}
          onChange={handleFilterChange}
        />
        <select name="species" value={filters.species} onChange={handleFilterChange}>
          <option value="">All Species</option>
          <option value="Dog">Dogs</option>
          <option value="Cat">Cats</option>
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Medical Hold">Medical Hold</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading pets...</div>
      ) : pets.length === 0 ? (
        <div className="no-pets">No pets found matching your criteria.</div>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => (
            <PetCard key={pet.Pet_ID} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Pets;
