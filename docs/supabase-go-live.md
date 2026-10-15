# Aktivera Move mot Supabase Data API

Move använder ett eget PostgreSQL-schema, `move`, i den delade Supabase-instansen `styhag_db`. Andra scheman/projekt får inte ändras.

## Status
- Databastabeller och RLS-policyer finns i `move`.
- Publik demo på `/` använder exempeldata och är inte kopplad till Supabase.
- Personalportalen på `/app` använder Supabase Auth och frågar via `.schema("move")`.
- **Blockerare:** `move` måste läggas till i Supabases inställning **Exposed schemas** för Data API. Detta är en projektövergripande inställning. Behåll befintliga scheman oförändrade och lägg endast till `move`. Ändra inte `energy` eller befintliga `public`-objekt.
- SQL-grants och RLS-policyer för anställda och attestering finns i migrationsfilerna. `anon` ska inte få tillgång till Move-tabeller.

## Verifiering före skarp drift
1. Kontrollera att `move` är exponerat och att en anonym REST-begäran mot en Move-tabell nekas.
2. Skapa en organisation och minst två testanvändare i Supabase Auth med varsitt medlemskap.
3. Tilldela ett uppdrag till endast en av användarna. Verifiera att den andra inte kan läsa uppdraget eller registrera tid/material på det.
4. Verifiera att den tilldelade användaren kan registrera tillgänglighet, tid och material.
5. Verifiera att en vanlig anställd inte kan attestera någon annans tid.
6. Verifiera att en manager i rätt organisation kan godkänna/avvisa, att `approved_by` och `approved_at` stämplas och att rapportens innehåll inte ändras.
7. Verifiera att inga rapporter eller material syns mellan två organisationer.
8. Testa byggning, inloggning, återinloggning och mobil layout.

## Kvarvarande produktarbete
- Kontoadministration/inbjudningar och organisationsval för användare med flera medlemskap.
- Fullständig materialkatalog och chefsadministration.
- Korrekt lokal tidskonvertering kring sommartidsomställning och nattpass.
- Schemaläggning, erbjudanden och integrationstester.

**Driftsätt inte med riktiga personuppgifter förrän ovanstående tester är godkända.**
