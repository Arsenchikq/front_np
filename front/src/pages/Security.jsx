import { useState } from 'react';
import { useAuth }  from '../context/AuthContext';

export const Security = () => {
  const { user, updateSecurity } = useAuth();
  const [form, setForm]     = useState({ newPass: '', confirm: '' });
  const [status, setStatus] = useState(null);

  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setStatus(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.newPass.length < 6)       return setStatus({ type:'error', text:'Пароль минимум 6 символов' });
    if (form.newPass !== form.confirm) return setStatus({ type:'error', text:'Пароли не совпадают' });
    updateSecurity(form.newPass);
    setStatus({ type:'success', text:'Пароль успешно обновлён' });
    setForm({ newPass:'', confirm:'' });
  };

  return (
    <section className="security-page">
      <div className="container">
        <div className="page-header" style={{marginBottom:28}}>
          <div><h1 className="page-title">Безопасность</h1><p className="page-meta">Управление паролем аккаунта</p></div>
        </div>

        <div className="section-card" style={{marginBottom:16}}>
          <div className="section-card-head"><h2>Аккаунт</h2></div>
          <div className="section-card-body">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-control" value={user.email} disabled />
              <span style={{fontFamily:'var(--fm)',fontSize:'.68rem',color:'var(--text-3)'}}>Email изменить нельзя</span>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card-head"><h2>Смена пароля</h2></div>
          <div className="section-card-body">
            {status && (
              <div className={`alert alert-${status.type}`}>
                <i className={`bi bi-${status.type==='error'?'exclamation-circle':'check-circle'}`} />
                {status.text}
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate style={{display:'grid',gap:14}}>
              <div className="form-group">
                <label className="form-label">Новый пароль</label>
                <input name="newPass" type="password" className="form-control" placeholder="Мин. 6 символов" value={form.newPass} onChange={onChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Подтверждение</label>
                <input name="confirm" type="password" className="form-control" placeholder="Повторите пароль" value={form.confirm} onChange={onChange} />
              </div>
              <button type="submit" className="btn btn-primary"><i className="bi bi-lock" /> Обновить пароль</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
