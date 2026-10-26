import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useFetch, Loading, ErrorBox, Empty, fmtDate } from '../components/UI';

export default function Forum() {
  const { data, loading, error, reload } = useFetch('/posts');
  const [form, setForm] = useState({ title: '', body: '', tags: '' });
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/posts', { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) });
      setForm({ title: '', body: '', tags: '' }); setShow(false); reload();
    } catch (err) { setFormError(errMsg(err)); }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 mb-0">Community Forum</h1>
        <button className="btn btn-agri" onClick={() => setShow(!show)}>{show ? 'Close' : '+ New post'}</button>
      </div>

      {show && (
        <form className="card card-body mb-4" onSubmit={submit}>
          <ErrorBox error={formError} />
          <div className="mb-3"><label className="form-label">Title</label><input className="form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="mb-3"><label className="form-label">Your question or experience</label><textarea className="form-control" rows={4} required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <div className="mb-3"><label className="form-label">Tags (comma separated)</label><input className="form-control" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></div>
          <button className="btn btn-agri align-self-start">Post</button>
        </form>
      )}

      {loading ? <Loading /> : error ? <ErrorBox error={error} /> : !data.length ? <Empty>No posts yet. Start the conversation!</Empty> : (
        <div className="list-group">
          {data.map((p) => (
            <Link key={p._id} to={`/forum/${p._id}`} className="list-group-item list-group-item-action">
              <div className="d-flex justify-content-between">
                <h2 className="h6 mb-1">{p.title}{p.hidden && <span className="badge text-bg-warning ms-2">hidden</span>}</h2>
                <small className="text-muted">{fmtDate(p.createdAt)}</small>
              </div>
              <div className="small text-muted">by {p.author?.name || 'unknown'} · {p.comments.length} comment(s)</div>
              <div className="mt-1">{p.tags.map((t) => <span key={t} className="badge text-bg-light border me-1">{t}</span>)}</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
