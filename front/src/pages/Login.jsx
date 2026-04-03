import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || '/profile';

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Заполните все поля');

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <header>
          <div className="auth-logo"><div className="logo-dot" /> SmartTest</div>
          <h1>Вход</h1>
          <p>Введите данные вашего аккаунта</p>
        </header>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <i className="bi bi-exclamation-circle" /> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input id="email" name="email" type="email" className="form-control"
              placeholder="you@example.com" value={form.email} onChange={onChange}
              autoComplete="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Пароль</label>
            <input id="password" name="password" type="password" className="form-control"
              placeholder="••••••••" value={form.password} onChange={onChange}
              autoComplete="current-password" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading
              ? <><i className="bi bi-arrow-repeat" /> Входим...</>
              : <><i className="bi bi-box-arrow-in-right" /> Войти</>}
          </button>
        </form>

        <p className="auth-footer">Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
      </div>
    </section>
  );
};
