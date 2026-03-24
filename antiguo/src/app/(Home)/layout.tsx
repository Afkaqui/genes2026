// src/app/layout.tsx
import '../globals.css';
import { Footer } from "@/components";
import { Header } from '@/components';
import { Metadata }  from 'next';

//Partes comentadas para implementación futura

export const metadata: Metadata = {
    title: 'GENES Perú | Gremio Nacional de Emprendedores Sostenibles',
    description: 'Impulsamos proyectos de sostenibilidad, economía circular y emprendimientos sostenibles en Perú. Únete a nuestra comunidad para co-crear soluciones innovadoras.',
    keywords: [
      'Sostenibilidad',
      'Sustainability',
      'Economía circular',
      'Circular economy',
      'Proyectos',
      'Proyectos de impacto',
      'Gremio de sostenibilidad',
      'Genes',
      'Perú',
      'Sostenibilidad Perú',
      'Sin fines de lucro',
      'Emprendimientos sostenibles',
      'Innovación disruptiva',
      'Comunidades',
      'Co-creación',
      'Soluciones sostenibles',
      'Desarrollo sostenible',
      'Impacto social',
      'Medio ambiente',
      'ODS Perú'
    ],
    openGraph: {
      title: 'GENES Perú - Líderes en Sostenibilidad y Economía Circular',
      description: 'Conectamos emprendedores, empresas y comunidades para impulsar proyectos sostenibles en Perú',
      url: 'https://www.genesperu.org',
      siteName: 'GENES Perú',
    //   images: [
    //     {
    //       url: 'https://www.genesperu.org/images/og-image.jpg',
    //       width: 1200,
    //       height: 630,
    //       alt: 'GENES Perú - Transformando el futuro sostenible',
    //     },
    //   ],
      locale: 'es_PE',
      type: 'website',
    },
    // twitter: {
    //   card: 'summary_large_image',
    //   title: 'GENES Perú | #Sostenibilidad #EconomíaCircular',
    //   description: 'Impulsando el cambio hacia un Perú sostenible a través de la innovación colaborativa',
    //   images: ['https://www.genesperu.org/images/twitter-card.jpg'],
    // },
    alternates: {
      canonical: 'https://www.genesperu.org',
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    themeColor: '#759C30',
    category: 'sustainability',
    authors: [
      {
        name: 'GENES Perú',
        url: 'https://www.genesperu.org',
      },
    ],
    // manifest: '/site.webmanifest',
    // verification: {
    //   google: 'tu-codigo-de-verificacion-google',
    //   yandex: 'tu-codigo-de-verificacion-yandex',
    // },
};


export default function GenesLayout({ children }: {
    children: React.ReactNode;
}) {

    return (
        <html lang="en">
            <body>
                
                <main className="min-h-screen">
                    <Header />

                    {/* pt-28 px-0 sm:px-0 */}
                    <div className="">  
                        {children}
                    </div>
                    
                    <Footer />
                </main>
            </body>
        </html>
    );

}