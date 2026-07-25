import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, isCloudConfigured } from '../lib/supabaseClient.js';

/**
 * Generic CRUD + realtime hook for one Supabase table, with automatic
 * fallback to localStorage if Supabase isn't configured or a request fails.
 *
 * mapFromDb / mapToDb let a specific table (e.g. installments) translate
 * between the app's camelCase shape and the DB's snake_case columns.
 */
export function useSupabaseTable(tableName, seedRows, options = {}) {
  const { mapFromDb = (r) => r, mapToDb = (r) => r, localKey } = options;
  const storageKey = localKey || `damietta_${tableName}_v1`;

  const [items, setItemsState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cloudMode, setCloudMode] = useState(false);
  const channelRef = useRef(null);
  const cloudModeRef = useRef(false);

  const loadLocal = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(seedRows));
    } catch {
      return JSON.parse(JSON.stringify(seedRows));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const saveLocal = useCallback(
    (rows) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(rows));
      } catch {
        /* storage full / unavailable — ignore, matches original behaviour */
      }
    },
    [storageKey]
  );

  const fetchCloud = useCallback(async () => {
    const { data, error } = await supabase.from(tableName).select('*').order('created_at');
    if (error) throw error;
    return (data || []).map(mapFromDb);
  }, [tableName, mapFromDb]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      if (isCloudConfigured) {
        try {
          let rows = await fetchCloud();
          if (rows.length === 0) {
            await supabase.from(tableName).insert(seedRows.map(mapToDb));
            rows = await fetchCloud();
          }
          if (cancelled) return;
          setItemsState(rows);
          setCloudMode(true);
          cloudModeRef.current = true;

          const channel = supabase
            .channel(`${tableName}-changes`)
            .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, async () => {
              try {
                const fresh = await fetchCloud();
                if (!cancelled) setItemsState(fresh);
              } catch {
                /* ignore transient realtime refetch errors */
              }
            })
            .subscribe();
          channelRef.current = channel;
        } catch (e) {
          console.error(e);
          if (!cancelled) {
            setItemsState(loadLocal());
            setCloudMode(false);
            cloudModeRef.current = false;
          }
        }
      } else {
        setItemsState(loadLocal());
        setCloudMode(false);
        cloudModeRef.current = false;
      }
      if (!cancelled) setLoading(false);
    }

    init();
    return () => {
      cancelled = true;
      if (channelRef.current) supabase?.removeChannel(channelRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName]);

  const persistLocalIfNeeded = useCallback(
    (rows) => {
      if (!cloudModeRef.current) saveLocal(rows);
    },
    [saveLocal]
  );

  const insertItem = useCallback(
    async (row) => {
      if (cloudModeRef.current) {
        const { error } = await supabase.from(tableName).insert(mapToDb(row));
        if (error) return { error };
      }
      setItemsState((prev) => {
        const next = [...prev, row];
        persistLocalIfNeeded(next);
        return next;
      });
      return { error: null };
    },
    [tableName, mapToDb, persistLocalIfNeeded]
  );

  const updateItem = useCallback(
    async (id, patch, dbPatch) => {
      if (cloudModeRef.current) {
        const { error } = await supabase.from(tableName).update(dbPatch || patch).eq('id', id);
        if (error) return { error };
      }
      setItemsState((prev) => {
        const next = prev.map((it) => (it.id === id ? { ...it, ...patch } : it));
        persistLocalIfNeeded(next);
        return next;
      });
      return { error: null };
    },
    [tableName, persistLocalIfNeeded]
  );

  const removeItem = useCallback(
    async (id) => {
      if (cloudModeRef.current) {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) return { error };
      }
      setItemsState((prev) => {
        const next = prev.filter((it) => it.id !== id);
        persistLocalIfNeeded(next);
        return next;
      });
      return { error: null };
    },
    [tableName, persistLocalIfNeeded]
  );

  // Used for import/export — replaces the whole collection at once.
  // (Cloud writes for bulk import aren't attempted, matching the original
  // app which only persisted imports to localStorage.)
  const replaceAll = useCallback(
    (rows) => {
      setItemsState(rows);
      persistLocalIfNeeded(rows);
    },
    [persistLocalIfNeeded]
  );

  return {
    items,
    setItems: replaceAll,
    loading,
    cloudMode,
    insertItem,
    updateItem,
    removeItem,
  };
}
