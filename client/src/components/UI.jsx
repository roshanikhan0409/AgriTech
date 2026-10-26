import { useEffect, useState, useCallback } from 'react';
import api, { errMsg } from '../api';

export function ErrorBox({ error }) {
  return error ? <div className="alert alert-danger py-2">{error}</div> : null;
}

export function Loading() {
  return <div className="text-center py-4 text-muted">Loading...</div>;
}

export function Empty({ children = 'Nothing here yet.' }) {
  return <div className="text-center text-muted py-4">{children}</div>;
}

export function StatCard({ label, value }) {
  return (
    <div className="card card-stat h-100 text-center">
      <div className="card-body">
        <div className="display-6">{value}</div>
        <div className="text-muted small">{label}</div>
      </div>
    </div>
  );
}

// Fetch a GET endpoint with loading/error state and a reload function
export function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(url);
      setData(res.data);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  useEffect(() => { load(); }, [load]);
  return { data, error, loading, reload: load, setData };
}

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');
export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
export const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
