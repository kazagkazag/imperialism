import React, { useState, useEffect } from 'react';
import './App.css';
import WorldMap from './components/WorldMap';
import SVGWorldMap from './components/SVGWorldMap';
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
  color: string;
  territories: string[]; // Array of country names this team controls
  isEliminated: boolean; // Whether this team is eliminated
}

function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryClickInfo | null>(null);
  const [editingClub, setEditingClub] = useState<Club | null>(null);

  // Load clubs from localStorage or initialize empty array
  const [clubs, setClubs] = useState<Club[]>(() => {
    try {
      const savedClubs = localStorage.getItem('imperializm-clubs');
      return savedClubs ? JSON.parse(savedClubs) : [];
    } catch (error) {
      console.error('Error loading clubs from localStorage:', error);
      return [];
    }
  });

  // Save clubs to localStorage whenever clubs state changes
  useEffect(() => {
    try {
      localStorage.setItem('imperializm-clubs', JSON.stringify(clubs));
    } catch (error) {
      console.error('Error saving clubs to localStorage:', error);
    }
  }, [clubs]);

  // Generate a random color for a new club
  const generateRandomColor = (): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
      '#A3E4D7', '#F9E79F', '#FADBD8', '#D5DBDB', '#AED6F1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleCountryClick = (country: CountryClickInfo) => {
    setSelectedCountry(country);
  };

  const handleAddClub = (clubName: string) => {
    if (selectedCountry) {
      // Check if there's already a club in this country
      const existingClub = clubs.find(club => club.country === selectedCountry.name);
      if (existingClub) {
        alert(`W kraju "${selectedCountry.name}" już istnieje klub "${existingClub.name}". Można mieć tylko jeden klub na obszar.`);
        return;
      }

      const newClub: Club = {
        id: Date.now().toString(), // Simple ID generation
        name: clubName,
        country: selectedCountry.name,
        points: 0,
        color: generateRandomColor(),
        territories: [selectedCountry.name], // Initially owns only their starting country
        isEliminated: false // New teams start active
      };
      setClubs(prevClubs => [...prevClubs, newClub]);
      console.log(`Added club "${clubName}" to ${selectedCountry.name}`);
    }
    setSelectedCountry(null); // Close the form after adding
  };

  const handleCancelForm = () => {
    setSelectedCountry(null);
  };

  const handleEditClub = (clubId: string) => {
    const clubToEdit = clubs.find(club => club.id === clubId);
    if (clubToEdit) {
      setEditingClub(clubToEdit);
      setSelectedCountry(null); // Close country selection if open
    }
  };

  const handleDeleteClub = (clubId: string) => {
    const clubToDelete = clubs.find(club => club.id === clubId);
    const clubName = clubToDelete?.name || 'klub';
    
    const confirmed = window.confirm(`Czy na pewno chcesz usunąć klub "${clubName}"?`);
    
    if (confirmed) {
      setClubs(prevClubs => prevClubs.filter(club => club.id !== clubId));
      console.log(`Deleted club with ID: ${clubId}`);
    }
  };

  const handleSaveEditedClub = (clubId: string, newName: string) => {
    setClubs(prevClubs => 
      prevClubs.map(club => 
        club.id === clubId ? { ...club, name: newName } : club
      )
    );
    setEditingClub(null); // Close the edit form
    console.log(`Updated club ${clubId} with new name: ${newName}`);
  };

  const handleCancelEdit = () => {
    setEditingClub(null);
  };

  const handleUpdateClub = (clubId: string, updates: Partial<Club>) => {
    setClubs(prevClubs => 
      prevClubs.map(club => 
        club.id === clubId ? { ...club, ...updates } : club
      )
    );
  };

  return (
    <div className="App">
      <main style={{ display: 'flex', width: '100vw', height: '100vh' }}>
        {/* Map area - 3/4 of screen width */}
        <div style={{ width: '75%', height: '100vh' }}>
          <SVGWorldMap onCountryClick={handleCountryClick} clubs={clubs} onUpdateClub={handleUpdateClub} />
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
          {editingClub ? (
            <>
              <AddClubForm 
                countryName={editingClub.country}
                onAdd={handleAddClub}
                onCancel={handleCancelEdit}
                editingClub={{
                  id: editingClub.id,
                  name: editingClub.name
                }}
                onSave={handleSaveEditedClub}
              />
              <ClubsTable 
                clubs={clubs} 
                onEditClub={handleEditClub}
                onDeleteClub={handleDeleteClub}
              />
            </>
          ) : selectedCountry ? (
            <>
              {(() => {
                const existingClub = clubs.find(club => club.country === selectedCountry.name);
                if (existingClub) {
                  return (
                    <div style={{ padding: '20px 0' }}>
                      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                        {selectedCountry.name}
                      </h3>
                      <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#fff3cd', 
                        border: '1px solid #ffeaa7', 
                        borderRadius: '6px',
                        marginBottom: '20px'
                      }}>
                        <p style={{ margin: '0', color: '#856404', fontSize: '14px' }}>
                          ⚠️ W tym kraju już istnieje klub: <strong>{existingClub.name}</strong>
                        </p>
                        <p style={{ margin: '5px 0 0 0', color: '#856404', fontSize: '12px' }}>
                          Można mieć tylko jeden klub na obszar.
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedCountry(null)}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Zamknij
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <AddClubForm 
                      countryName={selectedCountry.name}
                      onAdd={handleAddClub}
                      onCancel={handleCancelForm}
                    />
                  );
                }
              })()}
              <ClubsTable 
                clubs={clubs} 
                onEditClub={handleEditClub}
                onDeleteClub={handleDeleteClub}
              />
            </>
          ) : (
            <>
              <div>
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Control Panel</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Kliknij na kraj, aby dodać klub.
                </p>
              </div>
              <ClubsTable 
                clubs={clubs} 
                onEditClub={handleEditClub}
                onDeleteClub={handleDeleteClub}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
