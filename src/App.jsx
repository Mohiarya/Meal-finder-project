import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Pages
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import MealFinderPage from "./pages/MealFinderPage";
import PlannerPage from "./pages/PlannerPage";
import TrackerPage from "./pages/TrackerPage";
import GroceryPage from "./pages/GroceryPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/OnboardingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Onboarding Flow */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Core Authenticated & Public Hybrid Routes */}
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/home"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meals"
            element={
              <ProtectedRoute>
                <Layout>
                  <MealFinderPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <Layout>
                  <PlannerPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracker"
            element={
              <ProtectedRoute>
                <Layout>
                  <TrackerPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/grocery"
            element={
              <ProtectedRoute>
                <Layout>
                  <GroceryPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <Layout>
                  <AIAssistantPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
