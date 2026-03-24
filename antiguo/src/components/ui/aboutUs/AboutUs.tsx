import Image from 'next/image';

import rect2 from '@/images/rect2.png'

export const AboutUs = () => {
    return (
        <section id='nosotros' className="relative">
            <div className="py-4 px-6 bg-white">
                <div className="container mx-auto flex flex-col  items-center">
                    {/* Texto de la izquierda */}
                    <div className="text-center  mb-6">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 mx-auto md:mx-0">
                            NOSOTROS
                        </h2>
                        <p className= "mb-6 text-lg leading-7  mx-auto md:mx-0 text-black">{/* revisar bold */}
                        Somos GENES PERÚ, un gremio sin fines de lucro que impulsa emprendimientos sostenibles en todo el Perú, promoviendo el crecimiento económico, social y ambiental para un futuro próspero.
                        </p>
                        <div className='flex gap-2 text-center mb-4 mx-auto md:mx-0'>
                            <div className='flex-1 text-gray-700 mb-6 text-lg leading-7  mx-auto md:mx-0'>
                                <div>-Fortalecimiento de capacidades y áreas sectoriales clave</div>
                                <div>-Empoderamiento de comunidades para crear negocios sostenibles</div>
                            </div>
                            <div className='flex-1 text-gray-700 mb-6 text-lg leading-7  mx-auto md:mx-0'>
                                <div>-Fomento de la innovación disruptiva y la economía circular</div>
                                <div>-Co-creación de soluciones inclusivas con todos los actores</div>
                            </div>
                        </div>
                        <div 
                        className='text-gray-700 mb-6 text-lg leading-7 mx-auto md:mx-0'>
                            -Utilización de tecnologías modernas para el impacto.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
