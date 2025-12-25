
import React, { useState, useEffect } from 'react';

interface Slide {
  slideTitle: string;
  bullets: string[];
  speakerNotes: string;
  imageKeyword: string;
}

interface SlideViewProps {
  slides: Slide[];
}

const SlideView: React.FC<SlideViewProps> = ({ slides }) => {
  const [index, setIndex] = useState(0);

  // Pre-fetch all images for instant loading
  useEffect(() => {
    if (!slides) return;
    slides.forEach((slide) => {
      const img = new Image();
      // Using a more reliable query pattern for LoremFlickr
      img.src = `https://loremflickr.com/1280/720/${encodeURIComponent(slide.imageKeyword || 'abstract')}/all`;
    });
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[index];

  const handleDownloadOutline = () => {
    const content = slides.map((s, i) => 
      `Slide ${i+1}: ${s.slideTitle}\n` +
      s.bullets.map(b => `- ${b}`).join('\n') + 
      `\n\nNotes: ${s.speakerNotes}\n\n`
    ).join('-------------------\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation_outline.txt';
    a.click();
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 relative">
      {/* 
          PRINT VIEW: This is hidden on screen but used when window.print() is called.
          It ensures the PDF contains ALL slides, not just the active one.
      */}
      <div className="hidden print:block space-y-0">
        {slides.map((slide, i) => (
          <div key={i} className="slide-container h-[100vh] w-full flex flex-col bg-white text-black p-10 border-b border-gray-100 page-break-after-always">
             <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-black text-indigo-600">{slide.slideTitle}</h1>
                <span className="text-sm font-bold text-gray-400">StudyEasierAI • Slide {i + 1}</span>
             </div>
             <div className="flex gap-10 flex-1 overflow-hidden">
                <ul className="flex-1 space-y-6">
                  {slide.bullets.map((b, bi) => (
                    <li key={bi} className="text-xl leading-relaxed flex items-start gap-4">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 mt-3 shrink-0"></span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="w-1/3 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 h-64 self-center flex items-center justify-center">
                   <img 
                     src={`https://loremflickr.com/600/400/${encodeURIComponent(slide.imageKeyword || 'abstract')}/all`} 
                     alt={slide.imageKeyword}
                     className="w-full h-full object-cover"
                   />
                </div>
             </div>
             <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100 italic text-gray-600 text-sm">
                <strong>Speaker Notes:</strong> {slide.speakerNotes}
             </div>
          </div>
        ))}
      </div>

      {/* 
          SCREEN VIEW: Interactive presentation container
      */}
      <div className="no-print slide-container flex flex-col bg-[#1a1a1a] rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden h-[600px] transition-all duration-500">
        
        {/* Slide Counter Overlay */}
        <div className="absolute top-6 right-6 z-20">
          <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
            Slide {index + 1} / {slides.length}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Main Slide Content Area */}
          <div className="flex-1 flex flex-col p-10 lg:p-14 overflow-y-auto custom-scrollbar animate-fadeIn">
            <h2 className="text-3xl lg:text-4xl font-black mb-8 text-emerald-400 leading-tight">
              {currentSlide.slideTitle}
            </h2>
            <ul className="space-y-6 flex-1">
              {currentSlide.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-5 text-xl text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-3 shrink-0"></span>
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Image Side-bar */}
          <div className="w-full lg:w-2/5 min-h-[300px] lg:min-h-full relative bg-[#111] overflow-hidden">
             <img 
               key={currentSlide.imageKeyword}
               src={`https://loremflickr.com/1280/720/${encodeURIComponent(currentSlide.imageKeyword || 'abstract')}/all`} 
               alt={currentSlide.imageKeyword} 
               className="slide-image w-full h-full object-cover opacity-70 mix-blend-luminosity hover:opacity-100 transition-opacity duration-700"
               onError={(e) => {
                 (e.target as HTMLImageElement).src = `https://loremflickr.com/1280/720/education,minimal`;
               }}
             />
             <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Visual Context</span>
                <span className="text-xs text-slate-100 font-medium italic truncate block">#{currentSlide.imageKeyword}</span>
             </div>
          </div>
        </div>

        {/* Persistent Navigation Bar (Fixed at bottom of container) */}
        <div className="flex justify-between items-center px-8 py-5 bg-[#0f0f0f] border-t border-slate-800 z-30">
           <button 
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-xs font-black text-slate-300 hover:text-white disabled:opacity-20 transition-all rounded-xl uppercase tracking-widest border border-slate-700"
           >
             <i className="fas fa-arrow-left"></i> Previous
           </button>
           
           <div className="hidden md:flex gap-2 items-center">
             {slides.map((_, i) => (
               <button 
                key={i} 
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'bg-emerald-500 w-10' : 'bg-slate-700 w-2 hover:bg-slate-500'}`} 
               />
             ))}
           </div>

           <button 
            disabled={index === slides.length - 1}
            onClick={() => setIndex(index + 1)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white disabled:opacity-20 transition-all rounded-xl shadow-lg shadow-emerald-600/20 uppercase tracking-widest"
           >
             Next <i className="fas fa-arrow-right"></i>
           </button>
        </div>
      </div>

      {/* Speaker Notes */}
      <div className="no-print p-8 bg-[#151515] rounded-3xl border border-slate-800 shadow-xl">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <i className="fas fa-microphone-alt text-emerald-500"></i>
          Speaker's Presentation Script
        </h4>
        <div className="text-slate-300 leading-relaxed italic text-lg border-l-4 border-emerald-500/20 pl-6 bg-[#0a0a0a] p-4 rounded-xl">
          "{currentSlide.speakerNotes}"
        </div>
      </div>

      {/* Action Bar */}
      <div className="no-print flex flex-col sm:flex-row justify-center gap-4">
        <button 
          onClick={triggerPrint}
          className="px-10 py-5 bg-white text-black rounded-2xl font-black text-sm hover:bg-slate-200 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest"
        >
          <i className="fas fa-file-pdf text-indigo-600"></i> Export PDF Presentation
        </button>
        <button 
          onClick={handleDownloadOutline}
          className="px-10 py-5 bg-slate-800 text-white rounded-2xl font-black text-sm hover:bg-slate-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest border border-slate-700"
        >
          <i className="fas fa-list-alt text-emerald-500"></i> Download Outline
        </button>
      </div>
      
      <p className="no-print text-center text-slate-600 text-[11px] font-bold uppercase tracking-[0.2em]">
        Pro Tip: The PDF export includes ALL generated slides automatically.
      </p>
    </div>
  );
};

export default SlideView;
