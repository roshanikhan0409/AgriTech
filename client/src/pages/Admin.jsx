import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useFetch, Loading, ErrorBox, StatCard, fmtDate } from '../components/UI';

export default function Admin() {
  const { user: me } = useAuth();
  const stats = useFetch('/admin/stats');
  const users = useFetch('/admin/users');

  const update = async (id, body) => {
    try { await api.patch(`/admin/users/${id}`, body); users.reload(); stats.reload(); } catch (e) { alert(errMsg(e)); }
  };
  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name} and all their farm data?`)) return;
    try { await api.delete(`/admin/users/${u._id}`); users.reload(); stats.reload(); } catch (e) { alert(errMsg(e)); }
  };

  return (
    <>
      <h1 className="h4 mb-3">Admin Dashboard</h1>
      {stats.loading ? <Loading /> : stats.error ? <ErrorBox error={stats.error} /> : (
        <div className="row g-3 mb-4">
          {[['Users', stats.data.users], ['Farms', stats.data.farms], ['Crops', stats.data.crops], ['Orders', stats.data.orders], ['Forum posts', stats.data.posts], ['Open questions', stats.data.openConsults], ['Unapproved resources', stats.data.pendingResources]].map(([l, v]) => (
            <div className="col-6 col-md-3" key={l}><StatCard label={l} value={v} /></div>
          ))}
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link to="/resources" className="btn btn-outline-success">Manage resources</Link>
        <Link to="/orders" className="btn btn-outline-success">Manage orders</Link>
        <Link to="/alerts" className="btn btn-outline-success">Manage alerts</Link>
        <Link to="/forum" className="btn btn-outline-success">Moderate forum</Link>
        <Link to="/consultations" className="btn btn-outline-success">Consultations</Link>
      </div>

      <h2 className="h6">Users</h2>
      {users.loading ? <Loading /> : users.error ? <ErrorBox error={users.error} /> : (
        <div className="table-responsive">
          <table className="table align-middle bg-white">
            <thead className="table-light"><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th /></tr></thead>
            <tbody>
              {users.data.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select className="form-select form-select-sm w-auto" value={u.role} disabled={u._id === me._id} onChange={(e) => update(u._id, { role: e.target.value })} aria-label="Role">
                      <option>farmer</option><option>expert</option><option>admin</option>
                    </select>
                  </td>
                  <td>{fmtDate(u.createdAt)}</td>
                  <td><span className={`badge text-bg-${u.active ? 'success' : 'secondary'}`}>{u.active ? 'active' : 'disabled'}</span></td>
                  <td className="text-end text-nowrap">
                    {u._id !== me._id && (
                      <>
                        <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => update(u._id, { active: !u.active })}>{u.active ? 'Disable' : 'Enable'}</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u)}>Delete</button>
                      </>
                    )}
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
