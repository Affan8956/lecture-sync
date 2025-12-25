
import React, { useState } from 'react';
import { LabTool, LabAsset } from '../types';
import { generateLabContent } from '../services/geminiService';
import FileUpload from './FileUpload';
import SummaryView from './SummaryView';
import QuizView from './QuizView';
import SlideView from './SlideView';

interface LabPanelProps {
  onSaveAsset: (asset: Omit<LabAsset, 'id' | 'timestamp' | 'userId'>) => void;
}

const LabPanel: React.FC<LabPanelProps> = ({ onSaveAsset }) => {
  const [tool, setTool] = useState<LabTool>('summary');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      const data = await generateLabContent({ base64, mimeType: file.type }, tool);
      setResult(data);
      
      // Auto-save to vault
      onSaveAsset({
        title: data.title || file.name,
        type: tool,
        content: data[tool] || data,
        sourceName: file.name
      });
    } catch (err: any) {
      setError(err.message || "Processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto w-full">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Knowledge Lab
          </h1>
          <p className="text-slate-500">Extract structured intelligence from your documents.</p>
        </header>

        {/* Tool Selector */}
        <div className="flex justify-center gap-4 mb-10">
          {(['summary', 'quiz', 'slides'] as LabTool[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTool(t); setResult(null); }}
              className={`px-8 py-3 rounded-2xl font-bold transition-all border ${
                tool === t 
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20' 
                : 'bg-[#151515] border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              <i className={`fas mr-2 ${t === 'summary' ? 'fa-file-alt' : t === 'quiz' ? 'fa-tasks' : 'fa-presentation'}`}></i>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {!result && !loading && (
          <div className="animate-fadeIn">
            <FileUpload onUpload={handleProcess} isLoading={loading} />
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-emerald-400 font-bold animate-pulse">Gemini 3 Pro is analyzing...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 text-center mb-8">
            <i className="fas fa-exclamation-triangle mr-2"></i> {error}
          </div>
        )}

        {result && (
          <div className="animate-fadeIn space-y-8">
            <div className="flex justify-end">
               <button 
                onClick={() => setResult(null)}
                className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 font-bold"
               >
                 <i className="fas fa-redo"></i> Process Another
               </button>
            </div>
            
            {tool === 'summary' && <SummaryView summary={result.summary} title={result.title} />}
            {tool === 'quiz' && <QuizView quiz={result.quiz} />}
            {tool === 'slides' && <SlideView slides={result.slides} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabPanel;
