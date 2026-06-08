import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { getCardStates, updateCardDifficulty } from '../../../db/db';
import { CardState, Flashcard } from '../../../types';
import { MathRenderer, MixedTextRenderer } from '../../ui/MathRenderer';
import { 
  ShuffleIcon, 
  Edit01Icon, 
  Tick01Icon, 
  Cancel01Icon, 
  ArrowRight01Icon,
  BookOpen01Icon,
  SparklesIcon
} from '@/components/ui/icons';

export const FlashcardsView: React.FC = () => {
  const { activeMaterial, navigateTo, refreshMaterials } = useApp();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  
  // Immersive session statistics
  const [sessionReviewed, setSessionReviewed] = useState<number>(0);
  const [sessionGotIt, setSessionGotIt] = useState<number>(0);
  const [sessionShaky, setSessionShaky] = useState<number>(0);
  const [sessionMissed, setSessionMissed] = useState<number>(0);

  // Touch and Mouse Swipe States
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'down' | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [animateOutDirection, setAnimateOutDirection] = useState<'left' | 'right' | 'down' | null>(null);

  // Touch device guards to prevent double tap/click emulations
  const touchActiveRef = useRef(false);
  const touchTimeoutRef = useRef<any>(null);

  if (!activeMaterial) return null;

  useEffect(() => {
    loadCards();
  }, [activeMaterial, isShuffle]);

  // Cleanup touch guard timeout on unmount
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  // Reset drag position on card index change
  useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setSwipeDirection(null);
    setIsAnimatingOut(false);
    setAnimateOutDirection(null);
  }, [currentIndex]);

  const loadCards = async () => {
    try {
      const states = await getCardStates(activeMaterial.id);
      const stateMap: Record<string, CardState> = {};
      states.forEach(s => { stateMap[s.card_id] = s; });
      setCardStates(stateMap);

      let materialCards = [...activeMaterial.flashcards];

      // Smart focus: show due cards or new cards first, but fallback to all if none due
      const now = Date.now();
      const dueCards = materialCards.filter(c => {
        const state = stateMap[c.id];
        return !state || state.nextReview <= now;
      });

      const cardsToUse = dueCards.length > 0 ? dueCards : materialCards;

      if (isShuffle) {
        // Fisher-Yates shuffle
        for (let i = cardsToUse.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cardsToUse[i], cardsToUse[j]] = [cardsToUse[j], cardsToUse[i]];
        }
      }

      setCards(cardsToUse);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReview = async (response: 'missed' | 'shaky' | 'known') => {
    if (cards.length === 0) return;
    const currentCard = cards[currentIndex];

    // Trigger local SM-2 algorithm update
    const updatedState = await updateCardDifficulty(currentCard.id, activeMaterial.id, response);
    setCardStates(prev => ({ ...prev, [currentCard.id]: updatedState }));

    // Increment session stats
    setSessionReviewed(prev => prev + 1);
    if (response === 'known') setSessionGotIt(prev => prev + 1);
    else if (response === 'shaky') setSessionShaky(prev => prev + 1);
    else setSessionMissed(prev => prev + 1);

    // Smooth transition
    setIsFlipped(false);
    // Slight timeout so the card flips back before moving to the next
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 150);
  };

  // ----------------------------------------------------
  // GESTURE HANDLERS (MOUSE & TOUCH)
  // ----------------------------------------------------
  const handleDragStart = (clientX: number, clientY: number) => {
    if (isAnimatingOut || cards.length === 0) return;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || isAnimatingOut) return;
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
    setDragOffset({ x: dx, y: dy });

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 50; // drag distance in px to trigger active selection overlay

    if (absX > absY && absX > threshold) {
      setSwipeDirection(dx > 0 ? 'right' : 'left');
    } else if (dy > absX && dy > threshold) {
      setSwipeDirection('down');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleDragEnd = () => {
    if (!isDragging || isAnimatingOut) return;
    setIsDragging(false);

    const absX = Math.abs(dragOffset.x);
    const absY = Math.abs(dragOffset.y);
    const threshold = 100; // swipe activation distance (100px)

    // Tap detection: very small drag offset is treated as a tap to flip
    if (absX < 8 && absY < 8) {
      handleFlip();
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
      return;
    }

    if (absX > absY && absX > threshold) {
      // Horizontal swipe
      triggerSwipeAction(dragOffset.x > 0 ? 'right' : 'left');
    } else if (dragOffset.y > absX && dragOffset.y > threshold) {
      // Vertical swipe down
      triggerSwipeAction('down');
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }
  };

  const triggerSwipeAction = (dir: 'left' | 'right' | 'down') => {
    setIsAnimatingOut(true);
    setAnimateOutDirection(dir);

    // Push card out of viewport
    if (dir === 'right') {
      setDragOffset({ x: 500, y: dragOffset.y });
    } else if (dir === 'left') {
      setDragOffset({ x: -500, y: dragOffset.y });
    } else if (dir === 'down') {
      setDragOffset({ x: dragOffset.x, y: 500 });
    }

    // Process SM-2 review after animate-out finishes
    setTimeout(() => {
      if (dir === 'right') {
        handleReview('known');
      } else if (dir === 'left') {
        handleReview('missed');
      } else if (dir === 'down') {
        handleReview('shaky');
      }
    }, 200);
  };

  // Bridge event listeners to generic handlers with touch guard emulation bypass
  const handleMouseDown = (e: React.MouseEvent) => {
    if (touchActiveRef.current) return;
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (touchActiveRef.current) return;
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    if (touchActiveRef.current) return;
    handleDragEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchActiveRef.current = true;
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);

    if (e.touches.length > 0) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault(); // prevents emulated mouse events and double triggers
    handleDragEnd();

    // Release guard briefly after mouseup delay completes
    touchTimeoutRef.current = setTimeout(() => {
      touchActiveRef.current = false;
    }, 450);
  };

  // Compute card drag style transform
  const getCardSwipeStyle = () => {
    if (isDragging) {
      return {
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.05}deg)`,
        transition: 'none',
      };
    }
    if (isAnimatingOut) {
      return {
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.08}deg)`,
        opacity: 0,
        transition: 'transform 0.25s ease-out, opacity 0.25s ease-out',
      };
    }
    // Snap back
    return {
      transform: 'translate3d(0, 0, 0) rotate(0deg)',
      transition: 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.2) , opacity 0.3s ease',
    };
  };

  // Render visual indicator overlay as card is being dragged
  const renderSwipeOverlay = () => {
    if (!swipeDirection) return null;

    // Calculate overlay opacity based on drag distance
    const opacity = swipeDirection === 'right' || swipeDirection === 'left'
      ? Math.min(0.9, Math.max(0, (Math.abs(dragOffset.x) - 15) / 80))
      : Math.min(0.9, Math.max(0, (Math.abs(dragOffset.y) - 15) / 80));

    if (opacity === 0) return null;

    return (
      <div 
        className="absolute inset-0 rounded-[2.5rem] flex items-center justify-center z-30 pointer-events-none transition-all duration-150 select-none"
        style={{ 
          opacity,
          backgroundColor: 
            swipeDirection === 'right' ? 'rgba(16, 185, 129, 0.12)' : 
            swipeDirection === 'left' ? 'rgba(239, 68, 68, 0.12)' : 
            'rgba(245, 158, 11, 0.12)'
        }}
      >
        {swipeDirection === 'right' && (
          <div className="bg-card/95 dark:bg-card/90 border border-emerald-500/35 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-md scale-105 transition-transform duration-200">
            <Tick01Icon className="text-emerald-500" size={16} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Got It</span>
          </div>
        )}
        {swipeDirection === 'left' && (
          <div className="bg-card/95 dark:bg-card/90 border border-rose-500/35 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-md scale-105 transition-transform duration-200">
            <Cancel01Icon className="text-rose-500" size={16} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Missed</span>
          </div>
        )}
        {swipeDirection === 'down' && (
          <div className="bg-card/95 dark:bg-card/90 border border-amber-500/35 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-md scale-105 transition-transform duration-200">
            <ArrowRight01Icon className="text-amber-500 rotate-90" size={16} strokeWidth={2.5} />
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Shaky</span>
          </div>
        )}
      </div>
    );
  };

  // Complete Screen
  if (currentIndex >= cards.length && cards.length > 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-background font-sans max-w-md mx-auto w-full">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 animate-bounce">
          <Tick01Icon size={32} strokeWidth={2.0} />
        </div>

        <h2 className="font-heading font-extrabold text-2xl text-foreground mb-3 tracking-tight">
          Session Completed!
        </h2>
        <p className="text-sm text-muted-foreground max-w-[280px] mb-8">
          Excellent effort. Spaced repetition engine updated your memory cycles.
        </p>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] mb-8">
          <div className="p-3.5 rounded-2xl bg-card border border-border/40 text-center shadow-sm">
            <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{sessionGotIt}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Got it</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-card border border-border/40 text-center shadow-sm">
            <span className="block text-2xl font-black text-amber-600 dark:text-amber-400">{sessionShaky}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Shaky</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-card border border-border/40 text-center shadow-sm">
            <span className="block text-2xl font-black text-rose-600 dark:text-rose-400">{sessionMissed}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Missed</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[240px]">
          <button
            onClick={() => {
              setSessionReviewed(0);
              setSessionGotIt(0);
              setSessionShaky(0);
              setSessionMissed(0);
              loadCards();
            }}
            className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm"
          >
            Review Again
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

  return (
    <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full font-sans justify-between relative min-h-0 h-full">
      
      {/* 1. Header Toolbar (Shuffle / Edit buttons only) */}
      <div className="flex justify-between items-center select-none py-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold px-3 py-1 bg-muted rounded-full text-foreground/80">
            {cards.length > 0 ? currentIndex + 1 : 0} / {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Shuffle Button */}
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border/40 transition-all cursor-pointer text-xs font-bold ${
              isShuffle 
                ? 'bg-primary/10 text-primary border-primary/20' 
                : 'bg-card text-muted-foreground hover:text-foreground hover:border-border'
            }`}
            title="Toggle Shuffle"
          >
            <ShuffleIcon size={14} />
            <span>Shuffle</span>
          </button>

          {/* Edit Cards (Navigate to separate Full Screen Editor) */}
          <button
            onClick={() => navigateTo('card-editor')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-all cursor-pointer text-xs font-bold"
            title="Manage Cards"
          >
            <Edit01Icon size={14} />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Drag & Swipe Card Section */}
      {cards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto select-none">
          <BookOpen01Icon size={40} className="text-muted-foreground/60 mb-4" />
          <h4 className="font-heading font-bold text-base mb-1">No cards available</h4>
          <p className="text-xs text-muted-foreground max-w-[200px] mb-4">
            Try adding a custom flashcard using the "Edit" button to open the manager!
          </p>
        </div>
      ) : (
        <div 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 flex items-center justify-center my-6 cursor-grab active:cursor-grabbing select-none card-perspective touch-none"
        >
          {/* Swipe offset element (captures positioning) */}
          <div 
            className="w-full h-72 sm:h-80 relative"
            style={getCardSwipeStyle()}
          >
            {/* Flip action element */}
            <div className={`w-full h-full rounded-[2.5rem] relative card-inner ${isFlipped ? 'flipped' : ''}`}>
              
              {/* FRONT FACE (Question + LaTeX Math support) */}
              <div className="absolute inset-0 w-full h-full rounded-[2.5rem] bg-card border border-border/60 shadow-lg p-8 flex flex-col justify-between card-front overflow-hidden select-none">
                {renderSwipeOverlay()}
                
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                  <span>Front Side</span>
                  <span className="inline-flex items-center gap-1 text-primary">
                    <SparklesIcon size={10} /> Active recall
                  </span>
                </div>
                
                <div className="flex-1 flex items-center justify-center text-center my-4 overflow-y-auto pr-1 no-scrollbar select-none">
                  <h3 className="font-heading font-extrabold text-lg text-foreground px-2 leading-relaxed">
                    <MixedTextRenderer text={cards[currentIndex].front} />
                  </h3>
                </div>

                <div className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Tap to flip · Drag to review
                </div>
              </div>

              {/* BACK FACE (Answer + KaTeX Math) */}
              <div className="absolute inset-0 w-full h-full rounded-[2.5rem] bg-card border border-border/60 shadow-lg p-8 flex flex-col justify-between card-back overflow-hidden select-none">
                {renderSwipeOverlay()}
                
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                  <span>Back Side</span>
                  <span className="text-emerald-500">Explanation</span>
                </div>
                
                <div className="flex-1 flex flex-col justify-center my-4 overflow-y-auto pr-1 no-scrollbar text-center select-none">
                  <MixedTextRenderer text={cards[currentIndex].back} />
                </div>

                <div className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Tap to flip · Drag to review
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3. Spaced Repetition Response Controls (Sleek backup buttons) */}
      {cards.length > 0 && (
        <div className={`grid grid-cols-3 gap-2 transition-all duration-300 select-none ${isFlipped ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'}`}>
          <button
            onClick={() => triggerSwipeAction('left')}
            className="flex flex-col items-center justify-center py-3 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 font-bold transition-all cursor-pointer group"
          >
            <Cancel01Icon size={18} className="mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase font-bold">Missed</span>
            <span className="text-[8px] font-medium text-rose-500/80">10m</span>
          </button>
          
          <button
            onClick={() => triggerSwipeAction('down')}
            className="flex flex-col items-center justify-center py-3 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 font-bold transition-all cursor-pointer group"
          >
            <ArrowRight01Icon size={18} className="mb-0.5 group-hover:translate-x-0.5 transition-transform rotate-90" />
            <span className="text-[10px] uppercase font-bold">Shaky</span>
            <span className="text-[8px] font-medium text-amber-500/80">1 day</span>
          </button>

          <button
            onClick={() => triggerSwipeAction('right')}
            className="flex flex-col items-center justify-center py-3 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold transition-all cursor-pointer group"
          >
            <Tick01Icon size={18} className="mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase font-bold">Got it</span>
            <span className="text-[8px] font-medium text-emerald-500/80">3 days</span>
          </button>
        </div>
      )}

    </div>
  );
};
