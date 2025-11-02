import React, { useState } from 'react';
import './App.css';
import WorldMap from './components/WorldMap';
import AddClubForm from './components/AddClubForm';
import ClubsTable from './components/ClubsTable';

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

function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryClickInfo | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);

  const handleCountryClick = (country: CountryClickInfo) => {
    setSelectedCountry(country);
  };

  const handleAddClub = (clubName: string) => {
    if (selectedCountry) {
      const newClub: Club = {
        id: Date.now().toString(), // Simple ID generation
        name: clubName,
        country: selectedCountry.name,
        points: 0
      };
      setClubs(prevClubs => [...prevClubs, newClub]);
      console.log(`Added club "${clubName}" to ${selectedCountry.name}`);
    }
    setSelectedCountry(null); // Close the form after adding
  };

  const handleCancelForm = () => {
    setSelectedCountry(null);
  };

  return (
    <div className="App">
      <main style={{ display: 'flex', width: '100vw', height: '100vh' }}>
        {/* Map area - 3/4 of screen width */}
        <div style={{ width: '75%', height: '100vh' }}>
          <WorldMap onCountryClick={handleCountryClick} />
        </div>
        
        {/* Sidebar - 1/4 of screen width */}
        <div style={{ 
          width: '25%', 
          height: '100vh', 
          backgroundColor: '#ffffff', 
          borderLeft: '2px solid #e0e0e0',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
          padding: '20px',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          {selectedCountry ? (
            <>
              <AddClubForm 
                countryName={selectedCountry.name}
                onAdd={handleAddClub}
                onCancel={handleCancelForm}
              />
              <ClubsTable clubs={clubs} />
            </>
          ) : (
            <>
              <div>
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Control Panel</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Kliknij na kraj, aby dodać klub.
                </p>
              </div>
              <ClubsTable clubs={clubs} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
