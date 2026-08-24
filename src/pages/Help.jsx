import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Phone, MessageCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'Como agendar?',
    answer:
      'Você pode agendar pelo app ou pelo WhatsApp. Na tela inicial, escolha o barbeiro, o serviço e o horário desejado.',
  },
  {
    question: 'Como cancelar?',
    answer:
      'Acesse Meus Agendamentos e clique em Cancelar. Recomendamos cancelar com pelo menos 2 horas de antecedência.',
  },
  {
    question: 'Quais são as formas de pagamento?',
    answer: 'Cartão, PIX ou dinheiro.',
  },
  {
    question: 'Qual é o horário de funcionamento?',
    answer: 'Seg-Sex 09:00-19:00, Sáb 09:00-17:00.',
  },
  {
    question: 'Como falar com a barbearia?',
    answer: 'Entre em contato pelo telefone (74) 99925-8772 ou pelo WhatsApp.',
  },
];

const WHATSAPP_URL = 'https://wa.me/5574999258772';

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div>
      <div className="page-header">
        <h1>Ajuda</h1>
        <p className="subtitle">Perguntas frequentes e contato</p>
      </div>
      <div className="page-body" style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 16 }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: 18,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--white)',
                    fontSize: 15,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <HelpCircle size={18} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    {item.question}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      flexShrink: 0,
                      transition: 'transform 0.2s',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                    }}
                  />
                </button>
                {isOpen && (
                  <p style={{ padding: '0 18px 18px 46px', fontSize: 14, color: 'var(--gray)', lineHeight: 1.6 }}>
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="card">
          <h2 style={{ fontSize: 17, marginBottom: 12 }}>Fale conosco</h2>
          <p style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--gray)' }}>
            <Phone size={18} style={{ color: 'var(--gold)' }} />
            (74) 99925-8772
          </p>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <button className="btn btn-whatsapp" style={{ marginTop: 16, width: '100%' }}>
              <MessageCircle size={18} />
              Abrir WhatsApp
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Help;
