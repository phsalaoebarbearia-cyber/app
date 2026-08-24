import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, Scissors, Upload, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  loadServices,
  createService,
  updateService,
  deleteService
} from '../../services/FirestoreService';

const iconBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 4,
  color: 'var(--gray)'
};

const formatPrice = (value) => Number(value || 0).toFixed(2).replace('.', ',');

const emptyForm = {
  name: '',
  price: '',
  duration: '',
  description: '',
  photo: null,
  active: true
};

export default function AdminServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    try {
      setServices(await loadServices());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (!user || user.role !== 'admin') return null;

  const filtered = services.filter((s) => {
    const term = search.toLowerCase();
    return !term || String(s.name || '').toLowerCase().includes(term);
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (service) => {
    setEditing(service);
    setForm({
      name: service.name || '',
      price: service.price ?? '',
      duration: service.duration ?? '',
      description: service.description || '',
      photo: service.photo || null,
      active: service.active !== false
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.price === '' || !form.duration) {
      setError('Preencha nome, preço e duração');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = {
        name: form.name.trim(),
        price: Number(form.price),
        duration: Number(form.duration),
        description: form.description.trim(),
        photo: form.photo || null,
        active: form.active
      };
      if (editing) {
        await updateService(editing.id, data);
      } else {
        await createService({
          id: Date.now().toString(),
          ...data,
          createdAt: new Date().toISOString()
        });
      }
      setModalOpen(false);
      await fetchServices();
    } catch (e) {
      console.error(e);
      setError('Erro ao salvar serviço');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Excluir o serviço ${service.name}?`)) return;
    try {
      await deleteService(service.id);
      await fetchServices();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Foto deve ter no máximo 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, photo: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Serviços</h1>
          <div className="subtitle">Gerencie os serviços oferecidos</div>
        </div>
        <button className="btn btn-accent btn-sm" onClick={openCreate}>
          <Plus size={18} />
          Novo Serviço
        </button>
      </header>

      <div className="page-body">
        <div className="toolbar">
          <div className="search-wrapper">
            <Search size={18} />
            <input
              className="search-input"
              placeholder="Buscar serviço..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card empty-state">
            <Scissors size={48} />
            <h3>Nenhum serviço encontrado</h3>
            <p>Crie um novo serviço para começar</p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map((service) => (
              <div key={service.id} className="service-card-web" onClick={() => openEdit(service)}>
                <div className="icon-wrap">
                  {service.photo ? (
                    <img src={service.photo} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    <Scissors size={26} />
                  )}
                </div>
                <h4>{service.name}</h4>
                {service.description && (
                  <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 8, textAlign: 'center' }}>
                    {service.description}
                  </div>
                )}
                <div className="price">R$ {formatPrice(service.price)}</div>
                <div className="duration">{service.duration} min</div>
                <div className="mt-md" style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <span className={`badge ${service.active !== false ? 'badge-success' : 'badge-error'}`}>
                    {service.active !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="mt-sm" style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <button style={iconBtn} title="Editar" onClick={(e) => { e.stopPropagation(); openEdit(service); }}>
                    <Pencil size={16} />
                  </button>
                  <button
                    style={{ ...iconBtn, color: 'var(--error)' }}
                    title="Excluir"
                    onClick={(e) => { e.stopPropagation(); handleDelete(service); }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Editar Serviço' : 'Novo Serviço'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Nome</label>
              <input
                className="form-input"
                placeholder="Nome do serviço"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Preço (R$)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Duração (minutos)</label>
              <input
                className="form-input"
                type="number"
                min="5"
                step="5"
                placeholder="30"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Descrição do serviço (opcional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ resize: 'vertical', minHeight: 60 }}
              />
            </div>
            <div className="form-group">
              <label>Foto do Serviço</label>
              {form.photo ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={form.photo}
                    alt="Preview"
                    style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--border)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, photo: null })}
                    style={{ position: 'absolute', top: -6, right: -6, background: 'var(--error)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', border: '2px dashed var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--gray)', fontSize: 14 }}>
                  <Upload size={18} />
                  Escolher foto (máx. 2MB)
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
            <div className="form-group">
              <label>Status</label>
              <button
                type="button"
                className={`chip ${form.active ? 'active' : ''}`}
                onClick={() => setForm({ ...form, active: !form.active })}
              >
                {form.active ? 'Ativo' : 'Inativo'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-accent btn-sm" onClick={handleSave} disabled={saving}>
                {editing ? 'Salvar Alterações' : 'Criar Serviço'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
