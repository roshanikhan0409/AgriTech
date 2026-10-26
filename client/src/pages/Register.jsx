import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import { ErrorBox } from '../components/UI';

export default function Register() {
  const { register } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setBusy(true);
    try {
      await register({ ...form, language: i18n.language });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h1 className="h4 mb-3">Create your account</h1>
            <ErrorBox error={error} />
            <form onSubmit={submit}>
              <div className="mb-3"><label className="form-label">Name</label><input className="form-control" required value={form.name} onChange={set('name')} /></div>
              <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" required value={form.email} onChange={set('email')} /></div>
              <div className="mb-3"><label className="form-label">Phone (optional)</label><input className="form-control" value={form.phone} onChange={set('phone')} /></div>
              <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" required minLength={6} value={form.password} onChange={set('password')} /></div>
              <button className="btn btn-agri w-100" disabled={busy}>{busy ? 'Creating...' : 'Register'}</button>
            </form>
            <p className="small mt-3 mb-0">Already registered? <Link to="/login">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
