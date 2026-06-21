import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import CompanyCard from "../components/CompanyCard";
import { useAppContext } from "../context/AppContext";
import { getCompanies } from "../api/api";

const Companies = () => {
  const { searchQuery, setSearchQuery } = useAppContext();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCompanies(); // array of name strings
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

  const handleViewDetails = (companyName) => {
    navigate(`/companies/${companyName}`);
  };

  const getInitial = (name) => name.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-500 mt-1">
              Browse interview experiences by company
            </p>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((name) => (
                  <CompanyCard
                    key={name}
                    name={name}
                    interviews={null}
                    logo={
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-gray-100 text-gray-700">
                        {getInitial(name)}
                      </span>
                    }
                    onViewDetails={() => handleViewDetails(name)}
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