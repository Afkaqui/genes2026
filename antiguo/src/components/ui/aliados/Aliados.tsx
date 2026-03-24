

import Image from 'next/image';
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import UNHEVAL from '@/images/aliados/Logo UNHEVAL.png';
import OLI from '@/images/aliados/LOGO_Oli.png';
import RED from '@/images/aliados/LOGO_RED.png';
import UNDAR from '@/images/aliados/LOGO_UNDAR.png';
import UNAS from '@/images/aliados/LOGO_UNAS.png';
import BANCA from '@/images/aliados/LOGO_BANCA.png';
import MAYNAS from '@/images/aliados/LOGO_MAYNAS.png';

export const Aliados = () => {
    const settings = {
        dots: true,
        arrows: false,
        infinite: true,
        autoplay: true,
        speed: 1000,
        autoplaySpeed: 3000,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
            }
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 2,
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              dots: false
            }
          }
        ]
    };
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
            <div className="overflow-hidden">
        <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar">
          {aliados.map((aliado, index) => (
            <div key={index} className="flex-shrink-0 w-40 h-40">
              <Image
                src={aliado.img}
                alt={aliado.alt}
                width={160}
                height={160}
                className="object-contain w-full h-full grayscale hover:grayscale-0 transition-all"
              />
            </div>
          ))}   
        </div>
      </div>
            {/* <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center max-w-full mx-auto">
                
                <div>
                    <Image src={UNHEVAL} alt="Logo de UNHEVAL" className="max-w-full h-auto" />
                </div>
                <div>
                    <Image src={OLI} alt="Logo de Oli" className="max-w-full h-auto" />
                </div>
                <div>
                    <Image src={RED} alt="Logo de RED" className="max-w-full h-auto" />
                </div>
                <div>
                    <Image src={UNDAR} alt="Logo de UNDAR" className="max-w-full h-auto" />
                </div>
                <div>
                    <Image src={UNAS} alt="Logo de UNAS" className="max-w-full h-auto" />
                </div>
                <div>
                    <Image src={BANCA} alt="Logo de BANCA" className="max-w-full h-auto" />
                </div>
                <div>
                    <Image src={MAYNAS} alt="Logo de MAYNAS" className="max-w-full h-auto" />
                </div>
            </div> */}
        </section>
    );
}
