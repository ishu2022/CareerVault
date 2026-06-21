import Sidebar from "../components/Sidebar";
import { Rocket } from "lucide-react";

export default function Contribute() {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar activeItem="Contribute" />

      <div className="flex-1 p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <Rocket className="w-6 h-6 text-orange-500" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Contribute
            </h1>
            <p className="text-gray-500">
              Share your interview experience and help others.
            </p>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Submit Interview Experience
          </h2>

          <input
            type="text"
            placeholder="Company Name"
            className="w-full border rounded-lg px-4 py-3 mb-4"
          />

          <input
            type="text"
            placeholder="Role"
            className="w-full border rounded-lg px-4 py-3 mb-4"
          />

          <textarea
            rows="6"
            placeholder="Write your interview experience..."
            className="w-full border rounded-lg px-4 py-3 mb-4"
          ></textarea>

          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}