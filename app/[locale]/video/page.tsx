import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata = {
  title: 'Video | Sunbiotan',
  robots: { index: false },
};

export default function VideoPage() {
  return (
    <>
      <Navbar forceOpaque />
      <main className="bg-sunbiotan-950 min-h-screen pt-28 pb-24 flex flex-col items-center justify-center">
        <div className="container mx-auto px-6 flex flex-col items-center">
          <div className="w-full max-w-4xl">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://drive.google.com/file/d/1gCnKpzW3KsBXIYT_6U5xJ5TNDMFxtX5H/preview"
                className="absolute inset-0 w-full h-full rounded-xl border border-sunbiotan-800/30"
                allow="autoplay"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
