import React from 'react';

// A lightweight component to render formatted text from AI
export const MarkdownViewer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  return (
    <div className="prose prose-invert prose-sm max-w-none text-slate-300">
      {content.split('\n').map((line, i) => {
        // Simple code block detection for one-line (not perfect but helpful)
        // Note: For full block code rendering we would need a parser.
        // This simple splitter is limited. However, most AI returns code in ``` blocks.
        // A simple state machine parser would be better but keeping it simple as requested.
        
        // Let's at least render ``` lines distinctly
        if (line.trim().startsWith('```')) {
             return <div key={i} className="h-4 bg-slate-800 my-1 rounded"></div>; // Placeholder for start/end
        }
        
        // Detect HTML-like lines roughly for visual distinction
        const isCode = line.trim().startsWith('<') || line.includes('const ') || line.includes('function');

        return (
          <div key={i} className={`min-h-[1.5em] ${line.startsWith('-') ? 'pl-4' : ''}`}>
             {line.startsWith('###') ? (
                 <h3 className="text-lg font-bold text-indigo-300 mt-4 mb-2">{line.replace(/^###\s/, '')}</h3>
             ) : line.startsWith('##') ? (
                 <h2 className="text-xl font-bold text-indigo-300 mt-6 mb-3 border-b border-slate-700 pb-2">{line.replace(/^##\s/, '')}</h2>
             ) : (
                <span className={isCode ? 'font-mono text-emerald-400' : ''}>
                    {line.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-white">{part.slice(2, -2)}</strong>;
                        }
                        if (part.startsWith('`') && part.endsWith('`')) {
                            return <code key={j} className="bg-slate-800 text-purple-300 px-1 rounded">{part.slice(1, -1)}</code>;
                        }
                        return part;
                    })}
                </span>
             )}
          </div>
        );
      })}
    </div>
  );
};