import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, CheckCircle, RefreshCw, LogOut, AlertCircle } from "lucide-react";

export default function VerifyEmail() {
  const { user, logout, resendVerificationEmail, checkEmailVerificationStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: string }

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // If user becomes verified or provider is Google, redirect to home/intended route
  useEffect(() => {
    if (user && (user.emailVerified || user.provider === "google.com")) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleCheckStatus = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const res = await checkEmailVerificationStatus();
      if (res.success && res.emailVerified) {
        setMessage({
          type: "success",
          text: "Email verified successfully! Redirecting..."
        });
        setTimeout(() => {
          const from = location.state?.from?.pathname || "/";
          navigate(from, { replace: true });
        }, 1200);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Your email has not been verified yet. Please check your inbox."
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "Error checking verification status. Please try again."
      });
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (cooldown > 0 || sending) return;
    setSending(true);
    setMessage(null);
    try {
      await resendVerificationEmail();
      setMessage({
        type: "success",
        text: "Verification email sent successfully! Please check your inbox and spam folder."
      });
      setCooldown(60);
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        setMessage({
          type: "error",
          text: "Too many requests sent. Please wait a few moments before trying again."
        });
      } else {
        setMessage({
          type: "error",
          text: err.message || "Failed to resend verification email."
        });
      }
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-12 animate-fade-in">
      <div className="w-full max-w-md glass-card bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
        {/* Top Header Graphic */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
          <Mail className="w-10 h-10 text-white animate-bounce" />
        </div>

        {/* Title & Email */}
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
          Verify Your Email 📧
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          We sent a verification link to:
        </p>

        <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl mb-6 inline-block font-mono text-xs font-bold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 max-w-full truncate">
          {user?.email || "your email address"}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          Please check your inbox (and spam folder), click the verification link inside, and then tap below to continue.
        </p>

        {/* Dynamic Alert Messages */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl mb-6 text-xs font-semibold flex items-center gap-2.5 text-left ${message.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={handleCheckStatus}
          disabled={checking}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mb-3"
        >
          {checking ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying status...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>I've Verified My Email</span>
            </>
          )}
        </button>

        {/* Resend Verification Button with Cooldown */}
        <button
          onClick={handleResendEmail}
          disabled={cooldown > 0 || sending}
          className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${sending ? "animate-spin" : ""}`} />
          {sending
            ? "Sending email..."
            : cooldown > 0
              ? `Resend available in ${cooldown}s`
              : "Didn't receive email? Resend Verification"}
        </button>

        {/* Sign Out Action Link */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out & Try Different Account
          </button>
        </div>
      </div>
    </div>
  );
}
