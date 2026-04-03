import { useAuth } from '../context/AuthContext';
import { Link }    from 'react-router-dom';

const MEDAL = ['🥇','🥈','🥉'];

export const Leaderboard = () => {
  const { user, getLeaderboard } = useAuth();
  const lb   = getLeaderboard();
  const myRank = lb.findIndex(u => u.userEmail === user?.email);

  return (
    <section style={{padding:'48px 0 80px'}}>
      <div className="container">
        <div className="page-header">
          <div><h1 className="page-title">Рейтинг участников</h1><p className="page-meta">{lb.length} участников в рейтинге</p></div>
          <Link to="/tests" className="btn btn-primary btn-sm"><i className="bi bi-play-fill"/> Пройти тест</Link>
        </div>

        {/* My rank */}
        {user && myRank >= 0 && (
          <div style={{background:'var(--bg-1)',border:'1px solid rgba(232,197,71,.2)',borderRadius:'var(--rl)',padding:'24px 28px',marginBottom:28,display:'flex',alignItems:'center',justifyContent:'space-between',gap:20,flexWrap:'wrap',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:'-40px',right:'-40px',width:160,height:160,background:'radial-gradient(circle,rgba(232,197,71,.06) 0%,transparent 70%)',pointerEvents:'none'}}/>
            <div style={{display:'flex',alignItems:'center',gap:16,position:'relative'}}>
              <div style={{fontFamily:'var(--fh)',fontSize:'2.4rem',fontWeight:800,color:'var(--accent)',lineHeight:1}}>#{myRank+1}</div>
              <div><div style={{fontWeight:700}}>{user.username||user.name}</div><div style={{fontSize:'.72rem',color:'var(--text-3)'}}>Ваша позиция в рейтинге</div></div>
            </div>
            <div style={{display:'flex',gap:28,position:'relative'}}>
              {lb[myRank] && <>
                <div style={{textAlign:'center'}}><div style={{fontFamily:'var(--fh)',fontSize:'1.6rem',fontWeight:800,color:'var(--accent)'}}>{lb[myRank].avgPercent}%</div><div style={{fontFamily:'var(--fm)',fontSize:'.62rem',color:'var(--text-3)',textTransform:'uppercase'}}>средний</div></div>
                <div style={{textAlign:'center'}}><div style={{fontFamily:'var(--fh)',fontSize:'1.6rem',fontWeight:800}}>{lb[myRank].totalTests}</div><div style={{fontFamily:'var(--fm)',fontSize:'.62rem',color:'var(--text-3)',textTransform:'uppercase'}}>попыток</div></div>
              </>}
            </div>
          </div>
        )}

        {lb.length === 0 ? (
          <div className="empty-state" style={{paddingTop:80}}>
            <i className="bi bi-trophy" style={{fontSize:'3rem',color:'var(--accent)'}}/>
            <h2 style={{fontFamily:'var(--fh)',fontSize:'1.4rem',marginTop:8}}>Рейтинг пуст</h2>
            <p>Пройдите тесты и сохраните результаты, чтобы попасть в таблицу</p>
            <Link to="/tests" className="btn btn-primary" style={{marginTop:8}}><i className="bi bi-play-fill"/> Начать тестирование</Link>
          </div>
        ) : (<>
          {/* Podium top-3 */}
          {lb.length >= 2 && (
            <div style={{display:'flex',alignItems:'flex-end',justifyContent:'center',gap:12,marginBottom:32,flexWrap:'wrap'}}>
              {[1,0,2].filter(i=>lb[i]).map(i => {
                const e=lb[i]; const isFirst=i===0;
                const heights=[80,110,60];
                const c=e.userEmail===user?.email?'rgba(232,197,71,.15)':'var(--bg-1)';
                return(
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,flex:isFirst?'0 0 160px':'0 0 130px'}}>
                    <div style={{fontSize:isFirst?'1.6rem':'1.3rem'}}>{MEDAL[i]}</div>
                    <img src={e.avatar||`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(e.userEmail)}`} alt="" style={{width:isFirst?56:44,height:isFirst?56:44,borderRadius:'50%',border:`2px solid ${isFirst?'var(--accent)':'var(--border)'}`}} onError={ev=>{ev.target.src=`https://api.dicebear.com/9.x/initials/svg?seed=${i}`;}}/>
                    <div style={{fontWeight:700,fontSize:isFirst?'1rem':'.85rem',textAlign:'center'}}>{e.username||e.userEmail.split('@')[0]}</div>
                    <div style={{fontFamily:'var(--fh)',fontSize:isFirst?'1.4rem':'1.1rem',fontWeight:800,color:'var(--accent)'}}>{e.avgPercent}%</div>
                    <div style={{width:'100%',height:heights[i],background:c,border:'1px solid var(--border)',borderRadius:'var(--r) var(--r) 0 0',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{fontFamily:'var(--fh)',fontSize:'1.2rem',fontWeight:800,color:'var(--text-3)'}}>#{i+1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full table */}
          <div className="panel">
            <div className="panel-head"><h2>Полный рейтинг</h2></div>
            <div className="panel-body">
              <table className="data-table">
                <thead><tr><th>#</th><th>Участник</th><th>Средний балл</th><th>Попыток</th><th>Лучший тест</th></tr></thead>
                <tbody>{lb.map((e,i)=>{
                  const isMe=e.userEmail===user?.email;
                  const p=e.avgPercent;
                  const c=p>=80?'var(--ok)':p>=60?'var(--accent)':'var(--err)';
                  return(
                    <tr key={i} style={isMe?{background:'rgba(232,197,71,0.04)',outline:'1px solid rgba(232,197,71,.1)'}:{}}>
                      <td style={{fontFamily:'var(--fh)',fontWeight:800,fontSize:i<3?'1.1rem':'.9rem',color:i<3?'var(--accent)':'var(--text-3)'}}>{i<3?MEDAL[i]:`#${i+1}`}</td>
                      <td><div style={{display:'flex',alignItems:'center',gap:10}}>
                        <img src={e.avatar||`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(e.userEmail)}`} alt="" style={{width:32,height:32,borderRadius:'50%'}} onError={ev=>{ev.target.src=`https://api.dicebear.com/9.x/initials/svg?seed=${i}`;}}/>
                        <div><div style={{fontWeight:600,color:'var(--text)'}}>{e.username||e.userEmail.split('@')[0]}</div>{isMe&&<div style={{fontSize:'.65rem',color:'var(--accent)'}}>← Вы</div>}</div>
                      </div></td>
                      <td><div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:60,height:4,background:'var(--bg-3)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${p}%`,background:c,borderRadius:2}}/></div>
                        <span style={{fontFamily:'var(--fh)',fontWeight:700,color:c}}>{p}%</span>
                      </div></td>
                      <td style={{fontFamily:'var(--fm)',fontSize:'.8rem',color:'var(--text-3)'}}>{e.totalTests}</td>
                      <td style={{fontSize:'.8rem',color:'var(--text-2)',maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.testTitle}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </div>
        </>)}
      </div>
    </section>
  );
};
