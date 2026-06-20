import { AppProvider } from "./context/AppContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Questions from "./pages/Questions";
import OAPrep from "./pages/OAPrep";
import Bookmarks from "./pages/Bookmarks";

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:companyName" element={<CompanyDetail />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/oa-prep" element={<OAPrep />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;