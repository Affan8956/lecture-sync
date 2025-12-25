
import React from 'react';

interface SummaryViewProps {
  summary: string;
  title: string;
}

const SummaryView: React.FC<SummaryViewProps> = ({ summary, title }) => {
  // Simple markdown-to-html conversion for headers and lists
  const formatSummary = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-6 mb-4">{line.replace('# ', '')}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-5 mb-3">{line.replace('## ', '')}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('### ', '')}</h3>;
      if (line.startsWith('- ')) return <li key={i} className="ml-5 list-disc mb-1">{line.replace('- ', '')}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="mb-2 leading-relaxed text-gray-700">{line}</p>;
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
        <button 
          onClick={() => window.print()} 
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2"
        >
          <i className="fas fa-print"></i> Print Summary
        </button>
      </div>
      <div className="prose prose-indigo max-w-none text-gray-800">
        {formatSummary(summary)}
      </div>
    </div>
  );
};

export default SummaryView;
