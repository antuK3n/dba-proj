import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPet, getPetVetHistory, createAdoption, addFavorite, checkFavorite, removeFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './PetDetail.css';

function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState(null);
  const [vetHistory, setVetHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchPetData();
  }, [id]);

  useEffect(() => {
    if (user && pet) {
      checkFavorite(user.Adopter_ID, pet.Pet_ID)
        .then((res) => {
          setIsFavorited(res.data.isFavorited);
          setFavoriteId(res.data.favorite?.Favorite_ID);
        })
        .catch(console.error);
    }
  }, [user, pet]);

  const fetchPetData = async () => {
    try {
      const [petRes, historyRes] = await Promise.all([
        getPet(id),
        getPetVetHistory(id),
      ]);
      setPet(petRes.data);
      setVetHistory(historyRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdopt = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setApplying(true);
    try {
      await createAdoption({
        Pet_ID: pet.Pet_ID,
        Adopter_ID: user.Adopter_ID,
        Adoption_Fee: 2000.00,
      });
      alert('Application submitted successfully!');
      fetchPetData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (isFavorited) {
        await removeFavorite(favoriteId);
        setIsFavorited(false);
        setFavoriteId(null);
      } else {
        const res = await addFavorite({ Adopter_ID: user.Adopter_ID, Pet_ID: pet.Pet_ID });
        setIsFavorited(true);
        setFavoriteId(res.data.Favorite_ID);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!pet) return <div className="error">Pet not found</div>;

  const statusColors = {
    Available: '#4CAF50',
    Adopted: '#9E9E9E',
    Reserved: '#FF9800',
    'Medical Hold': '#f44336',
  };

  return (
    <div className="pet-detail">
      <div className="pet-detail-main">
        <div className="pet-detail-image">
          <img
            src={pet.Photo_URL || 'https://via.placeholder.com/500x400?text=No+Photo'}
            alt={pet.Pet_Name}
          />
        </div>
        <div className="pet-detail-info">
          <div className="pet-header">
            <h1>{pet.Pet_Name}</h1>
            <span className="status-badge" style={{ backgroundColor: statusColors[pet.Status] }}>
              {pet.Status}
            </span>
          </div>
          <p className="pet-breed">{pet.Breed} - {pet.Species}</p>

          <div className="pet-attributes">
            <div className="attribute">
              <span className="label">Age</span>
              <span className="value">{pet.Age}</span>
            </div>
            <div className="attribute">
              <span className="label">Gender</span>
              <span className="value">{pet.Gender}</span>
            </div>
            <div className="attribute">
              <span className="label">Color</span>
              <span className="value">{pet.Color}</span>
            </div>
            <div className="attribute">
              <span className="label">Spayed/Neutered</span>
              <span className="value">{pet.Spayed_Neutered}</span>
            </div>
            <div className="attribute">
              <span className="label">Arrived</span>
              <span className="value">{new Date(pet.Date_Arrived).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="pet-temperament">
            <h3>Temperament</h3>
            <p>{pet.Temperament || 'No information available'}</p>
          </div>

          {pet.Special_Needs && (
            <div className="pet-special-needs">
              <h3>Special Needs</h3>
              <p>{pet.Special_Needs}</p>
            </div>
          )}

          <div className="pet-actions">
            <button
              onClick={handleFavorite}
              className={`btn-favorite ${isFavorited ? 'favorited' : ''}`}
            >
              {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
            {pet.Status === 'Available' && (
              <button onClick={handleAdopt} className="btn-adopt" disabled={applying}>
                {applying ? 'Submitting...' : 'Apply to Adopt'}
              </button>
            )}
          </div>
        </div>
      </div>

      {vetHistory.length > 0 && (
        <div className="vet-history">
          <h2>Veterinary History</h2>
          <div className="vet-cards">
            {vetHistory.map((visit) => (
              <div key={visit.Visit_ID} className="vet-card">
                <div className="vet-card-header">
                  <span className="visit-type">{visit.Visit_Type}</span>
                  <span className="visit-date">
                    {new Date(visit.Visit_Date).toLocaleDateString()}
                  </span>
                </div>
                <p><strong>Veterinarian:</strong> {visit.Veterinarian_Name}</p>
                {visit.Weight && <p><strong>Weight:</strong> {visit.Weight} kg</p>}
                {visit.Diagnosis && <p><strong>Diagnosis:</strong> {visit.Diagnosis}</p>}
                {visit.General_Notes && <p><strong>Notes:</strong> {visit.General_Notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PetDetail;
