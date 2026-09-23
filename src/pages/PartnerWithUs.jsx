import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Handshake,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users2,
} from "lucide-react";
import Footer from "../components/Footer";

export default function PartnerWithUs() {
  const [formData, setFormData] = useState({
    partnerName: "",
    propertyName: "",
    email: "",
    phone: "",
    city: "",
    roomCount: "",
    partnershipType: "Full Management",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-[#D7A441] selection:text-black font-sans">
      {/* Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[1000px] rounded-full bg-[#D7A441]/5 blur-[140px]" />
        <div className="absolute top-[50%] right-[-10%] h-[400px] w-[500px] rounded-full bg-[#B88428]/5 blur-[120px]" />
      </div>

      <main className="relative z-10">
        {/* HERO */}
        <section className="relative border-b border-white/10 px-4 pt-28 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center justify-center gap-2 text-xs font-medium text-white/50">
              <Link to="/" className="hover:text-[#D7A441] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#D7A441]">Partner With Starlight</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#D7A441]/30 bg-[#D7A441]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D7A441] mb-6">
              <Handshake size={14} />
              <span>Hospitality Growth &amp; Brand Alliances</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-serif">
              Partner with <span className="text-[#D7A441]">Starlight Hotels</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/70 max-w-2xl mx-auto">
              Join South India&apos;s fastest growing luxury hospitality collection. Transform your property&apos;s occupancy, elevate guest prestige, and unlock consistent revenue growth.
            </p>
          </div>
        </section>

        {/* VALUE PILLARS */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D7A441]">
              Why Starlight
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-white font-serif">
              The Starlight Advantage for Property Owners
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all hover:border-[#D7A441]/40 hover:bg-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D7A441]/20 text-[#D7A441] mb-5">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Higher RevPAR &amp; Direct Bookings</h3>
              <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed">
                Direct booking engine algorithms and corporate contract networks reduce reliance on high-commission aggregators, delivering higher net operating income.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all hover:border-[#D7A441]/40 hover:bg-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D7A441]/20 text-[#D7A441] mb-5">
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Standardized Luxury Branding</h3>
              <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed">
                Comprehensive SOPs, staff hospitality training, premium linen standards, and technology integration immediately enhance your property&apos;s online ratings.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-all hover:border-[#D7A441]/40 hover:bg-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D7A441]/20 text-[#D7A441] mb-5">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Transparent Revenue Management</h3>
              <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed">
                Automated inventory management, real-time analytics, and transparent monthly settlement reports ensure total visibility and peace of mind for owners.
              </p>
            </div>
          </div>
        </section>

        {/* PARTNERSHIP FORM & DIRECT CONNECT */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 items-start">

            <div className="space-y-6 lg:col-span-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D7A441]">
                Alliance Desk
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-white font-serif">
                Let&apos;s Build Success Together
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Whether you own a boutique hotel, a scenic hillside resort, or luxury private villas across South India, our development team is eager to evaluate your asset.
              </p>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-[#D7A441]" />
                  <div>
                    <span className="text-[10px] text-white/40 block">Partnership Hotline</span>
                    <a href="tel:+918270660904" className="text-sm font-bold text-white hover:text-[#D7A441]">
                      +91 8270660904
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                  <Mail size={18} className="text-[#D7A441]" />
                  <div>
                    <span className="text-[10px] text-white/40 block">Corporate Email</span>
                    <a href="mailto:info@starlighthotels.in" className="text-sm font-bold text-white hover:text-[#D7A441]">
                      info@starlighthotels.in
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white font-serif">
                  Partner Evaluation Form
                </h3>
                <p className="mt-1 text-xs text-white/60">
                  Share brief details about your property for a confidential assessment.
                </p>

                {submitted ? (
                  <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center animate-fadeIn">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Proposal Received!</h3>
                    <p className="mt-2 text-xs text-white/70 max-w-md mx-auto">
                      Thank you for your interest in partnering with Starlight Hotels. Our business development team will review your property details and contact you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.partnerName}
                          onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                          placeholder="Your Name"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-[#D7A441] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Property / Entity Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.propertyName}
                          onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                          placeholder="Property Name"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-[#D7A441] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91..."
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-[#D7A441] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@example.com"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-[#D7A441] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          City / Region *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="e.g. Pondicherry, Chennai, Kodaikanal"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-[#D7A441] focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                          Approx. Room / Key Count
                        </label>
                        <input
                          type="text"
                          value={formData.roomCount}
                          onChange={(e) => setFormData({ ...formData, roomCount: e.target.value })}
                          placeholder="e.g. 15 rooms, 2 villas"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-[#D7A441] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">
                        Brief Note or Proposal
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about the property status, current occupancy, or partnership objectives..."
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-[#D7A441] focus:outline-hidden resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D7A441] to-[#B88428] py-3.5 text-xs sm:text-sm font-bold text-neutral-950 transition-all hover:brightness-110 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Submitting..." : "Submit Partnership Request"}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
