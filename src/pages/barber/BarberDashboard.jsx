import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, CheckCircle2, XCircle, Scissors, CalendarX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  loadAppointmentsByBarber,
  loadHours,
  updateAppointmentStatus,
  deleteAppointment,
} from '../../services/FirestoreService';

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'confirmed', label: 'Confirmados' },
  { key: 'today', label: 'Hoje' },
];

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmado', badge: 'badge-success' },
  cancelled: { label: 'Cancelado', badge: 'badge-error' },
  pending: { label: 'Pendente', badge: 'badge-warning' },
};

const DAY_LABELS = {
  sunday: 'Domingo',
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
};

const getTodayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const formatDate = (value) => {
  if (!value) return '-';
  const parts = String(value).slice(0, 10).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return String(value);
};

const formatPrice = (price) => {
  const value = Number(price);
  if (Number.isNaN(value)) return '';
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

const getClientName = (apt) => apt.clientName || apt.client?.name || 'Cliente';

const getServiceName = (apt) => apt.serviceName || apt.service?.name || 'Serviço';

const getServicePrice = (apt) => apt.price ?? apt.service?.price ?? null;

const formatHoursValue = (value) => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '-';
  if (value.closed || value.enabled === false) return 'Fechado';
  const open = value.open || value.opening;
  const close = value.close || value.closing;
  if (open && close) return `${open} - ${close}`;
  return 'Fechado';
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const BarberDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [hours, setHours] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appts, hoursData] = await Promise.all([
          loadAppointmentsByBarber(user.name),
          loadHours(),
        ]);
        setAppointments(appts);
        setHours(hoursData);
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?.name) fetchData();
  }, [user]);

  const today = getTodayString();

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'confirmed') return apt.status === 'confirmed';
    if (filter === 'pending') return apt.status === 'pending';
    if (filter === 'today') return String(apt.date || '').slice(0, 10) === today;
    return true;
  });

  const confirmedCount = filteredAppointments.filter((a) => a.status === 'confirmed').length;
  const pendingCount = filteredAppointments.filter((a) => a.status === 'pending').length;
  const cancelledCount = filteredAppointments.filter((a) => a.status === 'cancelled').length;
  const hourEntries = hours ? Object.entries(hours) : [];

  const handleCancel = async (id) => {
    await deleteAppointment(id);
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
  };

  const handleAccept = async (id) => {
    await updateAppointmentStatus(id, 'confirmed');
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'confirmed' } : apt))
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Olá, {user.name.split(' ')[0]} 👋</h1>
          <div className="subtitle">Sua agenda de hoje</div>
        </div>
      </div>

      <div className="page-body">
        <div className="grid-4">
          <div className="stat-card">
            <div className="stat-icon accent">
              <CalendarDays size={22} />
            </div>
            <div className="stat-info">
              <div className="value">{filteredAppointments.length}</div>
              <div className="label">Total Agendamentos</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">
              <CheckCircle2 size={22} />
            </div>
            <div className="stat-info">
              <div className="value">{confirmedCount}</div>
              <div className="label">Confirmados</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <Clock size={22} />
            </div>
            <div className="stat-info">
              <div className="value">{pendingCount}</div>
              <div className="label">Pendentes</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <XCircle size={22} />
            </div>
            <div className="stat-info">
              <div className="value">{cancelledCount}</div>
              <div className="label">Cancelados</div>
            </div>
          </div>
        </div>

        <div className="toolbar">
          <div className="chip-group">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`chip ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <h2>Agendamentos</h2>
            </div>
            {loading ? (
              <p style={{ color: '#888', fontSize: 14 }}>Carregando...</p>
            ) : filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <CalendarX />
                <h3>Nenhum agendamento encontrado</h3>
                <p>Não há agendamentos para o filtro selecionado.</p>
              </div>
            ) : (
              filteredAppointments.map((apt) => {
                const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                const price = formatPrice(getServicePrice(apt));
                return (
                  <div
                    key={apt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '16px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="avatar-circle">{getInitials(getClientName(apt))}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{getClientName(apt)}</div>
                      <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                        <Scissors size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                        {getServiceName(apt)}
                        {price ? ` • ${price}` : ''}
                      </div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                        <Clock size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                        {apt.time || '-'}
                        <CalendarDays size={12} style={{ verticalAlign: '-2px', margin: '0 4px 0 12px' }} />
                        {formatDate(apt.date)}
                      </div>
                    </div>
                    <span className={`badge ${status.badge}`}>{status.label}</span>
                    {apt.status === 'pending' && (
                      <button
                        className="btn btn-sm btn-accent"
                        onClick={() => handleAccept(apt.id)}
                        style={{ marginRight: 8 }}
                      >
                        <CheckCircle2 size={14} /> Aceitar
                      </button>
                    )}
                    {apt.status !== 'cancelled' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancel(apt.id)}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Horário de Funcionamento</h2>
            </div>
            {hourEntries.length === 0 ? (
              <div className="empty-state">
                <Clock />
                <h3>Horários não configurados</h3>
                <p>Os horários de funcionamento ainda não foram definidos.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <tbody>
                    {hourEntries.map(([key, value]) => (
                      <tr key={key}>
                        <td>{DAY_LABELS[key] || key}</td>
                        <td>{formatHoursValue(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberDashboard;
