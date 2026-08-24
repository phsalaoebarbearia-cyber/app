import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Scissors,
  CalendarDays,
  Clock,
  XCircle,
  CheckCircle2,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  loadServices,
  loadBarbers,
  loadHours,
  loadAppointments,
  createAppointment,
} from '../services/FirestoreService';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const DEFAULT_HOURS = {
  mon: { active: true, open: '09:00', close: '19:00' },
  tue: { active: true, open: '09:00', close: '19:00' },
  wed: { active: true, open: '09:00', close: '19:00' },
  thu: { active: true, open: '09:00', close: '19:00' },
  fri: { active: true, open: '09:00', close: '19:00' },
  sat: { active: true, open: '09:00', close: '17:00' },
  sun: { active: false, open: '09:00', close: '13:00' },
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const isValidPhoto = (photo) => {
  if (!photo) return false;
  return photo.startsWith('data:') || photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('./');
};

const generateTimeSlots = (start, end) => {
  const slots = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let totalMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (totalMin < endMin) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    totalMin += 30;
  }
  return slots;
};

const Appointment = () => {
  const { barberId: pathBarberId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const barberIdParam = searchParams.get('barberId') || pathBarberId;
  const serviceIdParam = searchParams.get('serviceId');

  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [appointments, setAppointments] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, barbersData, hoursData, apptsData] = await Promise.all([
          loadServices().catch(() => []),
          loadBarbers().catch(() => []),
          loadHours().catch(() => null),
          loadAppointments().catch(() => []),
        ]);
        const activeServices = servicesData.filter((s) => s.active !== false);
        const activeBarbers = barbersData.filter((b) => b.active !== false);
        setServices(activeServices);
        setBarbers(activeBarbers);
        if (hoursData) setHours(hoursData);
        setAppointments(apptsData);

        if (serviceIdParam) {
          const svc = activeServices.find((s) => s.id === serviceIdParam);
          if (svc) setSelectedService(svc);
        }
        if (barberIdParam) {
          const brb = activeBarbers.find((b) => b.id === barberIdParam);
          if (brb) setSelectedBarber(brb);
        }
      } catch {
        setError('Erro ao carregar dados. Tente novamente.');
      }
    };
    fetchData();
  }, [barberIdParam, serviceIdParam]);

  const days = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayKey = DAY_KEYS[date.getDay()];
    const dayHours = hours[dayKey] || { active: false };
    days.push({
      id: i.toString(),
      date,
      dayKey,
      dayName: DAY_NAMES[date.getDay()],
      dayNumber: date.getDate(),
      month: MONTH_NAMES[date.getMonth()],
      isClosed: !dayHours.active,
    });
  }

  const selectedDayHours = selectedDate ? hours[selectedDate.dayKey] || { active: false } : null;
  const timeSlots =
    selectedDayHours && selectedDayHours.active
      ? generateTimeSlots(selectedDayHours.open, selectedDayHours.close)
      : [];

  const isSlotTaken = (time) => {
    if (!selectedDate || !selectedBarber) return false;
    return appointments.some(
      (apt) =>
        apt.status !== 'cancelled' &&
        new Date(apt.date).toDateString() === selectedDate.date.toDateString() &&
        apt.time === time &&
        apt.barber?.name === selectedBarber.name
    );
  };

  const handleSelectDay = (day) => {
    setSelectedDate(day);
    setSelectedTime(null);
  };

  const canConfirm = Boolean(selectedService && selectedBarber && selectedDate && selectedTime);

  const handleConfirm = async () => {
    if (!canConfirm || confirming) return;

    if (isSlotTaken(selectedTime)) {
      setError('Este horário já está agendado. Escolha outro.');
      return;
    }

    setConfirming(true);
    setError('');
    try {
      await createAppointment({
        id: Date.now().toString(),
        userId: user.id,
        clientName: user.name,
        barber: {
          id: selectedBarber.id,
          name: selectedBarber.name,
          specialty: selectedBarber.specialty,
          email: selectedBarber.email,
        },
        service: {
          id: selectedService.id,
          name: selectedService.name,
          price: selectedService.price,
        },
        date: selectedDate.date.toISOString(),
        time: selectedTime,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 1800);
    } catch {
      setError('Não foi possível confirmar o agendamento.');
      setConfirming(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Agendar Horário</h1>
          <p className="subtitle">Siga os passos para concluir seu agendamento</p>
        </div>
      </div>

      <div className="page-body">
        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={16} /> Agendamento confirmado com sucesso! Redirecionando...
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="page-section">
          <h2>1. Escolha o Serviço</h2>
          <div className="grid-4">
            {services.map((service) => (
              <div
                key={service.id}
                className={`service-card-web ${selectedService?.id === service.id ? 'selected' : ''}`}
                onClick={() => setSelectedService(service)}
              >
                <div className="icon-wrap">
                  {service.photo ? (
                    <img src={service.photo} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    <Scissors size={24} />
                  )}
                </div>
                <h4>{service.name}</h4>
                {service.description && (
                  <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 8, textAlign: 'center' }}>
                    {service.description}
                  </div>
                )}
                <div className="price">R$ {service.price}</div>
                <div className="duration">{service.duration}</div>
              </div>
            ))}
            {services.length === 0 && <p className="text-gray">Carregando serviços...</p>}
          </div>
        </div>

        <div className="page-section">
          <h2>2. Escolha o Barbeiro</h2>
          <div className="chip-group">
            {barbers.map((barber) => (
              <button
                key={barber.id}
                className={`chip ${selectedBarber?.id === barber.id ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={() => setSelectedBarber(barber)}
              >
                {isValidPhoto(barber.photo) ? (
                  <img
                    className="avatar-circle"
                    src={barber.photo}
                    alt={barber.name}
                    style={{ width: 26, height: 26, borderWidth: 0 }}
                  />
                ) : (
                  <span
                    className="avatar-circle"
                    style={{ width: 26, height: 26, fontSize: 10, borderWidth: 0 }}
                  >
                    {getInitials(barber.name)}
                  </span>
                )}
                {barber.name.split(' ')[0]}
              </button>
            ))}
            {barbers.length === 0 && <p className="text-gray">Carregando barbeiros...</p>}
          </div>
        </div>

        <div className="page-section">
          <h2>3. Escolha o Dia</h2>
          <div className="day-grid">
            {days.map((day) => (
              <button
                key={day.id}
                className={`day-card ${selectedDate?.id === day.id ? 'active' : ''} ${day.isClosed ? 'closed' : ''}`}
                onClick={() => !day.isClosed && handleSelectDay(day)}
                disabled={day.isClosed}
              >
                <div className="day-name">{day.dayName}</div>
                <div className="day-num">{day.dayNumber}</div>
                <div className="day-month">{day.month}</div>
              </button>
            ))}
          </div>
        </div>

        {selectedDate && selectedDayHours && !selectedDayHours.active && (
          <div className="alert alert-error">
            <XCircle size={16} /> Fechado neste dia
          </div>
        )}

        {selectedDate && selectedDayHours?.active && (
          <div className="page-section">
            <h2>4. Escolha o Horário</h2>
            <div className="time-grid">
              {timeSlots.map((time) => {
                const taken = isSlotTaken(time);
                return (
                  <button
                    key={time}
                    className={`time-slot ${selectedTime === time ? 'active' : ''} ${taken ? 'taken' : ''}`}
                    onClick={() => !taken && setSelectedTime(time)}
                    disabled={taken}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {canConfirm && (
          <div className="page-section">
            <h2>Resumo do Agendamento</h2>
            <div className="summary-card">
              <div className="summary-row">
                <span className="label">Serviço</span>
                <span className="value">{selectedService.name}</span>
              </div>
              <div className="summary-row">
                <span className="label">Barbeiro</span>
                <span className="value">{selectedBarber.name}</span>
              </div>
              <div className="summary-row">
                <span className="label">Data</span>
                <span className="value">
                  {selectedDate.dayName}, {selectedDate.dayNumber} de {selectedDate.month}
                </span>
              </div>
              <div className="summary-row">
                <span className="label">Horário</span>
                <span className="value">{selectedTime}</span>
              </div>
              <div className="summary-total">
                <span className="label">Total</span>
                <span className="value">R$ {selectedService.price}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid-2 mt-lg">
          <button
            className="btn btn-accent"
            disabled={!canConfirm || confirming || success}
            onClick={handleConfirm}
          >
            <CheckCircle2 size={18} /> {confirming ? 'Confirmando...' : 'Confirmar Agendamento'}
          </button>
          <button
            className="btn btn-gold"
            disabled={!selectedService || success}
            onClick={() =>
              navigate(`/pagar?amount=${selectedService.price}&serviceId=${selectedService.id}`)
            }
          >
            <CreditCard size={18} /> Pagar Agora
          </button>
        </div>

        {!selectedDate && (
          <p className="text-gray fs-sm mt-md" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarDays size={14} /> Selecione um dia para ver os horários disponíveis.
          </p>
        )}
        {selectedDate && selectedTime === null && selectedDayHours?.active && (
          <p className="text-gray fs-sm mt-md" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> Selecione um horário livre para continuar.
          </p>
        )}
      </div>
    </div>
  );
};

export default Appointment;
