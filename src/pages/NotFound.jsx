import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between text-neutral-900">
      <main className="flex-1 flex items-center justify-center px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-md w-full rounded-3xl border border-neutral-200/90 bg-white p-8 sm:p-10 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800 mb-5">
            <Compass size={32} />
          </div>

          <span className="text-[11px] font-bold tracking-widest text-[#B88428] uppercase">
            404 Error
          </span>

          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Page Not Found
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-neutral-500 leading-relaxed">
            The requested destination or page could not be located. Please verify the URL or return to the main homepage.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black w-full shadow-xs active:scale-[0.99]"
          >
            <ArrowLeft size={16} />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}