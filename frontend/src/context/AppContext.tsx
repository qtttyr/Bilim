import React, { createContext, useContext, useState, useEffect } from 'react';
import { Material, UserStats } from '../types';
import { getMaterials, getUserStats } from '../db/db';

export type ScreenType = 
  | 'home' 
  | 'upload' 
  | 'progress' 
  | 'settings' 
  | 'detail' 
  | 'flashcards' 
  | 'quiz' 
  | 'boss'
  | 'card-editor';

interface AppContextProps {
  currentScreen: ScreenType;
  screenHistory: ScreenType[];
  navigateTo: (screen: ScreenType) => void;
  goBack: () => void;
  activeMaterial: Material | null;
  setActiveMaterial: (material: Material | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  materials: Material[];
  refreshMaterials: () => Promise<void>;
  stats: UserStats;
  refreshStats: () => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>([]);
  const [activeMaterial, setActiveMaterialState] = useState<Material | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stats, setStats] = useState<UserStats>(getUserStats());
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('bilim_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    // Prefer dark mode out of the box if system prefers, otherwise light
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Load materials on startup
  useEffect(() => {
    refreshMaterials();
  }, []);

  // Sync theme with HTML class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('bilim_theme', theme);
  }, [theme]);

  const refreshMaterials = async () => {
    try {
      const data = await getMaterials();
      // Sort: newest first
      data.sort((a, b) => b.createdAt - a.createdAt);
      setMaterials(data);
      
      // If active material was updated, refresh its reference
      if (activeMaterial) {
        const updated = data.find(m => m.id === activeMaterial.id);
        if (updated) {
          setActiveMaterialState(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load materials from IndexedDB', err);
    }
  };

  const refreshStats = () => {
    setStats(getUserStats());
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navigateTo = (screen: ScreenType) => {
    setScreenHistory(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);
    // Smooth scroll to top of page
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory(prevHistory => prevHistory.slice(0, -1));
      setCurrentScreen(prev);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      setCurrentScreen('home');
    }
  };

  const setActiveMaterial = (material: Material | null) => {
    setActiveMaterialState(material);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        screenHistory,
        navigateTo,
        goBack,
        activeMaterial,
        setActiveMaterial,
        theme,
        toggleTheme,
        materials,
        refreshMaterials,
        stats,
        refreshStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
