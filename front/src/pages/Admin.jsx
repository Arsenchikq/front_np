import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TABS = [{id:'overview',label:'Обзор',icon:'bi-grid'},{id:'users',label:'Пользователи',icon:'bi-people'},{id:'tests',label:'Тесты',icon:'bi-collection'},{id:'activity',label:'Активность',icon:'bi-bar-chart'}];
const ROLES = ['student','teacher','admin'];
const RL = {admin:'Администратор',teacher:'Преподаватель',student:'Студент'};
const RC = {admin:'#F87171',teacher:'#E8C547',student:'#6EE7B7'};

export const Admin = () => {
  const { user, tests, getAllUsers, updateUserRole, deleteTestAdmin, getLeaderboard } = useAuth();
  const navigate = useNavigate();
  const [tab,   setTab]   = useState('overview');
  const [users, setUsers] = useState([]);
  const [q,     setQ]     = useState('');
  const [del,   setDel]   = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }
    setUsers(getAllUsers());
  }, [user]);

  const toast_ = (m, t='ok') => { setToast({m,t}); setTimeout(()=>setToast(null),2800); };
  const changeRole = (email, role) => { updateUserRole(email,role); setUsers(getAllUsers()); toast_(`Роль изменена → ${RL[role]}`); };
  const doDelete   = (id) => { deleteTestAdmin(id); setDel(null); toast_('Тест удалён','err'); };

  if (user?.role !== 'admin') return null;

  const lb  = getLeaderboard();
  const fu  = users.filter(u => u.email?.toLowerCase().includes(q.toLowerCase())||u.username?.toLowerCase().includes(q.toLowerCase()));
  const ft  = tests.filter(t => t.title?.toLowerCase().includes(q.toLowerCase())||t.category?.toLowerCase().includes(q.toLowerCase()));
  const totalAttempts = lb.reduce((s,u)=>s+u.totalTests,0);

  const cats = {};
  tests.forEach(t=>{cats[t.category]=(cats[t.category]||0)+1;});
  const catMax = Math.max(...Object.values(cats),1);

  return (
    <section style={{padding:'48px 0 80px'}}>
      {toast && (
        <div style={{position:'fixed',top:80,right:20,zIndex:999,padding:'12px 20px',borderRadius:'var(--r)',border:`1px solid ${toast.t==='err'?'rgba(248,113,113,.3)':'rgba(110,231,183,.3)'}`,background:toast.t==='err'?'var(--err-bg)':'var(--ok-bg)',color:toast.t==='err'?'var(--err)':'var(--ok)',fontSize:'.875rem',fontWeight:500,display:'flex',alignItems:'center',gap:8,boxShadow:'0 20px 60px rgba(0,0,0,.5)',animation:'dropIn .15s ease'}}>
          <i className={`bi bi-${toast.t==='err'?'x-circle':'check-circle'}`}/>{toast.m}
        </div>
      )}

      <div className="container">
        <div className="page-header">
          <div><h1 className="page-title">Панель администратора</h1><p className="page-meta">Управление платформой SmartTest</p></div>
          <Link to="/" className="btn btn-secondary btn-sm"><i className="bi bi-arrow-left"/> На сайт</Link>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:2,marginBottom:28,background:'var(--bg-1)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:4,width:'fit-content'}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);setQ('');}}
              style={{display:'flex',alignItems:'center',gap:7,padding:'8px 16px',borderRadius:'4px',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'.8rem',fontWeight:600,background:tab===t.id?'var(--accent)':'transparent',color:tab===t.id?'#0C0C0C':'var(--text-3)',transition:'all .15s'}}>
              <i className={`bi ${t.icon}`}/>{t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab==='overview' && (<>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'var(--border)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden',marginBottom:24}}>
            {[{label:'Пользователей',val:users.length,icon:'bi-people',c:'#6EE7B7'},{label:'Тестов',val:tests.length,icon:'bi-collection',c:'#E8C547'},{label:'Прохождений',val:totalAttempts,icon:'bi-check-circle',c:'#93C5FD'},{label:'Администраторов',val:users.filter(u=>u.role==='admin').length,icon:'bi-shield',c:'#F87171'}].map((s,i)=>(
              <div key={i} style={{background:'var(--bg-1)',padding:'28px 24px'}}>
                <div style={{width:40,height:40,borderRadius:'var(--r)',background:`${s.c}18`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14,fontSize:'1.1rem',color:s.c}}><i className={`bi ${s.icon}`}/></div>
                <div style={{fontFamily:'var(--fh)',fontSize:'2rem',fontWeight:800,lineHeight:1,marginBottom:4}}>{s.val}</div>
                <div style={{fontFamily:'var(--fm)',fontSize:'.65rem',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.08em'}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div className="panel"><div className="panel-head"><h2>Последние пользователи</h2><button className="btn btn-ghost btn-sm" onClick={()=>setTab('users')}>Все <i className="bi bi-arrow-right"/></button></div>
              <div className="panel-body">{users.length===0?<div className="empty-state"><i className="bi bi-people"/><p>Нет пользователей</p></div>:
                users.slice(-5).reverse().map((u,i)=><div key={i} className="mini-test-item">
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <img src={u.avatar||`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(u.email)}`} alt="" style={{width:32,height:32,borderRadius:'50%'}}/>
                    <div><div style={{fontWeight:600,fontSize:'.85rem'}}>{u.username||u.email}</div><div style={{fontSize:'.68rem',color:'var(--text-3)'}}>{u.email}</div></div>
                  </div>
                  <span style={{fontSize:'.65rem',padding:'2px 8px',borderRadius:20,background:`${RC[u.role]||'#fff'}18`,color:RC[u.role]||'var(--text-3)'}}>{RL[u.role]||u.role}</span>
                </div>)}
            </div></div>
            <div className="panel"><div className="panel-head"><h2>Последние тесты</h2><button className="btn btn-ghost btn-sm" onClick={()=>setTab('tests')}>Все <i className="bi bi-arrow-right"/></button></div>
              <div className="panel-body">{tests.slice(0,5).map((t,i)=><div key={i} className="mini-test-item">
                <div><div className="mini-test-title">{t.title}</div><div className="mini-test-meta">{t.category} · {t.questions.length} вопр.</div></div>
                <Link to={`/room/${t.id}`} className="btn btn-ghost btn-sm"><i className="bi bi-play"/></Link>
              </div>)}</div>
            </div>
          </div>
        </>)}

        {/* USERS */}
        {tab==='users' && (<>
          <div style={{display:'flex',gap:12,marginBottom:20,alignItems:'center'}}>
            <div className="search-wrap" style={{flex:1,maxWidth:360}}><i className="bi bi-search"/><input className="form-control" style={{paddingLeft:34}} placeholder="Поиск..." value={q} onChange={e=>setQ(e.target.value)}/></div>
            <span style={{fontFamily:'var(--fm)',fontSize:'.72rem',color:'var(--text-3)'}}>Всего: {users.length}</span>
          </div>
          {fu.length===0?<div className="empty-state"><i className="bi bi-people"/><p>Пользователи появятся после регистрации</p></div>:(
            <div style={{background:'var(--bg-1)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden'}}>
              <table className="data-table" style={{width:'100%'}}>
                <thead><tr><th>Пользователь</th><th>Email</th><th>Роль</th><th>Прохождений</th></tr></thead>
                <tbody>{fu.map((u,i)=>(
                  <tr key={i}>
                    <td><div style={{display:'flex',alignItems:'center',gap:10}}><img src={u.avatar||`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(u.email)}`} alt="" style={{width:32,height:32,borderRadius:'50%'}}/><span style={{fontWeight:600,color:'var(--text)'}}>{u.username||'—'}</span></div></td>
                    <td style={{color:'var(--text-2)',fontSize:'.85rem'}}>{u.email}</td>
                    <td>
                      <select className="form-control" style={{fontSize:'.8rem',padding:'4px 32px 4px 8px',width:'auto',minWidth:140}} value={u.role||'student'} onChange={e=>changeRole(u.email,e.target.value)}>
                        {ROLES.map(r=><option key={r} value={r}>{RL[r]}</option>)}
                      </select>
                    </td>
                    <td style={{fontFamily:'var(--fm)',fontSize:'.8rem',color:'var(--text-3)'}}>{u.resultsCount||0}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </>)}

        {/* TESTS */}
        {tab==='tests' && (<>
          <div style={{display:'flex',gap:12,marginBottom:20}}>
            <div className="search-wrap" style={{flex:1,maxWidth:360}}><i className="bi bi-search"/><input className="form-control" style={{paddingLeft:34}} placeholder="Поиск..." value={q} onChange={e=>setQ(e.target.value)}/></div>
            <Link to="/create" className="btn btn-primary btn-sm"><i className="bi bi-plus-lg"/> Создать тест</Link>
          </div>
          <div style={{background:'var(--bg-1)',border:'1px solid var(--border)',borderRadius:'var(--rl)',overflow:'hidden'}}>
            <table className="data-table" style={{width:'100%'}}>
              <thead><tr><th>Название</th><th>Категория</th><th>Сложность</th><th>Вопросов</th><th>Таймер</th><th>Действия</th></tr></thead>
              <tbody>{ft.map((t,i)=>(
                <tr key={i}>
                  <td style={{fontWeight:600,color:'var(--text)'}}>{t.title}</td>
                  <td style={{fontSize:'.8rem',color:'var(--text-2)'}}>{t.category}</td>
                  <td style={{fontSize:'.75rem',color:'var(--text-3)'}}>{t.difficulty}</td>
                  <td style={{fontFamily:'var(--fm)',fontSize:'.8rem'}}>{t.questions.length}</td>
                  <td style={{fontFamily:'var(--fm)',fontSize:'.8rem',color:'var(--text-3)'}}>{t.timeLimit>0?`${t.timeLimit} мин`:'—'}</td>
                  <td><div style={{display:'flex',gap:6}}>
                    <Link to={`/room/${t.id}`} className="btn btn-ghost btn-sm"><i className="bi bi-play"/></Link>
                    <button className="btn btn-ghost btn-sm" style={{color:'var(--err)'}} onClick={()=>setDel(t)}><i className="bi bi-trash"/></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>)}

        {/* ACTIVITY */}
        {tab==='activity' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div className="panel"><div className="panel-head"><h2>Топ участников</h2></div>
              <div className="panel-body">{lb.length===0?<div className="empty-state"><i className="bi bi-trophy"/><p>Нет данных</p></div>:lb.slice(0,8).map((u,i)=>(
                <div key={i} className="mini-test-item">
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontFamily:'var(--fm)',fontSize:'.7rem',color:'var(--text-3)',minWidth:22,textAlign:'right'}}>#{i+1}</span>
                    <div><div style={{fontWeight:600,fontSize:'.85rem'}}>{u.username||u.userEmail}</div><div style={{fontSize:'.68rem',color:'var(--text-3)'}}>{u.totalTests} попыток</div></div>
                  </div>
                  <span className="score-pill">{u.avgPercent}%</span>
                </div>
              ))}</div>
            </div>
            <div className="panel"><div className="panel-head"><h2>Тесты по категориям</h2></div>
              <div className="panel-body" style={{padding:'12px 0'}}>
                {Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,cnt])=>(
                  <div key={cat} style={{padding:'8px 20px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:'.85rem',color:'var(--text-2)'}}>{cat}</span><span style={{fontFamily:'var(--fm)',fontSize:'.75rem',color:'var(--text-3)'}}>{cnt}</span></div>
                    <div style={{height:4,background:'var(--bg-3)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${(cnt/catMax)*100}%`,background:'var(--accent)',borderRadius:2}}/></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {del && (
        <div className="modal-overlay"><div className="modal">
          <h3>Удалить тест?</h3>
          <p>«{del.title}» будет удалён без возможности восстановления.</p>
          <div className="modal-actions">
            <button className="btn btn-danger" onClick={()=>doDelete(del.id)}><i className="bi bi-trash"/> Удалить</button>
            <button className="btn btn-secondary" onClick={()=>setDel(null)}>Отмена</button>
          </div>
        </div></div>
      )}
    </section>
  );
};
