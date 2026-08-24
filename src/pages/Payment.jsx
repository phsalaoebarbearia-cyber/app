import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, QrCode, Banknote, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { loadServices } from '../services/FirestoreService';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const amountParam = searchParams.get('amount');
  const serviceIdParam = searchParams.get('serviceId');

  const [service, setService] = useState(null);
  const [method, setMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceIdParam) return;
      try {
        const data = await loadServices();
        setService(data.find((s) => s.id === serviceIdParam) || null);
      } catch {}
    };
    fetchService();
  }, [serviceIdParam]);

  const formatCardNumber = (text) => {
    const numbers = text.replace(/\D/g, '');
    setCardNumber(numbers.replace(/(\d{4})/g, '$1 ').trim().slice(0, 19));
  };

  const formatExpiryDate = (text) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) {
      setExpiryDate(numbers);
    } else {
      setExpiryDate(`${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`);
    }
  };

  const handlePayment = () => {
    setError('');
    if (method === 'card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        setError('Preencha todos os dados do cartão.');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        setError('Número do cartão inválido.');
        return;
      }
    }
    setSuccess(true);
    setTimeout(() => navigate('/'), 1800);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Pagamento</h1>
          <p className="subtitle">{service ? service.name : 'Finalize seu pagamento com segurança'}</p>
        </div>
      </div>

      <div className="page-body">
        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={16} /> Pagamento confirmado com sucesso! Redirecionando...
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="card mb-lg" style={{ textAlign: 'center' }}>
          <p className="text-gray fs-sm">Valor Total</p>
          <div style={{ fontSize: 44, fontWeight: 700, color: 'var(--gold)' }}>
            R$ {amountParam || (service ? service.price : '--')}
          </div>
          {service && <p className="text-gold fw-600 mt-sm">{service.name}</p>}
        </div>

        <div className="page-section">
          <h2>Forma de Pagamento</h2>
          <div className="chip-group">
            <button
              className={`chip ${method === 'card' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setMethod('card')}
            >
              <CreditCard size={15} /> Cartão
            </button>
            <button
              className={`chip ${method === 'pix' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setMethod('pix')}
            >
              <QrCode size={15} /> PIX
            </button>
            <button
              className={`chip ${method === 'cash' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setMethod('cash')}
            >
              <Banknote size={15} /> Dinheiro
            </button>
          </div>
        </div>

        {method === 'card' && (
          <div className="card mb-lg">
            <div className="form-group">
              <label htmlFor="card-number">Número do Cartão</label>
              <input
                id="card-number"
                type="text"
                inputMode="numeric"
                className="form-input"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => formatCardNumber(e.target.value)}
                maxLength={19}
              />
            </div>
            <div className="form-group">
              <label htmlFor="card-name">Nome no Cartão</label>
              <input
                id="card-name"
                type="text"
                className="form-input"
                placeholder="Como está impresso no cartão"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="card-expiry">Validade</label>
                <input
                  id="card-expiry"
                  type="text"
                  inputMode="numeric"
                  className="form-input"
                  placeholder="MM/AA"
                  value={expiryDate}
                  onChange={(e) => formatExpiryDate(e.target.value)}
                  maxLength={5}
                />
              </div>
              <div className="form-group">
                <label htmlFor="card-cvv">CVV</label>
                <input
                  id="card-cvv"
                  type="password"
                  inputMode="numeric"
                  className="form-input"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}

        {method === 'pix' && (
          <div className="card mb-lg" style={{ textAlign: 'center' }}>
            <QrCode size={40} className="text-gold" />
            <h3 className="mt-md">Chave PIX</h3>
            <p className="fw-600 mt-sm" style={{ fontSize: 16 }}>
              phbarbearia@email.com
            </p>
            <p className="text-gray fs-sm mt-sm">
              Realize o pagamento via PIX e apresente o comprovante no salão.
            </p>
          </div>
        )}

        {method === 'cash' && (
          <div className="card mb-lg" style={{ textAlign: 'center' }}>
            <Banknote size={40} className="text-gold" />
            <h3 className="mt-md">Pague na Barbearia</h3>
            <p className="text-gray fs-sm mt-sm">
              O pagamento em dinheiro deve ser feito diretamente no salão, no momento do
              atendimento. Chegue com alguns minutos de antecedência.
            </p>
          </div>
        )}

        <button className="btn btn-gold" onClick={handlePayment} disabled={success}>
          <Lock size={18} /> Confirmar Pagamento
        </button>
      </div>
    </div>
  );
};

export default Payment;
