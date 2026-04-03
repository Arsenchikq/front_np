import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const { user, tests } = useAuth();

  const features = [
    { icon: 'bi-collection', title: 'Каталог тестов', desc: '12 тестов по frontend, backend, базам данных, алгоритмам и безопасности — от легкого до хардкора.' },
    { icon: 'bi-pencil-square', title: 'Конструктор', desc: 'Создавайте собственные тесты с любым количеством вопросов и 4 вариантами ответов.' },
    { icon: 'bi-graph-up-arrow', title: 'История и прогресс', desc: 'Все результаты сохраняются в профиле. Следите за прогрессом и возвращайтесь к слабым темам.' },
    { icon: 'bi-shield-check', title: 'JWT Авторизация', desc: 'Безопасная регистрация с хешированием паролей bcrypt и токенами доступа.' },
    { icon: 'bi-lightning-charge', title: 'Мгновенная проверка', desc: 'Правильный ответ показывается сразу после выбора — учитесь на своих ошибках в реальном времени.' },
    { icon: 'bi-stack', title: 'MERN Stack', desc: 'MongoDB + Express + React + Node.js — production-ready архитектура с контроллерами и middleware.' },
  ];

  return (
    <article>
      <section className="hero-section">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-eyebrow animate-in">
              <i className="bi bi-broadcast-pin" /> Образовательная платформа
            </div>
            <h1 className="hero-title animate-in delay-1">
              Проверь свои<br />знания в <span className="accent-word">деле</span>
            </h1>
            <p className="hero-desc animate-in delay-2">
              Профессиональная система тестирования для разработчиков.
              Проходи тесты, создавай задания, отслеживай прогресс.
            </p>
            <div className="hero-actions animate-in delay-3">
              {user ? (
                <>
                  <Link to="/tests"   className="btn btn-primary"><i className="bi bi-collection" /> Каталог тестов</Link>
                  <Link to="/profile" className="btn btn-secondary"><i className="bi bi-person" /> Мой профиль</Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary"><i className="bi bi-person-plus" /> Начать бесплатно</Link>
                  <Link to="/login"    className="btn btn-secondary">Войти</Link>
                </>
              )}
            </div>
            <div className="hero-stats animate-in delay-4">
              <div className="stat-cell">
                <div className="stat-num">{tests.length}<sup>+</sup></div>
                <div className="stat-label">Тестов</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">60<sup>+</sup></div>
                <div className="stat-label">Вопросов</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">5</div>
                <div className="stat-label">Категорий</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">3</div>
                <div className="stat-label">Уровня сложности</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="section-tag">Возможности платформы</div>
          <h2 className="section-title">Всё что нужно<br />для подготовки</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon"><i className={`bi ${f.icon}`} /></div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2>Готов проверить себя?</h2>
            <p>Зарегистрируйся и начни прямо сейчас — бесплатно и без ограничений.</p>
            <div className="cta-actions">
              {user ? (
                <Link to="/tests" className="btn btn-primary"><i className="bi bi-play-fill" /> Открыть каталог</Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary"><i className="bi bi-person-plus" /> Создать аккаунт</Link>
                  <Link to="/tests"    className="btn btn-secondary"><i className="bi bi-eye" /> Смотреть тесты</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </article>
  );
};
