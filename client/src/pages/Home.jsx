import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🚜', title: 'Farm Management', text: 'Add farms, track crops and view history in one dashboard.', to: '/farms' },
  { icon: '🌱', title: 'Crop Tracking', text: 'Monitor growth stages, health and yield predictions.', to: '/crops' },
  { icon: '⛅', title: 'Weather Forecast', text: 'Location-based forecasts with farming advisories.', to: '/weather' },
  { icon: '🧪', title: 'Soil Health', text: 'Log soil readings and get recommendations.', to: '/crops' },
  { icon: '🐛', title: 'Pest Alerts', text: 'Alerts and treatments for crops you grow.', to: '/alerts' },
  { icon: '🛒', title: 'Buy Resources', text: 'Seeds, fertilizers, pesticides and equipment.', to: '/resources' },
  { icon: '👩‍🔬', title: 'Expert Advice', text: 'Ask agricultural experts your questions.', to: '/consultations' },
  { icon: '💬', title: 'Community Forum', text: 'Share experiences with other farmers.', to: '/forum' },
];

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <>
      <section className="hero rounded-3 mb-4 text-center">
        <div className="container">
          <h1 className="display-5 fw-bold">{t('home.title')}</h1>
          <p className="lead">{t('home.subtitle')}</p>
          <Link to={user ? '/dashboard' : '/register'} className="btn btn-light btn-lg">{t('home.cta')}</Link>
        </div>
      </section>
      <h2 className="h4 mb-3">{t('home.features')}</h2>
      <div className="row g-3">
        {features.map((f) => (
          <div className="col-12 col-sm-6 col-lg-3" key={f.title}>
            <Link to={user ? f.to : '/login'} className="text-decoration-none text-dark">
              <div className="card feature-card shadow-sm">
                <div className="card-body">
                  <div className="fs-1">{f.icon}</div>
                  <h3 className="h6 mt-2">{f.title}</h3>
                  <p className="small text-muted mb-0">{f.text}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
