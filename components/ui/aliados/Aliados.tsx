import Image from 'next/image';
import { InfiniteCarousel } from '@/components/ui/InfiniteCarousel';

import UNHEVAL from '@/images/aliados/Logo UNHEVAL.png';
import OLI from '@/images/aliados/LOGO_Oli.png';
import RED from '@/images/aliados/LOGO_RED.png';
import UNDAR from '@/images/aliados/LOGO_UNDAR.png';
import UNAS from '@/images/aliados/LOGO_UNAS.png';
import BANCA from '@/images/aliados/LOGO_BANCA.png';
import MAYNAS from '@/images/aliados/LOGO_MAYNAS.png';

export const Aliados = () => {
    const aliados = [
        { img: UNHEVAL, alt: "Logo de UNHEVAL" },
        { img: OLI, alt: "Logo de Oli" },
        { img: RED, alt: "Logo de RED" },
        { img: UNDAR, alt: "Logo de UNDAR" },
        { img: UNAS, alt: "Logo de UNAS" },
        { img: BANCA, alt: "Logo de BANCA" },
        { img: MAYNAS, alt: "Logo de MAYNAS" }
    ];

    return (
        <section className="text-center py-10 px-4 sm:px-12 lg:px-48">
            <h2 className="text-[48px] leading-[60px] tracking-[-2%] font-bold mb-8">NUESTROS ALIADOS</h2>
            <InfiniteCarousel duration={15} gap={32}>
                {aliados.map((aliado, index) => (
                    <div key={index} className="flex-shrink-0 w-40 h-40">
                        <Image
                            src={aliado.img}
                            alt={aliado.alt}
                            width={160}
                            height={160}
                            className="object-contain w-full h-full grayscale hover:grayscale-0 transition-all duration-300"
                        />
                    </div>
                ))}
            </InfiniteCarousel>
        </section>
    );
};
