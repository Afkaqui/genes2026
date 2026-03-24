import Image from 'next/image';
import Link from 'next/link';

// Importar multimedia de directores
import DIRECTOR1 from '@/images/autoridades/img001_Eduardo Noriega.jpeg';
import DIRECTOR2 from '@/images/autoridades/img002_Ada_Liccet.jpeg';
import DIRECTOR3 from '@/images/autoridades/img003_Percy_Alberto.png';
import DIRECTOR4 from '@/images/autoridades/img004_Cristian_Augusto.jpeg';
import DIRECTOR5 from '@/images/autoridades/img005_Jhina_Lorena.png';
import DIRECTOR6 from '@/images/autoridades/img006_Juan_Miguel.jpg';
import DIRECTOR7 from '@/images/autoridades/img007_Mara_Isabel.png';
import DIRECTOR8 from '@/images/autoridades/img008_Rosa_Karina.jpeg';

export const DirectorComponent = () => {
  const directores = [
    {
      nombre: "Eduardo Jose Noriega Campos",
      cargo: "DIRECTOR GENERAL",
      imagen: DIRECTOR1,
      enlace: "https://www.linkedin.com/in/ingeduardonoriegaperu "
    },
    {
      nombre: "Ada Liccet Teresa Suarez Amapanqui",
      cargo: "DIRECTOR SOSTENIBILIDAD",
      imagen: DIRECTOR2,
      enlace: "https://www.linkedin.com/in/liccetsuarez/"
    },
    {
      nombre: "Percy Alberto Tafur Culqui",
      cargo: "DIRECTOR DESARROLLO HUMANO",
      imagen: DIRECTOR3,
      enlace: "https://www.linkedin.com/in/percy-a-tafur-culqui-6536bba8/"
    },
    {
      nombre: "Cristian Augusto Gutierrez Zevallos",
      cargo: "DIRECTOR INNOVACIÓN",
      imagen: DIRECTOR4,
      enlace: "https://www.linkedin.com/in/cristiangz/"
    },
    {
      nombre: "Jhina Lorena López Vasquez",
      cargo: "DIRECTOR INVERSIÓN DE IMPACTO",
      imagen: DIRECTOR5,
      enlace: "https://www.linkedin.com/in/jhina-v%C3%A1squez-l%C3%B3pez-079b97237/"
    },
    {
      nombre: "Juan Miguel Quispe Mullisaca",
      cargo: "DIRECTOR FINANZAS",
      imagen: DIRECTOR6,
      enlace: "https://www.linkedin.com/in/miguel-quispe-2b3a4681/"
    },
    {
      nombre: "Mara Isabel Delgado Vaca Guzman",
      cargo: "DIRECTOR RELACIONES INTERINSTITUCIONALES",
      imagen: DIRECTOR7,
      enlace: "https://www.linkedin.com/in/idvg-sostenibilidad/"
    },
    {
      nombre: "Rosa Karina Pinasco Vela",
      cargo: "DIRECTORA FUNDADORA",
      imagen: DIRECTOR8,
      enlace: "https://www.linkedin.com/in/rosa-karina-pinasco-vela-5b031b150/"
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-8 lg:px-16 bg-white">
      {/* Título principal */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          NUESTROS DIRECTORES
        </h1>
      </div>

      {/* Contenedor de dos columnas */}
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* Columna izquierda - Introducción */}
        <div className="lg:w-1/3 bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Impulsando el emprendimiento sostenible en el Perú con innovación, colaboración y un compromiso firme con la madre tierra.</h2>
          
          <div className="space-y-6">
            {/* <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">DEFENSORÍA UNIVERSITARIA</h3>
              <h4 className="text-lg text-gray-600 mb-2">DICIONES INSTELACIÓN</h4>
              <h5 className="text-md text-gray-500">RESULTADO</h5>
            </div> */}

            <p className="text-gray-600">
            En GENES Perú, nuestros directores son líderes comprometidos con la 
            transformación sostenible del país. Su labor se centra en fortalecer capacidades, 
            fomentar la innovación y articular esfuerzos para promover emprendimientos que respeten 
            y honren a la madre tierra.
            </p>
          </div>
        </div>

        {/* Columna derecha - Lista de autoridades */}
        <div className="lg:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {directores.map((autoridad, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                  {/* Imagen clickeable */}
                  <Link href={autoridad.enlace} passHref legacyBehavior>
                    <a 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-24 h-24 relative flex-shrink-0 group"
                      aria-label={`Perfil de ${autoridad.nombre}`}
                    >
                      <Image
                        src={autoridad.imagen}
                        alt={`Foto de ${autoridad.nombre}`}
                        fill
                        className="object-cover rounded-full group-hover:opacity-90 transition-opacity"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-full"></div>
                    </a>
                  </Link>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{autoridad.nombre}</h3>
                    <p className="text-md font-semibold text-[#759C30] mb-2">{autoridad.cargo}</p>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};