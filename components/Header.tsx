"use client"; // Necesario para detectar el scroll y efectos visuales activos

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import genesLogo from '@/public/logos/genesLogo.png';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Efecto para cambiar la apariencia del header al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Nosotros', href: '#sobre-nosotros' },
    { name: 'Líneas de acción', href: '#lineas_accion' },
    { name: 'Contacto', href: '#contacto' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <nav className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo con Link para mejorar SEO y navegación interna */}
        <Link href="/" className="flex-shrink-0 transition-transform hover:scale-105">
          <Image
            src={genesLogo}
            alt="Genes Perú - Gremio Nacional"
            width={isScrolled ? 60 : 75} // El logo se reduce ligeramente al hacer scroll
            height={isScrolled ? 60 : 75}
            className="transition-all duration-300"
            priority // Carga prioritaria por estar en el "above the fold"
          />
        </Link>

        {/* Menú de Navegación */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={`text-sm font-bold transition-colors duration-200 ${
                  isScrolled
                    ? 'text-slate-700 hover:text-genes-green'
                    : 'text-white hover:text-genes-green drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Botón de Acción (Opcional, pero recomendado para gremios) */}
        <div className="flex items-center gap-4">
          <Link 
            href="#unete" 
            className="hidden sm:block bg-genes-green text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-genes-dark transition-all shadow-md"
          >
            Únete al Gremio
          </Link>
          
          {/* Aquí podrías añadir un botón de menú hamburguesa para móviles */}
        </div>
      </nav>
    </header>
  );
};