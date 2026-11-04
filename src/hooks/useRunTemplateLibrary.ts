import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RunTemplate } from '../types/playbook';
import { BUILT_IN_RUN_TEMPLATES } from '../data/runConcepts';
import { deleteRunTemplate, fetchRunTemplates, saveRunTemplate } from '../services/playbookDb';
import { isFirebaseConfigured } from '../services/firebase';
import { loadStoredRunTemplates, mergeRunTemplateSources, saveStoredRunTemplates } from '../utils/runTemplateStorage';
import type { StorageOutcome } from './useFormationLibrary';

const withoutId = (list: RunTemplate[], id: string) => list.filter(t => t.id !== id);
const replacedById = (list: RunTemplate[], template: RunTemplate) => [...withoutId(list, template.id), template];
const reasonOf = (err: unknown) => (err instanceof Error ? err.message : 'Cloud request failed');

/**
 * The single owner of the run template list: built-ins, the cloud copies, and templates that only exist
 * on this device are merged into one list. Mirrors useFormationLibrary.
 */
export function useRunTemplateLibrary() {
  const [remote, setRemote] = useState<RunTemplate[]>([]);
  const [deviceOnly, setDeviceOnly] = useState<RunTemplate[]>(() => loadStoredRunTemplates());

  useEffect(() => {
    saveStoredRunTemplates(deviceOnly);
  }, [deviceOnly]);

  const templates = useMemo(
    () => mergeRunTemplateSources(BUILT_IN_RUN_TEMPLATES, remote, deviceOnly),
    [remote, deviceOnly]
  );

  const refresh = useCallback(async () => {
    if (!isFirebaseConfigured) return;
    try {
      setRemote(await fetchRunTemplates());
    } catch (err) {
      console.warn('Could not load run templates from the cloud, using what this device has:', err);
    }
  }, []);

  const upsert = useCallback(async (template: RunTemplate): Promise<StorageOutcome> => {
    const stamped: RunTemplate = { ...template, updatedAt: new Date().toISOString() };
    try {
      if (!isFirebaseConfigured) throw new Error('Cloud storage is not configured');
      await saveRunTemplate(stamped);
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
      await deleteRunTemplate(id);
      return { storedIn: 'cloud' };
    } catch (err) {
      return { storedIn: 'device', reason: reasonOf(err) };
    }
  }, []);

  return { templates, refresh, upsert, remove };
}
