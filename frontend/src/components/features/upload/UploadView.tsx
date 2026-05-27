import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { ingestMaterial, scrapeUrlText } from '../../../services/api';
import { addMaterial } from '../../../db/db';
import { 
  Upload02Icon, 
  TextFilesIcon, 
  LinkIcon, 
  Brain02Icon, 
  Notebook02Icon, 
  SparklesIcon,
  CircleAlertIcon,
  Tick01Icon
} from '@/components/ui/icons';

export const UploadView: React.FC = () => {
  const { navigateTo, setActiveMaterial, refreshMaterials } = useApp();
  const [activeTab, setActiveTab] = useState<'file' | 'text' | 'url'>('file');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  
  // Form inputs
  const [pastedText, setPastedText] = useState<string>('');
  const [pastedTitle, setPastedTitle] = useState<string>('');
  const [webUrl, setWebUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycling status messages during AI extraction
  const loadingMessages = [
    'Scanning document and extracting text...',
    'Analyzing text depth & performing smart truncation...',
    'Consulting Gemini 3.0 Flash for core concepts...',
    'Structuring custom flashcards and formulas via KaTeX...',
    'Drafting multiple-choice questions & explanatory answers...',
    'Finalizing Bilim local memory health workspace...'
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['pdf', 'docx', 'txt'].includes(ext || '')) {
        setSelectedFile(file);
      } else {
        alert('Supported formats: PDF, DOCX, TXT.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let title = '';
    let content = '';
    
    if (activeTab === 'file') {
      if (!selectedFile) return;
      title = selectedFile.name.replace(/\.[^/.]+$/, ""); // strip extension
      content = `Simulated document content of ${selectedFile.name}. Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of all quantum physics including quantum chemistry, quantum field theory, quantum technology, and quantum information science. Wave-particle duality, superposition, and quantum entanglement are major pillars. The Schrödinger equation governs the time evolution of physical systems.`;
    } else if (activeTab === 'text') {
      if (pastedText.trim().length < 15) {
        alert('Please paste at least 15 characters of text.');
        return;
      }
      title = pastedTitle.trim() || pastedText.trim().split(' ').slice(0, 4).join(' ') + '...';
      content = pastedText;
    } else {
      if (!webUrl.startsWith('http://') && !webUrl.startsWith('https://')) {
        alert('Please enter a valid URL (starting with http:// or https://)');
        return;
      }
      title = webUrl.replace('https://', '').replace('http://', '').split('/')[0] + ' Webpage';
      setLoading(true);
      try {
        content = await scrapeUrlText(webUrl);
      } catch (err) {
        content = 'Failed to scrape webpage. Using fallback education text.';
      }
    }

    setLoading(true);

    try {
      // Trigger dynamic mock Gemini API
      const material = await ingestMaterial(title, content, activeTab);
      
      // Save in IndexedDB
      await addMaterial(material);
      await refreshMaterials();
      
      // Navigate to Study Hub
      setActiveMaterial(material);
      setLoading(false);
      navigateTo('detail');
    } catch (err) {
      console.error(err);
      alert('Failed to process material. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-background font-sans">
        <div className="relative mb-8">
          {/* Pulsating Brain Glow */}
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl bilim-loading-pulse scale-125" />
          <div className="relative w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary bilim-loading-pulse">
            <Brain02Icon size={40} className="text-primary animate-pulse" />
          </div>
        </div>

        <h2 className="font-heading font-extrabold text-xl text-foreground mb-3 tracking-tight">
          Bilim is reading your material...
        </h2>
        
        <div className="h-6 overflow-hidden max-w-[280px] mx-auto mb-8">
          <p className="text-sm font-medium text-muted-foreground animate-fade-in transition-all">
            {loadingMessages[loadingStep]}
          </p>
        </div>

        {/* Small Elegant Linear Progress Tracker */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mx-auto">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 font-sans max-w-md mx-auto w-full">
      <div className="mb-6">
        <h2 className="font-heading font-extrabold text-2xl text-foreground mb-1 tracking-tight">
          Add Study Material
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload any text or document, and Bilim will generate flashcards, summaries, and quizzes in seconds.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-2xl bg-muted/60 border border-border/20 mb-6 select-none">
        {(['file', 'text', 'url'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab === 'file' && <Upload02Icon size={16} />}
              {tab === 'text' && <TextFilesIcon size={16} />}
              {tab === 'url' && <LinkIcon size={16} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleIngest} className="space-y-6">
        
        {/* FILE UPLOAD TAB */}
        {activeTab === 'file' && (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group ${
                selectedFile 
                  ? 'border-emerald-500/40 bg-emerald-500/[0.01] dark:bg-emerald-500/[0.02]' 
                  : isDragOver
                    ? 'border-primary bg-primary/5 text-primary scale-[1.01]' 
                    : 'border-border hover:border-primary/40 hover:bg-muted/20 text-muted-foreground'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:-translate-y-1 ${
                selectedFile 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-muted/80 text-foreground/80'
              }`}>
                {selectedFile ? <Tick01Icon size={24} className="scale-110" /> : <Upload02Icon size={24} />}
              </div>
              <h3 className={`font-heading font-bold text-sm mb-1 transition-colors ${selectedFile ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                {selectedFile ? selectedFile.name : 'Select or drag your file'}
              </h3>
              <p className="text-xs text-muted-foreground max-w-[200px]">
                {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Supports PDF, DOCX, or plain TXT up to 25MB'}
              </p>
            </div>
          </div>
        )}

        {/* PASTE TEXT TAB */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="material-title" className="text-xs font-bold text-foreground">
                Document Title (Optional)
              </label>
              <input
                id="material-title"
                type="text"
                value={pastedTitle}
                onChange={(e) => setPastedTitle(e.target.value)}
                placeholder="e.g., Quantum Physics Lesson 1"
                className="w-full px-4 py-3 rounded-2xl border border-border/80 bg-card text-foreground focus:outline-none focus:border-primary text-sm shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="material-body" className="text-xs font-bold text-foreground">
                Lecture content or notes
              </label>
              <textarea
                id="material-body"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your study notes or article text here..."
                rows={6}
                className="w-full px-4 py-3 rounded-2xl border border-border/80 bg-card text-foreground focus:outline-none focus:border-primary text-sm shadow-sm resize-none"
              />
            </div>
          </div>
        )}

        {/* WEB LINK SCRAPER TAB */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="scrape-url" className="text-xs font-bold text-foreground">
                Webpage URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <LinkIcon size={18} />
                </div>
                <input
                  id="scrape-url"
                  type="url"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="https://wikipedia.org/wiki/Quantum_mechanics"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border/80 bg-card text-foreground focus:outline-none focus:border-primary text-sm shadow-sm"
                />
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1 px-1">
                <CircleAlertIcon size={12} className="text-muted-foreground/80" />
                Bilim will crawl the URL and parse pure text elements.
              </p>
            </div>
          </div>
        )}

        {/* Big Premium Ingest Action Button */}
        <button
          type="submit"
          disabled={(activeTab === 'file' && !selectedFile) || (activeTab === 'text' && pastedText.trim().length < 15) || (activeTab === 'url' && !webUrl)}
          className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg hover:scale-[1.01] active:scale-95 disabled:scale-100 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl transition-all flex items-center justify-center gap-2 select-none cursor-pointer text-sm"
        >
          <SparklesIcon size={18} className="animate-pulse" />
          Generate with Bilim AI
        </button>

      </form>
    </div>
  );
};
