import Image from 'next/image';
import guia from '@/images/img002_registro_genes.png';

export const ContactUs = () => {
    return (
        <section id='contacto' className="container mx-auto px-6 sm:px-12 lg:px-20 py-12 mb-20">
            {/* Contenedor principal de 2 columnas */}
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                {/* Columna izquierda - Texto */}
                <div className="flex-1 space-y-6">
                    <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight text-gray-900">
                        SE PARTE DE NUESTRA SOCIEDAD
                    </h2>
                    
                    <p className="text-[#475467] text-lg sm:text-xl">
                        ¡Hazte socio de GENES Perú y contribuye a un futuro sostenible!
                    </p>
                    
                    <p className="text-[#475467] text-lg sm:text-xl">
                        Únete a nosotros y forma parte de una red de actores comprometidos con el desarrollo sostenible del Perú, impulsando el crecimiento económico, social y ambiental.
                    </p>
                    
                    <div className="space-y-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                            Pasos para seguir:
                        </h3>
                        
                        <div className="space-y-3 pl-4 border-l-4 border-[#759C30]">
                            <div>
                                <h4 className="font-semibold text-lg">PASO 1: REGÍSTRATE PARA POSTULAR</h4>
                                <p className="text-[#475467]">Completa el formulario en línea con tus datos personales y empresariales.</p>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-lg">PASO 2: LLEVA NUESTRO CURSO DE SOSTENIBILIDAD</h4>
                                <p className="text-[#475467]">Elige un tema y lleva el curso para que aprendas a sustentar tu postulación.</p>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-lg">PASO 3: ÚNETE A NUESTRA COMUNIDAD</h4>
                                <p className="text-[#475467]">Accede a nuestra plataforma exclusiva, participa en eventos y recibe beneficios para tu negocio.</p>
                            </div>
                        </div>
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold text-[#759C30]">
                        ¡Juntos, construimos un futuro próspero y sostenible para el Perú!
                    </h3>
                    
                    {/* Botón en columna izquierda (versión móvil) */}
                    <div className="mt-8">
                        <a
                            href="https://docs.google.com/forms/d/1oi793cjqa7m2HZeSe8EQE0mJd986FvQYfJbYXJvCU0U/viewform?edit_requested=true" 
                            className="inline-block bg-[#759C30] hover:bg-[#5a7a24] text-white text-lg sm:text-xl font-semibold py-3 px-8 rounded-lg transition-colors duration-300 text-center"
                        >
                            Regístrate
                        </a>
                    </div>
                </div>
                
                {/* Columna derecha - Imagen larga */}
                <div className="flex-1 w-full h-full min-h-[500px] lg:min-h-[600px] relative rounded-xl overflow-hidden shadow-lg">
                    <Image
                        src={guia}
                        alt="Miembros de GENES Perú colaborando"
                        fill
                        className="object-scale-down object-center"
                        quality={100}
                        priority
                    />
                </div>
            </div>
        </section>
    );
};