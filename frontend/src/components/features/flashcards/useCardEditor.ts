import { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { saveManualCard, deleteManualCard } from '../../../db/db';
import { Flashcard } from '../../../types';

export const useCardEditor = () => {
  const { activeMaterial, refreshMaterials } = useApp();
  
  // List states
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  
  // Edit form states
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [editConceptId, setEditConceptId] = useState('');
  
  // Add form states
  const [isAdding, setIsAdding] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newConceptId, setNewConceptId] = useState('');

  // Synchronize cards with active material
  useEffect(() => {
    if (activeMaterial) {
      setCards(activeMaterial.flashcards);
      // Pre-select first concept if available
      if (activeMaterial.concepts.length > 0) {
        setNewConceptId(activeMaterial.concepts[0].id);
      } else {
        setNewConceptId('c_custom');
      }
    }
  }, [activeMaterial]);

  const toggleExpandCard = (cardId: string) => {
    if (expandedCardId === cardId) {
      setExpandedCardId(null);
    } else {
      const card = cards.find(c => c.id === cardId);
      if (card) {
        setEditFront(card.front);
        setEditBack(card.back);
        setEditConceptId(card.concept_id || 'c_custom');
        setExpandedCardId(cardId);
      }
    }
  };

  const handleSaveEdit = async (cardId: string): Promise<boolean> => {
    if (!activeMaterial || !editFront.trim() || !editBack.trim()) return false;
    
    const card = cards.find(c => c.id === cardId);
    if (!card) return false;

    const updatedCard: Flashcard = {
      ...card,
      front: editFront.trim(),
      back: editBack.trim(),
      concept_id: editConceptId
    };

    try {
      await saveManualCard(activeMaterial.id, updatedCard);
      await refreshMaterials();
      setExpandedCardId(null);
      return true;
    } catch (err) {
      console.error('Failed to save flashcard edit:', err);
      return false;
    }
  };

  const handleDeleteCard = async (cardId: string): Promise<boolean> => {
    if (!activeMaterial) return false;
    if (!window.confirm('Are you sure you want to permanently delete this card?')) return false;

    try {
      await deleteManualCard(activeMaterial.id, cardId);
      await refreshMaterials();
      if (expandedCardId === cardId) {
        setExpandedCardId(null);
      }
      return true;
    } catch (err) {
      console.error('Failed to delete flashcard:', err);
      return false;
    }
  };

  const handleCreateCard = async (): Promise<boolean> => {
    if (!activeMaterial || !newFront.trim() || !newBack.trim()) return false;

    const newCard: Flashcard = {
      id: `fc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      front: newFront.trim(),
      back: newBack.trim(),
      concept_id: newConceptId,
      difficulty: null
    };

    try {
      await saveManualCard(activeMaterial.id, newCard);
      await refreshMaterials();
      
      // Reset input fields
      setNewFront('');
      setNewBack('');
      if (activeMaterial.concepts.length > 0) {
        setNewConceptId(activeMaterial.concepts[0].id);
      } else {
        setNewConceptId('c_custom');
      }
      setIsAdding(false);
      return true;
    } catch (err) {
      console.error('Failed to create flashcard:', err);
      return false;
    }
  };

  const toggleAdding = () => {
    setIsAdding(!isAdding);
    if (activeMaterial && activeMaterial.concepts.length > 0) {
      setNewConceptId(activeMaterial.concepts[0].id);
    } else {
      setNewConceptId('c_custom');
    }
  };

  return {
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
    setIsAdding,
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
  };
};
