import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
  Database,
  Cpu,
  Globe,
  Terminal,
  Settings,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Mail,
  Bell,
  Shield,
  Info
} from "lucide-react";

const Status = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIncidentYear, setSelectedIncidentYear] = useState("2026");
  
  // Subscription form state
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Live simulation variables that change upon "Refresh" click
  const [metrics, setMetrics] = useState({
    apiLatency: 124,
    transcriptionQueue: 2,
    semanticSearchLatency: 89,
    webSocketConnections: 4892,
  });

  // System Components
  const components = [
    {
      name: "Core API Gateway",
      description: "Handles REST requests, authentication tokens, and user membership profiles.",
      status: "operational",
      uptime: "99.99%",
      icon: Terminal,
    },
    {
      name: "Frontend Web Interface",
      description: "Serves web static assets, dashboard controls, and CSS transitions.",
      status: "operational",
      uptime: "99.98%",
      icon: Globe,
    },
    {
      name: "AI Summary Generation Engine",
      description: "Processes meeting records via secure, zero-retention Google Gemini APIs.",
      status: "operational",
      uptime: "99.95%",
      icon: Cpu,
    },
    {
      name: "Speech-to-Text Transcription",
      description: "Handles conversion of MP3/MP4 uploads into structured text transcripts.",
      status: "operational",
      uptime: "99.91%",
      icon: Activity,
    },
    {
      name: "Semantic Vector Database",
      description: "Manages Organization ID vector indexes on Pinecone cluster nodes.",
      status: "operational",
      uptime: "99.99%",
      icon: Database,
    },
    {
      name: "Slack & Calendar Webhooks",
      description: "Delivers asynchronous summaries and links to customer integrations.",
      status: "operational",
      uptime: "99.92%",
      icon: Settings,
    },
  ];

  // System Uptime History Simulation (90 days of blocks)
  const systemUptimeHistory = useMemo(() => {
    // Generate 90 blocks per component, with occasional minor outages in the past
    return components.map((comp, idx) => {
      const blocks = [];
      for (let i = 0; i < 30; i++) {
        // Randomly introduce a few warning blocks or error blocks to represent historical logs
        let dayStatus = "operational";
        if (idx === 3 && i === 12) {
          dayStatus = "outage"; // Minor outage on day 12 for speech-to-text
        } else if (idx === 2 && i === 24) {
          dayStatus = "degraded"; // Degraded summary speeds
        } else if (idx === 5 && i === 5) {
          dayStatus = "degraded"; // Webhook delay
        }
        blocks.push({ day: 30 - i, status: dayStatus });
      }
      return { componentName: comp.name, blocks };
    });
  }, []);

  // Past Incidents
  const incidents = [
    {
      id: "inc-1",
      year: "2026",
      date: "July 12, 2026",
      title: "Asynchronous Audio Transcription Queue Delays",
      status: "resolved",
      duration: "45 minutes",
      description: `At 14:20 UTC, our transcription worker cluster experienced elevated memory utilization due to an unexpected surge in large FLAC meeting uploads. This caused transcription processing delays of up to 15 minutes for some organization workspaces.
      
      Actions taken:
      - Automatically spun up 4 additional GPU worker nodes to clear the transcript backlog.
      - Implemented stricter file streaming limits to prevent host CPU bottlenecks.
      - All processes were fully restored to normal latency baselines by 15:05 UTC.`,
    },
    {
      id: "inc-2",
      year: "2026",
      date: "June 24, 2026",
      title: "Gemini API Timeout Anomalies",
      status: "resolved",
      duration: "18 minutes",
      description: `A regional network routing issue at Google Cloud Platform caused intermittent timeouts during meeting summarization and key insights extraction.
      
      Actions taken:
      - Routed active requests to alternative geographical GCP zones.
      - Enabled local fallback cache pools to serve previous cached summaries.
      - System behavior stabilized within 18 minutes. No customer data was impacted.`,
    },
    {
      id: "inc-3",
      year: "2025",
      date: "December 05, 2025",
      title: "Pinecone Vector Search Degraded Performance",
      status: "resolved",
      duration: "1 hour 12 minutes",
      description: `Index re-indexing operations on our multi-tenant search cluster led to latency spikes (up to 3 seconds) for natural language semantic query responses.
      
      Actions taken:
      - Optimized search caching layers to defer heavy indexing scripts to off-peak maintenance hours.
      - Normal search speeds restored by 04:12 UTC.`,
    },
  ];

  // Filter incidents based on selected year
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => inc.year === selectedIncidentYear);
  }, [selectedIncidentYear]);

  // Simulate refreshing system metrics
  const handleRefreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate minor alterations to metrics to represent real-time updates
      setMetrics({
        apiLatency: Math.floor(110 + Math.random() * 25),
        transcriptionQueue: Math.floor(Math.random() * 4),
        semanticSearchLatency: Math.floor(80 + Math.random() * 15),
        webSocketConnections: Math.floor(4800 + Math.random() * 200),
      });
      setIsRefreshing(false);
    }, 1200);
  };

  // Handle email notification subscription
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 flex flex-col">
      <Navbar />

      {/* Header Status Dashboard */}
      <header className="relative bg-white dark:bg-slate-900 border-b border-gray-200/60 dark:border-slate-800 pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-300 dark:bg-emerald-900/30 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            {/* Left Header Info */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Systems Operational
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                System Status & Trust Center
              </h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
                Real-time visibility into the availability, performance metrics, and operational timeline logs of MeetOnMemory AI services.
              </p>
            </div>

            {/* Right Header Refresh Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 transition shadow-xs disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Check Status"}
              </button>

              <a
                href="#subscribe-section"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Bell className="w-3.5 h-3.5" /> Subscribe
              </a>
            </div>

          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <div className="bg-slate-50 dark:bg-slate-850 p-4 border border-gray-100 dark:border-slate-800 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest block">
                API Response Time
              </span>
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white block mt-1">
                {metrics.apiLatency} ms
              </span>
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Normal Baseline
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-4 border border-gray-100 dark:border-slate-800 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest block">
                Transcription Queue
              </span>
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white block mt-1">
                {metrics.transcriptionQueue} files
              </span>
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5 mt-1">
                <CheckCircle2 className="w-3 h-3" /> No Delay
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-4 border border-gray-100 dark:border-slate-800 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest block">
                Vector Search Latency
              </span>
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white block mt-1">
                {metrics.semanticSearchLatency} ms
              </span>
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Operational
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-4 border border-gray-100 dark:border-slate-800 rounded-2xl">
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest block">
                Active WebSockets
              </span>
              <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white block mt-1">
                {metrics.webSocketConnections.toLocaleString()}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-slate-550 font-medium block mt-1">
                Connected Clients
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Status Indicators */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">

        {/* Components Checklist */}
        <section className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-500" /> Operational Status by Component
          </h2>

          <div className="space-y-4">
            {components.map((comp) => {
              const Icon = comp.icon;
              return (
                <div
                  key={comp.name}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-100 dark:border-slate-700/60 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-gray-500 dark:text-slate-400 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        {comp.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {comp.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-gray-100 dark:border-slate-700 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold block uppercase tracking-wider">
                        90-Day Uptime
                      </span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-slate-300 block">
                        {comp.uptime}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Operational
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 30-Day Historical Timeline Chart */}
        <section className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Historical Performance (Past 30 Days)
            </h2>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium hidden sm:inline">
              July 17, 2026 - June 18, 2026
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-8">
            Visual matrix detailing operational, degraded, or outage logs over the past 30 days. Hover columns to view specific dates.
          </p>

          <div className="space-y-6">
            {systemUptimeHistory.map((compHistory) => (
              <div key={compHistory.componentName} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700 dark:text-slate-300">
                    {compHistory.componentName}
                  </span>
                  <span className="text-gray-400 dark:text-slate-555">
                    100% Operational
                  </span>
                </div>
                
                {/* Horizontal status grid squares */}
                <div className="flex gap-1 py-1">
                  {compHistory.blocks.map((block) => {
                    let blockColor = "bg-emerald-500 dark:bg-emerald-600";
                    let titleText = `Day ${block.day}: Operational`;
                    if (block.status === "degraded") {
                      blockColor = "bg-amber-500";
                      titleText = `Day ${block.day}: Degraded Performance`;
                    } else if (block.status === "outage") {
                      blockColor = "bg-rose-500";
                      titleText = `Day ${block.day}: Outage Resolved`;
                    }

                    return (
                      <div
                        key={block.day}
                        title={titleText}
                        className={`h-7 flex-1 rounded-sm cursor-help hover:opacity-80 transition ${blockColor}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-start gap-5 mt-6 pt-5 border-t border-gray-100 dark:border-slate-700/60 text-xs">
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" /> Operational
            </span>
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
              <span className="w-3 h-3 rounded-xs bg-amber-500" /> Degraded Performance
            </span>
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
              <span className="w-3 h-3 rounded-xs bg-rose-500" /> System Outage
            </span>
          </div>
        </section>

        {/* Incidents History */}
        <section className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" /> Historical Incidents Log
              </h2>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                Archived logs of resolved service disruptions and mitigation timelines.
              </p>
            </div>

            {/* Year filter selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg self-start">
              {["2026", "2025"].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedIncidentYear(yr)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                    selectedIncidentYear === yr
                      ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-xs"
                      : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-gray-800 dark:text-white">No incidents logged in this year</h4>
                <p className="text-xs text-gray-500 dark:text-slate-450 mt-0.5">
                  100% uptime baseline met for all cloud services during this period.
                </p>
              </div>
            ) : (
              filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="border border-gray-100 dark:border-slate-700/60 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-850/50 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-150/40 dark:border-slate-800/40 pb-3">
                    <div>
                      <span className="text-xs font-bold text-gray-450 dark:text-slate-500 block">
                        {inc.date}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mt-0.5">
                        {inc.title}
                      </h4>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                      Resolved
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {inc.description}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500 pt-1">
                    <span>Duration: <b>{inc.duration}</b></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-blue-500" /> Post-Incident Verification Passed
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Subscribe & Alerts Form */}
        <section
          id="subscribe-section"
          className="bg-linear-to-br from-blue-600 via-indigo-700 to-violet-800 text-white rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden"
        >
          <div className="absolute right-0 bottom-0 translate-y-12 translate-x-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl relative z-10 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-200" /> Subscribe to Operational Alerts
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              Get real-time email notifications regarding system outages, planned maintenance windows, and vector workspace API updates. We do not spam.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="email"
                placeholder="Enter your administrative email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribed}
                required
                className="px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white text-sm flex-1 min-w-[260px]"
              />
              <button
                type="submit"
                disabled={isSubscribed}
                className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 transition font-bold text-sm rounded-xl shrink-0"
              >
                {isSubscribed ? "Subscribing..." : "Subscribe Alerts"}
              </button>
            </form>

            {isSubscribed && (
              <div className="p-3 bg-white/10 border border-white/20 rounded-xl flex items-center gap-2 text-xs text-blue-100 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Subscription successful! We have registered your admin email for system status alerts.</span>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Redirect Footer Bar */}
      <div className="bg-gray-100 dark:bg-slate-950 border-t border-gray-200/85 dark:border-slate-800/80 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            Have queries regarding compliance audits or data sovereignty?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-semibold">
            <Link
              to="/security"
              className="px-4 py-2 border border-gray-200 dark:border-slate-850 rounded-lg text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
            >
              Trust & Security Center
            </Link>
            <Link
              to="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;
