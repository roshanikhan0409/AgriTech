import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import api, { errMsg } from '../api';
import { useFetch, Loading, ErrorBox, Empty, fmtDate } from '../components/UI';

const levelClass = { ok: 'success', medium: 'warning', high: 'danger' };

export default function CropDetail() {
  const { id } = useParams();
  const { data: crop, loading, error, reload } = useFetch(`/crops/${id}`);
  const alerts = useFetch('/alerts');
  const [soil, setSoil] = useState({ moisture: '', ph: '', nitrogen: '', phosphorus: '', potassium: '' });
  const [usage, setUsage] = useState({ type: 'water', quantity: '', unit: 'litre', cost: '' });
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');

  const run = async (fn) => {
    setMsg('');
    try { await fn(); reload(); } catch (e) { setMsg(errMsg(e)); }
  };

  const numbers = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '').map(([k, v]) => [k, Number(v)]));

  const addSoil = (e) => {
    e.preventDefault();
    const body = numbers(soil);
    if (!Object.keys(body).length) return setMsg('Enter at least one soil value');
    run(async () => { await api.post(`/crops/${id}/soil`, body); setSoil({ moisture: '', ph: '', nitrogen: '', phosphorus: '', potassium: '' }); });
  };
  const addUsage = (e) => {
    e.preventDefault();
    run(async () => {
      await api.post(`/crops/${id}/usage`, { type: usage.type, unit: usage.unit, quantity: Number(usage.quantity), cost: Number(usage.cost || 0) });
      setUsage({ ...usage, quantity: '', cost: '' });
    });
  };
  const addNote = (e) => {
    e.preventDefault();
    run(async () => { await api.post(`/crops/${id}/log`, { note }); setNote(''); });
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const soilData = crop.soilReadings.map((r) => ({ date: fmtDate(r.date), moisture: r.moisture, ph: r.ph }));
  const relevantAlerts = (alerts.data || []).filter((a) => !a.crops.length || a.crops.includes(crop.name.toLowerCase()));

  return (
    <>
      <Link to="/crops" className="small">← Back to crops</Link>
      <div className="d-flex flex-wrap justify-content-between align-items-start my-2">
        <div>
          <h1 className="h4 mb-1">{crop.name} {crop.variety && <small className="text-muted">({crop.variety})</small>}</h1>
          <div className="text-muted small">{crop.farm?.name} · planted {fmtDate(crop.plantingDate)} · harvest {fmtDate(crop.expectedHarvestDate)}</div>
        </div>
        <div className="d-flex gap-2">
          <span className="badge text-bg-secondary">{crop.stage}</span>
          <span className={`badge text-bg-${{ good: 'success', fair: 'warning', poor: 'danger' }[crop.health]}`}>health: {crop.health}</span>
        </div>
      </div>
      <ErrorBox error={msg} />

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h6">Soil health</h2>
            <form onSubmit={addSoil} className="row g-2 mb-3">
              {[['moisture', 'Moisture %'], ['ph', 'pH'], ['nitrogen', 'N kg/ha'], ['phosphorus', 'P kg/ha'], ['potassium', 'K kg/ha']].map(([k, label]) => (
                <div className="col-4 col-md" key={k}>
                  <input type="number" step="any" min="0" className="form-control form-control-sm" placeholder={label} aria-label={label} value={soil[k]} onChange={(e) => setSoil({ ...soil, [k]: e.target.value })} />
                </div>
              ))}
              <div className="col-12"><button className="btn btn-sm btn-agri">Add reading</button></div>
            </form>
            {crop.recommendations.length > 0 && (
              <div className="mb-3">
                <div className="small text-muted mb-1">Based on the latest reading:</div>
                {crop.recommendations.map((r, i) => <div key={i} className={`alert alert-${levelClass[r.level]} py-1 px-2 small mb-1`}>{r.text}</div>)}
              </div>
            )}
            {soilData.length > 1 && (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={soilData}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
                  <Line dataKey="moisture" stroke="#1976d2" /><Line dataKey="ph" stroke="#ef6c00" />
                </LineChart>
              </ResponsiveContainer>
            )}
            {!crop.soilReadings.length && <Empty>No soil readings yet.</Empty>}
          </div></div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h6">Resource usage</h2>
            <form onSubmit={addUsage} className="row g-2 mb-3">
              <div className="col-6 col-md-3">
                <select className="form-select form-select-sm" value={usage.type} onChange={(e) => setUsage({ ...usage, type: e.target.value })}>
                  {['water', 'fertilizer', 'pesticide', 'seed', 'labour', 'other'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-6 col-md-3"><input type="number" min="0" step="any" required className="form-control form-control-sm" placeholder="Quantity" value={usage.quantity} onChange={(e) => setUsage({ ...usage, quantity: e.target.value })} /></div>
              <div className="col-6 col-md-3"><input className="form-control form-control-sm" placeholder="Unit" value={usage.unit} onChange={(e) => setUsage({ ...usage, unit: e.target.value })} /></div>
              <div className="col-6 col-md-3"><input type="number" min="0" step="any" className="form-control form-control-sm" placeholder="Cost ₹" value={usage.cost} onChange={(e) => setUsage({ ...usage, cost: e.target.value })} /></div>
              <div className="col-12"><button className="btn btn-sm btn-agri">Log usage</button></div>
            </form>
            {crop.resourceUsage.length ? (
              <ul className="list-group list-group-flush small">
                {[...crop.resourceUsage].reverse().slice(0, 8).map((u) => (
                  <li key={u._id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>{fmtDate(u.date)} · {u.type}: {u.quantity} {u.unit} {u.cost ? `(₹${u.cost})` : ''}</span>
                    <button className="btn btn-sm btn-link text-danger" onClick={() => run(() => api.delete(`/crops/${id}/usage/${u._id}`))}>remove</button>
                  </li>
                ))}
              </ul>
            ) : <Empty>No usage logged.</Empty>}
          </div></div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h6">Pest &amp; disease alerts for {crop.name}</h2>
            {relevantAlerts.length ? relevantAlerts.map((a) => (
              <div key={a._id} className={`alert alert-${a.severity === 'high' ? 'danger' : a.severity === 'medium' ? 'warning' : 'info'} py-2 small`}>
                <strong>{a.title}</strong>
                {a.description && <div>{a.description}</div>}
                {a.treatment && <div className="mt-1"><em>Suggested treatment:</em> {a.treatment}</div>}
              </div>
            )) : <Empty>No active alerts.</Empty>}
          </div></div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h6">Activity log</h2>
            <form onSubmit={addNote} className="d-flex gap-2 mb-3">
              <input className="form-control form-control-sm" required placeholder="e.g. Applied first irrigation" value={note} onChange={(e) => setNote(e.target.value)} />
              <button className="btn btn-sm btn-agri">Add</button>
            </form>
            {crop.activityLog.length ? (
              <ul className="list-unstyled small mb-0">
                {[...crop.activityLog].reverse().slice(0, 10).map((l) => <li key={l._id} className="mb-1"><span className="text-muted">{fmtDate(l.date)}</span> — {l.note}</li>)}
              </ul>
            ) : <Empty>No activity yet.</Empty>}
          </div></div>
        </div>
      </div>
    </>
  );
}
