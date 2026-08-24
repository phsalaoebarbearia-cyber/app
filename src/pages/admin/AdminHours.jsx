import React, { useEffect, useState } from 'react';
import { Clock, Save, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loadHours, saveHours } from '../../services/FirestoreService';

const DAYS = [
  { key: 'mon', label: 'Segunda-feira' },
  { key: 'tue', label: 'Terça-feira' },
  { key: 'wed', label: 'Quarta-feira' },
  { key: 'thu', label: 'Quinta-feira' },
  { key: 'fri', label: 'Sexta-feira' },
  { key: 'sat', label: 'Sábado' },
  { key: 'sun', label: 'Domingo' }
];

const defaultHours = () => ({
  mon: { open: '09:00', close: '19:00', active: true },
  tue: { open: '09:00', close: '19:00', active: true },
  wed: { open: '09:00', close: '19:00', active: true },
  thu: { open: '09:00', close: '19:00', active: true },
  fri: { open: '09:00', close: '19:00', active: true },
  sat: { open: '09:00', close: '17:00', active: true },
  sun: { open: '09:00', close: '17:00', active: false }
});

export default function AdminHours() {
  const { user } = useAuth();
  const [hours, setHours] = useState(defaultHours());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadHours();
        if (data) {
          const base = defaultHours();
          DAYS.forEach(({ key }) => {
            if (data[key]) {
              base[key] = {
                open: data[key].open || base[key].open,
                close: data[key].close || base[key].close,
                active: data[key].active !== false
              };
            }
          });
          setHours(base);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  if (!user || user.role !== 'admin') return null;

  const toggleDay = (key) => {
    setHours((prev) => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active }
    }));
    setSaved(false);
  };

  const updateTime = (key, field, value) => {
    setHours((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveHours(hours);
      setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Horários</h1>
          <div className="subtitle">Configure o horário de funcionamento</div>
        </div>
      </header>

      <div className="page-body">
        {saved && (
          <div className="alert alert-success">
            <Check size={18} />
            Horários salvos com sucesso!
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h2>Horário de Funcionamento</h2>
            <Clock size={20} className="text-gray" />
          </div>

          {DAYS.map(({ key, label }) => (
            <div
              key={key}
              className="form-group"
              style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}
            >
              <label style={{ flex: 1, minWidth: 150, marginBottom: 0 }}>{label}</label>
              <button
                type="button"
                className={`chip ${hours[key].active ? 'active' : ''}`}
                onClick={() => toggleDay(key)}
              >
                {hours[key].active ? 'Aberto' : 'Fechado'}
              </button>
              <input
                type="time"
                className="form-input"
                style={{ width: 130 }}
                value={hours[key].open}
                disabled={!hours[key].active}
                onChange={(e) => updateTime(key, 'open', e.target.value)}
              />
              <span className="text-gray">até</span>
              <input
                type="time"
                className="form-input"
                style={{ width: 130 }}
                value={hours[key].close}
                disabled={!hours[key].active}
                onChange={(e) => updateTime(key, 'close', e.target.value)}
              />
            </div>
          ))}

          <button className="btn btn-accent mt-md" style={{ width: 'auto' }} onClick={handleSave} disabled={saving}>
            <Save size={18} />
            Salvar Horários
          </button>
        </div>
      </div>
    </>
  );
}
