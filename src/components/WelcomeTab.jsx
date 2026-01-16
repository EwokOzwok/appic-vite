import { useState, useEffect } from 'react';
import { Coffee, Sparkles, Download, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

const WelcomeTab = ({ 
  appicData,
  recommendations,
  setRecommendations,
  programType,
  setProgramType,
  degreeType,
  setDegreeType,
  siteType,
  setSiteType,
  selectedSites,
  setSelectedSites,
  includeUserRecs,
  setIncludeUserRecs,
  showRecommendations,
  setShowRecommendations

  }) => {
  const [filteredSites, setFilteredSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize Google Tag Manager
  useEffect(() => {
    // GTM initialization
    if (!window.dataLayer) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
      
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-K9W5NBKN';
      document.head.appendChild(script);
    }
  }, []);

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
      {/* Google Tag Manager noscript */}
      <noscript>
        <iframe 
          src="https://www.googletagmanager.com/ns.html?id=GTM-K9W5NBKN"
          height="0" 
          width="0" 
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>

      {/* Hero Card */}
      <div className="glass rounded-2xl p-8 shadow-2xl">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Find Your Perfect APPIC Internship Sites
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            The APPIC Site Recommender uses advanced algorithms to analyze your preferred sites 
            and recommend the top 10 internship sites that best match your criteria.
          </p>
          
          {/* Sponsorship Message */}
          <div className="pt-6 space-y-4">
            <p className="text-gray-300 text-sm">
              🎓 <strong>Free for All Doctoral Students</strong> — Made possible by our sponsor
            </p>
            
            {/* Banner Ad - Direct HTML */}
            <div className="max-w-3xl mx-auto">
              <a 
                href="https://www.cliniciansfirst.org" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block no-underline w-full max-w-[728px] mx-auto cursor-pointer"
                onClick={() => {
                  // Google Tag Manager tracking
                  if (window.dataLayer) {
                    window.dataLayer.push({
                      'event': 'banner_click',
                      'banner_name': 'CliniciansFirst'
                    });
                  }
                }}
              >
                <div className="w-full bg-gradient-to-r from-[#2B6CB0] to-[#265E9A] rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.15)] relative transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-[0_15px_50px_rgba(0,0,0,0.25)]">
                  <div className="flex items-center justify-between p-5 md:p-[20px_30px] relative z-[2] flex-col md:flex-row text-center md:text-left">
                    {/* Left Section */}
                    <div className="flex-1 mb-5 md:mb-0">
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-[10px] px-3.5 py-1.5 rounded-[20px] text-[11px] font-semibold text-white uppercase tracking-wide mb-3 border border-white/30">
                        <span className="inline-block">✨</span>
                        <span>APPIC Recommender Sponsored by</span>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-2.5 justify-center md:justify-start">
                        <img 
                          src="https://cliniciansfirst.org/wp-content/uploads/2025/06/cropped-site_icon.png" 
                          alt="CliniciansFirst Logo" 
                          className="h-9 w-auto"
                        />
                        <span className="font-bold text-base text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          CliniciansFirst
                        </span>
                      </div>

                      <h1 className="text-xl font-bold text-white leading-[1.3] mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Ethical AI Note Generation<br/>
                        for Internship & Beyond
                      </h1>
                      
                      <p className="text-[13px] text-white/95 leading-[1.5] mb-1">
                        <span className="font-semibold text-white">APA Code-Aligned</span> AI note & assessment reports.<br/>
                        Built by psychologists, for psychologists.
                      </p>

                      <div className="flex gap-3 mt-1.5 justify-center md:justify-start">
                        <div className="flex items-center gap-1 text-[10px] text-white/85 font-semibold">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                          Beyond HIPAA
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-white/85 font-semibold">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          APA Ethics
                        </div>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex flex-col items-center gap-2.5">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open('https://ng.cliniciansfirst.org/create-account', '_blank');
                        }}
                        className="inline-flex items-center gap-2 bg-white text-[#2B6CB0] px-7 py-3.5 rounded-[50px] text-base font-bold shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_6px_25px_rgba(0,0,0,0.25)] hover:bg-[#f0f8ff]"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        Start Free Trial
                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </button>
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-[11px] text-white/90 font-semibold">
                          30 Days Free • No Credit Card
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-[10px] px-2.5 py-1 rounded-xl text-[10px] text-white/95 border border-white/25">
                          <span>Use code</span>
                          <span className="font-bold text-white tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>INTERN</span>
                          <span>for 50% off 6 months</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Animated background elements */}
                  <div className="absolute inset-0 z-[1] opacity-50 animate-pulse" style={{
                    background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)',
                    animationDuration: '8s'
                  }}/>
                </div>
              </a>
            </div>
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