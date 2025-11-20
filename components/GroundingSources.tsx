import React from 'react';
import { GroundingMetadata } from '../types';

interface GroundingSourcesProps {
  metadata?: GroundingMetadata;
}

export const GroundingSources: React.FC<GroundingSourcesProps> = ({ metadata }) => {
  if (!metadata || !metadata.groundingChunks || metadata.groundingChunks.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Sources & Locations
      </h4>
      <div className="flex flex-wrap gap-2">
        {metadata.groundingChunks.map((chunk, index) => {
          if (chunk.web) {
            return (
              <a
                key={index}
                href={chunk.web.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                {chunk.web.title || "Web Source"}
              </a>
            );
          }
          if (chunk.maps) {
            return (
              <a
                key={index}
                href={chunk.maps.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {chunk.maps.title || "Map Location"}
              </a>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};