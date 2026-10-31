import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, ArrowUp, Send, CheckCircle2, Heart } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 mt-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Intro Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Newspaper className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white font-serif-headline tracking-tight">
                News <span className="text-blue-400">App</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your modern destination for real-time global news aggregation, breaking stories, and curated daily updates across business, tech, sports, and science.
            </p>

            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Stay Updated
              </div>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 p-3 rounded-xl border border-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  Thanks for subscribing to News App Digest!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  All News Feed
                </Link>
              </li>
              <li>
                <Link to="/top-headlines/general" className="hover:text-blue-400 transition-colors">
                  Top Headlines
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-blue-400 transition-colors">
                  Saved Bookmarks
                </Link>
              </li>
              <li>
                <Link to="/country/us" className="hover:text-blue-400 transition-colors">
                  United States News
                </Link>
              </li>
              <li>
                <Link to="/country/in" className="hover:text-blue-400 transition-colors">
                  India News
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/top-headlines/technology" className="hover:text-blue-400 transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/top-headlines/business" className="hover:text-blue-400 transition-colors">
                  Business
                </Link>
              </li>
              <li>
                <Link to="/top-headlines/sports" className="hover:text-blue-400 transition-colors">
                  Sports
                </Link>
              </li>
              <li>
                <Link to="/top-headlines/entertainment" className="hover:text-blue-400 transition-colors">
                  Entertainment
                </Link>
              </li>
              <li>
                <Link to="/top-headlines/science" className="hover:text-blue-400 transition-colors">
                  Science
                </Link>
              </li>
            </ul>
          </div>

          {/* Info Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <span className="hover:text-slate-300 cursor-pointer">Live API Sync</span>
              </li>
              <li>
                <span className="hover:text-slate-300 cursor-pointer">Dark Mode Support</span>
              </li>
              <li>
                <span className="hover:text-slate-300 cursor-pointer">Offline Bookmarks</span>
              </li>
              <li>
                <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="flex items-center gap-1">
            Copyright &copy; {new Date().getFullYear()} News App. All Rights are Reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
