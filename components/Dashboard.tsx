
import React from 'react';
import { User, ChatSession, LabAsset, ViewState } from '../types';

interface DashboardProps {
  user: User;
  chats: ChatSession[];
  assets: LabAsset[];
  onAction: (target: ViewState) => void;
  onNewChat: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, chats, assets, onAction, onNewChat }) => {
  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black mb-2 tracking-tight">
            Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 text-lg">Your workspace is synchronized and ready for analysis.</p>
        </header>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div 
            onClick={() => onNewChat()}
            className="group p-8 bg-[#151515] border border-slate-800 rounded-3xl hover:border-indigo-500/50 hover:bg-indigo-600/5 transition-all cursor-pointer shadow-xl"
          >
            <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <i className="fas fa-plus text-xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Chat</h3>
            <p className="text-slate-500 text-sm">Start a conversational reasoning session with Gemini 3 Pro.</p>
          </div>

          <div 
            onClick={() => onAction('lab')}
            className="group p-8 bg-[#151515] border border-slate-800 rounded-3xl hover:border-emerald-500/50 hover:bg-emerald-600/5 transition-all cursor-pointer shadow-xl"
          >
            <div className="w-14 h-14 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <i className="fas fa-microscope text-xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Knowledge Lab</h3>
            <p className="text-slate-500 text-sm">Extract summaries, quizzes, or slides from any document.</p>
          </div>

          <div 
            onClick={() => onAction('vault')}
            className="group p-8 bg-[#151515] border border-slate-800 rounded-3xl hover:border-amber-500/50 hover:bg-amber-600/5 transition-all cursor-pointer shadow-xl"
          >
            <div className="w-14 h-14 bg-amber-600/20 rounded-2xl flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
              <i className="fas fa-vault text-xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Private Vault</h3>
            <p className="text-slate-500 text-sm">Review your generated knowledge and persistent chat history.</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <section>
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-2">Recent Chats</h4>
              <div className="space-y-3">
                 {chats.slice(0, 3).map(chat => (
                   <div key={chat.id} className="p-4 bg-[#121212] border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <i className="fas fa-comment-alt text-indigo-400 text-xs"></i>
                        <span className="font-bold text-sm truncate max-w-[200px]">{chat.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 uppercase font-bold">{new Date(chat.updatedAt).toLocaleDateString()}</span>
                   </div>
                 ))}
              </div>
           </section>

           <section>
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 px-2">Knowledge Assets</h4>
              <div className="space-y-3">
                 {assets.slice(0, 3).map(asset => (
                   <div key={asset.id} className="p-4 bg-[#121212] border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <i className={`fas text-xs ${asset.type === 'summary' ? 'fa-file-text text-emerald-400' : 'fa-tasks text-amber-400'}`}></i>
                        <span className="font-bold text-sm truncate max-w-[200px]">{asset.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 uppercase font-bold">{asset.type}</span>
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
