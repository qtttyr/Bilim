import React from 'react';
import { useApp } from '../../../context/AppContext';
import { useCardEditor } from './useCardEditor';
import { MixedTextRenderer } from '../../ui/MathRenderer';
import { 
  ArrowLeft01Icon, 
  PlusSignIcon, 
  Trash01Icon, 
  Tick01Icon, 
  Cancel01Icon, 
  SparklesIcon,
  BookOpen01Icon,
  ArrowRight01Icon
} from '@/components/ui/icons';

export const CardEditorView: React.FC = () => {
  const { goBack } = useApp();
  const {
    activeMaterial,
    cards,
    expandedCardId,
    editFront,
    setEditFront,
    editBack,
    setEditBack,
    editConceptId,
    setEditConceptId,
    isAdding,
    newFront,
    setNewFront,
    newBack,
    setNewBack,
    newConceptId,
    setNewConceptId,
    toggleExpandCard,
    handleSaveEdit,
    handleDeleteCard,
    handleCreateCard,
    toggleAdding
  } = useCardEditor();

  if (!activeMaterial) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-background font-sans select-none overflow-hidden">
      
      {/* 1. Glassmorphic Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={goBack}
            className="p-2 rounded-xl bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-all cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft01Icon size={18} strokeWidth={2.0} />
          </button>
          
          <div>
            <h2 className="font-heading font-extrabold text-base text-foreground leading-tight">
              Card Editor
            </h2>
            <p className="text-[10px] text-muted-foreground font-semibold truncate max-w-[200px]">
              {activeMaterial.title}
            </p>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={toggleAdding}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            isAdding 
              ? 'bg-muted text-foreground hover:bg-muted/80' 
              : 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
          }`}
        >
          {isAdding ? (
            <>
              <Cancel01Icon size={14} strokeWidth={2.5} />
              Cancel
            </>
          ) : (
            <>
              <PlusSignIcon size={14} strokeWidth={2.5} />
              Add Card
            </>
          )}
        </button>
      </header>

      {/* 2. Scrollable View Area */}
      <main className="flex-grow overflow-y-auto px-4 py-4 space-y-4 no-scrollbar pb-24">
        
        {/* ADD CARD PANEL */}
        {isAdding && (
          <div className="p-5 rounded-3xl bg-card border border-primary/20 shadow-md animate-fade-in space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary border-b border-border/20 pb-2">
              <SparklesIcon size={14} />
              <span>Create Custom Card</span>
            </div>

            <div className="space-y-3.5">
              {/* Question Input */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Front (Question)</label>
                <textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. What is the derivative of $x^2$?"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-muted/20 focus:outline-none focus:border-primary text-xs font-medium leading-relaxed resize-none"
                />
              </div>

              {/* Answer Input */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Back (Answer)</label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. The derivative is $2x$. Using the power rule: $$\frac{d}{dx}x^n = nx^{n-1}$$"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-muted/20 focus:outline-none focus:border-primary text-xs font-medium leading-relaxed resize-none"
                />
              </div>

              {/* Concept Selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Link to Concept</label>
                <select
                  value={newConceptId}
                  onChange={(e) => setNewConceptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-border bg-card text-foreground focus:outline-none focus:border-primary text-xs font-semibold"
                >
                  {activeMaterial.concepts.map(c => (
                    <option key={c.id} value={c.id}>{c.term}</option>
                  ))}
                  <option value="c_custom">General / Custom Concept</option>
                </select>
              </div>

              {/* LIVE LATEX PREVIEW (PREMIUM FEEL) */}
              {(newFront.trim() || newBack.trim()) && (
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/30 text-xs space-y-3 select-text">
                  <div className="font-extrabold uppercase text-[9px] text-muted-foreground tracking-wider">Live Preview</div>
                  
                  {newFront.trim() && (
                    <div className="space-y-1">
                      <div className="text-[9px] font-bold text-muted-foreground/80">Question (Front):</div>
                      <div className="p-3 rounded-xl bg-card border border-border/40 text-foreground text-center">
                        <MixedTextRenderer text={newFront} className="font-heading font-extrabold text-sm" />
                      </div>
                    </div>
                  )}

                  {newBack.trim() && (
                    <div className="space-y-1">
                      <div className="text-[9px] font-bold text-muted-foreground/80">Answer (Back):</div>
                      <div className="p-3 rounded-xl bg-card border border-border/40 text-foreground text-center">
                        <MixedTextRenderer text={newBack} className="text-xs" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Create Action */}
              <button
                onClick={handleCreateCard}
                disabled={!newFront.trim() || !newBack.trim()}
                className="w-full py-3.5 bg-primary text-primary-foreground font-black rounded-2xl text-xs hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Tick01Icon size={14} strokeWidth={2.5} />
                Save New Card
              </button>
            </div>
          </div>
        )}

        {/* CARDS ACCORDION LISTING */}
        <div className="space-y-2.5">
          <h3 className="font-heading font-bold text-sm text-foreground px-1 mb-1.5 flex items-center justify-between">
            <span>Flashcards ({cards.length})</span>
            <span className="text-[10px] text-muted-foreground font-sans">Tap to expand and edit</span>
          </h3>

          {cards.length === 0 ? (
            <div className="p-8 rounded-3xl bg-card border border-border/40 text-center flex flex-col items-center justify-center">
              <BookOpen01Icon size={32} className="text-muted-foreground/50 mb-3" />
              <p className="text-xs text-muted-foreground font-semibold max-w-[200px]">
                No cards created yet. Press "+ Add Card" to create your first flashcard.
              </p>
            </div>
          ) : (
            cards.map((card, index) => {
              const isExpanded = expandedCardId === card.id;
              const concept = activeMaterial.concepts.find(c => c.id === card.concept_id);
              
              return (
                <div 
                  key={card.id}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isExpanded 
                      ? 'bg-card border-primary/20 shadow-md p-5' 
                      : 'bg-card border-border/40 hover:border-border p-4 cursor-pointer hover:bg-muted/10'
                  }`}
                  onClick={() => !isExpanded && toggleExpandCard(card.id)}
                >
                  {/* Header row (always visible) */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-black text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                          Card #{index + 1}
                        </span>
                        
                        <span className="text-[9px] font-bold truncate max-w-[150px] px-2 py-0.5 bg-primary/5 text-primary border border-primary/10 rounded-full">
                          {concept ? concept.term : 'General'}
                        </span>
                      </div>

                      {!isExpanded && (
                        <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-1 truncate select-none">
                          {card.front}
                        </h4>
                      )}
                    </div>

                    {!isExpanded && (
                      <button 
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/40 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandCard(card.id);
                        }}
                      >
                        <ArrowRight01Icon size={14} className="rotate-90 text-muted-foreground/60" />
                      </button>
                    )}
                  </div>

                  {/* Expanded Edit Form */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                      
                      {/* Front Input */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Front (Question)</label>
                        <textarea
                          value={editFront}
                          onChange={(e) => setEditFront(e.target.value)}
                          placeholder="Front text"
                          rows={2}
                          className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-muted/20 focus:outline-none focus:border-primary text-xs font-medium leading-relaxed resize-none"
                        />
                      </div>

                      {/* Back Input */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Back (Answer)</label>
                        <textarea
                          value={editBack}
                          onChange={(e) => setEditBack(e.target.value)}
                          placeholder="Back text"
                          rows={3}
                          className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-muted/20 focus:outline-none focus:border-primary text-xs font-medium leading-relaxed resize-none"
                        />
                      </div>

                      {/* Concept link */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Link to Concept</label>
                        <select
                          value={editConceptId}
                          onChange={(e) => setEditConceptId(e.target.value)}
                          className="w-full px-3 py-2 rounded-2xl border border-border bg-card text-foreground focus:outline-none focus:border-primary text-xs font-semibold"
                        >
                          {activeMaterial.concepts.map(c => (
                            <option key={c.id} value={c.id}>{c.term}</option>
                          ))}
                          <option value="c_custom">General / Custom Concept</option>
                        </select>
                      </div>

                      {/* LIVE PREVIEW FOR EDITING */}
                      {(editFront.trim() || editBack.trim()) && (
                        <div className="p-4 rounded-2xl bg-muted/40 border border-border/30 text-xs space-y-3 select-text">
                          <div className="font-extrabold uppercase text-[9px] text-muted-foreground tracking-wider">Live Preview</div>
                          
                          {editFront.trim() && (
                            <div className="space-y-1">
                              <div className="text-[9px] font-bold text-muted-foreground/80">Question (Front):</div>
                              <div className="p-3 rounded-xl bg-card border border-border/40 text-foreground text-center">
                                <MixedTextRenderer text={editFront} className="font-heading font-extrabold text-sm" />
                              </div>
                            </div>
                          )}

                          {editBack.trim() && (
                            <div className="space-y-1">
                              <div className="text-[9px] font-bold text-muted-foreground/80">Answer (Back):</div>
                              <div className="p-3 rounded-xl bg-card border border-border/40 text-foreground text-center">
                                <MixedTextRenderer text={editBack} className="text-xs" />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteCard(card.id)}
                          className="px-4 py-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          title="Delete Card"
                        >
                          <Trash01Icon size={14} />
                          Delete
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleExpandCard(card.id)}
                          className="flex-1 py-3 bg-muted text-foreground hover:bg-muted/80 font-bold rounded-2xl text-xs transition-all cursor-pointer"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveEdit(card.id)}
                          disabled={!editFront.trim() || !editBack.trim()}
                          className="flex-1 py-3 bg-primary text-primary-foreground font-black rounded-2xl text-xs hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                        >
                          <Tick01Icon size={14} strokeWidth={2.5} />
                          Save
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </main>

    </div>
  );
};
