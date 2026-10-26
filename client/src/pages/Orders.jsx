import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useFetch, Loading, ErrorBox, Empty, fmtDate, money } from '../components/UI';

const STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const color = { placed: 'secondary', confirmed: 'info', shipped: 'primary', delivered: 'success', cancelled: 'danger' };

export default function Orders() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const { data, loading, error, reload } = useFetch('/orders');

  const setStatus = async (id, status) => {
    try { await api.patch(`/orders/${id}/status`, { status }); reload(); } catch (e) { alert(errMsg(e)); }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <>
      <h1 className="h4 mb-3">{isAdmin ? 'All Orders' : 'My Orders'}</h1>
      {!data.length ? <Empty>No orders yet.</Empty> : data.map((o) => (
        <div className="card mb-3" key={o._id}>
          <div className="card-body">
            <div className="d-flex flex-wrap justify-content-between gap-2">
              <div>
                <div className="small text-muted">Order #{o._id.slice(-6)} · {fmtDate(o.createdAt)}{isAdmin && o.user && ` · ${o.user.name}`}</div>
                <div className="small">📍 {o.address}</div>
              </div>
              <div className="text-end">
                <span className={`badge text-bg-${color[o.status]}`}>{o.status}</span>
                <div className="fw-bold">{money(o.total)}</div>
              </div>
            </div>
            <ul className="small mt-2 mb-2">
              {o.items.map((i, idx) => <li key={idx}>{i.name} — {money(i.price)} × {i.quantity}</li>)}
            </ul>
            {/* Progress tracker */}
            {o.status !== 'cancelled' && (
              <div className="progress mb-2" style={{ height: 6 }} role="progressbar" aria-label="Order progress">
                <div className="progress-bar bg-success" style={{ width: `${((STATUSES.indexOf(o.status) + 1) / 4) * 100}%` }} />
              </div>
            )}
            {isAdmin ? (
              <select className="form-select form-select-sm w-auto" value={o.status} onChange={(e) => setStatus(o._id, e.target.value)} aria-label="Order status">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            ) : o.status === 'placed' && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => window.confirm('Cancel this order?') && setStatus(o._id, 'cancelled')}>Cancel order</button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
