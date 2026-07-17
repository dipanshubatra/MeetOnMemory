import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import {
  Terminal,
  Code2,
  Key,
  Webhook,
  FileText,
  Search,
  Copy,
  Check,
  Play,
  ChevronRight,
  ChevronDown,
  Globe,
  Database,
  BookOpen,
  ShieldAlert,
  ArrowRight,
  Lock,
  RefreshCw
} from "lucide-react";

const DeveloperDocs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("curl"); // curl | node | python
  const [activeSection, setActiveSection] = useState("getting-started");
  const [copiedId, setCopiedId] = useState(null);

  // Webhook Simulator State
  const [testUrl, setTestUrl] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  const sections = [
    {
      id: "getting-started",
      title: "1. Getting Started",
      icon: BookOpen,
      content: `Welcome to the MeetOnMemory Developer API portal. Our API enables programmatic audio transcription, diarization mapping, minutes-of-meeting (MoM) summaries generation, and vector semantic querying across isolated organizational scopes.
      
      The API is structured around REST principles. It utilizes predictable resource-oriented URLs, returns JSON-encoded responses, and supports standard HTTP status codes.
      
      Production API Base URL:
      https://api.meetonmemory.com/v1`,
    },
    {
      id: "authentication",
      title: "2. Authentication",
      icon: Key,
      content: `All API requests must include your organization's API Key. Admins can generate and revoke keys inside the "Organization Settings" > "Developer Keys" dashboard.
      
      API Keys are highly confidential. Never expose keys in client-side code, frontend bundles, or public Git repositories.
      
      To authenticate, pass your secret token in the authorization header:
      Authorization: Bearer mom_sec_live_...`,
    },
    {
      id: "transcribe-audio",
      title: "3. Transcribe Audio",
      icon: Terminal,
      content: `To transcribe a meeting recording programmatically, submit a multipart/form-data POST request to the transcription endpoint.
      
      Endpoint URL:
      POST /meetings/transcribe
      
      Parameters:
      - file: Audio/Video file (MP3, WAV, M4A, MP4; max 500MB).
      - language: Optional. ISO 2-letter language code (e.g., 'en', 'hi').
      - diarization: Optional. Boolean. Separate speaker turns.`,
    },
    {
      id: "get-meeting",
      title: "4. Retrieve Transcripts",
      icon: FileText,
      content: `Fetch the status, raw transcript paragraphs, and AI summaries for a specific meeting job.
      
      Endpoint URL:
      GET /meetings/:meeting_id
      
      Response:
      Returns a JSON object detailing current transcription status ('processing', 'completed', or 'failed'), diarized transcript blocks, and the structured AI-generated summaries.`,
    },
    {
      id: "webhooks",
      title: "5. Webhook Events",
      icon: Webhook,
      content: `Configure webhooks to receive real-time POST payloads whenever meeting transcription operations finish processing.
      
      Signing Secrets:
      All webhook requests contain a signature header (X-MoM-Signature) generated using your private signing secret. Validate the signature to verify the requests originate from MeetOnMemory.`,
    },
    {
      id: "error-handling",
      title: "6. Error Handling",
      icon: ShieldAlert,
      content: `MeetOnMemory utilizes standard HTTP response codes to indicate API request success or failure.
      
      - 200 OK: Request succeeded.
      - 400 Bad Request: Missing required fields or unsupported media format.
      - 401 Unauthorized: Invalid or missing API key header.
      - 403 Forbidden: API key is correct, but lacks permission to view the resource.
      - 429 Too Many Requests: Rate limit exceeded. Max 60 requests per minute.`,
    },
  ];

  // Code snippets database
  const snippets = {
    auth: {
      curl: `curl -H "Authorization: Bearer mom_sec_live_your_key_here" \\
  https://api.meetonmemory.com/v1/auth/verify`,
      node: `const axios = require('axios');
const response = await axios.get('https://api.meetonmemory.com/v1/auth/verify', {
  headers: { 'Authorization': 'Bearer mom_sec_live_your_key_here' }
});
console.log(response.data);`,
      python: `import requests
headers = { 'Authorization': 'Bearer mom_sec_live_your_key_here' }
r = requests.get('https://api.meetonmemory.com/v1/auth/verify', headers=headers)
print(r.json())`,
    },
    transcribe: {
      curl: `curl -X POST \\
  -H "Authorization: Bearer mom_sec_live_your_key_here" \\
  -F "file=@/path/to/meeting.mp3" \\
  -F "language=en" \\
  -F "diarization=true" \\
  https://api.meetonmemory.com/v1/meetings/transcribe`,
      node: `const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file', fs.createReadStream('/path/to/meeting.mp3'));
form.append('language', 'en');
form.append('diarization', 'true');

const response = await axios.post('https://api.meetonmemory.com/v1/meetings/transcribe', form, {
  headers: {
    ...form.getHeaders(),
    'Authorization': 'Bearer mom_sec_live_your_key_here'
  }
});
console.log(response.data);`,
      python: `import requests

files = { 'file': open('/path/to/meeting.mp3', 'rb') }
data = { 'language': 'en', 'diarization': 'true' }
headers = { 'Authorization': 'Bearer mom_sec_live_your_key_here' }

r = requests.post('https://api.meetonmemory.com/v1/meetings/transcribe', 
                  files=files, data=data, headers=headers)
print(r.json())`,
    },
  };

  const devFaqs = [
    {
      q: "What is the rate limit for standard API keys?",
      a: "Standard API keys are limited to 60 requests per minute. Custom enterprise packages support up to 1,000 requests per minute with isolated dedicated compute nodes.",
    },
    {
      q: "Are transcription operations synchronous?",
      a: "No. Transcription and summaries are heavy tasks. The transcription endpoint returns an immediate 202 Accepted status with a JSON object. You must either poll GET /meetings/:id or register a Webhook URL to receive a POST callback upon completion.",
    },
    {
      q: "Does your API support streaming audio in real-time?",
      a: "Yes. We support real-time audio chunking via secure WebSocket protocols (wss://api.meetonmemory.com/v1/stream). Contact our security desk to authorize streaming features.",
    },
    {
      q: "How are webhook payloads signed?",
      a: "We generate an HMAC-SHA256 signature using your Webhook Signing Secret as the key and the raw request payload body as the data, returning the value in the X-MoM-Signature header.",
    },
  ];

  // Handle copy text action
  const handleCopyCode = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Simulate test webhook action
  const handleTestWebhook = (e) => {
    e.preventDefault();
    if (!testUrl || !testUrl.startsWith("http")) return;
    setIsSimulating(true);
    setSimResult(null);

    setTimeout(() => {
      setIsSimulating(false);
      setSimResult({
        status: 200,
        statusText: "OK",
        responseTime: "246ms",
        payload: {
          event: "meeting.transcription.completed",
          timestamp: "2026-07-17T01:35:00Z",
          data: {
            meeting_id: "meet_908f432e",
            duration_seconds: 1482,
            status: "completed",
            summary: {
              title: "Weekly Engineering Sync",
              action_items: [
                { task: "Deploy vector database patch", assignee: "Aryan" },
                { task: "Update SSL keys", assignee: "Shiv" }
              ]
            }
          }
        }
      });
    }, 2000);
  };

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase();
    return sections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(query) ||
        sec.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <header className="relative bg-white dark:bg-slate-900 border-b border-gray-200/50 dark:border-slate-800 pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-300 dark:bg-blue-900/30 blur-3xl animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/40 dark:border-blue-900/40 text-blue-800 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5" /> API Documentation
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Developer Reference Portal
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-500 dark:text-slate-400 leading-relaxed">
            Integrate speech transcription, speaker turns separation, and Gemini summaries into your company's workflows via robust REST and WebSocket channels.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search endpoints, variables, error codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Reference Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column Navigation TOC */}
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-28 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs max-h-[calc(100vh-140px)] overflow-y-auto space-y-5">
              <div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 px-2">
                  TOC INDEX
                </h3>
                <nav className="space-y-1.5">
                  {sections.map((sec) => {
                    const Icon = sec.icon;
                    const isActive = activeSection === sec.id;
                    return (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(sec.id);
                          if (el) {
                            window.scrollTo({
                              top: el.offsetTop - 100,
                              behavior: "smooth",
                            });
                            setActiveSection(sec.id);
                          }
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-left transition ${
                          isActive
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                            : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/30"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{sec.title.split(". ")[1]}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>

              <hr className="border-gray-100 dark:border-slate-700/60" />

              <div className="bg-linear-to-tr from-blue-600 to-indigo-750 text-white rounded-xl p-4 shadow-xs relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 w-20 h-20 rounded-full bg-white/10 blur-lg" />
                <h4 className="font-bold text-xs flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-blue-200" /> API Keys
                </h4>
                <p className="text-[10px] text-blue-100 mt-2 leading-relaxed">
                  Go to settings inside your organization dashboard to create tokens.
                </p>
                <Link
                  to="/login"
                  className="inline-block mt-3 bg-white text-blue-700 font-bold text-[10px] px-3 py-1.5 rounded hover:bg-blue-50 transition"
                >
                  Dashboard Keys
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Column API Docs Content */}
          <div className="lg:col-span-9 space-y-12 animate-fade-in">
            
            {/* Sections Loop */}
            <div className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-10">
              
              {filteredSections.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">No docs match your query</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
                    Try searching for keywords like 'Bearer', 'Webhook', or 'POST'.
                  </p>
                </div>
              ) : (
                filteredSections.map((sec) => {
                  const Icon = sec.icon;
                  return (
                    <article
                      key={sec.id}
                      id={sec.id}
                      className="scroll-mt-24 border-b border-gray-100 last:border-0 dark:border-slate-700/60 pb-8 last:pb-0"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {sec.title}
                        </h2>
                      </div>

                      <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {sec.content}
                      </div>

                      {/* Display Code Switcher for Authentication Section */}
                      {sec.id === "authentication" && (
                        <div className="mt-6 space-y-4">
                          <div className="flex gap-2 border-b border-gray-100 dark:border-slate-700/60 pb-2">
                            {["curl", "node", "python"].map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition uppercase ${
                                  activeTab === tab
                                    ? "bg-slate-100 dark:bg-slate-900 text-blue-600 dark:text-blue-400"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-250"
                                }`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>
                          
                          <div className="relative bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner group">
                            <button
                              onClick={() => handleCopyCode("auth", snippets.auth[activeTab])}
                              className="absolute top-3 right-3 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition p-1.5 bg-slate-900 rounded-md"
                            >
                              {copiedId === "auth" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <pre className="pr-8">{snippets.auth[activeTab]}</pre>
                          </div>
                        </div>
                      )}

                      {/* Display Code Switcher for Transcription Section */}
                      {sec.id === "transcribe-audio" && (
                        <div className="mt-6 space-y-4">
                          <div className="flex gap-2 border-b border-gray-100 dark:border-slate-700/60 pb-2">
                            {["curl", "node", "python"].map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition uppercase ${
                                  activeTab === tab
                                    ? "bg-slate-100 dark:bg-slate-900 text-blue-600 dark:text-blue-400"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-250"
                                }`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>

                          <div className="relative bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner group">
                            <button
                              onClick={() => handleCopyCode("transcribe", snippets.transcribe[activeTab])}
                              className="absolute top-3 right-3 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition p-1.5 bg-slate-900 rounded-md"
                            >
                              {copiedId === "transcribe" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <pre className="pr-8">{snippets.transcribe[activeTab]}</pre>
                          </div>
                        </div>
                      )}

                    </article>
                  );
                })
              )}
            </div>

            {/* Interactive Webhook Simulator */}
            <section className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Webhook className="w-5 h-5 text-blue-500" /> Webhook Payload Simulator
              </h2>
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">
                Input your server endpoint URL below to trigger a simulated transcription callback payload.
              </p>

              <form onSubmit={handleTestWebhook} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  placeholder="https://yourdomain.com/webhooks/meetonmemory"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  required
                  disabled={isSimulating}
                  className="block w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1"
                />
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Play className="w-4 h-4" /> {isSimulating ? "Sending..." : "Test Webhook"}
                </button>
              </form>

              {isSimulating && (
                <div className="mt-4 flex items-center gap-2.5 text-xs text-gray-400 dark:text-slate-500 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  Dispatching POST payload to target web destination...
                </div>
              )}

              {simResult && (
                <div className="mt-6 space-y-4 animate-fade-in">
                  <div className="flex flex-wrap gap-4 text-xs font-bold">
                    <span className="text-emerald-600 dark:text-emerald-450">
                      Status: {simResult.status} {simResult.statusText}
                    </span>
                    <span className="text-gray-450 dark:text-slate-500">
                      Response Time: {simResult.responseTime}
                    </span>
                  </div>

                  <div className="relative bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-[10px] sm:text-xs overflow-x-auto shadow-inner group">
                    <button
                      onClick={() => handleCopyCode("webhookSim", JSON.stringify(simResult.payload, null, 2))}
                      className="absolute top-3 right-3 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition p-1.5 bg-slate-900 rounded-md"
                    >
                      {copiedId === "webhookSim" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <pre>{JSON.stringify(simResult.payload, null, 2)}</pre>
                  </div>
                </div>
              )}
            </section>

            {/* Developer FAQ Accordion */}
            <section className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Developer FAQs
              </h2>

              <div className="space-y-3">
                {devFaqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-gray-100 dark:border-slate-700/60 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-slate-700/10 hover:bg-gray-50 dark:hover:bg-slate-700/30 text-left transition"
                      >
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ml-2 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700/60 text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Trust bar redirects */}
      <footer className="bg-gray-100 dark:bg-slate-950 border-t border-gray-200/80 dark:border-slate-800/80 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            Need support integrating our enterprise vector search models?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-semibold">
            <Link
              to="/contact"
              className="px-4 py-2 border border-gray-200 dark:border-slate-850 rounded-lg text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
            >
              Contact Developer Desk
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

export default DeveloperDocs;
