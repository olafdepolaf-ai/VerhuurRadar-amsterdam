# 📡 VerhuurRadar Amsterdam

Inzicht in de vakantieverhuur vergunningen in Amsterdam. 

Met deze applicatie kunnen bewoners en geïnteresseerden eenvoudig op de kaart zien waar actuele vergunningen voor vakantieverhuur (zoals Airbnb) zijn verleend. De data wordt direct opgehaald uit de officiële bronnen van de gemeente Amsterdam.

## ✨ Functionaliteiten

- **Interactieve Kaart**: Visualisatie van alle vergunningen in de stad.
- **Zoeken op Adres**: Vind direct de status van een specifieke locatie.
- **📍 Huidige Locatie**: Gebruik je GPS om direct in je eigen buurt te scannen.
- **🗺️ Zoek in dit gebied**: Verplaats de kaart en scan een nieuwe wijk met één klik.
- **Historische Data**: Bekijk vergunningen van de afgelopen jaren (2021-2025).
- **Notificaties (Firebase)**: Mogelijkheid om alerts in te stellen voor specifieke adressen.

## 🛠️ Installatie (Lokaal)

**Vereisten:** Node.js (v18+)

1. Clone de repository.
2. Gebruik `npm install` om alle dependencies te installeren.
3. Maak een `.env` bestand aan met de benodigde Firebase configuratie.
4. Run de app met:
   ```bash
   npm run dev
   ```

## 🚀 Deployment

De app is geoptimaliseerd voor deployment op **Vercel**. 
Bij elke push naar de `main` branch wordt er automatisch een nieuwe versie gebouwd en live gezet.

---
*Gemaakt met ❤️ voor een leefbaar Amsterdam.*
