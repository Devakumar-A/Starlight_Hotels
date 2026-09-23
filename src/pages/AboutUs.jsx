import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  MapPin,
  Sparkles,
  Heart,
  Compass,
  Coffee,
  Building2,
  Star,
} from "lucide-react";
import Footer from "../components/Footer";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const destinations = [
  {
    city: "Chennai",
    title: "Urban Splendor & Coastal Grandeur",
    description:
      "Experience the energy of Chennai with comfortable stays that bring together the city's vibrant character and a relaxed hospitality experience.",
  },
  {
    city: "Pondicherry",
    title: "French-Creole Serenity by the Sea",
    description:
      "Discover the distinctive charm of Pondicherry, where heritage streets, coastal moments and laid-back surroundings create a memorable escape.",
  },
  {
    city: "Kodaikanal",
    title: "Highland Bliss & Mist-Draped Valleys",
    description:
      "Escape to the hills of Kodaikanal and enjoy a peaceful stay surrounded by cool weather, scenic landscapes and the beauty of the mountains.",
  },
];

const pillars = [
  {
    number: "01",
    icon: Building2,
    title: "Thoughtful Spaces",
    description:
      "Comfortable and well-designed spaces created to make every stay relaxing, convenient and enjoyable.",
  },
  {
    number: "02",
    icon: Heart,
    title: "Warm Hospitality",
    description:
      "A welcoming approach focused on making every guest feel comfortable throughout their stay.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Memorable Stays",
    description:
      "From short getaways to extended visits, we aim to create experiences guests can enjoy and remember.",
  },
  {
    number: "04",
    icon: Compass,
    title: "Prime Destinations",
    description:
      "Properties across distinctive South Indian destinations, each offering its own character and experience.",
  },
];

function AboutUs() {
  return (
    <main className="min-h-screen bg-white text-[#171717] overflow-x-clip">

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative flex min-h-[78vh] items-center overflow-hidden bg-[#111315] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(196,140,45,0.18),transparent_35%)]" />

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12 py-16 sm:py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.div
              variants={fadeUp}
              className="mb-6 flex items-center gap-3"
            >
              <span className="h-px w-10 bg-[#C9973E]" />
              <span className="text-xs sm:text-sm font-medium uppercase tracking-[0.25em] text-[#D8B36A]">
                The Starlight Legacy
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="max-w-4xl text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.1] tracking-tight"
            >
              Where Timeless Hospitality Meets{" "}
              <span className="text-[#D8B36A]">Modern Luxury</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 sm:mt-8 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-lg sm:leading-8"
            >
              At Starlight, every stay is an invitation to slow down,
              reconnect and experience the character of the destination around
              you. Discover comfortable stays crafted around warmth,
              convenience and memorable moments.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 sm:mt-10">
              <Link
                to="/book-hotels"
                className="group inline-flex items-center gap-3 rounded-full bg-[#C9973E] px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white transition-all duration-300 hover:bg-[#B78632]"
              >
                Explore Our Stays
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          OUR STORY
      ===================================================== */}
      <section className="px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: "some" }}
            variants={staggerContainer}
            className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24"
          >
            <motion.div variants={fadeUp}>
              <span className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B78632]">
                Our Story
              </span>

              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Born from a Passion for Unforgettable Escapes
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-6">
              <p className="text-lg leading-8 text-gray-600">
                Starlight Hotels & Resorts was created with a simple vision:
                to make discovering and enjoying a comfortable stay feel
                effortless.
              </p>

              <p className="leading-8 text-gray-600">
                We believe hospitality is about more than the space you stay
                in. It is about the atmosphere, the welcome, the convenience
                and the moments that make a journey memorable.
              </p>

              <p className="leading-8 text-gray-600">
                Today, Starlight brings together stays across some of South
                India's distinctive destinations, including the vibrant
                coastline of Chennai, the heritage charm of Pondicherry and
                the peaceful hills of Kodaikanal.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          MISSION / VISION
      ===================================================== */}
      <section className="bg-[#F7F6F3] px-6 py-24 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: "some" }}
            variants={staggerContainer}
            className="grid gap-6 md:grid-cols-2"
          >
            <motion.div
              variants={fadeUp}
              className="rounded-3xl bg-[#151719] p-8 text-white sm:p-10 lg:p-12"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D8B36A]">
                Our Mission
              </span>

              <h3 className="mt-6 text-3xl font-semibold">
                Creating stays that feel effortless.
              </h3>

              <p className="mt-6 leading-8 text-white/65">
                To create comfortable spaces and thoughtful guest experiences
                that make every journey easier, more enjoyable and memorable.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="rounded-3xl border border-black/10 bg-white p-8 sm:p-10 lg:p-12"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B78632]">
                Our Vision
              </span>

              <h3 className="mt-6 text-3xl font-semibold">
                Becoming a trusted name in South Indian hospitality.
              </h3>

              <p className="mt-6 leading-8 text-gray-600">
                To build a hospitality collection known for welcoming stays,
                distinctive destinations and experiences that guests remember
                long after their journey.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          FOUR PILLARS
      ===================================================== */}
      <section className="px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: "some" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B78632]">
                The Starlight Experience
              </span>

              <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                What makes a Starlight stay different
              </h2>

              <p className="mt-6 leading-8 text-gray-600">
                Every part of the Starlight experience is shaped around
                comfort, convenience and the character of the destination.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-4"
            >
              {pillars.map((pillar) => {
                const Icon = pillar.icon;

                return (
                  <motion.div
                    key={pillar.number}
                    variants={fadeUp}
                    className="group bg-white p-7 transition-colors duration-300 hover:bg-[#F9F7F2] sm:p-8"
                  >
                    <div className="flex items-start justify-between">
                      <Icon
                        size={24}
                        strokeWidth={1.5}
                        className="text-[#B78632]"
                      />

                      <span className="text-sm font-medium text-gray-400">
                        {pillar.number}
                      </span>
                    </div>

                    <h3 className="mt-12 text-xl font-semibold">
                      {pillar.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-gray-600">
                      {pillar.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          DESTINATIONS
      ===================================================== */}
      <section className="bg-[#111315] px-6 py-24 text-white sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: "some" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp}>
              <span className="text-sm font-semibold uppercase tracking-[0.22em] text-[#D8B36A]">
                Our Destinations
              </span>

              <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Stay somewhere worth remembering.
              </h2>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="mt-16 grid gap-5 lg:grid-cols-3"
            >
              {destinations.map((destination) => (
                <motion.article
                  key={destination.city}
                  variants={fadeUp}
                  className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.07] sm:p-8"
                >
                  <div className="flex items-center gap-2 text-[#D8B36A]">
                    <MapPin size={17} />
                    <span className="text-sm font-medium">
                      {destination.city}
                    </span>
                  </div>

                  <h3 className="mt-8 text-2xl font-semibold leading-tight">
                    {destination.title}
                  </h3>

                  <p className="mt-5 text-sm leading-7 text-white/60">
                    {destination.description}
                  </p>

                  <Link
                    to="/book-hotels"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#D8B36A]"
                  >
                    Explore stays
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          WELCOME NOTE
      ===================================================== */}
      <section className="px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: "some" }}
          variants={fadeUp}
          className="mx-auto max-w-4xl text-center"
        >
          <Star
            size={25}
            strokeWidth={1.5}
            className="mx-auto text-[#B78632]"
          />

          <blockquote className="mt-8 text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            “To welcome a guest is to invite them into our story. At Starlight,
            we believe the most memorable stays are built around genuine
            comfort and meaningful moments.”
          </blockquote>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            — The Starlight Hospitality Team
          </p>
        </motion.div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="px-6 pb-8 sm:px-8 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: "some" }}
          variants={fadeUp}
          className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#F5F1E8] px-7 py-16 text-center sm:px-12 lg:py-20"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B78632]">
            Your Journey Starts Here
          </span>

          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Begin Your Starlight Story
          </h2>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-gray-600">
            Whether you're planning a weekend getaway, a city stay or a
            peaceful mountain escape, discover a Starlight stay for your next
            journey.
          </p>

          <Link
            to="/book-hotels"
            className="group mt-9 inline-flex items-center gap-3 rounded-full bg-[#151719] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#2A2C2E]"
          >
            Explore Stays
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <Footer />
    </main>
  );
}

export default AboutUs;