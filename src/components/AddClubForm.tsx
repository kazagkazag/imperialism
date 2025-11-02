import React, { useState } from 'react';

interface AddClubFormProps {
  countryName: string;
  onAdd: (clubName: string) => void;
  onCancel: () => void;
  editingClub?: {
    id: string;
    name: string;
  };
  onSave?: (clubId: string, newName: string) => void;
}

const AddClubForm: React.FC<AddClubFormProps> = ({ countryName, onAdd, onCancel, editingClub, onSave }) => {
  const [clubName, setClubName] = useState(editingClub?.name || '');
  const isEditing = !!editingClub;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clubName.trim()) {
      if (isEditing && editingClub && onSave) {
        onSave(editingClub.id, clubName.trim());
      } else {
        onAdd(clubName.trim());
      }
      setClubName('');
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px' }}>
        {isEditing ? 'Edytuj klub' : 'Dodaj klub'}
      </h3>
      
      <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
        Kraj: <strong>{countryName}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label 
            htmlFor="clubName" 
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#333', 
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Nazwa klubu
          </label>
          <input
            id="clubName"
            type="text"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="Wprowadź nazwę klubu"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4ECDC4'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={!clubName.trim()}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: clubName.trim() ? '#4ECDC4' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: clubName.trim() ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (clubName.trim()) {
                e.currentTarget.style.backgroundColor = '#45b7aa';
              }
            }}
            onMouseLeave={(e) => {
              if (clubName.trim()) {
                e.currentTarget.style.backgroundColor = '#4ECDC4';
              }
            }}
          >
            {isEditing ? 'Zapisz' : 'Dodaj'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: '#fff',
              color: '#666',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
              e.currentTarget.style.borderColor = '#ccc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClubForm;