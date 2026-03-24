import { Hero } from '@/components/ui/hero/Hero';
import { IndicatorPage } from '@/components/ui/indicator/indicator_page';
import { AboutUs } from '@/components/ui/aboutUs/AboutUs';
import {DirectorComponent} from '@/components/ui/director/director_component';

import { JoinUs } from '@/components/ui/joinUs/JoinUs';
import { Aliados } from '@/components/ui/aliados/Aliados';
import { LineasDeAccion } from '@/components/ui/lineasDeAccion/LineasDeAccion';
import { ContactUs } from '@/components/ui/contactUs/ContactUs';
// Debe revisarse para refactor
import { Trayectoria } from '@/components/ui/trayectoria/Trayectoria';
import {Socios} from '@/components/ui/socios/socios_page'

//Componente nuevo

export default function Home() {
    return (
        <div>
            <Hero />
            <IndicatorPage/>
            <AboutUs />
            <DirectorComponent/>
            <JoinUs />
            <Aliados />
            <LineasDeAccion/>
            <Trayectoria/>
            <Socios />
            <ContactUs/>
        </div>
    );
}
