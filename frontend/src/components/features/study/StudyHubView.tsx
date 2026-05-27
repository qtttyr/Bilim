import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { getCardStates, getQuizHistory, deleteMaterial } from '../../../db/db';
import { CardState, QuizHistory } from '../../../types';
import { 
  SparklesIcon, 
  LayersIcon, 
  BubbleChatCheckIcon, 
  ZapIcon, 
  Trash01Icon,
  Calendar01Icon,
  BookOpen02Icon,
  ArrowRight01Icon
} from '@/components/ui/icons';

export const StudyHubView: React.FC = () => {
  const { activeMaterial, navigateTo, goBack, refreshMaterials } = useApp();
  const [dueCount, setDueCount] = useState<number>(0);
  const [weakCount, setWeakCount] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number | null>(null);

  if (!activeMaterial) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-4">No active material selected.</p>
        <button onClick={goBack} className="px-4 py-2 bg-primary text-primary-foreground rounded-2xl">
          Go Back
        </button>
      </div>
    );
  }

  useEffect(() => {
    const fetchMaterialDetails = async () => {
      try {
        const states: CardState[] = await getCardStates(activeMaterial.id);
        const history: QuizHistory[] = await getQuizHistory(activeMaterial.id);

        // Count due cards
        const now = Date.now();
        const due = states.filter(s => s.nextReview <= now).length;
        setDueCount(due);

        // Count weak cards (difficulty is missed or shaky)
        const weak = states.filter(s => s.difficulty === 'missed' || s.difficulty === 'shaky').length;
        setWeakCount(weak);

        // Compute best score
        if (history.length > 0) {
          const maxScore = Math.max(...history.map(h => h.score));
          setBestScore(maxScore);
        } else {
          setBestScore(null);
        }
      } catch (err) {
        console.error('Failed to load card states in Study Hub', err);
      }
    };

    fetchMaterialDetails();
  }, [activeMaterial]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete "${activeMaterial.title}"? This will wipe all its flashcards, quizzes, and study history.`)) {
      try {
        await deleteMaterial(activeMaterial.id);
        await refreshMaterials();
        navigateTo('home');
      } catch (err) {
        console.error(err);
        alert('Failed to delete material.');
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-1 p-4 font-sans max-w-md mx-auto w-full">
      
      {/* TITLE & META */}
      <div className="mb-6">
        <h2 className="font-heading font-extrabold text-2xl text-foreground mb-2 leading-tight">
          {activeMaterial.title}
        </h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar01Icon size={14} />
          <span>Uploaded on {formatDate(activeMaterial.createdAt)}</span>
          {activeMaterial.isTruncated && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold text-[10px]">
              Truncated Focus
            </span>
          )}
        </div>
      </div>

      {/* AI SUMMARY CARD */}
      <div className="mb-8 p-5 rounded-3xl bg-card border border-border/40 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:scale-125 transition-transform" />
        <div className="flex items-center gap-2 text-xs font-bold text-primary mb-3">
          <SparklesIcon size={14} className="animate-pulse" />
          <span className="font-sans uppercase tracking-wider">AI Summary</span>
        </div>
        <p className="font-serif text-sm leading-relaxed text-foreground/90 font-medium italic">
          "{activeMaterial.summary}"
        </p>
      </div>

      {/* MODES SECTION */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-base text-foreground px-1">
          Select Study Mode
        </h3>

        {/* 1. Flashcards Mode */}
        <button
          onClick={() => navigateTo('flashcards')}
          className="w-full flex items-center justify-between p-4 rounded-3xl bg-card border border-border/40 hover:border-emerald-500/30 hover:scale-[1.02] hover:shadow-sm transition-all duration-300 active:scale-[0.99] group text-left cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <LayersIcon size={24} />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Flashcards
              </h4>
              <p className="text-xs text-muted-foreground">
                {activeMaterial.flashcards.length} cards · Spaced repetition
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {dueCount > 0 ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                {dueCount} due
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-bold text-[10px]">
                All caught up
              </span>
            )}
            <ArrowRight01Icon size={16} className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
        </button>

        {/* 2. Quick Quiz Mode */}
        <button
          onClick={() => navigateTo('quiz')}
          className="w-full flex items-center justify-between p-4 rounded-3xl bg-card border border-border/40 hover:border-teal-500/30 hover:scale-[1.02] hover:shadow-sm transition-all duration-300 active:scale-[0.99] group text-left cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BubbleChatCheckIcon size={24} />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Quick Quiz
              </h4>
              <p className="text-xs text-muted-foreground">
                {activeMaterial.quiz.length} questions · ~3 mins active recall
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {bestScore !== null ? (
              <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-bold text-[10px]">
                Best: {bestScore}/5
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-bold text-[10px]">
                Not taken
              </span>
            )}
            <ArrowRight01Icon size={16} className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
        </button>

        {/* 3. Boss Mode */}
        <button
          onClick={() => navigateTo('boss')}
          disabled={weakCount === 0}
          className="w-full flex items-center justify-between p-4 rounded-3xl bg-card border border-border/40 hover:border-orange-500/30 hover:scale-[1.02] hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border/40 disabled:hover:shadow-sm transition-all duration-300 active:scale-[0.99] group text-left cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <ZapIcon size={24} />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                Boss Mode
              </h4>
              <p className="text-xs text-muted-foreground">
                High pressure · Hit weak spots fast
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {weakCount > 0 ? (
              <span className="px-2.5 py-1 rounded-full bg-orange-500 text-white font-bold text-[10px] animate-pulse">
                {weakCount} weak spots
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-bold text-[10px]">
                0 weak cards
              </span>
            )}
            <ArrowRight01Icon size={16} className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
        </button>
      </div>

      {/* DELETE BUTTON */}
      <div className="mt-12 flex justify-center px-4 select-none">
        <button
          onClick={handleDelete}
          className="flex items-center justify-center gap-2 text-xs font-bold text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/5 px-4 py-2.5 rounded-2xl border border-rose-500/10 transition-all cursor-pointer"
        >
          <Trash01Icon size={14} />
          Delete Study Material
        </button>
      </div>

    </div>
  );
};
