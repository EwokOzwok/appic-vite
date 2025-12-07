import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const MapTab = ({ appicGeoData, recommendations }) => {
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);
  const [markersData, setMarkersData] = useState([]);
  
  // Debug logging
  useEffect(() => {
    console.log("Incoming geo data:", appicGeoData);

    if (appicGeoData?.length > 0) {
      console.log("Keys in a row:", Object.keys(appicGeoData[0]));
      console.log("Sample lat_jittered:", appicGeoData[0].lat_jittered);
      console.log("Sample long_jittered:", appicGeoData[0].long_jittered);
    }
  }, [appicGeoData]);


  // Filter: recommended vs all
  useEffect(() => {
    if (!appicGeoData) return;

    // Filter out rows with no coordinates (benefits rows, blanks, errors)
    const validSites = appicGeoData.filter(site => {
      const lat = parseFloat(site.lat_jittered);
      const lng = parseFloat(site.long_jittered);
      return (
        !isNaN(lat) &&
        !isNaN(lng) &&
        site.City &&
        site.State &&
        site.Country &&
        site.SiteDepartment !== ""
      );
    });

    if (showOnlyRecommended && recommendations?.length > 0) {
      // Dynamically detect APPIC column in recommendations
      const firstRec = recommendations[0];
      const recAPPICCol = 
        'APPICNumber' in firstRec ? 'APPICNumber' :
        'APPIC Number' in firstRec ? 'APPIC Number' :
        'APPIC.Number' in firstRec ? 'APPIC.Number' : null;

      if (recAPPICCol) {
        const recNumbers = recommendations.map(r => String(r[recAPPICCol]).trim());

        setMarkersData(
          validSites.filter(site => recNumbers.includes(String(site.APPICNumber).trim()))
        );
        return;
      }
    }

    // Default: show all valid sites
    setMarkersData(validSites);

  }, [showOnlyRecommended, recommendations, appicGeoData]);



  // Loading state
  if (!appicGeoData || appicGeoData.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
            APPIC Site Map
          </h2>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading map data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 fade-in">
      <div className="glass rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            APPIC Site Map
          </h2>

          {recommendations && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyRecommended}
                onChange={(e) => setShowOnlyRecommended(e.target.checked)}
                className="w-5 h-5 rounded bg-dark-elevated border-gray-700 text-blue-400 focus:ring-2 focus:ring-blue-400/20"
              />
              <span className="text-gray-300">Show only recommended sites</span>
            </label>
          )}
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-gray-800" style={{ height: "600px" }}>
          <MapContainer
            center={[39.8283, -98.5795]}
            zoom={4}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {markersData.map((site, idx) => {
              // Robust coordinate cleaning
              const lat = parseFloat(String(site.lat_jittered || "").trim());
              const lng = parseFloat(String(site.long_jittered || "").trim());

              if (isNaN(lat) || isNaN(lng)) {
                console.warn("Invalid coords:", site);
                return null;
              }

              return (
                <Marker key={idx} position={[lat, lng]}>
                  <Popup maxWidth={300}>
                    <div style={{ color: "#000000" }}> {/* <-- change text color to black */}
                      <h4 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: "bold" }}>
                        {site.SiteDepartment}
                      </h4>

                      <p style={{ margin: "5px 0" }}>
                        <strong>📍 Location:</strong><br />
                        {site.City}, {site.State} {site.Country}
                      </p>

                      {site["Application.Due.Date"] && (
                        <p style={{ margin: "5px 0" }}>
                          <strong>📅 Due:</strong><br />
                          {site["Application.Due.Date"]}
                        </p>
                      )}

                      {site.URL && (
                        <a
                          href={site.URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            marginTop: "10px",
                            backgroundColor: "#007aff",
                            color: "#ffffff",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "500"
                          }}
                        >
                          View Program Info
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Footer: count of valid sites */}
        <div className="mt-4 text-center text-gray-400 text-sm">
          Showing {
            markersData.filter(s =>
              !isNaN(parseFloat(s.lat_jittered)) &&
              !isNaN(parseFloat(s.long_jittered))
            ).length
          } sites
        </div>
      </div>
    </div>
  );
};

export default MapTab;
