import { Link } from 'react-router-dom';
import './PetCard.css';

function PetCard({ pet, showFavoriteCount = false, showArrivalDate = false }) {
  const statusColors = {
    Available: '#4CAF50',
    Adopted: '#9E9E9E',
    Reserved: '#FF9800',
    'Medical Hold': '#f44336',
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="pet-card">
      <div className="pet-image">
        <img
          src={pet.Photo_URL || 'https://via.placeholder.com/300x200?text=No+Photo'}
          alt={pet.Pet_Name}
        />
{pet.Status && statusColors[pet.Status] && (
          <span
            className="pet-status"
            style={{ backgroundColor: statusColors[pet.Status] }}
          >
            {pet.Status}
          </span>
        )}
        {showFavoriteCount && pet.pet_rank && (
          <span className="pet-badge rank-badge">
            #{pet.pet_rank}
          </span>
        )}
        {showFavoriteCount && pet.favorite_count && (
          <span className="pet-badge favorite-badge">
            {pet.favorite_count} favorites
          </span>
        )}
        {showArrivalDate && pet.Date_Arrived && (
          <span className="pet-badge arrival-badge">
            Arrived {formatDate(pet.Date_Arrived)}
          </span>
        )}
      </div>
      <div className="pet-info">
        <h3>{pet.Pet_Name}</h3>
        <p className="pet-breed">{pet.Breed}</p>
        <div className="pet-details">
          {pet.Species && <span>{pet.Species}</span>}
          {pet.Age && <span>{pet.Age}</span>}
          {pet.Gender && <span>{pet.Gender}</span>}
        </div>
        <p className="pet-temperament">{pet.Temperament}</p>
        <Link to={`/pets/${pet.Pet_ID}`} className="btn-view">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default PetCard;
