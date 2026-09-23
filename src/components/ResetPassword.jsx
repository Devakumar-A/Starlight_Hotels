import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Handles cases where the recovery session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    setMessage("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage(error.message);
      setMessageType("error");
      setLoading(false);
      return;
    }

    setMessage("Password changed successfully.");
    setMessageType("success");

    setPassword("");
    setConfirmPassword("");

    // End the recovery session
    await supabase.auth.signOut();

    setTimeout(() => {
      window.location.href = "/";
    }, 2000);

    setLoading(false);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Invalid or expired link
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            This password reset link is no longer valid. Please request a new
            password reset email.
          </p>

          <button
            onClick={() => (window.location.href = "/")}
            className="mt-6 w-full rounded-md bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Starlight Hotels
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create a new password for your account
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5">

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-500"
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                messageType === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </button>

        </form>
      </div>
    </div>
  );
}