/**
 * JanVikas AI — AI Service
 * NLP Processing: Language detection, keyword extraction,
 * duplicate detection, topic clustering, sentiment analysis
 * Uses algorithmic approaches (no paid API required for demo)
 */

const { CATEGORIES, LANGUAGES } = require('../utils/constants');

// ─── Stop Words (multi-language common words to ignore) ───
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  'i', 'we', 'you', 'he', 'she', 'it', 'they', 'my', 'our', 'your', 'their',
  'not', 'no', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'once',
  'हम', 'आप', 'वह', 'यह', 'और', 'या', 'में', 'पर', 'से', 'के', 'की', 'का',
  'है', 'हैं', 'था', 'थे', 'होना', 'कि', 'नहीं', 'भी', 'तो', 'ने',
]);

// ─── Category Keywords for Topic Detection ────────────────
const CATEGORY_KEYWORDS = {
  roads: ['road', 'pothole', 'highway', 'bridge', 'street', 'path', 'traffic', 'sड़क', 'पुल', 'रास्ता', 'flyover'],
  water: ['water', 'drinking', 'pipeline', 'tap', 'borewell', 'pond', 'lake', 'flood', 'पानी', 'नल', 'बाढ़', 'irrigation'],
  electricity: ['electricity', 'power', 'light', 'voltage', 'transformer', 'wire', 'बिजली', 'voltage', 'outage', 'blackout'],
  education: ['school', 'college', 'teacher', 'student', 'education', 'library', 'classroom', 'स्कूल', 'शिक्षा', 'पाठशाला'],
  health: ['hospital', 'doctor', 'medicine', 'clinic', 'ambulance', 'health', 'disease', 'अस्पताल', 'डॉक्टर', 'दवाई'],
  sanitation: ['toilet', 'drainage', 'sewage', 'garbage', 'waste', 'clean', 'शौचालय', 'सफाई', 'कचरा', 'नाला'],
  agriculture: ['farm', 'crop', 'irrigation', 'fertilizer', 'seed', 'kisan', 'खेती', 'फसल', 'किसान', 'खाद'],
  housing: ['house', 'home', 'shelter', 'building', 'construction', 'घर', 'मकान', 'आवास', 'colony'],
  employment: ['job', 'work', 'employment', 'income', 'livelihood', 'रोजगार', 'काम', 'नौकरी', 'व्यापार'],
  environment: ['tree', 'pollution', 'environment', 'green', 'forest', 'पेड़', 'प्रदूषण', 'पर्यावरण'],
  security: ['safety', 'police', 'crime', 'security', 'theft', 'सुरक्षा', 'पुलिस', 'अपराध', 'चोरी'],
  transport: ['bus', 'train', 'transport', 'vehicle', 'auto', 'बस', 'ट्रेन', 'परिवहन', 'रेलवे'],
};

// ─── Urgency Keywords ────────────────────────────────────
const URGENCY_HIGH_KEYWORDS = [
  'urgent', 'emergency', 'critical', 'immediately', 'dangerous', 'death',
  'accident', 'flood', 'fire', 'collapse', 'disease', 'epidemic',
  'तुरंत', 'जरूरी', 'खतरा', 'मृत्यु', 'बाढ़', 'आग',
];

/**
 * Extract keywords from text using TF-like scoring
 * @param {string} text
 * @returns {string[]} Top keywords
 */
const extractKeywords = (text) => {
  if (!text) return [];

  const words = text
    .toLowerCase()
    .replace(/[^a-zA-Z\u0900-\u097F\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  // Count frequency
  const freq = {};
  words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });

  // Sort by frequency and return top 10
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

/**
 * Detect category from text content
 * @param {string} text
 * @returns {string} Detected category
 */
const detectCategory = (text) => {
  if (!text) return 'other';

  const lowerText = text.toLowerCase();
  const scores = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = keywords.filter((kw) => lowerText.includes(kw)).length;
  }

  const maxCategory = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return maxCategory && maxCategory[1] > 0 ? maxCategory[0] : 'other';
};

/**
 * Detect language from text
 * @param {string} text
 * @returns {string} Language code
 */
const detectLanguage = (text) => {
  if (!text) return 'en';

  // Check for Devanagari script (Hindi, Marathi, etc.)
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;

  if (totalChars === 0) return 'en';

  const devanagariRatio = devanagariCount / totalChars;

  if (devanagariRatio > 0.3) return 'hi';

  // Check for Tamil
  const tamilCount = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
  if (tamilCount / totalChars > 0.3) return 'ta';

  // Check for Telugu
  const teluguCount = (text.match(/[\u0C00-\u0C7F]/g) || []).length;
  if (teluguCount / totalChars > 0.3) return 'te';

  // Check for Bengali
  const bengaliCount = (text.match(/[\u0980-\u09FF]/g) || []).length;
  if (bengaliCount / totalChars > 0.3) return 'bn';

  // Check for Gujarati
  const gujaratiCount = (text.match(/[\u0A80-\u0AFF]/g) || []).length;
  if (gujaratiCount / totalChars > 0.3) return 'gu';

  return 'en';
};

/**
 * Analyze sentiment of text
 * @param {string} text
 * @returns {{ sentiment: string, score: number }}
 */
const analyzeSentiment = (text) => {
  if (!text) return { sentiment: 'neutral', score: 0 };

  const lowerText = text.toLowerCase();

  // Check for urgent/critical keywords
  const urgentMatches = URGENCY_HIGH_KEYWORDS.filter((kw) => lowerText.includes(kw));
  if (urgentMatches.length > 0) {
    return { sentiment: 'urgent', score: -0.9 };
  }

  // Negative patterns
  const negativePatterns = [
    'problem', 'issue', 'broken', 'damaged', 'bad', 'poor', 'worst',
    'terrible', 'horrible', 'disgrace', 'failure', 'neglect',
    'समस्या', 'खराब', 'टूटा', 'बेकार',
  ];

  // Positive patterns
  const positivePatterns = [
    'good', 'excellent', 'great', 'improve', 'request', 'need', 'require',
    'अच्छा', 'बेहतर', 'सुधार',
  ];

  const negScore = negativePatterns.filter((p) => lowerText.includes(p)).length;
  const posScore = positivePatterns.filter((p) => lowerText.includes(p)).length;

  if (negScore > posScore) return { sentiment: 'negative', score: -(negScore / 10) };
  if (posScore > negScore) return { sentiment: 'positive', score: posScore / 10 };
  return { sentiment: 'neutral', score: 0 };
};

/**
 * Compute cosine similarity between two text strings
 * @param {string} text1
 * @param {string} text2
 * @returns {number} Similarity score 0-1
 */
const computeCosineSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;

  const tokenize = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-zA-Z\u0900-\u097F\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const words1 = tokenize(text1);
  const words2 = tokenize(text2);

  if (words1.length === 0 || words2.length === 0) return 0;

  // Build vocabulary
  const vocab = new Set([...words1, ...words2]);

  // Build TF vectors
  const vec1 = {};
  const vec2 = {};

  vocab.forEach((word) => {
    vec1[word] = words1.filter((w) => w === word).length;
    vec2[word] = words2.filter((w) => w === word).length;
  });

  // Compute dot product and magnitudes
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  vocab.forEach((word) => {
    dotProduct += vec1[word] * vec2[word];
    mag1 += vec1[word] ** 2;
    mag2 += vec2[word] ** 2;
  });

  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
};

/**
 * Check if a submission is a duplicate of existing ones
 * @param {string} newText - New submission text
 * @param {Array} existingSubmissions - Array of existing submissions
 * @returns {{ isDuplicate: boolean, duplicateOf: string|null, similarityScore: number }}
 */
const checkDuplicate = (newText, existingSubmissions) => {
  const DUPLICATE_THRESHOLD = 0.75;
  let maxSimilarity = 0;
  let duplicateOf = null;

  for (const sub of existingSubmissions) {
    const existingText = `${sub.title} ${sub.description}`;
    const similarity = computeCosineSimilarity(newText, existingText);

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      if (similarity >= DUPLICATE_THRESHOLD) {
        duplicateOf = sub._id;
      }
    }
  }

  return {
    isDuplicate: maxSimilarity >= DUPLICATE_THRESHOLD,
    duplicateOf,
    similarityScore: Math.round(maxSimilarity * 100),
  };
};

/**
 * Detect urgency level (1-5)
 * @param {string} text
 * @param {string} priority
 * @returns {number} Urgency level 1-5
 */
const detectUrgencyLevel = (text, priority = 'medium') => {
  const lowerText = (text || '').toLowerCase();
  const urgentMatches = URGENCY_HIGH_KEYWORDS.filter((kw) => lowerText.includes(kw)).length;

  let level = 2; // Default medium
  if (priority === 'critical' || urgentMatches >= 3) level = 5;
  else if (priority === 'high' || urgentMatches >= 2) level = 4;
  else if (priority === 'medium' || urgentMatches >= 1) level = 3;
  else if (priority === 'low') level = 1;

  return level;
};

/**
 * Cluster submissions into topics
 * @param {Array} submissions - Array of submissions
 * @returns {Object} Clusters by topic
 */
const clusterByTopic = (submissions) => {
  const clusters = {};

  submissions.forEach((sub) => {
    const category = sub.category || 'other';
    if (!clusters[category]) {
      clusters[category] = {
        id: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
        submissions: [],
        count: 0,
        avgPriorityScore: 0,
        topKeywords: [],
      };
    }
    clusters[category].submissions.push(sub._id);
    clusters[category].count++;
  });

  // Calculate avg priority scores
  Object.values(clusters).forEach((cluster) => {
    const clusterSubs = submissions.filter(
      (s) => cluster.submissions.includes(s._id)
    );
    const totalScore = clusterSubs.reduce(
      (sum, s) => sum + (s.aiAnalysis?.priorityScore || 0),
      0
    );
    cluster.avgPriorityScore = cluster.count > 0
      ? Math.round(totalScore / cluster.count)
      : 0;
  });

  return Object.values(clusters).sort((a, b) => b.count - a.count);
};

/**
 * Generate LLM-style summary of submissions
 * @param {Array} submissions
 * @param {string} timeframe
 * @returns {Object} Summary object
 */
const generateSummary = (submissions, timeframe = 'last month') => {
  const total = submissions.length;
  if (total === 0) {
    return {
      headline: 'No submissions to analyze',
      summary: 'No citizen submissions have been recorded for this period.',
      actionPoints: [],
      topIssues: [],
    };
  }

  // Category breakdown
  const categoryCount = {};
  const districtCount = {};
  let totalVotes = 0;

  submissions.forEach((sub) => {
    categoryCount[sub.category] = (categoryCount[sub.category] || 0) + 1;
    const district = sub.location?.district;
    if (district) districtCount[district] = (districtCount[district] || 0) + 1;
    totalVotes += sub.votes || 0;
  });

  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
  const topDistrict = Object.entries(districtCount).sort((a, b) => b[1] - a[1])[0];

  const resolved = submissions.filter((s) => s.status === 'resolved').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const critical = submissions.filter((s) => s.priority === 'critical' || s.priority === 'high').length;

  const topIssues = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, count]) => ({
      category: cat,
      count,
      percentage: Math.round((count / total) * 100),
    }));

  const actionPoints = [
    topCategory
      ? `🚨 Prioritize ${topCategory[0].toUpperCase()} sector — ${topCategory[1]} submissions (${Math.round((topCategory[1] / total) * 100)}% of total)`
      : null,
    topDistrict
      ? `📍 ${topDistrict[0]} district is a hotspot with ${topDistrict[1]} submissions — immediate field inspection recommended`
      : null,
    critical > 0
      ? `⚠️ ${critical} high-priority/critical submissions require immediate attention`
      : null,
    resolutionRate < 50
      ? `📋 Resolution rate is ${resolutionRate}% — recommend increasing MP review sessions`
      : `✅ Resolution rate is ${resolutionRate}% — maintain momentum`,
    totalVotes > 100
      ? `👥 High citizen engagement (${totalVotes} votes) — strong community participation`
      : null,
  ].filter(Boolean);

  return {
    headline: `${total} submissions analyzed for ${timeframe}`,
    summary: `Analysis of **${total}** citizen submissions reveals that **${topCategory ? topCategory[0] : 'general'}** issues are the primary concern, with **${topDistrict ? topDistrict[0] + ' district' : 'multiple areas'}** being the geographic hotspot. **${critical}** submissions require urgent attention. Overall resolution rate stands at **${resolutionRate}%**, with **${totalVotes}** community votes indicating strong citizen engagement.`,
    actionPoints,
    topIssues,
    stats: {
      total,
      resolved, // This was missing, now it's here
      resolutionRate,
      critical,
      totalVotes,
    },
  };
};

/**
 * Full AI analysis of a single submission
 * @param {Object} submission - Raw submission data
 * @param {Array} existingSubmissions - For duplicate check
 * @returns {Object} AI analysis result
 */
const analyzeSubmission = async (submission, existingSubmissions = []) => {
  const fullText = `${submission.title} ${submission.description}`;

  const keywords = extractKeywords(fullText);
  const detectedCategory = detectCategory(fullText);
  const language = detectLanguage(fullText);
  const { sentiment, score: sentimentScore } = analyzeSentiment(fullText);
  const { isDuplicate, duplicateOf, similarityScore } = checkDuplicate(
    fullText,
    existingSubmissions
  );
  const urgencyLevel = detectUrgencyLevel(fullText, submission.priority);
  const themes = [
    detectedCategory,
    ...keywords.slice(0, 3),
  ].filter((v, i, a) => a.indexOf(v) === i);

  return {
    keywords,
    sentiment,
    sentimentScore,
    isDuplicate,
    duplicateOf: duplicateOf || null,
    similarityScore,
    urgencyLevel,
    themes,
    detectedCategory,
    language,
    processedAt: new Date(),
    isProcessed: true,
  };
};

module.exports = {
  extractKeywords,
  detectCategory,
  detectLanguage,
  analyzeSentiment,
  computeCosineSimilarity,
  checkDuplicate,
  detectUrgencyLevel,
  clusterByTopic,
  generateSummary,
  analyzeSubmission,
};
