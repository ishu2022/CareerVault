import { AppProvider } from "./context/AppContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Questions from "./pages/Questions";
import OAPrep from "./pages/OAPrep";
import Bookmarks from "./pages/Bookmarks";
import Contribute from "./pages/Contribute";
import About from "./pages/About";

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>

          {/* Login Page */}
          <Route path="/" element={<Login />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Other Pages */}
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:companyName" element={<CompanyDetail />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/oa-prep" element={<OAPrep />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/contribute" element={<Contribute />} />
          <Route path="/about" element={<About />} />

        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;