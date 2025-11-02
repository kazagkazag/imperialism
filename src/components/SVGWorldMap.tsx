import React, { useState, useEffect, useRef, useCallback } from "react";

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
  const [selectedCountry, setSelectedCountry] =
    useState<CountryClickInfo | null>(null);
  // Remove hoveredCountry state to prevent re-renders on hover
  const [svgContent, setSvgContent] = useState<string>("");
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  // Removed drag state - using WASD controls instead
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Get countries that have clubs
  const countriesWithClubs = clubs.reduce((acc, club) => {
    const country = club.country;
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(club);
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
    console.log('Hovering over:', countryName);
  }, []);

  const handleCountryMouseLeave = useCallback(() => {
    // No state updates to prevent re-renders
    console.log('Mouse left country');
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
        case 'w':
          setPan(prev => ({ ...prev, y: prev.y + moveSpeed }));
          break;
        case 'a':
          setPan(prev => ({ ...prev, x: prev.x + moveSpeed }));
          break;
        case 's':
          setPan(prev => ({ ...prev, y: prev.y - moveSpeed }));
          break;
        case 'd':
          setPan(prev => ({ ...prev, x: prev.x - moveSpeed }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
  const processedSvgContent = svgContent.replace(/<path[^>]*>/g, (match) => {
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
    if (selectedCountry && countryName === selectedCountry.name) {
      fill = "#FF6B6B"; // Red for selected country
    }
    // Hover effects will be handled by CSS instead of state

    // Add interactive properties (no React event handlers in SVG string)
    const interactiveProps = `
        fill="${fill}"
        stroke="#FFFFFF"
        stroke-width="0.5"
        cursor="pointer"
        data-country="${countryName}"
      `;

    return match.replace(">", ` ${interactiveProps}>`);
  });

  if (!svgContent) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        backgroundColor: "#f8f9fa",
        position: "relative",
      }}
    >
      {/* Zoom Controls */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <button
          onClick={zoomIn}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "2px solid #4ECDC4",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#4ECDC4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "2px solid #4ECDC4",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#4ECDC4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={resetZoom}
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            border: "2px solid #666",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            color: "#666",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
          title="Reset Zoom"
        >
          ⌂
        </button>
      </div>

      {/* Fixed position info panel in top-right corner of map area */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          minWidth: "200px",
          textAlign: "left",
        }}
      >
        {/* Hover display removed to prevent re-renders */}
        {selectedCountry && (
          <div
            style={{
              margin: "10px 0",
              padding: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              border: "2px solid #FF6B6B",
              maxWidth: "250px",
            }}
          >
            <h3
              style={{
                color: "#FF6B6B",
                margin: "0 0 8px 0",
                fontSize: "16px",
              }}
            >
              Selected: {selectedCountry.name}
            </h3>
            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>
              Country ID: {selectedCountry.id}
            </p>

            {countriesWithClubs[selectedCountry.name] &&
              countriesWithClubs[selectedCountry.name].length > 0 && (
                <div
                  style={{
                    marginTop: "12px",
                    paddingTop: "8px",
                    borderTop: "1px solid #f0f0f0",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "14px",
                      color: "#333",
                    }}
                  >
                    Kluby ({countriesWithClubs[selectedCountry.name].length}):
                  </h4>
                  <ul style={{ margin: "0", padding: "0", listStyle: "none" }}>
                    {countriesWithClubs[selectedCountry.name].map((club) => (
                      <li
                        key={club.id}
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "12px",
                          color: "#555",
                          padding: "2px 0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>{club.name}</span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#4ECDC4",
                            fontWeight: "600",
                          }}
                        >
                          {club.points} pkt
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {(!countriesWithClubs[selectedCountry.name] ||
              countriesWithClubs[selectedCountry.name].length === 0) && (
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "8px",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <p
                  style={{
                    margin: "0",
                    fontSize: "12px",
                    color: "#999",
                    fontStyle: "italic",
                  }}
                >
                  Brak klubów w tym kraju
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SVG Map Container */}
      <div
        style={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          cursor: "default",
        }}
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
          dangerouslySetInnerHTML={{ __html: processedSvgContent }}
        />
      </div>
    </div>
  );
};

export default SVGWorldMap;
