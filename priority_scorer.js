/**
 * priority_scorer.js
 * -----------------------------------------------------------------------------
 * DETERMINISTIC priority scoring + team routing for the
 * "Customer Support Ticket Triage & Routing Agent" n8n workflow.
 *
 * This is the human-readable reference copy of the logic that runs inside the
 * n8n "Priority Scorer" Code node. It is intentionally pure (no AI, no network)
 * so the routing/escalation decisions are 100% repeatable and auditable.
 *
 * In n8n the Code node reads the AI outputs and the form, then returns ONE
 * consolidated ticket record. Here we expose the same logic as plain functions
 * plus a runnable demo:  `node priority_scorer.js`
 * -----------------------------------------------------------------------------
 */

// --- Tunable rules ----------------------------------------------------------

// How much each ticket category contributes to the base score.
// Billing & Technical are weighted higher because they map to money / outages.
const CATEGORY_WEIGHT = { Billing: 30, Technical: 30, Account: 20, General: 10 };

// Sentiment boost: an angry customer is more urgent than a happy one.
const SENTIMENT_BOOST = { negative: 25, neutral: 5, positive: 0 };

// Words that signal urgency in the raw message. Each distinct hit adds points.
const URGENCY_KEYWORDS = [
  'urgent', 'asap', 'immediately', 'down', 'outage', 'broken',
  'refund', 'cancel', 'charged', 'unauthorized', 'not working',
  "can't log", 'cannot log', 'error', 'failed', 'escalate',
];

const POINTS_PER_URGENCY_HIT = 8; // each keyword match
const URGENCY_CAP = 40;           // urgency can never dominate the whole score

// Allowed enums (used to defensively normalise possibly-bad AI output).
const ALLOWED_CATEGORIES = ['Billing', 'Technical', 'Account', 'General'];
const ALLOWED_SENTIMENT = ['positive', 'neutral', 'negative'];

// Category -> team routing. Single source of truth for "who handles this".
const TEAM_MAP = {
  Billing:   { team_label: 'Billing Team',  team_email: 'billing@company.example' },
  Technical: { team_label: 'Tech Team',     team_email: 'tech@company.example' },
  Account:   { team_label: 'Account Team',  team_email: 'accounts@company.example' },
  General:   { team_label: 'General Queue', team_email: 'support@company.example' },
};

// --- Helpers ----------------------------------------------------------------

/** Snap a possibly-messy AI category to one of the allowed values. */
function normaliseCategory(raw) {
  const value = String(raw || 'General').trim();
  return (
    ALLOWED_CATEGORIES.find((c) => c.toLowerCase() === value.toLowerCase()) ||
    'General'
  );
}

/** Snap a possibly-messy AI sentiment to one of the allowed values. */
function normaliseSentiment(raw) {
  const value = String(raw || 'neutral').trim().toLowerCase();
  return ALLOWED_SENTIMENT.includes(value) ? value : 'neutral';
}

/** Count how many distinct urgency keywords appear in the text. */
function countUrgencyHits(text) {
  const haystack = String(text || '').toLowerCase();
  let hits = 0;
  for (const kw of URGENCY_KEYWORDS) {
    if (haystack.includes(kw)) hits += 1;
  }
  return hits;
}

/** Map a 0-100 score to a level. High >= 70, Medium 40-69, Low < 40. */
function levelFromScore(score) {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

// --- Core API ---------------------------------------------------------------

/**
 * Compute the priority score and level for a ticket.
 * @param {Object} input
 * @param {string} input.category  - AI category (Billing|Technical|Account|General)
 * @param {string} input.sentiment - AI sentiment (positive|neutral|negative)
 * @param {string} input.message   - raw customer message
 * @param {string[]} [input.issue_keywords] - keywords from the Extractor
 * @returns {{ priority_score:number, priority_level:string, urgency_hits:number,
 *            category:string, sentiment:string }}
 */
function computePriority({ category, sentiment, message, issue_keywords = [] }) {
  const cat = normaliseCategory(category);
  const sent = normaliseSentiment(sentiment);

  const scanText = `${message || ''} ${(issue_keywords || []).join(' ')}`;
  const urgencyHits = countUrgencyHits(scanText);
  const urgencyScore = Math.min(urgencyHits * POINTS_PER_URGENCY_HIT, URGENCY_CAP);

  let score = (CATEGORY_WEIGHT[cat] || 10) + (SENTIMENT_BOOST[sent] || 0) + urgencyScore;
  score = Math.max(0, Math.min(100, score)); // clamp to 0-100

  return {
    category: cat,
    sentiment: sent,
    urgency_hits: urgencyHits,
    priority_score: score,
    priority_level: levelFromScore(score),
  };
}

/** Look up the team for a (normalised) category. */
function routeTeam(category) {
  return TEAM_MAP[normaliseCategory(category)];
}

/** True when a ticket needs a human review before auto-reply. */
function needsHumanReview({ priority_level, sentiment }) {
  return priority_level === 'High' || sentiment === 'negative';
}

// --- Exports + runnable demo ------------------------------------------------

module.exports = {
  computePriority,
  routeTeam,
  needsHumanReview,
  CATEGORY_WEIGHT,
  SENTIMENT_BOOST,
  URGENCY_KEYWORDS,
};

if (require.main === module) {
  const demo = {
    category: 'Billing',
    sentiment: 'negative',
    message:
      'I was charged twice for my subscription this month and I need a refund urgently. This is unacceptable, please fix this ASAP.',
    issue_keywords: ['double charge', 'refund', 'subscription'],
  };

  const scored = computePriority(demo);
  const team = routeTeam(scored.category);

  console.log('Input   :', demo.message);
  console.log('Scored  :', scored);
  console.log('Team    :', team);
  console.log('Escalate:', needsHumanReview(scored));
}
