

import Image from 'next/image';
import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";



import DISEÑO3R from '@/images/socios/3rdiseño.jpg';
import ARQUITECTOS from '@/images/socios/AC arquitectos.jpg'
import AMAZONIA from '@/images/socios/AMAZONÍA.jpg';
import ARENA_VERDE from '@/images/socios/arena verde.jpg';
import ARQUITEKTURAS from '@/images/socios/arquitekuras&asociados.png';
import ASESORANDES from '@/images/socios/asesorandes.jpg';
import ATRIS from '@/images/socios/ATRIS-PNG.png';
import AWANALLAQTA from '@/images/socios/awanallaqta.jpg'
import AYLLY from '@/images/socios/aylly misky.jpg';
import BANCA_S from '@/images/socios/banca sostenible.png';
import CAFE_COMPADRE from '@/images/socios/cafecompadre.jpg';
import CALMA from '@/images/socios/CALMA.png';
import CIRCLE from '@/images/socios/circle.jpg';
import CIUDAD_SALUDABLE from '@/images/socios/ciudad saludable.png';
import CLIMETRIA from '@/images/socios/Climetria.png';
import CMNJAN from '@/images/socios/CMNJAN.png';
import CONCEIBA from '@/images/socios/conceiba.png';
import COSMOBEAUTY from '@/images/socios/cosmobeauty.png'
import CREALIZ from '@/images/socios/crealiz.png'
import CSRESTUDIOS from '@/images/socios/csrestudios.jpg';
import DOKTUZ from '@/images/socios/Doktuz.png';
import TITIKAKA from '@/images/socios/ECO ARTESANÍAS DE TOTORA 17 G.png';
import ECOAMET from '@/images/socios/eco_amet.jpg';
import ECOART from '@/images/socios/ecoart.png';
import ECODABLE from '@/images/socios/ecodable.png';
import ECONOMIA_VERDE from '@/images/socios/economiaverde.png';
import ECOTRASH from '@/images/socios/ecotrash.png';
import EFI_CONSULTORIA from '@/images/socios/eficiencia gerencial consultora.jpg';
import ECOBLOCK from '@/images/socios/ekoblock.png';
import ENERGENIO from '@/images/socios/Energenio y sello cn fondo.png';
import ESPAMOVIL from '@/images/socios/espaciomovil.png';
import FUBANNER from '@/images/socios/fub.png';
import IKREO from '@/images/socios/ikreo.png';
import INECAP from '@/images/socios/INECAP Color Main Full.png';
import INKAMOSS from '@/images/socios/Inka Moss.png';
import INVENTHIA from '@/images/socios/inventhia.png';
import JAN from '@/images/socios/JAN.png';
import JANKO from '@/images/socios/jankooecobicis.jpg';
import KORE from '@/images/socios/koreshoes.png';
import KUNAN from '@/images/socios/kunan completo negro bordes.png';
import LEGLAM from '@/images/socios/leglamclan.png';
import LIBELULA from '@/images/socios/libelua.png';
import LUBAPA from '@/images/socios/Lubapa.jpg';
import MADDA from '@/images/socios/madda feria.png';
import MANSANO from '@/images/socios/mansano.jpg';
import MLIMA from '@/images/socios/marca lima.jpg';
import MVPSTARTER from '@/images/socios/mvpstarter.jpg';
import NANAS from '@/images/socios/NANAS & AMAS.jpg';
import NUBES from '@/images/socios/nubes.jpg';
import PESCAME from '@/images/socios/Pescame.png';
import PRIMAGEN from '@/images/socios/primagen.png';
import RENTABI from '@/images/socios/Rentabilizate.png';
import RESTOZERO from '@/images/socios/Resto-Zero.png';
import SERVAGRO from '@/images/socios/servagro.png';
import SOLARIS from '@/images/socios/solaris.jpeg';
import SUSTANT from '@/images/socios/sustant.jpg';
import TMMODS from '@/images/socios/tmmods.png';
import VIBRA from '@/images/socios/vibra.png';
import VISUM from '@/images/socios/visum.jpg';
import WILLKA from '@/images/socios/willka.png';
import WIPS from '@/images/socios/wips.png';

export const Socios = () => {
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
        { img: DISEÑO3R, alt: "Diseño3R" },
        { img: ARQUITECTOS, alt: "Logo de Arquitektos"},
        { img: AMAZONIA, alt: "Logo de Amazonía"},
        { img: ARENA_VERDE, alt: "Logo de Arena Verde"},
        { img: ARQUITEKTURAS, alt: "Logo de Arquitekturas"},
        { img: ASESORANDES, alt: "Logo de Asesorandes"},
        { img: ATRIS, alt: "Logo de ATRIS"},
        { img: AWANALLAQTA, alt: "Logo de Awanallqta"},
        { img: AYLLY, alt: "Logo de Aylly"},
        { img: BANCA_S, alt: "Logo de Banca Sostenible"},
        { img: CAFE_COMPADRE, alt: "Logo de Compadre"},
        { img: CALMA, alt: "Logo de CALMA"},
        { img: CIRCLE, alt: "Logo de Circle"},
        { img: CIUDAD_SALUDABLE, alt: "Logo de Ciudad Saludable"},
        { img: CLIMETRIA, alt: "Logo de Climetria"},
        { img: CMNJAN, alt: "Logo de CMSAC"},
        { img: CONCEIBA, alt: "Logo de Conceiba"},
        { img: COSMOBEAUTY, alt: "Logo de Cosmo Beauty"},
        { img: CREALIZ, alt: "Logo de Crealiz"},
        { img: CSRESTUDIOS, alt: "CSRESTUDIOS"},
        { img: DOKTUZ, alt: "Doktuz"},
        { img: TITIKAKA, alt: "Titikaka"},
        { img: ECOAMET, alt: "Ecoamet"},
        { img: ECOART, alt: "Ecoart"},
        { img: ECODABLE, alt: "Ecodable"},
        { img: ECONOMIA_VERDE, alt: "Economía verde"},
        { img: ECOTRASH, alt: "Ecotrash"},
        { img: EFI_CONSULTORIA, alt:"Eficiencia Gerencial Consultora"},
        { img: ECOBLOCK, alt: "Ecoblock"},
        { img: ENERGENIO, alt: "Energenio"},
        { img: ESPAMOVIL, alt: "Espacio Movil"},
        { img: FUBANNER, alt: "FUB"},
        { img: IKREO, alt: "Ikreo"},
        { img: INECAP, alt: "Inecap"},
        { img: INKAMOSS, alt: "Inkamoss"},
        { img: INVENTHIA, alt: "Inventhia"},
        { img: JAN, alt: "JAN"},
        { img: JANKO, alt: "Janko"},
        { img: KORE, alt: "Kore"},
        { img: KUNAN, alt: "Kunan"},
        { img: LEGLAM, alt: "Le Glam Clan"},
        { img: LIBELULA, alt: "Libelula"},
        { img: LUBAPA, alt: "LUBAPA"},
        { img: MADDA, alt: "Madda Feria"},
        { img: MANSANO, alt: "Mansano"},
        { img: MLIMA, alt: "Marca Lima"},
        { img: MVPSTARTER, alt: "MVP Starter"},
        { img: NANAS, alt: "Nanas & Amas"},
        { img: NUBES, alt: "Nubes"},
        { img: PESCAME, alt: "Pescame"},
        { img: PRIMAGEN, alt: "PRIMAGEN"},
        { img: RENTABI, alt: "Rentabilizate"},
        { img: RESTOZERO, alt: "Resto Zero"},
        { img: SERVAGRO, alt: "Servagro"},
        { img: SOLARIS, alt: "Solaris"},
        { img: SUSTANT, alt: "Sustant"},
        { img: TMMODS, alt: "Millennials Movement"},
        { img: VIBRA, alt: "ViBra"},
        { img: VISUM, alt: "Visum"},
        { img: WILLKA, alt: "Willka"},
        { img: WIPS, alt: "Wips"}
    ];
    return (
        <section className="text-center py-10 px-4  sm:px-12 lg:px-24">
            <h2 className="text-[48px] leading-[60px] tracking-[-2%] font-bold mb-8">NUESTROS SOCIOS</h2>
            <div className="overflow-hidden">
        <div className=" flex overflow-x-auto gap-6 pb-4 hide-scrollbar">
          {aliados.map((aliado, index) => (
            <div key={index} className="flex-shrink-0 w-40 h-40">
              <Image
                src={aliado.img}
                alt={'Logo de '+aliado.alt}
                width={160}
                height={160}
                className="object-contain w-full h-full grayscale hover:grayscale-0 transition-all"
              />
            </div>
          ))} 
        </div>
      </div>
           
        </section>
    );
}
