import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { getCardStates, updateCardDifficulty, incrementBossSessions } from '../../../db/db';
import { CardState, Flashcard } from '../../../types';
import { MathRenderer } from '../../ui/MathRenderer';
import { 
  Tick01Icon, 
  Cancel01Icon, 
  HourglassIcon,
  ZapIcon,
  SparklesIcon,
  Notebook02Icon
} from '@/components/ui/icons';

export const BossModeView: React.FC = () => {
  const { activeMaterial, navigateTo, goBack, refreshMaterials, refreshStats } = useApp();
  const [weakCards, setWeakCards] = useState<Flashcard[]>([]);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  
  // Timer state (3 seconds countdown)
  const [timer, setTimer] = useState<number>(3);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Live session statistics
  const [crushedCount, setCrushedCount] = useState<number>(0);
  const [stillHardCount, setStillHardCount] = useState<number>(0);

  if (!activeMaterial) return null;

  useEffect(() => {
    loadWeakCards();
  }, [activeMaterial]);

  const loadWeakCards = async () => {
    try {
      const states = await getCardStates(activeMaterial.id);
      const stateMap: Record<string, CardState> = {};
      states.forEach(s => { stateMap[s.card_id] = s; });
      setCardStates(stateMap);

      // Filter only weak cards (missed or shaky)
      const weak = activeMaterial.flashcards.filter(c => {
        const state = stateMap[c.id];
        return state && (state.difficulty === 'missed' || state.difficulty === 'shaky');
      });

      setWeakCards(weak);
      setCurrentIndex(0);
      setCrushedCount(0);
      setStillHardCount(0);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Timer runner
  useEffect(() => {
    if (weakCards.length === 0 || currentIndex >= weakCards.length) return;
    if (isFlipped) {
      setTimerActive(false);
      return;
    }

    setTimer(3);
    setTimerActive(true);
  }, [currentIndex, isFlipped, weakCards]);

  useEffect(() => {
    let interval: any;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timerActive && timer === 0) {
      // Auto flip when timer hits 0
      setIsFlipped(true);
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const handleAction = async (response: 'known' | 'missed') => {
    const currentCard = weakCards[currentIndex];
    
    // Update local Spaced Repetition engine
    // known -> Got it (moves out of weak spots)
    // missed -> Still hard (remains weak)
    const apiResponse = response === 'known' ? 'known' : 'missed';
    await updateCardDifficulty(currentCard.id, activeMaterial.id, apiResponse);

    if (response === 'known') {
      setCrushedCount(prev => prev + 1);
    } else {
      setStillHardCount(prev => prev + 1);
    }

    setIsFlipped(false);
    
    // Smooth delay before next card
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 250);
  };

  // Complete Screen
  if (currentIndex >= weakCards.length && weakCards.length > 0) {
    // Log complete session
    incrementBossSessions();
    refreshStats();

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-background font-sans max-w-md mx-auto w-full">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6 animate-bounce">
          <ZapIcon size={32} className="fill-orange-500 text-orange-500" />
        </div>

        <h2 className="font-heading font-extrabold text-2xl text-foreground mb-3 tracking-tight">
          Boss Mode Finished!
        </h2>
        <p className="text-sm text-muted-foreground max-w-[280px] mb-8">
          You reviewed {weakCards.length} weak cards. Sleep well.
        </p>

        {/* Dynamic score summary */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-[280px] mb-8">
          <div className="p-4 rounded-2xl bg-card border border-border/40 text-center shadow-sm">
            <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{crushedCount}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Crushed It</span>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border/40 text-center shadow-sm">
            <span className="block text-2xl font-black text-rose-600 dark:text-rose-400">{stillHardCount}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Still Hard</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[240px]">
          <button
            onClick={() => {
              loadWeakCards();
            }}
            className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm"
          >
            Review Weak Spots Again
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

  const remaining = weakCards.length - currentIndex;

  return (
    <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full font-sans justify-between relative min-h-[calc(100vh-60px)] bg-background">
      
      {/* 1. Immersive Top Toolbar */}
      <div className="flex justify-between items-center select-none py-1.5 border-b border-border/30">
        <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
          <ZapIcon size={18} className="text-orange-500 fill-orange-500" />
          <span>Boss Mode</span>
        </div>
        
        {/* Real-time statistics metrics */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {crushedCount} Crushed
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            {stillHardCount} Shaky
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {remaining} Remaining
          </span>
        </div>
      </div>

      {/* 2. Rapid Timer Section (Visual high cognitive stress!) */}
      {weakCards.length > 0 && !isFlipped && (
        <div className="flex flex-col items-center justify-center my-2 select-none">
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-rose-500 mb-1">
            <HourglassIcon size={12} className="animate-spin text-rose-500" />
            <span>Time to recall:</span>
          </div>
          <span className="text-3xl font-black text-rose-500 animate-pulse">
            {timer}s
          </span>
        </div>
      )}

      {/* 3. Immersive Card Container */}
      {weakCards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto select-none">
          <Notebook02Icon size={40} className="text-muted-foreground/60 mb-4 animate-bounce" />
          <h4 className="font-heading font-bold text-base mb-1 text-foreground">All weak spots cleared!</h4>
          <p className="text-xs text-muted-foreground max-w-[240px] mb-4">
            Congratulations! None of the cards in this material are currently marked as Missed or Shaky.
          </p>
          <button
            onClick={() => navigateTo('detail')}
            className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-md text-xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            Back to Study Hub
          </button>
        </div>
      ) : (
        <div 
          onClick={() => {
            if (!isFlipped) setIsFlipped(true);
          }}
          className="flex-1 flex items-center justify-center my-4 cursor-pointer select-none card-perspective"
        >
          <div className={`w-full h-80 rounded-[2.5rem] relative card-inner ${isFlipped ? 'flipped' : ''}`}>
            
            {/* FRONT (Rapid Question) */}
            <div className="absolute inset-0 w-full h-full rounded-[2.5rem] bg-card border border-rose-500/10 shadow-lg p-8 flex flex-col justify-between card-front select-none">
              <div className="flex items-center justify-between text-[10px] font-bold text-rose-500/80 tracking-wider uppercase">
                <span>Fast Recall</span>
                <span className="inline-flex items-center gap-0.5">
                  ⚡ Focus
                </span>
              </div>
              
              <div className="flex-1 flex items-center justify-center text-center my-4 overflow-y-auto">
                <h3 className="font-heading font-extrabold text-base text-foreground leading-relaxed">
                  {weakCards[currentIndex].front}
                </h3>
              </div>

              <div className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Tap card to reveal answer
              </div>
            </div>

            {/* BACK (Answer + KaTeX math) */}
            <div className="absolute inset-0 w-full h-full rounded-[2.5rem] bg-card border border-rose-500/10 shadow-lg p-8 flex flex-col justify-between card-back select-none">
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                <span>Revealed Answer</span>
                <span className="text-orange-500">Boss Mode</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center my-4 overflow-y-auto pr-1 no-scrollbar text-center">
                {/* Mixed LaTeX parsing */}
                <div className="space-y-2 leading-relaxed text-sm select-text text-center">
                  {weakCards[currentIndex].back.split(/(\$\$.*?\$\$|\$.*?\$)/g).map((part, index) => {
                    if (part.startsWith('$$') && part.endsWith('$$')) {
                      return <MathRenderer key={index} formula={part.slice(2, -2)} displayMode={true} />;
                    } else if (part.startsWith('$') && part.endsWith('$')) {
                      return <MathRenderer key={index} formula={part.slice(1, -1)} displayMode={false} className="inline-block py-0 my-0" />;
                    } else {
                      return <span key={index} className="whitespace-pre-line">{part}</span>;
                    }
                  })}
                </div>
              </div>

              <div className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Judge your recall below
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. Judge Responses buttons (Still hard / Crushed it) */}
      {weakCards.length > 0 && (
        <div className={`grid grid-cols-2 gap-3 transition-all duration-300 select-none ${isFlipped ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'}`}>
          <button
            onClick={() => handleAction('missed')}
            className="flex flex-col items-center justify-center py-4 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 font-bold transition-all cursor-pointer group"
          >
            <Cancel01Icon size={20} className="mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs uppercase font-bold tracking-wide">Still Hard</span>
            <span className="text-[9px] font-medium text-rose-500/70 mt-0.5">Keep in reviews</span>
          </button>
          
          <button
            onClick={() => handleAction('known')}
            className="flex flex-col items-center justify-center py-4 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold transition-all cursor-pointer group"
          >
            <Tick01Icon size={20} className="mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs uppercase font-bold tracking-wide">Crushed It</span>
            <span className="text-[9px] font-medium text-emerald-500/70 mt-0.5">Remove from weak spots</span>
          </button>
        </div>
      )}

    </div>
  );
};
