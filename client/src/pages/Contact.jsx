import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/authStore";
import { submitContactApi } from "../api/contact.api";

export default function Contact() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Pre-populate user details if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Handle accordion toggle
  const [openFaq, setOpenFaq] = useState(null);
  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email address";

    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    else if (formData.subject.trim().length < 3) newErrors.subject = "Subject must be at least 3 characters";

    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.trim().length < 10) newErrors.message = "Message must be at least 10 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    if (!validate()) return;

    setLoading(true);
    try {
      await submitContactApi(formData);
      setSuccess(true);
      setFormData((prev) => ({
        ...prev,
        subject: "",
        message: "",
      }));
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: "How is my vote kept anonymous?",
      a: "Safe Ballot hashes and encrypts your identity separately from your cast vote. The digital ballot box holds only cryptographically signed votes without linking back to the voter records, ensuring absolute voting privacy.",
    },
    {
      q: "I am having issues with facial verification. What should I do?",
      a: "Ensure you are in a well-lit room without strong backlighting. Keep your face centered in the camera frame. Make sure camera access is allowed in your browser settings. If it still fails, contact support to manually review your KYC data.",
    },
    {
      q: "Who audits the election results?",
      a: "Verified independent auditors receive special access to check cryptographic signatures and total ballot tallies without exposing individual voters. This guarantees fully transparent and secure elections.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-wider bg-blue-50 text-[#0B3C95] border border-blue-100 px-3 py-1 rounded-full">
          Support & Queries
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Get in Touch
        </h1>
        <p className="text-base text-slate-500 leading-relaxed">
          Have questions about biometric verification, encryption, or auditing? Our support team is here to help you cast your vote safely.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form Column */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Send Us a Message</h2>
          <p className="text-xs text-slate-400">Fields marked with * are required.</p>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-xs font-semibold">
              Thank you! Your message has been sent successfully. We will get back to you soon.
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading || !!user}
                  placeholder="John Doe"
                  className={`w-full bg-slate-50/50 border ${errors.name ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:border-[#0B3C95] focus:ring-blue-100"
                    } rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 transition duration-200 disabled:opacity-60`}
                />
                {errors.name && <p className="text-[10px] font-bold text-rose-500">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading || !!user}
                  placeholder="john@example.com"
                  className={`w-full bg-slate-50/50 border ${errors.email ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:border-[#0B3C95] focus:ring-blue-100"
                    } rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 transition duration-200 disabled:opacity-60`}
                />
                {errors.email && <p className="text-[10px] font-bold text-rose-500">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                disabled={loading}
                placeholder="Inquiry about ballot audit logic"
                className={`w-full bg-slate-50/50 border ${errors.subject ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:border-[#0B3C95] focus:ring-blue-100"
                  } rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 transition duration-200`}
              />
              {errors.subject && <p className="text-[10px] font-bold text-rose-500">{errors.subject}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                disabled={loading}
                rows={5}
                placeholder="Type your message here..."
                className={`w-full bg-slate-50/50 border ${errors.message ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:border-[#0B3C95] focus:ring-blue-100"
                  } rounded-xl px-4 py-3 text-xs outline-none focus:ring-4 transition duration-200 resize-none`}
              />
              {errors.message && <p className="text-[10px] font-bold text-rose-500">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0B3C95] hover:bg-[#072C70] text-white font-bold py-3.5 px-8 rounded-xl text-xs transition duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        </div>

        {/* Info & FAQ Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Info Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Contact Details</h3>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B3C95] flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  @
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Support</h4>
                  <p className="text-xs text-slate-500 mt-0.5">kiranmainalialt@gmail.com</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  ☏
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Phone Line</h4>
                  <p className="text-xs text-slate-500 mt-0.5">+977-9807085526</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  📍
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Headquarters</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Safe Ballot Authority, RANJANI
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 leading-relaxed">
                Operating hours: Monday to Friday, 9:00 AM – 5:00 PM EST. Verification servers operate 24/7.
              </p>
            </div>
          </div>

          {/* Accordion FAQ Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h3>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center text-left text-xs font-bold text-slate-800 hover:text-[#0B3C95] transition cursor-pointer py-1"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-400 font-bold ml-2">
                      {openFaq === idx ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === idx && (
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed animate-fade-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
