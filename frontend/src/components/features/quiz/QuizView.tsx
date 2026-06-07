import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { saveQuizResult } from '../../../db/db';
import { QuizQuestion } from '../../../types';
import { MixedTextRenderer } from '../../ui/MathRenderer';
import { 
  Tick01Icon, 
  Cancel01Icon, 
  ArrowRight01Icon, 
  HourglassIcon,
  BubbleChatCheckIcon,
  SparklesIcon
} from '@/components/ui/icons';

export const QuizView: React.FC = () => {
  const { activeMaterial, navigateTo, goBack, refreshMaterials, refreshStats } = useApp();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  
  // Quiz progress states
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [missedConceptIds, setMissedConceptIds] = useState<string[]>([]);
  
  // Timer states
  const [startTime] = useState<number>(Date.now());
  const [timeTakenStr, setTimeTakenStr] = useState<string>('');

  if (!activeMaterial) return null;

  useEffect(() => {
    // Bilim quizzes always have exactly 5 questions per user requirements
    const quizQuestions = activeMaterial.quiz.slice(0, 5);
    setQuestions(quizQuestions);
    setCurrentQIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setMissedConceptIds([]);
  }, [activeMaterial]);

  const handleOptionSelect = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const q = questions[currentQIndex];
    if (optionIdx === q.correct) {
      setScore(prev => prev + 1);
    } else {
      // Find the concept_id corresponding to this question (if none, map to a general one)
      // Usually, concepts match flashcards which have concept_ids. Let's find any concept in this material
      // matching similar terms or map to the first concept of the material as weak
      const associatedConcept = activeMaterial.concepts.find(
        c => q.question.toLowerCase().includes(c.term.toLowerCase()) || 
             q.explanation.toLowerCase().includes(c.term.toLowerCase())
      ) || activeMaterial.concepts[0];

      if (associatedConcept) {
        setMissedConceptIds(prev => {
          if (!prev.includes(associatedConcept.id)) {
            return [...prev, associatedConcept.id];
          }
          return prev;
        });
      }
    }
  };

  const handleNext = async () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz ended!
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      setTimeTakenStr(`${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`);

      // Save to DB and automatically trigger spaced repetition link
      await saveQuizResult(activeMaterial.id, score, missedConceptIds);
      await refreshMaterials();
      refreshStats();

      // Proceed to scoreboard index
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const getOptionLetter = (idx: number) => {
    return ['A', 'B', 'C', 'D'][idx];
  };

  // 1. Scoreboard (Quiz End Screen)
  if (currentQIndex >= questions.length && questions.length > 0) {
    const isPassing = score >= 4;
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-background font-sans max-w-md mx-auto w-full">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 animate-pulse">
          <BubbleChatCheckIcon size={36} className="text-primary" />
        </div>

        <h2 className="font-heading font-extrabold text-2xl text-foreground mb-1 tracking-tight">
          {isPassing ? 'Fantastic Score!' : 'Keep Practicing!'}
        </h2>
        <p className="text-xs text-muted-foreground mb-6">
          Active recall quiz finished successfully.
        </p>

        {/* Big Score Panel */}
        <div className="p-6 rounded-[2.5rem] bg-card border border-border shadow-md w-full max-w-[280px] mb-6 flex flex-col items-center justify-center">
          <span className="block text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-1">Your Score</span>
          <span className="text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
            {score} / 5
          </span>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground font-semibold">
            <HourglassIcon size={12} />
            <span>Completed in {timeTakenStr}</span>
          </div>
        </div>

        {/* Weak Concepts Alert */}
        {missedConceptIds.length > 0 ? (
          <div className="w-full max-w-[300px] p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 text-left mb-8">
            <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-2 uppercase tracking-wide">
              Weak spots identified
            </h4>
            <ul className="text-xs space-y-1 text-muted-foreground font-medium list-disc list-inside">
              {missedConceptIds.map(cId => {
                const concept = activeMaterial.concepts.find(c => c.id === cId);
                return (
                  <li key={cId} className="truncate">
                    {concept ? concept.term : 'General Concept'}
                  </li>
                );
              })}
            </ul>
            <p className="text-[10px] text-muted-foreground/80 mt-3 italic leading-relaxed">
              *Related flashcards have been automatically scheduled as "Missed" to help you review them!
            </p>
          </div>
        ) : (
          <div className="w-full max-w-[300px] p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 text-left mb-8">
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wide">
              Perfect Mastery!
            </h4>
            <p className="text-xs text-muted-foreground font-medium">
              You crushed all questions. None of your cards were downgraded. Excellent!
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-[240px]">
          <button
            onClick={() => {
              setQuestions(activeMaterial.quiz.slice(0, 5));
              setCurrentQIndex(0);
              setScore(0);
              setSelectedOption(null);
              setIsAnswered(false);
              setMissedConceptIds([]);
            }}
            className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => navigateTo('detail')}
            className="w-full py-3.5 bg-muted text-foreground hover:bg-muted/80 font-bold rounded-2xl transition-all cursor-pointer text-sm"
          >
            Study Hub Home
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQIndex];

  return (
    <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full font-sans justify-between relative min-h-0 h-full">
      
      {/* 1. Progress Indicator */}
      <div className="w-full select-none">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-bold text-muted-foreground">
            Question {currentQIndex + 1} of {questions.length}
          </span>
          <span className="text-xs font-black text-primary">
            Score: {score}
          </span>
        </div>

        {/* Small Progress Bar */}
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 2. Question Text */}
      {q && (
        <div className="flex-grow flex flex-col justify-start my-4 overflow-y-auto select-text min-h-0 pr-1 no-scrollbar space-y-4">
          <div className="p-5 rounded-3xl bg-card border border-border/40 shadow-sm flex-shrink-0">
            <h3 className="font-heading font-extrabold text-base text-foreground leading-relaxed text-center w-full">
              <MixedTextRenderer text={q.question} />
            </h3>
          </div>

          {/* Multiple choice Options */}
          <div className="grid gap-3 select-none flex-shrink-0">
            {q.options.map((opt, index) => {
              const isSelected = selectedOption === index;
              const isCorrect = q.correct === index;
              
              let optStyle = 'border-border/60 hover:border-primary/40 hover:bg-muted/30';
              let letterStyle = 'bg-muted text-muted-foreground';
              
              if (isAnswered) {
                if (isCorrect) {
                  // Always show correct in green
                  optStyle = 'border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 scale-[1.01]';
                  letterStyle = 'bg-emerald-500 text-white';
                } else if (isSelected) {
                  // Show chosen wrong in red
                  optStyle = 'border-rose-500/40 bg-rose-500/5 text-rose-700 dark:text-rose-300';
                  letterStyle = 'bg-rose-500 text-white';
                } else {
                  // Freeze others
                  optStyle = 'opacity-50 border-border/40';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-2xl bg-card border text-left font-bold text-xs transition-all duration-200 active:scale-[0.99] flex items-center justify-between cursor-pointer group ${optStyle}`}
                >
                  <div className="flex items-center gap-3.5 pr-2">
                    <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition-all ${letterStyle}`}>
                      {getOptionLetter(index)}
                    </span>
                    <span className="leading-snug text-foreground/90 font-medium flex-1">
                      <MixedTextRenderer text={opt} />
                    </span>
                  </div>

                  {/* Feedback icons */}
                  {isAnswered && (
                    <div className="flex items-center">
                      {isCorrect && <Tick01Icon size={16} strokeWidth={2.0} className="text-emerald-500 animate-bounce" />}
                      {!isCorrect && isSelected && <Cancel01Icon size={16} strokeWidth={2.0} className="text-rose-500" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 3. Real-time cognitive explanation */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10 animate-fade-in flex-shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
                <SparklesIcon size={14} />
                <span>Bilim Explanation</span>
              </div>
              <div className="text-xs leading-relaxed text-muted-foreground font-medium select-text w-full">
                <MixedTextRenderer text={q.explanation} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Bottom Toolbar */}
      <div className="select-none py-1">
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg hover:scale-[1.01] active:scale-95 disabled:scale-100 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl transition-all flex items-center justify-center gap-2 select-none cursor-pointer text-sm"
        >
          {currentQIndex === questions.length - 1 ? 'Show Scoreboard' : 'Next Question'}
          <ArrowRight01Icon size={16} strokeWidth={2.0} />
        </button>
      </div>

    </div>
  );
};
