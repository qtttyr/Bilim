import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Material, CardState, QuizHistory, UserStats, Flashcard } from '../types';

interface BilimDB extends DBSchema {
  materials: {
    key: string;
    value: Material;
  };
  card_state: {
    key: string;
    value: CardState;
    indexes: { 'by-material': string };
  };
  quiz_history: {
    key: string;
    value: QuizHistory;
    indexes: { 'by-material': string };
  };
}

const DB_NAME = 'bilim_db';
const DB_VERSION = 1;

// GORGEOUS RICH MOCK DATA
const MOCK_MATERIALS: Material[] = [
  {
    id: 'm1',
    title: 'Introduction to Neural Networks',
    summary: 'An introduction to artificial neural networks, detailing how layers of neurons process input features using weights, biases, and activation functions. Backpropagation and gradient descent are used to optimize parameters and train the network.',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    concepts: [
      {
        id: 'c1',
        term: 'Artificial Neuron',
        definition: 'The basic computational unit of a neural network that receives inputs, weights them, adds a bias, and applies an activation function.',
        formula: 'a = \\sigma\\left(\\sum_{i} w_i x_i + b\\right)',
        hasFormula: true
      },
      {
        id: 'c2',
        term: 'Activation Function',
        definition: 'A mathematical function applied to a neuron\'s output to introduce non-linearity, enabling the network to learn complex patterns.',
        formula: '\\text{ReLU}(x) = \\max(0, x)',
        hasFormula: true
      },
      {
        id: 'c3',
        term: 'Backpropagation',
        definition: 'An algorithm used to calculate the gradient of the loss function with respect to the weights in the network, enabling gradient descent optimization.',
        formula: '\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial a} \\cdot \\frac{\\partial a}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w}',
        hasFormula: true
      },
      {
        id: 'c4',
        term: 'Gradient Descent',
        definition: 'An optimization algorithm used to minimize the loss function by iteratively moving in the direction of steepest descent.',
        formula: 'w \\leftarrow w - \\alpha \\frac{\\partial L}{\\partial w}',
        hasFormula: true
      }
    ],
    flashcards: [
      {
        id: 'f1',
        front: 'What is an artificial neuron?',
        back: 'The basic building block of neural networks that sums weighted inputs, adds a bias, and applies an activation function.',
        concept_id: 'c1',
        difficulty: null
      },
      {
        id: 'f2',
        front: 'What is the mathematical formula for an artificial neuron\'s output?',
        back: 'The output $a$ is calculated as:\n\n$$a = \\sigma\\left(\\sum_{i} w_i x_i + b\\right)$$\n\nwhere $w_i$ are weights, $x_i$ are inputs, $b$ is bias, and $\\sigma$ is the activation function.',
        concept_id: 'c1',
        difficulty: null
      },
      {
        id: 'f3',
        front: 'Why do we need activation functions in neural networks?',
        back: 'To introduce non-linearity into the network. Without non-linearity, no matter how many layers a neural network has, it would behave like a simple single-layer linear regression model, unable to learn complex non-linear relationships.',
        concept_id: 'c2',
        difficulty: null
      },
      {
        id: 'f4',
        front: 'Explain the formula and behavior of the ReLU activation function.',
        back: 'ReLU stands for Rectified Linear Unit. Its formula is:\n\n$$\\text{ReLU}(x) = \\max(0, x)$$\n\nIt returns 0 for any negative input, and returns the input value itself for any positive input.',
        concept_id: 'c2',
        difficulty: null
      },
      {
        id: 'f5',
        front: 'What is backpropagation?',
        back: 'An algorithm that computes the gradient of the loss function with respect to each weight using the mathematical chain rule, propagating errors backward from the output layer to the input layer.',
        concept_id: 'c3',
        difficulty: null
      },
      {
        id: 'f6',
        front: 'How are weights updated in gradient descent?',
        back: 'Weights are updated by subtracting a fraction of the gradient:\n\n$$w \\leftarrow w - \\alpha \\frac{\\partial L}{\\partial w}$$\n\nwhere $\\alpha$ is the learning rate and $\\frac{\\partial L}{\\partial w}$ is the partial derivative of the loss with respect to the weight.',
        concept_id: 'c4',
        difficulty: null
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which activation function outputs zero for negative inputs and the input itself for positive inputs?',
        options: ['Sigmoid', 'Tanh', 'ReLU', 'Softmax'],
        correct: 2,
        explanation: 'ReLU is defined as f(x) = max(0, x), which means it returns 0 for negative numbers and the value itself for positive numbers.'
      },
      {
        id: 'q2',
        question: 'What is the primary purpose of backpropagation in neural networks?',
        options: [
          'To make predictions on new data',
          'To calculate gradients of the loss function with respect to weights',
          'To initialize weights randomly',
          'To apply activation functions'
        ],
        correct: 1,
        explanation: 'Backpropagation calculates the partial derivatives (gradients) of the loss function with respect to the weights, which are then used by optimization algorithms like gradient descent.'
      },
      {
        id: 'q3',
        question: 'What does the symbol \\alpha represent in the gradient descent update formula?',
        options: ['The loss function', 'The bias value', 'The learning rate', 'The activation function'],
        correct: 2,
        explanation: 'In gradient descent, \\alpha is the learning rate, which controls the size of the steps taken towards the minimum of the loss function.'
      },
      {
        id: 'q4',
        question: 'Why are linear activation functions insufficient for deep neural networks?',
        options: [
          'They are computationally too expensive',
          'They prevent the network from learning non-linear relationships',
          'They cause gradients to explode',
          'They cannot be used with backpropagation'
        ],
        correct: 1,
        explanation: 'If all activation functions are linear, any depth of neural network collapses into a single linear model, making it unable to learn complex non-linear relationships.'
      },
      {
        id: 'q5',
        question: 'In the neuron formula a = \\sigma(w \\cdot x + b), what does b represent?',
        options: ['Bias', 'Boundary', 'Backprop', 'Beta'],
        correct: 0,
        explanation: 'b represents the bias, which allows shifting the activation function to the left or right to better fit the data.'
      }
    ]
  },
  {
    id: 'm2',
    title: 'Photosynthesis & Light Reactions',
    summary: 'Photosynthesis is the process by which green plants convert solar energy into chemical energy, producing glucose and oxygen. Light-dependent reactions capture light in the thylakoid membranes to generate ATP and NADPH.',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    concepts: [
      {
        id: 'c5',
        term: 'Chloroplast',
        definition: 'The specialized organelle in plant cells where photosynthesis takes place, containing thylakoids and stroma.',
        formula: null,
        hasFormula: false
      },
      {
        id: 'c6',
        term: 'Light Reactions',
        definition: 'The initial stage of photosynthesis that absorbs light energy to synthesize ATP and NADPH, releasing oxygen as a byproduct.',
        formula: '2H_2O + 2NADP^+ + 3ADP + 3P_i \\rightarrow O_2 + 2NADPH + 3ATP',
        hasFormula: true
      },
      {
        id: 'c7',
        term: 'Calvin Cycle',
        definition: 'The light-independent stage of photosynthesis that uses ATP and NADPH to fix carbon dioxide into G3P/glucose.',
        formula: '3CO_2 + 9ATP + 6NADPH \\rightarrow G3P + 9ADP + 8P_i + 6NADP^+',
        hasFormula: true
      }
    ],
    flashcards: [
      {
        id: 'f7',
        front: 'Where does photosynthesis occur in plant cells?',
        back: 'In the Chloroplast, a specialized double-membrane organelle containing thylakoids (where light reactions happen) and the stroma (where the Calvin cycle happens).',
        concept_id: 'c5',
        difficulty: null
      },
      {
        id: 'f8',
        front: 'What are the main outputs of the light-dependent reactions of photosynthesis?',
        back: 'Oxygen ($O_2$), ATP, and NADPH. The overall chemical equation is:\n\n$$2H_2O + 2NADP^+ + 3ADP + 3P_i \\rightarrow O_2 + 2NADPH + 3ATP$$',
        concept_id: 'c6',
        difficulty: null
      },
      {
        id: 'f9',
        front: 'What chemical provides electrons for the light reactions in chloroplasts?',
        back: 'Water ($H_2O$). Photolysis of water splits it into electrons, protons ($H^+$), and oxygen ($O_2$).',
        concept_id: 'c6',
        difficulty: null
      },
      {
        id: 'f10',
        front: 'What is the net reaction of the Calvin Cycle to produce one G3P molecule?',
        back: 'The Calvin Cycle fixes 3 molecules of $CO_2$:\n\n$$3CO_2 + 9ATP + 6NADPH \\rightarrow G3P + 9ADP + 8P_i + 6NADP^+$$',
        concept_id: 'c7',
        difficulty: null
      }
    ],
    quiz: [
      {
        id: 'q6',
        question: 'Which organelle is responsible for photosynthesis in plants?',
        options: ['Mitochondria', 'Chloroplast', 'Ribosome', 'Golgi Apparatus'],
        correct: 1,
        explanation: 'Photosynthesis takes place specifically in the chloroplasts of plant cells.'
      },
      {
        id: 'q7',
        question: 'What substance is split during the light reactions to release oxygen?',
        options: ['Carbon Dioxide (CO2)', 'Water (H2O)', 'Glucose (C6H12O6)', 'ATP'],
        correct: 1,
        explanation: 'Water molecules are split during photolysis to provide electrons for the electron transport chain, releasing oxygen as a byproduct.'
      },
      {
        id: 'q8',
        question: 'Which molecules produced in the light reactions are used to power the Calvin Cycle?',
        options: ['ADP and NADP+', 'ATP and NADPH', 'Glucose and Oxygen', 'CO2 and H2O'],
        correct: 1,
        explanation: 'The light reactions generate ATP and NADPH, which carry chemical energy and reducing power to the stroma to run the Calvin Cycle.'
      },
      {
        id: 'q9',
        question: 'How many molecules of Carbon Dioxide (CO2) must be fixed to produce one net G3P molecule?',
        options: ['1', '3', '6', '12'],
        correct: 1,
        explanation: 'Fixing 3 molecules of CO2 in the Calvin Cycle yields one net G3P molecule (a 3-carbon sugar).'
      },
      {
        id: 'q10',
        question: 'Where does the Calvin Cycle take place inside the chloroplast?',
        options: ['Thylakoid Membrane', 'Stroma', 'Thylakoid Lumen', 'Outer Membrane'],
        correct: 1,
        explanation: 'The light-independent reactions (Calvin Cycle) take place in the stroma, the fluid-filled space surrounding the thylakoids.'
      }
    ]
  }
];

let dbPromise: Promise<IDBPDatabase<BilimDB>> | null = null;

export async function getDB(): Promise<IDBPDatabase<BilimDB>> {
  if (dbPromise) return dbPromise;

  dbPromise = openDB<BilimDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('materials')) {
        db.createObjectStore('materials', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('card_state')) {
        const cardStore = db.createObjectStore('card_state', { keyPath: 'card_id' });
        cardStore.createIndex('by-material', 'material_id');
      }
      if (!db.objectStoreNames.contains('quiz_history')) {
        const quizStore = db.createObjectStore('quiz_history', { keyPath: 'id' });
        quizStore.createIndex('by-material', 'material_id');
      }
    },
  });

  // PRE-POPULATE MOCK DATA IF EMPTY
  const db = await dbPromise;
  const count = await db.count('materials');
  if (count === 0) {
    const tx = db.transaction(['materials', 'card_state'], 'readwrite');
    for (const material of MOCK_MATERIALS) {
      await tx.objectStore('materials').put(material);
      // Initialize card states as blank
      for (const card of material.flashcards) {
        await tx.objectStore('card_state').put({
          card_id: card.id,
          material_id: material.id,
          difficulty: null,
          nextReview: Date.now(),
          reviewCount: 0,
          intervalDays: 0
        });
      }
    }
    await tx.done;
    
    // Seed some initial quiz history for progress graphs
    const txQuiz = db.transaction('quiz_history', 'readwrite');
    await txQuiz.objectStore('quiz_history').put({
      id: 'qh1',
      material_id: 'm1',
      score: 4,
      date: Date.now() - 2 * 24 * 60 * 60 * 1000,
      weakConcepts: ['c3']
    });
    await txQuiz.objectStore('quiz_history').put({
      id: 'qh2',
      material_id: 'm1',
      score: 5,
      date: Date.now() - 1 * 24 * 60 * 60 * 1000,
      weakConcepts: []
    });
    await txQuiz.objectStore('quiz_history').put({
      id: 'qh3',
      material_id: 'm2',
      score: 3,
      date: Date.now(),
      weakConcepts: ['c7']
    });
    await txQuiz.done;
  }

  return db;
}

// ----------------------------------------------------
// LOCAL STORAGE FOR USER STATS & STREAKS
// ----------------------------------------------------
const STATS_KEY = 'bilim_user_stats';

export function getUserStats(): UserStats {
  const data = localStorage.getItem(STATS_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // Fallback
    }
  }
  const defaultStats: UserStats = {
    streak: 2, // Starts with a small mock streak for premium feel!
    lastStudied: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // studied yesterday
    totalCardsReviewed: 28,
    totalQuizzesTaken: 3,
    bossSessionsCompleted: 1
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(defaultStats));
  return defaultStats;
}

export function saveUserStats(stats: UserStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

// Increment streak based on standard calendar logic
export function recordStudySession() {
  const stats = getUserStats();
  const todayStr = new Date().toISOString().split('T')[0];
  
  if (stats.lastStudied === todayStr) {
    // Already studied today, no streak change
    return stats;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (stats.lastStudied === yesterdayStr) {
    stats.streak += 1;
  } else {
    // Streak broken, reset to 1
    stats.streak = 1;
  }

  stats.lastStudied = todayStr;
  saveUserStats(stats);
  return stats;
}

// ----------------------------------------------------
// DB CORE API METHODS
// ----------------------------------------------------

export async function getMaterials(): Promise<Material[]> {
  const db = await getDB();
  return db.getAll('materials');
}

export async function getMaterial(id: string): Promise<Material | undefined> {
  const db = await getDB();
  return db.get('materials', id);
}

export async function addMaterial(material: Material): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['materials', 'card_state'], 'readwrite');
  await tx.objectStore('materials').put(material);
  
  // Initialize card states
  for (const card of material.flashcards) {
    await tx.objectStore('card_state').put({
      card_id: card.id,
      material_id: material.id,
      difficulty: null,
      nextReview: Date.now(),
      reviewCount: 0,
      intervalDays: 0
    });
  }
  await tx.done;
}

export async function deleteMaterial(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['materials', 'card_state', 'quiz_history'], 'readwrite');
  
  await tx.objectStore('materials').delete(id);

  // Clean up card states
  const cardStore = tx.objectStore('card_state');
  const cardStates = await cardStore.index('by-material').getAllKeys(id);
  for (const key of cardStates) {
    await cardStore.delete(key);
  }

  // Clean up quiz history
  const quizStore = tx.objectStore('quiz_history');
  const quizKeys = await quizStore.index('by-material').getAllKeys(id);
  for (const key of quizKeys) {
    await quizStore.delete(key);
  }

  await tx.done;
}

export async function getCardStates(materialId: string): Promise<CardState[]> {
  const db = await getDB();
  return db.getAllFromIndex('card_state', 'by-material', materialId);
}

export async function getQuizHistory(materialId: string): Promise<QuizHistory[]> {
  const db = await getDB();
  return db.getAllFromIndex('quiz_history', 'by-material', materialId);
}

export async function getAllQuizHistory(): Promise<QuizHistory[]> {
  const db = await getDB();
  return db.getAll('quiz_history');
}

// ----------------------------------------------------
// SPACED REPETITION ENGINE (Simplified SM-2)
// ----------------------------------------------------
export async function updateCardDifficulty(
  cardId: string,
  materialId: string,
  response: 'missed' | 'shaky' | 'known'
): Promise<CardState> {
  const db = await getDB();
  const tx = db.transaction(['card_state'], 'readwrite');
  const store = tx.objectStore('card_state');
  
  let state = await store.get(cardId);
  if (!state) {
    state = {
      card_id: cardId,
      material_id: materialId,
      difficulty: null,
      nextReview: Date.now(),
      reviewCount: 0,
      intervalDays: 0
    };
  }

  state.reviewCount += 1;
  state.difficulty = response;

  const now = Date.now();
  if (response === 'known') {
    // Got it -> review in 3 days
    state.intervalDays = 3;
    state.nextReview = now + 3 * 24 * 60 * 60 * 1000;
  } else if (response === 'shaky') {
    // Shaky -> review in 1 day
    state.intervalDays = 1;
    state.nextReview = now + 1 * 24 * 60 * 60 * 1000;
  } else {
    // Missed -> review in 10 minutes
    state.intervalDays = 0; // custom short term
    state.nextReview = now + 10 * 60 * 1000;
  }

  await store.put(state);
  await tx.done;

  // Track stats
  const stats = getUserStats();
  stats.totalCardsReviewed += 1;
  saveUserStats(stats);
  recordStudySession();

  return state;
}

// Custom manual flashcard creation/updating
export async function saveManualCard(
  materialId: string,
  card: Flashcard
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['materials', 'card_state'], 'readwrite');
  
  const material = await tx.objectStore('materials').get(materialId);
  if (material) {
    const cardIndex = material.flashcards.findIndex(f => f.id === card.id);
    if (cardIndex >= 0) {
      material.flashcards[cardIndex] = card;
    } else {
      material.flashcards.push(card);
    }
    await tx.objectStore('materials').put(material);

    // Ensure state exists
    const stateStore = tx.objectStore('card_state');
    const existingState = await stateStore.get(card.id);
    if (!existingState) {
      await stateStore.put({
        card_id: card.id,
        material_id: materialId,
        difficulty: null,
        nextReview: Date.now(),
        reviewCount: 0,
        intervalDays: 0
      });
    }
  }
  await tx.done;
}

// ----------------------------------------------------
// QUIZ PROGRESS & INTEGRATION
// ----------------------------------------------------
export async function saveQuizResult(
  materialId: string,
  score: number,
  weakConcepts: string[]
): Promise<QuizHistory> {
  const db = await getDB();
  const id = `qh_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const result: QuizHistory = {
    id,
    material_id: materialId,
    score,
    date: Date.now(),
    weakConcepts
  };

  const tx = db.transaction(['quiz_history', 'card_state', 'materials'], 'readwrite');
  await tx.objectStore('quiz_history').put(result);

  // If there are weak concepts, mark all corresponding flashcards in this material as "missed"
  if (weakConcepts.length > 0) {
    const material = await tx.objectStore('materials').get(materialId);
    if (material) {
      const cardStateStore = tx.objectStore('card_state');
      for (const card of material.flashcards) {
        if (weakConcepts.includes(card.concept_id)) {
          const state = await cardStateStore.get(card.id);
          if (state) {
            state.difficulty = 'missed';
            state.nextReview = Date.now() + 10 * 60 * 1000; // review in 10 mins
            await cardStateStore.put(state);
          }
        }
      }
    }
  }
  
  await tx.done;

  // Track stats
  const stats = getUserStats();
  stats.totalQuizzesTaken += 1;
  saveUserStats(stats);
  recordStudySession();

  return result;
}

// Track boss mode completions
export function incrementBossSessions() {
  const stats = getUserStats();
  stats.bossSessionsCompleted += 1;
  saveUserStats(stats);
  recordStudySession();
}

// ----------------------------------------------------
// EXPORT & RESET DATA
// ----------------------------------------------------
export async function exportAllDataJSON(): Promise<string> {
  const db = await getDB();
  const materials = await db.getAll('materials');
  const cardStates = await db.getAll('card_state');
  const quizHistory = await db.getAll('quiz_history');
  const userStats = getUserStats();

  const exportObj = {
    version: 'Bilim_v1.0',
    materials,
    cardStates,
    quizHistory,
    userStats
  };

  return JSON.stringify(exportObj, null, 2);
}

export async function importAllDataJSON(jsonStr: string): Promise<void> {
  const data = JSON.parse(jsonStr);
  if (data.version !== 'Bilim_v1.0') {
    throw new Error('Invalid export format version.');
  }

  const db = await getDB();
  const tx = db.transaction(['materials', 'card_state', 'quiz_history'], 'readwrite');
  
  await tx.objectStore('materials').clear();
  await tx.objectStore('card_state').clear();
  await tx.objectStore('quiz_history').clear();

  for (const material of data.materials) {
    await tx.objectStore('materials').put(material);
  }
  for (const state of data.cardStates) {
    await tx.objectStore('card_state').put(state);
  }
  for (const history of data.quizHistory) {
    await tx.objectStore('quiz_history').put(history);
  }

  await tx.done;

  saveUserStats(data.userStats);
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['materials', 'card_state', 'quiz_history'], 'readwrite');
  await tx.objectStore('materials').clear();
  await tx.objectStore('card_state').clear();
  await tx.objectStore('quiz_history').clear();
  await tx.done;

  localStorage.removeItem(STATS_KEY);
}
