
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizViewProps {
  quiz: QuizQuestion[];
}

const QuizView: React.FC<QuizViewProps> = ({ quiz }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    
    if (selectedOption === quiz[currentIndex].correctAnswer) {
      setScore(score + 1);
    }
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 < quiz.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  if (quiz.length === 0) return <div>No quiz available.</div>;

  if (isFinished) {
    const percentage = Math.round((score / quiz.length) * 100);
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4 bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full">
          <i className="fas fa-trophy text-4xl"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
        <p className="text-gray-500 mb-8 text-lg">
          You scored <span className="text-indigo-600 font-bold">{score}</span> out of <span className="font-bold">{quiz.length}</span>
        </p>
        
        <div className="relative pt-1 mb-10">
          <div className="flex mb-2 items-center justify-between">
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
              Score Progress
            </span>
            <span className="text-xs font-semibold inline-block text-indigo-600">
              {percentage}%
            </span>
          </div>
          <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-indigo-100">
            <div 
              style={{ width: `${percentage}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-1000"
            />
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  const q = quiz[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
          Question {currentIndex + 1} of {quiz.length}
        </span>
        <span className="text-sm font-medium text-gray-500">
          Score: {score}
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-8">{q.question}</h3>
        
        <div className="space-y-4">
          {q.options.map((option, idx) => {
            let bgColor = 'bg-white';
            let borderColor = 'border-gray-200';
            let textColor = 'text-gray-700';

            if (isAnswered) {
              if (idx === q.correctAnswer) {
                bgColor = 'bg-green-50';
                borderColor = 'border-green-500';
                textColor = 'text-green-800';
              } else if (idx === selectedOption) {
                bgColor = 'bg-red-50';
                borderColor = 'border-red-500';
                textColor = 'text-red-800';
              } else {
                bgColor = 'bg-gray-50';
                borderColor = 'border-gray-100';
                textColor = 'text-gray-400';
              }
            } else if (idx === selectedOption) {
              borderColor = 'border-indigo-500';
              bgColor = 'bg-indigo-50';
              textColor = 'text-indigo-800';
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleOptionSelect(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${bgColor} ${borderColor} ${textColor} ${!isAnswered && 'hover:border-indigo-300 hover:bg-indigo-50/50'}`}
              >
                <span className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm font-bold shrink-0 ${
                  idx === selectedOption ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-400 border-gray-200'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="font-medium">{option}</span>
                {isAnswered && idx === q.correctAnswer && (
                  <i className="fas fa-check-circle text-green-500 ml-auto"></i>
                )}
                {isAnswered && idx === selectedOption && idx !== q.correctAnswer && (
                  <i className="fas fa-times-circle text-red-500 ml-auto"></i>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <div className="bg-indigo-50 rounded-2xl p-6 mb-8 border border-indigo-100 animate-fadeIn">
          <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <i className="fas fa-lightbulb"></i> Explanation
          </h4>
          <p className="text-indigo-800 text-sm leading-relaxed">{q.explanation}</p>
        </div>
      )}

      <div className="flex gap-4">
        {!isAnswered ? (
          <button
            onClick={handleCheckAnswer}
            disabled={selectedOption === null}
            className={`flex-1 py-4 rounded-xl font-bold transition-all shadow-lg ${
              selectedOption !== null 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            {currentIndex + 1 < quiz.length ? 'Next Question' : 'Finish Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizView;
