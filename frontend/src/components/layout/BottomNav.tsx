import React from 'react';
import { useApp, ScreenType } from '../../context/AppContext';
import { 
  Notebook01Icon, 
  Upload02Icon, 
  ChartBar01Icon 
} from '@/components/ui/icons';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigateTo } = useApp();

  // Distraction-free: Hide bottom nav on immersive study screens
  const hideNav = ['flashcards', 'quiz', 'boss'].includes(currentScreen);

  if (hideNav) return null;

  const tabs: { screen: ScreenType; label: string; icon: React.ComponentType<any> }[] = [
    { screen: 'home', label: 'Home', icon: Notebook01Icon },
    { screen: 'upload', label: 'Upload', icon: Upload02Icon },
    { screen: 'progress', label: 'Progress', icon: ChartBar01Icon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto px-6 py-2 bg-background/95 backdrop-blur-lg border-t border-border/40 flex items-center justify-around shadow-lg select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        // Check if active (Home matches home, detail, settings)
        const isActive = 
          currentScreen === tab.screen || 
          (tab.screen === 'home' && ['detail', 'settings'].includes(currentScreen));

        return (
          <button
            key={tab.screen}
            onClick={() => navigateTo(tab.screen)}
            className="flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl relative transition-all duration-300 group cursor-pointer"
          >
            {/* Active visual highlight bar under the icon */}
            {isActive && (
              <span className="absolute inset-0 bg-primary/10 rounded-2xl scale-100 transition-all duration-300" />
            )}

            <div className={`transition-transform duration-300 ${isActive ? 'scale-110 text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
              <Icon size={22} strokeWidth={isActive ? 2.0 : 1.5} />
            </div>
            
            <span className={`text-[10px] font-bold font-sans tracking-wide transition-all ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
