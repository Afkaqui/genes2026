import Image from 'next/image';
import indicadores from '@/images/img001_indicadores_genes.png';

export const IndicatorPage = () => {
    return (
        <section className="bg-[linear-gradient(to_right,_#759C30,_#34D399)] py-10 md:py-20">
            <div className="px-6 sm:px-10 md:px-16">
                <div className="flex flex-col justify-center items-center text-white">
                    <div className="mb-6 sm:mb-8 text-center">
                        <h2 className="text-[28px] sm:text-[32px] md:text-[36px] leading-[34px] sm:leading-[40px] md:leading-[44px] font-bold tracking-[-1px] sm:tracking-[-1.5px] md:tracking-[-2px] max-w-full sm:max-w-[800px] md:max-w-[934px]">
                           INDICADORES
                        </h2>
                    </div>
                </div>
                <div className='mb-6 w-full max-w-2xl mx-auto'>
                            <Image
                                src={indicadores}
                                alt="Indicadores GENES PERÚ"
                                width={800}
                                height={450}
                                className="rounded-lg shadow-lg object-cover"
                            />
                        </div>
            </div>
        </section>
    )
}
