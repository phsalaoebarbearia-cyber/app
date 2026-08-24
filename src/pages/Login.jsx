import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      alert(result.error || 'Erro ao fazer login');
      return;
    }
    navigate('/');
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#777',
            fontSize: 13,
            marginBottom: 20,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          Voltar ao site
        </Link>
        <div className="auth-logo">
          <img src="./Logo_ph.png" alt="PH Barbearia" />
          <h1>PH Barbearia</h1>
          <p>Salão &amp; Barbearia</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="form-input-icon">
              <Mail size={18} className="icon" />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="form-input-icon">
              <Lock size={18} className="icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-accent" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="link-text">
            Não tem conta?{' '}
            <span onClick={() => navigate('/register')}>Cadastre-se</span>
          </p>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#555', marginTop: 16 }}>
            Acesso administrativo: ph@barbearia.com
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
