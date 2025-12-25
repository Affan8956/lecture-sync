
import React, { useState, useEffect } from 'react';
import { ProcessingStatus, LectureData, User, AuthState } from './types';
import { processLectureContent } from './services/geminiService';
import { getCurrentSession, logout } from './services/authService';
import { getHistory, saveToHistory, deleteFromHistory } from './services/historyService';
import FileUpload from './components/FileUpload';
import SummaryView from './components/SummaryView';
import FlashcardView from './components/FlashcardView';
import QuizView from './components/QuizView';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ user: null, token: null, isAuthenticated: false });
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [lectureData, setLectureData] = useState<LectureData | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz'>('summary');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<LectureData[]>([]);
  const [view, setView] = useState<'landing' | 'dashboard' | 'generator' | 'viewer'>('landing');

  // Load session on mount
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setAuth({ user: session.user, token: session.token, isAuthenticated: true });
      const userHistory = getHistory(session.user.id);
      setHistory(userHistory);
      setView('dashboard');
    }
  }, []);

  const handleAuthComplete = (user: User, token: string) => {
    setAuth({ user, token, isAuthenticated: true });
    setHistory(getHistory(user.id));
    setView('dashboard');
  };

  const handleLogout = () => {
    logout();
    setAuth({ user: null, token: null, isAuthenticated: false });
    setView('landing');
    setLectureData(null);
    setStatus(ProcessingStatus.IDLE);
  };

  const handleUpload = async (file: File) => {
    if (!auth.user) return;
    
    try {
      setStatus(ProcessingStatus.UPLOADING);
      setError(null);
      
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      setStatus(ProcessingStatus.SUMMARIZING);
      const result = await processLectureContent(
        { base64, mimeType: file.type },
        file.name
      );

      const completeData: LectureData = {
        ...result,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        fileType: file.type.includes('pdf') ? 'pdf' : 'audio'
      };

      // Save to history
      saveToHistory(auth.user.id, completeData);
      setHistory(getHistory(auth.user.id));
      
      setLectureData(completeData);
      setActiveTab('summary');
      setStatus(ProcessingStatus.COMPLETED);
      setView('viewer');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during processing.");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleDeleteHistory = (id: string) => {
    if (!auth.user) return;
    deleteFromHistory(auth.user.id, id);
    setHistory(getHistory(auth.user.id));
  };

  const renderStatusMessage = () => {
    switch (status) {
      case ProcessingStatus.UPLOADING: return "Ingesting Lecture Material...";
      case ProcessingStatus.SUMMARIZING: return "Synthesizing Concepts...";
      case ProcessingStatus.GENERATING_CARDS: return "Mapping Knowledge Atoms...";
      case ProcessingStatus.GENERATING_QUIZ: return "Calibrating Assessment...";
      default: return "Processing your lecture...";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
              if (status !== ProcessingStatus.IDLE && status !== ProcessingStatus.COMPLETED && status !== ProcessingStatus.ERROR) return;
              auth.isAuthenticated ? setView('dashboard') : setView('landing');
            }}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <i className="fas fa-graduation-cap text-xl"></i>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                studyeasierAI
              </span>
            </div>

            <div className="flex items-center gap-6">
              {auth.isAuthenticated ? (
                <>
                  <button 
                    onClick={() => {
                       if (status !== ProcessingStatus.IDLE && status !== ProcessingStatus.COMPLETED && status !== ProcessingStatus.ERROR) return;
                       setView('dashboard');
                    }}
                    className={`font-bold transition-colors ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                  >
                    Dashboard
                  </button>
                  <div className="h-6 w-px bg-slate-200"></div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-slate-900">{auth.user?.name}</p>
                      <button onClick={handleLogout} className="text-xs font-medium text-slate-400 hover:text-rose-500">Sign Out</button>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200 overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${auth.user?.name}`} alt="avatar" />
                    </div>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => setView('landing')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Landing/Auth View */}
        {!auth.isAuthenticated && (
          <div className="max-w-5xl mx-auto py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                  Learning <span className="text-indigo-600">Smarter</span>, Not Harder.
                </h1>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  Join thousands of students who transform chaotic lecture notes into structured mastery. One upload, total clarity.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <i className="fas fa-check text-sm"></i>
                    </div>
                    <span className="text-slate-700 font-medium text-lg">AI-Powered Summaries</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <i className="fas fa-check text-sm"></i>
                    </div>
                    <span className="text-slate-700 font-medium text-lg">Auto-generated Flashcards</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <i className="fas fa-check text-sm"></i>
                    </div>
                    <span className="text-slate-700 font-medium text-lg">Interactive Quizzes</span>
                  </div>
                </div>
              </div>
              <AuthForm onAuthComplete={handleAuthComplete} />
            </div>
          </div>
        )}

        {/* Dashboard View */}
        {auth.isAuthenticated && view === 'dashboard' && (
          <Dashboard 
            user={auth.user!} 
            history={history} 
            onSelectItem={(item) => {
              setLectureData(item);
              setView('viewer');
              setActiveTab('summary');
            }}
            onNewUpload={() => {
              setStatus(ProcessingStatus.IDLE);
              setView('generator');
            }}
            onDeleteHistory={handleDeleteHistory}
          />
        )}

        {/* Generator View */}
        {auth.isAuthenticated && view === 'generator' && status === ProcessingStatus.IDLE && (
          <div className="max-w-2xl mx-auto py-12 text-center animate-fadeIn">
            <button 
              onClick={() => setView('dashboard')}
              className="mb-8 text-slate-400 hover:text-indigo-600 flex items-center gap-2 mx-auto transition-colors"
            >
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </button>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Create New Study Materials</h2>
            <p className="text-slate-500 mb-8 text-lg">Upload your lecture PDF or audio file to begin the magic.</p>
            <FileUpload onUpload={handleUpload} isLoading={false} />
          </div>
        )}

        {/* Loading States */}
        {status !== ProcessingStatus.IDLE && status !== ProcessingStatus.COMPLETED && status !== ProcessingStatus.ERROR && (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-pulse">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-brain text-indigo-400 text-2xl"></i>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800">{renderStatusMessage()}</h2>
              <p className="text-slate-500 mt-2">Deep reasoning in progress. This may take a minute...</p>
            </div>
          </div>
        )}

        {/* Error View */}
        {status === ProcessingStatus.ERROR && (
          <div className="max-w-xl mx-auto mt-12 p-10 bg-white shadow-xl border border-red-50 rounded-3xl text-center animate-fadeIn">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Analysis Failed</h2>
            <p className="text-slate-500 mb-8">{error}</p>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setStatus(ProcessingStatus.IDLE);
                  setView('generator');
                }}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
              >
                Try Again
              </button>
              <button 
                onClick={() => setView('dashboard')}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Result Viewer View */}
        {auth.isAuthenticated && view === 'viewer' && lectureData && (
          <div className="animate-fadeIn">
            {/* Header & Back Action */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
               <button 
                  onClick={() => setView('dashboard')}
                  className="text-slate-500 hover:text-indigo-600 font-bold transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-arrow-left"></i> Dashboard
                </button>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded uppercase">Analysis Ready</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-10 sticky top-20 z-20 bg-slate-50/90 backdrop-blur-sm py-2 px-4 rounded-full border border-slate-100 shadow-sm max-w-fit mx-auto">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'summary' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-600 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-file-alt"></i> Summary
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'flashcards' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-600 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-clone"></i> Flashcards
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'quiz' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-slate-600 hover:bg-gray-100'
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
      <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
             <i className="fas fa-graduation-cap text-indigo-600"></i>
             <span className="font-bold text-slate-900">studyeasierAI</span>
           </div>
          <p className="text-slate-400 text-sm">© 2024 studyeasierAI. Built with Gemini 2.0. Learning made human-friendly.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
