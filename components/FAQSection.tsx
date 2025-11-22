
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
                question="Wat is tijdelijke vakantieverhuur?"
                answer={`Bij vakantieverhuur verhuurt de bewoner de hele woning aan toeristen. De bewoner is zelf niet thuis. Dit mag maximaal 30 nachten per jaar.\n\nDit is anders dan een Bed en Breakfast. Bij een Bed en Breakfast wordt maar een deel van het huis verhuurd en is de bewoner wel thuis.`}
            />

             <FAQItem 
                question="Waar komt deze data vandaan?"
                answer="Deze website toont openbare gegevens van de Gemeente Amsterdam. De informatie komt direct van de website Overheid punt nl. Het gaat alleen om adressen die een vergunning hebben gekregen."
            />

            <FAQItem 
                question="Wat zijn de regels en voorwaarden?"
                answer={`De aanvrager moet zelf in het huis wonen en daar ingeschreven staan. Verhuur is toegestaan voor maximaal 30 nachten per jaar en aan maximaal 4 personen per keer.\n\nIs de woning onderdeel van een Vereniging van Eigenaren? Dan gelden hun regels ook. Als de vereniging zegt dat verhuur niet mag, dan mag het niet. Ook sociale huurwoningen mogen niet verhuurd worden.`}
                link="https://www.amsterdam.nl/wonen-leven/wonen/vakantieverhuur/"
                linkText="Bekijk alle regels op amsterdam.nl"
            />

            <FAQItem 
                question="Wat kost een vergunning en hoe lang geldig?"
                answer={`Een vergunning kost in 2025 € 73,30. De vergunning is geldig voor het lopende jaar en loopt door tot 1 april van het jaar daarna.`}
            />

             <FAQItem 
                question="Betekent een vergunning ook verhuur?"
                answer="Nee. Een vergunning geeft alleen toestemming om te verhuren. Het betekent niet zeker dat er ook echt toeristen zijn geweest. Die informatie is privé en staat niet online."
            />

            <FAQItem 
                question="Hoe hoog zijn de boetes?"
                answer={`De gemeente controleert streng. Is er geen vergunning? Of is er niet vooraf gemeld dat er gasten komen? Dan volgt er een boete. Voor bewoners is de boete 1500 euro. Voor bedrijven is dit 3000 euro.`}
            />

            <FAQItem 
                question="Nieuwe regels voor Centrum en De Pijp per 2026"
                answer={`Er is een plan om het aantal nachten te verlagen in het Centrum en De Pijp. Vanaf 1 april 2026 mag daar misschien nog maar 15 nachten per jaar verhuurd worden.`}
            />
        </div>
    );
};

export default FAQSection;
