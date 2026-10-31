import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../config/firebase";
import { logUserActivity } from "./activityService";

/**
 * Deterministic article ID generator from URL or Title
 */
export function generateArticleId(url, title) {
  const str = url || title || String(Math.random());
  try {
    // Simple URL-safe hash/b64 string
    const encoded = btoa(unescape(encodeURIComponent(str)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    return encoded.substring(0, 64);
  } catch (e) {
    return "art_" + str.length + "_" + Math.abs(str.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
  }
}

/**
 * Save an article to Firestore `users/{userId}/savedArticles/{articleId}`
 */
export async function saveArticleToFirestore(userId, article) {
  if (!isFirebaseConfigured || !userId || !article || !article.url) return;

  const articleId = generateArticleId(article.url, article.title);
  const articleRef = doc(db, "users", userId, "savedArticles", articleId);

  const payload = {
    articleId,
    title: article.title || "",
    description: article.description || "",
    imgUrl: article.imgUrl || article.urlToImage || "",
    source: typeof article.source === "object" ? article.source?.name : article.source || "",
    url: article.url,
    category: article.category || "General",
    author: article.author || "Staff",
    publishedAt: article.publishedAt || "",
    savedAt: serverTimestamp()
  };

  await setDoc(articleRef, payload);
  await logUserActivity(userId, "ARTICLE_SAVED", {
    articleId,
    articleTitle: article.title,
    url: article.url
  });
}

/**
 * Remove a saved article from Firestore
 */
export async function removeArticleFromFirestore(userId, url, title) {
  if (!isFirebaseConfigured || !userId || !url) return;

  const articleId = generateArticleId(url, title);
  const articleRef = doc(db, "users", userId, "savedArticles", articleId);

  await deleteDoc(articleRef);
  await logUserActivity(userId, "ARTICLE_REMOVED", {
    articleId,
    articleTitle: title,
    url
  });
}

/**
 * Fetch initial array of saved articles for user
 */
export async function fetchSavedArticlesFromFirestore(userId) {
  if (!isFirebaseConfigured || !userId) return [];

  try {
    const colRef = collection(db, "users", userId, "savedArticles");
    const snap = await getDocs(colRef);
    const list = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    return list;
  } catch (error) {
    console.error("Error fetching saved articles from Firestore:", error);
    return [];
  }
}

/**
 * Subscribe to real-time updates for saved articles
 */
export function subscribeSavedArticles(userId, onUpdate) {
  if (!isFirebaseConfigured || !userId) return () => {};

  const colRef = collection(db, "users", userId, "savedArticles");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const articles = [];
      snapshot.forEach((docSnap) => {
        articles.push(docSnap.data());
      });
      onUpdate(articles);
    },
    (error) => {
      console.error("Firestore saved articles snapshot error:", error);
    }
  );
}
