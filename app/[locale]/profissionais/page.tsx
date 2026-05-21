import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ProfissionaisContent } from './ProfissionaisContent';

export default function ProfissionaisPage() {
  return (
    <>
      <Navbar forceOpaque />
      <ProfissionaisContent />
      <Footer />
    </>
  );
}
