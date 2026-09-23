import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";
import Footer from "../components/Footer";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    destination: "Pondicherry",
    subject: "",
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
    // Simulating quick responsive submission feedback
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-[#D7A441] selection:text-black font-sans">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[1000px] rounded-full bg-[#D7A441]/5 blur-[140px]" />
        <div className="absolute top-[40%] left-[-10%] h-[400px] w-[500px] rounded-full bg-[#B88428]/5 blur-[120px]" />
      </div>

      <main className="relative z-10">
        {/* ============================================================
            HERO SECTION
        ============================================================ */}
        <section className="relative border-b border-white/10 px-4 pt-28 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center justify-center gap-2 text-xs font-medium text-white/50">
              <Link to="/" className="hover:text-[#D7A441] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#D7A441]">Contact &amp; Customer Support</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#D7A441]/30 bg-[#D7A441]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D7A441] mb-6">
              <Sparkles size={14} />
              <span>We Are Here To Assist You</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-serif">
              Contact <span className="text-[#D7A441]">Starlight Hotels</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/70 max-w-2xl mx-auto">
              Whether you need assistance with room bookings, special corporate inquiries, destination wedding itineraries, or stay logistics across South India, our central concierge is available around the clock.
            </p>
          </div>
        </section>

        {/* ============================================================
            CONTACT CARDS & INQUIRY FORM GRID
        ============================================================ */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12">

            {/* LEFT COLUMN: DIRECT CONNECT CHANNELS & REGIONS (5 cols) */}
            <div className="space-y-6 lg:col-span-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D7A441]">
                  Direct Access
                </span>
                <h2 className="mt-1 text-2xl font-bold text-white font-serif">
                  Get in Touch Directly
                </h2>
                <p className="mt-2 text-xs text-white/60">
                  Connect immediately with our dedicated front-desk &amp; customer care team.
                </p>
              </div>

              {/* CARD 1: PHONE */}
              <a
                href="tel:+918270660904"
                className="group flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-[#D7A441]/50 hover:bg-white/10 cursor-pointer"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D7A441]/20 text-[#D7A441] group-hover:scale-105 transition-transform">
                  <Phone size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#D7A441] transition-colors">
                    24/7 Central Reservations
                  </h3>
                  <p className="text-base font-semibold text-white/95 mt-0.5">
                    +91 8270660904
                  </p>
                  <p className="text-[11px] text-white/50 mt-1">
                    Call for direct booking rates, cancellations, or property directions.
                  </p>
                </div>
              </a>

              {/* CARD 2: WHATSAPP */}
              <a
                href="https://wa.me/message/NQ3KK6GPLZXNK1"
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-[#25D366]/50 hover:bg-[#25D366]/5 cursor-pointer"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/20 text-[#25D366] group-hover:scale-105 transition-transform">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#25D366] transition-colors">
                    Instant WhatsApp Support
                  </h3>
                  <p className="text-sm font-semibold text-white/95 mt-0.5">
                    Chat with Concierge Desk
                  </p>
                  <p className="text-[11px] text-white/50 mt-1">
                    Fastest way to get room photos, directions, and instant booking help.
                  </p>
                </div>
              </a>

              {/* CARD 3: EMAIL */}
              <a
                href="mailto:info@starlighthotels.in"
                className="group flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all hover:border-amber-400/50 hover:bg-amber-400/5 cursor-pointer"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300 group-hover:scale-105 transition-transform">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Official Inquiries &amp; Corporate
                  </h3>
                  <p className="text-sm font-semibold text-white/95 mt-0.5">
                    info@starlighthotels.in
                  </p>
                  <p className="text-[11px] text-white/50 mt-1">
                    Corporate tie-ups, bulk group stays, invoices, and general feedback.
                  </p>
                </div>
              </a>

              {/* LOCATIONS LIST */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D7A441]">
                  Our Destinations
                </span>
                <h4 className="mt-1 text-sm font-bold text-white">
                  Property Hubs &amp; Regional Presence
                </h4>
                <div className="mt-4 space-y-3 text-xs text-white/70">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={15} className="text-[#D7A441] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Pondicherry:</strong> Kottakuppam, Auroville, Kuyavarpalayam, Karuvadikuppam
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={15} className="text-[#D7A441] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Chennai:</strong> T. Nagar, Mylapore, DLF Manapakkam, OMR Thoraipakkam
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={15} className="text-[#D7A441] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Kodaikanal:</strong> Vilpatti &amp; Hillside Retreats
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: INQUIRY FORM (7 cols) */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 backdrop-blur-xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D7A441]">
                  Message Us
                </span>
                <h2 className="mt-1 text-2xl font-bold text-white font-serif">
                  Send a Hospitality Inquiry
                </h2>
                <p className="mt-1.5 text-xs text-white/60">
                  Fill in your details below and our reservations manager will get back to you within 2 hours.
                </p>

                {submitted ? (
                  <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center animate-fadeIn">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white">Message Received!</h3>
                    <p className="mt-2 text-xs text-white/70 max-w-md mx-auto">
                      Thank you for contacting Starlight Hotels. Our guest experience manager will reach out to you shortly via phone or email.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          destination: "Pondicherry",
                          subject: "",
                          message: "",
                        });
                      }}
                      className="mt-6 rounded-full bg-[#D7A441] px-6 py-2.5 text-xs font-bold text-neutral-950 transition hover:bg-[#c49332]"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Your full name"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur-md transition-all focus:border-[#D7A441] focus:bg-white/10 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="name@example.com"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur-md transition-all focus:border-[#D7A441] focus:bg-white/10 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">
                          Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur-md transition-all focus:border-[#D7A441] focus:bg-white/10 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">
                          Destination of Interest
                        </label>
                        <select
                          value={formData.destination}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              destination: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-white/15 bg-[#141416] px-4 py-3 text-sm text-white backdrop-blur-md transition-all focus:border-[#D7A441] focus:outline-hidden"
                        >
                          <option value="Pondicherry">Pondicherry</option>
                          <option value="Chennai">Chennai</option>
                          <option value="Kodaikanal">Kodaikanal</option>
                          <option value="General">General Inquiry</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        placeholder="e.g. Booking inquiry, Corporate stay, Special assistance"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur-md transition-all focus:border-[#D7A441] focus:bg-white/10 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Your Message / Requirements *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Tell us about your dates, guest count, or any special requests..."
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur-md transition-all focus:border-[#D7A441] focus:bg-white/10 focus:outline-hidden resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D7A441] via-[#E5B555] to-[#B88428] py-4 text-xs sm:text-sm font-bold text-neutral-950 shadow-lg shadow-[#D7A441]/20 transition-all hover:scale-101 hover:shadow-xl hover:from-[#C89532] hover:to-[#A7751E] cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Sending Message...</span>
                      ) : (
                        <>
                          <span>Submit Hospitality Inquiry</span>
                          <Send size={16} className="transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
}
