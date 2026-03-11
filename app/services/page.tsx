import ServicesDetailSection   from "@/components/landing/ServicesDetailSection";
import ServicesPricingSection  from "@/components/landing/ServicesPricingSection";
import ServicesCTABanner       from "@/components/landing/ServicesCTABanner";
import PartnersSection         from "@/components/landing/PartnersSection";
import ContactCTASection from "@/components/landing/ContactCTASection";
import Footer from "@/components/landing/Footer";

export default function ServicesPage() {
  return (
    <main style={{ width: "100%", overflowX: "hidden" }}>
      <ServicesDetailSection />
      <ServicesPricingSection />
      <ContactCTASection />
      <Footer/>
    </main>
  );
}