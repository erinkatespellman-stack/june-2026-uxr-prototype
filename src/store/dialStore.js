import { useSyncExternalStore } from 'react';

// Captured "control dial" answers (research plan §5). One record per participant
// per AI moment ("amenities" or "versions"), holding where they'd SET the dial,
// where it feels TODAY, and their reason. Records arrive from either capture mode
// (the moderator's console, or the unmoderated participant slider) and feed the
// Study Summary's "Control dial" section. Persisted to localStorage.

const STORAGE_KEY = 'uxr_dial';
const FOLLOWUP_KEY = 'uxr_followups';

export const MOMENTS = [
  { key: 'amenities', label: 'Amenities' },
  { key: 'versions', label: 'Email versions' },
];

export const DIAL_POSITIONS = [
  { key: 'less', label: 'Less AI' },
  { key: 'just-right', label: 'Just right' },
  { key: 'more', label: 'More AI' },
];

// What's driving the preference (research plan §2). Multi-select tags so the
// report can aggregate ("6 of 8 cited brand risk").
export const DRIVERS = [
  { key: 'trust', label: 'Trust' },
  { key: 'brand', label: 'Brand risk' },
  { key: 'time', label: 'Time saved' },
  { key: 'accountability', label: 'Accountability' },
  { key: 'personal', label: 'Personal touch' },
];

// What kind of user the participant is (research plan §3 segments), captured
// alongside their name so findings can be read by user type.
export const ROLES = [
  { key: 'creator', label: 'Creator', hint: 'Builds these emails' },
  { key: 'approver', label: 'Approver', hint: 'Reviews / signs off' },
  { key: 'other', label: 'Other', hint: '' },
];

export function roleLabel(key) {
  return (ROLES.find((r) => r.key === key) || {}).label || key;
}

// Pillar 1 — "is versioning worth it?" Asked once per participant, AI aside.
export const WOULD_USE = [
  { key: 'yes', label: 'Yes' },
  { key: 'maybe', label: 'Maybe' },
  { key: 'no', label: 'No' },
];

export const FREQUENCY = [
  { key: 'every-campaign', label: 'Every campaign' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'few-times', label: 'A few times a year' },
  { key: 'rarely', label: 'Rarely' },
];

export const EFFORT_WORTH = [
  { key: 'worth', label: 'Worth it' },
  { key: 'depends', label: 'Depends' },
  { key: 'not-worth', label: 'Not worth it' },
];

export function optionLabel(list, key) {
  return (list.find((o) => o.key === key) || {}).label || key;
}

// The §5 follow-ups, asked once per participant. Free text.
export const FOLLOWUP_QUESTIONS = [
  { key: 'gate', label: 'Which step would they stop and double-check the AI?', placeholder: 'Where they want a human sign-off…' },
  { key: 'trustUnlock', label: 'What would it take to let AI do more?', placeholder: 'Trust-builders to invest in…' },
  { key: 'worstCase', label: "Worst case if it gets it wrong?", placeholder: 'The brand risk at stake…' },
  { key: 'timeSaved', label: 'How much time would the right balance save?', placeholder: 'e.g. an hour per version…' },
];

export function momentLabel(key) {
  return (MOMENTS.find((m) => m.key === key) || {}).label || key;
}

export function driverLabel(key) {
  return (DRIVERS.find((d) => d.key === key) || {}).label || key;
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
    /* storage unavailable: ignore */
  }
}

// useSyncExternalStore needs a stable snapshot reference between notifications,
// so we cache the parsed array and only replace it when we write.
let cache = load();

function loadFollowups() {
  try {
    if (typeof localStorage === 'undefined') return [];
    return JSON.parse(localStorage.getItem(FOLLOWUP_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveFollowupList(list) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(FOLLOWUP_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

let followCache = loadFollowups();

export function getDialResponses() {
  return cache;
}

export function getFollowups() {
  return followCache;
}

export function getFollowup(participant) {
  return followCache.find((f) => f.participant === participant) || null;
}

// Upsert a participant's follow-up answers (drivers + the §5 free-text fields).
export function saveFollowup(participant, data) {
  if (!participant) return null;
  const record = {
    participant,
    role: null,
    drivers: [],
    gate: '', trustUnlock: '', worstCase: '', timeSaved: '',
    wouldUse: null, frequency: null, effortWorth: null, versioningWhy: '',
    ...data,
    at: Date.now(),
  };
  followCache = [...followCache.filter((f) => f.participant !== participant), record];
  saveFollowupList(followCache);
  notify();
  return record;
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
  followCache = [];
  save(cache);
  saveFollowupList(followCache);
  notify();
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useDialResponses() {
  return useSyncExternalStore(subscribe, getDialResponses, getDialResponses);
}

export function useFollowups() {
  return useSyncExternalStore(subscribe, getFollowups, getFollowups);
}
