import { Link } from 'react-router-dom';
export const NotFound = () => (
  <div className="not-found">
    <div className="not-found-code">404</div>
    <h1>Страница не найдена</h1>
    <p>Такой страницы не существует. Возможно, вы перешли по неверной ссылке.</p>
    <Link to="/" className="btn btn-secondary" style={{marginTop:8}}><i className="bi bi-house" /> На главную</Link>
  </div>
);
