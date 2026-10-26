import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useFetch, Loading, ErrorBox, Empty } from '../components/UI';

const blank = { name: '', location: '', latitude: '', longitude: '', size: '', sizeUnit: 'acre', soilType: 'loamy', irrigation: 'rainfed', notes: '' };

export default function Farms() {
  const { data: farms, loading, error, reload } = useFetch('/farms');
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState('');
  const [show, setShow] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const startEdit = (f) => {
    setForm({ ...blank, ...f });
    setEditId(f._id);
    setShow(true);
  };
  const reset = () => { setForm(blank); setEditId(null); setShow(false); setFormError(''); };

  const useMyLocation = () => {
    if (!navigator.geolocation) return setFormError('Geolocation is not supported in this browser');
    navigator.geolocation.getCurrentPosition(
      (p) => setForm((f) => ({ ...f, latitude: p.coords.latitude.toFixed(4), longitude: p.coords.longitude.toFixed(4) })),
      () => setFormError('Could not get your location')
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const body = { ...form, latitude: Number(form.latitude), longitude: Number(form.longitude), size: Number(form.size) };
      if (editId) await api.put(`/farms/${editId}`, body);
      else await api.post('/farms', body);
      reset();
      reload();
    } catch (err) {
      setFormError(errMsg(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this farm and all its crops?')) return;
    try { await api.delete(`/farms/${id}`); reload(); } catch (err) { alert(errMsg(err)); }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">My Farms</h1>
        <button className="btn btn-agri" onClick={() => (show ? reset() : setShow(true))}>{show ? 'Close' : '+ Add farm'}</button>
      </div>

      {show && (
        <form className="card card-body mb-4" onSubmit={submit}>
          <ErrorBox error={formError} />
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Farm name</label><input className="form-control" required value={form.name} onChange={set('name')} /></div>
            <div className="col-md-6"><label className="form-label">Location (village / district)</label><input className="form-control" required value={form.location} onChange={set('location')} /></div>
            <div className="col-md-3"><label className="form-label">Latitude</label><input type="number" step="any" className="form-control" required value={form.latitude} onChange={set('latitude')} /></div>
            <div className="col-md-3"><label className="form-label">Longitude</label><input type="number" step="any" className="form-control" required value={form.longitude} onChange={set('longitude')} /></div>
            <div className="col-md-6 d-flex align-items-end"><button type="button" className="btn btn-outline-secondary" onClick={useMyLocation}>📍 Use my location</button></div>
            <div className="col-md-3"><label className="form-label">Size</label><input type="number" step="any" min="0" className="form-control" required value={form.size} onChange={set('size')} /></div>
            <div className="col-md-3"><label className="form-label">Unit</label><select className="form-select" value={form.sizeUnit} onChange={set('sizeUnit')}><option value="acre">Acre</option><option value="hectare">Hectare</option></select></div>
            <div className="col-md-3"><label className="form-label">Soil type</label><select className="form-select" value={form.soilType} onChange={set('soilType')}>{['clay', 'sandy', 'loamy', 'silty', 'black', 'red', 'other'].map((s) => <option key={s}>{s}</option>)}</select></div>
            <div className="col-md-3"><label className="form-label">Irrigation</label><input className="form-control" value={form.irrigation} onChange={set('irrigation')} /></div>
            <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows={2} value={form.notes || ''} onChange={set('notes')} /></div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-agri">{editId ? 'Update farm' : 'Save farm'}</button>
            <button type="button" className="btn btn-outline-secondary" onClick={reset}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <Loading /> : error ? <ErrorBox error={error} /> : !farms.length ? <Empty>No farms yet. Add your first farm.</Empty> : (
        <div className="row g-3">
          {farms.map((f) => (
            <div className="col-md-6 col-lg-4" key={f._id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h2 className="h5">{f.name}</h2>
                  <p className="text-muted small mb-2">📍 {f.location}</p>
                  <p className="mb-1">{f.size} {f.sizeUnit}s · {f.soilType} soil</p>
                  <p className="small text-muted">Irrigation: {f.irrigation}</p>
                </div>
                <div className="card-footer bg-white d-flex flex-wrap gap-2">
                  <Link to={`/crops?farm=${f._id}`} className="btn btn-sm btn-outline-success">Crops</Link>
                  <Link to="/weather" state={{ farmId: f._id }} className="btn btn-sm btn-outline-primary">Weather</Link>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(f)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(f._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
