import Image from 'next/image';
import imagen_nuestros from '@/images/photos_background/003img_NUESTROS_PROYECTOS.jpg';

export const Trayectoria = () => {
    return (
        <section className="relative min-h-[80vh] md:h-screen bg-center bg-no-repeat bg-cover mb-20 md:mb-40">
            {/* Capa oscurecedora para mejor legibilidad */}
            <div className="absolute inset-0 bg-black/30 z-0"></div>
            
            {/* Imagen de fondo optimizada para Next.js */}
            <Image
                src={imagen_nuestros}
                alt="Nuestros proyectos de sostenibilidad"
                fill
                className="object-cover"
                quality={90}
                priority
            />
            
            {/* Contenedor verde - Versión responsive */}
            <div className="relative z-10 mx-auto w-full md:max-w-[85.5%] bg-[#759C30] mt-[30vh] md:mt-[40vh] lg:ml-[130px] py-10 md:py-16 lg:py-24 px-6 sm:px-8 md:px-12 rounded-tl-3xl lg:rounded-tl-[100px]">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 xl:gap-28 items-center lg:items-start text-white">
                    {/* Título */}
                    <div className="text-center lg:text-left lg:w-1/2">
                        <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold leading-tight">
                            NUESTROS PROYECTOS
                        </h2>
                    </div>

                    {/* Texto y botón */}
                    <div className="flex flex-col gap-4 sm:gap-6 items-center lg:items-start lg:w-1/2">
                        <p className="text-base sm:text-lg xl:text-xl text-center lg:text-left leading-relaxed">
                            En GENES, desarrollamos proyectos que fortalecen a emprendedores comprometidos con la sostenibilidad.
                        </p>
                        
                        <a 
                            href="https://linktr.ee/genesperu"
                            className="bg-white text-[#759C30] font-bold py-3 px-6 sm:px-8 border-2 border-white rounded-xl hover:bg-transparent hover:text-white transition-colors duration-300 w-full sm:w-fit text-center"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Conoce Nuestros Proyectos
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};