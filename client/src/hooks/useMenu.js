import { useState, useEffect, useCallback } from 'react';
import { menuAPI } from '../services/api';

export default function useMenu(params = {}) {
  const [items, setItems]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes, cRes] = await Promise.all([
        menuAPI.getItems(params),
        menuAPI.getCategories(),
      ]);
      setItems(iRes.data.data);
      setCategories(cRes.data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const grouped = categories.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category?.id === cat.id),
  })).filter((g) => g.items.length > 0);

  return { items, categories, grouped, loading, error, refetch: fetchItems };
}
