import React, { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  googleProvider,
  isFirebaseConfigured
} from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
  onAuthStateChanged,
  updateProfile,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  GoogleAuthProvider
} from "firebase/auth";
import {
  syncUserProfile,
  updateUserPreferencesInDb,
  updateUserVerificationStatusInDb,
  getUserProfileFromDb
} from "../services/userService";
import { logUserActivity } from "../services/activityService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("news_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login"); // 'login' | 'signup' | 'forgot'
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Helper to purge user-specific storage keys
  const clearUserSession = (uid) => {
    try {
      sessionStorage.clear();
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("news_user") ||
            key.startsWith("news_saved_articles") ||
            key.startsWith("firebase:authUser"))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.error("Session cleanup error:", e);
    }
  };

  // Firebase auth state listener
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (currentUser) {
        try {
          await reload(currentUser);
        } catch (e) {}

        const providerDataList = currentUser.providerData || [];
        const providerIds = providerDataList.map((p) => p.providerId);
        const isGoogle = providerIds.includes("google.com");
        const isVerified = Boolean(currentUser.emailVerified || isGoogle);

        // Sync single profile per UID with Firestore
        let dbProfile = await getUserProfileFromDb(currentUser.uid);
        if (!dbProfile) {
          dbProfile = await syncUserProfile(currentUser);
        }

        const formattedUser = {
          uid: currentUser.uid,
          id: currentUser.uid,
          email: currentUser.email || "",
          displayName: currentUser.displayName || dbProfile?.displayName || currentUser.email?.split("@")[0] || "User",
          name: currentUser.displayName || dbProfile?.displayName || currentUser.email?.split("@")[0] || "User",
          photoURL: currentUser.photoURL || dbProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.email || currentUser.uid)}`,
          avatar: currentUser.photoURL || dbProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.email || currentUser.uid)}`,
          provider: providerIds.length > 0 ? providerIds.join(", ") : "password",
          providers: providerIds,
          emailVerified: isVerified,
          preferences: dbProfile?.preferences?.preferredCategories || ["technology", "business", "sports"],
          createdAt: dbProfile?.createdAt || new Date().toISOString()
        };

        setUser(formattedUser);
        localStorage.setItem("news_user", JSON.stringify(formattedUser));
      } else {
        setUser(null);
        clearUserSession();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (tab = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  // Sign Up with Email/Password (prevents duplicate accounts if email is registered via Google or Password)
  const signUp = async (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isFirebaseConfigured) {
      const mockUser = {
        uid: "usr_" + Date.now(),
        id: "usr_" + Date.now(),
        email: cleanEmail,
        name: name || cleanEmail.split("@")[0],
        displayName: name || cleanEmail.split("@")[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        provider: "password",
        emailVerified: false,
        preferences: ["technology", "business", "sports"]
      };
      setUser(mockUser);
      localStorage.setItem("news_user", JSON.stringify(mockUser));
      closeAuthModal();
      return mockUser;
    }

    // Check existing sign-in methods for email
    try {
      const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
      if (methods.includes("google.com")) {
        const err = new Error("This email is already registered using Google Sign-In. Please click 'Continue with Google' to sign in.");
        err.code = "auth/email-registered-with-google";
        throw err;
      }
      if (methods.includes("password")) {
        const err = new Error("An account already exists with this email. Please sign in instead.");
        err.code = "auth/email-already-in-use";
        throw err;
      }
    } catch (err) {
      if (err.code === "auth/email-registered-with-google" || err.code === "auth/email-already-in-use") {
        throw err;
      }
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const createdUser = userCredential.user;

      if (name) {
        await updateProfile(createdUser, { displayName: name });
      }

      await syncUserProfile(createdUser, { displayName: name });

      try {
        await sendEmailVerification(createdUser);
      } catch (err) {
        console.error("Error sending initial email verification:", err);
      }

      await logUserActivity(createdUser.uid, "ACCOUNT_CREATED", { email: cleanEmail, provider: "password" });
      closeAuthModal();
      return createdUser;
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        const customErr = new Error("An account already exists with this email. Please sign in instead.");
        customErr.code = "auth/email-already-in-use";
        throw customErr;
      }
      throw err;
    }
  };

  // Sign In with Email/Password (and link pending Google credential if present)
  const signIn = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    console.log("[Auth] Starting Email/Password login for:", cleanEmail);

    if (!isFirebaseConfigured) {
      const mockUser = {
        uid: "usr_" + Date.now(),
        id: "usr_" + Date.now(),
        email: cleanEmail,
        name: cleanEmail.split("@")[0],
        displayName: cleanEmail.split("@")[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        provider: "password",
        emailVerified: true,
        preferences: ["technology", "business", "sports"]
      };
      setUser(mockUser);
      localStorage.setItem("news_user", JSON.stringify(mockUser));
      closeAuthModal();
      return mockUser;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const loggedUser = userCredential.user;
      console.log("[Auth] Firebase authentication successful for UID:", loggedUser.uid);

      // If there is a pending Google credential for this email, link it to the authenticated account
      if (pendingGoogleCredential && pendingGoogleCredential.email === cleanEmail) {
        try {
          await linkWithCredential(loggedUser, pendingGoogleCredential.credential);
          setPendingGoogleCredential(null);
          console.log("[Auth] Successfully linked pending Google credential to user.");
        } catch (linkErr) {
          console.error("Error linking pending Google credential:", linkErr);
        }
      }

      try {
        await reload(loggedUser);
      } catch (e) {}

      if (loggedUser.emailVerified) {
        try {
          await loggedUser.getIdToken(true);
        } catch (e) {}
      }

      await syncUserProfile(loggedUser);
      await logUserActivity(loggedUser.uid, "EMAIL_LOGIN", { email: cleanEmail });
      closeAuthModal();
      return loggedUser;
    } catch (err) {
      console.error("[Auth] Firebase signInWithEmailAndPassword error:", err.code, err.message);
      throw err;
    }
  };

  // Google Sign-In with Popup & Account Linking
  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      const googleMock = {
        uid: "goog_" + Date.now(),
        id: "goog_" + Date.now(),
        email: "google.user@gmail.com",
        name: "Google Reader",
        displayName: "Google Reader",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
        provider: "google.com",
        emailVerified: true,
        preferences: ["technology", "business", "sports"]
      };
      setUser(googleMock);
      localStorage.setItem("news_user", JSON.stringify(googleMock));
      closeAuthModal();
      return googleMock;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;

      try {
        await loggedUser.getIdToken(true);
      } catch (e) {}

      await syncUserProfile(loggedUser);
      await logUserActivity(loggedUser.uid, "GOOGLE_LOGIN", { email: loggedUser.email });
      closeAuthModal();
      return loggedUser;
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        console.warn("Google login popup closed by user.");
        return;
      }
      if (error.code === "auth/account-exists-with-different-credential") {
        const pendingCred = GoogleAuthProvider.credentialFromError(error);
        const email = error.customData?.email || error.email;
        if (email && pendingCred) {
          setPendingGoogleCredential({ email: email.toLowerCase(), credential: pendingCred });
        }
        const customErr = new Error(`An account already exists with ${email || 'this email'}. Please enter your password to link your Google account.`);
        customErr.code = "auth/account-exists-with-different-credential";
        customErr.email = email;
        throw customErr;
      }
      throw error;
    }
  };

  // Resend Email Verification
  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error("No active user session found.");
    }
    await sendEmailVerification(auth.currentUser);
  };

  // Check Email Verification Status
  const checkEmailVerificationStatus = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, message: "No active user session." };
    }

    try {
      await reload(currentUser);
    } catch (e) {
      console.error("Error reloading user:", e);
    }

    if (currentUser.emailVerified) {
      try {
        await currentUser.getIdToken(true);
      } catch (e) {}

      await updateUserVerificationStatusInDb(currentUser.uid, true);

      setUser((prev) => (prev ? { ...prev, emailVerified: true } : prev));
      return { success: true, emailVerified: true };
    } else {
      return {
        success: false,
        emailVerified: false,
        message: "Your email has not been verified yet. Please check your inbox and click the verification link."
      };
    }
  };

  // Logout
  const logout = async () => {
    const currentUid = user?.uid;

    if (currentUid && isFirebaseConfigured) {
      try {
        await logUserActivity(currentUid, "LOGOUT");
      } catch (e) {}
    }

    setUser(null);
    setFirebaseUser(null);
    closeProfileModal();
    closeAuthModal();
    clearUserSession(currentUid);

    if (isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (e) {}
    }

    window.location.replace("/");
  };

  // Reset Password
  const resetPassword = async (email) => {
    if (!isFirebaseConfigured) return;
    await sendPasswordResetEmail(auth, email);
  };

  // Update Category Preferences
  const updatePreferences = async (newPrefs) => {
    if (!user) return;
    const updatedUser = { ...user, preferences: newPrefs };
    setUser(updatedUser);
    localStorage.setItem("news_user", JSON.stringify(updatedUser));

    if (user.uid && isFirebaseConfigured) {
      await updateUserPreferencesInDb(user.uid, {
        preferredCategories: newPrefs
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        logout,
        resetPassword,
        resendVerificationEmail,
        checkEmailVerificationStatus,
        updatePreferences,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
