// src/components/ui/footer/Footer.tsx
import Image from 'next/image';
import Link from 'next/link';

// Importaciones de imágenes optimizadas
import insLogo from '@/public/logos/genesLogo.png';
import faceLogo from '@/public/logos/genesLogo.png';
import LinkLogo from '@/public/logos/genesLogo.png';
import genesLogo from '@/public/logos/genesLogo.png';

export const Footer = () => {
  return (
    <footer className="relative w-full bg-slate-900 py-12 text-white overflow-hidden">
      {/* Background optimizado con Next.js Image para evitar saltos de layout */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <Image 
          src="/images/rect1.png" 
          alt="background decoration" 
          fill 
          className="object-cover object-center"
          priority={false}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:items-start">
          
          {/* Lado Izquierdo: Branding y Datos */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative h-24 w-24 shrink-0">
              <Image
                src={genesLogo}
                alt="Genes Perú Logo"
                fill
                className="object-contain"
                sizes="96px"
              />
            </div>
            
            <div className="text-center md:text-left">
              <h2 className="text-lg font-bold tracking-tight sm:text-xl md:max-w-md">
                GREMIO NACIONAL DE EMPRENDEDORES SOSTENIBLES
              </h2>
              <p className="mt-2 text-genes-green font-medium">
                Impulsando pymes sostenibles para un futuro próspero
              </p>
              <div className="mt-4 space-y-1 text-sm text-slate-300">
                <p>Correo: gremiosostenible.genes@gmail.com</p>
                <p>Dirección: Av. Del Pacífico 175 e9 1104</p>
                <p>Contacto: +51 924 087 832</p>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Redes Sociales */}
          <div className="flex flex-col items-center lg:items-end gap-4">
            <span className="text-lg font-semibold">Visítanos en:</span>
            <div className="flex gap-6">
              {[
                { href: "https://www.instagram.com/genes_peru/", src: insLogo, alt: "Instagram" },
                { href: "https://www.facebook.com/Genesperuoficial", src: faceLogo, alt: "Facebook" },
                { href: "https://www.linkedin.com/company/genesperu", src: LinkLogo, alt: "LinkedIn" }
              ].map((social) => (
                <a 
                  key={social.alt}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Image src={social.src} alt={social.alt} width={28} height={28} className="brightness-110" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Separador y Copyright */}
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-slate-400">
          <p className="mb-2">© {new Date().getFullYear()} GENES PERÚ. Todos los derechos reservados.</p>
          <p>
            Diseñado y desarrollado por{' '}
            <Link href="https://www.linkedin.com/in/afkaqui/" className="text-genes-green hover:underline">Angel Kaqui</Link>
            {' '}y{' '}
            <Link href="https://www.linkedin.com/in/randy-rivas-06a94b1a6/" className="text-genes-green hover:underline">Randy Rivas</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};