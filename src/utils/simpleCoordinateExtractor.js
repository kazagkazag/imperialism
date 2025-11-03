// Simple script to extract country center coordinates from SVG
const fs = require('fs');
const path = require('path');

function extractCountryCoordinates() {
  try {
    const svgPath = path.join(__dirname, '../../public/map.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Extract path elements with country IDs
    const pathRegex = /<path[^>]*id="([^"]+)"[^>]*d="([^"]+)"[^>]*>/g;
    const countries = {};
    let match;
    
    while ((match = pathRegex.exec(svgContent)) !== null) {
      const [, id, pathData] = match;
      
      // Skip pattern, label and certain system paths
      if (id.includes('pattern') || id.includes('label') || id.includes('tspan') || 
          id.startsWith('g') || id.startsWith('defs') || id.startsWith('namedview')) {
        continue;
      }
      
      const coordinates = extractCoordinatesFromPath(pathData);
      if (coordinates.length > 0) {
        const bounds = calculateBounds(coordinates);
        if (bounds) {
          countries[id] = {
            centerX: Math.round(bounds.centerX * 100) / 100,
            centerY: Math.round(bounds.centerY * 100) / 100,
            width: Math.round(bounds.width * 100) / 100,
            height: Math.round(bounds.height * 100) / 100
          };
        }
      }
    }
    
    console.log('Country Center Coordinates:');
    console.log('===========================');
    
    // Sort and display
    const sortedCountries = Object.keys(countries).sort();
    sortedCountries.forEach(countryId => {
      const coords = countries[countryId]; 
      console.log(`${countryId}: (${coords.centerX}, ${coords.centerY}) - ${coords.width}×${coords.height}`);
    });
    
    console.log(`\nTotal countries: ${sortedCountries.length}`);
    
    // Generate TypeScript file
    const tsContent = `// Auto-generated country coordinates from SVG map
export interface CountryCoordinates {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export const countryCoordinates: Record<string, CountryCoordinates> = {
${sortedCountries.map(id => {
  const c = countries[id];
  return `  "${id}": { centerX: ${c.centerX}, centerY: ${c.centerY}, width: ${c.width}, height: ${c.height} }`;
}).join(',\n')}
};

// Helper function to get country center for directional calculations
export function getCountryCenter(countryId: string): { x: number, y: number } | null {
  const coords = countryCoordinates[countryId];
  return coords ? { x: coords.centerX, y: coords.centerY } : null;
}
`;
    
    const outputPath = path.join(__dirname, '../countryCoordinates.ts');
    fs.writeFileSync(outputPath, tsContent);
    console.log(`\nCoordinates saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function extractCoordinatesFromPath(pathData) {
  const coordinates = [];
  // Simple regex to extract number pairs (more robust than parsing commands)
  const numberPairs = pathData.match(/[-+]?[0-9]*\.?[0-9]+\s+[-+]?[0-9]*\.?[0-9]+/g);
  
  if (numberPairs) {
    numberPairs.forEach(pair => {
      const [x, y] = pair.trim().split(/\s+/).map(Number);
      if (!isNaN(x) && !isNaN(y)) {
        coordinates.push({ x, y });
      }
    });
  }
  
  return coordinates;
}

function calculateBounds(coordinates) {
  if (coordinates.length === 0) return null;
  
  const xs = coordinates.map(c => c.x);
  const ys = coordinates.map(c => c.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    width: maxX - minX,
    height: maxY - minY
  };
}

if (require.main === module) {
  extractCountryCoordinates();
}