
import React, { useState } from 'react';

interface Slide {
  slideTitle: string;
  bullets: string[];
  speakerNotes: string;
}

interface SlideViewProps {
  slides: Slide[];
}

const SlideView: React.FC<SlideViewProps> = ({ slides }) => {
  const [index, setIndex] = useState(0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="aspect-video bg-[#1a1a1a] rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col p-12 transition-all duration-500">
        <div className="absolute top-0 right-0 p-6">
          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
            {index + 1} / {slides.length}
          </span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center animate-fadeIn">
          <h2 className="text-4xl font-black mb-10 text-emerald-400">{slides[index].slideTitle}</h2>
          <ul className="space-y-4">
            {slides[index].bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-4 text-xl text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-3 shrink-0"></span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-slate-800">
           <button 
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
            className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 transition-all"
           >
             <i className="fas fa-chevron-left"></i>
           </button>
           <button 
            disabled={index === slides.length - 1}
            onClick={() => setIndex(index + 1)}
            className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-20 transition-all"
           >
             <i className="fas fa-chevron-right"></i>
           </button>
        </div>
      </div>

      <div className="p-6 bg-[#151515] rounded-2xl border border-slate-800">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <i className="fas fa-microphone text-emerald-500"></i>
          Speaker Notes
        </h4>
        <p className="text-slate-400 leading-relaxed italic">{slides[index].speakerNotes}</p>
      </div>
    </div>
  );
};

export default SlideView;
