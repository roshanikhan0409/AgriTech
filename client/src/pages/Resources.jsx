import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useFetch, Loading, ErrorBox, Empty, money } from '../components/UI';

const CATS = ['', 'seed', 'fertilizer', 'pesticide', 'equipment', 'other'];
const blank = { name: '', category: 'seed', price: '', unit: 'kg', stock: '', description: '' };

export default function Resources() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const url = `/resources?${new URLSearchParams({ ...(category && { category }), ...(q && { q }) })}`;
  const { data, loading, error, reload } = useFetch(url);

  const [cart, setCart] = useState({}); // id -> qty
  const [address, setAddress] = useState('');
  const [orderMsg, setOrderMsg] = useState({ type: '', text: '' });
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const byId = useMemo(() => Object.fromEntries((data || []).map((r) => [r._id, r])), [data]);
  const cartItems = Object.entries(cart).filter(([id]) => byId[id]).map(([id, qty]) => ({ ...byId[id], qty }));
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  const add = (r) => setCart((c) => ({ ...c, [r._id]: Math.min((c[r._id] || 0) + 1, r.stock) }));
  const setQty = (id, qty) => setCart((c) => {
    const n = { ...c };
    if (qty <= 0) delete n[id]; else n[id] = Math.min(qty, byId[id]?.stock || qty);
    return n;
  });

  const placeOrder = async () => {
    setOrderMsg({ type: '', text: '' });
    if (!address.trim()) return setOrderMsg({ type: 'danger', text: 'Enter a delivery address' });
    setPlacing(true);
    try {
      await api.post('/orders', { items: cartItems.map((i) => ({ resource: i._id, quantity: i.qty })), address });
      setCart({});
      navigate('/orders');
    } catch (e) {
      setOrderMsg({ type: 'danger', text: errMsg(e) });
      reload();
    } finally { setPlacing(false); }
  };

  const saveResource = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock || 0) };
      if (editId) await api.put(`/resources/${editId}`, body); else await api.post('/resources', body);
      setForm(blank); setEditId(null); setShowForm(false); reload();
    } catch (err) { setFormError(errMsg(err)); }
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try { await api.delete(`/resources/${id}`); reload(); } catch (e) { alert(errMsg(e)); }
  };
  const approve = async (r) => {
    try { await api.patch(`/resources/${r._id}/approve`, { approved: !r.approved }); reload(); } catch (e) { alert(errMsg(e)); }
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h4 mb-0">Buy Resources</h1>
        {isAdmin && <button className="btn btn-agri" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(blank); }}>{showForm ? 'Close' : '+ Add resource'}</button>}
      </div>

      {isAdmin && showForm && (
        <form className="card card-body mb-4" onSubmit={saveResource}>
          <ErrorBox error={formError} />
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label">Name</label><input className="form-control" required value={form.name} onChange={set('name')} /></div>
            <div className="col-md-2"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={set('category')}>{CATS.slice(1).map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="col-md-2"><label className="form-label">Price ₹</label><input type="number" min="0" step="any" required className="form-control" value={form.price} onChange={set('price')} /></div>
            <div className="col-md-2"><label className="form-label">Unit</label><input className="form-control" value={form.unit} onChange={set('unit')} /></div>
            <div className="col-md-2"><label className="form-label">Stock</label><input type="number" min="0" className="form-control" value={form.stock} onChange={set('stock')} /></div>
            <div className="col-12"><label className="form-label">Description</label><input className="form-control" value={form.description || ''} onChange={set('description')} /></div>
          </div>
          <button className="btn btn-agri mt-3 align-self-start">{editId ? 'Update' : 'Save'}</button>
        </form>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="d-flex gap-2 mb-3">
            <input className="form-control" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search resources" />
            <select className="form-select w-auto" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
              {CATS.map((c) => <option key={c} value={c}>{c || 'All categories'}</option>)}
            </select>
          </div>
          {loading ? <Loading /> : error ? <ErrorBox error={error} /> : !data.length ? <Empty>No resources found.</Empty> : (
            <div className="row g-3">
              {data.map((r) => (
                <div className="col-sm-6" key={r._id}>
                  <div className="card h-100 shadow-sm"><div className="card-body">
                    <div className="d-flex justify-content-between">
                      <h2 className="h6">{r.name}</h2>
                      <span className="badge text-bg-light border">{r.category}</span>
                    </div>
                    {r.description && <p className="small text-muted mb-2">{r.description}</p>}
                    <div className="fw-bold">{money(r.price)} <small className="text-muted fw-normal">/ {r.unit}</small></div>
                    <div className={`small ${r.stock ? 'text-muted' : 'text-danger'}`}>{r.stock ? `${r.stock} in stock` : 'Out of stock'}</div>
                    {isAdmin && !r.approved && <span className="badge text-bg-warning mt-1">pending approval</span>}
                  </div>
                  <div className="card-footer bg-white d-flex flex-wrap gap-2">
                    {!isAdmin && <button className="btn btn-sm btn-agri" disabled={!r.stock} onClick={() => add(r)}>Add to cart</button>}
                    {isAdmin && (
                      <>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => { setForm({ ...blank, ...r }); setEditId(r._id); setShowForm(true); window.scrollTo(0, 0); }}>Edit</button>
                        <button className="btn btn-sm btn-outline-success" onClick={() => approve(r)}>{r.approved ? 'Unapprove' : 'Approve'}</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(r._id)}>Delete</button>
                      </>
                    )}
                  </div></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isAdmin && (
          <div className="col-lg-4">
            <div className="card position-sticky" style={{ top: 16 }}><div className="card-body">
              <h2 className="h6">Your cart</h2>
              {!cartItems.length ? <Empty>Cart is empty.</Empty> : (
                <>
                  {cartItems.map((i) => (
                    <div key={i._id} className="d-flex justify-content-between align-items-center mb-2 small">
                      <div className="me-2">{i.name}<div className="text-muted">{money(i.price)} × {i.qty}</div></div>
                      <div className="d-flex align-items-center gap-1">
                        <button className="btn btn-sm btn-outline-secondary py-0" onClick={() => setQty(i._id, i.qty - 1)} aria-label="Decrease">−</button>
                        <span>{i.qty}</span>
                        <button className="btn btn-sm btn-outline-secondary py-0" onClick={() => setQty(i._id, i.qty + 1)} aria-label="Increase">+</button>
                      </div>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between fw-bold mb-2"><span>Total</span><span>{money(total)}</span></div>
                  <textarea className="form-control mb-2" rows={2} placeholder="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} />
                  {orderMsg.text && <div className={`alert alert-${orderMsg.type} py-1 small`}>{orderMsg.text}</div>}
                  <button className="btn btn-agri w-100" disabled={placing} onClick={placeOrder}>{placing ? 'Placing...' : 'Place order'}</button>
                </>
              )}
            </div></div>
          </div>
        )}
      </div>
    </>
  );
}
