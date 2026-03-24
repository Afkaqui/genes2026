import { Hero } from '@/components/ui/hero/Hero';
import { IndicatorPage } from '@/components/ui/indicator/indicator_page';
import { AboutUs } from '@/components/ui/aboutUs/AboutUs';
import { DirectorComponent } from '@/components/ui/director/director_component';
import { JoinUs } from '@/components/ui/joinUs/JoinUs';
import { Aliados } from '@/components/ui/aliados/Aliados';
import { LineasDeAccion } from '@/components/ui/lineasDeAccion/LineasDeAccion';
import { Trayectoria } from '@/components/ui/trayectoria/Trayectoria';
import { Socios } from '@/components/ui/socios/socios_page';
import { ContactUs } from '@/components/ui/contactUs/ContactUs';

export default function Home() {
  return (
    <>
      <Hero />
      <IndicatorPage />

      <section id="sobre-nosotros" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-genes -z-10" />
        <AboutUs />
      </section>

      <DirectorComponent />
      <JoinUs />
      <Aliados />
      <LineasDeAccion />
      <Trayectoria />
      <Socios />
      <ContactUs />
    </>
  );
}
