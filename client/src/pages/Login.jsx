import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import { ErrorBox } from '../components/UI';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
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
            <h1 className="h4 mb-3">Login</h1>
            <ErrorBox error={error} />
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="email">Email</label>
                <input id="email" type="email" className="form-control" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="password">Password</label>
                <input id="password" type="password" className="form-control" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <button className="btn btn-agri w-100" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
            </form>
            <p className="small mt-3 mb-0">No account? <Link to="/register">Register</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
