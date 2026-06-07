import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ 
  formula, 
  displayMode = false,
  className = '' 
}) => {
  // Use generic HTMLElement reference to support both div and span tags dynamically
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(formula, containerRef.current, {
          displayMode,
          throwOnError: false,
          trust: true,
          strict: false
        });
      } catch (err) {
        console.error('KaTeX rendering error:', err);
        containerRef.current.textContent = formula; // Fallback to raw text
      }
    }
  }, [formula, displayMode]);

  if (displayMode) {
    return (
      <div 
        ref={containerRef as React.RefObject<HTMLDivElement>} 
        className={`math-wrapper ${className}`}
      />
    );
  }

  return (
    <span 
      ref={containerRef as React.RefObject<HTMLSpanElement>} 
      className={`inline-math-container ${className}`}
    />
  );
};

interface MixedTextRendererProps {
  text: string;
  className?: string;
}

export const MixedTextRenderer: React.FC<MixedTextRendererProps> = ({ 
  text, 
  className = '' 
}) => {
  if (!text) return null;

  // Split by $$formula$$ or $formula$
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2);
          return <MathRenderer key={index} formula={formula} displayMode={true} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1);
          return <MathRenderer key={index} formula={formula} displayMode={false} />;
        } else {
          return (
            <span key={index} className="whitespace-pre-line">
              {part}
            </span>
          );
        }
      })}
    </span>
  );
};
