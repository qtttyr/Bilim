import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft01Icon, 
  Settings01Icon, 
  Sun03Icon, 
  Moon02Icon, 
  FireIcon 
} from '@/components/ui/icons';

export const AppHeader: React.FC = () => {
  const { currentScreen, goBack, navigateTo, theme, toggleTheme, stats, activeMaterial } = useApp();

  const isInnerScreen = [
    'detail', 
    'flashcards', 
    'quiz', 
    'boss', 
    'settings'
  ].includes(currentScreen);

  const getTitle = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <span className="font-heading font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
            Bilim
          </span>
        );
      case 'upload':
        return 'Upload';
      case 'progress':
        return 'Progress';
      case 'settings':
        return 'Settings';
      case 'detail':
        return activeMaterial ? activeMaterial.title : 'Material';
      case 'flashcards':
        return 'Flashcards';
      case 'quiz':
        return 'Quick Quiz';
      case 'boss':
        return '🔥 Boss Mode';
      default:
        return 'Bilim';
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border/40 select-none">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {isInnerScreen ? (
          <button
            onClick={goBack}
            className="flex items-center justify-center p-2 rounded-xl bg-muted/40 hover:bg-muted/80 text-foreground transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft01Icon size={20} strokeWidth={1.5} />
          </button>
        ) : null}
        
        <h1 className="font-heading font-bold text-lg text-foreground truncate max-w-[200px]">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Streak Flame Badge */}
        {stats.streak > 0 && (
          <div 
            onClick={() => navigateTo('progress')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-orange-600 dark:text-orange-400 cursor-pointer hover:scale-105 active:scale-95 transition-all select-none"
            title="Your Daily Study Streak!"
          >
            <FireIcon size={16} strokeWidth={2.0} className="fill-orange-500 text-orange-500 animate-pulse-fire" />
            <span className="text-xs font-bold font-sans">{stats.streak}d</span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun03Icon size={20} strokeWidth={1.5} className="text-amber-400" />
          ) : (
            <Moon02Icon size={20} strokeWidth={1.5} className="text-indigo-600" />
          )}
        </button>

        {/* Settings gear (only on main screens) */}
        {!isInnerScreen && (
          <button
            onClick={() => navigateTo('settings')}
            className="flex items-center justify-center p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            aria-label="Open Settings"
          >
            <Settings01Icon size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </header>
  );
};
