import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../context/AuthContext';

const DIFFS = ['Легкий','Средний','Сложный','Хардкор'];
const CATS  = ['Frontend','Backend','Database','DevOps','Алгоритмы','Другое'];

const mkQ = (type='single') => ({
  id: Date.now()+Math.random(), type, text:'',
  options: type==='truefalse' ? ['Верно','Неверно'] : ['','','',''],
  correct: 0,
});

export const CreateTest = () => {
  const { addNewTest } = useAuth();
  const navigate       = useNavigate();
  const [meta, setMeta] = useState({ title:'', description:'', difficulty:'Легкий', category:'Frontend', timeLimit:0 });
  const [questions, setQuestions] = useState([mkQ()]);
  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);

  const onMeta    = e => setMeta(p => ({...p, [e.target.name]: e.target.value}));
  const addQ      = (type='single') => setQuestions(p => [...p, mkQ(type)]);
  const removeQ   = idx => setQuestions(p => p.filter((_,i) => i!==idx));
  const changeType = (qi, type) => setQuestions(p => p.map((q,i) => i!==qi ? q : {
    ...q, type, options: type==='truefalse' ? ['Верно','Неверно'] : ['','','',''], correct:0
  }));
  const setQText = (qi,v)     => setQuestions(p => p.map((q,i) => i===qi ? {...q,text:v} : q));
  const setOpt   = (qi,oi,v)  => setQuestions(p => p.map((q,i) => i===qi ? {...q,options:q.options.map((o,j)=>j===oi?v:o)} : q));
  const setCorr  = (qi,v)     => setQuestions(p => p.map((q,i) => i===qi ? {...q,correct:Number(v)} : q));

  const validate = () => {
    const e = {};
    if (!meta.title.trim())       e.title = true;
    if (!meta.description.trim()) e.desc  = true;
    questions.forEach((q,qi) => {
      if (!q.text.trim()) e[`q${qi}`] = true;
      if (q.type === 'single') q.options.forEach((o,oi) => { if (!o.trim()) e[`q${qi}o${oi}`] = true; });
    });
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await addNewTest({ id:Date.now(), ...meta, title:meta.title.trim(), description:meta.description.trim(),
        timeLimit: Number(meta.timeLimit)||0, questions });
      navigate('/tests');
    } finally { setSaving(false); }
  };

  const errCount = Object.keys(errors).length;

  return (
    <section className="create-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Конструктор теста</h1>
            <p className="page-meta">{questions.length} вопр. · {meta.timeLimit>0?`${meta.timeLimit} мин`:'без таймера'}</p>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {errCount>0 && <span className="alert alert-error" style={{padding:'6px 12px',fontSize:'.75rem'}}><i className="bi bi-exclamation-circle"/> {errCount} ошибок</span>}
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><i className="bi bi-arrow-repeat spin"/> Сохраняем...</> : <><i className="bi bi-floppy"/> Сохранить</>}
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="section-card">
          <div className="section-card-head"><h2>Настройки теста</h2></div>
          <div className="section-card-body">
            <div className="form-group">
              <label className="form-label">Название</label>
              <input name="title" className={`form-control${errors.title?' error':''}`} placeholder="Например: React Hooks Deep Dive" value={meta.title} onChange={onMeta} />
            </div>
            <div className="form-group">
              <label className="form-label">Описание</label>
              <input name="description" className={`form-control${errors.desc?' error':''}`} placeholder="Краткое описание" value={meta.description} onChange={onMeta} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              <div className="form-group">
                <label className="form-label">Сложность</label>
                <select name="difficulty" className="form-control" value={meta.difficulty} onChange={onMeta}>{DIFFS.map(d=><option key={d}>{d}</option>)}</select>
              </div>
              <div className="form-group">
                <label className="form-label">Категория</label>
                <select name="category" className="form-control" value={meta.category} onChange={onMeta}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
              </div>
              <div className="form-group">
                <label className="form-label">Лимит времени (мин, 0=нет)</label>
                <input name="timeLimit" type="number" min="0" max="180" className="form-control" placeholder="0" value={meta.timeLimit} onChange={onMeta} />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        {questions.map((q,qi) => (
          <div key={q.id} className="question-block">
            <div className="question-block-head">
              <span className="question-block-num"><i className="bi bi-hash"/> Вопрос {qi+1}</span>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <div style={{display:'flex',background:'var(--bg-3)',borderRadius:'var(--r)',overflow:'hidden',border:'1px solid var(--border)'}}>
                  {[{v:'single',label:'4 варианта'},{v:'truefalse',label:'Верно/Нет'}].map(t=>(
                    <button key={t.v} type="button"
                      style={{padding:'4px 10px',fontSize:'.7rem',background:q.type===t.v?'var(--accent)':'transparent',
                        color:q.type===t.v?'#0C0C0C':'var(--text-3)',fontWeight:q.type===t.v?700:400,border:'none',cursor:'pointer',transition:'all .15s'}}
                      onClick={() => changeType(qi,t.v)}>{t.label}</button>
                  ))}
                </div>
                {questions.length > 1 && <button className="btn btn-ghost btn-sm" style={{color:'var(--err)'}} onClick={() => removeQ(qi)}><i className="bi bi-trash"/></button>}
              </div>
            </div>
            <div className="question-block-body">
              <div className="form-group">
                <label className="form-label">Текст вопроса</label>
                <input className={`form-control${errors[`q${qi}`]?' error':''}`} placeholder="Что такое...?" value={q.text} onChange={e=>setQText(qi,e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Варианты ответов <span style={{color:'var(--text-3)'}}>— отметьте правильный</span></label>
                <div className={`options-constructor${q.type==='truefalse'?' tf-grid':''}`}>
                  {q.options.map((opt,oi) => (
                    <div className="option-row" key={oi}>
                      <input type="radio" className="option-radio" name={`c_${q.id}`} checked={q.correct===oi} onChange={() => setCorr(qi,oi)} />
                      {q.type==='truefalse'
                        ? <div className={`tf-opt${q.correct===oi?' tf-opt-active':''}`} onClick={() => setCorr(qi,oi)}>
                            <i className={`bi ${oi===0?'bi-check-circle':'bi-x-circle'}`} style={{color:oi===0?'var(--ok)':'var(--err)'}}/> {opt}
                          </div>
                        : <input className={`form-control${errors[`q${qi}o${oi}`]?' error':''}`} placeholder={`Вариант ${String.fromCharCode(65+oi)}`} value={opt} onChange={e=>setOpt(qi,oi,e.target.value)} />
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{display:'flex',gap:10,marginBottom:32}}>
          <button className="btn btn-secondary" style={{flex:1}} onClick={() => addQ('single')}><i className="bi bi-plus-lg"/> Добавить вопрос</button>
          <button className="btn btn-secondary" onClick={() => addQ('truefalse')}><i className="bi bi-toggle-on"/> Верно/Нет</button>
        </div>
      </div>
    </section>
  );
};
