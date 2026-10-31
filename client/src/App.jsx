import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AllNews from "./components/AllNews";
import TopHeadlines from "./components/TopHeadlines";
import CountryNews from "./components/CountryNews";
import SavedNews from "./components/SavedNews";
import VerifyEmail from "./components/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthModal from "./components/AuthModal";
import UserProfileModal from "./components/UserProfileModal";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SavedNewsProvider, useSavedNews } from "./context/SavedNewsContext";
import { Check } from "lucide-react";

function GlobalToast() {
  const { toastMessage } = useSavedNews();
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/90 text-white shadow-xl backdrop-blur-md border border-slate-700/80 animate-fade-in text-xs font-semibold">
      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
        <Check className="w-3.5 h-3.5" />
      </div>
      <span>{toastMessage}</span>
    </div>
  );
}

function VerifyEmailRouteGuard() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Checking verification status...
        </p>
      </div>
    );
  }

  // Not logged in -> redirect to homepage
  if (!user) return <Navigate to="/" replace />;

  // Verified account or Google Sign-In -> redirect to homepage
  if (user.provider === "google.com" || user.emailVerified) {
    return <Navigate to="/" replace />;
  }

  // Logged in + unverified -> render VerifyEmail page
  return <VerifyEmail />;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<AllNews />} />
          <Route path="/top-headlines/:category" element={<TopHeadlines />} />
          <Route path="/country/:iso" element={<CountryNews />} />
          <Route path="/verify-email" element={<VerifyEmailRouteGuard />} />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedNews />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <Footer />

      {/* Global Auth, Profile Modals & Toasts */}
      <AuthModal />
      <UserProfileModal />
      <GlobalToast />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SavedNewsProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </SavedNewsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
