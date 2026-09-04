import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 MealFinder AI Nutrition Platform.</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Powered by a curated recipe database & a deterministic recommendation engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
