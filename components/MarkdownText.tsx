import React from 'react';

interface MarkdownTextProps {
  content: string;
  className?: string;
}

/**
 * A lightweight markdown renderer to avoid heavy dependencies.
 * Handles basic bolding, lists, and paragraphs.
 * 
 * Text colors have been removed from inner elements to allow inheritance 
 * from parent containers (crucial for Chat styling).
 */
export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Simple parsing logic
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{parseInline(line.replace('### ', ''))}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-5 mb-3">{parseInline(line.replace('## ', ''))}</h2>;
      }
      
      // Bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={index} className="ml-4 list-disc mb-1">
            {parseInline(line.replace(/^[\*\-]\s+/, ''))}
          </li>
        );
      }
      
      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <li key={index} className="ml-4 list-decimal mb-1">
             {parseInline(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }

      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }

      // Paragraphs
      return <p key={index} className="mb-2 leading-relaxed">{parseInline(line)}</p>;
    });
  };

  const parseInline = (text: string) => {
    // Bold: **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`text-sm md:text-base ${className}`}>
      {parseMarkdown(content)}
    </div>
  );
};