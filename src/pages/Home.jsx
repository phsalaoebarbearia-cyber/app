import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Star, Heart, Phone, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loadBarbers, loadServices, loadFavorites, saveFavorites } from '../services/FirestoreService';

const WHATSAPP_URL =
  'https://wa.me/5574999258772?text=' +
  encodeURIComponent('Olá! Gostaria de agendar um horário na PH Barbearia.');

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const isValidPhoto = (photo) => {
  if (!photo) return false;
  return photo.startsWith('data:') || photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('./');
};

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [servicesData, barbersData, favData] = await Promise.all([
        loadServices().catch(() => []),
        loadBarbers().catch(() => []),
        user?.id ? loadFavorites(user.id).catch(() => []) : Promise.resolve([]),
      ]);
      setServices(servicesData.filter((s) => s.active !== false));
      setBarbers(barbersData.filter((b) => b.active !== false));
      setFavorites(favData);
    };
    fetchData();
  }, [user?.id]);

  const toggleFavorite = async (e, barberId) => {
    e.stopPropagation();
    const updated = favorites.includes(barberId)
      ? favorites.filter((id) => id !== barberId)
      : [...favorites, barberId];
    setFavorites(updated);
    if (user?.id) {
      await saveFavorites(user.id, updated);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Olá, {user.name.split(' ')[0]} 👋</h1>
          <p className="subtitle">Escolha seu barbeiro e agende</p>
        </div>
        <button className="btn btn-whatsapp btn-sm" onClick={() => window.open(WHATSAPP_URL, '_blank')}>
          <MessageCircle size={16} /> WhatsApp
        </button>
      </div>

      <div className="page-body">
        <div className="page-section">
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <img
              src="./Logo_ph.png"
              alt="PH Barbearia"
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                border: '2px solid var(--gold)',
                objectFit: 'cover',
              }}
            />
            <div style={{ flex: 1 }}>
              <h2 className="fs-lg fw-700">PH Barbearia</h2>
              <p className="text-gold">Salão &amp; Barbearia</p>
              <div className="mt-sm" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray)' }}>
                <Phone size={14} />
                <span className="fs-sm">(74) 99925-8772</span>
              </div>
            </div>
          </div>
        </div>

        <div className="page-section">
          <h2>Nossos Serviços</h2>
          <div className="grid-4">
            {services.map((service) => (
              <div key={service.id} className="service-card-web" onClick={() => navigate('/agendar')}>
                <div className="icon-wrap">
                  {service.photo ? (
                    <img src={service.photo} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    <Scissors size={24} />
                  )}
                </div>
                <h4>{service.name}</h4>
                {service.description && (
                  <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 8, textAlign: 'center' }}>
                    {service.description}
                  </div>
                )}
                <div className="price">R$ {service.price}</div>
                <div className="duration">{service.duration}</div>
              </div>
            ))}
            {services.length === 0 && (
              <p className="text-gray">Nenhum serviço disponível no momento.</p>
            )}
          </div>
        </div>

        <div className="page-section">
          <h2>Nossos Barbeiros</h2>
          <div className="grid-2">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="barber-card-web"
                onClick={() => navigate(`/barbeiro/${barber.id}`)}
              >
                {isValidPhoto(barber.photo) ? (
                  <img className="avatar-circle" src={barber.photo} alt={barber.name} />
                ) : (
                  <div className="avatar-circle">{getInitials(barber.name)}</div>
                )}
                <div className="info">
                  <h4>{barber.name}</h4>
                  <p className="specialty">{barber.specialty || 'Barbeiro'}</p>
                  <div className="meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={12} className="text-gold" /> {barber.rating || '5.0'}
                    </span>
                    {barber.experience && <span>{barber.experience}</span>}
                  </div>
                </div>
                <div className="actions">
                  <button
                    title={favorites.includes(barber.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    onClick={(e) => toggleFavorite(e, barber.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      color: favorites.includes(barber.id) ? 'var(--accent)' : 'var(--gray)',
                    }}
                  >
                    <Heart
                      size={20}
                      fill={favorites.includes(barber.id) ? 'var(--accent)' : 'none'}
                    />
                  </button>
                </div>
              </div>
            ))}
            {barbers.length === 0 && (
              <p className="text-gray">Nenhum barbeiro disponível no momento.</p>
            )}
          </div>
        </div>

        <button className="btn btn-whatsapp" onClick={() => window.open(WHATSAPP_URL, '_blank')}>
          <MessageCircle size={18} /> Agendar pelo WhatsApp
        </button>
      </div>
    </div>
  );
};

export default Home;
