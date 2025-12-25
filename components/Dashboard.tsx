
import React from 'react';
import { LectureData, User } from '../types';

interface DashboardProps {
  user: User;
  history: LectureData[];
  onSelectItem: (item: LectureData) => void;
  onNewUpload: () => void;
  onDeleteHistory: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, history, onSelectItem, onNewUpload, onDeleteHistory }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            Hello, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-lg">
            Ready to master some new material today?
          </p>
        </div>
        <button
          onClick={onNewUpload}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3"
        >
          <i className="fas fa-plus"></i> New Lecture Upload
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 text-xl">
            <i className="fas fa-book-open"></i>
          </div>
          <div className="text-3xl font-black text-slate-900">{history.length}</div>
          <div className="text-slate-500 font-medium">Lectures Analyzed</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 text-xl">
            <i className="fas fa-bolt"></i>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {history.reduce((acc, curr) => acc + curr.flashcards.length, 0)}
          </div>
          <div className="text-slate-500 font-medium">Total Flashcards</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 text-xl">
            <i className="fas fa-question-circle"></i>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {history.reduce((acc, curr) => acc + curr.quiz.length, 0)}
          </div>
          <div className="text-slate-500 font-medium">Practice Questions</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 text-xl">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="text-3xl font-black text-slate-900">Active</div>
          <div className="text-slate-500 font-medium">Student Status</div>
        </div>
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <i className="fas fa-history text-indigo-500"></i>
          Previous Generations
        </h2>

        {history.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              <i className="fas fa-folder-open"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No history yet</h3>
            <p className="text-slate-400 mb-8 max-w-xs mx-auto">
              Upload your first lecture to see it here and start learning smarter.
            </p>
            <button
              onClick={onNewUpload}
              className="text-indigo-600 font-bold hover:underline"
            >
              Get started now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <div 
                key={item.id}
                className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                      item.fileType === 'pdf' ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                      <i className={`fas ${item.fileType === 'pdf' ? 'fa-file-pdf' : 'fa-microphone'}`}></i>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistory(item.id);
                      }}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-2"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    {new Date(item.timestamp).toLocaleDateString()} • {item.flashcards.length} cards • {item.quiz.length} questions
                  </p>
                  <button
                    onClick={() => onSelectItem(item)}
                    className="w-full py-3 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    View Materials
                    <i className="fas fa-arrow-right text-xs"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
