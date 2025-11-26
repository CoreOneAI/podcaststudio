// functions/index.js

// --- Firebase and Vonage Imports ---
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { OpenTok } = require('@vonage/opentok'); // Import Vonage OpenTok SDK

// --- Initialize Firebase Admin SDK ---
admin.initializeApp();

// --- Configuration for Vonage Credentials ---
// These values are loaded from the environment variables you set using `firebase functions:config:set`
const vonageConfig = functions.config().vonage;

// Basic check to ensure configuration exists
if (!vonageConfig || !vonageConfig.api_key || !vonageConfig.api_secret) {
    console.error("Vonage configuration missing. Please run `firebase functions:config:set vonage.api_key=\"...\" vonage.api_secret=\"...\"`");
    // Throwing an error here would prevent deployment if config is missing,
    // but for now, it's a console error and the function will fail at runtime.
}

const vonageApiKey = vonageConfig ? vonageConfig.api_key : null;
const vonageApiSecret = vonageConfig ? vonageConfig.api_secret : null;

// Initialize OpenTok instance with your API Key and Secret
let opentok;
if (vonageApiKey && vonageApiSecret) {
    opentok = new OpenTok(vonageApiKey, vonageApiSecret);
} else {
    console.error("OpenTok SDK could not be initialized due to missing API Key or Secret.");
    // This will lead to errors if the function tries to use `opentok` instance.
}


/**
 * Firebase Callable Cloud Function to generate Vonage (OpenTok) Session ID and Token.
 * This function should be called from the client-side (e.g., your React app)
 * to securely obtain credentials without exposing Vonage API keys and secrets.
 *
 * For simplicity, this version creates a new session every time for demonstration.
 * In a real application, you'd store the sessionId in Firestore
 * and reuse it for a given 'roomName'.
 */
exports.generateVonageCredentials = functions.https.onCall(async (data, context) => {
    // 1. Authentication Check: Ensure the caller is an authenticated Firebase user
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'The function must be called while authenticated.'
        );
    }
    const userId = context.auth.uid; // Use Firebase UID as the user's identity in Vonage

    // 2. Input Validation: Ensure a roomName is provided
    const roomName = data.roomName; // This is what you pass from your client-side
    if (!roomName || typeof roomName !== 'string' || roomName.trim().length === 0) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The function must be called with a non-empty "roomName" string.'
        );
    }

    if (!opentok) {
        throw new functions.https.HttpsError(
            'internal',
            'Vonage OpenTok SDK not initialized due to missing API credentials.'
        );
    }

    let sessionId;
    let token;

    try {
        // --- IMPORTANT: For a real application, you would typically store the sessionId
        // --- in a database (like Cloud Firestore) and retrieve it here.
        // --- If a session exists for the roomName, use it. Otherwise, create a new one.

        // For now, we'll create a new session ID for every request for simplicity.
        // This is not efficient for actual persistent rooms.
        // A future step will be to integrate Firestore to manage session IDs.
        const session = await new Promise((resolve, reject) => {
            opentok.createSession({ mediaMode: 'routed' }, (err, session) => {
                if (err) { reject(err); } else { resolve(session); }
            });
        });
        sessionId = session.sessionId;

        // Generate a token for this user to connect to the session
        // Set role to 'publisher' to allow user to send audio/video
        token = opentok.generateToken(sessionId, {
            role: 'publisher',
            expireTime: (new Date().getTime() / 1000) + (7 * 24 * 60 * 60), // 1 week
            data: `userId=${userId}` // Attach Firebase UID to token data
        });

        // 6. Return the credentials to the client
        return {
            apiKey: vonageApiKey,
            sessionId: sessionId,
            token: token
        };

    } catch (error) {
        console.error("Error generating Vonage credentials:", error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to generate Vonage credentials.',
            error.message
        );
    }
});


// --- analyzeDatingMessage Function (UNCHANGED) ---
const SUSPICIOUS_KEYWORDS = [
  "crypto", "bitcoin", "ethereum", "investment", "money transfer",
  "western union", "gift card", "bank account", "urgent funds",
  "financial aid", "inheritance", "customs fee", "lucky winner",
  "secret", "don't tell anyone", "urgent help", "stranded",
  "lonely", "dating site", "cam girl", "sugar daddy", "adult",
  "i'm a soldier", "military deployment", "oil rig worker",
  "widowed", "orphan", "poor internet connection",
];

const URGENCY_PHRASES = [
  "act now", "immediately", "urgent", "critical", "deadline",
  "before it's too late", "must transfer", "respond quickly",
  "in a hurry", "rush",
];

exports.analyzeDatingMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const message = data.message;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The 'message' parameter must be a non-empty string."
    );
  }

  const cleanMessage = message.toLowerCase();
  let score = 0;
  const flags = [];
  const advice = [];

  SUSPICIOUS_KEYWORDS.forEach(keyword => {
    if (cleanMessage.includes(keyword)) {
      score += 10;
      flags.push(`Contains suspicious keyword: "${keyword}"`);
    }
  });

  URGENCY_PHRASES.forEach(phrase => {
    if (cleanMessage.includes(phrase)) {
      score += 8;
      flags.push(`Detects urgent or high-pressure language: "${phrase}"`);
    }
  });

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = cleanMessage.match(urlRegex);
  if (urls && urls.length > 0) {
    score += urls.length * 5;
    flags.push(`Contains external links (${urls.length} detected).`);
    advice.push("Be extremely cautious clicking on unsolicited links.");
  }

  if (cleanMessage.includes("i am a") && cleanMessage.includes("engineer")) {
    score += 5;
    flags.push("Contains a common bot introductory phrase.");
  }
  if (cleanMessage.includes("my life is complicated") && cleanMessage.includes("my children")) {
    score += 7;
    flags.push("Uses emotionally manipulative phrasing.");
  }

  let assessment = "Looks generally safe. Always trust your gut!";
  if (score >= 30) {
    assessment = "High risk of being a scam or bot. Proceed with extreme caution!";
    advice.unshift("Do NOT send money or personal information.");
    advice.unshift("Immediately block and report this user.");
  } else if (score >= 15) {
    assessment = "Moderate risk. Be very careful and look for other red flags.";
    advice.unshift("Verify their identity through video call before sharing any personal info.");
  } else if (score > 0) {
    assessment = "Low risk, but some flags detected. Stay vigilant.";
  }

  const uniqueAdvice = [...new Set(advice)];

  return {
    score: score,
    isScamLikely: score >= 15,
    flags: [...new Set(flags)],
    assessment: assessment,
    advice: uniqueAdvice,
    timestamp: new Date().toISOString(),
  };
});
