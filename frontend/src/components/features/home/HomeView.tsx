import React, { useEffect, useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { getCardStates, getDB } from '../../../db/db';
import { CardState } from '../../../types';
import { 
  PlusSignIcon, 
  FireIcon, 
  Calendar01Icon, 
  Brain01Icon,
  BookOpen01Icon,
  BubbleChatCheckIcon
} from '@/components/ui/icons';

export const HomeView: React.FC = () => {
  const { materials, navigateTo, setActiveMaterial, stats, refreshMaterials } = useApp();
  const [dueCount, setDueCount] = useState<number>(0);
  const [materialStats, setMaterialStats] = useState<Record<string, {
    health: number;
    known: number;
    shaky: number;
    missed: number;
    total: number;
  }>>({});

  useEffect(() => {
    refreshMaterials();
  }, []);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const db = await getDB();
        const allStates: CardState[] = await db.getAll('card_state');
        
        // Compute due count (nextReview <= now, and not null difficulty or review count > 0)
        // If a card is brand new (difficulty is null), it is also due for initial study!
        const now = Date.now();
        const due = allStates.filter(s => s.nextReview <= now).length;
        setDueCount(due);

        // Compute per-material stats
        const tempStats: typeof materialStats = {};
        for (const m of materials) {
          const mStates = allStates.filter(s => s.material_id === m.id);
          
          let known = 0;
          let shaky = 0;
          let missed = 0;
          const total = m.flashcards.length;

          mStates.forEach(s => {
            if (s.difficulty === 'known') known++;
            else if (s.difficulty === 'shaky') shaky++;
            else if (s.difficulty === 'missed') missed++;
            else missed++; // Treat unstudied as missed/due
          });

          // If no states found in DB, default all to due/missed
          if (mStates.length === 0) {
            missed = total;
          }

          const health = total > 0 
            ? Math.round(((known * 1 + shaky * 0.5 + missed * 0) / total) * 100) 
            : 0;

          tempStats[m.id] = { health, known, shaky, missed, total };
        }
        setMaterialStats(tempStats);
      } catch (err) {
        console.error('Error fetching card states', err);
      }
    };

    if (materials.length > 0) {
      fetchStates();
    }
  }, [materials]);

  const handleMaterialClick = (m: any) => {
    setActiveMaterial(m);
    navigateTo('detail');
  };

  const getHealthColor = (health: number) => {
    if (health >= 70) return 'bg-gradient-to-r from-emerald-500 to-teal-400';
    if (health >= 40) return 'bg-gradient-to-r from-amber-500 to-orange-400';
    return 'bg-gradient-to-r from-rose-500 to-red-400';
  };

  const getHealthTextColor = (health: number) => {
    if (health >= 70) return 'text-emerald-600 dark:text-emerald-400';
    if (health >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-1 p-4 relative font-sans">
      
      {/* STREAK & DUE CARD SUMMARY */}
      <div className="mb-6 p-5 rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-650 text-white shadow-lg relative overflow-hidden select-none border border-emerald-500/25 dark:from-emerald-800 dark:to-teal-900">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/12 backdrop-blur-md shadow-inner">
              <FireIcon size={26} className="fill-orange-400 text-orange-400 animate-pulse-fire" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-100/90 font-bold tracking-wider uppercase">Daily Streak</p>
              <h2 className="text-xl font-heading font-black tracking-tight">{stats.streak} Days Active</h2>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1.5 rounded-2xl bg-white/12 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wide border border-white/10">
              {dueCount} cards due
            </span>
          </div>
        </div>
      </div>

      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-lg text-foreground">
          Study Materials
        </h3>
        <span className="text-xs text-muted-foreground font-sans">
          {materials.length} total
        </span>
      </div>

      {/* MATERIALS LIST */}
      {materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-bounce">
            <BookOpen01Icon size={32} strokeWidth={1.5} />
          </div>
          <h4 className="font-heading font-bold text-lg mb-2 text-foreground">No materials uploaded</h4>
          <p className="text-sm text-muted-foreground max-w-[260px] mb-6">
            Upload your lecture notes, PDFs, or articles to start learning with spaced repetition.
          </p>
          <button
            onClick={() => navigateTo('upload')}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <PlusSignIcon size={18} strokeWidth={2.0} />
            Upload First Material
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {materials.map((m) => {
            const mStat = materialStats[m.id] || { health: 0, known: 0, shaky: 0, missed: 0, total: m.flashcards.length };
            return (
              <div
                key={m.id}
                onClick={() => handleMaterialClick(m)}
                className="group p-4 rounded-3xl bg-card border border-border/40 hover:border-primary/30 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="font-heading font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {m.title}
                  </h4>
                </div>

                {/* Subtitle / Date */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar01Icon size={12} />
                    <span>{formatDate(m.createdAt)}</span>
                  </div>
                  <span>•</span>
                  <span>{mStat.total} flashcards</span>
                </div>

                {/* Memory Health Section */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-muted-foreground">Memory Health</span>
                    <span className={`font-bold ${getHealthTextColor(mStat.health)}`}>
                      {mStat.health}%
                    </span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getHealthColor(mStat.health)}`}
                      style={{ width: `${mStat.health}%` }}
                    />
                  </div>
                </div>

                {/* Badges Info */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  <span className="text-[10px] font-bold font-sans tracking-wide px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {mStat.known} known
                  </span>
                  <span className="text-[10px] font-bold font-sans tracking-wide px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {mStat.shaky} shaky
                  </span>
                  <span className="text-[10px] font-bold font-sans tracking-wide px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    {mStat.missed} missed
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING ACTION BUTTON (FAB) */}
      <button
        onClick={() => navigateTo('upload')}
        className="fixed bottom-20 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-110 active:scale-90 transition-all cursor-pointer"
        aria-label="Upload new material"
      >
        <PlusSignIcon size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
};
