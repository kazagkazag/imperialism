// Script to parse SVG map and extract country center coordinates
const fs = require('fs');
const path = require('path');

// Function to parse SVG path data and calculate bounding box
function parseSVGPath(pathData) {
  if (!pathData) return null;
  
  const commands = pathData.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g);
  if (!commands) return null;
  
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let currentX = 0, currentY = 0;
  
  commands.forEach(command => {
    const type = command[0];
    const coords = command.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    
    switch (type.toLowerCase()) {
      case 'm': // moveTo
      case 'l': // lineTo
        for (let i = 0; i < coords.length; i += 2) {
          if (i + 1 >= coords.length) break; // Safety check
          if (type === type.toUpperCase()) {
            // Absolute coordinates
            currentX = coords[i];
            currentY = coords[i + 1];
          } else {
            // Relative coordinates
            currentX += coords[i];
            currentY += coords[i + 1];
          }
          if (!isNaN(currentX) && !isNaN(currentY)) {
            minX = Math.min(minX, currentX);
            minY = Math.min(minY, currentY);
            maxX = Math.max(maxX, currentX);
            maxY = Math.max(maxY, currentY);
          }
        }
        break;
        
      case 'h': // horizontal line
        for (let i = 0; i < coords.length; i++) {
          if (type === type.toUpperCase()) {
            currentX = coords[i];
          } else {
            currentX += coords[i];
          }
          minX = Math.min(minX, currentX);
          maxX = Math.max(maxX, currentX);
        }
        break;
        
      case 'v': // vertical line
        for (let i = 0; i < coords.length; i++) {
          if (type === type.toUpperCase()) {
            currentY = coords[i];
          } else {
            currentY += coords[i];
          }
          minY = Math.min(minY, currentY);
          maxY = Math.max(maxY, currentY);
        }
        break;
        
      case 'c': // cubic bezier
        for (let i = 0; i < coords.length; i += 6) {
          let x1, y1, x2, y2, x, y;
          if (type === type.toUpperCase()) {
            x1 = coords[i];
            y1 = coords[i + 1];
            x2 = coords[i + 2];
            y2 = coords[i + 3];
            x = coords[i + 4];
            y = coords[i + 5];
            currentX = x;
            currentY = y;
          } else {
            x1 = currentX + coords[i];
            y1 = currentY + coords[i + 1];
            x2 = currentX + coords[i + 2];
            y2 = currentY + coords[i + 3];
            x = currentX + coords[i + 4];
            y = currentY + coords[i + 5];
            currentX = x;
            currentY = y;
          }
          minX = Math.min(minX, x1, x2, x);
          minY = Math.min(minY, y1, y2, y);
          maxX = Math.max(maxX, x1, x2, x);
          maxY = Math.max(maxY, y1, y2, y);
        }
        break;
        
      case 's': // smooth cubic bezier
        for (let i = 0; i < coords.length; i += 4) {
          let x2, y2, x, y;
          if (type === type.toUpperCase()) {
            x2 = coords[i];
            y2 = coords[i + 1];
            x = coords[i + 2];
            y = coords[i + 3];
            currentX = x;
            currentY = y;
          } else {
            x2 = currentX + coords[i];
            y2 = currentY + coords[i + 1];
            x = currentX + coords[i + 2];
            y = currentY + coords[i + 3];
            currentX = x;
            currentY = y;
          }
          minX = Math.min(minX, x2, x);
          minY = Math.min(minY, y2, y);
          maxX = Math.max(maxX, x2, x);
          maxY = Math.max(maxY, y2, y);
        }
        break;
        
      case 'q': // quadratic bezier
        for (let i = 0; i < coords.length; i += 4) {
          let x1, y1, x, y;
          if (type === type.toUpperCase()) {
            x1 = coords[i];
            y1 = coords[i + 1];
            x = coords[i + 2];
            y = coords[i + 3];
            currentX = x;
            currentY = y;
          } else {
            x1 = currentX + coords[i];
            y1 = currentY + coords[i + 1];
            x = currentX + coords[i + 2];
            y = currentY + coords[i + 3];
            currentX = x;
            currentY = y;
          }
          minX = Math.min(minX, x1, x);
          minY = Math.min(minY, y1, y);
          maxX = Math.max(maxX, x1, x);
          maxY = Math.max(maxY, y1, y);
        }
        break;
        
      case 't': // smooth quadratic bezier
        for (let i = 0; i < coords.length; i += 2) {
          let x, y;
          if (type === type.toUpperCase()) {
            x = coords[i];
            y = coords[i + 1];
            currentX = x;
            currentY = y;
          } else {
            x = currentX + coords[i];
            y = currentY + coords[i + 1];
            currentX = x;
            currentY = y;
          }
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
        break;
        
      case 'a': // arc
        for (let i = 0; i < coords.length; i += 7) {
          let x, y;
          if (type === type.toUpperCase()) {
            x = coords[i + 5];
            y = coords[i + 6];
            currentX = x;
            currentY = y;
          } else {
            x = currentX + coords[i + 5];
            y = currentY + coords[i + 6];
            currentX = x;
            currentY = y;
          }
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
        break;
      default:
        // Handle other path commands that we don't need for bounding box calculation
        break;
    }
  });
  
  if (minX === Infinity) return null;
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    width: maxX - minX,
    height: maxY - minY
  };
}

// Main function to parse the SVG file
function parseCountryCoordinates() {
  try {
    const svgPath = path.join(__dirname, '../../public/map.svg');
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Extract all path elements with country IDs
    const pathRegex = /<path[^>]*id="([^"]+)"[^>]*d="([^"]+)"[^>]*>/g;
    const countries = {};
    let match;
    
    while ((match = pathRegex.exec(svgContent)) !== null) {
      const [, id, pathData] = match;
      
      // Skip pattern and non-country paths
      if (id.includes('pattern') || id.includes('label') || id.includes('tspan')) {
        continue;
      }
      
      const bbox = parseSVGPath(pathData);
      if (bbox) {
        countries[id] = {
          centerX: Math.round(bbox.centerX * 100) / 100,
          centerY: Math.round(bbox.centerY * 100) / 100,
          width: Math.round(bbox.width * 100) / 100,
          height: Math.round(bbox.height * 100) / 100,
          bounds: {
            minX: Math.round(bbox.minX * 100) / 100,
            minY: Math.round(bbox.minY * 100) / 100,
            maxX: Math.round(bbox.maxX * 100) / 100,
            maxY: Math.round(bbox.maxY * 100) / 100
          }
        };
      }
    }
    
    // Sort countries alphabetically for easier reading
    const sortedCountries = Object.keys(countries)
      .sort()
      .reduce((acc, key) => {
        acc[key] = countries[key];
        return acc;
      }, {});
    
    console.log('Country Coordinates (center points):');
    console.log('=====================================');
    
    Object.entries(sortedCountries).forEach(([countryId, coords]) => {
      console.log(`${countryId}: center(${coords.centerX}, ${coords.centerY}) size(${coords.width}×${coords.height})`);
    });
    
    console.log(`\nTotal countries found: ${Object.keys(sortedCountries).length}`);
    
    // Also create a TypeScript file with the coordinates
    const tsContent = `// Auto-generated country coordinates from SVG map
export interface CountryCoordinates {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export const countryCoordinates: Record<string, CountryCoordinates> = ${JSON.stringify(sortedCountries, null, 2)};
`;
    
    const outputPath = path.join(__dirname, '../countryCoordinates.ts');
    fs.writeFileSync(outputPath, tsContent);
    console.log(`\nCoordinates saved to: ${outputPath}`);
    
    return sortedCountries;
    
  } catch (error) {
    console.error('Error parsing SVG:', error);
    return null;
  }
}

// Run the parser
if (require.main === module) {
  parseCountryCoordinates();
}

module.exports = { parseCountryCoordinates, parseSVGPath };