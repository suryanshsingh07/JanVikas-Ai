import { useState, useEffect, useCallback } from 'react';
import { submissionService } from '../services/submissionService';
import toast from 'react-hot-toast';

export const useSubmissions = (initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await submissionService.getAll(params);
      setData(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const updateParams = (newParams) => {
    setParams(prev => ({ ...prev, ...newParams, page: newParams.page || 1 }));
  };

  const refresh = () => fetchSubmissions();

  return { data, pagination, loading, error, params, updateParams, refresh };
};
