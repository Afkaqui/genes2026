import { FaSeedling, FaUsers, FaLightbulb, FaHandsHelping, FaMicrochip } from 'react-icons/fa';

const pilares = [
    {
        icon: FaSeedling,
        titulo: "Capacidades Sectoriales",
        descripcion: "Fortalecimiento de capacidades y áreas sectoriales clave para el desarrollo sostenible.",
    },
    {
        icon: FaUsers,
        titulo: "Comunidades Empoderadas",
        descripcion: "Empoderamiento de comunidades para crear negocios sostenibles y resilientes.",
    },
    {
        icon: FaLightbulb,
        titulo: "Innovación Circular",
        descripcion: "Fomento de la innovación disruptiva y la economía circular en cada emprendimiento.",
    },
    {
        icon: FaHandsHelping,
        titulo: "Co-creación Inclusiva",
        descripcion: "Co-creación de soluciones inclusivas con todos los actores del ecosistema.",
    },
    {
        icon: FaMicrochip,
        titulo: "Tecnología de Impacto",
        descripcion: "Utilización de tecnologías modernas para generar impacto real y medible.",
    },
];

export const AboutUs = () => {
    return (
        <section id="nosotros" className="relative">
            <div className="py-16 px-6 sm:px-12 lg:px-24 bg-white">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-[36px] sm:text-[48px] leading-[44px] sm:leading-[60px] font-bold text-gray-900 mb-6">
                            NOSOTROS
                        </h2>
                        <p className="text-lg sm:text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
                            Somos <span className="font-bold text-[#759C30]">GENES PERÚ</span>, un gremio sin fines de lucro que impulsa emprendimientos sostenibles en todo el Perú, promoviendo el crecimiento económico, social y ambiental para un futuro próspero.
                        </p>
                    </div>

                    {/* Pilares */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {pilares.map((pilar, index) => {
                            const Icon = pilar.icon;
                            return (
                                <div
                                    key={index}
                                    className="group text-center p-6 rounded-xl bg-gray-50 hover:bg-[#759C30] transition-colors duration-300"
                                >
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#759C30]/10 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                                        <Icon className="w-7 h-7 text-[#759C30] group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 group-hover:text-white mb-2 transition-colors duration-300">
                                        {pilar.titulo}
                                    </h3>
                                    <p className="text-sm text-gray-500 group-hover:text-white/80 leading-5 transition-colors duration-300">
                                        {pilar.descripcion}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
