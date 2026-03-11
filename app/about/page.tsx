import AboutMissionSection  from "@/components/landing/AboutMissionSection";
import AboutWeddingsSection from "@/components/landing/AboutWeddingsSection";
import AboutFAQSection      from "@/components/landing/AboutFAQSection";
import ServicesCTABanner    from "@/components/landing/ServicesCTABanner";
import PartnersSection      from "@/components/landing/PartnersSection";
import Footer from "@/components/landing/Footer";
import ContactCTASection from "@/components/landing/ContactCTASection";

export default function AboutPage() {
  return (
    <main style={{ width: "100%", overflowX: "hidden" }}>
      <AboutMissionSection />
      <AboutWeddingsSection />
      <AboutFAQSection />
      <ContactCTASection />
      <Footer/>
    </main>
  );
}