
import React from 'react';

interface SummaryViewProps {
  summary: string;
  title: string;
}

const SummaryView: React.FC<SummaryViewProps> = ({ summary, title }) => {
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-emerald-400">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_summary.md`;
    a.click();
  };

  const formatSummary = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return <h1 key={i} className="text-3xl font-extrabold mt-8 mb-6 text-white border-b border-slate-800 pb-4 tracking-tight">{formatText(trimmed.replace('# ', ''))}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-emerald-400 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block"></span>
          {formatText(trimmed.replace('## ', ''))}
        </h2>;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={i} className="ml-6 list-none mb-3 text-slate-300 relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-emerald-500 before:font-bold before:text-xl before:-top-1 leading-relaxed">
            {formatText(trimmed.substring(2))}
          </li>
        );
      }
      if (trimmed === '') return <div key={i} className="h-4" />;
      return <p key={i} className="mb-4 leading-relaxed text-slate-300 text-lg">{formatText(line)}</p>;
    });
  };

  return (
    <div className="bg-[#121212] rounded-3xl shadow-2xl border border-slate-800 p-8 md:p-14 max-w-4xl mx-auto my-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 border-b border-slate-800 pb-10">
        <div>
          <span className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-3 block">Neural Summary Engine</span>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">{title}</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownload}
            className="bg-slate-800 text-slate-200 px-5 py-3 rounded-2xl hover:bg-slate-700 font-bold transition-all flex items-center gap-2 border border-slate-700"
          >
            <i className="fas fa-file-download"></i> Markdown
          </button>
          <button 
            onClick={() => window.print()} 
            className="bg-emerald-600 text-white px-5 py-3 rounded-2xl hover:bg-emerald-700 font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <i className="fas fa-print"></i> PDF
          </button>
        </div>
      </div>
      <div className="prose prose-invert max-w-none">
        {formatSummary(summary)}
      </div>
      <div className="mt-16 pt-8 border-t border-slate-800 flex items-center justify-between text-slate-600 text-[10px] font-black uppercase tracking-widest">
        <p>Verified Intelligence by StudyEasierAI</p>
        <p>{new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default SummaryView;
