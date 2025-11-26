// useApi.js - Custom hook for API calls with loading and error states

import { useState, useCallback } from 'react';
import api from '../services/api';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return { request, loading, error };
};

export default useApi;