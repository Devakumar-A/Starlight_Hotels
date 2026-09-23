import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Clock,
  FileText,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Footer from "../components/Footer";

// ============================================================
// COMPREHENSIVE FAQ DATA COMPILED FROM TERMS & CONDITIONS AND PRIVACY POLICY
// ============================================================
const FAQ_CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "checkin", label: "Check-In & Timings" },
  { id: "booking", label: "Bookings & Cancellation" },
  { id: "policies", label: "Guest & Visitor Policies" },
  { id: "smoking", label: "Smoking & Room Care" },
  { id: "payment", label: "Pricing & Payments" },
  { id: "privacy", label: "Privacy & Data Security" },
];

const FAQS = [
  // CHECK-IN & TIMINGS
  {
    category: "checkin",
    question: "What are the standard check-in and check-out times at Starlight Hotels?",
    answer:
      "Our standard check-in time is from 12:00 PM (Noon), and check-out is by 11:00 AM. Early check-in or late check-out requests are subject to room availability upon arrival and may incur nominal additional charges. Please notify the property in advance if you anticipate arriving outside standard hours.",
  },
  {
    category: "checkin",
    question: "What is the Local Guest Policy and check-in cutoff?",
    answer:
      "Local guests are warmly welcomed at Starlight Hotels. However, under our safety and security guidelines, the local guest check-in and check-out verification cutoff is 6:00 PM. Local guests must present valid government-issued photo identification upon arrival.",
  },
  {
    category: "checkin",
    question: "What identification documents are required at check-in?",
    answer:
      "Every adult guest staying at Starlight Hotels must provide an original government-issued photo ID at check-in. Valid IDs include Aadhaar Card, Passport, Driving License, or Voter ID. Please note that PAN Cards are not accepted as valid proof of address under local hospitality regulations. Foreign nationals must present a valid passport, visa, and complete Form C compliance.",
  },

  // BOOKINGS & CANCELLATION
  {
    category: "booking",
    question: "How do I make a reservation and get the best direct rates?",
    answer:
      "You can book directly on our official website (www.starlighthotels.in) by selecting your destination, travel dates, and room category. Direct bookings guarantee our lowest direct rates, complimentary Wi-Fi, and personalized concierge support without hidden booking commissions.",
  },
  {
    category: "booking",
    question: "What is Starlight Hotels' cancellation and refund policy?",
    answer:
      "Cancellation terms depend on the rate plan chosen during reservation. Flexible rate bookings cancelled within the complimentary cancellation window (typically 24 to 48 hours prior to check-in) receive a full refund. Bookings made under non-refundable promotional rates, same-day cancellations, or no-shows are subject to full retention charges as specified in our Terms & Conditions.",
  },
  {
    category: "booking",
    question: "Can I modify my travel dates after confirming a booking?",
    answer:
      "Yes, date modifications are permitted subject to room availability and rate difference for the revised dates. Please contact our 24/7 reservations team at +91 8270660904 or info@starlighthotels.in at least 24 hours prior to your scheduled check-in.",
  },

  // GUEST & VISITOR POLICIES
  {
    category: "policies",
    question: "What is the policy regarding visitors in guest rooms?",
    answer:
      "For the comfort, privacy, and safety of all residents, non-registered visitors are permitted in designated public lobby areas and dining spaces. Non-registered visitors are strictly not permitted in guest rooms overnight or past designated evening hours without registering at the front desk with valid government photo identification.",
  },
  {
    category: "policies",
    question: "What is the child and extra occupant policy?",
    answer:
      "Children aged 5 years and below can stay free of charge when utilizing existing bedding. For children aged 6 years and above or additional adult guests, an extra bed/mattress request is required and will be charged according to the property's published extra occupancy tariff.",
  },
  {
    category: "policies",
    question: "Are pets allowed at Starlight Hotels properties?",
    answer:
      "Pet policies vary by property location. While select boutique villas and retreat suites accommodate pets with prior notice, standard urban hotel branches may have pet restrictions. Please contact our team ahead of your stay to confirm pet-friendly arrangements.",
  },

  // SMOKING & ROOM CARE
  {
    category: "smoking",
    question: "Is smoking permitted inside guest rooms?",
    answer:
      "Smoking is permitted inside guest rooms. However, guests are strictly required to use the provided ashtrays and exercise utmost caution to prevent burns or damage to bed linens, furnishings, and carpets. Smoking in enclosed public corridors, elevators, and reception lobbies is strictly prohibited.",
  },
  {
    category: "smoking",
    question: "What is the guest responsibility regarding room breakages or property damage?",
    answer:
      "Guests are expected to treat hotel rooms, fittings, electronics, and furnishings with reasonable care. Any intentional damage, severe linen staining, or breakage of hotel assets will be evaluated and charged to the guest's folio upon checkout in accordance with Clause 10 of our Terms & Conditions.",
  },

  // PRICING & PAYMENTS
  {
    category: "payment",
    question: "What payment methods are accepted at Starlight Hotels?",
    answer:
      "We accept all major credit/debit cards (Visa, MasterCard, RuPay), UPI payments (Google Pay, PhonePe, Paytm), Net Banking, and direct front-desk cash/card settlements upon arrival. Pre-authorization may be required for specific promotional or seasonal rates.",
  },
  {
    category: "payment",
    question: "Are taxes included in the displayed room tariff?",
    answer:
      "Our direct room rates indicate whether GST is inclusive or clearly itemized. In India, Goods and Services Tax (GST) is levied as per prevailing government statutory hospitality tax brackets based on the declared nightly room rate.",
  },

  // PRIVACY & DATA SECURITY
  {
    category: "privacy",
    question: "How does Starlight Hotels safeguard my personal data?",
    answer:
      "We strictly adhere to Indian data protection principles and Information Technology Act regulations. Your personal information (name, contact number, ID copy, transaction records) is encrypted, stored on secure servers, and accessed only by authorized personnel for reservation fulfillment and statutory compliance.",
  },
  {
    category: "privacy",
    question: "Will my contact information be shared with third parties or advertisers?",
    answer:
      "Never. Starlight Hotels does not sell, rent, or lease your personal data to third-party advertisers. Personal information is only shared with authorized payment gateways for processing your transaction or law enforcement authorities when strictly required by mandatory statutory law.",
  },
  {
    category: "privacy",
    question: "Can I request deletion or correction of my personal data?",
    answer:
      "Yes. You have the right to request review, update, or deletion of your personal records from our marketing databases at any time. Simply email our data privacy desk at info@starlighthotels.in with your request.",
  },
];

export default function FAQs() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-[#D7A441] selection:text-black font-sans">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[1000px] rounded-full bg-[#D7A441]/5 blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] h-[400px] w-[500px] rounded-full bg-[#B88428]/5 blur-[120px]" />
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
              <span className="text-[#D7A441]">Frequently Asked Questions</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#D7A441]/30 bg-[#D7A441]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D7A441] mb-6">
              <HelpCircle size={14} />
              <span>Guest Help Center &amp; Stay Policies</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-serif">
              Frequently Asked <span className="text-[#D7A441]">Questions</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/70 max-w-2xl mx-auto">
              Everything you need to know about booking, check-in logistics, guest conduct, cancellation policies, and data security across Starlight Hotels.
            </p>

            {/* Live Search Input */}
            <div className="mt-8 relative max-w-xl mx-auto">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Search topics (e.g. check-in, smoking, cancellation, IDs)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 pl-11 pr-10 text-sm text-white placeholder-white/40 backdrop-blur-md transition-all focus:border-[#D7A441] focus:bg-white/10 focus:outline-hidden focus:ring-1 focus:ring-[#D7A441]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================
            CATEGORIES FILTER PILLS
        ============================================================ */}
        <section className="px-4 py-6 border-b border-white/10 sticky top-[60px] z-20 bg-[#0A0A0B]/90 backdrop-blur-xl">
          <div className="mx-auto max-w-5xl flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOpenIndex(null);
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-[#D7A441] to-[#B88428] text-neutral-950 shadow-md shadow-[#D7A441]/20 scale-102"
                    : "border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* ============================================================
            FAQ ACCORDION LIST
        ============================================================ */}
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-md">
              <HelpCircle size={40} className="mx-auto text-white/30 mb-3" />
              <h3 className="text-lg font-bold text-white">No questions found</h3>
              <p className="mt-1 text-xs text-white/50">
                We couldn&apos;t find anything matching &quot;{searchQuery}&quot;. Try searching for &quot;check-in&quot;, &quot;ID&quot;, &quot;cancel&quot;, or reach out directly to our concierge team.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-5 rounded-full bg-[#D7A441] px-5 py-2 text-xs font-bold text-neutral-950 transition hover:bg-[#c49332]"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <article
                    key={index}
                    className={`overflow-hidden rounded-2xl border transition-all duration-200 backdrop-blur-md ${
                      isOpen
                        ? "border-[#D7A441]/60 bg-white/10 shadow-lg shadow-black/40"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/7"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(index)}
                      className="flex w-full items-center justify-between p-5 sm:p-6 text-left cursor-pointer transition-colors"
                    >
                      <span className="text-sm sm:text-base font-bold text-white/95 pr-4 flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D7A441]/15 text-[#D7A441] text-xs font-mono">
                          Q
                        </span>
                        {faq.question}
                      </span>
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 transition-transform duration-300 ${
                          isOpen ? "rotate-180 bg-[#D7A441] text-neutral-950 border-[#D7A441]" : "text-white/60 bg-white/5"
                        }`}
                      >
                        <ChevronDown size={16} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/10 px-5 pt-3 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm leading-relaxed text-white/80 animate-fadeIn">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {/* ============================================================
              POLICY QUICK LINKS BANNER
          ============================================================ */}
          <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D7A441]">
                  Official Documents
                </span>
                <h3 className="text-lg font-bold text-white">
                  Looking for detailed clauses or legal terms?
                </h3>
                <p className="text-xs text-white/60">
                  Read our full statutory Terms &amp; Conditions and data handling practices.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/terms"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:border-[#D7A441] hover:text-[#D7A441] hover:bg-[#D7A441]/10"
                >
                  <FileText size={14} className="text-[#D7A441]" />
                  <span>Terms &amp; Conditions</span>
                </Link>
                <Link
                  to="/privacy"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white transition hover:border-[#D7A441] hover:text-[#D7A441] hover:bg-[#D7A441]/10"
                >
                  <ShieldCheck size={14} className="text-[#D7A441]" />
                  <span>Privacy Policy</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ============================================================
              NEED HELP? DIRECT SUPPORT CARDS
          ============================================================ */}
          <div className="mt-12 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D7A441] block mb-2">
              Still Need Assistance?
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white font-serif">
              Our 24/7 Concierge Is Here For You
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-white/60 max-w-md mx-auto">
              Have specific room requirements, itinerary queries, or late check-in needs? Reach our central reservations team directly.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="https://wa.me/message/NQ3KK6GPLZXNK1"
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-[#25D366]/50 hover:bg-[#25D366]/10 transition-all cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] mb-3 group-hover:scale-110 transition-transform">
                  <MessageCircle size={20} />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-[#25D366] transition-colors">
                  WhatsApp Support
                </span>
                <span className="text-[11px] text-white/50 mt-1">Instant Response</span>
              </a>

              <a
                href="tel:+918270660904"
                className="group flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D7A441]/50 hover:bg-[#D7A441]/10 transition-all cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full bg-[#D7A441]/20 flex items-center justify-center text-[#D7A441] mb-3 group-hover:scale-110 transition-transform">
                  <Phone size={20} />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-[#D7A441] transition-colors">
                  Call Concierge
                </span>
                <span className="text-[11px] text-white/50 mt-1">+91 8270660904</span>
              </a>

              <a
                href="mailto:info@starlighthotels.in"
                className="group flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-amber-400/50 hover:bg-amber-400/10 transition-all cursor-pointer"
              >
                <div className="h-10 w-10 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-110 transition-transform">
                  <Mail size={20} />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  Email Desk
                </span>
                <span className="text-[11px] text-white/50 mt-1">info@starlighthotels.in</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* GLOBAL FOOTER */}
      <Footer />
    </div>
  );
}
