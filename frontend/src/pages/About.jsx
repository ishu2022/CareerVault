import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { Users, Target, Rocket, Heart, ArrowRight, Building2, MessageSquare } from "lucide-react";

const values = [
  {
    icon: Users,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    title: "Community",
    description: "Built by students, for students — every question and experience here was shared by someone who walked the same path.",
  },
  {
    icon: Target,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    title: "Mission",
    description: "Make placement preparation transparent and accessible, replacing guesswork with real, company-specific insights.",
  },
  {
    icon: Rocket,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    title: "Growth",
    description: "Every contribution makes the platform stronger — we grow entirely through the community that uses it.",
  },
];

export default function About() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMobileMenuOpen={() => setMobileOpen(true)} />

        <main className="p-4 md:p-6 lg:p-8 max-w-5xl">
          {/* Hero */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 md:p-10 mb-6 md:mb-8 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full" />
            <div className="absolute right-16 bottom-0 w-24 h-24 bg-white/10 rounded-full" />

            <div className="relative z-10 max-w-2xl">
              <span className="inline-block text-xs font-semibold bg-white/20 px-3 py-1 rounded-full mb-4">
                Interview Knowledge Explorer
              </span>
              <h1 className="text-2xl md:text-3xl font-bold mb-3">About CareerVault</h1>
              <p className="text-orange-50 text-sm md:text-base leading-relaxed">
                We help students and professionals prepare smarter — by turning
                real interview experiences into searchable, structured knowledge.
              </p>
            </div>
          </div>

          {/* Who We Are */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-8 shadow-sm mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Heart size={18} className="text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900">Who We Are</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              CareerVault is a platform where students and professionals explore
              real interview experiences, browse company-specific questions, and
              prepare effectively for placements. Instead of relying on outdated
              or generic question banks, every piece of content here comes from
              someone who actually sat through that interview — making your
              preparation grounded in reality, not guesswork.
            </p>
          </div>

          {/* Value cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4 ${v.iconBg}`}>
                    <Icon size={20} className={v.iconColor} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Building2 size={20} className="text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  Have an interview experience to share?
                </h3>
                <p className="text-sm text-gray-500">
                  Your contribution could help the next candidate walk in prepared.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/contribute")}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors whitespace-nowrap w-full sm:w-auto justify-center"
            >
              Contribute Now
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Feedback note */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-5 md:mt-6">
            <MessageSquare size={14} />
            Have feedback or suggestions? Use the Feedback link in the sidebar.
          </div>
        </main>
      </div>
    </div>
  );
}