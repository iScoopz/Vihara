import { useCallback, useEffect, useRef, useState } from 'react';

import { friendlyDataError } from '@/lib/errors';

export type AsyncState<T> = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  data: T | null;
  error: string | null;
  refreshing: boolean;
  reload: () => Promise<void>;
  /** Replace the data locally, e.g. for optimistic updates. */
  setData: (update: (prev: T | null) => T | null) => void;
};

/** Loads once when `key` changes (null key = do nothing), with pull-to-refresh support. */
export function useAsync<T>(key: string | null, loader: () => Promise<T>): AsyncState<T> {
  const [status, setStatus] = useState<AsyncState<T>['status']>(key ? 'loading' : 'idle');
  const [data, setDataState] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const loaderRef = useRef(loader);
  const runId = useRef(0);

  // Declared before the loading effect so the latest loader is in place when it runs.
  useEffect(() => {
    loaderRef.current = loader;
  });

  const run = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!key) return;
      const id = ++runId.current;
      if (mode === 'refresh') setRefreshing(true);
      else {
        setStatus('loading');
        setDataState(null);
      }
      try {
        const result = await loaderRef.current();
        if (id !== runId.current) return;
        setDataState(result);
        setError(null);
        setStatus('ready');
      } catch (e) {
        if (id !== runId.current) return;
        setError(friendlyDataError(e as { message?: string }));
        setStatus((s) => (mode === 'refresh' && s === 'ready' ? 'ready' : 'error'));
      } finally {
        if (id === runId.current) setRefreshing(false);
      }
    },
    [key],
  );

  useEffect(() => {
    if (key) run('initial');
    else setStatus('idle');
  }, [key, run]);

  const reload = useCallback(() => run('refresh'), [run]);
  const setData = useCallback((update: (prev: T | null) => T | null) => setDataState(update), []);

  return { status, data, error, refreshing, reload, setData };
}
