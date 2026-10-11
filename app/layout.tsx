import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { AudioProvider } from '@/lib/context/AudioContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlobalAudioPlayerBar } from '@/components/audio/GlobalAudioPlayerBar';

export const metadata: Metadata = {
  title: 'ladrando opiniones — Plataforma social de audio',
  description:
    'Escucha y conecta con la comunidad de ladrando opiniones.',
  keywords: ['audio', 'comunidad', 'opiniones', 'ladrando opiniones'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full dark">
      <body className="h-full flex flex-col bg-gradient-to-b from-deepblue-950 via-deepblue-900 to-deepblue-850 text-[#E2ECE9] selection:bg-menta-300 selection:text-deepblue-950 min-h-screen relative overflow-x-hidden">
        {/* Luces ambientales de fondo */}
        <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="fixed bottom-1/4 right-10 w-[500px] h-[500px] bg-dorado-400/8 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="fixed top-1/2 right-1/4 w-[450px] h-[450px] bg-menta-400/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <AuthProvider>
          <AudioProvider>
            <Navbar />
            <main className="flex-1 pb-28 md:pb-32">{children}</main>
            <GlobalAudioPlayerBar />
            <Footer />
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
