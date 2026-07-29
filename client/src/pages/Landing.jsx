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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 relative hover-lift">
              <div className="absolute top-6 right-6 text-2xl font-bold text-slate-200">01</div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B3C95] grid place-items-center mb-6">
                👤
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Verify Your Identity</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your voter ID and complete a secure biometric check. Takes under 2 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 relative hover-lift">
              <div className="absolute top-6 right-6 text-2xl font-bold text-slate-200">02</div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#0B3C95] grid place-items-center mb-6">
                📑
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Review Your Ballot</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                See all races and candidates for your district. Take your time — nothing is submitted until you confirm.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 relative hover-lift">
              <div className="absolute top-6 right-6 text-2xl font-bold text-slate-200">03</div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#0B3C95] grid place-items-center mb-6">
                🔐
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Cast & Encrypt</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your choices are encrypted the moment you submit. Even our servers cannot see how you voted.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 relative hover-lift">
              <div className="absolute top-6 right-6 text-2xl font-bold text-slate-200">04</div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center mb-6">
                ✓
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Get Your Receipt</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive a unique verification code. Use it any time to confirm your vote was counted correctly.
              </p>
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
            
            {/* Location Dropdown */}
            <div className="mt-4 md:mt-0 relative inline-block">
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
          </div>

          {/* Elections Grid */}
          {loading ? (
            <div className="py-20"><Loader /></div>
          ) : filteredElections.length === 0 ? (
            <div className="bg-white border border-[#E5E4DE] rounded-3xl p-12 text-center text-slate-500 max-w-lg mx-auto">
              No active elections found for {locationFilter === "All Locations" ? "your area" : locationFilter}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredElections.map((elec) => {
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
