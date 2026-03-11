import TaglineSection       from "@/components/landing/TaglineSection";
import StatsSection         from "@/components/landing/StatsSection";
import TestimonialCarousel  from "@/components/landing/TestimonialCarousel";
import FeatureSection       from "@/components/landing/FeatureSection";
import ServicesSection      from "@/components/landing/ServicesSection";
import PartnersSection      from "@/components/landing/PartnersSection";
import QuoteBlock           from "@/components/landing/QuoteBlock";
import GallerySection       from "@/components/landing/GallerySection";
import ContactCTASection    from "@/components/landing/ContactCTASection";

export default function HomePageSections() {
  return (
    <main style={{ width: "100%", overflowX: "hidden" }}>
      <TaglineSection />
      <StatsSection />
      <TestimonialCarousel />
      <FeatureSection />
      <ServicesSection />
      <PartnersSection />
      <QuoteBlock />
      <GallerySection />
      <ContactCTASection />
    </main>
  );
}