import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-wider bg-blue-50 text-[#0B3C95] border border-blue-100 px-3 py-1 rounded-full">
          BCA - MMAMC 8th Sem Project
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          About the Creators
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Safe Ballot is a secure, biometric-verified online voting platform engineered to deliver end-to-end encryption for civic democracy.
        </p>
      </div>

      {/* Creators Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        
        {/* Creator 1: Kiran */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 hover-lift shadow-sm text-center space-y-6">
          <div className="w-24 h-24 bg-blue-100 text-[#0B3C95] rounded-full flex items-center justify-center mx-auto text-4xl font-extrabold">
            K
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Kiran Mainali</h3>
            <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider mt-1">Full-Stack Engineer & AI lead</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Designed the cryptographic token verification logic, managed MongoDB database optimization, and trained the facial recognition system integration for secure voter authentication.
          </p>
          <div className="pt-4 border-t border-slate-100 flex justify-center gap-4 text-xs font-semibold text-slate-400">
            <span>BCA - MMAMC</span>
            <span>·</span>
            <span>8th Semester</span>
          </div>
        </div>

        {/* Creator 2: Nirmal */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 hover-lift shadow-sm text-center space-y-6">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-4xl font-extrabold">
            N
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Nirmal</h3>
            <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider mt-1">UI/UX Designer & Backend Developer</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Crafted the responsive user experience, designed the high-fidelity component layouts, and engineered the secure email/SMS OTP notification engine.
          </p>
          <div className="pt-4 border-t border-slate-100 flex justify-center gap-4 text-xs font-semibold text-slate-400">
            <span>BCA - MMAMC</span>
            <span>·</span>
            <span>8th Semester</span>
          </div>
        </div>

      </div>

      {/* Project Overview details */}
      <div className="bg-white border border-[#E5E4DE] rounded-3xl p-8 md:p-12 max-w-4xl mx-auto shadow-sm">
        <h3 className="text-2xl font-extrabold text-[#0B3C95] mb-4">Project Overview</h3>
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-6">
          Safe Ballot solves the problem of remote voter authentication and ballot tampering by combining state-of-the-art cryptographic hashing, biometric face comparison, and secure session tracking. It provides electoral services with a tamper-proof digital ballot box that can be audited by independent parties.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Frontend Stack</h4>
            <p className="text-xs text-slate-800 font-semibold">React, Vite, Tailwind CSS, Zustand</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Backend Stack</h4>
            <p className="text-xs text-slate-800 font-semibold">Node.js, Express, Socket.io</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Database Layer</h4>
            <p className="text-xs text-slate-800 font-semibold">MongoDB (Mongoose ReplicaSet)</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Verification AI</h4>
            <p className="text-xs text-slate-800 font-semibold">Face API / Biometric Scoring</p>
          </div>
        </div>

        <div className="text-center pt-8 mt-6 border-t border-slate-100">
          <Link to="/" className="bg-[#0B3C95] hover:bg-[#072C70] text-white font-bold py-3 px-8 rounded-xl text-xs transition inline-block">
            Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
