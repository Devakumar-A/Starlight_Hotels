import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Availability from "./pages/Availability";
import HotelDetails from "./pages/HotelDetails";
import Bookings from "./pages/Bookings";
import MyBookings from "./pages/MyBookings";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ResetPassword from "./components/ResetPassword";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQs from "./pages/FAQs";
import ContactUs from "./pages/ContactUs";
import PartnerWithUs from "./pages/PartnerWithUs";

function Login() {
  return <div className="p-10">Login Page</div>;
}

function Signup() {
  return <div className="p-10">Sign Up Page</div>;
}

function App() {
  if (window.location.pathname === "/reset-password") {
    return <ResetPassword />;
  }
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />

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
    </BrowserRouter>
  );
}

export default App;