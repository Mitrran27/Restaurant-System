import { useState, useEffect, useCallback } from 'react';
import { orderAPI } from '../services/api';

export default function useOrders(params = {}, autoRefreshMs = 0) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAll(params);
      setOrders(res.data.data);
      setPagination(res.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetch();
    if (autoRefreshMs > 0) {
      const interval = setInterval(fetch, autoRefreshMs);
      return () => clearInterval(interval);
    }
  }, [fetch]);

  return { orders, loading, error, pagination, refetch: fetch };
}
