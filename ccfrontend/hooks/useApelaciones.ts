import { useState, useCallback } from 'react';

import * as svc from '@/lib/apelacionesService';

export default function useApelaciones(token?: string) {
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const r = await svc.listApelaciones(params, token);
        setData(r.data || []);
        setMeta(r.meta || {});
        return r;
      } catch (err: any) {
        setError(err.message || 'Error listando apelaciones');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const get = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const r = await svc.getApelacion(id, token);
        return r;
      } catch (err: any) {
        setError(err.message || 'Error obteniendo apelación');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const create = useCallback(
    async (payload: any) => {
      setLoading(true);
      setError(null);
      try {
        const r = await svc.createApelacion(payload, token);
        return r;
      } catch (err: any) {
        setError(err.message || 'Error creando apelación');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const update = useCallback(
    async (id: number, payload: any) => {
      setLoading(true);
      setError(null);
      try {
        const r = await svc.updateApelacion(id, payload, token);
        return r;
      } catch (err: any) {
        setError(err.message || 'Error actualizando apelación');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const resolve = useCallback(
    async (id: number, actionPayload: any) => {
      setLoading(true);
      setError(null);
      try {
        const r = await svc.resolveApelacion(id, actionPayload, token);
        return r;
      } catch (err: any) {
        setError(err.message || 'Error resolviendo apelación');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return {
    data,
    meta,
    loading,
    error,
    list,
    get,
    create,
    update,
    resolve,
    setData,
  };
}
