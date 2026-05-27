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
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div 
      ref={containerRef} 
      className={`math-wrapper ${className}`}
    />
  );
};
