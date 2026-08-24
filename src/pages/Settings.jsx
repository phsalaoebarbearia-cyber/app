import React, { useState, useRef } from 'react';
import { Bell, Globe, Moon, User, Check, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    aria-pressed={checked}
    style={{
      width: 46,
      height: 26,
      borderRadius: 999,
      border: 'none',
      cursor: 'pointer',
      background: checked ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
      position: 'relative',
      transition: 'background 0.2s',
      flexShrink: 0,
    }}
  >
    <span
      style={{
        position: 'absolute',
        top: 3,
        left: checked ? 23 : 3,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
      }}
    />
  </button>
);

const isValidPhoto = (photo) => {
  if (!photo) return false;
  return photo.startsWith('data:') || photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('./');
};

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [photo, setPhoto] = useState((user?.photo && isValidPhoto(user.photo)) ? user.photo : null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem válido');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const newPhoto = event.target.result;
      setPhoto(newPhoto);
      setSavingPhoto(true);
      await updateProfile({ photo: newPhoto });
      setSavingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setPhoto(null);
    setSavingPhoto(true);
    await updateProfile({ photo: null });
    setSavingPhoto(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Configurações</h1>
        <p className="subtitle">Preferências do aplicativo</p>
      </div>
      <div className="page-body" style={{ maxWidth: 640, margin: '0 auto', display: 'grid', gap: 16 }}>
        <div className="card">
          <h2 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <User size={18} style={{ color: 'var(--gold)' }} />
            Sua Conta
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <div
              style={{
                position: 'relative',
                width: 96,
                height: 96,
                marginBottom: 12,
                cursor: 'pointer',
              }}
              onClick={handlePhotoClick}
              title="Alterar foto"
            >
              {photo ? (
                <img
                  src={photo}
                  alt="Foto de perfil"
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--gold)',
                  }}
                />
              ) : (
                <div
                  className="avatar-circle"
                  style={{ width: 96, height: 96, fontSize: 32 }}
                >
                  {initials}
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--secondary)',
                }}
              >
                <Camera size={16} color="var(--white)" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            <p style={{ fontSize: 13, color: 'var(--gray)' }}>
              {savingPhoto ? 'Salvando...' : 'Clique na foto para alterar'}
            </p>
            {photo && (
              <button
                onClick={handleRemovePhoto}
                disabled={savingPhoto}
                style={{ marginTop: 8, color: 'var(--error)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Remover foto
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Nome</label>
            <p style={{ fontSize: 15 }}>{user.name}</p>
          </div>
          <div className="form-group">
            <label>Email</label>
            <p style={{ fontSize: 15 }}>{user.email}</p>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Telefone</label>
            <p style={{ fontSize: 15 }}>{user.phone || '-'}</p>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Bell size={18} style={{ color: 'var(--gold)' }} />
            Notificações
          </h2>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15 }}>Notificações push</span>
            <Toggle checked={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
            <span style={{ fontSize: 15 }}>Lembretes de agendamento</span>
            <Toggle checked={appointmentReminders} onChange={() => setAppointmentReminders(!appointmentReminders)} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 0 }}>
            <span style={{ fontSize: 15 }}>Promoções e novidades</span>
            <Toggle checked={promotions} onChange={() => setPromotions(!promotions)} />
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Globe size={18} style={{ color: 'var(--gold)' }} />
            Idioma
          </h2>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="language">Selecione o idioma</label>
            <select id="language" className="form-input" defaultValue="pt-BR">
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Moon size={18} style={{ color: 'var(--gold)' }} />
            Aparência
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15 }}>Modo escuro</span>
            <span className="badge badge-success" style={{ gap: 6 }}>
              <Check size={13} />
              Ativo
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--gray)', marginTop: 8 }}>
            O PH Barbearia já utiliza tema escuro por padrão.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
