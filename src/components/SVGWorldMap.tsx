import React, { useState, useEffect } from 'react';

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

interface SVGWorldMapProps {
  onCountryClick?: (country: CountryClickInfo) => void;
  clubs: Club[];
}

const SVGWorldMap: React.FC<SVGWorldMapProps> = ({ onCountryClick, clubs }) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryClickInfo | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  // Load SVG content
  useEffect(() => {
    fetch('/map.svg')
      .then(response => response.text())
      .then(data => setSvgContent(data))
      .catch(error => console.error('Error loading SVG:', error));
  }, []);

  // Get countries that have clubs
  const countriesWithClubs = clubs.reduce((acc, club) => {
    const country = club.country;
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(club);
    return acc;
  }, {} as Record<string, Club[]>);

  const handleCountryClick = (countryName: string) => {
    const countryInfo: CountryClickInfo = {
      name: countryName,
      id: countryName.toLowerCase().replace(/\s+/g, '-'),
      properties: { name: countryName },
    };
    setSelectedCountry(countryInfo);
    onCountryClick?.(countryInfo);
    console.log('Clicked country:', countryInfo);
  };

  const handleCountryMouseEnter = (countryName: string) => {
    setHoveredCountry(countryName);
  };

  const handleCountryMouseLeave = () => {
    setHoveredCountry(null);
  };

  // Process SVG content to make countries interactive
  const processedSvgContent = svgContent.replace(
    /<path[^>]*>/g,
    (match) => {
      // Try to extract country name from various attributes
      const idMatch = match.match(/id="([^"]*)"/);
      const classMatch = match.match(/class="([^"]*)"/);
      const titleMatch = match.match(/title="([^"]*)"/);
      const dataNameMatch = match.match(/data-name="([^"]*)"/);
      
      let countryName = '';
      if (dataNameMatch) countryName = dataNameMatch[1];
      else if (titleMatch) countryName = titleMatch[1];
      else if (idMatch) countryName = idMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      else if (classMatch) countryName = classMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

      if (!countryName) return match;

      // Determine fill color based on state
      let fill = '#D6D6DA'; // Default gray
      if (selectedCountry && countryName === selectedCountry.name) {
        fill = '#FF6B6B'; // Red for selected country
      } else if (hoveredCountry && countryName === hoveredCountry) {
        fill = '#4ECDC4'; // Teal for hovered country
      }

      // Add interactive properties (no React event handlers in SVG string)
      const interactiveProps = `
        fill="${fill}"
        stroke="#FFFFFF"
        stroke-width="0.5"
        cursor="pointer"
        data-country="${countryName}"
      `;

      return match.replace('>', ` ${interactiveProps}>`);
    }
  );

  if (!svgContent) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <p>Loading map...</p>
      </div>
    );
  }

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

      {/* SVG Map Container */}
      <div 
        style={{ width: '100%', height: '100vh', overflow: 'hidden' }}
        dangerouslySetInnerHTML={{ __html: processedSvgContent }}
        onClick={(e) => {
          const target = e.target as SVGPathElement;
          if (target.tagName === 'path') {
            // Extract country name from the data-country attribute we added
            const countryName = target.getAttribute('data-country') ||
                              target.getAttribute('data-name') || 
                              target.getAttribute('title') || 
                              target.id?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 
                              target.className?.baseVal?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            
            if (countryName) {
              handleCountryClick(countryName);
            }
          }
        }}
        onMouseOver={(e) => {
          const target = e.target as SVGPathElement;
          if (target.tagName === 'path') {
            const countryName = target.getAttribute('data-country') ||
                              target.getAttribute('data-name') || 
                              target.getAttribute('title') || 
                              target.id?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 
                              target.className?.baseVal?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            
            if (countryName) {
              handleCountryMouseEnter(countryName);
            }
          }
        }}
        onMouseOut={() => {
          handleCountryMouseLeave();
        }}
      />
    </div>
  );
};

export default SVGWorldMap;