import React, { useEffect, useRef } from 'react';
import { Place, LocationCoords } from '../types';

declare global {
  interface Window {
    L: any;
  }
}

interface InteractiveMapProps {
  places: Place[];
  userLocation?: LocationCoords;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ places, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersCluster = useRef<any>(null);
  const userMarker = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Initialize map if not already present
    if (!mapInstance.current) {
      // Default center Seoul
      const defaultCenter = userLocation 
        ? [userLocation.latitude, userLocation.longitude] 
        : [37.5665, 126.9780];
        
      mapInstance.current = window.L.map(mapRef.current).setView(defaultCenter, 11);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    }
  }, []); // Run once on mount

  // Handle Markers and Clusters
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    // Cleanup old layers
    if (markersCluster.current) {
      mapInstance.current.removeLayer(markersCluster.current);
    }

    // Create cluster group
    markersCluster.current = window.L.markerClusterGroup();

    // Add Place Markers
    places.forEach(place => {
      if (place.latitude && place.longitude) {
        const icon = window.L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md transition-transform duration-200 hover:scale-150 cursor-pointer"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        const marker = window.L.marker([place.latitude, place.longitude], { icon: icon })
          .bindPopup(`
            <div class="p-1 min-w-[200px]">
              <h3 class="font-bold text-base text-gray-900 mb-1">${place.name}</h3>
              <p class="text-sm text-gray-600 line-clamp-3">${place.description}</p>
              <div class="flex justify-between items-center mt-3">
                ${place.price ? `<span class="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">${place.price}</span>` : '<span></span>'}
                <a href="https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors !text-white no-underline">
                  Get Directions
                </a>
              </div>
            </div>
          `);
        markersCluster.current.addLayer(marker);
      }
    });

    mapInstance.current.addLayer(markersCluster.current);

    // Update bounds
    const validPlaces = places.filter(p => p.latitude && p.longitude);
    if (validPlaces.length > 0) {
      const bounds = window.L.latLngBounds(validPlaces.map(p => [p.latitude, p.longitude]));
      if (userLocation) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
      }
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [places, userLocation]);

  // Handle User Location Marker
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;

    if (userMarker.current) {
      mapInstance.current.removeLayer(userMarker.current);
      userMarker.current = null;
    }

    if (userLocation) {
      const userIcon = window.L.divIcon({
        className: 'user-location-icon',
        html: `<div style="background-color: #4F46E5; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.2);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      userMarker.current = window.L.marker(
        [userLocation.latitude, userLocation.longitude],
        { icon: userIcon, zIndexOffset: 1000 }
      ).bindPopup("You are here").addTo(mapInstance.current);
    }
  }, [userLocation]);

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm z-0">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};