// Auto-generated country coordinates from SVG map
export interface CountryCoordinates {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

// SVG original dimensions
export const SVG_VIEWBOX = {
  width: 895.92,
  height: 471.76
};

// Transform coordinates from SVG coordinate system to screen coordinates
export function transformSvgToScreen(
  svgX: number, 
  svgY: number, 
  containerWidth: number, 
  containerHeight: number, 
  zoom: number, 
  panX: number, 
  panY: number
): { x: number; y: number } {
  // Calculate scale factors (how much the SVG is scaled to fit the container)
  const scaleX = containerWidth / SVG_VIEWBOX.width;
  const scaleY = containerHeight / SVG_VIEWBOX.height;
  
  // Use the smaller scale to maintain aspect ratio
  const baseScale = Math.min(scaleX, scaleY);
  
  // Apply base scaling from SVG to container
  const baseX = svgX * baseScale;
  const baseY = svgY * baseScale;
  
  // Apply zoom and pan transformations
  const screenX = (baseX * zoom) + panX;
  const screenY = (baseY * zoom) + panY;
  
  return { x: screenX, y: screenY };
}

// Transform coordinates from screen coordinates back to SVG coordinate system
export function transformScreenToSvg(
  screenX: number, 
  screenY: number, 
  containerWidth: number, 
  containerHeight: number, 
  zoom: number, 
  panX: number, 
  panY: number
): { x: number; y: number } {
  // Reverse the pan and zoom transformations
  const baseX = (screenX - panX) / zoom;
  const baseY = (screenY - panY) / zoom;
  
  // Calculate scale factors
  const scaleX = containerWidth / SVG_VIEWBOX.width;
  const scaleY = containerHeight / SVG_VIEWBOX.height;
  const baseScale = Math.min(scaleX, scaleY);
  
  // Convert back to SVG coordinates
  const svgX = baseX / baseScale;
  const svgY = baseY / baseScale;
  
  return { x: svgX, y: svgY };
}

// Calculate distance between two points in SVG coordinate system
export function calculateDistance(point1: { x: number; y: number }, point2: { x: number; y: number }): number {
  const deltaX = point2.x - point1.x;
  const deltaY = point2.y - point1.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

// Calculate direction angle between two points (in radians)
export function calculateDirection(from: { x: number; y: number }, to: { x: number; y: number }): number {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  return Math.atan2(deltaY, deltaX);
}

// Convert radians to degrees
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

// Convert degrees to radians
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Get the compass direction (N, NE, E, SE, S, SW, W, NW) from an angle in degrees
// In math coordinates: 0° = East, 90° = South, 180° = West, 270° = North
export function getCompassDirection(degrees: number): string {
  // Normalize to 0-360 range
  const normalized = ((degrees % 360) + 360) % 360;
  
  // Direct mapping from math coordinates to compass directions
  // Math: 0°=E, 45°=SE, 90°=S, 135°=SW, 180°=W, 225°=NW, 270°=N, 315°=NE
  if (normalized >= 337.5 || normalized < 22.5) return 'E';    // 0° ± 22.5°
  if (normalized >= 22.5 && normalized < 67.5) return 'SE';    // 45° ± 22.5°
  if (normalized >= 67.5 && normalized < 112.5) return 'S';    // 90° ± 22.5°
  if (normalized >= 112.5 && normalized < 157.5) return 'SW';  // 135° ± 22.5°
  if (normalized >= 157.5 && normalized < 202.5) return 'W';   // 180° ± 22.5°
  if (normalized >= 202.5 && normalized < 247.5) return 'NW';  // 225° ± 22.5°
  if (normalized >= 247.5 && normalized < 292.5) return 'N';   // 270° ± 22.5°
  if (normalized >= 292.5 && normalized < 337.5) return 'NE';  // 315° ± 22.5°
  
  return 'E'; // fallback
}

// Find countries in a specific direction from a starting country
export function findCountriesInDirection(
  fromCountry: string,
  direction: string,
  maxDistance: number = Infinity,
  excludeCountries: string[] = []
): Array<{ country: string; distance: number; direction: string }> {
  const fromCoords = countryCoordinates[fromCountry];
  if (!fromCoords) return [];
  
  const results: Array<{ country: string; distance: number; direction: string }> = [];
  
  Object.entries(countryCoordinates).forEach(([country, coords]) => {
    if (country === fromCountry || excludeCountries.includes(country)) return;
    
    const distance = calculateDistance(
      { x: fromCoords.centerX, y: fromCoords.centerY }, 
      { x: coords.centerX, y: coords.centerY }
    );
    if (distance > maxDistance) return;
    
    const angle = calculateDirection(
      { x: fromCoords.centerX, y: fromCoords.centerY }, 
      { x: coords.centerX, y: coords.centerY }
    );
    const degrees = radiansToDegrees(angle);
    const compassDir = getCompassDirection(degrees);
    
    if (compassDir === direction) {
      results.push({ country, distance, direction: compassDir });
    }
  });
  
  return results.sort((a, b) => a.distance - b.distance);
}

export const countryCoordinates: Record<string, CountryCoordinates> = {
  "Afghanistan": { centerX: 316.53, centerY: 98.78, width: 633.8, height: 195.4 },
  "Albania": { centerX: 499.13, centerY: 182.31, width: 0, height: 0 },
  "Alberta_CA": { centerX: 174.21, centerY: 160.93, width: 0, height: 0 },
  "Algeria": { centerX: 216.51, centerY: 115.26, width: 438.9, height: 228.49 },
  "American_Samoa": { centerX: 23.51, centerY: 328.72, width: 0, height: 0 },
  "Andorra": { centerX: 225.14, centerY: 90.67, width: 453.47, height: 181.34 },
  "Angola": { centerX: 225.02, centerY: 152.97, width: 510.93, height: 303.14 },
  "Antigua_and_Barbuda": { centerX: 293.98, centerY: 250.16, width: 0, height: 0 },
  "Argentina": { centerX: 138.57, centerY: 218.96, width: 278.15, height: 435.43 },
  "Armenia": { centerX: 280.63, centerY: 92.73, width: 558.58, height: 182.62 },
  "Australia": { centerX: 413.65, centerY: 222, width: 859.31, height: 444 },
  "Austria": { centerX: 490.11, centerY: 161.55, width: 0, height: 0 },
  "Azerbaijan": { centerX: 280.57, centerY: 93.35, width: 558.59, height: 182.62 },
  "Bahamas": { centerX: 132.53, centerY: 119.84, width: 267.58, height: 237.93 },
  "Bahrain": { centerX: 285.81, centerY: 112.69, width: 574.82, height: 225.37 },
  "Bangladesh": { centerX: 678.29, centerY: 237.44, width: 0, height: 0 },
  "Barbados": { centerX: 300.1, centerY: 260.06, width: 0, height: 0 },
  "Belarus": { centerX: 506.7, centerY: 152.07, width: 0, height: 0 },
  "Belgium": { centerX: 454.23, centerY: 153.49, width: 0, height: 0 },
  "Belize": { centerX: 226.72, centerY: 253.12, width: 0, height: 0 },
  "Benin": { centerX: 456.9, centerY: 263.77, width: 0, height: 0 },
  "Bhutan": { centerX: 675.94, centerY: 222.13, width: 0, height: 0 },
  "Bolivia": { centerX: 137.23, centerY: 169.04, width: 275.54, height: 335.91 },
  "Bosnia_and_Herzegovina": { centerX: 491.88, centerY: 179.25, width: 0, height: 0 },
  "Botswana": { centerX: 255.38, centerY: 170.75, width: 510.86, height: 333.99 },
  "Brazil": { centerX: 128.79, centerY: 185.21, width: 351.67, height: 370.42 },
  "British_Columbia_CA": { centerX: 75.43, centerY: 80.99, width: 162.34, height: 159.89 },
  "Brunei": { centerX: 734.45, centerY: 280.77, width: 0, height: 0 },
  "Bulgaria": { centerX: 513.47, centerY: 182.78, width: 0, height: 0 },
  "Burkina_Faso": { centerX: 230.96, centerY: 132.15, width: 445.87, height: 262.21 },
  "Burundi": { centerX: 523.98, centerY: 298.97, width: 0, height: 0 },
  "Cabo_Verde": { centerX: 386.49, centerY: 255.65, width: 0, height: 0 },
  "Cambodia": { centerX: 353.09, centerY: 133.36, width: 724.78, height: 245.57 },
  "Cameroon": { centerX: 242.17, centerY: 144.36, width: 467.93, height: 286.51 },
  "Canada": { centerX: 107.63, centerY: 86.78, width: 309.45, height: 173.44 },
  "Central_African_Republic": { centerX: 252.07, centerY: 133.41, width: 505.55, height: 264.62 },
  "Chad": { centerX: 240.16, centerY: 130.67, width: 485.58, height: 259.21 },
  "Chile": { centerX: 87.95, centerY: 168.5, width: 374.1, height: 337 },
  "China": { centerX: 308.93, centerY: 107.99, width: 681.1, height: 215.09 },
  "Colombia": { centerX: 125.31, centerY: 145.23, width: 253.02, height: 288.41 },
  "Comoros": { centerX: 556.9, centerY: 323.77, width: 0, height: 0 },
  "Congo": { centerX: 247.04, centerY: 143.39, width: 494.53, height: 281.91 },
  "Costa_Rica": { centerX: 131, centerY: 133.56, width: 217.69, height: 264.28 },
  "Cote_d_Ivoire": { centerX: 218.15, centerY: 134.51, width: 419.86, height: 266.22 },
  "Croatia": { centerX: 244.61, centerY: 84.96, width: 488.86, height: 166.45 },
  "Cuba": { centerX: 128.49, centerY: 121.42, width: 265.25, height: 242.84 },
  "Cyprus": { centerX: 264.89, centerY: 101.58, width: 538.2, height: 197.38 },
  "Czechia": { centerX: 484.8, centerY: 154.24, width: 0, height: 0 },
  "DR_Congo": { centerX: 240.04, centerY: 142.21, width: 508.53, height: 284.26 },
  "Denmark": { centerX: 236.59, centerY: 72.03, width: 465.82, height: 137.26 },
  "Djibouti": { centerX: 277.38, centerY: 132.76, width: 556.33, height: 263.06 },
  "Dominica": { centerX: 295.28, centerY: 254.88, width: 0, height: 0 },
  "Dominican_Republic": { centerX: 135, centerY: 124.45, width: 268.85, height: 237.74 },
  "Ecuador": { centerX: 124.38, centerY: 145.23, width: 254.89, height: 288.41 },
  "Egypt": { centerX: 266.28, centerY: 106.38, width: 533.77, height: 212.75 },
  "El_Salvador": { centerX: 223.78, centerY: 258.62, width: 0, height: 0 },
  "England": { centerX: 219.83, centerY: 70.49, width: 448.35, height: 136.76 },
  "Equatorial_Guinea": { centerX: 236.18, centerY: 144.99, width: 472.3, height: 284.34 },
  "Eritrea": { centerX: 277.22, centerY: 131.57, width: 556.04, height: 259.27 },
  "Estonia": { centerX: 275.9, centerY: 65.74, width: 465.07, height: 128.88 },
  "Eswatini": { centerX: 270.24, centerY: 180.03, width: 514.43, height: 358.03 },
  "Ethiopia": { centerX: 264.42, centerY: 134.94, width: 536.6, height: 268.92 },
  "Faeroe_Islands": { centerX: 431.4, centerY: 117.13, width: 0, height: 0 },
  "Falkland_Islands": { centerX: 149.69, centerY: 219.83, width: 299.49, height: 432.76 },
  "Fiji": { centerX: 446.3, centerY: 169.92, width: 892.59, height: 337.66 },
  "Finland": { centerX: 251.86, centerY: 60.93, width: 536.28, height: 121.85 },
  "France": { centerX: 234.64, centerY: 90.65, width: 439.19, height: 125.7 },
  "French_Guiana": { centerX: 312.07, centerY: 287.2, width: 0, height: 0 },
  "French_Southern_and_Antarctic_Lands": { centerX: 621.99, centerY: 427.45, width: 0, height: 0 },
  "Gabon": { centerX: 235.17, centerY: 143.92, width: 491.73, height: 287.39 },
  "Gambia": { centerX: 203.08, centerY: 131.45, width: 406.38, height: 257.7 },
  "Georgia": { centerX: 547.45, centerY: 177.76, width: 0, height: 0 },
  "Germany": { centerX: 231.95, centerY: 81.08, width: 500.77, height: 159.88 },
  "Ghana": { centerX: 235.29, centerY: 134.02, width: 424.51, height: 262.31 },
  "Greece": { centerX: 249.95, centerY: 92.68, width: 500.33, height: 185.36 },
  "Greenland": { centerX: 128.77, centerY: 54.93, width: 522.48, height: 109.85 },
  "Grenada": { centerX: 294.66, centerY: 262.46, width: 0, height: 0 },
  "Guadeloupe": { centerX: 147.85, centerY: 126.52, width: 295.67, height: 253.03 },
  "Guatemala": { centerX: 112.09, centerY: 128.99, width: 227.04, height: 255.78 },
  "Guinea": { centerX: 414.86, centerY: 270.44, width: 0, height: 0 },
  "Guinea_Bissau": { centerX: 204.14, centerY: 130.65, width: 419.32, height: 261.3 },
  "Guyana": { centerX: 307.42, centerY: 288.16, width: 0, height: 0 },
  "Haiti": { centerX: 132.18, centerY: 123.06, width: 274.49, height: 240.52 },
  "Honduras": { centerX: 112.74, centerY: 129.16, width: 225.75, height: 255.44 },
  "Hong_Kong": { centerX: 365.11, centerY: 118.84, width: 733.46, height: 237.68 },
  "Hungary": { centerX: 504.87, centerY: 163.64, width: 0, height: 0 },
  "Iceland": { centerX: 198.78, centerY: 54.61, width: 425.89, height: 85.47 },
  "India": { centerX: 320.74, centerY: 101.06, width: 641.58, height: 199.52 },
  "Indonesia": { centerX: 332.98, centerY: 141.32, width: 815.66, height: 282.63 },
  "Iran": { centerX: 279.11, centerY: 94.46, width: 560.63, height: 188.88 },
  "Iraq": { centerX: 278.45, centerY: 98.61, width: 561.77, height: 195.04 },
  "Ireland": { centerX: 211.96, centerY: 73.1, width: 435.95, height: 133.91 },
  "Israel": { centerX: 533.17, centerY: 212.75, width: 0, height: 0 },
  "Italy": { centerX: 232.18, centerY: 85.73, width: 466.5, height: 168.51 },
  "Jamaica": { centerX: 258.2, centerY: 247.7, width: 0, height: 0 },
  "Japan": { centerX: 358.13, centerY: 107.95, width: 825.49, height: 206.38 },
  "Jordan": { centerX: 267.52, centerY: 105.15, width: 537.84, height: 208.74 },
  "Kazakhstan": { centerX: 308.23, centerY: 80.14, width: 714, height: 159.73 },
  "Kenya": { centerX: 265.58, centerY: 141.98, width: 533.85, height: 281.05 },
  "Kosovo": { centerX: 497.88, centerY: 180.3, width: 0, height: 0 },
  "Kuwait": { centerX: 284.11, centerY: 108.76, width: 566.3, height: 214.66 },
  "Kyrgyzstan": { centerX: 313.28, centerY: 93.94, width: 668.48, height: 174.86 },
  "Laos": { centerX: 702.03, centerY: 236.34, width: 0, height: 0 },
  "Latvia": { centerX: 257.99, centerY: 66.31, width: 516.02, height: 130.18 },
  "Lebanon": { centerX: 535.3, centerY: 207.57, width: 0, height: 0 },
  "Lesotho": { centerX: 520.06, centerY: 366.95, width: 0, height: 0 },
  "Liberia": { centerX: 419.4, centerY: 275.75, width: 0, height: 0 },
  "Libya": { centerX: 237.06, centerY: 104.16, width: 479.04, height: 206.31 },
  "Liechtenstein": { centerX: 235.42, centerY: 83.44, width: 473, height: 166.88 },
  "Lithuania": { centerX: 250.09, centerY: 69.68, width: 528.06, height: 136.61 },
  "Luxembourg": { centerX: 463.17, centerY: 156.65, width: 0, height: 0 },
  "Madagascar": { centerX: 278.41, centerY: 172.2, width: 559.32, height: 344.4 },
  "Malawi": { centerX: 267.3, centerY: 163.93, width: 534.78, height: 325.78 },
  "Malaysia": { centerX: 350.71, centerY: 143, width: 780.21, height: 279.27 },
  "Mali": { centerX: 208.69, centerY: 128.8, width: 417.48, height: 254.34 },
  "Malta": { centerX: 241.66, centerY: 101.04, width: 486.52, height: 202.07 },
  "Manitoba_CA": { centerX: 101.17, centerY: 80.99, width: 209.99, height: 159.88 },
  "Martinique": { centerX: 296.65, centerY: 256.75, width: 0, height: 0 },
  "Mauritania": { centerX: 203.61, centerY: 112.2, width: 445.49, height: 222.4 },
  "Mauritius": { centerX: 591.75, centerY: 343.99, width: 0, height: 0 },
  "Mexico": { centerX: 85.96, centerY: 114.01, width: 240.63, height: 225.84 },
  "Moldova": { centerX: 514.18, centerY: 162.64, width: 0, height: 0 },
  "Monaco": { centerX: 231.99, centerY: 89.12, width: 467.18, height: 178.23 },
  "Mongolia": { centerX: 368.62, centerY: 79.32, width: 739.31, height: 156.61 },
  "Montenegro": { centerX: 493.97, centerY: 180.69, width: 0, height: 0 },
  "Morocco": { centerX: 216.93, centerY: 100.34, width: 435.19, height: 198.55 },
  "Mozambique": { centerX: 263.81, centerY: 181.91, width: 528.11, height: 358.97 },
  "Myanmar": { centerX: 338.65, centerY: 118.72, width: 679.29, height: 237.44 },
  "Namibia": { centerX: 244.24, centerY: 183.96, width: 489.48, height: 364.19 },
  "Nepal": { centerX: 667.2, centerY: 221.86, width: 0, height: 0 },
  "Netherlands": { centerX: 228.14, centerY: 134.34, width: 475.44, height: 256.17 },
  "New_Brunswick_CA": { centerX: 140.4, centerY: 87.03, width: 281.42, height: 171.86 },
  "New_Caledonia": { centerX: 432.88, centerY: 177.41, width: 863.77, height: 345.38 },
  "New_Zealand": { centerX: 429.37, centerY: 218.63, width: 863.9, height: 426.26 },
  "Newfoundland_and_Labrador_CA": { centerX: 143.18, centerY: 61.39, width: 289.12, height: 120.78 },
  "Nicaragua": { centerX: 234.72, centerY: 265.3, width: 0, height: 0 },
  "Niger": { centerX: 225.7, centerY: 132.42, width: 462.41, height: 262.69 },
  "Nigeria": { centerX: 228.43, centerY: 132.45, width: 456.94, height: 262.63 },
  "North_Korea": { centerX: 383.61, centerY: 97.51, width: 767.44, height: 188.73 },
  "North_Macedonia": { centerX: 499.13, centerY: 182.31, width: 0, height: 0 },
  "Northern_Ireland": { centerX: 429.93, centerY: 140.05, width: 0, height: 0 },
  "Northwest_Territories_CA": { centerX: 64.87, centerY: 43.82, width: 163.86, height: 86.74 },
  "Norway": { centerX: 225.9, centerY: 49.22, width: 546.72, height: 98.04 },
  "Nova_Scotia_CA": { centerX: 144, centerY: 85.32, width: 290, height: 170.24 },
  "Nunavut_CA": { centerX: 90.59, centerY: 61.4, width: 292.83, height: 122.8 },
  "Oman": { centerX: 292.99, centerY: 115.75, width: 589.87, height: 225.73 },
  "Ontario_CA": { centerX: 101.94, centerY: 82.29, width: 246.73, height: 163.67 },
  "Pakistan": { centerX: 307.79, centerY: 101.46, width: 663.75, height: 200.91 },
  "Palestinian_Territories": { centerX: 533.74, centerY: 211.73, width: 0, height: 0 },
  "Panama": { centerX: 123.03, centerY: 135.75, width: 238.95, height: 266.7 },
  "Papua_New_Guinea": { centerX: 401.4, centerY: 150.5, width: 809.99, height: 301 },
  "Paraguay": { centerX: 145.65, centerY: 175.65, width: 292.86, height: 347.15 },
  "Peru": { centerX: 136.65, centerY: 169.05, width: 276.7, height: 335.89 },
  "Philippines": { centerX: 369.19, centerY: 140.35, width: 758.95, height: 277.53 },
  "Poland": { centerX: 255.95, centerY: 83.08, width: 477.75, height: 151.1 },
  "Portugal": { centerX: 203.09, centerY: 91.01, width: 446.18, height: 182.02 },
  "Prince_Edward_Island_CA": { centerX: 146.82, centerY: 84.99, width: 294.44, height: 167.91 },
  "Puerto_Rico": { centerX: 139.13, centerY: 123.72, width: 280.01, height: 247.44 },
  "Qatar": { centerX: 574.36, centerY: 230.16, width: 0, height: 0 },
  "Quebec_CA": { centerX: 132.82, centerY: 83.63, width: 287.6, height: 165.49 },
  "Romania": { centerX: 252.4, centerY: 82.43, width: 504.94, height: 162.42 },
  "Russia": { centerX: -44.47, centerY: 87.95, width: 1442.34, height: 175.9 },
  "Rwanda": { centerX: 520.15, centerY: 299.77, width: 0, height: 0 },
  "Réunion": { centerX: 586.76, centerY: 346.28, width: 0, height: 0 },
  "Saint_Lucia": { centerX: 296.46, centerY: 257.91, width: 0, height: 0 },
  "Saint_Vincent_and_the_Grenadines": { centerX: 295.76, centerY: 260.1, width: 0, height: 0 },
  "Samoa": { centerX: 19.5, centerY: 327.02, width: 0, height: 0 },
  "Saskatchewan_CA": { centerX: 94.93, centerY: 86, width: 188.35, height: 149.87 },
  "Saudi_Arabia": { centerX: 276.46, centerY: 115.08, width: 595.8, height: 230.16 },
  "Scotland": { centerX: 221.8, centerY: 59.71, width: 447.95, height: 119.01 },
  "Senegal": { centerX: 208.7, centerY: 129.03, width: 417.46, height: 253.88 },
  "Serbia": { centerX: 498.32, centerY: 169.42, width: 0, height: 0 },
  "Sierra_Leone": { centerX: 208.43, centerY: 137.07, width: 427.86, height: 269.53 },
  "Singapore": { centerX: 352.04, centerY: 145.69, width: 708.4, height: 291.38 },
  "Slovakia": { centerX: 504.03, centerY: 160.04, width: 0, height: 0 },
  "Slovenia": { centerX: 481.76, centerY: 171.34, width: 0, height: 0 },
  "Solomon_Islands": { centerX: 422.95, centerY: 161.17, width: 848.7, height: 322.33 },
  "Somalia": { centerX: 285.24, centerY: 131.64, width: 578.21, height: 262.77 },
  "South_Africa": { centerX: 251.16, centerY: 178.6, width: 493.04, height: 354.49 },
  "South_Georgia_and_the_South_Sandwich_Islands": { centerX: 380.15, centerY: 461.6, width: 0, height: 0 },
  "South_Korea": { centerX: 381.23, centerY: 95.94, width: 772.2, height: 191.87 },
  "South_Sudan": { centerX: 268.12, centerY: 140.78, width: 538.43, height: 281.44 },
  "Spain": { centerX: 197.26, centerY: 100.64, width: 474.81, height: 198.36 },
  "Sri_Lanka": { centerX: 325.52, centerY: 137.66, width: 652.33, height: 275.32 },
  "Sudan": { centerX: 251.83, centerY: 133.36, width: 506.01, height: 264.72 },
  "Suriname": { centerX: 313.17, centerY: 279.67, width: 0, height: 0 },
  "Sweden": { centerX: 245.28, centerY: 43.54, width: 507.96, height: 85.04 },
  "Switzerland": { centerX: 473.96, centerY: 167.05, width: 0, height: 0 },
  "Syria": { centerX: 267.17, centerY: 104.77, width: 539.49, height: 207.5 },
  "São_Tomé_and_Principe": { centerX: 464.58, centerY: 291.98, width: 0, height: 0 },
  "Taiwan": { centerX: 375.21, centerY: 116.02, width: 752.12, height: 227.2 },
  "Tajikistan": { centerX: 311.2, centerY: 92.95, width: 624.67, height: 183.81 },
  "Tanzania": { centerX: 264.87, centerY: 159.91, width: 530, height: 313.13 },
  "Thailand": { centerX: 346.89, centerY: 135.76, width: 714.26, height: 256.23 },
  "Timor_Leste": { centerX: 757.6, centerY: 315.9, width: 0, height: 0 },
  "Togo": { centerX: 224.82, centerY: 133.2, width: 445.44, height: 263.94 },
  "Trinidad_and_Tobago": { centerX: 296.18, centerY: 266.27, width: 0, height: 0 },
  "Tunisia": { centerX: 476.58, centerY: 207.31, width: 0, height: 0 },
  "Turkmenistan": { centerX: 300.18, centerY: 100.75, width: 600.44, height: 199.45 },
  "Türkiye": { centerX: 275.6, centerY: 95.46, width: 560.9, height: 178.28 },
  "USA_Alabama": { centerX: 115.34, centerY: 108.67, width: 231.19, height: 214.02 },
  "USA_Alaska": { centerX: 422.1, centerY: 75.96, width: 848.81, height: 151.59 },
  "USA_Arizona": { centerX: 83.92, centerY: 99.26, width: 160.83, height: 196.19 },
  "USA_Arkansas": { centerX: 115.97, centerY: 102.35, width: 215.51, height: 201.45 },
  "USA_California": { centerX: 69.38, centerY: 91.81, width: 139.15, height: 181.62 },
  "USA_Colorado": { centerX: 88.43, centerY: 97.2, width: 176.79, height: 176.92 },
  "USA_Connecticut": { centerX: 133.81, centerY: 93.1, width: 272.17, height: 183.26 },
  "USA_Delaware": { centerX: 130.98, centerY: 97.08, width: 261.75, height: 192.15 },
  "USA_Florida": { centerX: 122.76, centerY: 108.15, width: 245.97, height: 213.79 },
  "USA_Georgia": { centerX: 247.4, centerY: 211.47, width: 0, height: 0 },
  "USA_Hawaii": { centerX: 62.36, centerY: 244.59, width: 0, height: 0 },
  "USA_Idaho": { centerX: 96.97, centerY: 80.96, width: 119.74, height: 159.92 },
  "USA_Illinois": { centerX: 113.12, centerY: 99.29, width: 227.08, height: 196.27 },
  "USA_Indiana": { centerX: 118.7, centerY: 92.39, width: 237.54, height: 182.38 },
  "USA_Iowa": { centerX: 208.26, centerY: 181.11, width: 0, height: 0 },
  "USA_Kansas": { centerX: 194.35, centerY: 197.36, width: 0, height: 0 },
  "USA_Kentucky": { centerX: 112.94, centerY: 99.93, width: 225.96, height: 197.74 },
  "USA_Louisiana": { centerX: 225.66, centerY: 216.45, width: 0, height: 0 },
  "USA_Maine": { centerX: 137.93, centerY: 83.85, width: 277.48, height: 165.3 },
  "USA_Maryland": { centerX: 256.27, centerY: 191.72, width: 11.01, height: 4.56 },
  "USA_Massachusetts": { centerX: 134.75, centerY: 92.87, width: 273.5, height: 181.72 },
  "USA_Michigan": { centerX: 118.84, centerY: 85, width: 238.53, height: 167.99 },
  "USA_Minnesota": { centerX: 104.94, centerY: 80.35, width: 212.78, height: 158.7 },
  "USA_Mississippi": { centerX: 113.71, centerY: 112.18, width: 229.42, height: 207.44 },
  "USA_Missouri": { centerX: 105.21, centerY: 94.89, width: 211.93, height: 187.46 },
  "USA_Montana": { centerX: 79.15, centerY: 80.5, width: 160.3, height: 160.84 },
  "USA_Nebraska": { centerX: 116.72, centerY: 93.34, width: 145.2, height: 184.64 },
  "USA_Nevada": { centerX: 164.33, centerY: 182.67, width: 0, height: 0 },
  "USA_New_Hampshire": { centerX: 142.83, centerY: 89.41, width: 255.04, height: 168.11 },
  "USA_New_Jersey": { centerX: 132.01, centerY: 93.34, width: 265.45, height: 184.68 },
  "USA_New_Mexico": { centerX: 88.42, centerY: 112.54, width: 176.96, height: 199.83 },
  "USA_New_York": { centerX: 130.86, centerY: 87.3, width: 263.73, height: 172.47 },
  "USA_North_Carolina": { centerX: 129.42, centerY: 99.33, width: 260, height: 198.65 },
  "USA_North_Dakota": { centerX: 94.83, centerY: 81.01, width: 189.01, height: 159.82 },
  "USA_Ohio": { centerX: 123.5, centerY: 91.88, width: 249.39, height: 181.66 },
  "USA_Oklahoma": { centerX: 95.92, centerY: 100.99, width: 192.07, height: 195.62 },
  "USA_Oregon": { centerX: 70.58, centerY: 85.53, width: 141.77, height: 168.66 },
  "USA_Pennsylvania": { centerX: 125.04, centerY: 91.33, width: 250.12, height: 180.66 },
  "USA_Rhode_Island": { centerX: 135.53, centerY: 92.34, width: 271.76, height: 182.4 },
  "USA_South_Carolina": { centerX: 126.28, centerY: 103.81, width: 253.56, height: 204.82 },
  "USA_South_Dakota": { centerX: 189.3, centerY: 173.53, width: 0, height: 0 },
  "USA_Tennessee": { centerX: 111.84, centerY: 102.95, width: 223.76, height: 200.25 },
  "USA_Texas": { centerX: 95.23, centerY: 109.39, width: 191.35, height: 218.71 },
  "USA_Utah": { centerX: 171.81, centerY: 182.67, width: 0, height: 0 },
  "USA_Vermont": { centerX: 132.86, centerY: 87.31, width: 266.52, height: 172.42 },
  "USA_Virginia": { centerX: 194.46, centerY: 251.41, width: 8.44, height: 19.28 },
  "USA_Washington": { centerX: 71.79, centerY: 80.96, width: 170.1, height: 159.92 },
  "USA_Washington_DC": { centerX: 256.94, centerY: 192.14, width: 0, height: 0 },
  "USA_West_Virginia": { centerX: 121.12, centerY: 97.24, width: 243.81, height: 192.03 },
  "USA_Wisconsin": { centerX: 111.43, centerY: 84.8, width: 224.05, height: 167.55 },
  "USA_Wyoming": { centerX: 176.82, centerY: 185.66, width: 0, height: 0 },
  "Uganda": { centerX: 260.83, centerY: 148.38, width: 525.88, height: 294.55 },
  "Ukraine": { centerX: 261.58, centerY: 75.19, width: 537.93, height: 148.11 },
  "United_Arab_Emirates": { centerX: 290.76, centerY: 115.47, width: 594.45, height: 224.73 },
  "United_Kingdom": { centerX: 213.54, centerY: 70.58, width: 432.78, height: 138.95 },
  "United_States": { centerX: 124.27, centerY: 82.14, width: 253.14, height: 163.97 },
  "Uruguay": { centerX: 315.15, centerY: 380.23, width: 0, height: 0 },
  "Uzbekistan": { centerX: 312.76, centerY: 94.51, width: 627.62, height: 186.78 },
  "Vanuatu": { centerX: 434.08, centerY: 172.6, width: 872.91, height: 342.36 },
  "Venezuela": { centerX: 149.26, centerY: 136.48, width: 298.71, height: 270.35 },
  "Vietnam": { centerX: 354.43, centerY: 132.45, width: 722.11, height: 247.39 },
  "Wales": { centerX: 440.8, centerY: 151.97, width: 0, height: 0 },
  "Western_Sahara": { centerX: 207.53, centerY: 111.67, width: 415.34, height: 221.31 },
  "Yemen": { centerX: 288.6, centerY: 123.3, width: 577.36, height: 243.74 },
  "Yukon_CA": { centerX: 50.74, centerY: 61.98, width: 102.22, height: 121.89 },
  "Zambia": { centerX: 264.9, centerY: 160.3, width: 529.94, height: 312.35 },
  "Zimbabwe": { centerX: 254.2, centerY: 169.44, width: 513.23, height: 336.61 }
};

// Helper function to get country center for directional calculations
export function getCountryCenter(countryId: string): { x: number, y: number } | null {
  const coords = countryCoordinates[countryId];
  return coords ? { x: coords.centerX, y: coords.centerY } : null;
}
