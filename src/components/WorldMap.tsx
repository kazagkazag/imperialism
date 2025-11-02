import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from 'react-simple-maps';

// URL for world map data
const geoUrl =
  'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';

interface CountryClickInfo {
  name: string;
  id: string;
  properties: any;
}

interface Club {
  id: string;
  name: string;
  country: string;
  points: number;
}

interface WorldMapProps {
  onCountryClick?: (country: CountryClickInfo) => void;
  clubs: Club[];
}

const WorldMap: React.FC<WorldMapProps> = ({ onCountryClick, clubs }) => {
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

  // Get countries that have clubs
  const countriesWithClubs = clubs.reduce((acc, club) => {
    const country = club.country;
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(club);
    return acc;
  }, {} as Record<string, Club[]>);

  // Simple coordinate mapping for major countries (you can expand this)
  const countryCoordinates: Record<string, [number, number]> = {
    'United States of America': [-95, 40],
    'United States': [-95, 40],
    'USA': [-95, 40],
    'Canada': [-106, 56],
    'Brazil': [-55, -10],
    'Argentina': [-64, -34],
    'United Kingdom': [-3, 55],
    'France': [2, 46],
    'Germany': [10, 51],
    'Italy': [12, 42],
    'Spain': [-4, 40],
    'Poland': [20, 52],
    'Russia': [105, 61],
    'China': [104, 35],
    'Japan': [138, 36],
    'India': [77, 20],
    'Australia': [133, -27],
    'South Africa': [22, -31],
    'Egypt': [30, 26],
    'Nigeria': [8, 10],
    'Mexico': [-102, 23],
    'Chile': [-71, -30],
    'Peru': [-76, -10],
    'Colombia': [-74, 4],
    'Venezuela': [-67, 7],
    'Turkey': [35, 39],
    'Iran': [53, 32],
    'Saudi Arabia': [45, 24],
    'Thailand': [100, 15],
    'Vietnam': [108, 14],
    'South Korea': [128, 36],
    'Malaysia': [101, 4],
    'Indonesia': [113, -0.8],
    'Philippines': [121, 13],
    'Ukraine': [32, 49],
    'Sweden': [18, 60],
    'Norway': [10, 62],
    'Finland': [26, 61],
    'Denmark': [9, 56],
    'Netherlands': [5, 52],
    'Belgium': [4, 51],
    'Switzerland': [8, 47],
    'Austria': [14, 47],
    'Czech Republic': [15, 50],
    'Hungary': [19, 47],
    'Romania': [25, 46],
    'Bulgaria': [25, 43],
    'Greece': [22, 39],
    'Portugal': [-8, 40],
    'Ireland': [-8, 53],
    'Iceland': [-19, 65],
    'Morocco': [-7, 32],
    'Algeria': [1, 28],
    'Libya': [17, 25],
    'Tunisia': [9, 34],
    'Kenya': [37, -0.02],
    'Ethiopia': [40, 9],
    'Ghana': [-2, 8],
    'Cameroon': [12, 7],
    'Democratic Republic of the Congo': [21, -4],
    'Angola': [18, -11],
    'Zambia': [27, -13],
    'Zimbabwe': [29, -19],
    'Botswana': [24, -22],
    'Namibia': [18, -22],
    'Madagascar': [47, -18],
    'Israel': [35, 31],
    'Lebanon': [36, 34],
    'Jordan': [36, 31],
    'Iraq': [43, 33],
    'Syria': [38, 35],
    'Afghanistan': [67, 33],
    'Pakistan': [69, 30],
    'Bangladesh': [90, 24],
    'Sri Lanka': [81, 7],
    'Myanmar': [95, 22],
    'Cambodia': [105, 13],
    'Laos': [102, 18],
    'Mongolia': [103, 46],
    'Kazakhstan': [68, 48],
    'Uzbekistan': [64, 41],
    'Turkmenistan': [60, 40],
    'Kyrgyzstan': [75, 41],
    'Tajikistan': [71, 39],
    'Azerbaijan': [47, 40],
    'Georgia': [43, 42],
    'Armenia': [45, 40],
    'New Zealand': [174, -41],
    'Papua New Guinea': [144, -6],
    'Fiji': [180, -16],
    'Cuba': [-77, 22],
    'Jamaica': [-77, 18],
    'Haiti': [-72, 19],
    'Dominican Republic': [-71, 19],
    'Costa Rica': [-84, 10],
    'Panama': [-80, 9],
    'Guatemala': [-90, 15],
    'Honduras': [-87, 15],
    'El Salvador': [-89, 14],
    'Nicaragua': [-85, 13],
    'Belize': [-89, 17],
    'Paraguay': [-58, -23],
    'Uruguay': [-56, -33],
    'Bolivia': [-65, -17],
    'Ecuador': [-78, -1],
    'Guyana': [-59, 5],
    'Suriname': [-56, 4],
    'French Guiana': [-53, 5],
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
            margin: '10px 0', 
            padding: '12px', 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '2px solid #FF6B6B',
            maxWidth: '250px'
          }}>
            <h3 style={{ color: '#FF6B6B', margin: '0 0 8px 0', fontSize: '16px' }}>
              Selected: {selectedCountry.name}
            </h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
              Country ID: {selectedCountry.id}
            </p>
            
            {countriesWithClubs[selectedCountry.name] && countriesWithClubs[selectedCountry.name].length > 0 && (
              <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#333' }}>
                  Kluby ({countriesWithClubs[selectedCountry.name].length}):
                </h4>
                <ul style={{ margin: '0', padding: '0', listStyle: 'none' }}>
                  {countriesWithClubs[selectedCountry.name].map((club) => (
                    <li key={club.id} style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: '12px', 
                      color: '#555',
                      padding: '2px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: '500' }}>{club.name}</span>
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#4ECDC4', 
                        fontWeight: '600' 
                      }}>
                        {club.points} pkt
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {(!countriesWithClubs[selectedCountry.name] || countriesWithClubs[selectedCountry.name].length === 0) && (
              <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                <p style={{ 
                  margin: '0', 
                  fontSize: '12px', 
                  color: '#999', 
                  fontStyle: 'italic' 
                }}>
                  Brak klubów w tym kraju
                </p>
              </div>
            )}
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
          
          {/* Markers for countries with clubs */}
          {Object.entries(countriesWithClubs).map(([countryName, countryClubs]) => {
            const coordinates = countryCoordinates[countryName];
            if (!coordinates) return null;
            
            return (
              <Marker key={countryName} coordinates={coordinates}>
                <g
                  fill="#FF6B6B"
                  stroke="#fff"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="translate(-12, -24)"
                >
                  <circle cx="12" cy="10" r="3" />
                  <path d="m12 21.7-4.2-4.3a5 5 0 1 1 8.4 0z" />
                </g>
                <text
                  textAnchor="middle"
                  y={-30}
                  style={{
                    fontFamily: 'system-ui',
                    fill: '#333',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
                  }}
                >
                  {countryClubs.length}
                </text>
              </Marker>
            );
          })}
        </ZoomableGroup>
        </ComposableMap>
    </div>
  );
};

export default WorldMap;