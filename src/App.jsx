import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import BarberProfile from './pages/BarberProfile';
import Appointment from './pages/Appointment';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import AppointmentsList from './pages/AppointmentsList';
import Favorites from './pages/Favorites';
import Settings from './pages/Settings';
import Help from './pages/Help';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBarbers from './pages/admin/AdminBarbers';
import AdminServices from './pages/admin/AdminServices';
import AdminSchedule from './pages/admin/AdminSchedule';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminHours from './pages/admin/AdminHours';
import ClientsList from './pages/admin/ClientsList';
import BarberDashboard from './pages/barber/BarberDashboard';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a' }}>
        <p style={{ color: '#888' }}>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  if (user.role === 'admin') {
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/barbeiros" element={<AdminBarbers />} />
          <Route path="/servicos" element={<AdminServices />} />
          <Route path="/agenda" element={<AdminSchedule />} />
          <Route path="/agendamentos" element={<AdminAppointments />} />
          <Route path="/horarios" element={<AdminHours />} />
          <Route path="/clientes" element={<ClientsList />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    );
  }

  if (user.role === 'barber') {
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<BarberDashboard />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/barbeiro/:id" element={<BarberProfile />} />
        <Route path="/agendar" element={<Appointment />} />
        <Route path="/agendar/:barberId" element={<Appointment />} />
        <Route path="/pagar" element={<Payment />} />
        <Route path="/meus-agendamentos" element={<AppointmentsList />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="/ajuda" element={<Help />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
