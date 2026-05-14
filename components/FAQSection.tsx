import React, { useState } from 'react';

// Force Update: 1722424800000

const FAQItem = ({ q, a, l, lt }: { q: string, a: string, l?: string, lt?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b last:border-0">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full py-3 px-4 text-left flex justify-between items-center hover:bg-slate-50">
                <span className="font-semibold text-sm">{q}</span>
                <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></span>
            </button>
            <div className={`overflow-hidden transition-all ${isOpen ? 'max-h-[800px]' : 'max-h-0'}`}>
                <div className="p-4 pt-0 text-sm text-slate-600 space-y-2">{a.split('\n').map((p, i) => <p key={i}>{p}</p>)}{l && <a href={l} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-red-600 hover:underline">{lt || "Lees meer"}</a>}</div>
            </div>
        </div>
    );
};

const FAQSection: React.FC = () => (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-xl shadow-sm border text-left">
        <FAQItem q="Wat is tijdelijke vakantieverhuur?" a={`Bij vakantieverhuur verhuurt de bewoner de hele woning. De bewoner is zelf niet thuis.\nDit is anders dan een Bed & Breakfast, waarbij de bewoner wel thuis is.`} />
        <FAQItem q="Waar komt deze data vandaan?" a="Deze website toont openbare gegevens van de Gemeente Amsterdam, gepubliceerd op Overheid.nl. Het gaat alleen om verleende vergunningen." />
        <FAQItem q="Zijn er ook andere regels?" a={`Jazeker. Naast de regels van de gemeente, gelden ook de regels van bijvoorbeeld een Vereniging van Eigenaren (VvE). Als de VvE verhuur verbiedt, mag het niet.`} l="https://www.amsterdam.nl/wonen-bouwen-verbouwen/woonruimte-verhuren/regels-verhuur-woning/" lt="Bekijk meer regels op amsterdam.nl" />
        <FAQItem q="Wat zijn de belangrijkste voorwaarden?" a={`De woning moet uw hoofdverblijf zijn. U mag aan maximaal 4 personen tegelijk verhuren voor maximaal 30 nachten per kalenderjaar. Sociale huurwoningen mogen niet verhuurd worden.\nDaarnaast is een registratienummer, een vergunning en het vooraf melden van elke verhuurperiode verplicht.`} />
        <FAQItem q="Wat kost een vergunning en hoe lang is die geldig?" a={`Een vergunning kost eenmalig € 76,- (in 2026). De vergunning is geldig voor het lopende jaar tot 1 april van het volgende jaar.`} />
        <FAQItem q="Betekent een vergunning ook verhuur?" a="Nee, een vergunning geeft alleen toestemming. Het is niet zeker of er ook echt is verhuurd. Die informatie is niet openbaar." />
        <FAQItem q="Hoe hoog zijn de boetes?" a={`Voor verhuur zonder vergunning of het niet vooraf melden, kan een boete volgen. Voor particulieren is dit € 1.500,-.`} />
        <FAQItem q="Nieuwe regels voor Centrum en De Pijp per 2026" a={`Vanaf 1 april 2026 geldt er een limiet van maximaal 15 nachten per jaar voor de Haarlemmerbuurt, Jordaan, Grachtengordel-West/Zuid, De Weteringschans, Burgwallen-Nieuwe Zijde, Nieuwmarkt/Lastage en Oude Pijp.\nHeeft u hier tussen 1 januari en 1 april 2026 al 15 nachten verhuurd? Dan mag u de rest van 2026 niet meer verhuren.`} l="https://www.amsterdam.nl/wonen-bouwen-verbouwen/huisvestingsvergunning/vergunning-vakantieverhuur-aanvragen/regels-vakantieverhuur-deel-centrum-en/" lt="Lees de regels op Amsterdam.nl" />
    </div>
);
export default FAQSection;
