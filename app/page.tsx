import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { Benefits } from '@/components/sections/benefits';
import { ScrollVideo } from '@/components/sections/scroll-video';
import { HowItWorks } from '@/components/sections/how-it-works';
import { MapPreview } from '@/components/sections/map-preview';
import { CtaProfessionals } from '@/components/sections/cta-professionals';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Benefits />
        <ScrollVideo />
        <HowItWorks />
        <MapPreview />
        <CtaProfessionals />
      </main>
      <Footer />
    </>
  );
}
