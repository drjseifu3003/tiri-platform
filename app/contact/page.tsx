import ContactCTASection from "@/components/landing/ContactCTASection";
import ContactFormSection  from "@/components/landing/ContactFormSection";
import Footer from "@/components/landing/Footer";
import ServicesCTABanner   from "@/components/landing/ServicesCTABanner";

export default function ContactPage() {
  return (
    <main style={{ width: "100%", overflowX: "hidden" }}>
      <ContactFormSection />
      <Footer/>
    </main>
  );
}