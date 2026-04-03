import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABEL = { admin:'Администратор', teacher:'Преподаватель', student:'Студент' };

export const Layout = () => {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exitModal,  setExitModal]  = useState(false);
  const menuRef = useRef(null);
  const isActive = (p) => location.pathname === p ? 'active' : '';

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); setExitModal(false); navigate('/login'); };
  const avatar = user?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.email||'U')}`;

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container">
          <Link to="/" className="logo"><div className="logo-dot" />SmartTest</Link>

          {/* Desktop nav */}
          <nav className="site-nav" style={{display:'flex'}}>
            <Link to="/" className={`nav-link ${isActive('/')}`}>Главная</Link>
            {user ? (
              <>
                <Link to="/tests"       className={`nav-link ${isActive('/tests')}`}>Каталог</Link>
                <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}>Рейтинг</Link>
                <Link to="/create"      className={`nav-link ${isActive('/create')}`}>Создать</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className={`nav-link ${isActive('/admin')}`} style={{color:'var(--accent)'}}>
                    <i className="bi bi-shield-fill" style={{marginRight:4}}/>Админ
                  </Link>
                )}
                <div className="user-menu" ref={menuRef}>
                  <button className="user-menu-btn" onClick={() => setMenuOpen(v => !v)}>
                    <img src={avatar} alt="" className="user-avatar" onError={e=>{e.target.src=`https://api.dicebear.com/9.x/initials/svg?seed=U`;}} />
                    <span>{user.username || user.name}</span>
                    <i className={`bi bi-chevron-${menuOpen?'up':'down'}`} />
                  </button>
                  {menuOpen && (
                    <nav className="dropdown-menu">
                      {user.role && <div style={{padding:'8px 16px',fontSize:'.65rem',color:'var(--accent)',textTransform:'uppercase',letterSpacing:'.1em',borderBottom:'1px solid var(--border)'}}>{ROLE_LABEL[user.role]||user.role}</div>}
                      <Link to="/profile"  className="dropdown-item" onClick={() => setMenuOpen(false)}><i className="bi bi-person" /> Профиль</Link>
                      <Link to="/security" className="dropdown-item" onClick={() => setMenuOpen(false)}><i className="bi bi-shield-lock" /> Безопасность</Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="dropdown-item" onClick={() => setMenuOpen(false)}><i className="bi bi-gear" /> Панель администратора</Link>
                      )}
                      <button className="dropdown-item danger" onClick={() => { setMenuOpen(false); setExitModal(true); }}><i className="bi bi-box-arrow-right" /> Выйти</button>
                    </nav>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login"    className={`nav-link ${isActive('/login')}`}>Войти</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Регистрация</Link>
              </>
            )}
          </nav>

          {/* Hamburger (mobile) */}
          <button className="hamburger" onClick={() => setMobileOpen(v=>!v)} aria-label="Меню">
            <span className={mobileOpen?'ham-open':''}/>
            <span className={mobileOpen?'ham-open':''}/>
            <span className={mobileOpen?'ham-open':''}/>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="mob-overlay" onClick={() => setMobileOpen(false)}>
          <nav className="mob-drawer" onClick={e => e.stopPropagation()}>
            <div className="mob-head">
              <span className="logo"><div className="logo-dot"/>SmartTest</span>
              <button onClick={() => setMobileOpen(false)} style={{background:'none',border:'none',color:'var(--text-2)',fontSize:'1.2rem',cursor:'pointer'}}><i className="bi bi-x-lg"/></button>
            </div>
            {user && (
              <div className="mob-user">
                <img src={avatar} alt="" className="user-avatar" onError={e=>{e.target.src=`https://api.dicebear.com/9.x/initials/svg?seed=U`;}}/>
                <div>
                  <div style={{fontWeight:700,fontSize:'.9rem'}}>{user.username||user.name}</div>
                  <div style={{fontSize:'.72rem',color:'var(--accent)'}}>{ROLE_LABEL[user.role]||''}</div>
                </div>
              </div>
            )}
            <div className="mob-links">
              <Link to="/"            className={`mob-link ${isActive('/')}`}><i className="bi bi-house"/> Главная</Link>
              {user ? (<>
                <Link to="/tests"       className={`mob-link ${isActive('/tests')}`}><i className="bi bi-collection"/> Каталог тестов</Link>
                <Link to="/leaderboard" className={`mob-link ${isActive('/leaderboard')}`}><i className="bi bi-trophy"/> Рейтинг</Link>
                <Link to="/create"      className={`mob-link ${isActive('/create')}`}><i className="bi bi-pencil-square"/> Создать тест</Link>
                <Link to="/profile"     className={`mob-link ${isActive('/profile')}`}><i className="bi bi-person"/> Профиль</Link>
                <Link to="/security"    className={`mob-link ${isActive('/security')}`}><i className="bi bi-shield-lock"/> Безопасность</Link>
                {user.role === 'admin' && <Link to="/admin" className={`mob-link ${isActive('/admin')}`}><i className="bi bi-shield-fill"/> Панель администратора</Link>}
                <button className="mob-link mob-logout" onClick={() => { setMobileOpen(false); setExitModal(true); }}><i className="bi bi-box-arrow-right"/> Выйти</button>
              </>) : (<>
                <Link to="/login"    className={`mob-link ${isActive('/login')}`}><i className="bi bi-box-arrow-in-right"/> Войти</Link>
                <Link to="/register" className={`mob-link ${isActive('/register')}`}><i className="bi bi-person-plus"/> Регистрация</Link>
              </>)}
            </div>
          </nav>
        </div>
      )}

      {exitModal && (
        <div className="modal-overlay" role="dialog">
          <div className="modal">
            <h3>Выход из системы</h3>
            <p>Вы уверены? Для повторного входа потребуется пароль.</p>
            <div className="modal-actions">
              <button onClick={handleLogout} className="btn btn-danger"><i className="bi bi-box-arrow-right" /> Выйти</button>
              <button onClick={() => setExitModal(false)} className="btn btn-secondary">Отмена</button>
            </div>
          </div>
        </div>
      )}

      <main className="content-area"><Outlet /></main>

      <footer className="site-footer">
        <div className="container">
          <span className="footer-brand">SmartTest</span>
          <span className="footer-copy">© 2026 — Платформа тестирования знаний</span>
          <div className="footer-links">
            <Link to="/tests">Каталог</Link>
            <Link to="/leaderboard">Рейтинг</Link>
            <Link to="/create">Создать тест</Link>
            <Link to="/profile">Профиль</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
