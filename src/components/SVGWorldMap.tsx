import React, { useState, useEffect, useRef, useCallback } from "react";
import "./SVGWorldMap.css";

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

interface GameRound {
  round: number;
  selectedTeam: Club;
  opponentTeam: Club;
  winner: Club;
}

interface SVGWorldMapProps {
  onCountryClick?: (country: CountryClickInfo) => void;
  clubs: Club[];
  onUpdateClub?: (clubId: string, updates: Partial<Club>) => void;
}

const SVGWorldMap: React.FC<SVGWorldMapProps> = ({
  onCountryClick,
  clubs,
  onUpdateClub,
}) => {
  const [selectedCountry, setSelectedCountry] =
    useState<CountryClickInfo | null>(null);
  // Remove hoveredCountry state to prevent re-renders on hover
  const [svgContent, setSvgContent] = useState<string>("");
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  // Load game state from localStorage or initialize with defaults
  const [currentRound, setCurrentRound] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("imperializm-currentRound");
      return saved ? JSON.parse(saved) : 0;
    } catch (error) {
      return 0;
    }
  });

  const [gameStarted, setGameStarted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("imperializm-gameStarted");
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      return false;
    }
  });

  const [selectedTeam, setSelectedTeam] = useState<Club | null>(() => {
    try {
      const saved = localStorage.getItem("imperializm-selectedTeam");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  });

  const [opponentTeam, setOpponentTeam] = useState<Club | null>(() => {
    try {
      const saved = localStorage.getItem("imperializm-opponentTeam");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  });

  const [gameHistory, setGameHistory] = useState<GameRound[]>(() => {
    try {
      const saved = localStorage.getItem("imperializm-gameHistory");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });

  const [isSelectingOpponent, setIsSelectingOpponent] =
    useState<boolean>(false);
  const [isSelectingWinner, setIsSelectingWinner] = useState<boolean>(false);
  const [isTransitioningRound, setIsTransitioningRound] =
    useState<boolean>(false);
  // Removed drag state - using WASD controls instead
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "imperializm-currentRound",
        JSON.stringify(currentRound)
      );
    } catch (error) {
      console.error("Error saving currentRound to localStorage:", error);
    }
  }, [currentRound]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "imperializm-gameStarted",
        JSON.stringify(gameStarted)
      );
    } catch (error) {
      console.error("Error saving gameStarted to localStorage:", error);
    }
  }, [gameStarted]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "imperializm-selectedTeam",
        JSON.stringify(selectedTeam)
      );
    } catch (error) {
      console.error("Error saving selectedTeam to localStorage:", error);
    }
  }, [selectedTeam]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "imperializm-opponentTeam",
        JSON.stringify(opponentTeam)
      );
    } catch (error) {
      console.error("Error saving opponentTeam to localStorage:", error);
    }
  }, [opponentTeam]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "imperializm-gameHistory",
        JSON.stringify(gameHistory)
      );
    } catch (error) {
      console.error("Error saving gameHistory to localStorage:", error);
    }
  }, [gameHistory]);

  // Handle opponent reselection
  const handleOpponentReselection = () => {
    if (!selectedTeam) return;

    // Reset opponent and start selection process
    setOpponentTeam(null);
    setIsSelectingOpponent(true);

    setTimeout(() => {
      // Filter out the selected team and eliminated teams to get remaining opponents
      const remainingTeams = clubs.filter(
        (club) => club.id !== selectedTeam.id && !club.isEliminated
      );
      const randomOpponent =
        remainingTeams[Math.floor(Math.random() * remainingTeams.length)];
      setOpponentTeam(randomOpponent);
      setIsSelectingOpponent(false);
    }, 500);
  };

  // Handle winner selection mode
  const handleSelectWinner = () => {
    setIsSelectingWinner(true);
  };

  // Handle winner selection (team or opponent)
  const handleWinnerSelected = (winner: Club) => {
    if (!selectedTeam || !opponentTeam) return;

    const loser = winner.id === selectedTeam.id ? opponentTeam : selectedTeam;

    console.log("=== BATTLE RESULT ===");
    console.log("Winner:", winner.name, "Territories:", winner.territories);
    console.log("Loser:", loser.name, "Territories:", loser.territories);

    // Territory conquest: Winner takes one random territory from loser
    if (loser.territories.length > 0) {
      const randomTerritoryIndex = Math.floor(
        Math.random() * loser.territories.length
      );
      const conqueredTerritory = loser.territories[randomTerritoryIndex];

      // Update winner: add points and territory
      if (onUpdateClub) {
        onUpdateClub(winner.id, {
          points: winner.points + 1,
          territories: [...winner.territories, conqueredTerritory],
        });
      }

      // Update loser: remove territory and check elimination
      const newLoserTerritories = loser.territories.filter(
        (_, index) => index !== randomTerritoryIndex
      );
      const isLoserEliminated = newLoserTerritories.length === 0;

      console.log("Territory conquered:", conqueredTerritory);
      console.log("Loser territories after loss:", newLoserTerritories);
      console.log("Is loser eliminated?", isLoserEliminated);

      if (onUpdateClub) {
        onUpdateClub(loser.id, {
          territories: newLoserTerritories,
          isEliminated: isLoserEliminated,
        });
      }
    }

    // Add round to game history
    const roundData: GameRound = {
      round: currentRound,
      selectedTeam,
      opponentTeam,
      winner,
    };

    setGameHistory((prev) => {
      const newHistory = [roundData, ...prev];
      // Keep only last 5 rounds
      return newHistory.slice(0, 5);
    });

    // Move to next round and automatically select new teams
    setIsSelectingWinner(false);
    setIsTransitioningRound(true); // Disable buttons during transition
    setCurrentRound((prev) => prev + 1);

    // Start new round with new random teams after a short delay
    // We need to wait longer to ensure clubs data is updated with elimination status
    setTimeout(() => {
      // Force a fresh evaluation of clubs by using a callback
      setSelectedTeam(null);
      setOpponentTeam(null);

      // Set a flag to trigger team selection in useEffect when clubs update
      setIsTransitioningRound(false);

      // The actual team selection will happen in the useEffect that watches clubs changes
    }, 1500); // Longer delay to ensure clubs are updated
  };

  // Handle cancel winner selection
  const handleCancelWinnerSelection = () => {
    setIsSelectingWinner(false);
  };

  // Refresh team references to ensure they're up to date with current clubs data
  const refreshTeamReferences = useCallback(() => {
    if (selectedTeam) {
      const updatedSelectedTeam = clubs.find(
        (club) => club.id === selectedTeam.id
      );
      if (updatedSelectedTeam && !updatedSelectedTeam.isEliminated) {
        setSelectedTeam(updatedSelectedTeam);
      } else {
        // Selected team was eliminated, clear it
        setSelectedTeam(null);
      }
    }

    if (opponentTeam) {
      const updatedOpponentTeam = clubs.find(
        (club) => club.id === opponentTeam.id
      );
      if (updatedOpponentTeam && !updatedOpponentTeam.isEliminated) {
        setOpponentTeam(updatedOpponentTeam);
      } else {
        // Opponent team was eliminated, clear it
        setOpponentTeam(null);
      }
    }
  }, [selectedTeam, opponentTeam, clubs]);

  // Refresh team references whenever clubs data changes
  useEffect(() => {
    refreshTeamReferences();
  }, [clubs, refreshTeamReferences]);

  // Handle new round team selection when clubs data changes and we need new teams
  useEffect(() => {
    if (
      gameStarted &&
      !selectedTeam &&
      !opponentTeam &&
      !isTransitioningRound &&
      clubs.length > 0
    ) {
      const activeTeams = clubs.filter((club) => !club.isEliminated);
      console.log("=== NEW ROUND TEAM SELECTION (from useEffect) ===");
      console.log(
        "All clubs:",
        clubs.map((c) => `${c.name} (eliminated: ${c.isEliminated})`)
      );
      console.log(
        "Active teams:",
        activeTeams.map((c) => c.name)
      );

      if (activeTeams.length >= 2) {
        const randomTeam =
          activeTeams[Math.floor(Math.random() * activeTeams.length)];
        console.log("Selected team:", randomTeam?.name);
        setSelectedTeam(randomTeam);

        // Start opponent selection process
        setIsSelectingOpponent(true);
        setTimeout(() => {
          const remainingTeams = activeTeams.filter(
            (club) => club.id !== randomTeam.id
          );
          const randomOpponent =
            remainingTeams[Math.floor(Math.random() * remainingTeams.length)];
          console.log(
            "Possible opponents:",
            remainingTeams.map((c) => c.name)
          );
          console.log("Selected opponent:", randomOpponent?.name);
          setOpponentTeam(randomOpponent);
          setIsSelectingOpponent(false);
        }, 500);
      } else {
        console.log("Game over - not enough active teams");
        // Handle game over scenario
        setGameStarted(false);
      }
    }
  }, [clubs, gameStarted, selectedTeam, opponentTeam, isTransitioningRound]);

  // Debug function to clear localStorage
  const handleClearGameState = () => {
    const confirmed = window.confirm(
      "Czy na pewno chcesz wyczyścić cały stan gry? Spowoduje to utratę wszystkich danych i restart gry."
    );

    if (confirmed) {
      try {
        // Clear game state from localStorage
        localStorage.removeItem("imperializm-clubs");
        localStorage.removeItem("imperializm-currentRound");
        localStorage.removeItem("imperializm-gameStarted");
        localStorage.removeItem("imperializm-selectedTeam");
        localStorage.removeItem("imperializm-opponentTeam");
        localStorage.removeItem("imperializm-gameHistory");

        // Reload the page to reset all state
        window.location.reload();
      } catch (error) {
        console.error("Error clearing game state:", error);
      }
    }
  };

  // Handle round management
  const handleRoundAction = () => {
    if (!gameStarted) {
      // Start the first round and randomly select a team
      const activeTeams = clubs.filter((club) => !club.isEliminated);
      if (activeTeams.length < 2) {
        alert(
          "Nie można rozpocząć gry - potrzeba przynajmniej 2 aktywnych drużyn!"
        );
        return;
      }

      const randomTeam =
        activeTeams[Math.floor(Math.random() * activeTeams.length)];
      setSelectedTeam(randomTeam);
      setGameStarted(true);
      setCurrentRound(1);
      setOpponentTeam(null);

      // Start opponent selection process
      setIsSelectingOpponent(true);
      setTimeout(() => {
        // Filter out the selected team and eliminated teams to get remaining opponents
        const remainingTeams = clubs.filter(
          (club) => club.id !== randomTeam.id && !club.isEliminated
        );
        const randomOpponent =
          remainingTeams[Math.floor(Math.random() * remainingTeams.length)];
        setOpponentTeam(randomOpponent);
        setIsSelectingOpponent(false);
      }, 500);
    } else {
      // Start next round with new random team (don't increment round here, it's done in handleWinnerSelected)
      const activeTeams = clubs.filter((club) => !club.isEliminated);
      const randomTeam =
        activeTeams[Math.floor(Math.random() * activeTeams.length)];
      setSelectedTeam(randomTeam);
      setOpponentTeam(null);

      // Start opponent selection process
      setIsSelectingOpponent(true);
      setTimeout(() => {
        // Filter out the selected team and eliminated teams to get remaining opponents
        const remainingTeams = clubs.filter(
          (club) => club.id !== randomTeam.id && !club.isEliminated
        );
        const randomOpponent =
          remainingTeams[Math.floor(Math.random() * remainingTeams.length)];
        setOpponentTeam(randomOpponent);
        setIsSelectingOpponent(false);
      }, 500);
    }
  };

  // Get countries that have clubs (including all territories they control)
  const countriesWithClubs = clubs.reduce((acc, club) => {
    // Add all territories controlled by this club
    club.territories.forEach((territory) => {
      if (!acc[territory]) {
        acc[territory] = [];
      }
      acc[territory].push(club);
    });
    return acc;
  }, {} as Record<string, Club[]>);

  const handleCountryClick = useCallback(
    (countryName: string) => {
      const countryInfo: CountryClickInfo = {
        name: countryName,
        id: countryName.toLowerCase().replace(/\s+/g, "-"),
        properties: { name: countryName },
      };
      setSelectedCountry(countryInfo);
      onCountryClick?.(countryInfo);
      console.log("Clicked country:", countryInfo);
    },
    [onCountryClick]
  );

  // Empty mouse handlers to prevent re-renders - hover effects handled by CSS
  const handleCountryMouseEnter = useCallback((countryName: string) => {
    // No state updates to prevent re-renders
    console.log("Hovering over:", countryName);
  }, []);

  const handleCountryMouseLeave = useCallback(() => {
    // No state updates to prevent re-renders
    console.log("Mouse left country");
  }, []);

  // Load SVG content
  useEffect(() => {
    fetch("/map.svg")
      .then((response) => response.text())
      .then((data) => setSvgContent(data))
      .catch((error) => console.error("Error loading SVG:", error));
  }, []);

  // Use refs to store handlers so they don't cause re-renders of the effect
  const handlersRef = useRef({
    handleCountryClick,
    handleCountryMouseEnter,
    handleCountryMouseLeave,
  });

  // Update refs on every render without causing effect re-run
  useEffect(() => {
    handlersRef.current = {
      handleCountryClick,
      handleCountryMouseEnter,
      handleCountryMouseLeave,
    };
  });

  // Setup event listeners ONLY when SVG content changes (not on state changes)
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current) return;

    const container = svgContainerRef.current;

    // Container click handler removed - using direct path listeners instead

    const timeoutId = setTimeout(() => {
      const paths = container.querySelectorAll("path");

      console.log("Setting up event listeners for", paths.length, "paths");

      const getCountryName = (target: SVGPathElement): string => {
        return (
          target.getAttribute("data-country") ||
          target.getAttribute("data-name") ||
          target.getAttribute("title") ||
          target.id
            ?.replace(/-/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
          target.className?.baseVal
            ?.replace(/-/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
          ""
        );
      };

      const handlePathClick = (e: Event) => {
        console.log("=== PATH CLICK EVENT FIRED ===");
        e.stopPropagation();
        e.preventDefault();

        const target = e.target as SVGPathElement;
        const countryName = getCountryName(target);

        console.log("Country name found:", countryName);
        if (countryName) {
          console.log("Calling handleCountryClick with:", countryName);
          handlersRef.current.handleCountryClick(countryName);
        } else {
          console.log("No country name found for target:", target);
        }
      };

      const handlePathMouseEnter = (e: Event) => {
        console.log("--- Mouse enter event fired ---");
        const target = e.target as SVGPathElement;
        const countryName = getCountryName(target);

        if (countryName) {
          handlersRef.current.handleCountryMouseEnter(countryName);
        }
      };

      const handlePathMouseLeave = () => {
        handlersRef.current.handleCountryMouseLeave();
      };

      // Add event listeners to all paths
      paths.forEach((path, index) => {
        path.addEventListener("click", handlePathClick);
        path.addEventListener("mouseenter", handlePathMouseEnter);
        path.addEventListener("mouseleave", handlePathMouseLeave);
        path.style.cursor = "pointer";
        path.style.pointerEvents = "auto";

        // Debug: log first few paths
        if (index < 3) {
          console.log(`Path ${index}:`, {
            id: path.id,
            dataName: path.getAttribute("data-name"),
            title: path.getAttribute("title"),
            className: path.className.baseVal,
          });
        }
      });

      console.log("Event listeners attached to all paths");

      // Cleanup function
      return () => {
        console.log("Cleaning up event listeners");
        paths.forEach((path) => {
          path.removeEventListener("click", handlePathClick);
          path.removeEventListener("mouseenter", handlePathMouseEnter);
          path.removeEventListener("mouseleave", handlePathMouseLeave);
        });
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [svgContent]); // Only run when SVG content changes

  // WASD keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const moveSpeed = 50; // pixels per keypress

      switch (e.key.toLowerCase()) {
        case "w":
          setPan((prev) => ({ ...prev, y: prev.y + moveSpeed }));
          break;
        case "a":
          setPan((prev) => ({ ...prev, x: prev.x + moveSpeed }));
          break;
        case "s":
          setPan((prev) => ({ ...prev, y: prev.y - moveSpeed }));
          break;
        case "d":
          setPan((prev) => ({ ...prev, x: prev.x - moveSpeed }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Zoom and pan handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(5, zoom * delta));
    setZoom(newZoom);
  };

  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setZoom(Math.min(5, zoom * 1.2));
  };

  const zoomOut = () => {
    setZoom(Math.max(0.5, zoom * 0.8));
  };

  // Process SVG content to make countries interactive
  const getProcessedSvgContent = useCallback(() => {
    return svgContent.replace(/<path[^>]*>/g, (match) => {
      // Try to extract country name from various attributes
      const idMatch = match.match(/id="([^"]*)"/);
      const classMatch = match.match(/class="([^"]*)"/);
      const titleMatch = match.match(/title="([^"]*)"/);
      const dataNameMatch = match.match(/data-name="([^"]*)"/);

      let countryName = "";
      if (dataNameMatch) countryName = dataNameMatch[1];
      else if (titleMatch) countryName = titleMatch[1];
      else if (idMatch)
        countryName = idMatch[1]
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase());
      else if (classMatch)
        countryName = classMatch[1]
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase());

      if (!countryName) return match;

      // Determine fill color based on state
      let fill = "#D6D6DA"; // Default gray

      // Check if this country has a club and use its color
      const countryClub = countriesWithClubs[countryName];
      if (countryClub && countryClub.length > 0) {
        fill = countryClub[0].color; // Use the club's color
      }

      // Override with selection color if selected
      if (selectedCountry && countryName === selectedCountry.name) {
        fill = "#FF6B6B"; // Red for selected country
      }
      // Hover effects will be handled by CSS instead of state

      // Remove any existing fill attribute and add interactive properties
      let cleanedMatch = match.replace(/\sfill="[^"]*"/g, "");

      const interactiveProps = `
          fill="${fill}"
          stroke="#FFFFFF"
          stroke-width="0.5"
          cursor="pointer"
          data-country="${countryName}"
        `;

      return cleanedMatch.replace(">", ` ${interactiveProps}>`);
    });
  }, [svgContent, countriesWithClubs, selectedCountry]);

  if (!svgContent) {
    return (
      <div className="svg-world-map-loading">
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="svg-world-map-container">
      {/* Keyframes animation moved to CSS file */}
      {/* Main Menu Bar */}
      <div className="main-menu-bar">
        {/* Round Counter */}
        {gameStarted && (
          <div className="round-counter">
            <span className="round-counter-badge">Runda {currentRound}</span>
          </div>
        )}

        <button
          onClick={handleRoundAction}
          className={`main-action-button ${
            gameStarted ? "game-started" : "game-not-started"
          }`}
        >
          {gameStarted ? "Zakończ" : "Rozpocznij"}
        </button>

        {/* Debug Button */}
        <button
          onClick={handleClearGameState}
          className="debug-reset-button"
          title="Wyczyść stan gry (debugging)"
        >
          🗑️ Reset
        </button>
      </div>

      {/* Zoom Controls - Moved to bottom left */}
      <div className="zoom-controls">
        <button onClick={zoomIn} className="zoom-button" title="Zoom In">
          +
        </button>
        <button onClick={zoomOut} className="zoom-button" title="Zoom Out">
          −
        </button>
        <button onClick={resetZoom} className="zoom-button" title="Reset Zoom">
          ⌂
        </button>
      </div>

      {/* Game History Log */}
      {gameHistory.length > 0 && gameStarted && (
        <div
          className="game-history-log"
          style={{
            bottom: `${100 + gameHistory.length * 18}px`, // Dynamic positioning based on entries
          }}
        >
          <div className="game-history-title">Ostatnie rundy:</div>
          {gameHistory.map((round, index) => (
            <div key={`${round.round}-${index}`} className="game-history-entry">
              <span className="game-history-round">R{round.round}:</span>
              <span
                className="game-history-team"
                style={{ color: round.selectedTeam.color }}
              >
                {round.selectedTeam.name}
              </span>
              <span>vs</span>
              <span
                className="game-history-team"
                style={{ color: round.opponentTeam.color }}
              >
                {round.opponentTeam.name}
              </span>
              <span>→</span>
              <span
                className="game-history-winner"
                style={{ color: round.winner.color }}
              >
                {round.winner.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Game Control/Status Console */}
      {gameStarted && selectedTeam && (
        <div className="game-console">
          <div className="game-console-content">
            {/* Selected Team */}
            <div className="team-info">
              <div
                className="team-color-dot"
                style={{ backgroundColor: selectedTeam.color }}
              ></div>
              <span style={{ fontWeight: "600" }}>Wybrana drużyna:</span>
              <span style={{ fontWeight: "500", color: "#555" }}>
                {selectedTeam.name} (
                {selectedTeam.territories.length === 1
                  ? selectedTeam.territories[0]
                  : `${selectedTeam.territories.length} terytoriów`}
                )
              </span>
            </div>

            {/* Separator */}
            <div
              style={{
                width: "1px",
                height: "20px",
                backgroundColor: "#ddd",
                margin: "0 8px",
              }}
            ></div>

            {/* Opponent Selection */}
            {isSelectingOpponent ? (
              <>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#f0f0f0",
                    border: "2px solid #4ECDC4",
                    animation: "spin 1s linear infinite",
                    flexShrink: 0,
                  }}
                ></div>
                <span style={{ fontWeight: "600", color: "#4ECDC4" }}>
                  Losowanie przeciwnika...
                </span>
              </>
            ) : opponentTeam ? (
              <>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: opponentTeam.color,
                    border: "1px solid rgba(0,0,0,0.2)",
                    flexShrink: 0,
                  }}
                ></div>
                <span style={{ fontWeight: "600" }}>
                  Wylosowano przeciwnika:
                </span>
                <span style={{ fontWeight: "500", color: "#555" }}>
                  {opponentTeam.name} ({opponentTeam.country})
                </span>

                {/* Action Buttons */}
                <div className="game-actions">
                  {!isSelectingWinner ? (
                    <button
                      onClick={handleSelectWinner}
                      className="winner-select-button primary"
                    >
                      Wskaz zwycięzcę
                    </button>
                  ) : (
                    <>
                      {selectedTeam && (
                        <button
                          onClick={() =>
                            !isTransitioningRound &&
                            handleWinnerSelected(selectedTeam)
                          }
                          disabled={isTransitioningRound}
                          className={`winner-select-button ${
                            isTransitioningRound ? "disabled" : ""
                          }`}
                          style={{
                            backgroundColor: isTransitioningRound
                              ? "#ccc"
                              : selectedTeam.color,
                            boxShadow: isTransitioningRound
                              ? "0 1px 3px rgba(204, 204, 204, 0.3)"
                              : `0 1px 3px ${selectedTeam.color}50`,
                          }}
                        >
                          {selectedTeam.name}
                        </button>
                      )}
                      {opponentTeam && (
                        <button
                          onClick={() =>
                            !isTransitioningRound &&
                            handleWinnerSelected(opponentTeam)
                          }
                          disabled={isTransitioningRound}
                          className={`winner-select-button ${
                            isTransitioningRound ? "disabled" : ""
                          }`}
                          style={{
                            backgroundColor: isTransitioningRound
                              ? "#ccc"
                              : opponentTeam.color,
                            boxShadow: isTransitioningRound
                              ? "0 1px 3px rgba(204, 204, 204, 0.3)"
                              : `0 1px 3px ${opponentTeam.color}50`,
                          }}
                        >
                          {opponentTeam.name}
                        </button>
                      )}
                      <button
                        onClick={() =>
                          !isTransitioningRound && handleCancelWinnerSelection()
                        }
                        disabled={isTransitioningRound}
                        className={`winner-select-button cancel ${
                          isTransitioningRound ? "disabled" : ""
                        }`}
                      >
                        Anuluj
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleOpponentReselection}
                    className="winner-select-button reselect"
                  >
                    Losuj ponownie
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Fixed position info panel in top-right corner of map area */}
      <div className="info-panel">
        {/* Hover display removed to prevent re-renders */}
        {selectedCountry && (
          <div className="selected-country-info">
            <h3 className="selected-country-title">
              Selected: {selectedCountry.name}
            </h3>
            <p className="country-id-text">Country ID: {selectedCountry.id}</p>

            {countriesWithClubs[selectedCountry.name] &&
              countriesWithClubs[selectedCountry.name].length > 0 && (
                <div className="clubs-section">
                  <h4 className="clubs-title">
                    Kluby ({countriesWithClubs[selectedCountry.name].length}):
                  </h4>
                  <ul className="clubs-list">
                    {countriesWithClubs[selectedCountry.name].map((club) => (
                      <li key={club.id} className="club-list-item">
                        <div className="club-item-info">
                          <div
                            className="club-color-dot"
                            style={{ backgroundColor: club.color }}
                          ></div>
                          <span className="club-name">{club.name}</span>
                        </div>
                        <span className="club-points">{club.points} pkt</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {(!countriesWithClubs[selectedCountry.name] ||
              countriesWithClubs[selectedCountry.name].length === 0) && (
              <div className="no-clubs-section">
                <p className="no-clubs-text">Brak klubów w tym kraju</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SVG Map Container */}
      <div
        className="svg-container"
        onWheel={handleWheel}
        onClick={(e) => {
          const target = e.target as SVGPathElement;
          console.log("Clicked element:", target.tagName, target); // Debug log
          if (target.tagName === "path" || target.tagName === "PATH") {
            // Extract country name from the data-country attribute we added
            const countryName =
              target.getAttribute("data-country") ||
              target.getAttribute("data-name") ||
              target.getAttribute("title") ||
              target.id
                ?.replace(/-/g, " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
              target.className?.baseVal
                ?.replace(/-/g, " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase());

            console.log("Extracted country name:", countryName); // Debug log
            if (countryName) {
              handleCountryClick(countryName);
            }
          }
        }}
        onMouseOver={(e) => {
          const target = e.target as SVGPathElement;
          if (target.tagName === "path") {
            const countryName =
              target.getAttribute("data-country") ||
              target.getAttribute("data-name") ||
              target.getAttribute("title") ||
              target.id
                ?.replace(/-/g, " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
              target.className?.baseVal
                ?.replace(/-/g, " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase());

            if (countryName) {
              handleCountryMouseEnter(countryName);
            }
          }
        }}
        onMouseOut={() => {
          handleCountryMouseLeave();
        }}
      >
        <div
          ref={svgContainerRef}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 0.1s ease-out",
            width: "100%",
            height: "100%",
          }}
          dangerouslySetInnerHTML={{ __html: getProcessedSvgContent() }}
        />
      </div>
    </div>
  );
};

export default SVGWorldMap;
