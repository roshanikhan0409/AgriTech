import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend, Bar, Line, CartesianGrid } from 'recharts';
import { useFetch, Loading, ErrorBox, Empty, fmtDate } from '../components/UI';

// WMO weather codes -> label + icon
const code = (c) => {
  if (c === 0) return ['Clear', '☀️'];
  if (c <= 3) return ['Partly cloudy', '⛅'];
  if (c <= 48) return ['Fog', '🌫️'];
  if (c <= 67) return ['Rain', '🌧️'];
  if (c <= 77) return ['Snow', '❄️'];
  if (c <= 82) return ['Showers', '🌦️'];
  return ['Thunderstorm', '⛈️'];
};

export default function Weather() {
  const location = useLocation();
  const farms = useFetch('/farms');
  const [farmId, setFarmId] = useState(location.state?.farmId || '');

  useEffect(() => {
    if (!farmId && farms.data?.length) setFarmId(farms.data[0]._id);
  }, [farms.data, farmId]);

  const w = useFetch(farmId ? `/weather/farm/${farmId}` : null, [farmId]);

  if (farms.loading) return <Loading />;
  if (farms.data && !farms.data.length) return <div className="alert alert-info">Add a farm with coordinates to see its weather. <Link to="/farms">Add farm</Link></div>;

  const chart = w.data ? w.data.daily.time.map((t, i) => ({
    date: new Date(t).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
    max: w.data.daily.temperature_2m_max[i],
    min: w.data.daily.temperature_2m_min[i],
    rain: w.data.daily.precipitation_sum[i],
  })) : [];

  const [label, icon] = w.data ? code(w.data.current.weather_code) : [];

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h1 className="h4 mb-0">Weather</h1>
        <select className="form-select w-auto" value={farmId} onChange={(e) => setFarmId(e.target.value)} aria-label="Select farm">
          {farms.data?.map((f) => <option key={f._id} value={f._id}>{f.name} — {f.location}</option>)}
        </select>
      </div>

      {w.loading ? <Loading /> : w.error ? <ErrorBox error={w.error} /> : w.data && (
        <>
          <div className="card mb-3"><div className="card-body">
            <div className="d-flex flex-wrap align-items-center gap-4">
              <div className="display-4">{icon}</div>
              <div>
                <div className="display-6">{w.data.current.temperature_2m}°C</div>
                <div className="text-muted">{label} · {w.data.farm.name}</div>
              </div>
              <div className="small">
                <div>💧 Humidity: {w.data.current.relative_humidity_2m}%</div>
                <div>🌬️ Wind: {w.data.current.wind_speed_10m} km/h</div>
                <div>🌧️ Precipitation: {w.data.current.precipitation} mm</div>
              </div>
            </div>
            <div className="small text-muted mt-2">Updated {new Date(w.data.fetchedAt).toLocaleTimeString()} · data from Open-Meteo</div>
          </div></div>

          <div className="card mb-3"><div className="card-body">
            <h2 className="h6">Farming advisories</h2>
            {w.data.advisories.length ? w.data.advisories.map((a, i) => (
              <div key={i} className={`alert alert-${a.level === 'high' ? 'danger' : 'warning'} py-2 small mb-2`}><strong>{fmtDate(a.date)}:</strong> {a.text}</div>
            )) : <Empty>No weather risks in the next 7 days.</Empty>}
          </div></div>

          <div className="card mb-3"><div className="card-body">
            <h2 className="h6">7-day forecast</h2>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" />
                <YAxis yAxisId="t" unit="°" /><YAxis yAxisId="r" orientation="right" unit="mm" />
                <Tooltip /><Legend />
                <Bar yAxisId="r" dataKey="rain" name="Rain (mm)" fill="#64b5f6" />
                <Line yAxisId="t" dataKey="max" name="Max °C" stroke="#ef6c00" strokeWidth={2} />
                <Line yAxisId="t" dataKey="min" name="Min °C" stroke="#1976d2" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div></div>

          <div className="row g-2">
            {w.data.daily.time.map((t, i) => {
              const [l, ic] = code(w.data.daily.weather_code[i]);
              return (
                <div className="col-6 col-md" key={t}>
                  <div className="card text-center h-100"><div className="card-body p-2">
                    <div className="small fw-bold">{new Date(t).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                    <div className="fs-3">{ic}</div>
                    <div className="small">{w.data.daily.temperature_2m_max[i]}° / {w.data.daily.temperature_2m_min[i]}°</div>
                    <div className="small text-muted">{w.data.daily.precipitation_probability_max[i]}% rain</div>
                  </div></div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
