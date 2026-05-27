import { useState, useCallback } from "react";
import api from "../utils/api";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (method, url, data = null, params = null) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api({ method, url, data, params });
        return response.data;
      } catch (err) {
        const message = err.response?.data?.message || "Terjadi kesalahan";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const get = useCallback(
    (url, params) => request("GET", url, null, params),
    [request],
  );
  const post = useCallback(
    (url, data) => request("POST", url, data),
    [request],
  );
  const put = useCallback((url, data) => request("PUT", url, data), [request]);
  const del = useCallback((url) => request("DELETE", url), [request]);

  return { loading, error, get, post, put, del };
}
