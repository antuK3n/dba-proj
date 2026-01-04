import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdopterFavorites, removeFavorite } from '../services/api';
import PetCard from '../components/PetCard';
import './Favorites.css';

function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const res = await getAdopterFavorites(user.Adopter_ID);
      setFavorites(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (favoriteId) => {
    try {
      await removeFavorite(favoriteId);
      setFavorites(favorites.filter(f => f.Favorite_ID !== favoriteId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h1>My Favorites</h1>
        <p>Pets you've saved for later</p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <h2>No favorites yet</h2>
          <p>Browse our available pets and click the heart to save your favorites!</p>
        </div>
      ) : (
        <div className="favorites-list">
          {favorites.map((fav) => (
            <div key={fav.Favorite_ID} className="favorite-item">
              <PetCard pet={fav} />
              <button
                onClick={() => handleRemove(fav.Favorite_ID)}
                className="btn-remove"
              >
                Remove from Favorites
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
