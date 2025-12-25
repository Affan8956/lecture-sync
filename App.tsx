
import React, { useState, useCallback } from 'react';
import { ProcessingStatus, LectureData } from './types';
import { processLectureContent } from './services/geminiService';
import FileUpload from './components/FileUpload';
import SummaryView from './components/SummaryView';
import FlashcardView from './components/FlashcardView';
import QuizView from './components/QuizView';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [lectureData, setLectureData] = useState<LectureData | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz'>('summary');
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    try {
      setStatus(ProcessingStatus.UPLOADING);
      setError(null);
      
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Get just base64 data
        };
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      setStatus(ProcessingStatus.SUMMARIZING); // Representative of the whole AI process
      const result = await processLectureContent(
        { base64, mimeType: file.type },
        file.name
      );

      setLectureData(result);
      setStatus(ProcessingStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const renderStatusMessage = () => {
    switch (status) {
      case ProcessingStatus.UPLOADING:
        return "Reading file...";
      case ProcessingStatus.SUMMARIZING:
        return "AI is analyzing content...";
      case ProcessingStatus.GENERATING_CARDS:
        return "Crafting flashcards...";
      case ProcessingStatus.GENERATING_QUIZ:
        return "Preparing quiz...";
      default:
        return "Processing your lecture...";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <i className="fas fa-graduation-cap text-xl"></i>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                studyeasierAI
              </span>
            </div>
            {lectureData && (
              <button 
                onClick={() => {
                  setLectureData(null);
                  setStatus(ProcessingStatus.IDLE);
                }}
                className="text-gray-500 hover:text-indigo-600 font-medium transition-colors flex items-center gap-2"
              >
                <i className="fas fa-redo-alt"></i> New Upload
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8">
        {!lectureData && status === ProcessingStatus.IDLE && (
          <div className="max-w-3xl mx-auto py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Unlock Knowledge from Every Lecture.
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Transform your lecture recordings and PDFs into clear summaries, 
                smart flashcards, and interactive quizzes in seconds.
              </p>
            </div>
            <FileUpload onUpload={handleUpload} isLoading={false} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-file-alt text-xl"></i>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Smart Summaries</h4>
                <p className="text-slate-500 text-sm">Concise structured notes focused on what matters most.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clone text-xl"></i>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Instant Flashcards</h4>
                <p className="text-slate-500 text-sm">Key terms and definitions automatically extracted for review.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check-square text-xl"></i>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Practice Quizzes</h4>
                <p className="text-slate-500 text-sm">Test your comprehension with AI-generated practice questions.</p>
              </div>
            </div>
          </div>
        )}

        {(status === ProcessingStatus.UPLOADING || 
          status === ProcessingStatus.SUMMARIZING || 
          status === ProcessingStatus.GENERATING_CARDS || 
          status === ProcessingStatus.GENERATING_QUIZ) && (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-brain text-indigo-400 animate-pulse text-2xl"></i>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800">{renderStatusMessage()}</h2>
              <p className="text-slate-500 mt-2">This usually takes about 10-20 seconds...</p>
            </div>
          </div>
        )}

        {status === ProcessingStatus.ERROR && (
          <div className="max-w-xl mx-auto mt-12 p-8 bg-red-50 border border-red-100 rounded-2xl text-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
            <h2 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button 
              onClick={() => setStatus(ProcessingStatus.IDLE)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {lectureData && status === ProcessingStatus.COMPLETED && (
          <div className="animate-fadeIn">
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-10 sticky top-20 z-20 bg-slate-50 py-2">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'summary' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white text-slate-600 hover:bg-gray-50 border border-slate-200'
                }`}
              >
                <i className="fas fa-file-alt"></i> Summary
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'flashcards' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white text-slate-600 hover:bg-gray-50 border border-slate-200'
                }`}
              >
                <i className="fas fa-clone"></i> Flashcards
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'quiz' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white text-slate-600 hover:bg-gray-50 border border-slate-200'
                }`}
              >
                <i className="fas fa-tasks"></i> Quiz
              </button>
            </div>

            {/* Content Area */}
            <div className="transition-all duration-300">
              {activeTab === 'summary' && <SummaryView summary={lectureData.summary} title={lectureData.title} />}
              {activeTab === 'flashcards' && <FlashcardView flashcards={lectureData.flashcards} />}
              {activeTab === 'quiz' && <QuizView quiz={lectureData.quiz} />}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2024 studyeasierAI. Powered by Gemini. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
