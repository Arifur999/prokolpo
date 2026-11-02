import { HeroSection } from "@/components/modules/Landing/HeroSection";
import { FeaturesSection } from "@/components/modules/Landing/FeaturesSection";
import { KindsSection } from "@/components/modules/Landing/KindsSection";

export default function LandingPage() {
  return (
    <main id="main-content" className="flex flex-col bg-canvas text-ink">
      <HeroSection />
      <KindsSection />
      <FeaturesSection />
    </main>
  );
}
