import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CompanyCard from "../components/CompanyCard";
import { useAppContext } from "../context/AppContext";
import { getCompanies } from "../api/api";
import CompanyLogo from "../components/CompanyLogo";

const Companies = () => {
  const { searchQuery, setSearchQuery } = useAppContext();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCompanies();
        setCompanies(data);
      } catch (err) {
        setError("Failed to load companies. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((name) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMobileMenuOpen={() => setMobileOpen(true)} />

        <main className="p-4 md:p-6 lg:p-8">
          <div className="mb-5 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Browse interview experiences by company
            </p>
          </div>

          <div className="mb-5 md:mb-6">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 px-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-orange-400
                         text-sm text-gray-700"
            />
          </div>

          {loading && (
            <p className="text-gray-500 text-sm">Loading companies...</p>
          )}

          {!loading && error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((name) => (
                  <CompanyCard
                    key={name}
                    name={name}
                    interviews={null}
                    logo={<CompanyLogo name={name} />}
                    onViewDetails={() => navigate(`/companies/${name}`)}
                  />
                ))
              ) : (
                <p className="text-gray-500 col-span-full text-center mt-10">
                  No companies found matching "{searchQuery}"
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Companies;