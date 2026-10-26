import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useFetch, StatCard, Loading, ErrorBox, fmtDate, money, Empty } from '../components/UI';

const COLORS = ['#2e7d32', '#66bb6a', '#f9a825', '#ef6c00', '#6d4c41', '#1976d2', '#8e24aa'];

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch('/analytics/summary');
  const alerts = useFetch('/alerts');

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const { totals, stageCounts, yieldByCrop, usageByType, costByMonth, upcomingHarvests } = data;
  const stageData = Object.entries(stageCounts).map(([name, value]) => ({ name, value }));

  return (
    <>
      <h1 className="h4 mb-3">Welcome, {user.name}</h1>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><StatCard label="Farms" value={totals.farms} /></div>
        <div className="col-6 col-md-3"><StatCard label="Active crops" value={totals.activeCrops} /></div>
        <div className="col-6 col-md-3"><StatCard label="Total area" value={totals.totalArea} /></div>
        <div className="col-6 col-md-3"><StatCard label="Resource spend" value={money(totals.resourceCost + totals.orderSpend)} /></div>
      </div>

      {alerts.data?.length > 0 && (
        <div className="alert alert-warning">
          <strong>{alerts.data.length} active alert(s)</strong> for your crops. <Link to="/alerts">View alerts</Link>
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h6">Crop growth stages</h2>
            {stageData.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={stageData} dataKey="value" nameKey="name" outerRadius={85} label>
                    {stageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty>Add crops to see stages.</Empty>}
          </div></div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h6">Expected vs actual yield (quintal)</h2>
            {yieldByCrop.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={yieldByCrop}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
                  <Bar dataKey="expected" fill="#66bb6a" /><Bar dataKey="actual" fill="#2e7d32" />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty>No yield data yet.</Empty>}
          </div></div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h6">Resource usage by type</h2>
            {usageByType.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={usageByType}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="type" /><YAxis /><Tooltip />
                  <Bar dataKey="quantity" fill="#f9a825" />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty>Log resource usage on a crop to see this.</Empty>}
          </div></div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100"><div className="card-body">
            <h2 className="h6">Resource cost by month (₹)</h2>
            {costByMonth.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={costByMonth}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip />
                  <Line type="monotone" dataKey="cost" stroke="#ef6c00" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : <Empty>No cost data yet.</Empty>}
          </div></div>
        </div>
        <div className="col-12">
          <div className="card"><div className="card-body">
            <h2 className="h6">Upcoming harvests</h2>
            {upcomingHarvests.length ? (
              <ul className="list-group list-group-flush">
                {upcomingHarvests.map((c) => (
                  <li key={c._id} className="list-group-item d-flex justify-content-between">
                    <Link to={`/crops/${c._id}`}>{c.name}</Link>
                    <span className="text-muted">{c.stage} · {fmtDate(c.expectedHarvestDate)}</span>
                  </li>
                ))}
              </ul>
            ) : <Empty>No upcoming harvests.</Empty>}
          </div></div>
        </div>
      </div>
    </>
  );
}
