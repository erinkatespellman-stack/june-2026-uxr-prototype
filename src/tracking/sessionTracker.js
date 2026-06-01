// Silent session tracker — in-memory only, no persistence.
// Researcher views via /report route.

const sessionData = {
  sessionId: `s_${Date.now().toString(36)}`,
  startedAt: Date.now(),
  timeline: [], // { type, page, label, meta, at }
  pageTimings: {}, // pageName -> totalSeconds
  pathChosen: null, // e.g. "rc-club"
  aiInteractions: [],
  surveyResponses: [],
  backtrackCount: 0,
};

let currentPage = null;
let currentPageEnteredAt = null;
let visitHistory = [];

function now() {
  return Date.now();
}

function record(entry) {
  sessionData.timeline.push({ ...entry, at: now() });
}

export function trackPageVisit(pageName) {
  // close out previous page timing
  if (currentPage && currentPageEnteredAt) {
    const seconds = (now() - currentPageEnteredAt) / 1000;
    sessionData.pageTimings[currentPage] =
      (sessionData.pageTimings[currentPage] || 0) + seconds;
  }

  // detect backtracking (returning to a previously visited page)
  if (visitHistory.includes(pageName) && visitHistory[visitHistory.length - 1] !== pageName) {
    sessionData.backtrackCount += 1;
    record({ type: 'backtrack', page: pageName, from: currentPage });
  }

  currentPage = pageName;
  currentPageEnteredAt = now();
  visitHistory.push(pageName);

  record({ type: 'page_visit', page: pageName });
}

export function trackClick(label, meta = {}) {
  record({ type: 'click', page: currentPage, label, meta });
}

export function trackPathChosen(pathName) {
  sessionData.pathChosen = pathName;
  record({ type: 'path_chosen', page: currentPage, label: pathName });
}

export function trackAIInteraction(action, meta = {}) {
  sessionData.aiInteractions.push({ action, meta, at: now() });
  record({ type: 'ai_interaction', page: currentPage, label: action, meta });
}

export function trackSurveyResponse(question, answer) {
  sessionData.surveyResponses.push({ question, answer, at: now() });
  record({ type: 'survey_response', page: currentPage, label: question, meta: { answer } });
}

export function getSessionData() {
  // Flush current page timing so the report shows live state.
  const snapshot = JSON.parse(JSON.stringify(sessionData));
  if (currentPage && currentPageEnteredAt) {
    const seconds = (now() - currentPageEnteredAt) / 1000;
    snapshot.pageTimings = {
      ...snapshot.pageTimings,
      [currentPage]: (snapshot.pageTimings[currentPage] || 0) + seconds,
    };
  }
  snapshot.durationSeconds = (now() - sessionData.startedAt) / 1000;
  return snapshot;
}

export function resetSession() {
  sessionData.sessionId = `s_${Date.now().toString(36)}`;
  sessionData.startedAt = Date.now();
  sessionData.timeline = [];
  sessionData.pageTimings = {};
  sessionData.pathChosen = null;
  sessionData.aiInteractions = [];
  sessionData.surveyResponses = [];
  sessionData.backtrackCount = 0;
  currentPage = null;
  currentPageEnteredAt = null;
  visitHistory = [];
}
