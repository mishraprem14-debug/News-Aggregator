import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../config/firebase";

// In-memory cache to prevent duplicate activity logging (e.g. rapid renders or identical searches)
const activityCache = new Map();
const DEBOUNCE_INTERVAL_MS = 5000;

export async function logUserActivity(userId, activityType, payload = {}) {
  if (!isFirebaseConfigured || !userId || !activityType) return;

  const cacheKey = `${userId}_${activityType}_${payload.articleId || payload.searchQuery || payload.category || ""}`;
  const now = Date.now();
  const lastLogged = activityCache.get(cacheKey);

  if (lastLogged && now - lastLogged < DEBOUNCE_INTERVAL_MS) {
    return; // Skip duplicate rapid write
  }

  activityCache.set(cacheKey, now);

  try {
    const activityRef = collection(db, "users", userId, "activity");
    const activityData = {
      type: activityType,
      timestamp: serverTimestamp(),
      ...payload
    };

    // Clean undefined values
    Object.keys(activityData).forEach((key) => {
      if (activityData[key] === undefined) delete activityData[key];
    });

    await addDoc(activityRef, activityData);
  } catch (error) {
    console.error(`Failed to log user activity [${activityType}]:`, error);
  }
}
