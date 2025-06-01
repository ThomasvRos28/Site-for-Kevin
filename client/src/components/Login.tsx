import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dummyUsers = [
    { email: 'po_viewer@example.com', password: 'password123', role: 'client', name: 'PO Viewer Client', id: 'dummy001' },
    { email: 'po_editor@example.com', password: 'password456', role: 'hauler', name: 'PO Editor Hauler', id: 'dummy002' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Check for dummy users first
    const matchedDummyUser = dummyUsers.find(
      user => user.email === formData.email && user.password === formData.password
    );

    if (matchedDummyUser) {
      console.log('Logging in with dummy user:', matchedDummyUser.name);
      const fakeToken = `dummy-token-for-${matchedDummyUser.id}`;
      const userToStore = {
        id: matchedDummyUser.id,
        name: matchedDummyUser.name,
        email: matchedDummyUser.email,
        role: matchedDummyUser.role
      };
      localStorage.setItem('token', fakeToken);
      localStorage.setItem('user', JSON.stringify(userToStore));
      // Potentially set a flag if your AuthContext needs to be updated without a real API call
      // For now, direct navigation will likely trigger AuthContext to check localStorage
      navigate('/home');
      setLoading(false);
      return; // Skip actual API login
    }

    // If not a dummy user, proceed with actual login
    try {
      await login(formData.email, formData.password);
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>{t('auth.login')}</h1>
        {(error || authError) && (
          <div className="error-message">
            {error || authError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>
        <div className="dummy-credentials" style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '0.9em' }}>
          <h4 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#333' }}>{t('auth.dummyAccountsTitle', 'Test Accounts:')}</h4>
          {dummyUsers.map(user => (
            <p key={user.id} style={{ margin: '0.25rem 0', color: '#555' }}>
              <strong>{user.role === 'client' ? t('auth.dummyViewer', 'Viewer') : t('auth.dummyEditor', 'Editor')}:</strong> {user.email} / {user.password}
            </p>
          ))}
        </div>
        <div className="register-link">
          <p>
            {t('auth.noAccount')}{' '}
            <button
              className="link-button"
              onClick={() => navigate('/register')}
            >
              {t('auth.register')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 