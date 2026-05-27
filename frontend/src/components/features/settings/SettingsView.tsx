import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { exportAllDataJSON, importAllDataJSON, clearAllData } from '../../../db/db';
import { 
  UserIcon, 
  Notification02Icon, 
  Sun01Icon, 
  Moon02Icon, 
  Download02Icon, 
  Upload02Icon, 
  CleanIcon, 
  Tick01Icon,
  Help02Icon,
  ArrowLeft01Icon
} from '@/components/ui/icons';

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme, navigateTo, refreshMaterials, refreshStats } = useApp();
  
  // Settings values stored locally
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('bilim_username') || 'Student';
  });
  
  const [dailyReminder, setDailyReminder] = useState<boolean>(() => {
    return localStorage.getItem('bilim_daily_reminder') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('bilim_username', username);
  }, [username]);

  useEffect(() => {
    localStorage.setItem('bilim_daily_reminder', String(dailyReminder));
    if (dailyReminder) {
      requestNotificationPermission();
    }
  }, [dailyReminder]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      } else {
        setDailyReminder(false);
      }
    }
  };

  const handleExport = async () => {
    try {
      const dataStr = await exportAllDataJSON();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `bilim_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      console.error(err);
      alert('Failed to export data.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonStr = event.target?.result as string;
          await importAllDataJSON(jsonStr);
          await refreshMaterials();
          refreshStats();
          alert('Data imported successfully!');
          navigateTo('home');
        } catch (err) {
          console.error(err);
          alert('Failed to import data. Please ensure the file is a valid Bilim backup file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('WARNING: This will permanently wipe all uploaded materials, study progress, history, streaks, and settings! This action CANNOT be undone. Are you absolutely sure?')) {
      try {
        await clearAllData();
        await refreshMaterials();
        refreshStats();
        
        setUsername('Student');
        setDailyReminder(false);
        
        alert('All databases cleared successfully.');
        navigateTo('home');
      } catch (err) {
        console.error(err);
        alert('Failed to clear database.');
      }
    }
  };

  return (
    <div className="flex-1 p-4 font-sans max-w-md mx-auto w-full select-none">
      <div className="mb-6">
        <h2 className="font-heading font-extrabold text-2xl text-foreground mb-1 tracking-tight">
          Application Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Customize your study preferences and manage local database storage.
        </p>
      </div>

      {/* USER PROFILE CARD */}
      <div className="p-5 rounded-3xl bg-card border border-border/40 shadow-sm space-y-4 mb-6">
        <h3 className="text-xs font-black uppercase text-muted-foreground flex items-center gap-1.5 px-0.5">
          <UserIcon size={14} /> Profile
        </h3>
        
        <div className="space-y-1.5">
          <label htmlFor="user-name-settings" className="text-xs font-bold text-foreground">
            Your Name
          </label>
          <input
            id="user-name-settings"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-border/80 bg-background text-foreground focus:outline-none focus:border-primary text-sm shadow-sm font-semibold"
          />
        </div>
      </div>

      {/* PREFERENCES CARD */}
      <div className="p-5 rounded-3xl bg-card border border-border/40 shadow-sm space-y-4 mb-6">
        <h3 className="text-xs font-black uppercase text-muted-foreground flex items-center gap-1.5 px-0.5">
          <Help02Icon size={14} /> Preferences
        </h3>

        {/* 1. Daily reminder notification toggle */}
        <div className="flex items-center justify-between py-1 border-b border-border/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Notification02Icon size={18} />
            </div>
            <div>
              <span className="block text-xs font-bold text-foreground">Daily Reminder</span>
              <span className="text-[10px] text-muted-foreground">PWA push reminders</span>
            </div>
          </div>
          <button
            onClick={() => setDailyReminder(prev => !prev)}
            className={`w-11 h-6 rounded-full p-1 transition-all cursor-pointer ${dailyReminder ? 'bg-primary flex justify-end' : 'bg-muted border border-border/60 flex justify-start'}`}
          >
            <span className="w-4 h-4 rounded-full bg-card shadow-sm block" />
          </button>
        </div>

        {/* 2. Theme switch toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {theme === 'dark' ? <Moon02Icon size={18} /> : <Sun01Icon size={18} />}
            </div>
            <div>
              <span className="block text-xs font-bold text-foreground">Dark Mode</span>
              <span className="text-[10px] text-muted-foreground">Swap dark/light theme</span>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-11 h-6 rounded-full p-1 transition-all cursor-pointer ${theme === 'dark' ? 'bg-primary flex justify-end' : 'bg-muted border border-border/60 flex justify-start'}`}
          >
            <span className="w-4 h-4 rounded-full bg-card shadow-sm block" />
          </button>
        </div>
      </div>

      {/* STORAGE & UTILITIES CARD */}
      <div className="p-5 rounded-3xl bg-card border border-border/40 shadow-sm space-y-4 mb-8">
        <h3 className="text-xs font-black uppercase text-muted-foreground flex items-center gap-1.5 px-0.5">
          <Download02Icon size={14} /> Data & Database
        </h3>

        {/* Export JSON */}
        <button
          onClick={handleExport}
          className="w-full flex items-center justify-between py-2 border-b border-border/20 text-left cursor-pointer group text-xs text-foreground font-semibold"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Download02Icon size={16} />
            </div>
            <span>Export database backup (JSON)</span>
          </div>
          <ArrowLeft01Icon size={14} className="rotate-180 text-muted-foreground group-hover:text-foreground transition-all" />
        </button>

        {/* Import JSON */}
        <label
          className="w-full flex items-center justify-between py-2 border-b border-border/20 text-left cursor-pointer group text-xs text-foreground font-semibold"
        >
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload02Icon size={16} />
            </div>
            <span>Import database backup (JSON)</span>
          </div>
          <ArrowLeft01Icon size={14} className="rotate-180 text-muted-foreground group-hover:text-foreground transition-all" />
        </label>

        {/* Clear Data */}
        <button
          onClick={handleClearData}
          className="w-full flex items-center justify-between py-2 text-left cursor-pointer group text-xs text-rose-500 font-semibold"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CleanIcon size={16} />
            </div>
            <span>Wipe all local data & reset</span>
          </div>
          <ArrowLeft01Icon size={14} className="rotate-180 text-rose-500/80 group-hover:text-rose-500 transition-all" />
        </button>
      </div>

      {/* FOOTER APP VERSION */}
      <div className="text-center pb-6">
        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest block mb-1">
          Bilim Study Client
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground/40 block">
          v1.0.0 · Local IndexedDB Storage · PWA Offline Ready
        </span>
      </div>

    </div>
  );
};
