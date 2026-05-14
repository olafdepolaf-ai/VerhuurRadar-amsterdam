# VerhuurRadar Amsterdam

Zoek op adres of locatie en zie direct welke vakantieverhuurvergunningen er actief zijn in de buurt. Data komt rechtstreeks uit de open datasets van de overheid.

## Wat het doet

- Zoek op adres of gebruik je GPS-locatie
- Zie actieve en historische vergunningen (2021–heden) op een interactieve kaart
- Klik door naar de officiële vergunningspagina per adres
- Verplaats de kaart en zoek in een nieuw gebied met één klik

## Lokaal draaien

Node.js 18+ vereist.

```bash
npm install
cp .env.example .env   # vul je Firebase config in
npm run dev
```

## Tech

React · TypeScript · Vite · Tailwind CSS · Leaflet · Firebase · Vercel

## Data

Vergunningsdata via [repository.overheid.nl](https://repository.overheid.nl/sru).
Adreszoekfunctie via [PDOK Locatieserver](https://api.pdok.nl).

---

Gemaakt door [Olaf Lemmers](https://www.linkedin.com/in/olaflemmers/)
