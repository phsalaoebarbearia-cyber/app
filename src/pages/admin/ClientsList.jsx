import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getClients,
  loadAppointments,
  createUser,
  updateUser,
  deleteUser,
} from '../../services/FirestoreService';

const iconBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 4,
  color: 'var(--gray)',
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const isValidPhoto = (photo) => {
  if (!photo) return false;
  return photo.startsWith('data:') || photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('./');
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR');
};

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '123456',
  photo: null,
};

export default function ClientsList() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const fetchData = async () => {
    try {
      const [clientsData, appointmentsData] = await Promise.all([
        getClients(),
        loadAppointments(),
      ]);
      setClients(clientsData);
      setAppointments(appointmentsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const appointmentCounts = useMemo(
    () =>
      appointments.reduce((acc, apt) => {
        if (apt.userId) acc[apt.userId] = (acc[apt.userId] || 0) + 1;
        return acc;
      }, {}),
    [appointments]
  );

  if (!user || user.role !== 'admin') return null;

  const filtered = clients.filter((c) => {
    const term = search.toLowerCase();
    return (
      !term ||
      String(c.name || '').toLowerCase().includes(term) ||
      String(c.email || '').toLowerCase().includes(term) ||
      String(c.phone || '').toLowerCase().includes(term)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (client) => {
    setEditing(client);
    setForm({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      password: client.password || '123456',
      photo: (client.photo && isValidPhoto(client.photo)) ? client.photo : null,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Preencha nome e email');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateUser(editing.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          photo: form.photo || null,
        });
      } else {
        const id = Date.now().toString();
        await createUser({
          id,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          role: 'client',
          photo: form.photo || null,
          createdAt: new Date().toISOString(),
        });
      }
      setModalOpen(false);
      await fetchData();
    } catch (e) {
      console.error(e);
      setError('Erro ao salvar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client) => {
    if (!window.confirm(`Excluir o cliente ${client.name}?`)) return;
    try {
      await deleteUser(client.id);
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Clientes</h1>
          <div className="subtitle">{clients.length} clientes cadastrados</div>
        </div>
        <button className="btn btn-accent btn-sm" onClick={openCreate}>
          <Plus size={18} />
          Novo Cliente
        </button>
      </header>

      <div className="page-body">
        <div className="toolbar">
          <div className="search-wrapper">
            <Search size={18} />
            <input
              className="search-input"
              placeholder="Buscar por nome, email ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Data de Cadastro</th>
                  <th>Agendamentos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-gray">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                )}
                {filtered.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar-circle" style={{ cursor: isValidPhoto(client.photo) ? 'pointer' : 'default' }}
                          onClick={() => isValidPhoto(client.photo) && setPreviewPhoto(client.photo)}>
                          {isValidPhoto(client.photo) ? (
                            <img src={client.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            getInitials(client.name)
                          )}
                        </div>
                        <span className="fw-600">{client.name || '-'}</span>
                      </div>
                    </td>
                    <td>{client.email || '-'}</td>
                    <td>{client.phone || '-'}</td>
                    <td>{formatDate(client.createdAt)}</td>
                    <td>
                      <span className="badge badge-gold">{appointmentCounts[client.id] || 0}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={iconBtn} title="Editar" onClick={() => openEdit(client)}>
                          <Pencil size={16} />
                        </button>
                        <button style={{ ...iconBtn, color: 'var(--error)' }} title="Excluir" onClick={() => handleDelete(client)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Nome</label>
              <input
                className="form-input"
                placeholder="Nome do cliente"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                className="form-input"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input
                className="form-input"
                placeholder="(00) 00000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input
                className="form-input"
                type="text"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Foto</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {form.photo ? (
                  <img
                    src={form.photo}
                    alt="Preview"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--border)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'var(--surface)',
                      border: '2px dashed var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gray)',
                      fontSize: 13,
                    }}
                  >
                    Sem foto
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', textAlign: 'center' }}>
                    Carregar foto
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 750 * 1024) {
                          alert('A imagem selecionada é muito grande! Envie uma imagem de até 750KB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => setForm({ ...form, photo: reader.result });
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  {form.photo && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                      onClick={() => setForm({ ...form, photo: null })}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-accent btn-sm" onClick={handleSave} disabled={saving}>
                {editing ? 'Salvar Alterações' : 'Criar Cliente'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setModalOpen(false)}>
                <X size={16} />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <button
            onClick={() => setPreviewPhoto(null)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 28,
              cursor: 'pointer',
              padding: 4,
              lineHeight: 1,
            }}
          >
            <X size={28} />
          </button>
          <img
            src={previewPhoto}
            alt="Foto do cliente"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              borderRadius: 16,
              border: '3px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </>
  );
}
