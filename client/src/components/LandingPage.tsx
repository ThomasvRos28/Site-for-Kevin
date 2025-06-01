import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-header">
          <h1>MaterialFlow</h1>
          <p>Professional Material Ticketing & Workflow Management System</p>
        </div>
        
        <div className="login-options">
          <div className="login-card trucker" onClick={() => navigate('/trucker-login')}>
            <div className="card-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7h18l-2 9H5L3 7z" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="20" cy="20" r="1" />
                <path d="M3 7L2 3H1" />
              </svg>
            </div>
            <h2>{t('truckerLogin')}</h2>
            <p>{t('truckerLoginDesc') || 'Access your trucker portal to manage deliveries and tickets'}</p>
            <div className="card-arrow">→</div>
          </div>
          
          <div className="login-card admin" onClick={() => navigate('/login')}>
            <div className="card-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="7" r="4" />
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              </svg>
            </div>
            <h2>{t('adminLogin')}</h2>
            <p>{t('adminLoginDesc') || 'Sign in as administrator to access all system features'}</p>
            <div className="card-arrow">→</div>
          </div>
        </div>
        
        <div className="landing-footer">
          <p>&copy; 2025 MaterialFlow Dashboard. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
