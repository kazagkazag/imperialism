import React from 'react';

interface Club {
  id: string;
  name: string;
  country: string;
  points: number;
}

interface ClubsTableProps {
  clubs: Club[];
}

const ClubsTable: React.FC<ClubsTableProps> = ({ clubs }) => {
  if (clubs.length === 0) {
    return (
      <div style={{ marginTop: '30px' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>
          Kluby
        </h4>
        <p style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>
          Brak dodanych klubów
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>
        Kluby ({clubs.length})
      </h4>
      
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        overflow: 'hidden',
        backgroundColor: '#fff'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #e0e0e0'
            }}>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left',
                fontWeight: '600',
                color: '#333'
              }}>
                Nazwa klubu
              </th>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'center',
                fontWeight: '600',
                color: '#333',
                width: '80px'
              }}>
                Pkt
              </th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((club, index) => (
              <tr 
                key={club.id}
                style={{ 
                  borderBottom: index < clubs.length - 1 ? '1px solid #f0f0f0' : 'none',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ 
                  padding: '12px 16px',
                  color: '#333'
                }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{club.name}</div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666', 
                      marginTop: '2px' 
                    }}>
                      {club.country}
                    </div>
                  </div>
                </td>
                <td style={{ 
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#4ECDC4'
                }}>
                  {club.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClubsTable;