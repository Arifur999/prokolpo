import { FeaturesSection } from "@/components/modules/Landing/FeaturesSection";
import { HeroSection } from "@/components/modules/Landing/HeroSection";
import { HowSection } from "@/components/modules/Landing/HowSection";
import { KindsSection } from "@/components/modules/Landing/KindsSection";
import { MoreSection } from "@/components/modules/Landing/MoreSection";

export default function LandingPage() {
  return (
    <main id="main-content" className="flex flex-col bg-canvas text-ink">
      <HeroSection />
      <KindsSection />
      <FeaturesSection />
      <MoreSection />
      <HowSection />
    </main>
  );
}
