import Image from 'next/image';
import SER_SOSTE from '@/images/icons/img001_servicios.svg';
import PRODUCT_SOSTE from '@/images/icons/img002_produtoc_sostenibles.svg';
import CIUD_SOSTE from '@/images/icons/img003_ciudades_soste.svg';
import RECURSOS from '@/images/icons/img004_recursos.svg';
import Tarjeta005 from '@/images/icons/img005_finanzas.png';
import Tarjeta006 from '@/images/icons/006_alimentacion.png';

export const LineasDeAccion = () => {
    return (
        <section id='lineas_accion' className="bg-gray-100 px-6 sm:px-12 md:px-20 py-16 sm:py-20 md:py-24">
            <div className="mx-auto px-4 sm:px-8 md:px-16">
                <div className="flex flex-col gap-y-12 sm:gap-y-16 md:gap-y-20 justify-start">
                    
                    {/* Título y descripción */}
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start text-center sm:text-left">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold max-w-[240px] sm:max-w-[300px] tracking-tighter mb-4 sm:mb-0">
                            LÍNEAS DE ACCIÓN
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-[444px] sm:max-w-[500px]">
                            Nuestras líneas de acción están preparadas para resolver diversas áreas.
                        </p>
                    </div>

                    {/* Contenedor de las tarjetas */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-8 sm:gap-12 md:gap-16">
                        
                        {/* Tarjeta 1 */}
                        <div className="rounded-lg p-6 flex flex-col items-center sm:items-start justify-start bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 w-full sm:w-[250px] md:w-[300px]">
                            <Image
                                src={SER_SOSTE}
                                alt="Capital Natural y Bioeconomía Regenerativa"
                                width={100}
                                height={100}
                                className="mb-4"
                            />
                            <h3 className="text-lg sm:text-xl text-[#101828] font-semibold mb-2 leading-7 text-center sm:text-left">
                                Capital Natural y Bioeconomía Regenerativa
                            </h3>
                            <p>•Bioeconomía</p>
                            <p>•Naturaleza Viva</p>
                            <p>•Recursos Sostenibles</p>
                        </div>

                        {/* Tarjeta 2 */}
                        <div className="rounded-lg p-6 flex flex-col items-center sm:items-start justify-start bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 w-full sm:w-[250px] md:w-[300px]">
                            <Image
                                src={PRODUCT_SOSTE}
                                alt="Productos y Servicios Sostenibles"
                                width={100}
                                height={100}
                                className="mb-4"
                            />
                            <h3 className="text-lg sm:text-xl text-[#101828] font-semibold mb-2 leading-7 text-center sm:text-left max-w-[300px]">
                                Territorios Resilientes y Transición Justa
                            </h3>
                            <p>•Ciudades Verdes</p>
                            <p>•Clima Seguro</p>
                            <p>•Comunidades Fuertes</p>
                        </div>

                        {/* Tarjeta 3 */}
                        <div className="rounded-lg p-6 flex flex-col items-center sm:items-start justify-start bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 w-full sm:w-[250px] md:w-[300px]">
                            <Image
                                src={CIUD_SOSTE}
                                alt="Industria Circular y Competitividad Sostenible"
                                width={100}
                                height={100}
                                className="mb-4"
                            />
                            <h3 className="text-lg sm:text-xl text-[#101828] font-semibold mb-2 leading-7 text-center sm:text-left">
                                Industria Circular y Competitividad Sostenible
                            </h3>
                            <p>•Residuo Cero</p>
                            <p>•Reusar Todo</p>
                            <p>•Producción Eficiente</p>
                            </div>

                        {/* Tarjeta 4 */}
                        <div className="rounded-lg p-6 flex flex-col items-center sm:items-start justify-start bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 w-full sm:w-[250px] md:w-[300px]">
                            <Image
                                src={RECURSOS}
                                alt="Turismo Regenerativo y Economías Creativas"
                                width={100}
                                height={100}
                                className="mb-4"
                            />
                            <h3 className="text-lg sm:text-xl text-[#101828] font-semibold mb-2 leading-7 text-center sm:text-left">
                                Turismo Regenerativo y Economías Creativas
                            </h3>
                            <p>•Viaje Consciente</p>
                            <p>•Cultura Local</p>
                            <p>•Ecoturismo</p>
                            </div>
                        {/* Tarjeta 5 Finanzas e Innovación para el Impacto */}
                        <div className="rounded-lg p-6 flex flex-col items-center sm:items-start justify-start bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 w-full sm:w-[250px] md:w-[300px]">
                            <Image
                                src={Tarjeta005}
                                alt="Finanzas e Innovación para el Impacto"
                                width={100}
                                height={100}
                                className="mb-4"
                            />
                            <h3 className="text-lg sm:text-xl text-[#101828] font-semibold mb-2 leading-7 text-center sm:text-left">
                                Finanzas e Innovación para el Impacto
                            </h3>
                            <p>•Inversión Verde</p>
                            <p>•Tecnología Sostenible</p>
                            <p>•Fondos Clima</p>
                            </div>
                        {/* Tarjeta 6 Bienestar Humano y Sistemas Alimentarios Sostenibles  */}
                        <div className="rounded-lg p-6 flex flex-col items-center sm:items-start justify-start bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 w-full sm:w-[250px] md:w-[300px]">
                            <Image
                                src={Tarjeta006}
                                alt="Bienestar Humano y Sistemas Alimentarios Sostenibles"
                                width={100}
                                height={100}
                                className="mb-4"
                            />
                            <h3 className="text-lg sm:text-xl text-[#101828] font-semibold mb-2 leading-7 text-center sm:text-left">
                                Bienestar Humano y Sistemas Alimentarios Sostenibles 
                            </h3>
                            <p>•Comida Sana</p>
                            <p>•Salud Total</p>
                            <p>•Alimentos Justos</p>
                            </div>


                    </div>
                </div>
            </div>
        </section>
    );
};
