import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, Scissors, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loadAppointmentsByUser, updateAppointmentStatus } from '../services/FirestoreService';

const STATUS_LABELS = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const STATUS_BADGES = {
  pending: 'badge-warning',
  confirmed: 'badge-success',
  completed: 'badge-gold',
  cancelled: 'badge-error',
};

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'confirmed', label: 'Confirmados' },
  { key: 'cancelled', label: 'Cancelados' },
  { key: 'completed', label: 'Concluídos' },
];

const formatDate = (value) => {
  if (!value) return '';
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('pt-BR');
};

const AppointmentsList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      const data = await loadAppointmentsByUser(user.id);
      data.sort((a, b) => String(b.date).localeCompare(String(a.date)));
      setAppointments(data);
      setLoading(false);
    };
    if (user?.id) fetchAppointments();
  }, [user]);

  const handleCancel = async (id) => {
    await updateAppointmentStatus(id, 'cancelled');
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
    );
  };

  const filtered =
    filter === 'all'
      ? appointments
      : appointments.filter((a) => a.status === filter);

  return (
    <div>
      <div className="page-header">
        <h1>Meus Agendamentos</h1>
        <p className="subtitle">Acompanhe seus horários marcados</p>
      </div>
      <div className="page-body">
        <div className="toolbar">
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

        {loading ? (
          <p style={{ color: 'var(--gray)', textAlign: 'center', padding: 40 }}>Carregando...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <CalendarDays />
            <h3>Nenhum agendamento encontrado</h3>
            <p>Você ainda não possui agendamentos neste filtro.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.map((appointment) => (
              <div className="card" key={appointment.id}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
                      <Scissors size={16} style={{ color: 'var(--gold)' }} />
                      {appointment.service?.name || appointment.serviceName || 'Serviço'}
                    </h4>
                    <p style={{ fontSize: 13, color: 'var(--gray)', marginTop: 6 }}>
                      Barbeiro: {appointment.barber?.name || appointment.barberName || '-'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10, fontSize: 13, color: 'var(--gray)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CalendarDays size={15} />
                        {formatDate(appointment.date)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={15} />
                        {appointment.time}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                    <span className={`badge ${STATUS_BADGES[appointment.status] || 'badge-accent'}`}>
                      {STATUS_LABELS[appointment.status] || appointment.status}
                    </span>
                    {appointment.status === 'pending' && (
                      <button className="btn btn-outline btn-sm" onClick={() => handleCancel(appointment.id)}>
                        <XCircle size={15} />
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsList;
