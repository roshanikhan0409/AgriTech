import { useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useFetch, Loading, ErrorBox, Empty, fmtDate } from '../components/UI';

const blank = { title: '', type: 'pest', severity: 'medium', crops: '', description: '', treatment: '', region: '' };
const sevClass = { high: 'danger', medium: 'warning', low: 'info' };

export default function Alerts() {
  const { user } = useAuth();
  const canManage = user.role === 'admin' || user.role === 'expert';
  const { data, loading, error, reload } = useFetch('/alerts');
  const [form, setForm] = useState(blank);
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/alerts', { ...form, crops: form.crops.split(',') });
      setForm(blank); setShow(false); reload();
    } catch (err) { setFormError(errMsg(err)); }
  };

  const toggle = async (a) => {
    try { await api.put(`/alerts/${a._id}`, { ...a, active: !a.active }); reload(); } catch (err) { alert(errMsg(err)); }
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this alert?')) return;
    try { await api.delete(`/alerts/${id}`); reload(); } catch (err) { alert(errMsg(err)); }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Pest &amp; Disease Alerts</h1>
        {canManage && <button className="btn btn-agri" onClick={() => setShow(!show)}>{show ? 'Close' : '+ New alert'}</button>}
      </div>

      {show && (
        <form className="card card-body mb-4" onSubmit={submit}>
          <ErrorBox error={formError} />
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Title</label><input className="form-control" required value={form.title} onChange={set('title')} /></div>
            <div className="col-md-3"><label className="form-label">Type</label><select className="form-select" value={form.type} onChange={set('type')}><option>pest</option><option>disease</option><option>weather</option><option>general</option></select></div>
            <div className="col-md-3"><label className="form-label">Severity</label><select className="form-select" value={form.severity} onChange={set('severity')}><option>low</option><option>medium</option><option>high</option></select></div>
            <div className="col-md-6"><label className="form-label">Crops affected (comma separated, blank = all)</label><input className="form-control" value={form.crops} onChange={set('crops')} placeholder="wheat, maize" /></div>
            <div className="col-md-6"><label className="form-label">Region</label><input className="form-control" value={form.region} onChange={set('region')} /></div>
            <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={form.description} onChange={set('description')} /></div>
            <div className="col-12"><label className="form-label">Suggested treatment</label><textarea className="form-control" rows={2} value={form.treatment} onChange={set('treatment')} /></div>
          </div>
          <button className="btn btn-agri mt-3 align-self-start">Publish alert</button>
        </form>
      )}

      {loading ? <Loading /> : error ? <ErrorBox error={error} /> : !data.length ? <Empty>No alerts for your crops right now.</Empty> : data.map((a) => (
        <div key={a._id} className={`card border-${sevClass[a.severity]} mb-3`}>
          <div className="card-body">
            <div className="d-flex justify-content-between flex-wrap gap-2">
              <h2 className="h6 mb-1">{a.title}</h2>
              <div>
                <span className={`badge text-bg-${sevClass[a.severity]} me-1`}>{a.severity}</span>
                <span className="badge text-bg-secondary">{a.type}</span>
                {!a.active && <span className="badge text-bg-dark ms-1">inactive</span>}
              </div>
            </div>
            <div className="small text-muted mb-2">{fmtDate(a.createdAt)}{a.region && ` · ${a.region}`}{a.crops.length > 0 && ` · crops: ${a.crops.join(', ')}`}</div>
            {a.description && <p className="mb-1">{a.description}</p>}
            {a.treatment && <p className="mb-0"><strong>Suggested treatment:</strong> {a.treatment}</p>}
            {canManage && (
              <div className="mt-2 d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => toggle(a)}>{a.active ? 'Deactivate' : 'Activate'}</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(a._id)}>Delete</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
