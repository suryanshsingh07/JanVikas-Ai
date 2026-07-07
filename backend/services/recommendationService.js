/**
 * JanVikas AI — Recommendation Engine
 * Ranks development submissions using a 6-factor weighted algorithm to create actionable project recommendations.
 *
 * FACTORS:
 * 1. Urgency (30%) - Keywords like 'urgent', 'critical', 'flood'.
 * 2. Citizen Votes (25%) - Direct upvotes on a submission.
 * 3. Severity (20%) - Inferred from negative sentiment and keywords.
 * 4. Geographic Impact (15%) - Number of submissions in the same area.
 * 5. Category Weight (10%) - Critical infrastructure like water/health gets higher weight.
 */

const WEIGHTS = {
  urgency: 0.30,
  votes: 0.25,
  severity: 0.20,
  geoImpact: 0.15,
  category: 0.10,
};

/**
 * Normalize a value to 0-100 range
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const normalize = (value, min, max) => {
  if (max === min) return 50;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
};

/**
 * Score urgency based on keywords and submission priority
 * @param {Object} submission - The submission document
 * @returns {Object} Score and explanation
 */
const scoreUrgency = (submission) => {
  const urgencyLevel = submission.aiAnalysis?.urgencyLevel || 2; // Default 2/5
  const score = normalize(urgencyLevel, 1, 5) * 100;
  return {
    score,
    weight: WEIGHTS.urgency,
    explanation: `Urgency level ${urgencyLevel}/5 detected, indicating ${score > 70 ? 'critical' : 'moderate'} need.`,
  };
};

/**
 * Score based on citizen upvotes
 * @param {Object} submission
 * @param {number} maxVotes - Max votes in the current dataset for normalization
 * @returns {Object} Score and explanation
 */
const scoreVotes = (submission, maxVotes) => {
  const votes = submission.votes || 0;
  const score = normalize(votes, 0, maxVotes) * 100;
  return {
    score,
    weight: WEIGHTS.votes,
    explanation: `${votes} citizen upvotes show ${score > 60 ? 'strong' : 'some'} community demand.`,
  };
};

/**
 * Score severity based on sentiment analysis
 * @param {Object} submission
 * @returns {Object} Score and explanation
 */
const scoreSeverity = (submission) => {
  const sentimentScore = submission.aiAnalysis?.sentimentScore || 0; // -1 to 1
  // Convert sentiment (-1 to 0) to a severity score (0 to 100)
  const score = sentimentScore < 0 ? Math.abs(sentimentScore) * 100 : 0;
  return {
    score,
    weight: WEIGHTS.severity,
    explanation: `Negative sentiment (${(sentimentScore).toFixed(2)}) suggests a ${score > 60 ? 'high' : 'moderate'} severity problem.`,
  };
};

/**
 * Score based on number of related submissions in the same area
 * @param {number} relatedCount
 * @param {number} maxRelated
 * @returns {Object} Score and explanation
 */
const scoreGeoImpact = (relatedCount, maxRelated) => {
  const score = normalize(relatedCount, 0, maxRelated) * 100;
  return {
    score,
    weight: WEIGHTS.geoImpact,
    explanation: `${relatedCount} related submissions in this area indicate a widespread issue.`,
  };
};

/**
 * Score based on the submission category's intrinsic importance
 * @param {Object} submission
 * @returns {Object} Score and explanation
 */
const scoreCategory = (submission) => {
  const category = submission.category || 'other';
  const categoryWeights = {
    water: 100, health: 95, sanitation: 90, electricity: 85, security: 80,
    roads: 75, education: 70, housing: 65, agriculture: 60, transport: 55,
    employment: 50, environment: 45, other: 30,
  };
  const score = categoryWeights[category] || 30;
  return {
    score,
    weight: WEIGHTS.category,
    explanation: `Category '${category}' has a high intrinsic priority for development.`,
  };
};

/**
 * Calculate final weighted priority score
 * @param {Object} factors - All factor scores
 * @returns {number} Final score 0-10
 */
const calculateFinalScore = (factors) => {
  const { urgency, votes, severity, geoImpact, category } = factors;

  const score =
    (urgency.score * WEIGHTS.urgency) +
    (votes.score * WEIGHTS.votes) +
    (severity.score * WEIGHTS.severity) +
    (geoImpact.score * WEIGHTS.geoImpact) +
    (category.score * WEIGHTS.category);

  return Math.round((score / 100) * 100) / 10; // Scale to 0-10 and round to 1 decimal
};

/**
 * Main function: rank a list of submissions to generate recommendations
 * @param {Array} submissions - Array of submission documents
 * @returns {Array} Sorted submissions with scores and explanations
 */
const rankSubmissions = (submissions) => {
  if (!submissions || submissions.length === 0) return [];

  // Pre-calculate max values for normalization
  const maxVotes = Math.max(...submissions.map(s => s.votes || 0), 1);
  const geoCounts = submissions.reduce((acc, s) => {
    const key = s.location?.district || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const maxRelated = Math.max(...Object.values(geoCounts), 1);

  const rankedSubmissions = submissions.map((sub) => {
    const geoKey = sub.location?.district || 'unknown';
    const relatedCount = geoCounts[geoKey] || 1;

    const factors = {
      urgency: scoreUrgency(sub),
      votes: scoreVotes(sub, maxVotes),
      severity: scoreSeverity(sub),
      geoImpact: scoreGeoImpact(relatedCount, maxRelated),
      category: scoreCategory(sub),
    };

    const priorityScore = calculateFinalScore(factors);

    return {
      ...sub.toObject(), // Use toObject() if it's a Mongoose doc
      priorityScore,
      rankingFactors: factors,
    };
  });

  const sortedSubmissions = rankedSubmissions
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  return sortedSubmissions;
};

module.exports = {
  rankSubmissions,
  scoreUrgency,
  scoreVotes,
  scoreSeverity,
  scoreGeoImpact,
  scoreCategory,
  calculateFinalScore,
  WEIGHTS,
};
