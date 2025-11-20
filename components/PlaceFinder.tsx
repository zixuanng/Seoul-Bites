import React, { useState, useEffect } from 'react';
import { searchPlaces } from '../services/gemini';
import { GroundingMetadata, LocationCoords, Place } from '../types';
import { MarkdownText } from './MarkdownText';
import { GroundingSources } from './GroundingSources';
import { InteractiveMap } from './InteractiveMap';

export const PlaceFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string>('');
  const [resultMetadata, setResultMetadata] = useState<GroundingMetadata | undefined>(undefined);
  const [places, setPlaces] = useState<Place[]>([]);
  const [location, setLocation] = useState<LocationCoords | undefined>(undefined);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          setLocationError("Location access denied. 'Nearest' search may be less accurate.");
        }
      );
    }
  }, []);

  const processResponse = (text: string, metadata?: GroundingMetadata) => {
    // Extract JSON block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let foundPlaces: Place[] = [];
    let displayText = text;

    if (jsonMatch) {
      try {
        foundPlaces = JSON.parse(jsonMatch[1]);
        // Remove the JSON block from the display text
        displayText = text.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.error("Failed to parse places JSON", e);
      }
    }

    setPlaces(foundPlaces);
    setResultText(displayText);
    setResultMetadata(metadata);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setPlaces([]); // Clear previous places
    setResultText('');
    setResultMetadata(undefined);
    
    const searchQuery = query.toLowerCase().includes('seoul') ? query : `${query} in Seoul, Korea`;
    
    const response = await searchPlaces(searchQuery, location);
    processResponse(response.text, response.groundingMetadata);
    setLoading(false);
  };

  const quickSearch = (term: string) => {
    setQuery(term);
    setLoading(true);
    setPlaces([]);
    setResultText('');
    setResultMetadata(undefined);

    const searchQuery = `${term} in Seoul, Korea`;
    searchPlaces(searchQuery, location).then(response => {
      processResponse(response.text, response.groundingMetadata);
      setLoading(false);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Find Best Eats in Seoul</h2>
        <p className="text-gray-600">Powered by Google Maps & Search Grounding</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex shadow-sm rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
          <input
            type="text"
            className="flex-1 px-4 py-4 outline-none text-gray-700 placeholder-gray-400"
            placeholder="E.g., Best BBQ in Gangnam, Cheapest noodles near me..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-8 font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
          >
            {loading ? 'Searching...' : 'Find'}
          </button>
        </div>
        {locationError && <p className="text-xs text-amber-600 mt-2 ml-1">{locationError}</p>}
      </form>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { label: '🍜 Best Rated Ramen', term: 'Best rated Ramen places' },
          { label: '🍖 K-BBQ', term: 'Top Korean BBQ restaurants' },
          { label: '💸 Cheap Eats', term: 'Cheapest good food' },
          { label: '📍 Nearest Lunch', term: 'Best lunch spots near me' },
          { label: '☕ Trendy Cafes', term: 'Most trendy cafes' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => quickSearch(item.term)}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition-all shadow-sm"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Map Visualization */}
      {(places.length > 0 || location) && (
         <div className="animate-fade-in">
            <InteractiveMap places={places} userLocation={location} />
         </div>
      )}

      {/* Place Listings Cards */}
      {!loading && places.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          {places.map((place, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800">{place.name}</h3>
                {place.price && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{place.price}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{place.description}</p>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-800"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Get Directions
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Results Area */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Scouring the map for delicious spots...</p>
        </div>
      )}

      {resultText && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
          <div className="p-6 md:p-8">
            <div className="prose prose-indigo max-w-none">
              <MarkdownText content={resultText} />
            </div>
            <GroundingSources metadata={resultMetadata} />
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
            <span>Results generated by Gemini 2.5 Flash</span>
            <div className="flex gap-2">
               <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Live Maps Data</span>
               <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Google Search</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};