import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, BookOpen } from "lucide-react";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, provider } from "../firebase";

const stats = [
  { value: "28", label: "Companies" },
  { value: "123", label: "Interviews" },
  { value: "998", label: "Questions" },
  { value: "190", label: "Interview Rounds" },
];

function InterviewIllustration() {
  return (
    <svg viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md">
      <rect x="90" y="30" width="240" height="160" rx="12" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <rect x="100" y="40" width="220" height="140" rx="8" fill="#0F172A" />
      <rect x="190" y="190" width="40" height="24" rx="4" fill="#1E293B" />
      <rect x="165" y="212" width="90" height="8" rx="4" fill="#334155" />

      <rect x="116" y="58" width="60" height="6" rx="3" fill="#F97316" opacity="0.8" />
      <rect x="116" y="72" width="100" height="5" rx="2.5" fill="#3B82F6" opacity="0.7" />
      <rect x="124" y="85" width="80" height="5" rx="2.5" fill="#10B981" opacity="0.7" />
      <rect x="124" y="98" width="60" height="5" rx="2.5" fill="#8B5CF6" opacity="0.7" />
      <rect x="116" y="111" width="90" height="5" rx="2.5" fill="#3B82F6" opacity="0.7" />
      <rect x="124" y="124" width="50" height="5" rx="2.5" fill="#F97316" opacity="0.6" />
      <rect x="124" y="137" width="70" height="5" rx="2.5" fill="#10B981" opacity="0.6" />
      <rect x="116" y="150" width="40" height="5" rx="2.5" fill="#F97316" opacity="0.8" />

      <rect x="228" y="58" width="80" height="118" rx="6" fill="#1E293B" stroke="#334155" strokeWidth="1" />
      <rect x="236" y="68" width="50" height="5" rx="2.5" fill="#94A3B8" opacity="0.6" />
      {[84, 100, 116, 132, 148].map((y, i) => (
        <g key={i}>
          <circle cx="242" cy={y} r="5" fill={i < 3 ? "#F97316" : "#1E293B"} stroke={i < 3 ? "#F97316" : "#334155"} strokeWidth="1.2" />
          {i < 3 && <path d={`M${239} ${y} l2.5 2.5 4-4`} stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />}
          <rect x="252" cy={y} y={y - 2.5} width={i % 2 === 0 ? 40 : 28} height="5" rx="2.5" fill="#334155" opacity="0.8" />
        </g>
      ))}

      <rect x="30" y="50" width="78" height="56" rx="10" fill="rgba(249,115,22,0.13)" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />
      <circle cx="52" cy="68" r="10" fill="rgba(249,115,22,0.25)" />
      <path d="M47 68 l3.5 3.5 6-6" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="42" y="84" width="38" height="4" rx="2" fill="#F97316" opacity="0.5" />
      <rect x="48" y="92" width="26" height="3" rx="1.5" fill="#94A3B8" opacity="0.4" />

      <rect x="362" y="80" width="50" height="60" rx="10" fill="rgba(59,130,246,0.13)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
      <circle cx="387" cy="100" r="9" fill="rgba(59,130,246,0.25)" />
      <path d="M382 100 h10 M387 95 v10" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="373" y="116" width="28" height="4" rx="2" fill="#3B82F6" opacity="0.5" />
      <rect x="377" y="124" width="20" height="3" rx="1.5" fill="#94A3B8" opacity="0.4" />

      <circle cx="210" cy="252" r="18" fill="#1E293B" stroke="#F97316" strokeWidth="1.5" />
      <circle cx="210" cy="247" r="7" fill="#334155" />
      <path d="M193 270 q0-14 17-14 q17 0 17 14" fill="#334155" />

      <circle cx="240" cy="230" r="4" fill="#F97316" opacity="0.4" />
      <circle cx="252" cy="220" r="5.5" fill="#F97316" opacity="0.3" />
      <rect x="260" y="202" width="60" height="32" rx="8" fill="rgba(249,115,22,0.15)" stroke="rgba(249,115,22,0.35)" strokeWidth="1" />
      <rect x="267" y="210" width="20" height="4" rx="2" fill="#F97316" opacity="0.6" />
      <rect x="267" y="218" width="36" height="4" rx="2" fill="#94A3B8" opacity="0.5" />
      <rect x="267" y="226" width="28" height="4" rx="2" fill="#94A3B8" opacity="0.4" />

      {[
        [60, 190], [75, 200], [60, 210],
        [355, 190], [370, 200], [355, 210],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="#F97316" opacity="0.25" />
      ))}
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
    }
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* ── LEFT SECTION ── */}
      <div
        className="w-full md:w-[40%] flex flex-col justify-center px-8 py-12 md:px-14"
        style={{ background: "#0B0B18" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#F97316,#EA580C)" }}>
            <BookOpen size={18} color="white" strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-white font-bold text-lg leading-none">CareerVault</span>
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>Interview Knowledge Explorer</p>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back 👋</h1>
        <p className="text-sm mb-8" style={{ color: "#9CA3AF" }}>
          Sign in to continue your interview preparation journey.
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.25)" }}>
            {error}
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#9CA3AF" }}>Email Address</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }}>
              <Mail size={16} />
            </span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none border transition-all focus:border-orange-500"
              style={{ background: "#111827", borderColor: "#1F2937" }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#9CA3AF" }}>Password</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }}>
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none border transition-all focus:border-orange-500"
              style={{ background: "#111827", borderColor: "#1F2937" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-orange-400"
              style={{ color: "#6B7280" }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Forgot */}
        <div className="flex justify-end mb-6">
          <button className="text-xs font-medium transition-colors hover:text-orange-300" style={{ color: "#F97316" }}>
            Forgot Password?
          </button>
        </div>

        {/* Sign In button — now wired to real Firebase email/password auth */}
        <button
          onClick={handleEmailLogin}
          disabled={submitting}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white mb-5 transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg,#F97316,#EA580C)",
            boxShadow: "0 4px 24px rgba(249,115,22,0.3)"
          }}
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: "#1F2937" }} />
          <span className="text-xs" style={{ color: "#4B5563" }}>OR</span>
          <div className="flex-1 h-px" style={{ background: "#1F2937" }} />
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium text-white border transition-all hover:border-gray-500 hover:bg-white/5 mb-6"
          style={{ borderColor: "#1F2937", background: "transparent" }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        {/* Sign up link */}
        <p className="text-center text-sm" style={{ color: "#6B7280" }}>
          Don't have an account?{" "}
          <button className="font-semibold transition-colors hover:text-orange-300" style={{ color: "#F97316" }}>
            Sign Up
          </button>
        </p>
      </div>

      {/* ── RIGHT SECTION ── */}
      <div
        className="w-full md:w-[60%] flex flex-col items-center justify-center px-8 py-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#111827 0%,#1F2937 100%)" }}
      >
        <div
          className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(249,115,22,0.18) 0%,transparent 70%)", filter: "blur(40px)" }}
        />
        <div
          className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(249,115,22,0.12) 0%,transparent 70%)", filter: "blur(40px)" }}
        />

        <div className="absolute top-10 right-10 w-24 h-24 rounded-full border pointer-events-none" style={{ borderColor: "rgba(249,115,22,0.1)" }} />
        <div className="absolute top-16 right-16 w-12 h-12 rounded-full border pointer-events-none" style={{ borderColor: "rgba(249,115,22,0.15)" }} />
        <div className="absolute bottom-16 left-10 w-16 h-16 rounded-full border pointer-events-none" style={{ borderColor: "rgba(249,115,22,0.1)" }} />

        <div className="text-center mb-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">
            Ace Your Next{" "}
            <span style={{ background: "linear-gradient(90deg,#F97316,#FBBF24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Interview
            </span>
          </h2>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "#9CA3AF" }}>
            Explore company experiences, interview questions and prepare smarter.
          </p>
        </div>

        <div className="w-full max-w-md mb-8 relative z-10 drop-shadow-2xl">
          <InterviewIllustration />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg relative z-10">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center py-4 px-3 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-orange-900/20 hover:shadow-lg"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(12px)",
                borderColor: "rgba(249,115,22,0.18)",
              }}
            >
              <span
                className="text-2xl font-extrabold leading-none mb-1"
                style={{ background: "linear-gradient(135deg,#F97316,#FBBF24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                {value}
              </span>
              <span className="text-xs text-center leading-snug" style={{ color: "#9CA3AF" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}