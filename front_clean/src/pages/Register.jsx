import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [form, setForm]       = useState({ username:'', email:'', password:'', confirm:'', role:'student' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const onChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) return setError('Заполните все поля');
    if (form.password.length < 6)       return setError('Пароль минимум 6 символов');
    if (form.password !== form.confirm) return setError('Пароли не совпадают');
    setLoading(true);
    try {
      await register(form);
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <section className="auth-page">
      <div className="auth-card" style={{maxWidth:460}}>
        <header>
          <div className="auth-logo"><div className="logo-dot" /> SmartTest</div>
          <h1>Регистрация</h1>
          <p>Создайте аккаунт для доступа к платформе</p>
        </header>

        {error && <div className="alert alert-error" style={{marginBottom:16}}><i className="bi bi-exclamation-circle" /> {error}</div>}

        {/* Role selector */}
        <div className="role-selector">
          {[
            {v:'student', label:'Студент',       icon:'bi-mortarboard',      desc:'Прохожу тесты и учусь'},
            {v:'teacher', label:'Преподаватель', icon:'bi-person-workspace', desc:'Создаю тесты для учеников'},
          ].map(r => (
            <button key={r.v} type="button"
              className={`role-card ${form.role===r.v?'role-card-active':''}`}
              onClick={() => setForm(p => ({...p, role:r.v}))}>
              <i className={`bi ${r.icon}`} style={{fontSize:'1.3rem',color:form.role===r.v?'var(--accent)':'var(--text-3)'}}/>
              <div style={{textAlign:'left'}}>
                <div style={{fontWeight:700,fontSize:'.9rem',color:form.role===r.v?'var(--text)':'var(--text-2)'}}>{r.label}</div>
                <div style={{fontSize:'.72rem',color:'var(--text-3)'}}>{r.desc}</div>
              </div>
              {form.role===r.v && <i className="bi bi-check-circle-fill" style={{marginLeft:'auto',color:'var(--accent)',fontSize:'1rem'}}/>}
            </button>
          ))}
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Имя пользователя</label>
            <input id="username" name="username" type="text" className="form-control" placeholder="johndoe" value={form.username} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input id="email" name="email" type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Пароль</label>
            <input id="password" name="password" type="password" className="form-control" placeholder="Мин. 6 символов" value={form.password} onChange={onChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirm" className="form-label">Подтверждение пароля</label>
            <input id="confirm" name="confirm" type="password" className="form-control" placeholder="Повторите пароль" value={form.confirm} onChange={onChange} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <><i className="bi bi-arrow-repeat spin"/> Создаём аккаунт...</> : <><i className="bi bi-person-check"/> Зарегистрироваться</>}
          </button>
        </form>
        <p className="auth-footer">Уже есть аккаунт? <Link to="/login">Войти</Link></p>
      </div>
    </section>
  );
};
