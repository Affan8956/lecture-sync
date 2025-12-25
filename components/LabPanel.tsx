
import React, { useState, useEffect } from 'react';
import { LabTool, LabAsset } from '../types';
import { generateLabContent } from '../services/geminiService';
import FileUpload from './FileUpload';
import SummaryView from './SummaryView';
import QuizView from './QuizView';
import SlideView from './SlideView';

interface LabPanelProps {
  onSaveAsset: (asset: Omit<LabAsset, 'id' | 'timestamp' | 'userId'>) => void;
  viewingAsset?: LabAsset | null;
}

const LabPanel: React.FC<LabPanelProps> = ({ onSaveAsset, viewingAsset }) => {
  const [tool, setTool] = useState<LabTool>('summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  
  // Cache results per tool for the current active file
  const [resultsCache, setResultsCache] = useState<Record<LabTool, any>>({
    summary: null,
    quiz: null,
    slides: null
  });

  // Handle viewing an asset from the vault - more robust sync
  useEffect(() => {
    if (viewingAsset) {
      setTool(viewingAsset.type);
      setResultsCache(prev => {
        const newCache = { ...prev };
        if (viewingAsset.type === 'summary') {
          newCache.summary = { title: viewingAsset.title, summary: viewingAsset.content };
        } else if (viewingAsset.type === 'quiz') {
          newCache.quiz = { title: viewingAsset.title, quiz: viewingAsset.content };
        } else if (viewingAsset.type === 'slides') {
          newCache.slides = { title: viewingAsset.title, slides: viewingAsset.content };
        }
        return newCache;
      });
    }
  }, [viewingAsset]);

  const handleProcess = async (file: File) => {
    setLoading(true);
    setError(null);
    setLastFile(file);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      const data = await generateLabContent({ base64, mimeType: file.type }, tool);
      
      const newCache = { ...resultsCache, [tool]: data };
      setResultsCache(newCache);
      
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

  const handleToolSwitch = async (t: LabTool) => {
    setTool(t);
    setError(null);
    
    // If we have a file but no result for this tool, automatically trigger generation
    if (lastFile && !resultsCache[t]) {
      handleProcess(lastFile);
    }
  };

  const activeResult = resultsCache[tool];

  const downloadData = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto w-full">
        <header className="mb-10 text-center no-print">
          <h1 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Knowledge Lab
          </h1>
          <p className="text-slate-500">Extract structured intelligence from your documents and presentations.</p>
        </header>

        {/* Tool Selector */}
        <div className="flex justify-center gap-4 mb-10 no-print">
          {(['summary', 'quiz', 'slides'] as LabTool[]).map((t) => (
            <button
              key={t}
              onClick={() => handleToolSwitch(t)}
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

        {!activeResult && !loading && (
          <div className="animate-fadeIn no-print">
            <div className="mb-4 text-center">
              <p className="text-sm text-slate-500 italic">
                {lastFile ? `Active File: ${lastFile.name}` : "Upload a PDF, Text or Audio file to begin."}
              </p>
            </div>
            <FileUpload onUpload={handleProcess} isLoading={loading} />
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 no-print">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-emerald-400 font-bold animate-pulse uppercase tracking-widest text-xs">StudyEasierAI is processing...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 text-center mb-8 no-print">
            <i className="fas fa-exclamation-triangle mr-2"></i> {error}
          </div>
        )}

        {activeResult && !loading && (
          <div className="animate-fadeIn space-y-8">
            <div className="flex justify-between items-center bg-[#151515] p-4 rounded-2xl border border-slate-800 no-print">
              <p className="text-xs text-slate-500">
                <i className="fas fa-file mr-2"></i> Content: <span className="text-slate-300 font-bold">{activeResult.title || viewingAsset?.title}</span>
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => downloadData(activeResult, `${tool}_asset.json`)}
                  className="text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-2 font-bold text-xs"
                >
                  <i className="fas fa-download"></i> Download JSON
                </button>
                <button 
                  onClick={() => {
                    setResultsCache({ summary: null, quiz: null, slides: null });
                    setLastFile(null);
                  }}
                  className="text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-2 font-bold text-xs"
                >
                  <i className="fas fa-trash"></i> Reset
                </button>
              </div>
            </div>
            
            {tool === 'summary' && <SummaryView summary={activeResult.summary} title={activeResult.title} />}
            {tool === 'quiz' && <QuizView quiz={activeResult.quiz} />}
            {tool === 'slides' && <SlideView slides={activeResult.slides} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabPanel;
