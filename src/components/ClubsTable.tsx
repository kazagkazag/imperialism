import React from 'react';

interface Club {
  id: string;
  name: string;
  country: string;
  points: number;
  color: string;
  territories: string[]; // Array of country names this team controls
  isEliminated: boolean; // Whether this team is eliminated
}

interface ClubsTableProps {
  clubs: Club[];
  onEditClub: (clubId: string) => void;
  onDeleteClub: (clubId: string) => void;
}

const ClubsTable: React.FC<ClubsTableProps> = ({ clubs, onEditClub, onDeleteClub }) => {
  const [hoveredRowId, setHoveredRowId] = React.useState<string | null>(null);
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
                  transition: 'background-color 0.2s ease',
                  opacity: club.isEliminated ? 0.5 : 1,
                  backgroundColor: club.isEliminated ? '#f5f5f5' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!club.isEliminated) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    setHoveredRowId(club.id);
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = club.isEliminated ? '#f5f5f5' : 'transparent';
                  setHoveredRowId(null);
                }}
              >
                <td style={{ 
                  padding: '12px 16px',
                  color: '#333',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div 
                      style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: club.color,
                        marginRight: '8px',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    ></div>
                    <div>
                      <div style={{ fontWeight: '500' }}>
                        {club.name}
                        {club.isEliminated && (
                          <span style={{ 
                            fontSize: '10px', 
                            color: '#dc3545', 
                            marginLeft: '6px',
                            fontWeight: '600'
                          }}>
                            WYELIMINOWANE
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: club.isEliminated ? '#999' : '#666', 
                        marginTop: '2px' 
                      }}>
                        {club.territories.length === 1 
                          ? club.territories[0] 
                          : `${club.territories.length} terytoriów`
                        }
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons overlay */}
                  <div style={{ 
                    position: 'absolute',
                    top: '50%',
                    right: '16px',
                    transform: 'translateY(-50%)',
                    display: 'flex', 
                    gap: '4px',
                    opacity: hoveredRowId === club.id ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                    backgroundColor: 'rgba(248, 249, 250, 0.9)',
                    borderRadius: '4px',
                    padding: '2px'
                  }}>
                    <button
                      onClick={() => onEditClub(club.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Edytuj klub"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => onDeleteClub(club.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffebee'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Usuń klub"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,2h4a2,2 0 0,1 2,2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
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