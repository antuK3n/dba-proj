import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPopularPets, getNewArrivals } from '../services/api';
import PetCard from '../components/PetCard';
import './Home.css';

function Home() {
  const [popularPets, setPopularPets] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);

  useEffect(() => {
    // Fetch Popular Pets (Subquery 1: Top 10 Most Favorited)
    getPopularPets()
      .then((res) => setPopularPets(res.data))
      .catch(console.error)
      .finally(() => setLoadingPopular(false));

    // Fetch New Arrivals (Subquery 2: Recent Arrivals)
    getNewArrivals()
      .then((res) => setNewArrivals(res.data))
      .catch(console.error)
      .finally(() => setLoadingNew(false));
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

      {/* SUBQUERY 1: Top 10 Most Favorited Pets */}
      <section className="featured-section">
        <h2>Most Popular Pets</h2>
        <p className="section-subtitle">Top favorited pets by our community</p>
        {loadingPopular ? (
          <div className="loading">Loading popular pets...</div>
        ) : popularPets.length === 0 ? (
          <div className="no-pets">No popular pets yet. Start favoriting!</div>
        ) : (
          <div className="pets-grid">
            {popularPets.map((pet) => (
              <PetCard key={pet.Pet_ID} pet={pet} showFavoriteCount={true} />
            ))}
          </div>
        )}
      </section>

      {/* SUBQUERY 2: New Arrivals */}
      <section className="featured-section new-arrivals">
        <h2>New Arrivals</h2>
        <p className="section-subtitle">Recently added pets looking for homes</p>
        {loadingNew ? (
          <div className="loading">Loading new arrivals...</div>
        ) : newArrivals.length === 0 ? (
          <div className="no-pets">No new arrivals at the moment.</div>
        ) : (
          <div className="pets-grid">
            {newArrivals.map((pet) => (
              <PetCard key={pet.Pet_ID} pet={pet} showArrivalDate={true} />
            ))}
          </div>
        )}
        <Link to="/pets" className="btn-secondary">
          See All Pets
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
