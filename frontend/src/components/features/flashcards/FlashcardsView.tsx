import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { getCardStates, updateCardDifficulty, saveManualCard } from '../../../db/db';
import { CardState, Flashcard } from '../../../types';
import { MathRenderer } from '../../ui/MathRenderer';
import { 
  ShuffleIcon, 
  Edit01Icon, 
  PlusSignIcon, 
  Task01Icon, 
  Tick01Icon, 
  Cancel01Icon, 
  ArrowRight01Icon,
  BookOpen01Icon,
  SparklesIcon
} from '@/components/ui/icons';

export const FlashcardsView: React.FC = () => {
  const { activeMaterial, navigateTo, goBack, refreshMaterials } = useApp();
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

  // Edit/Add Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [modalFront, setModalFront] = useState<string>('');
  const [modalBack, setModalBack] = useState<string>('');
  const [modalConceptId, setModalConceptId] = useState<string>('');
  const [modalHasFormula, setModalHasFormula] = useState<boolean>(false);

  if (!activeMaterial) return null;

  useEffect(() => {
    loadCards();
  }, [activeMaterial, isShuffle]);

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

      // If we have due cards, prioritize them! Otherwise, show all.
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

    // Smooth transition: flip back first, then change index
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 250);
  };

  // Mixed LaTeX parsing and rendering engine!
  const renderMixedLaTeX = (text: string) => {
    if (!text) return null;
    
    // Regular expression to match display $$formula$$ or inline $formula$
    const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
    
    return (
      <div className="space-y-2 leading-relaxed text-sm select-text">
        {parts.map((part, index) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const formula = part.slice(2, -2);
            return <MathRenderer key={index} formula={formula} displayMode={true} />;
          } else if (part.startsWith('$') && part.endsWith('$')) {
            const formula = part.slice(1, -1);
            return <MathRenderer key={index} formula={formula} displayMode={false} className="inline-block py-0 my-0" />;
          } else {
            return (
              <span key={index} className="whitespace-pre-line">
                {part}
              </span>
            );
          }
        })}
      </div>
    );
  };

  // Modal actions
  const openAddModal = () => {
    setModalMode('add');
    setModalFront('');
    setModalBack('');
    setModalConceptId(activeMaterial.concepts[0]?.id || 'c_custom');
    setModalHasFormula(false);
    setIsModalOpen(true);
  };

  const openEditModal = () => {
    if (cards.length === 0) return;
    const currentCard = cards[currentIndex];
    setModalMode('edit');
    setModalFront(currentCard.front);
    setModalBack(currentCard.back);
    setModalConceptId(currentCard.concept_id);
    setModalHasFormula(currentCard.back.includes('$') || currentCard.back.includes('$$'));
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFront.trim() || !modalBack.trim()) return;

    const currentCardId = modalMode === 'edit' ? cards[currentIndex].id : `fc_${Date.now()}`;
    const newCard: Flashcard = {
      id: currentCardId,
      front: modalFront,
      back: modalBack,
      concept_id: modalConceptId,
      difficulty: modalMode === 'edit' ? cards[currentIndex].difficulty : null
    };

    await saveManualCard(activeMaterial.id, newCard);
    await refreshMaterials();
    
    setIsModalOpen(false);
    loadCards(); // Reload cards list
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

        {/* Dynamic Stats Grid */}
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
    <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full font-sans justify-between relative min-h-[calc(100vh-60px)]">
      
      {/* 1. Header Toolbar */}
      <div className="flex justify-between items-center select-none py-1">
        <div className="flex items-center gap-1.5">
          {/* Progress badge */}
          <span className="text-xs font-bold px-3 py-1 bg-muted rounded-full text-foreground/80">
            {cards.length > 0 ? currentIndex + 1 : 0} / {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Shuffle Button */}
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-2 rounded-xl border border-border/40 transition-all cursor-pointer ${isShuffle ? 'bg-primary/10 text-primary border-primary/20' : 'bg-card text-muted-foreground'}`}
            title="Toggle Shuffle"
          >
            <ShuffleIcon size={18} />
          </button>

          {/* Edit current card */}
          {cards.length > 0 && (
            <button
              onClick={openEditModal}
              className="p-2 rounded-xl bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-all cursor-pointer"
              title="Edit Card"
            >
              <Edit01Icon size={18} />
            </button>
          )}

          {/* Add custom card */}
          <button
            onClick={openAddModal}
            className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
            title="Add Card"
          >
            <PlusSignIcon size={18} />
          </button>
        </div>
      </div>

      {/* 2. Immersion CSS 3D Flipping Card Section */}
      {cards.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto select-none">
          <BookOpen01Icon size={40} className="text-muted-foreground/60 mb-4" />
          <h4 className="font-heading font-bold text-base mb-1">No cards available</h4>
          <p className="text-xs text-muted-foreground max-w-[200px] mb-4">
            Try adding a custom flashcard using the "+" button in the top toolbar!
          </p>
        </div>
      ) : (
        <div 
          onClick={handleFlip}
          className="flex-1 flex items-center justify-center my-6 cursor-pointer select-none card-perspective"
        >
          <div className={`w-full h-80 rounded-[2.5rem] relative card-inner ${isFlipped ? 'flipped' : ''}`}>
            
            {/* FRONT FACE (Question) */}
            <div className="absolute inset-0 w-full h-full rounded-[2.5rem] bg-card border border-border/60 shadow-lg p-8 flex flex-col justify-between card-front select-none">
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                <span>Front Side</span>
                <span className="inline-flex items-center gap-1 text-primary">
                  <SparklesIcon size={10} /> Active recall
                </span>
              </div>
              
              <div className="flex-1 flex items-center justify-center text-center my-4 overflow-y-auto">
                <h3 className="font-heading font-extrabold text-lg text-foreground px-2 leading-relaxed">
                  {cards[currentIndex].front}
                </h3>
              </div>

              <div className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Tap to flip answer
              </div>
            </div>

            {/* BACK FACE (Answer + KaTeX Math) */}
            <div className="absolute inset-0 w-full h-full rounded-[2.5rem] bg-card border border-border/60 shadow-lg p-8 flex flex-col justify-between card-back select-none">
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                <span>Back Side</span>
                <span className="text-emerald-500">Explanation</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center my-4 overflow-y-auto pr-1 no-scrollbar text-center">
                {renderMixedLaTeX(cards[currentIndex].back)}
              </div>

              <div className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Tap card to flip back
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. Spaced Repetition Response Controls */}
      {cards.length > 0 && (
        <div className={`grid grid-cols-3 gap-2 transition-all duration-300 select-none ${isFlipped ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'}`}>
          <button
            onClick={() => handleReview('missed')}
            className="flex flex-col items-center justify-center py-3.5 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 font-bold transition-all cursor-pointer group"
          >
            <Cancel01Icon size={18} className="mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase font-bold">Missed</span>
            <span className="text-[8px] font-medium text-rose-500/80">10m</span>
          </button>
          
          <button
            onClick={() => handleReview('shaky')}
            className="flex flex-col items-center justify-center py-3.5 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 font-bold transition-all cursor-pointer group"
          >
            <ArrowRight01Icon size={18} className="mb-0.5 group-hover:translate-x-0.5 transition-transform" />
            <span className="text-[10px] uppercase font-bold">Shaky</span>
            <span className="text-[8px] font-medium text-amber-500/80">1 day</span>
          </button>

          <button
            onClick={() => handleReview('known')}
            className="flex flex-col items-center justify-center py-3.5 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold transition-all cursor-pointer group"
          >
            <Tick01Icon size={18} className="mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase font-bold">Got it</span>
            <span className="text-[8px] font-medium text-emerald-500/80">3 days</span>
          </button>
        </div>
      )}

      {/* 4. IMMERSIVE FLASHCARD EDIT / ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md select-none font-sans">
          <div className="w-full max-w-sm rounded-[2rem] bg-card border border-border shadow-2xl p-6 relative">
            <h3 className="font-heading font-extrabold text-lg text-foreground mb-4">
              {modalMode === 'add' ? 'Add Custom Card' : 'Edit Flashcard'}
            </h3>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Front Side (Question)</label>
                <textarea
                  value={modalFront}
                  onChange={(e) => setModalFront(e.target.value)}
                  placeholder="e.g. What is the formula for Force?"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-muted/30 focus:outline-none focus:border-primary text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Back Side (Answer)</label>
                <textarea
                  value={modalBack}
                  onChange={(e) => setModalBack(e.target.value)}
                  placeholder="e.g. Force is F = ma. Use $F = ma$ for inline math or $$F = ma$$ for centered math."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-muted/30 focus:outline-none focus:border-primary text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Link to Concept</label>
                <select
                  value={modalConceptId}
                  onChange={(e) => setModalConceptId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-card text-foreground focus:outline-none focus:border-primary text-xs"
                >
                  {activeMaterial.concepts.map(c => (
                    <option key={c.id} value={c.id}>{c.term}</option>
                  ))}
                  <option value="c_custom">General Concept</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-muted text-foreground font-bold rounded-2xl text-xs hover:bg-muted/80 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-2xl text-xs hover:scale-105 transition-all cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
