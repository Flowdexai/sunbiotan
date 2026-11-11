import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { FormulaStrip } from '@/components/sections/formula-strip';
import { TrueTreatment } from '@/components/sections/true-treatment';
import { About } from '@/components/sections/about';
import { Occasions } from '@/components/sections/occasions';
import { Benefits } from '@/components/sections/benefits';
import { VideoSection } from '@/components/sections/scroll-video';
import { HowItWorks } from '@/components/sections/how-it-works';
import { MapPreview } from '@/components/sections/map-preview';
import { CtaProfessionals } from '@/components/sections/cta-professionals';
import { Footer } from '@/components/layout/footer';
import { Contact } from '@/components/sections/contact';

// Background rhythm: dark → dark → cream → sand → dark → cream → dark → sand → cream → dark → cream → dark
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FormulaStrip />
        <TrueTreatment />
        <About />
        <Occasions />
        <Benefits />
        <VideoSection />
        <HowItWorks />
        <MapPreview />
        <CtaProfessionals />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
