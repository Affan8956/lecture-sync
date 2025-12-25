
import React, { useState } from 'react';
import { LabAsset, ChatSession } from '../types';

interface VaultProps {
  assets: LabAsset[];
  chats: ChatSession[];
  onViewAsset: (asset: LabAsset) => void;
}

const Vault: React.FC<VaultProps> = ({ assets, chats }) => {
  const [filter, setFilter] = useState<'all' | 'summary' | 'quiz' | 'slides'>('all');

  const filteredAssets = filter === 'all' ? assets : assets.filter(a => a.type === filter);

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black mb-2">The Vault</h1>
          <p className="text-slate-500">Your historical workspace data and generated intelligence.</p>
        </header>

        <div className="flex gap-4 mb-10 border-b border-slate-800 pb-6">
          {(['all', 'summary', 'quiz', 'slides'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${filter === f ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map(asset => (
            <div key={asset.id} className="p-6 bg-[#121212] border border-slate-800 rounded-3xl hover:border-slate-600 transition-all group">
              <div className="flex justify-between items-start mb-6">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                   asset.type === 'summary' ? 'bg-emerald-600/20 text-emerald-400' :
                   asset.type === 'quiz' ? 'bg-amber-600/20 text-amber-400' :
                   'bg-blue-600/20 text-blue-400'
                 }`}>
                   <i className={`fas ${asset.type === 'summary' ? 'fa-file-text' : asset.type === 'quiz' ? 'fa-tasks' : 'fa-presentation'}`}></i>
                 </div>
                 <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{new Date(asset.timestamp).toLocaleDateString()}</span>
              </div>
              <h3 className="text-lg font-bold mb-2 truncate">{asset.title}</h3>
              <p className="text-slate-500 text-sm mb-6 truncate italic">Source: {asset.sourceName}</p>
              <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                Open Asset <i className="fas fa-external-link-alt text-[10px]"></i>
              </button>
            </div>
          ))}

          {filteredAssets.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30">
              <i className="fas fa-ghost text-4xl mb-4"></i>
              <p>No assets found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vault;
