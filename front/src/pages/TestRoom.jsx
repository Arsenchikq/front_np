import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LETTERS = ['A','B','C','D'];

export const TestRoom = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { tests, saveTestResult } = useAuth();
  const test = tests.find(t => String(t.id) === id);

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score,    setScore]    = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [autoFinish, setAutoFinish] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!test || !test.timeLimit || test.timeLimit <= 0) return;
    setTimeLeft(test.timeLimit * 60);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setAutoFinish(true); setFinished(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [test?.id]);

  if (!test) return (
    <div className="not-found">
      <div className="not-found-code">404</div>
      <h1>Тест не найден</h1>
      <p>Возможно, тест был удалён или ссылка неверна</p>
      <Link to="/tests" className="btn btn-secondary" style={{marginTop:16}}><i className="bi bi-arrow-left"/> К каталогу</Link>
    </div>
  );

  const total = test.questions.length;
  const q     = test.questions[currentQ];
  const pct   = Math.round(((currentQ+(revealed?1:0))/total)*100);

  const handleSelect = (idx) => {
    if (revealed) return;
    setSelected(idx); setRevealed(true);
    if (idx === q.correct) setScore(s => s+1);
  };

  const handleNext = () => {
    clearInterval(timerRef.current);
    if (currentQ+1 < total) { setCurrentQ(c=>c+1); setSelected(null); setRevealed(false); }
    else setFinished(true);
  };

  const handleSave = () => { saveTestResult(test.title, score, total); navigate('/profile'); };

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const timerDanger = timeLeft !== null && timeLeft <= 60;

  if (finished) {
    const pctScore = Math.round((score/total)*100);
    const grade = pctScore>=90?'Отлично':pctScore>=70?'Хорошо':pctScore>=50?'Удовлетворительно':'Слабо';
    const gc    = pctScore>=90?'var(--ok)':pctScore>=70?'var(--accent)':pctScore>=50?'#FCD34D':'var(--err)';
    return (
      <div className="result-page">
        <div className="container">
          {autoFinish && <div className="alert alert-error" style={{justifyContent:'center',marginBottom:24}}><i className="bi bi-alarm"/> Время вышло — тест завершён автоматически</div>}
          <p className="result-eyebrow"><i className="bi bi-flag-fill"/> Тест завершён — {test.title}</p>
          <div className="result-score-wrap">
            <div className="result-score" style={{color:gc}}>{score}</div>
            <div className="result-max">/{total}</div>
          </div>
          <p className="result-percent">{pctScore}% правильных ответов</p>
          <div style={{fontFamily:'var(--fh)',fontSize:'1.4rem',fontWeight:800,color:gc,marginBottom:8}}>{grade}</div>
          <div style={{display:'flex',gap:24,justifyContent:'center',marginBottom:36}}>
            <div style={{textAlign:'center'}}><div style={{fontFamily:'var(--fh)',fontSize:'2rem',fontWeight:800,color:'var(--ok)'}}>{score}</div><div style={{fontFamily:'var(--fm)',fontSize:'.65rem',color:'var(--text-3)',textTransform:'uppercase'}}>верно</div></div>
            <div style={{textAlign:'center'}}><div style={{fontFamily:'var(--fh)',fontSize:'2rem',fontWeight:800,color:'var(--err)'}}>{total-score}</div><div style={{fontFamily:'var(--fm)',fontSize:'.65rem',color:'var(--text-3)',textTransform:'uppercase'}}>неверно</div></div>
            <div style={{textAlign:'center'}}><div style={{fontFamily:'var(--fh)',fontSize:'2rem',fontWeight:800}}>{total}</div><div style={{fontFamily:'var(--fm)',fontSize:'.65rem',color:'var(--text-3)',textTransform:'uppercase'}}>всего</div></div>
          </div>
          <div className="result-actions">
            <button className="btn btn-primary" onClick={handleSave}><i className="bi bi-save"/> Сохранить результат</button>
            <Link to="/tests"       className="btn btn-secondary"><i className="bi bi-collection"/> К каталогу</Link>
            <Link to="/leaderboard" className="btn btn-ghost"><i className="bi bi-trophy"/> Рейтинг</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="test-room-page">
      <div className="container">
        <div className="progress-header">
          <div className="progress-info">
            <div className="progress-title">{test.title}</div>
            <div style={{fontFamily:'var(--fm)',fontSize:'.65rem',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.08em'}}>{test.category} · {test.difficulty}</div>
          </div>
          <div className="progress-right">
            {timeLeft !== null && (
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:20,border:`1px solid ${timerDanger?'rgba(248,113,113,.4)':'var(--border)'}`,background:timerDanger?'var(--err-bg)':'var(--bg-1)',color:timerDanger?'var(--err)':'var(--text-2)',fontFamily:'var(--fm)',fontSize:'.8rem',fontWeight:600,transition:'all .3s'}}>
                <i className="bi bi-alarm"/>{fmt(timeLeft)}
              </div>
            )}
            <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{width:`${pct}%`}}/></div>
            <span className="progress-count">{currentQ+1}/{total}</span>
          </div>
        </div>

        <p className="question-label"><i className="bi bi-hash"/> Вопрос {currentQ+1}</p>
        {q.type==='truefalse' && <div style={{fontFamily:'var(--fm)',fontSize:'.65rem',color:'var(--text-3)',marginBottom:10,display:'flex',alignItems:'center',gap:6}}><i className="bi bi-toggle-on"/>Верно / Неверно</div>}
        <h2 className="question-text">{q.text}</h2>

        <ul className="options-grid">
          {q.options.map((opt, idx) => {
            let cls = 'option-btn';
            if (revealed) {
              if (idx===q.correct)                          cls += ' correct';
              else if (idx===selected && idx!==q.correct)  cls += ' wrong';
              else                                          cls += ' disabled';
            }
            return (
              <li key={idx}>
                <button className={cls} onClick={() => handleSelect(idx)} disabled={revealed && idx!==q.correct && idx!==selected}>
                  {q.type==='truefalse'
                    ? <i className={`bi ${idx===0?'bi-check-circle':'bi-x-circle'} option-index`} style={{fontSize:'.9rem',color:idx===0?'var(--ok)':'var(--err)',width:'auto'}}/>
                    : <span className="option-index">{LETTERS[idx]}</span>}
                  {opt}
                  {revealed && idx===q.correct           && <i className="bi bi-check-lg option-icon"/>}
                  {revealed && idx===selected && idx!==q.correct && <i className="bi bi-x-lg option-icon"/>}
                </button>
              </li>
            );
          })}
        </ul>

        {revealed && (
          <div className="next-btn-row">
            <button className="btn btn-primary" onClick={handleNext}>
              {currentQ+1<total ? <><i className="bi bi-arrow-right"/> Следующий</> : <><i className="bi bi-flag"/> Завершить</>}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
