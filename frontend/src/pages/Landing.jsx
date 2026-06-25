import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Search,
  Building2,
  MessageSquareText,
  ListChecks,
  Lightbulb,
  Archive,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

/* ───────────────────────── Particle Network Background ───────────────────────── */
function ParticleNetwork() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 55;
    particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(249,115,22,${0.15 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(249,115,22,0.55)";
        ctx.shadowColor = "rgba(249,115,22,0.8)";
        ctx.shadowBlur = 6;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-60"
    />
  );
}

/* ───────────────────────── Animated Counter ───────────────────────── */
function AnimatedCounter({ target, suffix = "", duration = 1500 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ───────────────────────── Hero Network Graph (SVG) ───────────────────────── */
function HeroGraph() {
  const companies = [
    { name: "Google", x: 60, y: 60 },
    { name: "Amazon", x: 540, y: 60 },
    { name: "Oracle", x: 60, y: 220 },
    { name: "Morgan Stanley", x: 540, y: 220 },
  ];
  const center = { x: 300, y: 140 };

  return (
    <svg viewBox="0 0 600 280" className="w-full max-w-xl mx-auto">
      {companies.map((c, i) => (
        <motion.line
          key={`line-${i}`}
          x1={c.x}
          y1={c.y}
          x2={center.x}
          y2={center.y}
          stroke="rgba(249,115,22,0.35)"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 + i * 0.15 }}
        />
      ))}

      {/* Center node */}
      <motion.circle
        cx={center.x}
        cy={center.y}
        r="34"
        fill="rgba(249,115,22,0.15)"
        stroke="#F97316"
        strokeWidth="2"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <text
        x={center.x}
        y={center.y + 4}
        textAnchor="middle"
        fill="#F97316"
        fontSize="11"
        fontWeight="700"
      >
        CareerVault
      </text>

      {companies.map((c, i) => (
        <g key={c.name}>
          <motion.circle
            cx={c.x}
            cy={c.y}
            r="22"
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(249,115,22,0.5)"
            strokeWidth="1.5"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: [0, i % 2 === 0 ? 4 : -4, 0],
              y: [0, i < 2 ? -4 : 4, 0],
            }}
            transition={{
              opacity: { duration: 0.6, delay: i * 0.15 },
              scale: { duration: 0.6, delay: i * 0.15 },
              x: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          <text
            x={c.x}
            y={c.y + 38}
            textAnchor="middle"
            fill="#D1D5DB"
            fontSize="11"
            fontWeight="500"
          >
            {c.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ───────────────────────── Section 2: Animated Search Demo ───────────────────────── */
const demoCompanies = [
  { name: "Google", experiences: 120, questions: 450 },
  { name: "Oracle", experiences: 75, questions: 220 },
  { name: "Morgan Stanley", experiences: 90, questions: 310 },
];

function SearchDemo() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("typing"); // typing | showing | deleting

  useEffect(() => {
    const current = demoCompanies[index].name;
    let timeout;

    if (phase === "typing") {
      if (typed.length < current.length) {
        timeout = setTimeout(() => setTyped(current.slice(0, typed.length + 1)), 90);
      } else {
        timeout = setTimeout(() => setPhase("showing"), 1400);
      }
    } else if (phase === "showing") {
      timeout = setTimeout(() => setPhase("deleting"), 1800);
    } else if (phase === "deleting") {
      if (typed.length > 0) {
        timeout = setTimeout(() => setTyped(typed.slice(0, -1)), 40);
      } else {
        setIndex((prev) => (prev + 1) % demoCompanies.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout);
  }, [typed, phase, index]);

  const current = demoCompanies[index];

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-5 py-4 mb-6">
        <Search size={18} className="text-orange-400 flex-shrink-0" />
        <span className="text-gray-200 text-lg font-medium">
          {typed}
          <span className="inline-block w-0.5 h-5 bg-orange-400 ml-1 animate-pulse" />
        </span>
      </div>

      <AnimatePresence mode="wait">
        {phase === "showing" && (
          <motion.div
            key={current.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center gap-3 bg-white/5 border border-orange-500/20 rounded-xl px-5 py-4">
              <CheckCircle2 size={18} className="text-orange-400" />
              <div>
                <p className="text-white font-bold text-lg">
                  {current.experiences}
                </p>
                <p className="text-gray-400 text-xs">Experiences</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-orange-500/20 rounded-xl px-5 py-4">
              <CheckCircle2 size={18} className="text-orange-400" />
              <div>
                <p className="text-white font-bold text-lg">
                  {current.questions}
                </p>
                <p className="text-gray-400 text-xs">Questions</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── Section 3: Journey Timeline ───────────────────────── */
const journeySteps = [
  "Online Assessment",
  "Technical Round",
  "System Design",
  "HR Round",
  "Selected 🎉",
];

function JourneyTimeline() {
  return (
    <div className="max-w-md mx-auto space-y-0">
      {journeySteps.map((step, i) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: i * 0.15 }}
          className="flex items-center gap-4"
        >
          <div className="flex flex-col items-center">
            <div
              className={`w-4 h-4 rounded-full flex-shrink-0 ${
                i === journeySteps.length - 1
                  ? "bg-green-400 shadow-[0_0_12px_3px_rgba(74,222,128,0.6)]"
                  : "bg-orange-500 shadow-[0_0_12px_3px_rgba(249,115,22,0.5)]"
              }`}
            />
            {i < journeySteps.length - 1 && (
              <div className="w-0.5 h-12 bg-gradient-to-b from-orange-500/50 to-transparent" />
            )}
          </div>
          <div
            className={`flex-1 mb-${
              i < journeySteps.length - 1 ? "8" : "0"
            } bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl px-5 py-3.5`}
          >
            <p className="text-gray-100 font-medium text-sm">{step}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────────────────── Section 5: Feature Cards ───────────────────────── */
const features = [
  { icon: Building2, title: "Company Search", desc: "Browse 500+ companies with real, verified interview data." },
  { icon: MessageSquareText, title: "Interview Questions", desc: "Thousands of actual questions, not generic question banks." },
  { icon: ListChecks, title: "Round Analysis", desc: "Understand exactly what each round tests and how it flows." },
  { icon: Lightbulb, title: "Preparation Tips", desc: "Learn directly from candidates who cleared the process." },
  { icon: Archive, title: "Experience Archive", desc: "Every shared experience preserved, searchable, and structured." },
];

function FeatureCard({ icon: Icon, title, desc, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, rotateX: 4, rotateY: -4 }}
      style={{ transformStyle: "preserve-3d" }}
      className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 group hover:border-orange-500/40 transition-colors cursor-default"
    >
      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
        <Icon size={22} className="text-orange-400" />
      </div>
      <h3 className="text-white font-bold text-base mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ───────────────────────── Magnetic Button ───────────────────────── */
function MagneticButton({ children, className = "", to, onClick }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
    setPos({ x, y });
  };

  const handleMouseLeave = () => setPos({ x: 0, y: 0 });

  const content = (
    <motion.span
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 12 }}
      className={`inline-flex ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.span>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

/* ───────────────────────── Main Landing Page ───────────────────────── */
export default function Landing() {
  return (
    <div className="bg-[#0B0B14] text-white overflow-x-hidden">
      {/* SECTION 1 — HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <ParticleNetwork />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <Sparkles size={14} className="text-orange-400" />
          <span className="text-xs font-medium text-gray-300">
            Real interview intelligence, not guesswork
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative z-10 text-4xl md:text-6xl lg:text-7xl font-extrabold text-center leading-tight max-w-4xl mb-6"
        >
          Crack Interviews With{" "}
          <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            Real Experiences
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 text-gray-400 text-center max-w-xl mb-10 text-base md:text-lg"
        >
          Search companies, explore real interview rounds, discover actual
          questions, and prepare smarter with insights shared by successful
          candidates.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative z-10 flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <MagneticButton to="/companies">
            <span className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3.5 rounded-xl shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-colors">
              Explore Experiences
              <ArrowRight size={16} />
            </span>
          </MagneticButton>
          <MagneticButton to="/login">
            <span className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold px-7 py-3.5 rounded-xl backdrop-blur-xl transition-colors">
              Login
            </span>
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 w-full"
        >
          <HeroGraph />
        </motion.div>
      </section>

      {/* SECTION 2 — SEARCH DEMO */}
      <section className="relative py-28 px-6 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Search Once. Know Everything.
          </h2>
          <p className="text-gray-400">
            Type a company, get instant clarity on what to expect.
          </p>
        </motion.div>
        <SearchDemo />
      </section>

      {/* SECTION 3 — JOURNEY TIMELINE */}
      <section className="relative py-28 px-6 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Follow the Real Interview Journey
          </h2>
          <p className="text-gray-400">
            From assessment to offer — see exactly how it unfolds.
          </p>
        </motion.div>
        <JourneyTimeline />
      </section>

      {/* SECTION 4 — STATS */}
      <section className="relative py-28 px-6 border-t border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
          {[
            { value: 500, suffix: "+", label: "Companies" },
            { value: 10000, suffix: "+", label: "Interview Questions" },
            { value: 2000, suffix: "+", label: "Experiences" },
            { value: 95, suffix: "%", label: "Student Satisfaction" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — FEATURES */}
      <section className="relative py-28 px-6 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Everything You Need to Prepare
          </h2>
          <p className="text-gray-400">
            One platform, built entirely from real candidate data.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* SECTION 6 — FINAL CTA */}
      <section className="relative py-32 px-6 border-t border-white/5 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            Stop Guessing Interviews.
            <br />
            Start Preparing With Real Data.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <MagneticButton to="/login">
              <span className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl shadow-[0_0_40px_rgba(249,115,22,0.45)] transition-colors">
                Get Started
                <ArrowRight size={16} />
              </span>
            </MagneticButton>
            <MagneticButton to="/companies">
              <span className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold px-8 py-4 rounded-xl backdrop-blur-xl transition-colors">
                Explore Companies
              </span>
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      <footer className="text-center text-gray-500 text-xs py-8 border-t border-white/5">
        © {new Date().getFullYear()} CareerVault. Built from real interview experiences.
      </footer>
    </div>
  );
}