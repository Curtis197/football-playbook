import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  type DocumentData,
  type QuerySnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import type { Play, Formation, PlayCategory } from '../types/playbook';
import { INITIAL_PLAYBOOK, DEFAULT_FORMATIONS } from '../data/presets';
import { normalizePlay } from '../utils/playValidation';

const PLAYS_COLLECTION = 'plays';
const FORMATIONS_COLLECTION = 'formations';

/**
 * Remove undefined values to prevent Firestore serialization errors
 */
function sanitizeForFirestore<T>(obj: T): Record<string, unknown> {
  return JSON.parse(JSON.stringify(obj));
}

// ==========================================
// 1. FORMATION TEMPLATES OPERATIONS
// ==========================================

/**
 * Upsert a formation template in Firestore
 */
export async function saveFormation(formation: Formation): Promise<void> {
  try {
    const formationRef = doc(db, FORMATIONS_COLLECTION, formation.id);
    const sanitized = sanitizeForFirestore({
      ...formation,
      updatedAt: new Date().toISOString()
    });
    await setDoc(formationRef, sanitized, { merge: true });
  } catch (error) {
    console.error(`[playbookDb] Error saving formation "${formation.id}":`, error);
    throw error;
  }
}

/**
 * Fetch all base formation templates
 */
export async function fetchFormations(): Promise<Formation[]> {
  try {
    const formationsRef = collection(db, FORMATIONS_COLLECTION);
    const snapshot = await getDocs(formationsRef);
    if (snapshot.empty) {
      return [];
    }
    const formations: Formation[] = [];
    snapshot.forEach(docSnap => {
      formations.push(docSnap.data() as Formation);
    });
    return formations;
  } catch (error) {
    console.error('[playbookDb] Error fetching formations:', error);
    throw error;
  }
}

/**
 * Delete a formation template
 */
export async function deleteFormation(id: string): Promise<void> {
  try {
    const formationRef = doc(db, FORMATIONS_COLLECTION, id);
    await deleteDoc(formationRef);
  } catch (error) {
    console.error(`[playbookDb] Error deleting formation "${id}":`, error);
    throw error;
  }
}

// ==========================================
// 2. PLAYS COLLECTION OPERATIONS
// ==========================================

/**
 * Upsert a play in Firestore
 */
export async function savePlay(play: Play): Promise<void> {
  try {
    const playRef = doc(db, PLAYS_COLLECTION, play.id);
    const sanitized = sanitizeForFirestore({
      ...play,
      updatedAt: new Date().toISOString()
    });
    await setDoc(playRef, sanitized, { merge: true });
  } catch (error) {
    console.error(`[playbookDb] Error saving play "${play.id}":`, error);
    throw error;
  }
}

/**
 * Fetch a single play by ID
 */
export async function fetchPlay(id: string): Promise<Play | null> {
  try {
    const playRef = doc(db, PLAYS_COLLECTION, id);
    const docSnap = await getDoc(playRef);
    if (!docSnap.exists()) {
      return null;
    }
    return readPlay(docSnap.data(), id);
  } catch (error) {
    console.error(`[playbookDb] Error fetching play "${id}":`, error);
    throw error;
  }
}

/**
 * Cloud documents are untrusted input: validate and fill defaults, or skip the document.
 */
function readPlay(data: DocumentData, id: string): Play | null {
  const result = normalizePlay(data);
  if (!result.ok) {
    console.warn(`[playbookDb] Skipping unreadable play "${id}": ${result.error}`);
    return null;
  }
  return result.value;
}

/**
 * Helper to map QuerySnapshot to Play array
 */
function mapPlaysSnapshot(snapshot: QuerySnapshot<DocumentData>): Play[] {
  const plays: Play[] = [];
  snapshot.forEach(docSnap => {
    const play = readPlay(docSnap.data(), docSnap.id);
    if (play) plays.push(play);
  });
  return plays;
}

/**
 * Fetch all plays from Firestore
 */
export async function fetchAllPlays(): Promise<Play[]> {
  try {
    const playsRef = collection(db, PLAYS_COLLECTION);
    const snapshot = await getDocs(playsRef);
    return mapPlaysSnapshot(snapshot);
  } catch (error) {
    console.error('[playbookDb] Error fetching all plays:', error);
    throw error;
  }
}

/**
 * Fetch plays filtered by category (e.g. 'run', 'pass_action', 'rpo', 'screen', 'blitz_pickup')
 */
export async function fetchPlaysByCategory(category: PlayCategory): Promise<Play[]> {
  try {
    const playsRef = collection(db, PLAYS_COLLECTION);
    const q = query(playsRef, where('category', '==', category));
    const snapshot = await getDocs(q);
    return mapPlaysSnapshot(snapshot);
  } catch (error) {
    console.error(`[playbookDb] Error fetching plays by category "${category}":`, error);
    throw error;
  }
}

/**
 * Fetch plays filtered by strategy tag (e.g. '3-5-counter', 'zone-read', 'rpo')
 */
export async function fetchPlaysByTag(tag: string): Promise<Play[]> {
  try {
    const playsRef = collection(db, PLAYS_COLLECTION);
    const q = query(playsRef, where('tags', 'array-contains', tag));
    const snapshot = await getDocs(q);
    return mapPlaysSnapshot(snapshot);
  } catch (error) {
    console.error(`[playbookDb] Error fetching plays by tag "${tag}":`, error);
    throw error;
  }
}

/**
 * Delete a play by ID
 */
export async function deletePlay(id: string): Promise<void> {
  try {
    const playRef = doc(db, PLAYS_COLLECTION, id);
    await deleteDoc(playRef);
  } catch (error) {
    console.error(`[playbookDb] Error deleting play "${id}":`, error);
    throw error;
  }
}

// ==========================================
// 3. FALLBACK & SEEDING UTILITY
// ==========================================

/**
 * Seed or update all mapped formation templates in Firestore
 */
export async function seedAllFormations(formationsList?: Formation[]): Promise<{ count: number }> {
  try {
    const list = formationsList && formationsList.length > 0 ? formationsList : DEFAULT_FORMATIONS;
    for (const formation of list) {
      await saveFormation(formation);
    }
    return { count: list.length };
  } catch (error) {
    console.error('[playbookDb] Error syncing formations to Firestore:', error);
    throw error;
  }
}

/**
 * Seed Firestore with default preset plays and base formations
 */
export async function seedDefaultPresets(): Promise<{ playsCount: number; formationsCount: number }> {
  try {
    const presetPlays = INITIAL_PLAYBOOK.plays;
    for (const play of presetPlays) {
      await savePlay(play);
    }

    const { count } = await seedAllFormations(DEFAULT_FORMATIONS);

    return {
      playsCount: presetPlays.length,
      formationsCount: count
    };
  } catch (error) {
    console.error('[playbookDb] Error seeding default presets:', error);
    throw error;
  }
}
