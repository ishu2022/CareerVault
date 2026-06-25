import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Questions from "./pages/Questions";
import OAPrep from "./pages/OAPrep";
import Bookmarks from "./pages/Bookmarks";
import Contribute from "./pages/Contribute";
import About from "./pages/About";
import MockTest from "./pages/MockTest";
import Landing from "./pages/Landing";

// Replace the existing redirect route:


function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            {/* Default route redirects to dashboard; ProtectedRoute below handles auth check */}
            <Route path="/" element={<Landing />} />

            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <ProtectedRoute>
                  <Companies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/companies/:companyName"
              element={
                <ProtectedRoute>
                  <CompanyDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/questions"
              element={
                <ProtectedRoute>
                  <Questions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/oa-prep"
              element={
                <ProtectedRoute>
                  <OAPrep />
                </ProtectedRoute>
              }
            />
            <Route
              path="/oa-prep/mock"
              element={
                <ProtectedRoute>
                  <MockTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookmarks"
              element={
                <ProtectedRoute>
                  <Bookmarks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contribute"
              element={
                <ProtectedRoute>
                  <Contribute />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;