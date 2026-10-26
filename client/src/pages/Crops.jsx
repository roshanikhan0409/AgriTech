import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useFetch, Loading, ErrorBox, Empty, fmtDate, toInputDate } from '../components/UI';

const STAGES = ['sowing', 'germination', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvested'];
const blank = { name: '', variety: '', farm: '', plantingDate: '', expectedHarvestDate: '', area: '', stage: 'sowing', health: 'good', expectedYield: '', actualYield: '', notes: '' };
const healthColor = { good: 'success', fair: 'warning', poor: 'danger' };

export default function Crops() {
  const [params] = useSearchParams();
  const farmFilter = params.get('farm') || '';
  const crops = useFetch(farmFilter ? `/crops?farm=${farmFilter}` : '/crops');
  const farms = useFetch('/farms');
  const [form, setForm] = useState({ ...blank, farm: farmFilter });
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const reset = () => { setForm({ ...blank, farm: farmFilter }); setEditId(null); setShow(false); setFormError(''); };

  const startEdit = (c) => {
    setForm({
      ...blank, ...c,
      farm: c.farm?._id || c.farm,
      plantingDate: toInputDate(c.plantingDate),
      expectedHarvestDate: toInputDate(c.expectedHarvestDate),
    });
    setEditId(c._id);
    setShow(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const body = {
        name: form.name, variety: form.variety, farm: form.farm,
        plantingDate: form.plantingDate, expectedHarvestDate: form.expectedHarvestDate,
        area: form.area === '' ? undefined : Number(form.area),
        stage: form.stage, health: form.health,
        expectedYield: Number(form.expectedYield || 0), actualYield: Number(form.actualYield || 0),
        notes: form.notes,
      };
      if (editId) await api.put(`/crops/${editId}`, body);
      else await api.post('/crops', body);
      reset();
      crops.reload();
    } catch (err) {
      setFormError(errMsg(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this crop?')) return;
    try { await api.delete(`/crops/${id}`); crops.reload(); } catch (err) { alert(errMsg(err)); }
  };

  const noFarms = farms.data && farms.data.length === 0;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">My Crops</h1>
        <button className="btn btn-agri" disabled={noFarms} onClick={() => (show ? reset() : setShow(true))}>{show ? 'Close' : '+ Add crop'}</button>
      </div>
      {noFarms && <div className="alert alert-info">Add a farm first, then you can add crops to it. <Link to="/farms">Go to farms</Link></div>}

      {show && (
        <form className="card card-body mb-4" onSubmit={submit}>
          <ErrorBox error={formError} />
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label">Crop name</label><input className="form-control" required value={form.name} onChange={set('name')} placeholder="e.g. Wheat" /></div>
            <div className="col-md-4"><label className="form-label">Variety</label><input className="form-control" value={form.variety || ''} onChange={set('variety')} /></div>
            <div className="col-md-4"><label className="form-label">Farm</label>
              <select className="form-select" required value={form.farm} onChange={set('farm')} disabled={!!editId}>
                <option value="">Select farm</option>
                {farms.data?.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </div>
            <div className="col-md-3"><label className="form-label">Planting date</label><input type="date" className="form-control" required value={form.plantingDate} onChange={set('plantingDate')} /></div>
            <div className="col-md-3"><label className="form-label">Expected harvest</label><input type="date" className="form-control" required value={form.expectedHarvestDate} onChange={set('expectedHarvestDate')} /></div>
            <div className="col-md-3"><label className="form-label">Stage</label><select className="form-select" value={form.stage} onChange={set('stage')}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div className="col-md-3"><label className="form-label">Health</label><select className="form-select" value={form.health} onChange={set('health')}><option>good</option><option>fair</option><option>poor</option></select></div>
            <div className="col-md-4"><label className="form-label">Area (same unit as farm)</label><input type="number" min="0" step="any" className="form-control" value={form.area ?? ''} onChange={set('area')} /></div>
            <div className="col-md-4"><label className="form-label">Expected yield (quintal)</label><input type="number" min="0" step="any" className="form-control" value={form.expectedYield} onChange={set('expectedYield')} /></div>
            <div className="col-md-4"><label className="form-label">Actual yield (quintal)</label><input type="number" min="0" step="any" className="form-control" value={form.actualYield} onChange={set('actualYield')} /></div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-agri">{editId ? 'Update crop' : 'Save crop'}</button>
            <button type="button" className="btn btn-outline-secondary" onClick={reset}>Cancel</button>
          </div>
        </form>
      )}

      {crops.loading ? <Loading /> : crops.error ? <ErrorBox error={crops.error} /> : !crops.data.length ? <Empty>No crops yet.</Empty> : (
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white">
            <thead className="table-light">
              <tr><th>Crop</th><th>Farm</th><th>Stage</th><th>Health</th><th>Planted</th><th>Harvest</th><th /></tr>
            </thead>
            <tbody>
              {crops.data.map((c) => (
                <tr key={c._id}>
                  <td><Link to={`/crops/${c._id}`}>{c.name}</Link>{c.variety && <div className="small text-muted">{c.variety}</div>}</td>
                  <td>{c.farm?.name}</td>
                  <td><span className="badge text-bg-secondary">{c.stage}</span></td>
                  <td><span className={`badge text-bg-${healthColor[c.health]}`}>{c.health}</span></td>
                  <td>{fmtDate(c.plantingDate)}</td>
                  <td>{fmtDate(c.expectedHarvestDate)}</td>
                  <td className="text-end text-nowrap">
                    <Link to={`/crops/${c._id}`} className="btn btn-sm btn-outline-success me-1">Details</Link>
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => startEdit(c)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(c._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
