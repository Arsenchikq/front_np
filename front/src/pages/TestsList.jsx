import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';

const DIFFICULTIES = ['Все', 'Легкий', 'Средний', 'Сложный', 'Хардкор'];
const BADGE = { 'Легкий':'badge-easy','Средний':'badge-medium','Сложный':'badge-hard','Хардкор':'badge-hard' };

export const TestsList = () => {
  const { tests }           = useAuth();
  const [filter, setFilter] = useState('Все');
  const [search, setSearch] = useState('');

  const filtered = tests.filter(t => {
    const d = filter === 'Все' || t.difficulty === filter;
    const s = t.title.toLowerCase().includes(search.toLowerCase()) || (t.category||'').toLowerCase().includes(search.toLowerCase());
    return d && s;
  });

  return (
    <section className="catalog-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Каталог тестов</h1>
            <p className="page-meta">{filtered.length} из {tests.length} тестов</p>
          </div>
          <Link to="/create" className="btn btn-primary"><i className="bi bi-plus-lg" /> Создать тест</Link>
        </div>

        <div className="toolbar">
          <div className="search-wrap">
            <i className="bi bi-search" />
            <input type="search" className="form-control" placeholder="Поиск по названию или категории..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-group">
            {DIFFICULTIES.map(d => (
              <button key={d} className={`filter-btn ${filter===d?'active':''}`} onClick={() => setFilter(d)}>{d}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><i className="bi bi-inbox" /><p>Ничего не найдено</p></div>
        ) : (
          <ul className="tests-grid">
            {filtered.map((test, idx) => (
              <li key={test.id} className="test-card">
                <div>
                  <div className="test-card-num">#{String(idx+1).padStart(2,'0')} · {test.category}</div>
                  <div className="test-card-top">
                    <h2 className="test-card-title">{test.title}</h2>
                    <span className={`badge ${BADGE[test.difficulty]||'badge-medium'}`}>{test.difficulty}</span>
                  </div>
                  <p className="test-card-desc">{test.description}</p>
                </div>
                <div className="test-card-footer">
                  <div className="test-card-meta">
                    <span><i className="bi bi-question-circle" />{test.questions.length} вопр.</span>
                    <span><i className="bi bi-bar-chart" />{test.difficulty}</span>
                  </div>
                  <Link to={`/room/${test.id}`} className="btn btn-primary btn-sm"><i className="bi bi-play-fill" /> Начать</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
