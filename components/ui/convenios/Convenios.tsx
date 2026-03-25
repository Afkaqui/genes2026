import { FaHandshake } from 'react-icons/fa';

const convenios = [
    {
        institucion: "Instituto Tecnológico de la Producción (ITP)",
        descripcion: "Cooperación para diseñar y promover proyectos conjuntos que aceleren la transición hacia una economía circular con triple impacto.",
        año: "2025",
    },
    {
        institucion: "Universidad Nacional Hermilio Valdizán (UNHEVAL)",
        descripcion: "Cooperación interinstitucional para la promoción y asistencia gratuita de emprendimientos sostenibles.",
        año: "2022",
    },
    {
        institucion: "Universidad Nacional Agraria de la Selva (UNAS)",
        descripcion: "Cooperación académica para promover innovación en emprendimiento sostenible y prácticas ambientalmente responsables.",
        año: "2023",
    },
    {
        institucion: "Universidad Nacional de Piura (UNP)",
        descripcion: "Cooperación en investigación, docencia y promoción del emprendimiento sostenible con enfoque multicultural.",
        año: "2022",
    },
    {
        institucion: "Gobierno Regional de Amazonas",
        descripcion: "Cooperación para promover emprendimiento sostenible, turismo sostenible y gestión ambiental en la región Amazonas.",
        año: "2023",
    },
    {
        institucion: "APESOFT – Asociación Peruana de Software y Tecnologías",
        descripcion: "Cooperación para promover innovación, economía digital y emprendimiento sostenible en la industria tecnológica.",
        año: "2023",
    },
    {
        institucion: "ONGD Amazon King International Educational Center (AKIEC)",
        descripcion: "Alianza estratégica para cooperación en educación, desarrollo sostenible y turismo en la Amazonía peruana.",
        año: "2023",
    },
    {
        institucion: "C.E.T.P.R.O Privateacher International",
        descripcion: "Convenio para brindar capacitación y enseñanza del idioma inglés a los socios de GENES Perú y sus familias.",
        año: "2023",
    },
];

export const Convenios = () => {
    return (
        <section className="py-16 px-4 sm:px-12 lg:px-24 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-[36px] sm:text-[48px] leading-[44px] sm:leading-[60px] tracking-tight font-bold text-center mb-4">
                    CONVENIOS INSTITUCIONALES
                </h2>
                <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
                    Fortalecemos alianzas estratégicas con instituciones públicas y privadas para impulsar el emprendimiento sostenible en todo el Perú.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {convenios.map((convenio, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#759C30]/10 flex items-center justify-center flex-shrink-0">
                                    <FaHandshake className="w-5 h-5 text-[#759C30]" />
                                </div>
                                <span className="text-sm text-[#759C30] font-semibold">{convenio.año}</span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm leading-5 mb-2">
                                {convenio.institucion}
                            </h3>
                            <p className="text-gray-500 text-sm leading-5">
                                {convenio.descripcion}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
