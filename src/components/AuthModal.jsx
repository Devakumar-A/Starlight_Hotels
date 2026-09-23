import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthModal({
  mode,
  onClose,
  onSwitch,
  onSuccess,
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const isSignup = mode === "signup";

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  // --------------------------------------------------
  // GOOGLE LOGIN
  // --------------------------------------------------

  const handleGoogleLogin = async () => {
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      showMessage(error.message, "error");
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // EMAIL / PASSWORD LOGIN + SIGNUP
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      if (isSignup) {
        const displayName =
          `${firstName.trim()} ${lastName.trim()}`.trim();

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: displayName,
              phone: phone || null,
              location: location || null,
              date_of_birth: dateOfBirth || null,
            },
          },
        });

        if (error) throw error;

        showMessage(
          "We've sent a confirmation email to your email address. Please click the link in the email to verify your account and continue.",
          "success"
        );

        return;
      }

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) throw error;

      if (onSuccess) {
        onSuccess(data.user);
      } else {
        onClose();
      }
    } catch (error) {
      showMessage(
        error?.message || "Authentication failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FORGOT PASSWORD
  // --------------------------------------------------

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showMessage(
        "Please enter your email address first.",
        "error"
      );
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetSent(true);

      showMessage(
        "We've sent a password reset link to your email address. Please check your inbox.",
        "success"
      );
    } catch (error) {
      showMessage(
        error?.message ||
          "Unable to send the password reset email.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FORGOT PASSWORD SCREEN
  // --------------------------------------------------

  if (showForgotPassword) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-sm"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="relative my-auto w-full max-w-md overflow-hidden rounded-[28px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)]">

          {/* Top Accent */}
          <div className="h-1.5 bg-gradient-to-r from-[#9B6B22] via-[#D4AF62] to-[#9B6B22]" />

          <div className="p-6 sm:p-8">

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500 transition hover:bg-black hover:text-white"
            >
              ×
            </button>

            {/* Icon */}
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F1E4] text-[#A77A2E]">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="10"
                  rx="2"
                />
                <path d="M7 11V8a5 5 0 0110 0v3" />
              </svg>
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#A77A2E]">
              Account Security
            </p>

            <h2 className="mt-2 pr-10 text-2xl font-semibold tracking-tight text-[#171717] sm:text-3xl">
              Reset your password
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Enter your email address and we'll send you a
              secure password reset link.
            </p>

            <form
              onSubmit={handleForgotPassword}
              className="mt-7 space-y-4"
            >
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#B88A3B] focus:bg-white focus:ring-4 focus:ring-[#B88A3B]/10"
                />
              </div>

              {message && (
                <div
                  className={`rounded-2xl p-4 text-sm leading-6 ${
                    messageType === "error"
                      ? "border border-red-100 bg-red-50 text-red-700"
                      : "border border-green-100 bg-green-50 text-green-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || resetSent}
                className="w-full rounded-2xl bg-[#151515] py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Sending..."
                  : resetSent
                    ? "Reset Email Sent"
                    : "Send Reset Link"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setMessage("");
                setResetSent(false);
              }}
              className="mt-6 w-full text-center text-sm font-semibold text-gray-600 transition hover:text-black"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN AUTH MODAL
  // --------------------------------------------------

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-sm sm:px-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative my-auto w-full max-w-4xl overflow-hidden rounded-[30px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.3)]">

        {/* Top Gold Accent */}
        <div className="absolute left-0 right-0 top-0 z-20 h-1 bg-gradient-to-r from-[#8D6423] via-[#D7B56A] to-[#8D6423]" />

        <div className="grid md:grid-cols-[0.85fr_1.15fr]">

          {/* =================================================
              BRAND PANEL
          ================================================= */}
          <div className="relative hidden overflow-hidden bg-[#141516] p-10 text-white md:flex md:min-h-[650px] md:flex-col md:justify-between lg:p-12">

            {/* Background glow */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#B88A3B]/15 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#B88A3B]/10 blur-3xl" />

            {/* Decorative lines */}
            <div className="absolute right-10 top-20 h-32 w-px bg-gradient-to-b from-transparent via-[#D4AF62]/50 to-transparent" />

            <div className="relative z-10">

              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF62]/60 text-[#D4AF62]">
                  <span className="text-sm font-semibold">
                    S
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold tracking-[0.25em]">
                    STARLIGHT
                  </p>
                  <p className="text-[8px] uppercase tracking-[0.35em] text-white/40">
                    Hotels & Resorts
                  </p>
                </div>
              </div>

              {/* Main text */}
              <div className="mt-24">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-[#D4AF62]" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#D4AF62]">
                    Welcome
                  </span>
                </div>

                <h3 className="max-w-sm text-4xl font-semibold leading-[1.08] tracking-tight lg:text-5xl">
                  {isSignup
                    ? "Begin your Starlight journey."
                    : "Welcome back to Starlight."}
                </h3>

                <p className="mt-7 max-w-sm text-sm leading-7 text-white/55">
                  {isSignup
                    ? "Create your account and make your next stay simpler, smoother and more personal."
                    : "Sign in to manage your bookings and continue planning your next stay."}
                </p>
              </div>
            </div>

            {/* Bottom quote */}
            <div className="relative z-10 border-t border-white/10 pt-6">
              <p className="text-xs leading-6 text-white/40">
                “Every stay is a story waiting to be discovered.”
              </p>
            </div>
          </div>

          {/* =================================================
              FORM PANEL
          ================================================= */}
          <div className="relative bg-white p-6 sm:p-8 lg:p-11">

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500 transition hover:bg-black hover:text-white"
            >
              ×
            </button>

            {/* Mobile brand */}
            <div className="mb-7 flex items-center gap-3 md:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171717] text-[#D4AF62]">
                <span className="text-sm font-semibold">
                  S
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.2em]">
                  STARLIGHT
                </p>
                <p className="text-[8px] uppercase tracking-[0.25em] text-gray-400">
                  Hotels & Resorts
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="pr-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#A77A2E]">
                {isSignup ? "Create Account" : "Member Access"}
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#151515]">
                {isSignup
                  ? "Create your account"
                  : "Welcome back"}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                {isSignup
                  ? "Create an account to book your stay."
                  : "Sign in to continue with your booking."}
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-4"
            >
              {/* Name */}
              {isSignup && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      First name
                    </label>

                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) =>
                        setFirstName(e.target.value)
                      }
                      required
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#B88A3B] focus:bg-white focus:ring-4 focus:ring-[#B88A3B]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Last name
                    </label>

                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) =>
                        setLastName(e.target.value)
                      }
                      required
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#B88A3B] focus:bg-white focus:ring-4 focus:ring-[#B88A3B]/10"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#B88A3B] focus:bg-white focus:ring-4 focus:ring-[#B88A3B]/10"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  minLength={6}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#B88A3B] focus:bg-white focus:ring-4 focus:ring-[#B88A3B]/10"
                />
              </div>

              {/* Forgot password */}
              {!isSignup && (
                <div className="-mt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setMessage("");
                    }}
                    className="text-xs font-semibold text-gray-500 transition hover:text-[#A77A2E]"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Signup fields */}
              {isSignup && (
                <>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Phone
                      <span className="ml-1 font-normal normal-case text-gray-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#B88A3B] focus:bg-white focus:ring-4 focus:ring-[#B88A3B]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Location
                      <span className="ml-1 font-normal normal-case text-gray-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      type="text"
                      placeholder="City or location"
                      value={location}
                      onChange={(e) =>
                        setLocation(e.target.value)
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#B88A3B] focus:bg-white focus:ring-4 focus:ring-[#B88A3B]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Date of birth
                      <span className="ml-1 font-normal normal-case text-gray-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) =>
                        setDateOfBirth(e.target.value)
                      }
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#B88A3B] focus:bg-white focus:ring-4 focus:ring-[#B88A3B]/10"
                    />
                  </div>
                </>
              )}

              {/* Message */}
              {message && (
                <div
                  className={`rounded-2xl border p-4 text-sm leading-6 ${
                    messageType === "error"
                      ? "border-red-100 bg-red-50 text-red-700"
                      : "border-green-100 bg-green-50 text-green-700"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#151515] py-3.5 text-sm font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#292929] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Please wait..."
                  : isSignup
                    ? "Create Account"
                    : "Sign In"}

                {!loading && (
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[10px] font-semibold tracking-[0.15em] text-gray-400">
                OR
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {/* Google Icon */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21.35 12.23c0-.79-.07-1.55-.2-2.28H12v4.31h5.23a4.47 4.47 0 01-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.39z"
                  fill="#4285F4"
                />
                <path
                  d="M12 21.67c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.75 9.75 0 0012 21.67z"
                  fill="#34A853"
                />
                <path
                  d="M6.54 13.78A5.86 5.86 0 016.23 12c0-.62.11-1.22.31-1.78v-2.5H3.3A9.75 9.75 0 002.25 12c0 1.57.38 3.05 1.05 4.28l3.24-2.5z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 6.19c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.28 14.63 2.33 12 2.33a9.75 9.75 0 00-8.7 5.39l3.24 2.5C7.31 7.91 9.46 6.19 12 6.19z"
                  fill="#EA4335"
                />
              </svg>

              Continue with Google
            </button>

            {/* Switch */}
            <div className="mt-6 text-center text-sm text-gray-500">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMessage("");
                      onSwitch("login");
                    }}
                    className="font-semibold text-[#9A6C27] underline-offset-4 transition hover:underline"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMessage("");
                      onSwitch("signup");
                    }}
                    className="font-semibold text-[#9A6C27] underline-offset-4 transition hover:underline"
                  >
                    Create one
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}