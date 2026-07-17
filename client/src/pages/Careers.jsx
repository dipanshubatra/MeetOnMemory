import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Globe,
  Cpu,
  Shield,
  Heart,
  Award,
  Send,
  Upload,
  X,
  Sliders,
  Sparkles,
  DollarSign,
  Users
} from "lucide-react";

const Careers = () => {
  const [selectedDept, setSelectedDept] = useState("all");
  const [expandedRoleId, setExpandedRoleId] = useState(null);
  
  // Application Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    portfolio: "",
    coverLetter: "",
    role: "",
  });
  const [resumeName, setResumeName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showApplyPanel, setShowApplyPanel] = useState(false);

  const departments = [
    { id: "all", name: "All Jobs", icon: Briefcase },
    { id: "engineering", name: "Engineering", icon: Cpu },
    { id: "ai-research", name: "AI Research", icon: Sparkles },
    { id: "product-design", name: "Product & Design", icon: Sliders },
    { id: "operations-security", name: "Operations & Security", icon: Shield },
  ];

  const perks = [
    {
      title: "100% Remote Flexibility",
      description: "We are a fully distributed global workforce. Work from anywhere, using your own schedule.",
      icon: Globe,
    },
    {
      title: "Health & Mental Wellness",
      description: "Comprehensive medical, dental, and vision coverages with a dedicated mental health monthly stipend.",
      icon: Heart,
    },
    {
      title: "Learning & Growth Budget",
      description: "$2,000 annual allowance for books, conferences, technical courses, and certifications.",
      icon: Award,
    },
    {
      title: "Equity & Stock Plans",
      description: "Generous early-stage stock options for all full-time members to share in our joint success.",
      icon: DollarSign,
    },
    {
      title: "State-of-the-Art Gear",
      description: "We provide your choice of high-spec MacBook Pro, premium peripherals, and home office set-up funding.",
      icon: Cpu,
    },
    {
      title: "Global Team Retreats",
      description: "Bi-annual fully funded international meet-ups to align plans, brainstorm, and strengthen connections.",
      icon: Users,
    },
  ];

  const openPositions = [
    {
      id: "sr-full-stack",
      dept: "engineering",
      title: "Senior Full Stack Engineer",
      location: "Remote (Global)",
      type: "Full-Time",
      salary: "$120k - $150k + Equity",
      summary: "Lead the expansion of our collaborative React dashboard, backend API gateways, and multi-tenant isolation layers.",
      responsibilities: [
        "Architect and implement clean, high-performance dashboard interfaces using React, TailwindCSS, and state managers.",
        "Refactor API structures, optimize MongoDB queries, and build logical RBAC middlewares for secure tenant boundaries.",
        "Collaborate with AI engineers to streamline raw audio file stream uploads and serverless transcription jobs.",
        "Integrate asynchronous bullMQ queues and microservice components under Docker configurations.",
      ],
      requirements: [
        "5+ years of production experience in JavaScript/TypeScript ecosystems (Node.js, Express, React).",
        "Deep understanding of document database architectures (MongoDB) and session caching (Redis).",
        "Familiarity with containerized workflows (Docker, Kubernetes) and CI/CD pipelines (GitHub Actions).",
        "Strong passion for building beautiful, responsive, and secure SaaS interfaces.",
      ],
    },
    {
      id: "ai-speech",
      dept: "ai-research",
      title: "Speech Recognition & Audio AI Engineer",
      location: "Remote (Global)",
      type: "Full-Time",
      salary: "$140k - $170k + Equity",
      summary: "Refine speech-to-text accuracy, speaker diarization pipelines, and language localized transcription architectures.",
      responsibilities: [
        "Optimize our custom speech recognition models (Whisper/Faster-Whisper frameworks) for high-concurrency uploads.",
        "Design and deploy robust speaker diarization and audio separation modules to accurately identify distinct voices in group meetings.",
        "Implement real-time audio chunk stream processors using WebSockets and low-latency API connections.",
        "Perform comparative evaluation models to reduce word-error-rate (WER) across accents and dialects.",
      ],
      requirements: [
        "3+ years of experience deploying machine learning audio models into high-volume production systems.",
        "Proficiency with Python, PyTorch, Librosa, Hugging Face Hub, and GPU acceleration configurations (CUDA).",
        "Experience optimizing API inference speeds and running dockerized worker nodes in AWS/GCP clusters.",
        "Background in digital signal processing (DSP) and acoustics.",
      ],
    },
    {
      id: "llm-summaries",
      dept: "ai-research",
      title: "AI Summarization Research Scientist",
      location: "Remote (US/EU)",
      type: "Full-Time",
      salary: "$150k - $180k + Equity",
      summary: "Shape our meeting summarization prompts, RAG architectures, and custom MoM templates utilizing Large Language Models.",
      responsibilities: [
        "Develop advanced prompting techniques and fine-tune models to generate precise action items, decision logs, and summaries.",
        "Optimize retrieval-augmented generation (RAG) pipelines over Pinecone database vector indexes for natural language queries.",
        "Design automatic evaluation metrics to identify and prevent AI summaries hallucinations or data omissions.",
        "Collaborate with security teams to enforce compliance standards and prevent context leaks.",
      ],
      requirements: [
        "M.S. or Ph.D. in Computer Science, NLP, or equivalent industry research records.",
        "Hands-on experience with OpenAI APIs, Google Gemini API, LangChain frameworks, and vector search indices.",
        "Expertise in Python, pandas, transformers, and prompt engineering methods.",
        "Experience deploying NLP pipelines inside cloud-native systems.",
      ],
    },
    {
      id: "security-specialist",
      dept: "operations-security",
      title: "Security & Compliance Operations Specialist",
      location: "Remote (Global)",
      type: "Full-Time",
      salary: "$110k - $135k + Equity",
      summary: "Oversee security architecture policies, tenant isolation verification, and audit readiness for GDPR, SOC 2, and CCPA.",
      responsibilities: [
        "Conduct weekly static analysis scans, dependency updates, and internal penetration testing rounds.",
        "Write and maintain automated compliance checkers to verify logical organization boundaries in our database layers.",
        "Audit server infrastructure variables, access controls, and encryption keys configurations regularly.",
        "Collaborate with legal teams to prepare necessary SOC 2 Type II audit readiness parameters.",
      ],
      requirements: [
        "3+ years of experience in Cloud Security, SecOps, or Compliance auditing roles in fast-growing SaaS environments.",
        "Familiarity with cloud-based security configurations (AWS/GCP), OWASP Top 10 vulnerabilities, and security headers.",
        "Proficiency writing automated scripts (Node/Python) to query, test, and scan databases.",
        "Deep knowledge of GDPR, HIPAA, and ISO 27001 policies.",
      ],
    },
    {
      id: "product-designer",
      dept: "product-design",
      title: "Lead Product Designer (SaaS)",
      location: "Remote (Global)",
      type: "Full-Time",
      salary: "$115k - $140k + Equity",
      summary: "Own our UI/UX identity, design fluid meeting room transitions, and craft high-performance vector search interfaces.",
      responsibilities: [
        "Create high-fidelity interactive wireframes, layouts, and components inside Figma.",
        "Conduct user research interviews to optimize transcription review panels and workspace configuration layouts.",
        "Define typography, spacing grids, theme palettes, and animation curves in our Design System.",
        "Work directly with React developers to verify CSS compliance, accessibility standards (WCAG), and responsive rendering.",
      ],
      requirements: [
        "4+ years designing premium, interactive dashboards or web tools. A strong portfolio is required.",
        "Expertise in Figma, modern prototyping tools, micro-animations, and vector illustrations.",
        "Basic understanding of HTML/CSS limits and React component frameworks.",
        "Exceptional attention to visual grid details, dark modes, and subtle states.",
      ],
    },
  ];

  // Filter positions by selected department
  const filteredPositions = useMemo(() => {
    if (selectedDept === "all") return openPositions;
    return openPositions.filter((pos) => pos.dept === selectedDept);
  }, [selectedDept]);

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Simulate file selection
  const handleResumeSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeName(file.name);
    }
  };

  // Clear simulated file
  const handleClearResume = () => {
    setResumeName("");
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setShowApplyPanel(false);
      setFormData({
        fullName: "",
        email: "",
        portfolio: "",
        coverLetter: "",
        role: "",
      });
      setResumeName("");
    }, 3500);
  };

  // Trigger apply panel for a specific role
  const handleApplyClick = (roleTitle) => {
    setFormData((prev) => ({
      ...prev,
      role: roleTitle,
    }));
    setShowApplyPanel(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <header className="relative bg-linear-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white pt-32 pb-24 overflow-hidden border-b border-indigo-950">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5" /> We are hiring
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Build the Future of Meeting Memory
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-indigo-200/90 leading-relaxed">
            Help us engineer low-latency transcription services, multi-tenant vector databases, and zero-retention AI minutes-of-meeting assistants.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="#openings-section"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-500/20 hover:scale-103"
            >
              Explore Open Roles
            </a>
            <a
              href="#perks-section"
              className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm rounded-xl transition"
            >
              Our Culture
            </a>
          </div>
        </div>
      </header>

      {/* Perks & Benefits Section */}
      <section id="perks-section" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Perks & Compensation
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            We value excellence and reward it. From complete autonomy in planning your hours to learning allowance packages, we give you all tools required to thrive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perks.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4 hover:border-blue-500/40 dark:hover:border-blue-450/40 transition duration-200"
              >
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl inline-block">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  {perk.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                  {perk.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Openings Section */}
      <section id="openings-section" className="bg-slate-100 dark:bg-slate-900/50 border-y border-gray-200/50 dark:border-slate-850 py-20">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Available Openings
              </h2>
              <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                Filter by department to locate relevant team roles.
              </p>
            </div>

            {/* Department Filters */}
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => {
                const Icon = dept.icon;
                const isSelected = selectedDept === dept.id;
                return (
                  <button
                    key={dept.id}
                    onClick={() => {
                      setSelectedDept(dept.id);
                      setExpandedRoleId(null);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                        : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-slate-700/60 hover:bg-gray-50 dark:hover:bg-slate-750"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {dept.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Positions Accordion */}
          <div className="space-y-4">
            {filteredPositions.length === 0 ? (
              <div className="text-center bg-white dark:bg-slate-800 rounded-2xl py-12 border border-gray-100 dark:border-slate-800">
                <Briefcase className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h4 className="font-bold text-gray-800 dark:text-white">No active roles in this department</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Check back soon or send us a general application.
                </p>
              </div>
            ) : (
              filteredPositions.map((pos) => {
                const isOpen = expandedRoleId === pos.id;
                return (
                  <div
                    key={pos.id}
                    className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition"
                  >
                    {/* Header summary button */}
                    <button
                      onClick={() => setExpandedRoleId(isOpen ? null : pos.id)}
                      className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 text-left transition gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-sm uppercase tracking-wider">
                            {pos.dept}
                          </span>
                          <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-450 rounded-sm">
                            {pos.type}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                          {pos.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 max-w-xl">
                          {pos.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-gray-100 dark:border-slate-700 pt-4 sm:pt-0 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold block uppercase">
                            Salary Range
                          </span>
                          <span className="text-xs font-semibold text-gray-800 dark:text-slate-300 block mt-0.5">
                            {pos.salary}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-blue-650 dark:text-blue-400 flex items-center gap-0.5">
                            Details <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Expanded specs details */}
                    {isOpen && (
                      <div className="p-6 border-t border-gray-100 dark:border-slate-750 bg-slate-50/30 dark:bg-slate-800/40 space-y-6">
                        
                        {/* Responsibilities list */}
                        <div className="space-y-2">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 dark:text-slate-500">
                            Key Responsibilities
                          </h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-650 dark:text-slate-350">
                            {pos.responsibilities.map((resp, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Requirements list */}
                        <div className="space-y-2">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 dark:text-slate-500">
                            Requirements & Qualifications
                          </h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-650 dark:text-slate-350">
                            {pos.requirements.map((req, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Apply Trigger CTA */}
                        <div className="pt-4 border-t border-gray-100 dark:border-slate-750/70 flex justify-between items-center gap-4">
                          <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {pos.location}
                          </span>

                          <button
                            onClick={() => handleApplyClick(pos.title)}
                            className="px-5 py-2.5 bg-blue-650 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition"
                          >
                            Apply For This Role
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      </section>

      {/* Apply Form Panel (Modal Overlay style) */}
      {showApplyPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-fade-in">
            
            <button
              onClick={() => setShowApplyPanel(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-250 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" /> Apply for Position
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">
              Active Role: <b className="text-blue-600 dark:text-blue-400">{formData.role}</b>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-450 dark:text-slate-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                  className="block w-full px-3.5 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-450 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                  className="block w-full px-3.5 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-450 dark:text-slate-400 mb-1.5">
                  Portfolio / GitHub URL
                </label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username"
                  required
                  className="block w-full px-3.5 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Simulated Resume Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-450 dark:text-slate-400 mb-1.5">
                  Resume Attachment (PDF/DOC)
                </label>
                {resumeName ? (
                  <div className="flex items-center justify-between p-2.5 border border-emerald-150 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/20 rounded-xl text-xs text-emerald-800 dark:text-emerald-400">
                    <span className="font-semibold truncate">{resumeName}</span>
                    <button
                      type="button"
                      onClick={handleClearResume}
                      className="text-gray-400 hover:text-rose-500 p-0.5 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative border border-dashed border-gray-250 dark:border-slate-700 rounded-xl p-4.5 text-center bg-gray-50/50 dark:bg-slate-900/30">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeSelect}
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
                    <span className="text-xs text-gray-400 dark:text-slate-500 block">
                      Click or drag file here to attach
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-450 dark:text-slate-400 mb-1.5">
                  Brief Cover Letter (Optional)
                </label>
                <textarea
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Introduce yourself and explain why you'd fit the role."
                  className="block w-full px-3.5 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-150 dark:border-slate-750">
                <button
                  type="button"
                  onClick={() => setShowApplyPanel(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-350 text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitted}
                  className="flex-1 px-4 py-2.5 bg-blue-650 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> {isSubmitted ? "Sending..." : "Submit Application"}
                </button>
              </div>

              {isSubmitted && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 rounded-xl text-xs text-emerald-850 dark:text-emerald-400 text-center animate-fade-in">
                  Application successfully sent! We will review your info within 4 days.
                </div>
              )}

            </form>

          </div>
        </div>
      )}

      {/* Footer bar */}
      <footer className="bg-gray-100 dark:bg-slate-950 border-t border-gray-200/80 dark:border-slate-800/80 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm text-gray-550 dark:text-slate-450">
            Have questions about standard contract clauses or DPA agreements?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-semibold">
            <Link
              to="/contact"
              className="px-4 py-2 border border-gray-200 dark:border-slate-850 rounded-lg text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
            >
              Contact Recruiting Team
            </Link>
            <Link
              to="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Careers;
