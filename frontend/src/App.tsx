import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { HomeView } from './components/features/home/HomeView';
import { UploadView } from './components/features/upload/UploadView';
import { StudyHubView } from './components/features/study/StudyHubView';
import { FlashcardsView } from './components/features/flashcards/FlashcardsView';
import { QuizView } from './components/features/quiz/QuizView';
import { BossModeView } from './components/features/boss/BossModeView';
import { ProgressView } from './components/features/progress/ProgressView';
import { SettingsView } from './components/features/settings/SettingsView';
import { CardEditorView } from './components/features/flashcards/CardEditorView';
import './App.css';

const MainAppContent: React.FC = () => {
  const { currentScreen } = useApp();

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeView />;
      case 'upload':
        return <UploadView />;
      case 'progress':
        return <ProgressView />;
      case 'settings':
        return <SettingsView />;
      case 'detail':
        return <StudyHubView />;
      case 'flashcards':
        return <FlashcardsView />;
      case 'quiz':
        return <QuizView />;
      case 'boss':
        return <BossModeView />;
      case 'card-editor':
        return <CardEditorView />;
      default:
        return <HomeView />;
    }
  };

  const isImmersive = ['flashcards', 'quiz', 'boss', 'card-editor'].includes(currentScreen);

  return (
    <div className={`safe-layout ${isImmersive ? '!pb-0 h-[100dvh] overflow-hidden' : ''}`}>
      {/* Header Toolbar */}
      <AppHeader />
      
      {/* Immersive Scrollable View Body */}
      <main className={`flex-grow flex flex-col ${isImmersive ? 'pb-0 overflow-hidden' : 'pb-8'}`}>
        {renderActiveScreen()}
      </main>

      {/* Global Mobile Bottom Tab Navigation */}
      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
