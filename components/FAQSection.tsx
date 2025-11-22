import React, { useState } from 'react';

const FAQItem = ({ question, answer, link, linkText }: { question: string, answer: string, link?: string, linkText?: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-100 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-3 px-4 text-left flex justify-between items-center hover:bg-slate-50 transition-colors focus:outline-none"
            >
                <span className="font-semibold text-slate-700 text-sm pr-4 text-left">{question}</span>
                <span className={`text-red-600 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </span>
            </button>
            <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-4 pt-0 text-sm text-slate-600 leading-relaxed space-y-2 text-left">
                    {answer.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                    {link && (
                        <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-block mt-2 text-red-600 hover:text-red-800 font-medium hover:underline text-left"
                        >
                            {linkText || "Lees meer op amsterdam.nl →"}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

const FAQSection: React.FC = () => {
    return (
        <div className="w-full max-w-lg mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up delay-200 text-left">
            
             <FAQItem 
                question="Waar komt deze data vandaan?"
                answer="De gegevens op deze website zijn afkomstig van de officiële publicaties van de Gemeente Amsterdam, zoals gepubliceerd op Overheid.nl (Repository Overheid). Wij filteren deze openbare data specifiek op verleende vergunningen (Besluit vakantieverhuur vergunning Verleend)."
            />

            <FAQItem 
                question="Wat is tijdelijke vakantieverhuur?"
                answer={`Bij vakantieverhuur verhuurt u uw hele woning aan toeristen en bent u zelf niet aanwezig. Dit mag maximaal 30 nachten per jaar.\n\nDit is anders dan een Bed & Breakfast (B&B). Bij een B&B verhuurt u slechts een deel van de woning en bent u wél aanwezig tijdens het verblijf van de gasten. U mag deze twee vormen niet combineren op hetzelfde adres.`}
            />

            <FAQItem 
                question="Wat zijn de regels en voorwaarden?"
                answer={`U moet hoofdbewoner zijn en ingeschreven staan op het adres. Verhuur is toegestaan voor maximaal 30 nachten per jaar en aan maximaal 4 personen per keer.\n\nWoont u in een appartementencomplex? Let op: als de Vereniging van Eigenaren (VvE) of het splitsingsreglement vakantieverhuur verbiedt, is dit leidend. Ook als u een vergunning van de gemeente heeft, kan de VvE u het verhuren verbieden.\n\nDaarnaast: Elke vakantieverhuur moet vooraf gemeld worden. Sociale huurwoningen, tuinhuisjes, tenten en bootjes mogen niet verhuurd worden.`}
                link="https://www.amsterdam.nl/wonen-leven/wonen/vakantieverhuur/"
                linkText="Bekijk alle regels op amsterdam.nl"
            />

            <FAQItem 
                question="Wat kost een vergunning en hoe lang geldig?"
                answer={`Een vergunning kost in 2025 € 73,30. De vergunning is geldig tot 1 april van het volgende kalenderjaar, ongeacht wanneer u deze aanvraagt. Na aanvraag ontvangt u de vergunning doorgaans binnen 5 dagen.`}
            />

             <FAQItem 
                question="Betekent een vergunning ook verhuur?"
                answer="Nee. Een vergunning geeft het récht om te verhuren, maar betekent niet dat er daadwerkelijk gasten zijn geweest. Die specifieke bezettingsdata (de meldplicht rapportages) is niet openbaar."
            />

            <FAQItem 
                question="Hoe hoog zijn de boetes?"
                answer={`De gemeente controleert actief. Voor verhuur zonder vergunning of het niet vooraf melden van een verblijf ('meldplicht') riskeert u een boete van € 1.500,- als particulier en € 3.000,- bij bedrijfsmatige verhuur.`}
            />

            <FAQItem 
                question="Gaat het aantal nachten omlaag in Centrum en De Pijp?"
                answer={`Er is een voorstel om vanaf 1 april 2026 het maximum aantal nachten te verlagen van 30 naar 15 per jaar in specifieke wijken. Dit geldt voor Centrum (uitgezonderd Oostelijke Eilanden/Kadijken) en De Pijp.\n\nDit betreft de gebieden: Haarlemmerbuurt, Jordaan, Grachtengordel (West/Zuid), Weteringschans, Burgwallen, Nieuwmarkt/Lastage, Weesperbuurt/Plantage, en de Oude en Nieuwe Pijp. Als u tussen januari en april 2026 al 15 nachten heeft verhuurd, mag u de rest van het jaar niet meer verhuren.`}
            />
        </div>
    );
};

export default FAQSection;