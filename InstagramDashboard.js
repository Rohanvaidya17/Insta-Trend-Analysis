import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Search, TrendingUp, Hash } from 'lucide-react';
import instagramService from '../services/mockInstagramService';

const InstagramDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [timeData, setTimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle search
  useEffect(() => {
    const searchHashtags = async () => {
      if (searchTerm.length > 0) {
        try {
          const results = await instagramService.searchHashtag(searchTerm);
          setSearchResults(results);
        } catch (err) {
          setError('Error searching hashtags');
          console.error(err);
        }
      } else {
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(searchHashtags, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleHashtagSelect = async (tag) => {
    setIsLoading(true);
    setError(null);
    try {
      const hashtagMetrics = await instagramService.getHashtagMetrics(tag);
      setMetrics(hashtagMetrics.metrics);
      setTimeData(hashtagMetrics.metrics.time_engagement);
      setSelectedHashtag(tag);

      const unsubscribe = await instagramService.subscribeToUpdates(tag, (update) => {
        setTimeData(prevData => {
          const newData = [...prevData];
          const currentHour = new Date(update.timestamp).getHours();
          const index = newData.findIndex(d => parseInt(d.hour) === currentHour);
          if (index !== -1) {
            newData[index] = {
              ...newData[index],
              engagement: update.engagement
            };
          }
          return newData;
        });
      });

      return () => unsubscribe();
    } catch (err) {
      setError('Error fetching hashtag metrics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 bg-black border-b border-gray-800 px-4 py-2 flex items-center gap-2">
        <div className="text-xl font-bold">Instagram Analytics</div>
      </div>

      {/* Search Section */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hashtags..."
            className="w-full pl-10 pr-4 py-3 bg-gray-900 text-white rounded-full border border-gray-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-gray-900 rounded-lg border border-gray-800">
            {searchResults.map((result) => (
              <button
                key={result.tag}
                onClick={() => handleHashtagSelect(result.tag)}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-800 border-b border-gray-800 last:border-none"
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-400" />
                  <span>#{result.tag}</span>
                </div>
                <div className="text-gray-400 text-sm">
                  {(result.posts / 1000000).toFixed(1)}M posts • 
                  {result.engagement_rate}% Eng
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="p-4 text-center">Loading...</div>
      )}

      {error && (
        <div className="p-4 text-red-400 text-center">{error}</div>
      )}

      {selectedHashtag && metrics && (
        <>
          {/* Hashtag Stats */}
          <div className="p-4 bg-gray-900 mx-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-bold">#{selectedHashtag}</h3>
              </div>
              <span className="text-blue-400">{metrics.engagement_rate}% Eng Rate</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-sm">
                <div className="text-gray-400">Total Posts</div>
                <div className="font-bold">{(metrics.total_posts / 1000000).toFixed(1)}M</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-400">Viral Potential</div>
                <div className="font-bold">{metrics.viral_potential.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Engagement Chart */}
          <div className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-bold">Engagement by Hour</h2>
            </div>
            <div className="h-48 bg-gray-900 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fill: '#9CA3AF' }} 
                    stroke="#4B5563"
                    fontSize={10}
                  />
                  <YAxis 
                    tick={{ fill: '#9CA3AF' }} 
                    stroke="#4B5563"
                    fontSize={10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="engagement" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Velocity Metrics */}
          <div className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <h2 className="text-xl font-bold">Performance Metrics</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(metrics.velocity_metrics).map(([period, data]) => (
                <div key={period} className="bg-gray-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-400">{period} Performance</div>
                  <div className="text-xl font-bold text-green-400">
                    {data.velocity.toFixed(0)} eng/hr
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InstagramDashboard;