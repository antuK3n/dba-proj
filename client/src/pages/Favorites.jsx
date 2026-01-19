import { useState, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAdopterFavorites, updateFavorite, removeFavorite } from '../services/api';
import PetCard from '../components/PetCard';
import './Favorites.css';

function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteValue, setNoteValue] = useState('');

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

  const startEditNote = (fav) => {
    setEditingNoteId(fav.Favorite_ID);
    setNoteValue(fav.Notes || '');
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setNoteValue('');
  };

  const saveNote = async (favoriteId) => {
    try {
      await updateFavorite(favoriteId, { Notes: noteValue || null });
      setFavorites(favorites.map(f =>
        f.Favorite_ID === favoriteId ? { ...f, Notes: noteValue || null } : f
      ));
      setEditingNoteId(null);
      setNoteValue('');
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
              <div className="favorite-meta">
                <span className="meta-item">
                  <span className="meta-label">Added:</span>
                  <span className="meta-value">{fav.Date_Added ? new Date(fav.Date_Added).toLocaleDateString() : 'Unknown'}</span>
                </span>
                <div className="meta-item notes-section">
                  <span className="meta-label">Notes:</span>
                  {editingNoteId === fav.Favorite_ID ? (
                    <div className="note-edit">
                      <textarea
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        placeholder="Add a note about this pet..."
                        rows={2}
                      />
                      <div className="note-edit-actions">
                        <button className="btn-icon btn-save" onClick={() => saveNote(fav.Favorite_ID)} title="Save">
                          <Check size={16} />
                        </button>
                        <button className="btn-icon btn-cancel" onClick={cancelEditNote} title="Cancel">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="note-display">
                      <span className="meta-value">{fav.Notes || 'No notes'}</span>
                      <button className="btn-icon btn-edit" onClick={() => startEditNote(fav)} title="Edit note">
                        <Pencil size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
