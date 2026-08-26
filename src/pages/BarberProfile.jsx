import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Heart, ChevronRight, Calendar, MessageCircle, Scissors } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  loadBarbers,
  loadServices,
  loadHours,
  loadFavorites,
  saveFavorites,
} from '../services/FirestoreService';

const DAY_NAMES = {
  mon: 'Segunda',
  tue: 'Terça',
  wed: 'Quarta',
  thu: 'Quinta',
  fri: 'Sexta',
  sat: 'Sábado',
  sun: 'Domingo',
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const isValidPhoto = (photo) => {
  if (!photo) return false;
  return photo.startsWith('data:') || photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('./');
};

const BarberProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [barber, setBarber] = useState(null);
  const [services, setServices] = useState([]);
  const [hours, setHours] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [barbersData, servicesData, hoursData, favData] = await Promise.all([
        loadBarbers().catch(() => []),
        loadServices().catch(() => []),
        loadHours().catch(() => null),
        user?.id ? loadFavorites(user.id).catch(() => []) : Promise.resolve([]),
      ]);
      setBarber(barbersData.find((b) => b.id === id) || null);
      const foundBarber = barbersData.find((b) => b.id === id);
      setServices(servicesData.filter((s) => s.active !== false && (!foundBarber?.serviceIds?.length || foundBarber.serviceIds.includes(s.id))));
      if (hoursData) setHours(hoursData);
      setFavorites(favData);
    };
    fetchData();
  }, [id, user?.id]);

  const isFavorite = barber ? favorites.includes(barber.id) : false;

  const toggleFavorite = async () => {
    if (!barber) return;
    const updated = isFavorite
      ? favorites.filter((favId) => favId !== barber.id)
      : [...favorites, barber.id];
    setFavorites(updated);
    if (user?.id) {
      await saveFavorites(user.id, updated);
    }
  };

  const openWhatsApp = () => {
    const msg = `Olá! Gostaria de agendar com ${barber.name} na PH Barbearia.`;
    window.open('https://wa.me/5574999258772?text=' + encodeURIComponent(msg), '_blank');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Perfil do Barbeiro</h1>
          <p className="subtitle">{barber ? barber.name : 'Carregando...'}</p>
        </div>
        {barber && (
          <button
            className="btn btn-outline btn-sm"
            onClick={toggleFavorite}
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              size={16}
              color={isFavorite ? 'var(--accent)' : 'currentColor'}
              fill={isFavorite ? 'var(--accent)' : 'none'}
            />
            {isFavorite ? 'Favorito' : 'Favoritar'}
          </button>
        )}
      </div>

      <div className="page-body">
        {!barber && (
          <div className="empty-state">
            <Scissors size={48} />
            <h3>Barbeiro não encontrado</h3>
            <p>O barbeiro solicitado não existe ou foi removido.</p>
          </div>
        )}

        {barber && (
          <>
            <div className="mb-lg" style={{ textAlign: 'center' }}>
              {isValidPhoto(barber.photo) ? (
                <img
                  className="avatar-circle"
                  src={barber.photo}
                  alt={barber.name}
                  style={{ width: 100, height: 100 }}
                />
              ) : (
                <div className="avatar-circle" style={{ width: 100, height: 100, fontSize: 32 }}>
                  {getInitials(barber.name)}
                </div>
              )}
              <h2 className="fs-lg fw-700 mt-md">{barber.name}</h2>
              <p className="text-gold">{barber.specialty || 'Barbeiro'}</p>

              <div className="card mt-lg" style={{ textAlign: 'center' }}>
                <div className="grid-3">
                  <div>
                    <Star size={20} className="text-gold" />
                    <div className="fw-700 fs-lg mt-sm">{barber.rating || '5.0'}</div>
                    <div className="text-gray fs-sm">Avaliação</div>
                  </div>
                  <div>
                    <Clock size={20} className="text-gold" />
                    <div className="fw-700 fs-lg mt-sm">{barber.experience || 'N/I'}</div>
                    <div className="text-gray fs-sm">Experiência</div>
                  </div>
                  <div>
                    <Heart
                      size={20}
                      color={isFavorite ? 'var(--accent)' : 'var(--gray)'}
                      fill={isFavorite ? 'var(--accent)' : 'none'}
                    />
                    <div className="fw-700 fs-lg mt-sm">{isFavorite ? 'Sim' : 'Não'}</div>
                    <div className="text-gray fs-sm">Favorito</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="page-section">
              <h2>Sobre</h2>
              <p className="text-gray" style={{ lineHeight: 1.6 }}>
                Profissional dedicado e apaixonado pelo que faz. Sempre atualizado com as
                tendências e técnicas mais modernas do mercado. Venha nos conhecer e descubra
                a experiência PH.
              </p>
            </div>

            <div className="page-section">
              <h2>Serviços</h2>
              {services.map((service) => (
                <div
                  key={service.id}
                  className="card mb-sm"
                  style={{ padding: 14, cursor: 'pointer' }}
                  onClick={() => navigate(`/agendar?barberId=${id}&serviceId=${service.id}`)}
                >
                  <div className="flex-between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar-circle">
                        {service.photo ? (
                          <img src={service.photo} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          <Scissors size={16} />
                        )}
                      </div>
                      <div>
                        <div className="fw-600">{service.name}</div>
                        {service.description && (
                          <div className="text-gray fs-sm" style={{ maxWidth: 200 }}>{service.description}</div>
                        )}
                        <div className="text-gray fs-sm">{service.duration}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="text-gold fw-600">R$ {service.price}</span>
                      <ChevronRight size={16} className="text-gray" />
                    </div>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <p className="text-gray">Nenhum serviço disponível no momento.</p>
              )}
            </div>

            {hours && (
              <div className="page-section">
                <h2>Horário de Funcionamento</h2>
                <div className="card">
                  {Object.keys(DAY_NAMES).map((dayKey) => {
                    const day = hours[dayKey];
                    if (!day) return null;
                    return (
                      <div key={dayKey} className="flex-between" style={{ padding: '10px 0' }}>
                        <span>{DAY_NAMES[dayKey]}</span>
                        <span className={day.active ? 'text-gold' : 'text-error'}>
                          {day.active ? `${day.open} - ${day.close}` : 'Fechado'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid-2 mt-lg">
              <button className="btn btn-accent" onClick={() => navigate(`/agendar?barberId=${id}`)}>
                <Calendar size={18} /> Agendar Horário
              </button>
              <button className="btn btn-whatsapp" onClick={openWhatsApp}>
                <MessageCircle size={18} /> WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BarberProfile;
