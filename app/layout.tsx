import '../app/globals.css';
import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export const viewport: Viewport = {
  themeColor: '#759C30',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.genesperu.earth'),
  title: {
    default: 'GENES Peru | Gremio Nacional de Emprendedores Sostenibles',
    template: '%s | GENES Peru',
  },
  description: 'Impulsamos proyectos de sostenibilidad, economia circular y emprendimientos de impacto en Peru. Unete a la red de innovacion disruptiva.',
  keywords: ['Sostenibilidad', 'Economia Circular', 'Emprendimiento Peru', 'ODS', 'Innovacion'],
  authors: [{ name: 'Genes Peru', url: 'https://www.genesperu.earth' }],
  creator: 'Angel Francisco Kaqui Aquino',

  openGraph: {
    title: 'GENES Peru - Co-creando el Futuro Sostenible',
    description: 'Conectamos lideres y comunidades para transformar el impacto ambiental en Peru.',
    url: '/',
    siteName: 'GENES Peru',
    locale: 'es_PE',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GENES Peru - Gremio Nacional de Emprendedores Sostenibles',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'GENES Peru | Sostenibilidad y Accion',
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
        {children}
      </body>
    </html>
  );
}
