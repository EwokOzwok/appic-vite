import { useState, useEffect } from 'react';
import { Home, MapPin } from 'lucide-react';
import WelcomeTab from './components/WelcomeTab';
import MapTab from './components/MapTab';
import { parseCSV } from './utils/csvParser';

function App() {
  const [activeTab, setActiveTab] = useState('welcome');
  const [appicData, setAppicData] = useState([]);
  const [appicGeoData, setAppicGeoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appic, appicGeo] = await Promise.all([
          parseCSV('/src/data/appic.csv'),
          parseCSV('/src/data/appicgeo.csv')
        ]);
        
        setAppicData(appic);
        setAppicGeoData(appicGeo);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading APPIC Site Recommender...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            APPIC Site Recommender
          </h1>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="glass border-b border-gray-800 sticky top-[73px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => setActiveTab('welcome')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative ${
                activeTab === 'welcome'
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Home size={20} />
              <span>Home</span>
              {activeTab === 'welcome' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative ${
                activeTab === 'map'
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MapPin size={20} />
              <span>Map</span>
              {activeTab === 'map' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'welcome' && (
          <WelcomeTab
            appicData={appicData}
            recommendations={recommendations}
            setRecommendations={setRecommendations}
          />
        )}
        {activeTab === 'map' && (
          <MapTab
            appicGeoData={appicGeoData}
            recommendations={recommendations}
          />
        )}
      </main>
    </div>
  );
}

export default App;