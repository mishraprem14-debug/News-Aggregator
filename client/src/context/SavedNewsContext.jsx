import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  saveArticleToFirestore,
  removeArticleFromFirestore,
  subscribeSavedArticles
} from "../services/savedNewsService";

const SavedNewsContext = createContext();

export function SavedNewsProvider({ children }) {
  const { user, openAuthModal } = useAuth();
  const [savedArticles, setSavedArticles] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Synchronize saved articles exclusively with the current authenticated user's state
  useEffect(() => {
    // 1. If user is logged out or null, immediately reset all user saved state
    if (!user || !user.uid) {
      setSavedArticles([]);
      try {
        localStorage.removeItem("news_saved_articles");
      } catch (e) {
        // Ignore storage errors
      }
      return;
    }

    // 2. Load namespaced local cached data for current user if available
    try {
      const stored = localStorage.getItem(`news_saved_articles_${user.uid}`);
      if (stored) {
        setSavedArticles(JSON.parse(stored));
      } else {
        setSavedArticles([]);
      }
    } catch (e) {
      setSavedArticles([]);
    }

    // 3. Subscribe to real-time Firestore updates for current user UID only
    let isCancelled = false;
    const unsubscribe = subscribeSavedArticles(user.uid, (firestoreArticles) => {
      if (isCancelled) return;
      setSavedArticles(firestoreArticles);
      try {
        localStorage.setItem(`news_saved_articles_${user.uid}`, JSON.stringify(firestoreArticles));
      } catch (e) {
        console.error("Local storage error:", e);
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [user?.uid]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const isSaved = (url) => {
    if (!url || !user) return false;
    return savedArticles.some((article) => article.url === url);
  };

  const toggleSave = async (article) => {
    if (!article || !article.url) return;

    // Require login for guests
    if (!user) {
      showToast("Please sign in to save articles to your bookmarks!");
      openAuthModal("login");
      return;
    }

    const alreadySaved = isSaved(article.url);

    if (alreadySaved) {
      // Optimistic update for current user
      setSavedArticles((prev) => prev.filter((item) => item.url !== article.url));
      showToast("Removed from Saved Articles");

      if (user.uid) {
        await removeArticleFromFirestore(user.uid, article.url, article.title);
      }
    } else {
      // Optimistic update for current user
      setSavedArticles((prev) => [article, ...prev]);
      showToast("Article bookmarked!");

      if (user.uid) {
        await saveArticleToFirestore(user.uid, article);
      }
    }
  };

  const clearSaved = async () => {
    if (!user || !user.uid) return;

    for (const article of savedArticles) {
      await removeArticleFromFirestore(user.uid, article.url, article.title);
    }
    setSavedArticles([]);
    try {
      localStorage.removeItem(`news_saved_articles_${user.uid}`);
    } catch (e) {}
    showToast("All saved articles cleared");
  };

  // Derive savedCount strictly for authenticated user
  const savedCount = user ? savedArticles.length : 0;

  return (
    <SavedNewsContext.Provider
      value={{
        savedArticles: user ? savedArticles : [],
        isSaved,
        toggleSave,
        clearSaved,
        toastMessage,
        savedCount
      }}
    >
      {children}
    </SavedNewsContext.Provider>
  );
}

export function useSavedNews() {
  const context = useContext(SavedNewsContext);
  if (!context) {
    throw new Error("useSavedNews must be used within a SavedNewsProvider");
  }
  return context;
}
