import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getClients, loadAppointments } from '../../services/FirestoreService';

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

export default function ClientsList() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, appointmentsData] = await Promise.all([
          getClients(),
          loadAppointments()
        ]);
        setClients(clientsData);
        setAppointments(appointmentsData);
      } catch (e) {
        console.error(e);
      }
    };
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

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Clientes</h1>
          <div className="subtitle">{clients.length} clientes cadastrados</div>
        </div>
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
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-gray">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                )}
                {filtered.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar-circle">
                          {isValidPhoto(client.photo) ? <img src={client.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : getInitials(client.name)}
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
