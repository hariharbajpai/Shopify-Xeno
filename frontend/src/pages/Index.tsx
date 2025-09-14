import Navigation from "@/components/Navigation";
import FeatureSection from "@/components/FeatureSection";
import DetailedFeatures from "@/components/DetailedFeatures";
import PrivacySection from "@/components/PrivacySection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CtaSection from "@/components/CtaSection";
import DemoShowcase from "@/components/DemoShowcase";
import InteractiveFeatures from "@/components/InteractiveFeatures";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        <HeroSection />
        <DemoShowcase />
        <InteractiveFeatures />
        <FeatureSection />
        <DetailedFeatures />
        <CtaSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
