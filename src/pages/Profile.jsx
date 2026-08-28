import React, { useState, useRef } from 'react';
import { Mail, Phone, LogOut, Pencil, Save, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  client: 'Cliente',
  barber: 'Profissional',
  admin: 'Administrador',
};

const isValidPhoto = (photo) => {
  if (!photo) return false;
  return photo.startsWith('data:') || photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('./');
};

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone] = useState(user?.phone || '');
  const [photo, setPhoto] = useState((user?.photo && isValidPhoto(user.photo)) ? user.photo : null);
  const [loading, setLoading] = useState(false);
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

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem válido');
      return;
    }

    if (file.size > 750 * 1024) {
      alert('A imagem selecionada é muito grande! Envie uma imagem de até 750KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    await updateProfile({ name, email, phone, photo });
    setLoading(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhoto((user?.photo && isValidPhoto(user.photo)) ? user.photo : null);
    setEditing(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Meu Perfil</h1>
        <p className="subtitle">Gerencie suas informações pessoais</p>
      </div>
      <div className="page-body">
        <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
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

            {!editing && (
              <>
                <h2 style={{ fontSize: 20 }}>{user.name}</h2>
                <span className="badge badge-gold" style={{ marginTop: 6 }}>
                  {ROLE_LABELS[user.role] || user.role}
                </span>
                {photo && (
                  <button
                    className="btn-ghost"
                    style={{ marginTop: 8, color: 'var(--gray)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setPhoto(null); updateProfile({ photo: null }); }}
                  >
                    Remover foto
                  </button>
                )}
              </>
            )}
          </div>

          {editing ? (
            <>
              <div className="form-group">
                <label htmlFor="profile-name">Nome</label>
                <input
                  id="profile-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="profile-phone">Telefone</label>
                <input
                  id="profile-phone"
                  type="tel"
                  className="form-input"
                  value={phone}
                  readOnly
                  disabled
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-accent" onClick={handleSave} disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button className="btn btn-outline" onClick={handleCancel} disabled={loading}>
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Email</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--white)', fontSize: 15 }}>
                  <Mail size={18} style={{ color: 'var(--gold)' }} />
                  {user.email}
                </div>
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--white)', fontSize: 15 }}>
                  <Phone size={18} style={{ color: 'var(--gold)' }} />
                  {user.phone || '-'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-accent" onClick={() => setEditing(true)}>
                  <Pencil size={18} />
                  Editar Perfil
                </button>
              </div>
            </>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '24px 0' }} />
          <button className="btn btn-outline" onClick={logout} style={{ width: '100%' }}>
            <LogOut size={18} />
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
