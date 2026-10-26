import { useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useFetch, Loading, ErrorBox, Empty, fmtDate } from '../components/UI';

const color = { open: 'warning', answered: 'success', closed: 'secondary' };

export default function Consultations() {
  const { user } = useAuth();
  const isFarmer = user.role === 'farmer';
  const { data, loading, error, reload } = useFetch('/consultations');
  const crops = useFetch(isFarmer ? '/crops' : null);
  const [form, setForm] = useState({ subject: '', question: '', crop: '' });
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState('');
  const [answers, setAnswers] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    try { await api.post('/consultations', form); setForm({ subject: '', question: '', crop: '' }); setShow(false); reload(); } catch (err) { setFormError(errMsg(err)); }
  };
  const answer = async (id) => {
    try { await api.patch(`/consultations/${id}/answer`, { answer: answers[id] || '' }); setAnswers({ ...answers, [id]: '' }); reload(); } catch (err) { alert(errMsg(err)); }
  };
  const close = async (id) => {
    try { await api.patch(`/consultations/${id}/close`); reload(); } catch (err) { alert(errMsg(err)); }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">{isFarmer ? 'Ask an Expert' : 'Farmer Questions'}</h1>
        {isFarmer && <button className="btn btn-agri" onClick={() => setShow(!show)}>{show ? 'Close' : '+ New question'}</button>}
      </div>

      {show && (
        <form className="card card-body mb-4" onSubmit={submit}>
          <ErrorBox error={formError} />
          <div className="mb-3"><label className="form-label">Subject</label><input className="form-control" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div className="mb-3"><label className="form-label">Related crop (optional)</label>
            <select className="form-select" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })}>
              <option value="">None</option>
              {crops.data?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="mb-3"><label className="form-label">Your question</label><textarea className="form-control" rows={4} required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
          <button className="btn btn-agri align-self-start">Send to experts</button>
        </form>
      )}

      {loading ? <Loading /> : error ? <ErrorBox error={error} /> : !data.length ? <Empty>No consultations yet.</Empty> : data.map((c) => (
        <div className="card mb-3" key={c._id}><div className="card-body">
          <div className="d-flex justify-content-between flex-wrap gap-2">
            <h2 className="h6 mb-1">{c.subject}</h2>
            <span className={`badge text-bg-${color[c.status]}`}>{c.status}</span>
          </div>
          <div className="small text-muted mb-2">{c.farmer?.name} · {fmtDate(c.createdAt)}{c.crop && ` · crop: ${c.crop.name}`}</div>
          <p style={{ whiteSpace: 'pre-wrap' }}>{c.question}</p>
          {c.answer && (
            <div className="alert alert-success small mb-2">
              <strong>Answer{c.answeredBy && ` from ${c.answeredBy.name}`}:</strong>
              <div style={{ whiteSpace: 'pre-wrap' }}>{c.answer}</div>
            </div>
          )}
          {!isFarmer && c.status !== 'closed' && (
            <div className="d-flex gap-2">
              <textarea className="form-control" rows={2} placeholder="Write your advice..." value={answers[c._id] || ''} onChange={(e) => setAnswers({ ...answers, [c._id]: e.target.value })} />
              <button className="btn btn-agri" disabled={!(answers[c._id] || '').trim()} onClick={() => answer(c._id)}>Answer</button>
            </div>
          )}
          {isFarmer && c.status !== 'closed' && <button className="btn btn-sm btn-outline-secondary" onClick={() => close(c._id)}>Mark resolved</button>}
        </div></div>
      ))}
    </>
  );
}
