import Image from 'next/image';
import Link from 'next/link';
import insLogo from '@/images/redes/insLogo.png';
import faceLogo from '@/images/redes/FaceLogo.png';
import LinkLogo from '@/images/redes/LinkLogo.png';
import genesLogo from '@/images/genesLogo.png';
import rect1 from '@/images/rect1.png';

export const Footer = () => {
    return (
        <footer
            className="bg-gray-200 h-auto w-full text-xs flex flex-col justify-center items-center space-y-4 bg-cover bg-center text-white py-8"
            style={{ backgroundImage: `url(${rect1.src})` }}
        >
            <div className="flex flex-col sm:flex-row gap-8 sm:gap-20 items-center justify-between w-full max-w-[1200px] px-6">
                {/* Logo y texto */}
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                    <Image
                        className="w-20 h-20 mb-4 sm:mb-0"
                        src={genesLogo}
                        alt="GenesPeru"
                        width={117}
                        height={117}
                    />
                    <div className="text-center sm:text-left">
                        <div className="text-[18px] sm:text-[20px] font-semibold  mb-2">
                            GREMIO NACIONAL DE EMPRENDEDORES SOSTENIBLES
                        </div>
                        <p className="text-sm sm:text-base mb-2">Impulsando pymes sostenibles para un futuro próspero</p>
                        <p className="text-xs sm:text-sm">Correo: gremiosostenible.genes@gmail.com</p>
                        <p className="text-xs sm:text-sm">Dirección: Av. Del Pacifico 175 e9 1104</p>
                        <p className="text-xs sm:text-sm">Contacto: +51 924 087 832</p>
                    </div>
                </div>

                {/* Visítanos en: Iconos */}
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                    <div className="text-center sm:text-left text-xl font-semibold mb-4 sm:mb-0">Visítanos en:</div>
                    <div className="flex gap-4 items-center">
                        <a href="https://www.instagram.com/genes_peru/" target="_blank" rel="noopener noreferrer">
                            <Image src={insLogo} alt="Instagram" width={24} height={24} />
                        </a>
                        <a href="https://www.facebook.com/Genesperuoficial" target="_blank" rel="noopener noreferrer">
                            <Image src={faceLogo} alt="Facebook" width={24} height={24} />
                        </a>
                        <a href="https://www.linkedin.com/company/genesperu" target="_blank" rel="noopener noreferrer">
                            <Image src={LinkLogo} alt="LinkedIn" width={24} height={24} />
                        </a>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs sm:text-sm mt-6 w-full max-w-[1200px] px-6">
                <div className="mb-2">© 2025 GENES PERÚ. Todos los derechos reservados.</div>
                <div>Diseñado y desarrollado por <a href='https://www.linkedin.com/in/afkaqui/'>Angel Kaqui</a> y <a href='https://www.linkedin.com/in/randy-rivas-06a94b1a6/'>Randy Rivas</a></div>
            </div>
        </footer>
    );
}   