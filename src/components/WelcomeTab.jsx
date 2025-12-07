import { useState, useEffect } from 'react';
import { Coffee, Sparkles, Download, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

const WelcomeTab = ({ appicData, recommendations, setRecommendations }) => {
  const [programType, setProgramType] = useState('');
  const [degreeType, setDegreeType] = useState('');
  const [siteType, setSiteType] = useState('');
  const [selectedSites, setSelectedSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [includeUserRecs, setIncludeUserRecs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);


  // Detect the correct site name column
  const getSiteNameColumn = () => {
    if (appicData.length === 0) return null;
    const firstRow = appicData[0];
    if ('Site / Department' in firstRow) return 'Site / Department';
    if ('Site...Department' in firstRow) return 'Site...Department';
    if ('SiteDepartment' in firstRow) return 'SiteDepartment';
    return Object.keys(firstRow).find(key => key.toLowerCase().includes('site'));
  };

  // Detect APPIC Number column
  const getAPPICColumn = () => {
    if (appicData.length === 0) return null;
    const firstRow = appicData[0];
    if ('APPIC Number' in firstRow) return 'APPIC Number';
    if ('APPIC.Number' in firstRow) return 'APPIC.Number';
    if ('APPICNumber' in firstRow) return 'APPICNumber';
    return 'APPIC Number';
  };

  const siteNameColumn = getSiteNameColumn();
  const appicColumn = getAPPICColumn();

  const siteTypeMapping = {
    'VAMC': 'VAMC',
    'UCC': 'UCC',
    'Consortia': 'Consortia',
    'Community Mental Health': 'CommunityMH',
    'Hospitals (Non-VA)': 'Hospitals',
    'Child/Adolescent': 'ChildAdolescent'
  };

  useEffect(() => {
    console.log('appicData sample:', appicData[0]);
    console.log('Detected site column:', siteNameColumn);
    console.log('Detected APPIC column:', appicColumn);
  }, [appicData]);

  useEffect(() => {
    if (!programType || !degreeType) {
      setFilteredSites([]);
      return;
    }

    let filtered = appicData.filter(site => {
      const matchesProgram = site[programType] === 1;
      const matchesDegree = site[degreeType] === 1;
      
      if (!siteType) {
        return matchesProgram && matchesDegree;
      }
      
      const siteCol = siteTypeMapping[siteType];
      const matchesSiteType = site[siteCol] === 1;
      
      return matchesProgram && matchesDegree && matchesSiteType;
    });

    console.log('Filtered sites:', filtered.length);
    setFilteredSites(filtered);
    setSelectedSites([]);
  }, [programType, degreeType, siteType, appicData]);

  const handleSiteToggle = (siteName) => {
    setSelectedSites(prev => {
      if (prev.includes(siteName)) {
        return prev.filter(s => s !== siteName);
      } else {
        return [...prev, siteName];
      }
    });
  };

  const handleGetRecommendations = async () => {
    if (selectedSites.length < 2) {
      setError('Please select at least 2 sites');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const appicNumbers = selectedSites.map(siteName => {
        const site = appicData.find(s => s[siteNameColumn] === siteName);
        return site?.[appicColumn];
      }).filter(Boolean);

      console.log('Sending APPIC numbers:', appicNumbers);

      const siteTypeValue = siteType ? siteTypeMapping[siteType] : 'AllSites';

      const response = await axios.post('https://evanozmat.com/recommend', {
        appic_numbers: appicNumbers,
        program_type: programType,
        degree_type: degreeType,
        site_type: siteTypeValue,
        user_rec_status: includeUserRecs ? 1 : 0
      });

      setRecommendations(response.data);
      setShowRecommendations(true);
      setLoading(false);
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Failed to get recommendations. Please try again.');
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!recommendations) return;

    const csv = [
      Object.keys(recommendations[0]).join(','),
      ...recommendations.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `APPIC_Recommendations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredAndSearched = filteredSites.filter(site => 
    site[siteNameColumn]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (recommendations?.length > 0) {
    console.log('Single recommendation row:', recommendations[0]);
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Hero Card */}
      <div className="glass rounded-2xl p-8 shadow-2xl">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Find Your Perfect APPIC Internship Site
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            The APPIC Site Recommender uses advanced algorithms to analyze your preferred sites 
            and recommend the top 10 internship sites that best match your criteria.
          </p>
          
          {/* Coffee Button */}
          <div className="pt-4">
            <p className="text-gray-400 mb-3">Found this helpful? Consider buying me a coffee!</p>
            <a
              href="https://www.buymeacoffee.com/Ewokozwok"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <Coffee size={20} />
              Buy Me A Coffee
            </a>
          </div>
        </div>
      </div>

      {/* Selection Card */}
      {!showRecommendations && (
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Sparkles size={24} className="text-blue-400" />
            Configure Your Search
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Program Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Program Type *
              </label>
              <select
                value={programType}
                onChange={(e) => setProgramType(e.target.value)}
                className="w-full bg-dark-elevated border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
              >
                <option value="">Select one</option>
                <option value="Clinical">Clinical</option>
                <option value="Counseling">Counseling</option>
                <option value="School">School</option>
              </select>
            </div>

            {/* Degree Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Degree Type *
              </label>
              <select
                value={degreeType}
                onChange={(e) => setDegreeType(e.target.value)}
                className="w-full bg-dark-elevated border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
              >
                <option value="">Select one</option>
                <option value="PhD">PhD</option>
                <option value="PsyD">PsyD</option>
                <option value="EdD">EdD</option>
              </select>
            </div>

            {/* Site Type */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Site Type (Optional)
              </label>
              <select
                value={siteType}
                onChange={(e) => setSiteType(e.target.value)}
                className="w-full bg-dark-elevated border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
              >
                <option value="">All Sites</option>
                <option value="VAMC">VAMC</option>
                <option value="UCC">UCC</option>
                <option value="Consortia">Consortia</option>
                <option value="Community Mental Health">Community Mental Health</option>
                <option value="Hospitals (Non-VA)">Hospitals (Non-VA)</option>
                <option value="Child/Adolescent">Child/Adolescent</option>
              </select>
            </div>

            {/* Site Selection - Better UI */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Sites (Choose at least 2) *
              </label>
              
              {/* Search box */}
              {filteredSites.length > 0 && (
                <input
                  type="text"
                  placeholder="Search sites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-dark-elevated border border-gray-700 rounded-xl px-4 py-2 text-white mb-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none"
                />
              )}

              {/* Selected sites pills */}
              {selectedSites.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 p-3 bg-dark-elevated rounded-xl">
                  {selectedSites.map(siteName => (
                    <div
                      key={siteName}
                      className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      <span className="max-w-xs truncate">{siteName}</span>
                      <button
                        onClick={() => handleSiteToggle(siteName)}
                        className="hover:bg-blue-700 rounded p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Clickable list instead of multi-select */}
              <div 
                className="w-full bg-dark-elevated border border-gray-700 rounded-xl max-h-[300px] overflow-y-auto"
              >
                {!programType || !degreeType ? (
                  <div className="p-4 text-center text-gray-500">
                    Please select program type and degree type first
                  </div>
                ) : filteredAndSearched.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No sites found
                  </div>
                ) : (
                  filteredAndSearched.map((site) => (
                    <div
                      key={site[appicColumn]}
                      onClick={() => handleSiteToggle(site[siteNameColumn])}
                      className={`px-4 py-3 cursor-pointer border-b border-gray-800 hover:bg-dark-card transition-colors ${
                        selectedSites.includes(site[siteNameColumn]) ? 'bg-blue-600/20 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedSites.includes(site[siteNameColumn])}
                          onChange={() => {}}
                          className="w-4 h-4 rounded bg-dark-elevated border-gray-700 text-blue-400"
                        />
                        <span className="text-white">{site[siteNameColumn]}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <p className="text-sm text-gray-500 mt-2">
                {selectedSites.length} site(s) selected. Click sites to select/deselect.
              </p>
            </div>

            {/* User Recommendations Toggle */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUserRecs}
                  onChange={(e) => setIncludeUserRecs(e.target.checked)}
                  className="w-5 h-5 rounded bg-dark-elevated border-gray-700 text-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
                <span className="text-gray-300">Include User Recommendations</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-xl">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGetRecommendations}
            disabled={!programType || !degreeType || loading}
            className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Getting Recommendations...
              </span>
            ) : (
              'Get Site Recommendations!'
            )}
          </button>
        </div>
      )}

      {/* Results Card */}
      {showRecommendations && recommendations?.length > 0 && (
        <div className="glass rounded-2xl p-8 shadow-2xl fade-in">          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Your Recommended Sites</h3>
              <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => {
                  setRecommendations([]);
                  setShowRecommendations(false);
                  setProgramType('');
                  setDegreeType('');
                  setSiteType('');
                  setSelectedSites([]);
                  setFilteredSites([]);
                  setIncludeUserRecs(false);
                  setSearchTerm('');
                  setError('');
                }}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-all font-semibold"
              >
                Start Over
              </button>

              <button
                onClick={downloadCSV}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-all font-semibold"
              >
                <Download size={18} />
                Download CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Recommendation</th>
                  <th>Site Name</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Application Due Date</th>
                  <th>Website</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((rec, index) => (
                  <tr key={index}>
                    <td>{rec.similarity_score === "User Suggested" ? 'User' : ''}</td>
                    <td className="font-medium">{rec[siteNameColumn]}</td>
                    <td>{rec.City}</td>
                    <td>{rec.State}</td>
                    <td>{rec['Application Due Date']}</td>
                    <td>
                      {typeof rec.web_data === 'string' && rec.web_data.match(/https?:\/\/[^\s]+/)?.[0] ? (
                        <a
                          href={rec.web_data.match(/https?:\/\/[^\s]+/)[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          View Site
                        </a>
                      ) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeTab;