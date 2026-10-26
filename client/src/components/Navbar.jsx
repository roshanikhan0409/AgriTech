import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const link = (to, label) => (
    <li className="nav-item" key={to}>
      <NavLink to={to} className="nav-link">{label}</NavLink>
    </li>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-agri">
      <div className="container">
        <Link className="navbar-brand" to="/">🌾 {t('appName')}</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto">
            {link('/', t('nav.home'))}
            {user && (
              <>
                {link('/dashboard', t('nav.dashboard'))}
                {link('/farms', t('nav.farms'))}
                {link('/crops', t('nav.crops'))}
                {link('/weather', t('nav.weather'))}
                {link('/alerts', t('nav.alerts'))}
                {link('/resources', t('nav.resources'))}
                {link('/orders', t('nav.orders'))}
                {link('/forum', t('nav.forum'))}
                {link('/consultations', t('nav.experts'))}
                {user.role === 'admin' && link('/admin', t('nav.admin'))}
              </>
            )}
          </ul>
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              aria-label="Language"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
            {user ? (
              <>
                <span className="text-white small d-none d-lg-inline">{user.name}</span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>{t('nav.logout')}</button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/login">{t('nav.login')}</Link>
                <Link className="btn btn-light btn-sm" to="/register">{t('nav.register')}</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
