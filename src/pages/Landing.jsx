import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Clock, MapPin, Phone, ChevronRight, ChevronLeft, Star, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { loadServices } from '../services/FirestoreService';
import Login from './Login';

const galleryImages = [
  './Logo_ph.png',
  './Fotos/Prifissional01.png',
  './Fotos/Profissional02.png',
  './Fotos/Profissional03.png',
  './Fotos/Profissional04.png',
  './Fotos/Corte.jpeg',
];

const DEFAULT_SERVICES = [
  { name: 'Corte', price: 45, description: 'Corte masculino ou feminino, feito com técnica e acabamento impecável.', icon: '✂️' },
  { name: 'Barba', price: 35, description: 'Barba feita com navalha, toalha quente e hidratação completa.', icon: '🪒' },
  { name: 'Corte + Barba', price: 70, description: 'Combo completo com corte e barba para o visual perfeito.', icon: '💈' },
  { name: 'Degradê', price: 50, description: 'Degradê com degradê suave e acabamento na navalha.', icon: '🔥' },
];

const aboutGallery1 = [
  './Fotos/Profissional03.png',
  './Fotos/Profissional02.png',
  './Fotos/Corte.jpeg',
  './Fotos/banner.png',
];

const aboutGallery2 = [
  './Fotos/Prifissional01.png',
  './Fotos/Profissional04.png',
  './Fotos/Profissional03.png',
  './Fotos/Corte.jpeg',
];

const Landing = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [fade, setFade] = useState(true);
  const [aboutIndex1, setAboutIndex1] = useState(0);
  const [aboutIndex2, setAboutIndex2] = useState(0);
  const [aboutFade1, setAboutFade1] = useState(true);
  const [aboutFade2, setAboutFade2] = useState(true);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [serviceFade, setServiceFade] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImage((prev) => (prev + 1) % galleryImages.length);
        setFade(true);
      }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval1 = setInterval(() => {
      setAboutFade1(false);
      setTimeout(() => {
        setAboutIndex1((prev) => (prev + 1) % aboutGallery1.length);
        setAboutFade1(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval1);
  }, []);

  useEffect(() => {
    const interval2 = setInterval(() => {
      setAboutFade2(false);
      setTimeout(() => {
        setAboutIndex2((prev) => (prev + 1) % aboutGallery2.length);
        setAboutFade2(true);
      }, 400);
    }, 3800);
    return () => clearInterval(interval2);
  }, []);

  useEffect(() => {
    loadServices().then((data) => {
      if (data && data.length > 0) setServices(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (services.length <= 1) return;
    const interval = setInterval(() => {
      setServiceFade(false);
      setTimeout(() => {
        setServiceIndex((prev) => (prev + 1) % services.length);
        setServiceFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [services.length]);

  const prevService = () => {
    setServiceFade(false);
    setTimeout(() => {
      setServiceIndex((prev) => (prev - 1 + services.length) % services.length);
      setServiceFade(true);
    }, 300);
  };

  const nextService = () => {
    setServiceFade(false);
    setTimeout(() => {
      setServiceIndex((prev) => (prev + 1) % services.length);
      setServiceFade(true);
    }, 300);
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div style={styles.navBrand}>
            <img src="./Logo_ph.png" alt="PH" style={styles.navLogo} />
            <span style={styles.navTitle}>
              <span style={styles.navPH}>PH</span>{' '}
              <span style={styles.navTitleWhite}>Salão & Barbearia</span>
            </span>
          </div>
          <div className="landing-nav-links" style={styles.navLinks}>
            <a href="#servicos" style={styles.navLink}>Serviços</a>
            <a href="#sobre" style={styles.navLink}>Sobre</a>
            <a href="#localizacao" style={styles.navLink}>Localização</a>
            <a href="#contato" style={styles.navLink}>Contato</a>
            <button onClick={() => setShowLogin(true)} style={styles.navBtn}>
              Entrar
            </button>
          </div>
        </div>
      </nav>

      <section style={styles.hero}>
        <div className="landing-hero" style={styles.heroInner}>
          <div className="landing-hero-left" style={styles.heroLeft}>
            <div style={styles.badge}>
              <Star size={14} style={{ color: '#d4af37' }} />
              <span>Salão & Barbearia</span>
            </div>
            <h1 className="landing-hero-title" style={styles.heroTitle}>
              A experiência{' '}
              <span style={styles.logoPH}>PH</span>{' '}
              em beleza, estilo e cuidado
            </h1>
            <p className="landing-hero-desc" style={styles.heroDesc}>
              No <span style={styles.logoPHInline}>PH</span> Salão & Barbearia, técnica, criatividade e atendimento personalizado
              se unem para valorizar a identidade de homens e mulheres. Oferecemos cortes
              modernos, clássicos e personalizados, respeitando o estilo, os traços e as
              preferências de cada cliente.
            </p>
            <p className="landing-hero-desc" style={{ ...styles.heroDesc, marginTop: -8 }}>
              Mais do que um corte, proporcionamos uma experiência completa de beleza e
              bem-estar, com profissionais qualificados, ambiente acolhedor e atenção
              especial a cada detalhe — da recepção ao acabamento final.
            </p>
            <div className="landing-hero-actions" style={styles.heroActions}>
              <button onClick={() => navigate('/login')} style={styles.btnPrimary}>
                Agendar Agora
                <ChevronRight size={18} />
              </button>
              <a href="https://wa.me/5574999258772?text=Ol%C3%A1!%20Gostaria%20de%20agendar" target="_blank" rel="noreferrer" style={styles.btnSecondary}>
                <Phone size={16} />
                WhatsApp
              </a>
            </div>
            <div className="landing-hero-stats" style={styles.heroStats}>
              <div style={styles.statItem}>
                <span style={styles.statNumber}>8+</span>
                <span style={styles.statLabel}>Anos de experiência</span>
              </div>
              <div className="landing-stat-divider" style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={styles.statNumber}>5.0</span>
                <span style={styles.statLabel}>Avaliação Google</span>
              </div>
              <div className="landing-stat-divider" style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={styles.statNumber}>4K+</span>
                <span style={styles.statLabel}>Clientes atendidos</span>
              </div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div className="landing-mirror" style={styles.mirrorOuter}>
              <div style={styles.mirrorRing} />
              <div style={styles.mirrorInner}>
                <img
                  src={galleryImages[currentImage]}
                  alt="PH Barbearia"
                  style={{
                    ...styles.mirrorImage,
                    opacity: fade ? 1 : 0,
                  }}
                />
              </div>
              <div style={styles.mirrorReflection} />
            </div>
          </div>
        </div>
      </section>

      <section id="servicos" style={styles.section}>
        <div style={styles.sectionInner}>
          <span style={styles.sectionTag}>Nossos Serviços</span>
          <h2 style={styles.sectionTitle}>
            Feito para quem busca{' '}
            <span style={styles.gold}>excelência</span>
          </h2>
          <div style={styles.carouselWrapper}>
            <button onClick={prevService} style={styles.carouselArrow}>
              <ChevronLeft size={24} />
            </button>
            <div style={styles.carouselTrack}>
              {services.map((s, i) => {
                const offset = i - serviceIndex;
                const absOffset = Math.abs(offset);
                const isActive = offset === 0;
                return (
                  <div
                    key={s.id || s.name}
                    style={{
                      ...styles.serviceCardCarousel,
                      opacity: isActive ? (serviceFade ? 1 : 0.3) : 0,
                      transform: `translateX(${offset * 105}%) scale(${isActive ? 1 : 0.85})`,
                      zIndex: isActive ? 2 : 1,
                      pointerEvents: isActive ? 'auto' : 'none',
                      transition: 'all 0.4s ease',
                    }}
                  >
                    {s.photo ? (
                      <img src={s.photo} alt={s.name} style={styles.servicePhoto} />
                    ) : (
                      <div style={styles.servicePhotoPlaceholder}>
                        <span style={{ fontSize: 48 }}>{s.icon || '✂️'}</span>
                      </div>
                    )}
                    <div style={styles.serviceCardBody}>
                      <h4 style={styles.serviceCardName}>{s.name}</h4>
                      <span style={styles.serviceCardPrice}>
                        R$ {typeof s.price === 'number' ? s.price.toFixed(0) : s.price}
                      </span>
                      {s.description && (
                        <p style={styles.serviceCardDesc}>{s.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={nextService} style={styles.carouselArrow}>
              <ChevronRight size={24} />
            </button>
          </div>
          <div style={styles.carouselDots}>
            {services.map((_, i) => (
              <span
                key={i}
                onClick={() => {
                  setServiceFade(false);
                  setTimeout(() => {
                    setServiceIndex(i);
                    setServiceFade(true);
                  }, 300);
                }}
                style={{
                  ...styles.carouselDot,
                  background: i === serviceIndex ? '#d4af37' : 'rgba(255,255,255,0.2)',
                  width: i === serviceIndex ? 24 : 8,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="sobre" style={styles.sectionAlt}>
        <div style={styles.sectionInner}>
          <div className="landing-about" style={styles.aboutGrid}>
            <div>
              <span style={styles.sectionTag}>Quem Somos</span>
              <h2 style={styles.sectionTitle}>
                Mais que um salão,{' '}
                <span style={styles.gold}>uma experiência completa</span>
              </h2>
              <p style={styles.aboutText}>
                No <span style={styles.logoPHInline}>PH</span> Salão & Barbearia, acreditamos que beleza e cuidado são
                expressões de identidade. Nossa equipe é constantemente
                capacitada nas técnicas e tendências mais modernas do mercado.
              </p>
              <p style={styles.aboutText}>
                Aqui você encontra um ambiente acolhedor, produtos de primeira linha
                e um atendimento personalizado. Venha nos conhecer e descubra a
                experiência PH.
              </p>
              <div style={styles.aboutFeatures}>
                <div style={styles.featureItem}>
                  <Scissors size={20} style={{ color: '#d4af37' }} />
                  <span>Profissionais certificados</span>
                </div>
                <div style={styles.featureItem}>
                  <Clock size={20} style={{ color: '#d4af37' }} />
                  <span>Horário flexível</span>
                </div>
                <div style={styles.featureItem}>
                  <MapPin size={20} style={{ color: '#d4af37' }} />
                  <span>Localização acessível</span>
                </div>
              </div>
            </div>
            <div style={styles.aboutImages}>
              <div style={styles.aboutMirror1}>
                <div style={styles.aboutMirrorFrame}>
                  {aboutGallery1.map((img, i) => (
                    <img
                      key={img}
                      src={img}
                      alt=""
                      style={{
                        ...styles.aboutMirrorImg,
                        opacity: aboutIndex1 === i ? 1 : 0,
                      }}
                    />
                  ))}
                </div>
                <div style={styles.aboutMirrorReflection} />
              </div>
              <div style={styles.aboutMirror2}>
                <div style={styles.aboutMirrorFrame}>
                  {aboutGallery2.map((img, i) => (
                    <img
                      key={img}
                      src={img}
                      alt=""
                      style={{
                        ...styles.aboutMirrorImg,
                        opacity: aboutIndex2 === i ? 1 : 0,
                      }}
                    />
                  ))}
                </div>
                <div style={styles.aboutMirrorReflection} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="localizacao" style={styles.section}>
        <div style={styles.sectionInner}>
          <span style={styles.sectionTag}>Localização</span>
          <h2 style={styles.sectionTitle}>
            Como <span style={styles.gold}>chegar</span>
          </h2>
          <p style={{ ...styles.aboutText, maxWidth: 600, marginBottom: 24 }}>
            Estamos na R. Antônio Otaviano Dourado, 292, no centro de Irecê-BA.
            Use o mapa abaixo para se localizar ou clique em "Como chegar" para
            abrir as direções no seu navegador.
          </p>
          <div className="landing-map" style={styles.mapContainer}>
            <div style={styles.mapWrapper}>
              <MapContainer
                center={[-11.303724486342322, -41.850961799789104]}
                zoom={16}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', borderRadius: 12 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[-11.303724486342322, -41.850961799789104]}
                  icon={L.divIcon({
                    className: '',
                    html: `<div style="width:40px;height:40px;border-radius:50%;background:#c9a84c;border:3px solid #0a0a0a;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4)"><div style="width:14px;height:14px;border-radius:50%;background:#0a0a0a"></div></div>`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                  })}
                >
                  <Popup>
                    <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                      <strong style={{ fontSize: 14 }}>PH Barbearia</strong><br />
                      <span style={{ fontSize: 12, color: '#666' }}>R. Antônio Otaviano Dourado, 292<br />Irecê - BA</span>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="landing-map-sidebar" style={styles.mapSidebar}>
              <div style={styles.mapInfoCard}>
                <MapPin size={20} style={{ color: '#d4af37' }} />
                <div>
                  <strong style={{ fontSize: 14 }}>Endereço</strong>
                  <p style={{ fontSize: 13, color: '#999', marginTop: 2 }}>R. Antônio Otaviano Dourado, 292<br />Irecê - BA</p>
                </div>
              </div>
              <div style={styles.mapInfoCard}>
                <Clock size={20} style={{ color: '#d4af37' }} />
                <div>
                  <strong style={{ fontSize: 14 }}>Horário</strong>
                  <p style={{ fontSize: 13, color: '#999', marginTop: 2 }}>Seg - Sex: 09:00 - 19:00<br />Sáb: 09:00 - 17:00</p>
                </div>
              </div>
              <div style={styles.mapInfoCard}>
                <Phone size={20} style={{ color: '#d4af37' }} />
                <div>
                  <strong style={{ fontSize: 14 }}>Telefone</strong>
                  <p style={{ fontSize: 13, color: '#999', marginTop: 2 }}>(74) 99925-8772</p>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=-11.303724486342322,-41.850961799789104&destination_place_id=PH+Barbearia`}
                target="_blank"
                rel="noreferrer"
                style={styles.directionsBtn}
              >
                <Navigation size={18} />
                Como Chegar
              </a>
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const { latitude, longitude } = pos.coords;
                        window.open(
                          `https://www.google.com/maps/dir/${latitude},${longitude}/-11.303724486342322,-41.850961799789104`,
                          '_blank'
                        );
                      },
                      () => {
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=-11.303724486342322,-41.850961799789104`,
                          '_blank'
                        );
                      }
                    );
                  } else {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=-11.303724486342322,-41.850961799789104`,
                      '_blank'
                    );
                  }
                }}
                style={styles.locationBtn}
              >
                <MapPin size={18} />
                Minha Localização
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="contato" style={styles.ctaSection}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaTitle}>Pronto para transformar seu visual?</h2>
          <p style={styles.ctaDesc}>Agende agora e experimente a diferença PH.</p>
          <div style={styles.ctaActions}>
            <button onClick={() => navigate('/login')} style={styles.btnPrimary}>
              Acessar Sistema
              <ChevronRight size={18} />
            </button>
            <a href="https://wa.me/5574999258772?text=Ol%C3%A1!%20Gostaria%20de%20agendar" target="_blank" rel="noreferrer" style={styles.btnSecondary}>
              <Phone size={16} />
              (74) 99925-8772
            </a>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <div className="landing-footer" style={styles.footerInner}>
          <div style={styles.footerCol}>
            <img src="./Logo_ph.png" alt="PH" style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #d4af37' }} />
            <span style={{ fontWeight: 700, fontSize: 16, marginTop: 8 }}><span style={styles.logoPHInline}>PH</span> Barbearia</span>
            <span style={{ color: '#777', fontSize: 13 }}>Salão & Barbearia</span>
          </div>
          <div style={styles.footerCol}>
            <span style={styles.footerTitle}>Horário</span>
            <span style={styles.footerText}>Seg - Sex: 09:00 - 19:00</span>
            <span style={styles.footerText}>Sábado: 09:00 - 17:00</span>
            <span style={styles.footerText}>Domingo: Fechado</span>
          </div>
          <div style={styles.footerCol}>
            <span style={styles.footerTitle}>Contato</span>
            <span style={styles.footerText}>(74) 99925-8772</span>
            <span style={styles.footerText}>phsalaoebarbearia@gmail.com</span>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <span>© 2024 PH Barbearia. Todos os direitos reservados.</span>
        </div>
      </footer>
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#f0f0f0',
    fontFamily: "'Inter', sans-serif",
  },
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    background: 'rgba(10,10,10,0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  navInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '14px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  navLogo: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '2px solid #d4af37',
    objectFit: 'cover',
  },
  navTitle: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    whiteSpace: 'nowrap',
  },
  navPH: {
    fontFamily: "'Algerian', Georgia, 'Times New Roman', serif",
    fontStyle: 'normal',
    fontWeight: 'bold',
    color: '#d4af37',
    fontSize: 44,
    letterSpacing: 2,
    lineHeight: 1,
  },
  navTitleWhite: {
    fontWeight: 700,
    fontSize: 22,
    color: '#ffffff',
    lineHeight: 1,
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 28,
  },
  navLink: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  navBtn: {
    background: '#c9a84c',
    color: '#0a0a0a',
    border: 'none',
    padding: '10px 22px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  hero: {
    paddingTop: 120,
    paddingBottom: 80,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
  },
  heroInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 60,
  },
  heroLeft: {
    flex: 1,
  },
  heroRight: {
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(212,175,55,0.12)',
    border: '1px solid rgba(212,175,55,0.25)',
    borderRadius: 999,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    color: '#d4af37',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 800,
    lineHeight: 1.15,
    marginBottom: 20,
  },
  gold: {
    color: '#d4af37',
  },
  logoPH: {
    fontFamily: "'Algerian', Georgia, 'Times New Roman', serif",
    fontStyle: 'normal',
    fontWeight: 'bold',
    color: '#d4af37',
    letterSpacing: 2,
    textShadow: '0 0 20px rgba(212,175,55,0.3)',
  },
  logoPHInline: {
    fontFamily: "'Algerian', Georgia, 'Times New Roman', serif",
    fontStyle: 'normal',
    fontWeight: 'bold',
    color: '#d4af37',
    letterSpacing: 1,
  },
  heroDesc: {
    fontSize: 17,
    color: '#999',
    lineHeight: 1.7,
    marginBottom: 32,
    maxWidth: 500,
  },
  heroActions: {
    display: 'flex',
    gap: 12,
    marginBottom: 48,
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#c9a84c',
    color: '#0a0a0a',
    border: 'none',
    padding: '14px 28px',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'transparent',
    color: '#f0f0f0',
    border: '1px solid rgba(255,255,255,0.15)',
    padding: '14px 28px',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  heroStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 800,
    color: '#d4af37',
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    background: 'rgba(255,255,255,0.1)',
  },
  mirrorOuter: {
    position: 'relative',
    width: 480,
    height: 480,
  },
  mirrorRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '3px solid #d4af37',
    boxShadow: '0 0 80px rgba(212,175,55,0.2), inset 0 0 50px rgba(0,0,0,0.3)',
  },
  mirrorInner: {
    position: 'absolute',
    inset: 14,
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mirrorImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.5s ease-in-out',
  },
  mirrorReflection: {
    position: 'absolute',
    top: 20,
    left: 40,
    width: 80,
    height: 40,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
    borderRadius: '50%',
    transform: 'rotate(-30deg)',
    pointerEvents: 'none',
  },
  section: {
    padding: '80px 0',
  },
  sectionAlt: {
    padding: '80px 0',
    background: '#0e0e0e',
  },
  sectionInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 32px',
  },
  sectionTag: {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 700,
    color: '#d4af37',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 800,
    marginBottom: 40,
    lineHeight: 1.2,
  },
  carouselWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 32,
  },
  carouselArrow: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '50%',
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#d4af37',
    flexShrink: 0,
    transition: 'background 0.2s',
  },
  carouselTrack: {
    position: 'relative',
    width: '100%',
    maxWidth: 420,
    height: 480,
    margin: '0 auto',
    overflow: 'hidden',
  },
  serviceCardCarousel: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    background: '#141414',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  servicePhoto: {
    width: '100%',
    height: 280,
    objectFit: 'cover',
    display: 'block',
  },
  servicePhotoPlaceholder: {
    width: '100%',
    height: 280,
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCardBody: {
    padding: '20px 24px 24px',
    textAlign: 'center',
  },
  serviceCardName: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 6,
  },
  serviceCardPrice: {
    fontSize: 24,
    fontWeight: 800,
    color: '#d4af37',
    display: 'block',
    marginBottom: 10,
  },
  serviceCardDesc: {
    fontSize: 14,
    color: '#888',
    lineHeight: 1.5,
    margin: 0,
  },
  carouselDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  carouselDot: {
    height: 8,
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  aboutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 60,
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 16,
    color: '#999',
    lineHeight: 1.7,
    marginBottom: 16,
  },
  aboutFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginTop: 24,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 14,
    fontWeight: 500,
  },
  aboutImages: {
    position: 'relative',
    height: 480,
  },
  aboutMirror1: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 200,
    height: 260,
  },
  aboutMirror2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 320,
    height: 400,
  },
  aboutMirrorFrame: {
    position: 'absolute',
    inset: 0,
    borderRadius: 20,
    overflow: 'hidden',
    background: '#111',
    border: '3px solid rgba(212,175,55,0.35)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 0 30px rgba(0,0,0,0.2)',
  },
  aboutMirrorImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.4s ease-in-out',
  },
  aboutMirrorReflection: {
    position: 'absolute',
    top: 12,
    left: 20,
    width: 80,
    height: 40,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%)',
    borderRadius: 20,
    transform: 'rotate(-15deg)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  ctaSection: {
    padding: '80px 0',
    textAlign: 'center',
  },
  ctaInner: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '0 32px',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 800,
    marginBottom: 12,
  },
  ctaDesc: {
    fontSize: 16,
    color: '#999',
    marginBottom: 32,
  },
  ctaActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
  },
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '40px 0 0',
  },
  footerInner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 32px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 40,
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  footerTitle: {
    fontWeight: 700,
    fontSize: 14,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#777',
  },
  footerBottom: {
    textAlign: 'center',
    padding: '16px 32px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    fontSize: 13,
    color: '#555',
  },
  mapContainer: {
    display: 'flex',
    gap: 20,
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
    background: '#141414',
  },
  mapWrapper: {
    flex: 1,
    minHeight: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapSidebar: {
    width: 280,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  mapInfoCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.03)',
  },
  directionsBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px 20px',
    borderRadius: 12,
    background: '#c9a84c',
    color: '#0a0a0a',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'none',
    marginTop: 8,
  },
  locationBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px 20px',
    borderRadius: 12,
    background: 'transparent',
    color: '#f0f0f0',
    border: '1px solid rgba(255,255,255,0.15)',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default Landing;
