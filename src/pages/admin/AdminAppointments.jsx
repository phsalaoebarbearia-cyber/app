import React, { useEffect, useMemo, useState } from 'react';
import { Search, CheckCircle, XCircle, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  loadAppointments,
  updateAppointmentStatus
} from '../../services/FirestoreService';

const statusBadges = {
  confirmed: 'badge-success',
  completed: 'badge-gold',
  cancelled: 'badge-error',
  pending: 'badge-warning'
};

const statusLabels = {
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  pending: 'Pendente'
};

const getDateValue = (apt) => apt.date || (apt.createdAt ? String(apt.createdAt).slice(0, 10) : '');

const formatDate = (value) => {
  if (!value) return '-';
  const parts = String(value).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return new Date(value).toLocaleDateString('pt-BR');
};

export default function AdminAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const fetchAppointments = async () => {
    try {
      setAppointments(await loadAppointments());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return appointments
      .filter((apt) => statusFilter === 'all' || apt.status === statusFilter)
      .filter((apt) => !dateFilter || getDateValue(apt) === dateFilter)
      .filter((apt) => {
        if (!term) return true;
        const client = String(apt.clientName || apt.client?.name || '').toLowerCase();
        const barber = String(apt.barber?.name || apt.barberName || '').toLowerCase();
        const service = String(apt.service?.name || apt.serviceName || '').toLowerCase();
        return client.includes(term) || barber.includes(term) || service.includes(term);
      })
      .sort((a, b) =>
        `${getDateValue(b)}${b.time || ''}`.localeCompare(`${getDateValue(a)}${a.time || ''}`)
      );
  }, [appointments, search, statusFilter, dateFilter]);

  if (!user || user.role !== 'admin') return null;

  const markCompleted = async (apt) => {
    try {
      await updateAppointmentStatus(apt.id, 'completed');
      setAppointments((prev) => prev.map((a) => (a.id === apt.id ? { ...a, status: 'completed' } : a)));
    } catch (e) {
      console.error(e);
    }
  };

  const cancelAppointment = async (apt) => {
    if (!window.confirm('Cancelar este agendamento?')) return;
    try {
      await updateAppointmentStatus(apt.id, 'cancelled');
      setAppointments((prev) => prev.map((a) => (a.id === apt.id ? { ...a, status: 'cancelled' } : a)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <style>{`
        .print-only { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff;
            color: #000000;
          }
          #print-area th, #print-area td { color: #000000; border-color: #cccccc; }
          #print-area .print-only { display: block !important; margin-bottom: 16px; }
        }
      `}</style>

      <header className="page-header">
        <div>
          <h1>Agendamentos</h1>
          <div className="subtitle">Gerencie todos os agendamentos</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
          <Printer size={18} />
          Exportar PDF
        </button>
      </header>

      <div className="page-body">
        <div className="toolbar">
          <div className="search-wrapper">
            <Search size={18} />
            <input
              className="search-input"
              placeholder="Buscar por cliente, barbeiro ou serviço..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="confirmed">Confirmados</option>
            <option value="completed">Concluídos</option>
            <option value="cancelled">Cancelados</option>
            <option value="pending">Pendentes</option>
          </select>
          <input
            type="date"
            className="filter-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div className="card" id="print-area">
          <div className="print-only">
            <h2>PH Barbearia - Lista de Agendamentos</h2>
            <p>Gerado em {new Date().toLocaleString('pt-BR')}</p>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Barbeiro</th>
                  <th>Serviço</th>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-gray">
                      Nenhum agendamento encontrado
                    </td>
                  </tr>
                )}
                {filtered.map((apt) => (
                  <tr key={apt.id}>
                    <td>{apt.clientName || apt.client?.name || '-'}</td>
                    <td>{apt.barber?.name || apt.barberName || '-'}</td>
                    <td>{apt.service?.name || apt.serviceName || '-'}</td>
                    <td>{formatDate(getDateValue(apt))}</td>
                    <td>{apt.time || '-'}</td>
                    <td>
                      <span className={`badge ${statusBadges[apt.status] || 'badge-warning'}`}>
                        {statusLabels[apt.status] || apt.status || 'Pendente'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {apt.status !== 'completed' && (
                          <button
                            className="btn btn-sm badge-success"
                            style={{ background: 'rgba(76,175,80,0.15)', color: 'var(--success)' }}
                            title="Marcar como concluído"
                            onClick={() => markCompleted(apt)}
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <button
                            className="btn btn-sm badge-error"
                            style={{ background: 'rgba(244,67,54,0.15)', color: 'var(--error)' }}
                            title="Cancelar agendamento"
                            onClick={() => cancelAppointment(apt)}
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
