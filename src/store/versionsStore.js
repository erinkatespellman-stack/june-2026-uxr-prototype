import { useSyncExternalStore } from 'react';

const initial = [
  {
    key: 'default',
    name: 'Default',
    persona: 'Default',
    status: 'Published',
    scheduledAt: null,
    lastEdited: 'Apr 18, 2026',
    variant: 'default',
  },
  {
    key: 'rc-club',
    name: 'RC Club',
    persona: 'RC Club',
    status: 'Published',
    scheduledAt: null,
    lastEdited: 'May 14, 2026',
    variant: 'rc-club',
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

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useVersions() {
  return useSyncExternalStore(subscribe, getVersions, getVersions);
}
