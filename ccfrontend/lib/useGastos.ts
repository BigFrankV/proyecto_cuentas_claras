import { useEffect, useState } from 'react';
import { listGastos } from './gastosService';
import { GastoBackend } from '@/types/gastos';

let sharedData: { timestamp: number; items: GastoBackend[] } | null = null;
let subscribers: ((items: GastoBackend[] | null) => void)[] = [];

export function useGastosShared(comunidadId?: number | null, opts: { ttlMs?: number } = {}) {
  const [data, setData] = useState<GastoBackend[] | null>(() => sharedData?.items ?? null);
  const ttl = opts.ttlMs ?? 30_000;

  useEffect(() => {
    let mounted = true;
    const notify = (items: GastoBackend[] | null) => {
      subscribers.forEach(s => s(items));
    };

    const sub = (items: GastoBackend[] | null) => {
      if (mounted) setData(items);
    };
    subscribers.push(sub);

    async function ensureLoad() {
      try {
        // usar cache compartida si no expiró
        if (sharedData && Date.now() - sharedData.timestamp < ttl) {
          setData(sharedData.items);
          return;
        }
        // ahora soportamos comunidadId undefined/null -> endpoint global (superadmin)
        const resp = await listGastos(typeof comunidadId === 'number' ? comunidadId : undefined, { limit: 100, offset: 0 });
        const items = resp.data || [];
        sharedData = { timestamp: Date.now(), items };
        notify(items);
      } catch (err) {
        console.error('useGastosShared error', err);
        sharedData = { timestamp: Date.now(), items: [] };
        notify([]);
      }
    }

    ensureLoad();

    return () => {
      mounted = false;
      subscribers = subscribers.filter(s => s !== sub);
    };
  }, [comunidadId, ttl]);

  return { data, loading: data === null };
}