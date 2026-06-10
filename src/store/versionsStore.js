import { useSyncExternalStore } from 'react';

// `exists` controls whether a version shows in the Email · Audience Versions grid.
// The RC Club version is created through the flow and only "exists" once published
// (screen 2 shows Default only; screen 12 shows both after Publish).
const initial = [
  {
    key: 'default',
    name: 'Default',
    persona: 'Default',
    status: 'Published',
    scheduledAt: null,
    lastEdited: 'Apr 18, 2026',
    variant: 'default',
    exists: true,
  },
  {
    key: 'rc-club',
    name: 'RC Club',
    persona: 'RC Club',
    status: 'Draft',
    scheduledAt: null,
    lastEdited: 'Apr 18, 2026',
    variant: 'rc-club',
    exists: false,
  },
];

let state = { versions: initial };
const listeners = new Set();

function notify() {
  for (const l of listeners) l();
}

export function getVersions() {
  return state.versions;
}

export function updateVersion(key, patch) {
  state = {
    versions: state.versions.map((v) => (v.key === key ? { ...v, ...patch } : v)),
  };
  notify();
}

// Publish a version: it now exists in the grid and is marked Published.
export function publishVersion(key) {
  updateVersion(key, { exists: true, status: 'Published', lastEdited: 'Apr 18, 2026' });
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useVersions() {
  return useSyncExternalStore(subscribe, getVersions, getVersions);
}
