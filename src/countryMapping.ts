// Country name mapping between teams.ts and map.svg path IDs
export const countryMapping: Record<string, string> = {
  // teams.ts -> map.svg path ID mappings for mismatched names
  "England": "United_Kingdom",
  "Scotland": "United_Kingdom", 
  // These already match correctly:
  // "Spain" -> "Spain"
  // "Germany" -> "Germany" 
  // "France" -> "France"
  // "Italy" -> "Italy"
  // "Portugal" -> "Portugal"
  // "Netherlands" -> "Netherlands"
  // "Brazil" -> "Brazil"
  // "Argentina" -> "Argentina"
  // "Austria" -> "Austria"
  // "Belgium" -> "Belgium"
  // "Ukraine" -> "Ukraine"
  // "Denmark" -> "Denmark"
  // "Greece" -> "Greece"
  // "Turkey" -> "Turkey"
  // "Switzerland" -> "Switzerland"
  // "Czechia" -> "Czechia" (matches!)
  // "Croatia" -> "Croatia"
  // "Serbia" -> "Serbia"
  // "Sweden" -> "Sweden"
  // "Norway" -> "Norway"
  // "Bulgaria" -> "Bulgaria"
  // "Hungary" -> "Hungary"
  // "Israel" -> "Israel"
  // "Moldova" -> "Moldova"
  // "Egypt" -> "Egypt"
  // "Saudi_Arabia" -> "Saudi_Arabia"
  // "United_States" -> "United_States"
  // "Japan" -> "Japan"
  // "Morocco" -> "Morocco"
  // "New_Zealand" -> "New_Zealand" (need to verify if this exists)
};

// Function to get the correct SVG path ID for a given country
export function getMapCountryId(country: string): string {
  return countryMapping[country] || country;
}