import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home          from "./pages/Home";
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import Dashboard     from "./pages/Dashboard";
import Companies     from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";   // ← add

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                       element={<Home />} />
        <Route path="/login"                  element={<Login />}         />
        <Route path="/register"               element={<Register />}      />
        <Route path="/dashboard"              element={<Dashboard />}     />
        <Route path="/companies"              element={<Companies />}     />
        <Route path="/companies/:companyName" element={<CompanyDetail />} />  {/* ← add */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;