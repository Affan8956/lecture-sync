
import React, { useState } from 'react';
import { Flashcard } from '../types';

interface FlashcardViewProps {
  flashcards: Flashcard[];
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ flashcards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (flashcards.length === 0) return <div>No flashcards generated.</div>;

  const currentCard = flashcards[currentIndex];

  return (
    <div className="flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-md h-80 perspective-1000">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full h-full transition-all duration-500 transform-style-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border-4 border-indigo-100 flex items-center justify-center p-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Question</span>
              <p className="text-xl md:text-2xl font-semibold text-gray-800">{currentCard.front}</p>
              <div className="mt-8 text-gray-400 flex items-center gap-2">
                 <i className="fas fa-sync-alt"></i>
                 <span className="text-sm">Click to flip</span>
              </div>
            </div>
          </div>
          
          {/* Back */}
          <div className="absolute inset-0 backface-hidden bg-indigo-600 rounded-3xl shadow-xl rotate-y-180 flex items-center justify-center p-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4">Answer</span>
              <p className="text-xl md:text-2xl font-medium text-white">{currentCard.back}</p>
              <div className="mt-8 text-indigo-200 flex items-center gap-2">
                 <i className="fas fa-sync-alt"></i>
                 <span className="text-sm">Click to flip</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full max-w-md mt-12 px-4">
        <button
          onClick={handlePrev}
          className="p-4 rounded-full bg-white shadow-md hover:bg-gray-50 text-indigo-600 transition-colors"
        >
          <i className="fas fa-chevron-left text-xl"></i>
        </button>
        <span className="text-gray-500 font-medium">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <button
          onClick={handleNext}
          className="p-4 rounded-full bg-white shadow-md hover:bg-gray-50 text-indigo-600 transition-colors"
        >
          <i className="fas fa-chevron-right text-xl"></i>
        </button>
      </div>

      <div className="mt-12 w-full max-w-md">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default FlashcardView;
