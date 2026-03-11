/**
 * HOME PAGE
 * HeroSection already contains its own built-in header/nav — no <Navbar /> here.
 * The hero header uses the dark overlay style that matches the brand photo bg.
 */
import HeroSection from "@/components/landing/Herosection";
import HomePageSections from "@/components/landing/HomePageSections";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HomePageSections />
      <Footer />
    </>
  );
}