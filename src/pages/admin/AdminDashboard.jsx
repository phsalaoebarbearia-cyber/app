import React, { useEffect, useState } from 'react';
import { Users, Scissors, Calendar, UserPlus, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  loadBarbers,
  loadServices,
  loadAppointments,
  getClients
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
const getClientName = (apt) => apt.clientName || apt.client?.name || '-';
const getBarberName = (apt) => apt.barber?.name || apt.barberName || '-';
const getServiceName = (apt) => apt.service?.name || apt.serviceName || '-';

const formatDate = (value) => {
  if (!value) return '-';
  const parts = String(value).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return new Date(value).toLocaleDateString('pt-BR');
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barbersData, servicesData, appointmentsData, clientsData] = await Promise.all([
          loadBarbers(),
          loadServices(),
          loadAppointments(),
          getClients()
        ]);
        setBarbers(barbersData);
        setServices(servicesData);
        setAppointments(appointmentsData);
        setClients(clientsData);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  if (!user || user.role !== 'admin') return null;

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = appointments.filter((apt) => getDateValue(apt) === today).length;

  const recent = [...appointments]
    .sort((a, b) =>
      `${getDateValue(b)}${b.time || ''}`.localeCompare(`${getDateValue(a)}${a.time || ''}`)
    )
    .slice(0, 5);

  const stats = [
    { icon: Users, value: barbers.length, label: 'Total Profissionais', tone: 'accent' },
    { icon: Scissors, value: services.length, label: 'Total Serviços', tone: 'gold' },
    { icon: Calendar, value: todayCount, label: 'Agendamentos Hoje', tone: 'success' },
    { icon: UserPlus, value: clients.length, label: 'Total Clientes', tone: 'warning' }
  ];

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="subtitle">Bem-vindo, {user?.name || 'Administrador'}</div>
        </div>
      </header>

      <div className="page-body">
        <div className="grid-4 mb-lg">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className={`stat-icon ${stat.tone}`}>
                <stat.icon size={24} />
              </div>
              <div className="stat-info">
                <div className="value">{stat.value}</div>
                <div className="label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Agendamentos Recentes</h2>
            <ClipboardList size={20} className="text-gray" />
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Profissional</th>
                  <th>Serviço</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-gray">
                      Nenhum agendamento encontrado
                    </td>
                  </tr>
                )}
                {recent.map((apt) => (
                  <tr key={apt.id}>
                    <td>{getClientName(apt)}</td>
                    <td>{getBarberName(apt)}</td>
                    <td>{getServiceName(apt)}</td>
                    <td>{formatDate(getDateValue(apt))}</td>
                    <td>
                      <span className={`badge ${statusBadges[apt.status] || 'badge-warning'}`}>
                        {statusLabels[apt.status] || apt.status || 'Pendente'}
                      </span>
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
