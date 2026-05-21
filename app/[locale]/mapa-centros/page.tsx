import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CentrosContent } from './CentrosContent';

export default function CentrosPage() {
  return (
    <>
      <Navbar forceOpaque />
      <CentrosContent />
      <Footer />
    </>
  );
}
