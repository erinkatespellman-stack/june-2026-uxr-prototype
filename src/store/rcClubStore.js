import { useSyncExternalStore } from 'react';
import { DEFAULT_CONTENT, RC_CLUB_CONTENT } from '../content/emailContent';
import { getAddedAmenitiesForEmail } from './amenityStore';

function freshState() {
  // `suggested` snapshots the AI copy so a section can always be reverted to it,
  // and so `edited` can be derived by comparing the live content against it.
  return {
    sections: {
      hero: { status: 'pending', content: RC_CLUB_CONTENT.hero, suggested: RC_CLUB_CONTENT.hero },
      body: { status: 'pending', content: RC_CLUB_CONTENT.body, suggested: RC_CLUB_CONTENT.body },
      amenities: { status: 'pending', content: RC_CLUB_CONTENT.amenities, suggested: RC_CLUB_CONTENT.amenities },
    },
    editingKey: null,
  };
}

let state = freshState();
const listeners = new Set();

function notify() {
  for (const l of listeners) l();
}

export function getRCClubState() {
  return state;
}

function setSection(key, patch) {
  state = {
    ...state,
    sections: {
      ...state.sections,
      [key]: { ...state.sections[key], ...patch },
    },
  };
}

export function acceptSection(key) {
  setSection(key, { status: 'accepted' });
  if (state.editingKey === key) state = { ...state, editingKey: null };
  notify();
}

// Click-on-section toggle: pending → accepted, accepted → pending.
// Used by the new static-icon UI in EmailPreview. Rejected/editing are no-ops.
export function toggleAcceptSection(key) {
  const current = state.sections[key]?.status;
  if (current === 'pending') {
    setSection(key, { status: 'accepted' });
    notify();
  } else if (current === 'accepted') {
    setSection(key, { status: 'pending' });
    notify();
  }
}

export function rejectSection(key) {
  // Reverting to the default copy is no longer an override.
  setSection(key, { status: 'rejected', content: DEFAULT_CONTENT[key], edited: false });
  if (state.editingKey === key) state = { ...state, editingKey: null };
  notify();
}

export function startEditingSection(key) {
  // If another section was already in editing state, drop it back to pending —
  // only one section can be the active editor at a time.
  if (state.editingKey && state.editingKey !== key) {
    setSection(state.editingKey, { status: 'pending' });
  }
  setSection(key, { status: 'editing' });
  state = { ...state, editingKey: key };
  notify();
}

export function finishEditingSection(key) {
  setSection(key, { status: 'accepted' });
  state = { ...state, editingKey: null };
  notify();
}

export function cancelEditing() {
  // Bring section back to pending without altering content.
  if (state.editingKey) {
    setSection(state.editingKey, { status: 'pending' });
  }
  state = { ...state, editingKey: null };
  notify();
}

export function setSectionContent(key, content) {
  // Derive `edited` by comparing against the AI suggestion, so reverting to the
  // suggested content (e.g. re-picking the hero TOP PICK) clears the blue
  // "Edited" treatment automatically, and any real change sets it.
  const suggested = state.sections[key]?.suggested;
  const edited = JSON.stringify(content) !== JSON.stringify(suggested);
  setSection(key, { content, edited });
  notify();
}

// Revert a section to its AI-suggested copy (keeps the edit panel open if active).
export function resetSection(key) {
  const suggested = state.sections[key]?.suggested;
  setSection(key, { content: suggested, edited: false });
  notify();
}

export function resetRCClubState() {
  state = freshState();
  notify();
}

// Generate a fresh RC Club version, sourcing the amenities section from the
// amenities the user actually added in the discovery flow. Falls back to the
// default RC Club amenities when none were added.
export function generateRCClubVersion() {
  state = freshState();
  const items = getAddedAmenitiesForEmail();
  if (items.length > 0) {
    state = {
      ...state,
      sections: {
        ...state.sections,
        amenities: {
          status: 'pending',
          content: { title: 'Curate an Extraordinary Stay', items },
          suggested: { title: 'Curate an Extraordinary Stay', items },
        },
      },
    };
  }
  notify();
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useRCClubState() {
  return useSyncExternalStore(subscribe, getRCClubState, getRCClubState);
}
