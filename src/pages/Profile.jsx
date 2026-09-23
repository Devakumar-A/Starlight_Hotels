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
  ArrowRight,
  ChevronRight,
  Lock,
  Hotel,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import Footer from "../components/Footer";

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
        window.location.href = "/";
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("users")
        .select(
          "full_name, email, phone, location, date_of_birth"
        )
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

      const { data, error } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null,
          location: formData.location.trim() || null,
          date_of_birth: formData.date_of_birth || null,
        })
        .eq("id", user.id)
        .select(
          "full_name, email, phone, location, date_of_birth"
        )
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
      setMessage(
        error?.message || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
          <div className="mx-auto max-w-5xl">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
              <div className="h-3 w-3 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
            </div>

            {/* Header skeleton */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-8 w-56 animate-pulse rounded-xl bg-neutral-200" />
                <div className="h-4 w-80 max-w-full animate-pulse rounded-lg bg-neutral-200" />
              </div>
              <div className="h-11 w-32 animate-pulse rounded-xl bg-neutral-200" />
            </div>

            {/* Profile card skeleton */}
            <div className="mt-8 rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-10 shadow-xs">
              <div className="flex items-center gap-5 border-b border-neutral-100 pb-8">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl animate-pulse bg-neutral-200" />
                <div className="space-y-3">
                  <div className="h-6 w-48 animate-pulse rounded-lg bg-neutral-200" />
                  <div className="h-4 w-64 animate-pulse rounded-lg bg-neutral-200" />
                </div>
              </div>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-28 rounded-2xl animate-pulse bg-neutral-100" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between text-neutral-900 selection:bg-neutral-200 selection:text-neutral-900">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumbs & Back Button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate("/");
                  }
                }}
                aria-label="Go back"
                title="Go back"
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-700 shadow-xs hover:border-[#D7A441] hover:text-[#B88428] hover:shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <ArrowLeft size={17} className="transition-transform hover:-translate-x-0.5" />
              </button>

              <nav className="flex items-center gap-2 text-xs text-neutral-500 font-medium min-w-0">
                <Link to="/" className="hover:text-neutral-900 transition-colors shrink-0">
                  Home
                </Link>
                <ChevronRight size={13} className="text-neutral-400 shrink-0" />
                <span className="text-neutral-400 shrink-0">Account</span>
                <ChevronRight size={13} className="text-neutral-400 shrink-0" />
                <span className="text-neutral-900 font-semibold truncate">Personal Profile</span>
              </nav>
            </div>
          </div>

          {/* Page Header */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Account & Preferences
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                Personal Profile
              </h1>
              <p className="mt-1.5 text-sm text-neutral-600">
                View and manage your personal credentials, contact information, and verification status.
              </p>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-xs transition hover:bg-neutral-50 hover:border-neutral-400 active:scale-[0.99]"
              >
                <Pencil size={15} className="text-neutral-600" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Message Notification (Success or Error) */}
          {message && (
            <div
              className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm transition-all ${
                isSuccessMessage
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-rose-200 bg-rose-50 text-rose-900"
              }`}
            >
              {isSuccessMessage ? (
                <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 font-medium">{message}</div>
              <button
                type="button"
                onClick={() => setMessage("")}
                className="text-neutral-400 hover:text-neutral-600 ml-auto"
                aria-label="Dismiss message"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* Main Profile Card */}
          <div className="mt-6 rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-8 md:p-10 shadow-xs">
            {/* User Identity Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-neutral-100 pb-8">
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Avatar with Initials */}
                <div className="flex h-16 w-16 sm:h-18 sm:w-18 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 text-white font-semibold text-lg sm:text-xl shadow-xs">
                  {userInitials}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 truncate">
                      {profile.full_name || "Starlight Guest"}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Verified Account
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-neutral-500 truncate">
                    {profile.email || "No email address registered"}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <div className="inline-flex items-center gap-2 rounded-xl bg-neutral-100/90 border border-neutral-200/70 px-3.5 py-2 text-xs font-medium text-neutral-700">
                  <ShieldCheck size={16} className="text-neutral-600" />
                  <span>Starlight Member</span>
                </div>
              </div>
            </div>

            {/* VIEW MODE */}
            {!editing && (
              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Personal Details
                  </h3>
                  <span className="text-xs text-neutral-400">
                    All details are kept private and secure
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {/* Full Name */}
                  <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-5 transition hover:border-neutral-300 hover:bg-neutral-50">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                          Full Name
                        </span>
                        <User size={16} className="text-neutral-400" />
                      </div>
                      <p className="mt-3 text-base font-semibold text-neutral-900 break-words">
                        {profile.full_name || "Not provided"}
                      </p>
                    </div>
                    <span className="mt-4 text-[11px] text-neutral-400">
                      Primary guest identifier
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-5 transition hover:border-neutral-300 hover:bg-neutral-50">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                          Email Address
                        </span>
                        <Mail size={16} className="text-neutral-400" />
                      </div>
                      <p className="mt-3 text-base font-semibold text-neutral-900 break-all">
                        {profile.email || "Not provided"}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-[11px] text-neutral-500">
                      <Lock size={12} className="text-neutral-400" />
                      <span>Primary login credential</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-5 transition hover:border-neutral-300 hover:bg-neutral-50">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                          Phone Number
                        </span>
                        <Phone size={16} className="text-neutral-400" />
                      </div>
                      <p className="mt-3 text-base font-semibold text-neutral-900">
                        {profile.phone || "Not provided"}
                      </p>
                    </div>
                    <span className="mt-4 text-[11px] text-neutral-400">
                      Used for booking updates & SMS
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-5 transition hover:border-neutral-300 hover:bg-neutral-50">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                          Location / City
                        </span>
                        <MapPin size={16} className="text-neutral-400" />
                      </div>
                      <p className="mt-3 text-base font-semibold text-neutral-900">
                        {profile.location || "Not provided"}
                      </p>
                    </div>
                    <span className="mt-4 text-[11px] text-neutral-400">
                      Resident city or country
                    </span>
                  </div>

                  {/* Date of Birth */}
                  <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-5 transition hover:border-neutral-300 hover:bg-neutral-50">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                          Date of Birth
                        </span>
                        <Calendar size={16} className="text-neutral-400" />
                      </div>
                      <p className="mt-3 text-base font-semibold text-neutral-900">
                        {profile.date_of_birth || "Not provided"}
                      </p>
                    </div>
                    <span className="mt-4 text-[11px] text-neutral-400">
                      Required for identity verification
                    </span>
                  </div>

                  {/* Security & Authentication Status */}
                  <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-5 transition hover:border-neutral-300 hover:bg-neutral-50">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                          Account Security
                        </span>
                        <ShieldCheck size={16} className="text-emerald-600" />
                      </div>
                      <p className="mt-3 text-base font-semibold text-neutral-900">
                        Password Protected
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Security credentials healthy</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EDIT MODE */}
            {editing && (
              <form onSubmit={handleSave} className="mt-8">
                <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">
                      Edit Profile Information
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Update your personal information below. Changes will reflect across all your bookings.
                    </p>
                  </div>
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
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
                      className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
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
                      className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
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
                      className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
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
                      className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                    />
                  </div>

                  {/* Info Box */}
                  <div className="flex items-center rounded-xl border border-neutral-200/80 bg-neutral-50 p-4 text-xs text-neutral-600">
                    <p>
                      <strong className="font-semibold text-neutral-800">Note:</strong> Your phone number and full name will be shared with the front desk concierge at check-in for identification purposes.
                    </p>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-neutral-100 pt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 active:scale-[0.99] disabled:opacity-50"
                  >
                    <X size={15} />
                    <span>Cancel</span>
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-black active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check size={16} />
                    <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Account Ecosystem & Shortcuts (Symmetrical 3-card grid) */}
          <div className="mt-10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
              Quick Management
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {/* My Bookings */}
              <Link
                to="/my-bookings"
                className="group flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-xs transition-all hover:border-neutral-400 hover:shadow-sm"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 transition-colors group-hover:bg-neutral-900 group-hover:text-white">
                    <Hotel size={20} />
                  </div>
                  <h4 className="mt-4 text-base font-semibold text-neutral-900">
                    My Reservations
                  </h4>
                  <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
                    View active bookings, check-in vouchers, and hotel receipts.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-neutral-800 group-hover:text-black">
                  <span>Manage stays</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              {/* Browse Luxury Stays */}
              <Link
                to="/book-hotels"
                className="group flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-xs transition-all hover:border-neutral-400 hover:shadow-sm"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 transition-colors group-hover:bg-neutral-900 group-hover:text-white">
                    <Sparkles size={20} />
                  </div>
                  <h4 className="mt-4 text-base font-semibold text-neutral-900">
                    Explore Starlights
                  </h4>
                  <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
                    Browse handpicked private suites, resorts, and destinations.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-neutral-800 group-hover:text-black">
                  <span>Search availability</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              {/* Concierge & Support */}
              <Link
                to="/about-us"
                className="group flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-xs transition-all hover:border-neutral-400 hover:shadow-sm"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 transition-colors group-hover:bg-neutral-900 group-hover:text-white">
                    <HelpCircle size={20} />
                  </div>
                  <h4 className="mt-4 text-base font-semibold text-neutral-900">
                    Guest Concierge
                  </h4>
                  <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
                    Need help with special requests or your account? We are here 24/7.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-neutral-800 group-hover:text-black">
                  <span>Contact concierge</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}