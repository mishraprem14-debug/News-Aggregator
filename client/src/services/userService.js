import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../config/firebase";

//**Creates or updates the user document in Firestore `users/{userId}`

export async function syncUserProfile(user, additionalData = {}) {
  if (!isFirebaseConfigured || !user || !user.uid) return null;

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const providerId = user.providerData && user.providerData[0] ? user.providerData[0].providerId : "password";
    const isEmailVerified = Boolean(user.emailVerified || providerId === "google.com");

    if (!userSnap.exists()) {
      // First-time user profile creation
      const newUserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: additionalData.displayName || user.displayName || user.email?.split("@")[0] || "News Reader",
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || user.uid)}`,
        provider: providerId,
        emailVerified: isEmailVerified,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        preferences: {
          preferredCategories: ["technology", "business", "sports"],
          lastCategory: "general",
          lastCountry: "us"
        }
      };

      await setDoc(userRef, newUserProfile);
      return newUserProfile;
    } else {
      // Existing user: Update lastLogin and photo/displayName if missing
      const updatePayload = {
        lastLogin: serverTimestamp(),
        emailVerified: isEmailVerified
      };

      if (!userSnap.data().photoURL && user.photoURL) {
        updatePayload.photoURL = user.photoURL;
      }
      if (additionalData.displayName) {
        updatePayload.displayName = additionalData.displayName;
      }

      try {
        await updateDoc(userRef, updatePayload);
      } catch (err) {
        // If unverified user encounters a Firestore rule block, handle gracefully
        console.warn("Firestore updateDoc info:", err.message);
      }
      return { ...userSnap.data(), ...updatePayload };
    }
  } catch (error) {
    console.error("Error syncing user profile in Firestore:", error);
    return null;
  }
}

//**Synchronize email verification status in Firestore doc

export async function updateUserVerificationStatusInDb(userId, isVerified) {
  if (!isFirebaseConfigured || !userId) return;

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      emailVerified: isVerified,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.warn("Error updating verification status in Firestore:", error.message);
  }
}

//**Update user category preferences in Firestore

export async function updateUserPreferencesInDb(userId, preferencesObj) {
  if (!isFirebaseConfigured || !userId) return;

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      preferences: preferencesObj,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
  }
}

//**Fetch complete user profile from Firestore

export async function getUserProfileFromDb(userId) {
  if (!isFirebaseConfigured || !userId) return null;

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}
