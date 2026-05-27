import { Material } from '../types';

// Simulate backend latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function checkServerHealth(): Promise<boolean> {
  await delay(400);
  return true;
}

export async function scrapeUrlText(url: string): Promise<string> {
  await delay(1200);
  return `Scraped text from ${url}. Artificial Intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals. The term "machine learning" (ML) is a subset of AI that focuses on algorithms that learn from data and improve their performance over time.`;
}

// DYNAMIC MOCK GEMINI GENERATION BASED ON USER INPUT
export async function ingestMaterial(
  title: string,
  rawContent: string,
  sourceType: 'file' | 'text' | 'url'
): Promise<Material> {
  await delay(3500); // 3.5s of realistic processing time

  const cleanTitle = title.trim() || 'Untitled Study Material';
  const docId = `mat_${Date.now()}`;
  
  // Clean up content to find matching topics
  const contentLower = rawContent.toLowerCase() + ' ' + cleanTitle.toLowerCase();
  
  // Topic detection for dynamic mockup response
  let summary = `This material provides an in-depth exploration of ${cleanTitle}. It covers the fundamental principles, key technical definitions, and practical applications within the field.`;
  let concepts = [
    {
      id: 'c_gen1',
      term: `${cleanTitle} Overview`,
      definition: 'The fundamental concept outlining the primary scope, core tenets, and general significance of this topic.',
      formula: null,
      hasFormula: false
    },
    {
      id: 'c_gen2',
      term: 'Core Mechanics',
      definition: 'The primary underlying processes, interactions, and mechanisms that drive behavior within this subject.',
      formula: 'E = mc^2',
      hasFormula: true
    }
  ];
  let flashcards = [
    {
      id: 'f_gen1',
      front: `What is the primary definition of ${cleanTitle}?`,
      back: `It represents the core subject of study, characterized by the principles outlined in the text. Key elements include understanding its foundational axioms.`,
      concept_id: 'c_gen1',
      difficulty: null as any
    },
    {
      id: 'f_gen2',
      front: `Explain the fundamental formula associated with ${cleanTitle}.`,
      back: `The core relationship is often expressed mathematically. An example is the energy equivalence:\n\n$$E = mc^2$$\n\nwhere $E$ represents energy, $m$ is mass, and $c$ is the speed of light.`,
      concept_id: 'c_gen2',
      difficulty: null as any
    },
    {
      id: 'f_gen3',
      front: `Why is this topic critical to study?`,
      back: `It provides the theoretical framework necessary to analyze, predict, and optimize systems in this field, bridging conceptual ideas with tangible reality.`,
      concept_id: 'c_gen1',
      difficulty: null as any
    }
  ];
  let quiz = [
    {
      id: 'q_gen1',
      question: `What is the central focus when studying ${cleanTitle}?`,
      options: ['Superficial analysis', 'Understanding core principles and mechanisms', 'Ignoring empirical evidence', 'Memorizing dates without context'],
      correct: 1,
      explanation: 'Learning is most effective when focusing on deep structures and foundational mechanisms rather than rote memorization.'
    },
    {
      id: 'q_gen2',
      question: 'Which equation is famously associated with core physics equivalence?',
      options: ['F = ma', 'E = mc^2', 'V = IR', 'PV = nRT'],
      correct: 1,
      explanation: 'Einstein\'s mass-energy equivalence equation E = mc^2 shows that mass and energy are interchangeable.'
    },
    {
      id: 'q_gen3',
      question: 'What is the best way to ensure long-term retention of this material?',
      options: ['Passive re-reading', 'Spaced repetition and active recall', 'Cramming the night before', 'Highlighting the entire page'],
      correct: 1,
      explanation: 'Extensive cognitive research proves active recall and spaced repetition are the most effective techniques for robust memory retention.'
    }
  ];

  // Tailored content if specific keywords are detected
  if (contentLower.includes('quantum') || contentLower.includes('physics')) {
    summary = 'This summary covers Quantum Mechanics concepts including wave-particle duality, superposition, and quantum entanglement. It illustrates how subatomic particles behave in non-classical probabilities.';
    concepts = [
      {
        id: 'c_q1',
        term: 'Superposition',
        definition: 'A principle of quantum mechanics where a system can exist in multiple states simultaneously until it is measured.',
        formula: '|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle',
        hasFormula: true
      },
      {
        id: 'c_q2',
        term: 'Schrödinger Equation',
        definition: 'A linear partial differential equation that describes the wave function of a quantum-mechanical system.',
        formula: 'i\\hbar\\frac{\\partial}{\\partial t}|\\psi(t)\\rangle = \\hat{H}|\\psi(t)\\rangle',
        hasFormula: true
      }
    ];
    flashcards = [
      {
        id: 'f_q1',
        front: 'What is Quantum Superposition?',
        back: 'The physical phenomenon where quantum particles exist in a combination of multiple states at once, mathematically represented as:\n\n$$|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$$',
        concept_id: 'c_q1',
        difficulty: null as any
      },
      {
        id: 'f_q2',
        front: 'State the Schrödinger Equation and define its terms.',
        back: 'The equation is:\n\n$$i\\hbar\\frac{\\partial}{\\partial t}|\\psi(t)\\rangle = \\hat{H}|\\psi(t)\\rangle$$\n\nwhere $\\hbar$ is the reduced Planck constant, $|\\psi(t)\\rangle$ is the state vector, and $\\hat{H}$ is the Hamiltonian operator.',
        concept_id: 'c_q2',
        difficulty: null as any
      }
    ];
  } else if (contentLower.includes('history') || contentLower.includes('war') || contentLower.includes('revolution')) {
    summary = 'An analysis of historical cycles, key revolutions, and social impacts. This study highlights major causal factors, critical figures, and systemic shifts that transformed societies.';
    concepts = [
      {
        id: 'c_h1',
        term: 'Social Contract Theory',
        definition: 'A theory outlining how individuals consent to surrender some freedoms to authority in exchange for protection of remaining rights.',
        formula: null,
        hasFormula: false
      }
    ];
    flashcards = [
      {
        id: 'f_h1',
        front: 'What is Social Contract Theory?',
        back: 'A political philosophy (popularized by Hobbes, Locke, and Rousseau) stating that governments derive their legitimacy from a mutual contract with the governed.',
        concept_id: 'c_h1',
        difficulty: null as any
      }
    ];
  }

  return {
    id: docId,
    title: cleanTitle,
    summary,
    concepts,
    flashcards,
    quiz,
    createdAt: Date.now(),
    isTruncated: rawContent.length > 5000 // Mock truncation flag
  };
}
