import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';

// URL for world map data
const geoUrl =
  'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';

interface CountryClickInfo {
  name: string;
  id: string;
  properties: any;
}

interface WorldMapProps {
  onCountryClick?: (country: CountryClickInfo) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ onCountryClick }) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryClickInfo | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const handleCountryClick = (geo: any) => {
    const countryInfo: CountryClickInfo = {
      name: geo.properties.NAME || geo.properties.name || 'Unknown',
      id: geo.id,
      properties: geo.properties,
    };
    setSelectedCountry(countryInfo);
    onCountryClick?.(countryInfo);
    console.log('Clicked country:', countryInfo);
  };

  const handleCountryMouseEnter = (geo: any) => {
    setHoveredCountry(geo.properties.NAME || geo.properties.name || 'Unknown');
  };

  const handleCountryMouseLeave = () => {
    setHoveredCountry(null);
  };

  const getCountryFill = (geo: any) => {
    const countryName = geo.properties.NAME || geo.properties.name;
    
    if (selectedCountry && countryName === selectedCountry.name) {
      return '#FF6B6B'; // Red for selected country
    }
    if (hoveredCountry && countryName === hoveredCountry) {
      return '#4ECDC4'; // Teal for hovered country
    }
    return '#D6D6DA'; // Default gray
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#f8f9fa', position: 'relative' }}>
      {/* Fixed position info panel in top-right corner of map area */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        zIndex: 1000,
        minWidth: '200px',
        textAlign: 'left'
      }}>
        {hoveredCountry && (
          <div style={{ 
            margin: '0 0 10px 0', 
            padding: '8px 12px', 
            backgroundColor: 'rgba(78, 205, 196, 0.9)', 
            color: 'white',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            Hovering: {hoveredCountry}
          </div>
        )}
        {selectedCountry && (
          <div style={{ 
            margin: '0', 
            padding: '12px', 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '2px solid #FF6B6B'
          }}>
            <h3 style={{ color: '#FF6B6B', margin: '0 0 8px 0', fontSize: '16px' }}>
              Selected: {selectedCountry.name}
            </h3>
            <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
              Country ID: {selectedCountry.id}
            </p>
          </div>
        )}
      </div>
      
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 150,
        }}
        style={{ width: '100%', height: '100vh' }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleCountryClick(geo)}
                  onMouseEnter={() => handleCountryMouseEnter(geo)}
                  onMouseLeave={handleCountryMouseLeave}
                  style={{
                    default: {
                      fill: getCountryFill(geo),
                      stroke: '#FFFFFF',
                      strokeWidth: 0.5,
                      outline: 'none',
                    },
                    hover: {
                      fill: '#4ECDC4',
                      stroke: '#FFFFFF',
                      strokeWidth: 1,
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    pressed: {
                      fill: '#FF6B6B',
                      stroke: '#FFFFFF',
                      strokeWidth: 1,
                      outline: 'none',
                    },
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
        </ComposableMap>
    </div>
  );
};

export default WorldMap;