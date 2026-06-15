import { useSyncExternalStore } from 'react';

// Captured "control dial" answers (research plan §5). One record per participant
// per AI moment ("amenities" or "versions"), holding where they'd SET the dial,
// where it feels TODAY, and their reason. Records arrive from either capture mode
// (the moderator's console, or the unmoderated participant slider) and feed the
// Study Summary's "Control dial" section. Persisted to localStorage.

const STORAGE_KEY = 'uxr_dial';

export const MOMENTS = [
  { key: 'amenities', label: 'Amenities' },
  { key: 'versions', label: 'Email versions' },
];

export const DIAL_POSITIONS = [
  { key: 'less', label: 'Less AI' },
  { key: 'just-right', label: 'Just right' },
  { key: 'more', label: 'More AI' },
];

export function momentLabel(key) {
  return (MOMENTS.find((m) => m.key === key) || {}).label || key;
}

export function positionLabel(key) {
  return (DIAL_POSITIONS.find((p) => p.key === key) || {}).label || key;
}

const listeners = new Set();
function notify() {
  for (const l of listeners) l();
}

function load() {
  try {
    if (typeof localStorage === 'undefined') return [];
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function save(list) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable — ignore */
  }
}

// useSyncExternalStore needs a stable snapshot reference between notifications,
// so we cache the parsed array and only replace it when we write.
let cache = load();

export function getDialResponses() {
  return cache;
}

// Add (or replace) a participant's answer for one AI moment. Keyed by
// participant + moment so re-capturing the same participant updates in place.
export function addDialResponse(resp) {
  const id = resp.id || `d_${Date.now().toString(36)}_${cache.length}`;
  const record = {
    id,
    participant: resp.participant || null,
    sessionId: resp.sessionId || null,
    moment: resp.moment,
    desired: resp.desired || null,
    current: resp.current || null,
    why: resp.why || '',
    mode: resp.mode || 'moderated',
    at: Date.now(),
  };
  const sameKey = (r) =>
    r.participant && record.participant && r.participant === record.participant && r.moment === record.moment;
  cache = [...cache.filter((r) => !sameKey(r)), record];
  save(cache);
  notify();
  return record;
}

export function clearDialResponses() {
  cache = [];
  save(cache);
  notify();
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useDialResponses() {
  return useSyncExternalStore(subscribe, getDialResponses, getDialResponses);
}
