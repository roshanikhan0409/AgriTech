import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useFetch, Loading, ErrorBox, fmtDate } from '../components/UI';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: post, loading, error, reload } = useFetch(`/posts/${id}`);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');

  const comment = async (e) => {
    e.preventDefault();
    setMsg('');
    try { await api.post(`/posts/${id}/comments`, { text }); setText(''); reload(); } catch (err) { setMsg(errMsg(err)); }
  };
  const remove = async () => {
    if (!window.confirm('Delete this post?')) return;
    try { await api.delete(`/posts/${id}`); navigate('/forum'); } catch (err) { setMsg(errMsg(err)); }
  };
  const toggleHide = async () => {
    try { await api.patch(`/posts/${id}/hide`, { hidden: !post.hidden }); reload(); } catch (err) { setMsg(errMsg(err)); }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const canDelete = user.role === 'admin' || post.author?._id === user._id;

  return (
    <>
      <Link to="/forum" className="small">← Back to forum</Link>
      <div className="card my-3"><div className="card-body">
        <h1 className="h5">{post.title}</h1>
        <div className="small text-muted mb-3">by {post.author?.name} ({post.author?.role}) · {fmtDate(post.createdAt)}</div>
        <p style={{ whiteSpace: 'pre-wrap' }}>{post.body}</p>
        <div className="d-flex gap-2">
          {canDelete && <button className="btn btn-sm btn-outline-danger" onClick={remove}>Delete</button>}
          {user.role === 'admin' && <button className="btn btn-sm btn-outline-warning" onClick={toggleHide}>{post.hidden ? 'Unhide' : 'Hide (moderate)'}</button>}
        </div>
      </div></div>
      <ErrorBox error={msg} />

      <h2 className="h6">{post.comments.length} comment(s)</h2>
      {post.comments.map((c) => (
        <div key={c._id} className="card mb-2"><div className="card-body py-2">
          <div className="small text-muted">{c.author?.name} {c.author?.role !== 'farmer' && <span className="badge text-bg-success">{c.author?.role}</span>} · {fmtDate(c.createdAt)}</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{c.text}</div>
        </div></div>
      ))}

      {!post.hidden && (
        <form onSubmit={comment} className="mt-3">
          <textarea className="form-control mb-2" rows={2} required placeholder="Write a comment..." value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn btn-agri btn-sm">Comment</button>
        </form>
      )}
    </>
  );
}
