import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChefHat,
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  Activity,
  ShoppingCart,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, profile, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Meal Finder", path: "/meals", icon: UtensilsCrossed },
    { name: "Planner", path: "/planner", icon: CalendarDays },
    { name: "Tracker", path: "/tracker", icon: Activity },
    { name: "Groceries", path: "/grocery", icon: ShoppingCart },
    { name: "AI Assistant", path: "/ai", icon: Sparkles, badge: "AI" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">MealFinder</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 -mt-1 hidden sm:block">AI Nutrition & Planner</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700/60"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-zinc-400"}`} />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-sm transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-semibold text-xs">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-medium text-white leading-tight">{user?.name}</p>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      {profile?.dailyCalorieTarget || 2000} kcal/day
                    </p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>

                {/* Mobile menu trigger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-white md:hidden"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-sm shadow-emerald-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-zinc-800 text-emerald-400"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-zinc-950">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900"
          >
            <User className="w-5 h-5" />
            <span>Profile & Nutrition Goals</span>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
