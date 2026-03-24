// src/app/layout.tsx
import '../app/globals.css';
import type { Metadata, Viewport } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Montserrat } from 'next/font/google'; // Fuente recomendada para sostenibilidad

// 1. Configuración de la Fuente (Optimización de CLS)
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

// 2. Nueva API de Viewport (Separada de Metadata en v14/v15+)
export const viewport: Viewport = {
  themeColor: '#759C30', // Tu verde institucional
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// 3. Metadata Centralizada y Segura
export const metadata: Metadata = {
  metadataBase: new URL('https://www.genesperu.earth'),
  title: {
    default: 'GENES Perú | Gremio Nacional de Emprendedores Sostenibles',
    template: '%s | GENES Perú',
  },
  description: 'Impulsamos proyectos de sostenibilidad, economía circular y emprendimientos de impacto en Perú. Únete a la red de innovación disruptiva.',
  keywords: ['Sostenibilidad', 'Economía Circular', 'Emprendimiento Perú', 'ODS', 'Innovación'],
  authors: [{ name: 'Genes Perú', url: 'https://www.genesperu.earth' }],
  creator: 'Angel Francisco Kaqui Aquino',
  
  openGraph: {
    title: 'GENES Perú - Co-creando el Futuro Sostenible',
    description: 'Conectamos líderes y comunidades para transformar el impacto ambiental en Perú.',
    url: '/',
    siteName: 'GENES Perú',
    locale: 'es_PE',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GENES Perú - Gremio Nacional de Emprendedores Sostenibles',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'GENES Perú | Sostenibilidad y Acción',
    description: 'Gremio Nacional de Emprendedores Sostenibles.',
    images: ['/og-image.jpg'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${montserrat.variable} scroll-smooth`}>
      <body className="antialiased min-h-screen flex flex-col bg-white text-slate-900">
        <Header />
        
        {/* Contenedorprincipal con gestión de espacio para el Header fixed si aplica */}
        <main className="flex-grow">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}