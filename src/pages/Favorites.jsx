import React, { useState, useEffect } from 'react';
import { Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadFavorites, loadBarbers, saveFavorites } from '../services/FirestoreService';

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const barberIds = await loadFavorites(user.id);
      const allBarbers = await loadBarbers();
      const favBarbers = allBarbers.filter((b) => barberIds.includes(b.id));
      setFavorites(favBarbers);
      setLoading(false);
    };
    if (user?.id) fetchData();
  }, [user]);

  const handleRemove = async (barberId) => {
    const remainingIds = favorites.filter((b) => b.id !== barberId).map((b) => b.id);
    setFavorites(favorites.filter((b) => b.id !== barberId));
    await saveFavorites(user.id, remainingIds);
  };

  const getInitials = (name) =>
    (name || 'B')
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <div>
      <div className="page-header">
        <h1>Favoritos</h1>
        <p className="subtitle">Seus barbeiros preferidos</p>
      </div>
      <div className="page-body" style={{ maxWidth: 720, margin: '0 auto' }}>
        {loading ? (
          <p style={{ color: 'var(--gray)', textAlign: 'center', padding: 40 }}>Carregando...</p>
        ) : favorites.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Heart />
              <h3>Nenhum favorito ainda</h3>
              <p>Toque no coração nos perfis dos barbeiros para salvá-los aqui.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {favorites.map((barber) => (
              <div
                className="barber-card-web"
                key={barber.id}
                onClick={() => navigate(`/barbeiro/${barber.id}`)}
              >
                <div className="avatar-circle" style={{ flexShrink: 0 }}>
                  {getInitials(barber.name)}
                </div>
                <div className="info">
                  <h4>{barber.name}</h4>
                  <p className="specialty">{barber.specialty}</p>
                  <div className="meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={13} fill="currentColor" />
                      {barber.rating ?? '5.0'}
                    </span>
                  </div>
                </div>
                <div className="actions">
                  <button
                    className="btn btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(barber.id);
                    }}
                    aria-label="Remover dos favoritos"
                    style={{ color: 'var(--accent)' }}
                  >
                    <Heart size={20} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
