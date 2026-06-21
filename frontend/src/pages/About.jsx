import Sidebar from "../components/Sidebar";
import { Info, Users, Target, Rocket } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar activeItem="About Us" />

      <div className="flex-1 p-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
            <Info className="w-7 h-7 text-orange-500" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              About CareerVault
            </h1>
            <p className="text-gray-500 mt-1">
              Interview Knowledge Explorer for students and professionals.
            </p>
          </div>
        </div>

        {/* About Card */}
        <div className="bg-white border rounded-2xl p-8 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Who We Are
          </h2>

          <p className="text-gray-600 leading-7">
            CareerVault is a platform where students and professionals can
            explore interview experiences, company-wise questions and prepare
            effectively for placements. Our mission is to help everyone learn
            from real interview experiences shared by the community.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border rounded-2xl p-6 shadow-sm">
            <Users className="w-10 h-10 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Community</h3>
            <p className="text-gray-500">
              Students helping students by sharing interview experiences.
            </p>
          </div>

          <div className="border rounded-2xl p-6 shadow-sm">
            <Target className="w-10 h-10 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Mission</h3>
            <p className="text-gray-500">
              Make placement preparation easier and more accessible.
            </p>
          </div>

          <div className="border rounded-2xl p-6 shadow-sm">
            <Rocket className="w-10 h-10 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Growth</h3>
            <p className="text-gray-500">
              Continuously improving with contributions from users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}