import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Pencil,
  Check,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  Crown,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import Footer from "../components/Footer";
import profileBg from "../assets/profile background.png";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    date_of_birth: "",
  });

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    location: "",
    date_of_birth: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (import.meta.env.DEV) {
          const previewProfile = {
            full_name: "asdfg",
            email: "devakumar.kl.in@gmail.com",
            phone: "1234567890",
            location: "",
            date_of_birth: "",
          };
          setProfile(previewProfile);
          setFormData({
            full_name: previewProfile.full_name,
            phone: previewProfile.phone,
            location: previewProfile.location,
            date_of_birth: previewProfile.date_of_birth,
          });
          setLoading(false);
          return;
        }
        window.location.href = "/";
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("users")
        .select("full_name, email, phone, location, date_of_birth")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const profileData = {
        full_name: data.full_name || "",
        email: data.email || user.email || "",
        phone: data.phone || "",
        location: data.location || "",
        date_of_birth: data.date_of_birth || "",
      };

      setProfile(profileData);

      setFormData({
        full_name: profileData.full_name,
        phone: profileData.phone,
        location: profileData.location,
        date_of_birth: profileData.date_of_birth,
      });
    } catch (error) {
      console.error("PROFILE ERROR:", error);
      setMessage("Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = () => {
    setMessage("");
    setFormData({
      full_name: profile.full_name,
      phone: profile.phone,
      location: profile.location,
      date_of_birth: profile.date_of_birth,
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name,
      phone: profile.phone,
      location: profile.location,
      date_of_birth: profile.date_of_birth,
    });
    setMessage("");
    setEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      setMessage("Full name is required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      if (!user && import.meta.env.DEV) {
        setProfile({
          ...profile,
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          location: formData.location.trim(),
          date_of_birth: formData.date_of_birth,
        });
        setEditing(false);
        setMessage("Profile updated successfully.");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null,
          location: formData.location.trim() || null,
          date_of_birth: formData.date_of_birth || null,
        })
        .eq("id", user.id)
        .select("full_name, email, phone, location, date_of_birth")
        .single();

      if (error) throw error;

      setProfile({
        full_name: data.full_name || "",
        email: data.email || user.email || "",
        phone: data.phone || "",
        location: data.location || "",
        date_of_birth: data.date_of_birth || "",
      });

      setFormData({
        full_name: data.full_name || "",
        phone: data.phone || "",
        location: data.location || "",
        date_of_birth: data.date_of_birth || "",
      });

      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("PROFILE UPDATE ERROR:", error);
      setMessage(error?.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  // Calculate user initials for the avatar badge
  const userInitials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : (profile.email?.[0] || "U").toUpperCase();

  const isSuccessMessage = message.toLowerCase().includes("success");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex flex-col justify-between text-neutral-900">
        {/* Skeleton Hero */}
        <section
          className="relative w-full overflow-hidden bg-[#FAF9F7]"
          style={{
            backgroundImage: `url(${profileBg})`,
            backgroundSize: "cover",
            backgroundPosition: "right center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, rgba(250, 249, 247, 0.88) 0%, rgba(250, 249, 247, 0.6) 28%, rgba(250, 249, 247, 0.2) 55%, rgba(250, 249, 247, 0) 75%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9 pb-24 sm:pb-28 lg:pb-32">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/80 animate-pulse border border-neutral-200" />
              <div className="h-4 w-44 rounded bg-neutral-200/80 animate-pulse" />
            </div>
            <div className="mt-7 max-w-xl space-y-3">
              <div className="h-3 w-36 rounded bg-[#D99D2B]/30 animate-pulse" />
              <div className="h-10 w-64 rounded-xl bg-neutral-300/60 animate-pulse" />
              <div className="h-4 w-96 max-w-full rounded bg-neutral-200/80 animate-pulse" />
            </div>
          </div>
        </section>

        {/* Skeleton Card */}
        <main className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 lg:-mt-18 pb-16 sm:pb-20">
          <div className="rounded-2xl sm:rounded-3xl border border-[#ECE8E1] bg-white p-6 sm:p-8 lg:p-10 shadow-[0_12px_40px_-15px_rgba(11,23,43,0.07)]">
            <div className="flex items-center gap-5 border-b border-neutral-100 pb-7">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-neutral-200 animate-pulse" />
              <div className="space-y-2.5">
                <div className="h-6 w-48 rounded bg-neutral-200 animate-pulse" />
                <div className="h-4 w-64 rounded bg-neutral-200 animate-pulse" />
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-24 rounded-2xl bg-[#FAF9F7] animate-pulse border border-[#ECE8E1]" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col justify-between text-neutral-900 selection:bg-[#FAF3E7] selection:text-[#0B172B]">
      {/* 1. UPPER HERO BANNER WITH LUXURY RESORT BACKGROUND */}
      <section
        className="relative w-full overflow-hidden bg-[#FAF9F7]"
        style={{
          backgroundImage: `url(${profileBg})`,
          backgroundSize: "cover",
          backgroundPosition: "right center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Soft, natural cream gradient overlay preserving text readability while showcasing resort & palm trees */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(250, 249, 247, 0.88) 0%, rgba(250, 249, 247, 0.6) 30%, rgba(250, 249, 247, 0.2) 55%, rgba(250, 249, 247, 0) 78%)",
          }}
        />

        {/* Mobile Supplementary Backdrop Tint */}
        <div className="absolute inset-0 bg-[#FAF9F7]/50 sm:hidden pointer-events-none" />

        {/* Hero Section Container */}
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9 pb-24 sm:pb-28 lg:pb-32">
          {/* Breadcrumb Navigation & Back Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              aria-label="Go back"
              title="Go back"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/90 bg-white/95 text-neutral-700 shadow-xs hover:border-[#D99D2B] hover:text-[#B88428] hover:bg-white hover:shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>

            <nav className="flex items-center gap-2 text-xs sm:text-[13px] text-neutral-500 font-medium">
              <Link to="/" className="hover:text-neutral-900 transition-colors">
                Home
              </Link>
              <span className="text-neutral-400 font-normal">&gt;</span>
              <span className="text-neutral-500">Account</span>
              <span className="text-neutral-400 font-normal">&gt;</span>
              <span className="text-neutral-900 font-semibold">Personal Profile</span>
            </nav>
          </div>

          {/* Heading Block */}
          <div className="mt-6 sm:mt-8 max-w-2xl">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#D99D2B]">
              ACCOUNT &amp; PREFERENCES
            </p>
            <h1 className="mt-1.5 sm:mt-2 text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#0B172B] tracking-tight leading-tight">
              Personal Profile
            </h1>
            <p className="mt-2 sm:mt-2.5 text-xs sm:text-sm lg:text-[15px] text-neutral-600 leading-relaxed font-normal">
              View and manage your personal credentials, contact information, and verification status.
            </p>
          </div>
        </div>
      </section>

      {/* 2. FLOATING PROFILE INFORMATION CARD OVERLAPPING HERO */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 lg:-mt-18 pb-16 sm:pb-24">
        {/* Floating White Profile Card */}
        <div className="rounded-2xl sm:rounded-3xl border border-[#ECE8E1] bg-white p-5 sm:p-8 lg:p-10 shadow-[0_12px_40px_-15px_rgba(11,23,43,0.07)]">
          {/* Identity Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6 pb-6 sm:pb-8 border-b border-neutral-100">
            {/* Left: Avatar with Initials + Display Name + Email */}
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-[#0B172B] text-white font-bold text-xl sm:text-2xl shadow-sm">
                {userInitials}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0B172B] tracking-tight truncate">
                    {profile.full_name || "Starlight Guest"}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F8F0] border border-[#BDE8CF] px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold text-[#15803D]">
                    <CheckCircle2 size={13} className="text-[#15803D]" />
                    Verified Account
                  </span>
                </div>

                <p className="mt-1 text-xs sm:text-sm text-neutral-500 truncate">
                  {profile.email || "No email address registered"}
                </p>
              </div>
            </div>

            {/* Right: Actions (Edit Profile + Membership Badge) */}
            <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
              {!editing && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FAF5EB] border border-[#EADBBA] px-5 py-2 text-xs sm:text-sm font-semibold text-[#8C5E1A] shadow-xs hover:bg-[#F3E8D3] hover:border-[#DEC596] active:scale-[0.99] transition cursor-pointer"
                >
                  <Pencil size={14} className="text-[#8C5E1A]" />
                  <span>Edit Profile</span>
                </button>
              )}

              <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FAF5EB] border border-[#EADBBA] px-4 py-2 text-xs sm:text-sm font-semibold text-[#8C5E1A]">
                <Crown size={15} className="text-[#D99D2B] fill-[#D99D2B]" />
                <span>Starlight Member</span>
              </div>
            </div>
          </div>

          {/* Feedback Message (Success or Error notification banner) */}
          {message && (
            <div
              className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-xs sm:text-sm transition-all ${
                isSuccessMessage
                  ? "border-[#BDE8CF] bg-[#E8F8F0] text-[#15803D]"
                  : "border-rose-200 bg-rose-50 text-rose-900"
              }`}
            >
              {isSuccessMessage ? (
                <CheckCircle2 size={18} className="text-[#15803D] mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 font-medium">{message}</div>
              <button
                type="button"
                onClick={() => setMessage("")}
                className="text-neutral-400 hover:text-neutral-600 ml-auto cursor-pointer"
                aria-label="Dismiss message"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* VIEW MODE: 3x2 Grid for Personal Information */}
          {!editing && (
            <div className="mt-7 sm:mt-9">
              {/* Personal Information Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5">
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#0B172B]">
                    Personal Information
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                    Your account details and contact information
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-normal">
                  <Lock size={13} className="text-neutral-400" />
                  <span>All details are kept private and secure</span>
                </div>
              </div>

              {/* 3 Columns x 2 Rows Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {/* 1. Full Name */}
                <div className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#EBE7DF] hover:border-[#D99D2B]/40 hover:shadow-xs transition-all">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E7] border border-[#F0E2C8] text-[#D99D2B]">
                    <User size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-neutral-500 block">
                      Full Name
                    </span>
                    <p className="mt-0.5 text-sm sm:text-base font-bold text-[#0B172B] break-words">
                      {profile.full_name || "Not provided"}
                    </p>
                    <span className="mt-1 text-xs text-neutral-400 block">
                      Primary guest identifier
                    </span>
                  </div>
                </div>

                {/* 2. Email Address */}
                <div className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#EBE7DF] hover:border-[#D99D2B]/40 hover:shadow-xs transition-all">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E7] border border-[#F0E2C8] text-[#D99D2B]">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-neutral-500 block">
                      Email Address
                    </span>
                    <p className="mt-0.5 text-sm sm:text-base font-bold text-[#0B172B] break-all">
                      {profile.email || "Not provided"}
                    </p>
                    <span className="mt-1 text-xs text-neutral-400 block">
                      Primary login credential
                    </span>
                  </div>
                </div>

                {/* 3. Phone Number */}
                <div className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#EBE7DF] hover:border-[#D99D2B]/40 hover:shadow-xs transition-all">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E7] border border-[#F0E2C8] text-[#D99D2B]">
                    <Phone size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-neutral-500 block">
                      Phone Number
                    </span>
                    <p className="mt-0.5 text-sm sm:text-base font-bold text-[#0B172B] break-words">
                      {profile.phone || "Not provided"}
                    </p>
                    <span className="mt-1 text-xs text-neutral-400 block">
                      Used for booking updates &amp; SMS
                    </span>
                  </div>
                </div>

                {/* 4. Location / City */}
                <div className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#EBE7DF] hover:border-[#D99D2B]/40 hover:shadow-xs transition-all">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E7] border border-[#F0E2C8] text-[#D99D2B]">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-neutral-500 block">
                      Location / City
                    </span>
                    <p className="mt-0.5 text-sm sm:text-base font-bold text-[#0B172B] break-words">
                      {profile.location || "Not provided"}
                    </p>
                    <span className="mt-1 text-xs text-neutral-400 block">
                      Resident city or country
                    </span>
                  </div>
                </div>

                {/* 5. Date of Birth */}
                <div className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#EBE7DF] hover:border-[#D99D2B]/40 hover:shadow-xs transition-all">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E7] border border-[#F0E2C8] text-[#D99D2B]">
                    <Calendar size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-neutral-500 block">
                      Date of Birth
                    </span>
                    <p className="mt-0.5 text-sm sm:text-base font-bold text-[#0B172B] break-words">
                      {profile.date_of_birth || "Not provided"}
                    </p>
                    <span className="mt-1 text-xs text-neutral-400 block">
                      Required for identity verification
                    </span>
                  </div>
                </div>

                {/* 6. Account Security */}
                <div className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#EBE7DF] hover:border-[#D99D2B]/40 hover:shadow-xs transition-all">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E7] border border-[#F0E2C8] text-[#D99D2B]">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-neutral-500 block">
                      Account Security
                    </span>
                    <p className="mt-0.5 text-sm sm:text-base font-bold text-[#0B172B] break-words">
                      Password Protected
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>Security credentials healthy</span>
                    </div>
                  </div>
                  <ShieldCheck size={18} className="text-emerald-600 shrink-0 self-center hidden sm:block" />
                </div>
              </div>
            </div>
          )}

          {/* EDIT MODE: Seamless Luxury Form Layout */}
          {editing && (
            <form onSubmit={handleSave} className="mt-7 sm:mt-9">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#0B172B]">
                    Edit Profile Information
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                    Update your personal information below. Changes will reflect across all your bookings.
                  </p>
                </div>
                <span className="self-start sm:self-auto rounded-full bg-[#FAF5EB] border border-[#EADBBA] px-3 py-1 text-xs font-semibold text-[#8C5E1A]">
                  Editing Mode
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#D99D2B] focus:ring-2 focus:ring-[#D99D2B]/20"
                  />
                </div>

                {/* Email (Disabled / Read-only) */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                      Email Address
                    </label>
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <Lock size={11} /> Read-only
                    </span>
                  </div>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-100/70 px-4 py-3 text-sm text-neutral-500 outline-none"
                  />
                  <p className="mt-1.5 text-[11px] text-neutral-400">
                    Email is linked to your login provider and cannot be changed here.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#D99D2B] focus:ring-2 focus:ring-[#D99D2B]/20"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                    Location / City
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#D99D2B] focus:ring-2 focus:ring-[#D99D2B]/20"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#D99D2B] focus:ring-2 focus:ring-[#D99D2B]/20"
                  />
                </div>

                {/* Info Note */}
                <div className="flex items-center rounded-xl border border-[#F0E2C8] bg-[#FAF3E7]/50 p-4 text-xs text-neutral-600">
                  <p>
                    <strong className="font-semibold text-[#8C5E1A]">Note:</strong> Your phone number and full name will be shared with the front desk concierge at check-in for identification purposes.
                  </p>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-neutral-100 pt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <X size={15} />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B172B] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#152542] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  <Check size={16} />
                  <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}