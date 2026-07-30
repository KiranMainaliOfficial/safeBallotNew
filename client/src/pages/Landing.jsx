import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../store/authStore";
import { listElectionsApi, getElectionApi } from "../api/election.api";
import Loader from "../components/common/Loader";

export default function Landing() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("All Locations");
  
  // Interactive widget state
  const [presidentialElection, setPresidentialElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [submittingWidget, setSubmittingWidget] = useState(false);

  // Sorting state for active ballots
  const [sortOrder, setSortOrder] = useState("endTimeAsc");

  // How It Works Simulator State
  const [activeStep, setActiveStep] = useState(1);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [demoSelectedCandidate, setDemoSelectedCandidate] = useState("Dr. Rivera");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptedHash, setEncryptedHash] = useState("");

  const triggerScan = () => {
    setScanningProgress(0);
    setIsScanning(true);
  };

  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(() => {
        setScanningProgress((prev) => {
          if (prev >= 100) {
            setIsScanning(false);
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  useEffect(() => {
    if (activeStep === 1) {
      triggerScan();
    }
  }, [activeStep]);

  const handleDemoEncrypt = () => {
    setIsEncrypting(true);
    setTimeout(() => {
      setIsEncrypting(false);
      setEncryptedHash("a89f81d1c3a640192e21b72dc64b18c21a4fbd3d9e84b72c918a22129e19d7d2");
    }, 1500);
  };

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Fetch elections
    listElectionsApi()
      .then(async (res) => {
        const list = res.data.data || [];
        setElections(list);
        
        // Find Presidential Election to power the widget
        const pres = list.find((e) => e.title === "Presidential Election");
        if (pres) {
          try {
            const detailRes = await getElectionApi(pres._id);
            setPresidentialElection(detailRes.data.data);
            // Default select the first candidate (Rivera) if available
            if (detailRes.data.data?.candidates?.length > 0) {
              const rivera = detailRes.data.data.candidates.find(c => c.name.includes("Rivera"));
              setSelectedCandidate(rivera ? rivera._id : detailRes.data.data.candidates[0]._id);
            }
          } catch (err) {
            console.error("Failed to load presidential candidates", err);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load elections", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleWidgetSubmit = (e) => {
    e.preventDefault();
    if (!presidentialElection) {
      toast.error("Presidential Election is currently not active");
      return;
    }
    if (!selectedCandidate) {
      toast.error("Please select a candidate first");
      return;
    }

    setSubmittingWidget(true);

    // Save selection in session storage
    sessionStorage.setItem("pending_vote_election", presidentialElection._id);
    sessionStorage.setItem("pending_vote_candidate", selectedCandidate);

    if (!token) {
      toast.success("Candidate selected! Please sign in to verify your identity and cast your official ballot.", {
        duration: 5000,
      });
      setTimeout(() => {
        navigate(`/login?redirect=/vote/${presidentialElection._id}&candidate=${selectedCandidate}`);
      }, 1500);
    } else {
      if (!user?.kycComplete) {
        toast.error("You must complete KYC verification before casting your vote.");
        setTimeout(() => {
          navigate("/kyc");
        }, 1500);
      } else {
        toast.success("Identity verified! Redirecting to the secure voting terminal.");
        setTimeout(() => {
          navigate(`/vote/${presidentialElection._id}?candidate=${selectedCandidate}`);
        }, 1200);
      }
    }
  };

  // Helper to map categories and stats based on names matching screenshot
  const getElectionMeta = (title) => {
    if (title.includes("Presidential")) {
      return { category: "Federal", count: "18.4M registered", badgeColor: "bg-blue-100 text-blue-800" };
    }
    if (title.includes("Senate")) {
      return { category: "State", count: "3.1M registered", badgeColor: "bg-teal-100 text-teal-800" };
    }
    if (title.includes("Governor")) {
      return { category: "State", count: "9.6M registered", badgeColor: "bg-teal-100 text-teal-800" };
    }
    if (title.includes("School")) {
      return { category: "Local", count: "240K registered", badgeColor: "bg-amber-100 text-amber-800", isClosingSoon: true };
    }
    if (title.includes("Proposition")) {
      return { category: "Ballot", count: "9.6M registered", badgeColor: "bg-purple-100 text-purple-800" };
    }
    if (title.includes("Mayor")) {
      return { category: "Local", count: "2.2M registered", badgeColor: "bg-amber-100 text-amber-800" };
    }
    return { category: "Local", count: "1.2M registered", badgeColor: "bg-slate-100 text-slate-800" };
  };

  const getElectionLocation = (title) => {
    if (title.includes("California") || title.includes("Housing")) return "California";
    if (title.includes("Los Angeles") || title.includes("Mayor") || title.includes("School")) return "Los Angeles, CA";
    return "National";
  };

  // Filter elections based on dropdown location
  const filteredElections = elections.filter((e) => {
    if (locationFilter === "All Locations") return true;
    const loc = getElectionLocation(e.title);
    if (locationFilter === "Los Angeles, CA") {
      return loc === "Los Angeles, CA" || loc === "California";
    }
    return loc === locationFilter;
  });

  const sortedElections = [...filteredElections].sort((a, b) => {
    if (sortOrder === "endTimeAsc") {
      return new Date(a.endTime) - new Date(b.endTime);
    }
    if (sortOrder === "startTimeDesc") {
      return new Date(b.startTime) - new Date(a.startTime);
    }
    if (sortOrder === "startTimeAsc") {
      return new Date(a.startTime) - new Date(b.startTime);
    }
    return 0;
  });

  return (
    <div className="w-full text-slate-800">
      {/* 1. HERO SECTION */}
      <section className="bg-[#0B3C95] text-white pt-12 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Info */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 bg-[#082E72]/40 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              2024 National Election
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Your Vote.<br />
              <span className="text-blue-200">Your Voice.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100/90 leading-relaxed max-w-xl">
              Safe Ballot delivers end-to-end encrypted online voting for the general public. Simple, accessible, and independently audited.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button 
                onClick={() => {
                  const section = document.getElementById("active-ballots");
                  if (section) section.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold py-3.5 px-8 rounded-xl transition shadow-lg text-center"
              >
                Cast Your Vote Now
              </button>
              
              <Link 
                to={token ? "/my-details" : "/register"} 
                className="text-white hover:text-blue-200 text-sm font-semibold flex items-center justify-center gap-1.5 group transition py-2"
              >
                Verify my registration
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-white">4.2M+</p>
                <p className="text-xs md:text-sm text-blue-200/70">Votes Cast</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-white">99.98%</p>
                <p className="text-xs md:text-sm text-blue-200/70">Uptime</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-white">256-bit</p>
                <p className="text-xs md:text-sm text-blue-200/70">Encryption</p>
              </div>
            </div>
          </div>

          {/* Right Hero Widget */}
          <div className="lg:col-span-5">
            <div className="bg-white text-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-md mx-auto">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-semibold text-slate-600">Voting is Open</span>
                </div>
                <span className="text-xs text-slate-400">Closes Nov 5, 2024</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-1">Presidential Election</h2>
              <p className="text-xs text-slate-500 mb-6">Select one candidate for President of the United States</p>

              {/* Candidates selection */}
              {presidentialElection ? (
                <form onSubmit={handleWidgetSubmit} className="space-y-3">
                  {presidentialElection.candidates.map((cand) => (
                    <label
                      key={cand._id}
                      className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedCandidate === cand._id
                          ? "border-[#0B3C95] bg-[#0B3C95]/5"
                          : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="hero-cand"
                        value={cand._id}
                        checked={selectedCandidate === cand._id}
                        onChange={() => setSelectedCandidate(cand._id)}
                        className="accent-[#0B3C95] w-4.5 h-4.5"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm leading-snug">{cand.name}</p>
                        {cand.party && <p className="text-[11px] text-slate-400 font-medium">{cand.party}</p>}
                      </div>
                    </label>
                  ))}

                  <button
                    type="submit"
                    disabled={submittingWidget}
                    className="w-full bg-[#0B3C95] hover:bg-[#072C70] text-white font-bold py-3.5 rounded-2xl transition shadow-md mt-4 text-sm"
                  >
                    Confirm & Submit Vote
                  </button>
                </form>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-4 border-[#0B3C95] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-400">Connecting to secure ballot database...</p>
                </div>
              )}

              <p className="text-[10px] text-slate-400 text-center mt-4 leading-normal">
                Your vote is anonymous and encrypted. You can verify it was counted.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. TRUST HIGHLIGHT BAR */}
      <section className="bg-[#EFEFEA] border-y border-[#E5E4DE] py-4 px-4 overflow-x-auto whitespace-nowrap">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span>End-to-End Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📊</span>
            <span>Publicly Audited</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>FIPS 140-2 Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <span>👤</span>
            <span>Biometric Verification</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📡</span>
            <span>Air-Gapped Servers</span>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="bg-[#F9F9F6] py-16 px-4 md:px-8">
        <style>{`
          @keyframes scan-beam {
            0% { top: 0%; }
            50% { top: 100%; }
            100% { top: 0%; }
          }
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .animate-scan-beam {
            position: absolute;
            left: 0;
            right: 0;
            h-1;
            animation: scan-beam 2s infinite ease-in-out;
          }
          .animate-bounce-subtle {
            animation: bounce-subtle 1.5s infinite ease-in-out;
          }
        `}</style>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-red-600 font-bold uppercase tracking-wider text-xs border-l-2 border-red-600 pl-2">
                Process
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">How Safe Ballot Works</h2>
            </div>
            <Link to="/verify" className="text-[#0B3C95] hover:underline font-semibold text-sm mt-3 md:mt-0 flex items-center gap-1">
              Read our security whitepaper <span className="text-xs">↗</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left side: Interactive vertical timeline */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              
              {/* Step 1 */}
              <button
                onClick={() => setActiveStep(1)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex gap-4 ${
                  activeStep === 1
                    ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10"
                    : "bg-[#F3F3EF]/50 hover:bg-[#F3F3EF] border-transparent"
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeStep === 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  1
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Verify Identity</h4>
                  <p className="text-xs text-slate-500 mt-1">Provide voter credentials and perform an automatic face biometric verification.</p>
                </div>
              </button>

              {/* Step 2 */}
              <button
                onClick={() => setActiveStep(2)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex gap-4 ${
                  activeStep === 2
                    ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10"
                    : "bg-[#F3F3EF]/50 hover:bg-[#F3F3EF] border-transparent"
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeStep === 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  2
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Review Ballot</h4>
                  <p className="text-xs text-slate-500 mt-1">Browse races and interactively select your preferred candidates.</p>
                </div>
              </button>

              {/* Step 3 */}
              <button
                onClick={() => setActiveStep(3)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex gap-4 ${
                  activeStep === 3
                    ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10"
                    : "bg-[#F3F3EF]/50 hover:bg-[#F3F3EF] border-transparent"
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeStep === 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  3
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Cast & Encrypt</h4>
                  <p className="text-xs text-slate-500 mt-1">Submit your ballot and see how it gets transformed into an encrypted SHA-256 hash.</p>
                </div>
              </button>

              {/* Step 4 */}
              <button
                onClick={() => setActiveStep(4)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex gap-4 ${
                  activeStep === 4
                    ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10"
                    : "bg-[#F3F3EF]/50 hover:bg-[#F3F3EF] border-transparent"
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  activeStep === 4 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  4
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Get Verification Receipt</h4>
                  <p className="text-xs text-slate-500 mt-1">Verify that your votes match the secure cryptographic chain receipt.</p>
                </div>
              </button>

            </div>

            {/* Right side: Interactive simulator terminal */}
            <div className="lg:col-span-7 bg-white border border-[#E5E4DE] rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
              
              {activeStep === 1 && (
                <div className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700">FACIAL VERIFICATION SIMULATOR</span>
                    <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">ACTIVE</span>
                  </div>
                  
                  <div className="relative bg-slate-900 aspect-video rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white border border-slate-800">
                    {/* Simulated camera scanning beam */}
                    {isScanning && (
                      <div className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_10px_#22c55e] animate-scan-beam" style={{
                        animation: 'scan-beam 2s infinite ease-in-out'
                      }}></div>
                    )}
                    
                    <div className="z-10 text-center space-y-2">
                      {isScanning ? (
                        <>
                          <div className="text-4xl animate-pulse">📷</div>
                          <p className="text-xs font-semibold tracking-wider text-green-400">ANALYZING FACIAL STRUCTURE...</p>
                          <p className="text-xl font-bold font-mono text-green-300">{scanningProgress}%</p>
                        </>
                      ) : scanningProgress === 100 ? (
                        <>
                          <div className="text-4xl text-green-400">✓</div>
                          <p className="text-xs font-bold tracking-wider text-green-400">BIOMETRIC MATCH CONFIRMED</p>
                          <p className="text-[10px] text-slate-400">Liveness check: Passed · Match score: 98.7%</p>
                        </>
                      ) : (
                        <>
                          <div className="text-4xl text-slate-400">👤</div>
                          <p className="text-xs font-semibold text-slate-300">Camera Feed Offline</p>
                          <p className="text-[10px] text-slate-500">Click below to start simulation</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={triggerScan}
                      disabled={isScanning}
                      className="px-4 py-2 bg-[#0B3C95] hover:bg-[#072C70] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition"
                    >
                      {scanningProgress === 100 ? "Restart Verification" : "Start Face Scan"}
                    </button>
                    <button
                      onClick={() => setActiveStep(2)}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Proceed to Step 2 →
                    </button>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700">BALLOT REVIEW SIMULATOR</span>
                    <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full font-mono">STEP 02</span>
                  </div>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mock Office: Federal President</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setDemoSelectedCandidate("Dr. Rivera")}
                        className={`p-3 rounded-xl border text-left transition ${
                          demoSelectedCandidate === "Dr. Rivera"
                            ? "bg-white border-blue-500 shadow-sm ring-1 ring-blue-500"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-800">Dr. Rivera</div>
                        <div className="text-[9px] text-slate-500">Democrat · Bio: Medical Reform</div>
                      </button>
                      
                      <button
                        onClick={() => setDemoSelectedCandidate("Senator Vance")}
                        className={`p-3 rounded-xl border text-left transition ${
                          demoSelectedCandidate === "Senator Vance"
                            ? "bg-white border-blue-500 shadow-sm ring-1 ring-blue-500"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-800">Senator Vance</div>
                        <div className="text-[9px] text-slate-500">Republican · Bio: Economic Tech</div>
                      </button>
                    </div>
                    {demoSelectedCandidate && (
                      <p className="text-[10px] text-emerald-600 font-medium">Selected Candidate: <span className="font-bold">{demoSelectedCandidate}</span></p>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] text-slate-400">Click a card to select candidate.</span>
                    <button
                      onClick={() => setActiveStep(3)}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Go to Step 3 (Encryption) →
                    </button>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700">BALLOT ENCRYPTION SIMULATOR</span>
                    <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full font-mono">STEP 03</span>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-900 p-4 rounded-2xl text-white font-mono text-xs space-y-2 border border-slate-800">
                      <div className="flex justify-between text-slate-400 text-[10px] border-b border-white/10 pb-1">
                        <span>DATA PACKET DESCRIPTION</span>
                        <span>PLAINTEXT VALUE</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Office:</span>
                        <span className="text-blue-300">President</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Selection:</span>
                        <span className="text-blue-300">{demoSelectedCandidate || "None Selected"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Secret Salt:</span>
                        <span className="text-blue-300">8df02ad927e1</span>
                      </div>
                      
                      {isEncrypting ? (
                        <div className="pt-2 text-center text-[10px] text-amber-300 uppercase tracking-widest animate-pulse">
                          Generating SHA-256 Hash Chain Link...
                        </div>
                      ) : encryptedHash ? (
                        <div className="pt-2 border-t border-white/10 space-y-1">
                          <span className="text-green-400 font-bold text-[9px] uppercase tracking-wider">SHA-256 CRYPTO-HASH RECORDED:</span>
                          <p className="text-[9px] text-green-300 break-all bg-green-950/40 p-2 rounded border border-green-800/40">{encryptedHash}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={handleDemoEncrypt}
                      disabled={isEncrypting}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition"
                    >
                      {encryptedHash ? "Re-Encrypt Ballot" : "Encrypt & Submit"}
                    </button>
                    {encryptedHash && (
                      <button
                        onClick={() => setActiveStep(4)}
                        className="text-xs text-blue-600 font-bold hover:underline animate-bounce-subtle"
                      >
                        Reveal Secure Receipt →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="flex flex-col justify-between h-full space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700">BALLOT RECEIPT SIMULATOR</span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full font-mono">STEP 04</span>
                  </div>

                  <div className="bg-white border-2 border-dashed border-slate-200 p-5 rounded-2xl flex flex-col items-center text-center space-y-3">
                    <span className="text-3xl text-emerald-500">📜</span>
                    <div>
                      <h6 className="font-bold text-slate-800 text-sm">Official Ballot Receipt</h6>
                      <p className="text-[10px] text-slate-400 mt-0.5">Cryptographic verification token</p>
                    </div>
                    <div className="bg-slate-50 w-full p-2.5 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-600 select-all relative">
                      RECEIPT-8F92A-4B7C
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed max-w-xs">
                      This receipt proves your ballot is safely linked into the cryptographic ledger, without revealing your name or selection to any auditors.
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("RECEIPT-8F92A-4B7C");
                        toast.success("Receipt ID copied to clipboard!");
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                    >
                      Copy Receipt ID
                    </button>
                    <button
                      onClick={() => setActiveStep(1)}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Restart Process Simulator ↺
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* 4. ACTIVE BALLOTS SECTION */}
      <section id="active-ballots" className="bg-[#EFEFEA] py-16 px-4 md:px-8 border-t border-[#E5E4DE]">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-red-600 font-bold uppercase tracking-wider text-xs border-l-2 border-red-600 pl-2">
                Elections
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Active Ballots Near You</h2>
            </div>
            
            {/* Filters and Sorting Controls */}
            <div className="mt-4 md:mt-0 flex flex-wrap gap-3 items-center">
              
              {/* Location Dropdown */}
              <div className="relative inline-block">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 py-2.5 px-4 pr-10 rounded-xl text-sm font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-[#0B3C95]/20 appearance-none"
                >
                  <option value="All Locations">📍 All Locations</option>
                  <option value="Los Angeles, CA">Los Angeles, CA</option>
                  <option value="California">California</option>
                  <option value="National">National</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  ▾
                </div>
              </div>

              {/* Sorting Dropdown */}
              <div className="relative inline-block">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 py-2.5 px-4 pr-10 rounded-xl text-sm font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-[#0B3C95]/20 appearance-none"
                >
                  <option value="endTimeAsc">⏰ Sort: Ends Soonest</option>
                  <option value="startTimeDesc">📅 Sort: Newest Start</option>
                  <option value="startTimeAsc">📅 Sort: Oldest Start</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  ▾
                </div>
              </div>

            </div>
          </div>

          {/* Elections Grid */}
          {loading ? (
            <div className="py-20"><Loader /></div>
          ) : sortedElections.length === 0 ? (
            <div className="bg-white border border-[#E5E4DE] rounded-3xl p-12 text-center text-slate-500 max-w-lg mx-auto">
              No active elections found for {locationFilter === "All Locations" ? "your area" : locationFilter}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedElections.map((elec) => {
                const meta = getElectionMeta(elec.title);
                return (
                  <div 
                    key={elec._id}
                    className="bg-white border border-[#E5E4DE] rounded-3xl p-6 flex flex-col justify-between hover-lift shadow-sm"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md ${meta.badgeColor}`}>
                          {meta.category}
                        </span>
                        
                        {meta.isClosingSoon ? (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                            Closing Soon
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Open
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1">
                        {elec.title}
                      </h3>
                      
                      <div className="text-[11px] text-slate-400 font-semibold mb-4 space-y-1">
                        <p>📅 Closes: {new Date(elec.endTime).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                        <p>👥 {meta.count}</p>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-6">
                        {elec.description}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate(`/vote/${elec._id}`)}
                      className="w-full text-center py-2.5 rounded-xl border border-slate-200 hover:border-[#0B3C95] hover:text-[#0B3C95] text-slate-700 font-semibold text-xs transition duration-200"
                    >
                      View Ballot
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-[#101D2D] text-white pt-16 pb-8 px-4 md:px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-12">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <span className="w-8 h-8 rounded-lg bg-white text-[#101D2D] grid place-items-center text-sm font-black">
                SB
              </span>
              Safe Ballot
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              A secure, accessible online voting platform for every eligible citizen. Federally certified & independently audited.
            </p>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Federally certified & independently audited
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-3 gap-6">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Voting</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#how-it-works" className="hover:text-white">How to Vote</a></li>
                <li><Link to="/kyc" className="hover:text-white">Check Registration</Link></li>
                <li><a href="#active-ballots" className="hover:text-white">Active Elections</a></li>
                <li><Link to="/verify" className="hover:text-white">Verify My Vote</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Security</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><span className="cursor-default hover:text-white">Encryption Standards</span></li>
                <li><span className="cursor-default hover:text-white">Audit Reports</span></li>
                <li><span className="cursor-default hover:text-white">Certifications</span></li>
                <li><span className="cursor-default hover:text-white">Bug Bounty</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><span className="cursor-default hover:text-white">Help Center</span></li>
                <li><span className="cursor-default hover:text-white">Accessibility</span></li>
                <li><span className="cursor-default hover:text-white">Contact Us</span></li>
                <li><span className="cursor-default hover:text-white">Languages</span></li>
              </ul>
            </div>
          </div>

        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
          <div>
            © 2026 Safe Ballot. An official electoral services platform. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Accessibility Statement</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
