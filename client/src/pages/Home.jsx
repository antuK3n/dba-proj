import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPets } from '../services/api';
import PetCard from '../components/PetCard';
import './Home.css';

function Home() {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPets({ status: 'Available' })
      .then((res) => setFeaturedPets(res.data.slice(0, 6)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Perfect Companion</h1>
          <p>
            Give a loving home to a pet in need. Browse our available pets and
            start your adoption journey today.
          </p>
          <Link to="/pets" className="btn-primary">
            View All Pets
          </Link>
        </div>
      </section>

      <section className="featured-section">
        <h2>Featured Pets</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="pets-grid">
            {featuredPets.map((pet) => (
              <PetCard key={pet.Pet_ID} pet={pet} />
            ))}
          </div>
        )}
        <Link to="/pets" className="btn-secondary">
          See More Pets
        </Link>
      </section>

      <section className="info-section">
        <div className="info-cards">
          <div className="info-card">
            <h3>Why Adopt?</h3>
            <p>
              By adopting, you're giving a second chance to an animal in need
              while gaining a loyal companion for life.
            </p>
          </div>
          <div className="info-card">
            <h3>Our Process</h3>
            <p>
              Simple and straightforward adoption process. Browse pets, submit
              an application, and welcome your new family member.
            </p>
          </div>
          <div className="info-card">
            <h3>Support & Care</h3>
            <p>
              All our pets receive veterinary care, vaccinations, and are
              spayed/neutered before adoption.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
