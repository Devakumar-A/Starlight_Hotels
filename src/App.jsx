import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";

// Lazy-loaded route pages to keep initial bundle ultra-light
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Availability = lazy(() => import("./pages/Availability"));
const HotelDetails = lazy(() => import("./pages/HotelDetails"));
const Bookings = lazy(() => import("./pages/Bookings"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const FAQs = lazy(() => import("./pages/FAQs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const PartnerWithUs = lazy(() => import("./pages/PartnerWithUs"));

// Lazy-loaded interactive floating and promo elements
const LoginOfferPromo = lazy(() => import("./components/LoginOfferPromo"));
const FloatingWhatsApp = lazy(() => import("./components/FloatingWhatsApp"));

function Login() {
  return <div className="p-10">Login Page</div>;
}

function Signup() {
  return <div className="p-10">Sign Up Page</div>;
}

function App() {
  if (window.location.pathname === "/reset-password") {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6]" />}>
        <ResetPassword />
      </Suspense>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />

      <Suspense fallback={null}>
        <LoginOfferPromo delayMs={4500} />
        <FloatingWhatsApp />
      </Suspense>

      <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6]" />}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/book-hotels" element={<Availability />} />
          <Route path="/hotels" element={<Availability />} />
          <Route path="/availability" element={<Availability />} />

          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/about" element={<AboutUs />} />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          <Route path="/hotel/:hotelId" element={<HotelDetails />} />

          <Route path="/bookings" element={<Bookings />} />
          <Route path="/booking" element={<Bookings />} />

          <Route path="/my-bookings" element={<MyBookings />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/terms-and-conditions" element={<TermsConditions />} />

          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route path="/faqs" element={<FAQs />} />
          <Route path="/faq" element={<FAQs />} />

          <Route path="/contact" element={<ContactUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/support" element={<ContactUs />} />
          <Route path="/customer-support" element={<ContactUs />} />

          <Route path="/partner-with-us" element={<PartnerWithUs />} />
          <Route path="/partners" element={<PartnerWithUs />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;