import { useState, useRef } from 'react';
import { Link }    from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = { admin:'Администратор', teacher:'Преподаватель', student:'Студент' };
const ROLE_COLORS = { admin:'#F87171', teacher:'#E8C547', student:'#6EE7B7' };

/* Мини SVG-график последних результатов */
const ResultsChart = ({ results }) => {
  const pts = [...results].reverse().slice(0,10);
  if (pts.length < 2) return null;
  const W=360, H=90, PL=24, PR=8, PT=12, PB=20;
  const iW = W-PL-PR, iH = H-PT-PB;
  const xs = pts.map((_,i) => PL + (i/(pts.length-1))*iW);
  const ys = pts.map(r => PT + (1 - r.score/r.total)*iH);
  const line = pts.map((p,i) => `${i===0?'M':'L'}${xs[i]},${ys[i]}`).join(' ');
  const area = `${line}L${xs[pts.length-1]},${PT+iH}L${PL},${PT+iH}Z`;
  return (
    <div style={{padding:'8px 16px 12px'}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:H}}>
        <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity=".15"/><stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/></linearGradient></defs>
        {[0,50,100].map(v=>{const y=PT+(1-v/100)*iH;return(<line key={v} x1={PL} y1={y} x2={W-PR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>);})}
        <path d={area} fill="url(#lg)"/>
        <path d={line} fill="none" stroke="rgba(232,197,71,.7)" strokeWidth="1.5" strokeLinejoin="round"/>
        {pts.map((r,i)=>{const pct=Math.round((r.score/r.total)*100);return(
          <g key={i}><circle cx={xs[i]} cy={ys[i]} r="3.5" fill="var(--accent)"/>
          <text x={xs[i]} y={ys[i]-7} fill="var(--accent)" fontSize="8" textAnchor="middle">{pct}%</text></g>
        );})}
        <text x={PL} y={H-4} fill="rgba(255,255,255,.2)" fontSize="8">{pts[0].date}</text>
        <text x={W-PR} y={H-4} fill="rgba(255,255,255,.2)" fontSize="8" textAnchor="end">{pts[pts.length-1].date}</text>
      </svg>
    </div>
  );
};

export const Profile = () => {
  const { user, tests, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullname:user.fullname||user.username||'', bio:user.bio||'', avatar:user.avatar||'' });
  const [saved,   setSaved]   = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const myTests = tests.filter(t => t.authorEmail === user.email);
  const results = user.results || [];
  const avgPct  = results.length ? Math.round(results.reduce((s,r)=>s+(r.score/r.total)*100,0)/results.length) : null;
  const bestPct = results.length ? Math.max(...results.map(r=>Math.round((r.score/r.total)*100))) : null;

  const onChange = e => setForm(p => ({...p,[e.target.name]:e.target.value}));
  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => { setPreview(ev.target.result); setForm(p=>({...p,avatar:ev.target.result})); };
    reader.readAsDataURL(f);
  };
  const handleSave = () => { updateProfile(form); setEditing(false); setSaved(true); setPreview(null); setTimeout(()=>setSaved(false),3000); };

  const avatar = preview || user.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.email)}`;
  const rc = ROLE_COLORS[user.role];

  return (
    <section className="profile-page">
      <div className="container">
        {saved && <div className="alert alert-success" style={{marginBottom:20}}><i className="bi bi-check-circle"/> Профиль обновлён</div>}

        <div className="profile-hero">
          <div style={{position:'relative',flexShrink:0,zIndex:1}}>
            <img src={avatar} alt="" className="profile-avatar" onError={e=>{e.target.src=`https://api.dicebear.com/9.x/initials/svg?seed=U`;}}/>
            {editing && (
              <button onClick={()=>fileRef.current?.click()} style={{position:'absolute',bottom:0,right:0,width:26,height:26,borderRadius:'50%',background:'var(--accent)',color:'#0C0C0C',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.7rem'}}>
                <i className="bi bi-camera-fill"/>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
          </div>
          <div className="profile-info">
            {editing ? (
              <div style={{display:'grid',gap:12,maxWidth:420}}>
                <div className="form-group"><label className="form-label">Полное имя</label><input name="fullname" className="form-control" value={form.fullname} onChange={onChange}/></div>
                <div className="form-group"><label className="form-label">О себе</label><input name="bio" className="form-control" value={form.bio} onChange={onChange} placeholder="Краткое описание"/></div>
                <div className="form-group"><label className="form-label">URL аватара</label><input name="avatar" className="form-control" value={form.avatar} onChange={onChange} placeholder="https://..."/></div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-primary btn-sm" onClick={handleSave}><i className="bi bi-check-lg"/> Сохранить</button>
                  <button className="btn btn-secondary btn-sm" onClick={()=>{setEditing(false);setPreview(null);}}>Отмена</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:6}}>
                  <h1 className="profile-name" style={{margin:0}}>{user.fullname||user.username}</h1>
                  {user.role && <span style={{fontSize:'.65rem',padding:'3px 10px',borderRadius:20,background:`${rc}18`,color:rc,border:`1px solid ${rc}30`,fontWeight:600,textTransform:'uppercase',letterSpacing:'.07em'}}>{ROLE_LABELS[user.role]}</span>}
                </div>
                <p className="profile-email"><i className="bi bi-envelope" style={{marginRight:5}}/>{user.email}</p>
                {user.bio && <p className="profile-bio">{user.bio}</p>}
                <div className="profile-counters">
                  <div className="profile-counter"><strong>{results.length}</strong>пройдено</div>
                  <div className="profile-counter"><strong>{myTests.length}</strong>создано</div>
                  {avgPct!==null&&<div className="profile-counter"><strong>{avgPct}%</strong>средний</div>}
                  {bestPct!==null&&<div className="profile-counter"><strong>{bestPct}%</strong>лучший</div>}
                </div>
                <div style={{marginTop:16,display:'flex',gap:8,flexWrap:'wrap'}}>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setEditing(true)}><i className="bi bi-pencil"/> Редактировать</button>
                  <Link to="/security"    className="btn btn-ghost btn-sm"><i className="bi bi-shield-lock"/> Безопасность</Link>
                  <Link to="/leaderboard" className="btn btn-ghost btn-sm"><i className="bi bi-trophy"/> Рейтинг</Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Progress chart */}
        {results.length >= 2 && (
          <div className="panel" style={{marginBottom:20}}>
            <div className="panel-head"><h2>Динамика результатов</h2><span style={{fontFamily:'var(--fm)',fontSize:'.65rem',color:'var(--text-3)'}}>последние {Math.min(results.length,10)} попыток</span></div>
            <ResultsChart results={results}/>
          </div>
        )}

        <div className="profile-grid">
          <div className="panel">
            <div className="panel-head"><h2>Мои тесты</h2><Link to="/create" className="btn btn-ghost btn-sm"><i className="bi bi-plus-lg"/></Link></div>
            <div className="panel-body">
              {myTests.length===0
                ? <div className="empty-state"><i className="bi bi-file-earmark-plus"/><p>Нет созданных тестов</p><Link to="/create" className="btn btn-primary btn-sm">Создать первый</Link></div>
                : <ul>{myTests.map(t=>(
                    <li key={t.id} className="mini-test-item">
                      <div>
                        <div className="mini-test-title">{t.title}</div>
                        <div className="mini-test-meta">{t.questions.length} вопр. · {t.difficulty}{t.timeLimit>0?` · ⏱ ${t.timeLimit} мин`:''}</div>
                      </div>
                      <Link to={`/room/${t.id}`} className="btn btn-ghost btn-sm"><i className="bi bi-play"/></Link>
                    </li>
                  ))}</ul>}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h2>История прохождений</h2></div>
            <div className="panel-body">
              {!results.length
                ? <div className="empty-state"><i className="bi bi-clock-history"/><p>История пуста</p><Link to="/tests" className="btn btn-primary btn-sm">Пройти тест</Link></div>
                : <table className="data-table">
                    <thead><tr><th>Тест</th><th>Результат</th><th>Дата</th></tr></thead>
                    <tbody>{results.slice(0,10).map((r,i)=>{
                      const p=Math.round((r.score/r.total)*100);
                      const c=p>=70?'var(--ok)':p>=50?'var(--accent)':'var(--err)';
                      return(<tr key={i}>
                        <td style={{fontWeight:500,color:'var(--text)'}}>{r.title}</td>
                        <td><span className="score-pill" style={{background:`${c}18`,color:c,borderColor:`${c}30`}}>{r.score}/{r.total} · {p}%</span></td>
                        <td style={{fontFamily:'var(--fm)',fontSize:'.68rem'}}>{r.date}</td>
                      </tr>);
                    })}</tbody>
                  </table>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
