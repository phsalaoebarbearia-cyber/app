import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  loadAppointments,
  loadBarbers,
  loadHours,
  loadServices
} from '../../services/FirestoreService';

const WEEK_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const WEEK_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const defaultHours = () => ({
  mon: { open: '08:00', close: '22:00', active: true },
  tue: { open: '08:00', close: '22:00', active: true },
  wed: { open: '08:00', close: '22:00', active: true },
  thu: { open: '08:00', close: '22:00', active: true },
  fri: { open: '08:00', close: '22:00', active: true },
  sat: { open: '08:00', close: '20:00', active: true },
  sun: { open: '08:00', close: '13:00', active: false }
});

const toIso = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const toMinutes = (time) => {
  const [h, m] = String(time || '').split(':').map(Number);
  return h * 60 + (m || 0);
};

const fromMinutes = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

const formatDateLong = (iso) => {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  });
};

export default function AdminSchedule() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [hoursData, setHoursData] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(toIso(new Date()));
  const [slotDetails, setSlotDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsData, barbersData, hoursRes, servicesData] = await Promise.all([
          loadAppointments(),
          loadBarbers(),
          loadHours(),
          loadServices()
        ]);
        setAppointments(appointmentsData);
        setBarbers(barbersData);
        setHoursData(hoursRes);
        setServices(servicesData);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const serviceMap = useMemo(
    () => services.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
    [services]
  );

  if (!user || user.role !== 'admin') return null;

  const hours = hoursData ? { ...defaultHours(), ...hoursData } : defaultHours();


  const barberNameOf = (apt) =>
    apt.barber?.name ||
    apt.barberName ||
    (barbers.find((b) => b.id === apt.barberId || b.id === apt.barber)?.name ?? '-');

  const serviceNameOf = (apt) =>
    apt.service?.name ||
    apt.serviceName ||
    (serviceMap[apt.serviceId] || serviceMap[apt.service])?.name ||
    '-';

  const clientNameOf = (apt) => apt.clientName || apt.client?.name || '-';

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const selectedDayKey = WEEK_KEYS[new Date(`${selectedDate}T12:00:00`).getDay()];
  const dayHours = hours[selectedDayKey] || { active: false };
  const isOpen = !!dayHours.active;

  const slots = [];
  if (isOpen) {
    const start = toMinutes(dayHours.open);
    const end = toMinutes(dayHours.close);
    for (let mins = start; mins < end; mins += 30) {
      slots.push(fromMinutes(mins));
    }
  }

  const dayAppointments = appointments.filter((apt) => (apt.date || '').slice(0, 10) === selectedDate);

  const appointmentsForBarber = (barber) =>
    dayAppointments
      .filter((apt) => barberNameOf(apt) === barber.name || apt.barberId === barber.id)
      .sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));

  const isSlotBooked = (barber, slot) =>
    appointmentsForBarber(barber).some((apt) => String(apt.time || '').startsWith(slot));

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Agenda</h1>
          <div className="subtitle">Visualize a agenda dos barbeiros</div>
        </div>
        <CalendarDays size={24} className="text-gold" />
      </header>

      <div className="page-body">
        <div className="day-grid mb-md">
          {days.map((d) => {
            const iso = toIso(d);
            const key = WEEK_KEYS[d.getDay()];
            const open = !!(hours[key] && hours[key].active);
            return (
              <div
                key={iso}
                className={`day-card ${selectedDate === iso ? 'active' : ''} ${open ? '' : 'closed'}`}
                onClick={() => open && setSelectedDate(iso)}
              >
                <div className="day-name">{WEEK_SHORT[d.getDay()]}</div>
                <div className="day-num">{d.getDate()}</div>
                <div className="day-month">
                  {d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 style={{ textTransform: 'capitalize' }}>{formatDateLong(selectedDate)}</h2>
            <span className={`badge ${isOpen ? 'badge-success' : 'badge-error'}`}>
              {isOpen ? `Aberto ${dayHours.open} - ${dayHours.close}` : 'Fechado'}
            </span>
          </div>

          {!isOpen ? (
            <div className="empty-state">
              <CalendarDays size={48} />
              <h3>Barbearia fechada</h3>
              <p>Não há atendimento neste dia</p>
            </div>
          ) : (
            <div
              className="schedule-grid"
              style={{ gridTemplateColumns: `repeat(${Math.max(barbers.length, 1)}, minmax(220px, 1fr))` }}
            >
              {barbers.length === 0 && (
                <div className="schedule-cell text-gray fs-sm">Nenhum barbeiro cadastrado</div>
              )}
              {barbers.map((barber) => {
                const barberAppts = appointmentsForBarber(barber);
                return (
                  <div key={barber.id} className="schedule-cell">
                    <div className="fw-700 fs-sm mb-sm" style={{ color: 'var(--gold)' }}>
                      {barber.name}
                    </div>
                    {barberAppts.map((apt) => (
                      <div
                        key={apt.id}
                        style={{
                          padding: '6px 8px',
                          marginBottom: 6,
                          borderRadius: 6,
                          background: 'rgba(233, 69, 96, 0.12)',
                          borderLeft: '3px solid var(--accent)'
                        }}
                      >
                        <div className="fw-600 fs-sm">{apt.time}</div>
                        <div className="fs-sm">{clientNameOf(apt)}</div>
                        <div className="fs-sm text-gray">{serviceNameOf(apt)}</div>
                      </div>
                    ))}
                    {slots.filter((slot) => !isSlotBooked(barber, slot)).length > 0 && (
                      <>
                        <div className="text-gray mt-sm mb-sm" style={{ fontSize: 11 }}>
                          Horários livres
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {slots
                            .filter((slot) => !isSlotBooked(barber, slot))
                            .map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                className="chip"
                                style={{ padding: '4px 10px', fontSize: 12 }}
                                onClick={() =>
                                  setSlotDetails({ time: slot, barberName: barber.name })
                                }
                              >
                                {slot}
                              </button>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {slotDetails && (
        <div className="modal-overlay" onClick={() => setSlotDetails(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Horário Livre</h2>
            <div className="summary-card mb-md">
              <div className="summary-row">
                <span className="label">Data</span>
                <span className="value" style={{ textTransform: 'capitalize' }}>
                  {formatDateLong(selectedDate)}
                </span>
              </div>
              <div className="summary-row">
                <span className="label">Horário</span>
                <span className="value">{slotDetails.time}</span>
              </div>
              <div className="summary-row">
                <span className="label">Profissional</span>
                <span className="value">{slotDetails.barberName}</span>
              </div>
              <div className="summary-row">
                <span className="label">Status</span>
                <span className="badge badge-success">Disponível</span>
              </div>
            </div>
            <p className="text-gray fs-sm mb-md">
              Este horário está livre e pode ser agendado por um cliente.
            </p>
            <button className="btn btn-outline btn-sm" onClick={() => setSlotDetails(null)}>
              <X size={16} />
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
