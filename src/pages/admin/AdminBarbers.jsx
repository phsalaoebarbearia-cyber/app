import React, { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2, Power, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  loadBarbers,
  createBarber,
  updateBarber,
  deleteBarber,
  createUser
} from '../../services/FirestoreService';

const iconBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 4,
  color: 'var(--gray)'
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const slugify = (value) =>
  String(value || '')
    .trim()
    .split(' ')[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '123456',
  specialty: '',
  active: true
};

export default function AdminBarbers() {
  const { user } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBarbers = async () => {
    try {
      setBarbers(await loadBarbers());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  if (!user || user.role !== 'admin') return null;

  const filtered = barbers.filter((b) => {
    const term = search.toLowerCase();
    return (
      !term ||
      String(b.name || '').toLowerCase().includes(term) ||
      String(b.email || '').toLowerCase().includes(term) ||
      String(b.specialty || '').toLowerCase().includes(term)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (barber) => {
    setEditing(barber);
    setForm({
      name: barber.name || '',
      email: barber.email || '',
      phone: barber.phone || '',
      password: barber.password || '123456',
      specialty: barber.specialty || '',
      active: barber.active !== false
    });
    setError('');
    setModalOpen(true);
  };

  const handleNameChange = (name) => {
    setForm((prev) => {
      const next = { ...prev, name };
      if (!editing) {
        next.email = `${slugify(name)}@ph.com`;
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.specialty.trim()) {
      setError('Preencha nome, email e especialidade');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateBarber(editing.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          specialty: form.specialty.trim(),
          active: form.active
        });
      } else {
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();
        const barber = {
          id,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          specialty: form.specialty.trim(),
          active: form.active,
          photo: '',
          createdAt
        };
        await createBarber(barber);
        await createUser({
          id,
          name: barber.name,
          email: barber.email,
          phone: barber.phone,
          password: barber.password,
          role: 'barber',
          createdAt
        });
      }
      setModalOpen(false);
      await fetchBarbers();
    } catch (e) {
      console.error(e);
      setError('Erro ao salvar barbeiro');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (barber) => {
    try {
      await updateBarber(barber.id, { active: !barber.active });
      await fetchBarbers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (barber) => {
    if (!window.confirm(`Excluir o barbeiro ${barber.name}?`)) return;
    try {
      await deleteBarber(barber.id);
      await fetchBarbers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Barbeiros</h1>
          <div className="subtitle">Gerencie a equipe da barbearia</div>
        </div>
        <button className="btn btn-accent btn-sm" onClick={openCreate}>
          <Plus size={18} />
          Novo Barbeiro
        </button>
      </header>

      <div className="page-body">
        <div className="toolbar">
          <div className="search-wrapper">
            <Search size={18} />
            <input
              className="search-input"
              placeholder="Buscar por nome, email ou especialidade..."
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
                  <th>Barbeiro</th>
                  <th>Email</th>
                  <th>Especialidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-gray">
                      Nenhum barbeiro encontrado
                    </td>
                  </tr>
                )}
                {filtered.map((barber) => (
                  <tr key={barber.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar-circle">
                          {barber.photo ? <img src={barber.photo} alt={barber.name} /> : getInitials(barber.name)}
                        </div>
                        <span className="fw-600">{barber.name}</span>
                      </div>
                    </td>
                    <td>{barber.email || '-'}</td>
                    <td>{barber.specialty || '-'}</td>
                    <td>
                      <span className={`badge ${barber.active !== false ? 'badge-success' : 'badge-error'}`}>
                        {barber.active !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button style={iconBtn} title="Editar" onClick={() => openEdit(barber)}>
                          <Pencil size={16} />
                        </button>
                        <button
                          style={{ ...iconBtn, color: barber.active !== false ? 'var(--success)' : 'var(--gray)' }}
                          title={barber.active !== false ? 'Desativar' : 'Ativar'}
                          onClick={() => toggleActive(barber)}
                        >
                          <Power size={16} />
                        </button>
                        <button style={{ ...iconBtn, color: 'var(--error)' }} title="Excluir" onClick={() => handleDelete(barber)}>
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
            <h2>{editing ? 'Editar Barbeiro' : 'Novo Barbeiro'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Nome</label>
              <input
                className="form-input"
                placeholder="Nome do barbeiro"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                className="form-input"
                placeholder="email@ph.com"
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
              <label>Especialidade</label>
              <input
                className="form-input"
                placeholder="Ex: Cortes clássicos, Barba..."
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              />
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
                {editing ? 'Salvar Alterações' : 'Criar Barbeiro'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setModalOpen(false)}>
                <X size={16} />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
