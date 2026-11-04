import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Formation } from '../types/playbook';
import { DEFAULT_FORMATIONS } from '../data/presets';
import { deleteFormation, fetchFormations, saveFormation, seedAllFormations } from '../services/playbookDb';
import { isFirebaseConfigured } from '../services/firebase';
import { loadStoredFormations, mergeFormationSources, saveStoredFormations } from '../utils/formationStorage';

/** Where a save or delete ended up. 'device' means the cloud did not take it, and why. */
export type StorageOutcome = { storedIn: 'cloud' } | { storedIn: 'device'; reason: string };

const withoutId = (list: Formation[], id: string) => list.filter(f => f.id !== id);
const replacedById = (list: Formation[], formation: Formation) => [...withoutId(list, formation.id), formation];
const reasonOf = (err: unknown) => (err instanceof Error ? err.message : 'Cloud request failed');

/**
 * The single owner of the formation list. Built-in templates, the cloud copies, and edits that only exist on
 * this device are merged into one list, and every save, delete, refresh and seed goes through here.
 */
export function useFormationLibrary() {
  const [remote, setRemote] = useState<Formation[]>([]);
  const [deviceOnly, setDeviceOnly] = useState<Formation[]>(() => loadStoredFormations());

  useEffect(() => {
    saveStoredFormations(deviceOnly);
  }, [deviceOnly]);

  const formations = useMemo(
    () => mergeFormationSources(DEFAULT_FORMATIONS, remote, deviceOnly),
    [remote, deviceOnly]
  );

  const refresh = useCallback(async () => {
    if (!isFirebaseConfigured) return;
    try {
      setRemote(await fetchFormations());
    } catch (err) {
      console.warn('Could not load formations from the cloud, using what this device has:', err);
    }
  }, []);

  const upsert = useCallback(async (formation: Formation): Promise<StorageOutcome> => {
    const stamped: Formation = { ...formation, updatedAt: new Date().toISOString() };
    try {
      if (!isFirebaseConfigured) throw new Error('Cloud storage is not configured');
      await saveFormation(stamped);
      setRemote(prev => replacedById(prev, stamped));
      setDeviceOnly(prev => withoutId(prev, stamped.id));
      return { storedIn: 'cloud' };
    } catch (err) {
      setDeviceOnly(prev => replacedById(prev, stamped));
      return { storedIn: 'device', reason: reasonOf(err) };
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<StorageOutcome> => {
    setRemote(prev => withoutId(prev, id));
    setDeviceOnly(prev => withoutId(prev, id));
    try {
      if (!isFirebaseConfigured) throw new Error('Cloud storage is not configured');
      await deleteFormation(id);
      return { storedIn: 'cloud' };
    } catch (err) {
      return { storedIn: 'device', reason: reasonOf(err) };
    }
  }, []);

  /** Pushes the built-in templates to the cloud and reloads. Throws if the cloud refuses. */
  const seedDefaults = useCallback(async (): Promise<number> => {
    const { count } = await seedAllFormations(DEFAULT_FORMATIONS);
    await refresh();
    return count;
  }, [refresh]);

  return { formations, refresh, upsert, remove, seedDefaults };
}
