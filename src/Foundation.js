import React from 'react';
import ConceptPage from './components/ConceptPage';

const foundationData = {
  icon: '🏛️',
  title: 'Foundation',
  greek: 'Θεμέλιο',
  tagline: 'Building Strong Philosophical Arguments on Solid Ground',
  gradient: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, transparent 50%), linear-gradient(135deg, #0d0d17 0%, #1a1a2e 100%)',
  quote: {
    text: 'Well begun is half done.',
    author: 'Aristotle',
    greek: 'ἀρχὴ ἥμισυ παντός'
  },
  definition: [
    'In philosophy, a Foundation (Θεμέλιο) represents the fundamental principles and axioms upon which all reasoning must be built. Just as the Parthenon stands upon massive foundation stones, our arguments require solid grounding in logic, evidence, and clear premises.',
    'The ancient Greeks understood that without a strong foundation, even the most beautiful temple will crumble. Similarly, arguments built on false premises or weak reasoning cannot withstand critical examination.',
    'A proper philosophical foundation includes: clear definitions, logical consistency, empirical grounding where applicable, and acknowledgment of underlying assumptions.'
  ],
  principles: [
    {
      icon: '📐',
      title: 'First Principles',
      description: 'Start from self-evident truths that cannot be deduced from other propositions. Question everything until you reach bedrock.'
    },
    {
      icon: '🔗',
      title: 'Logical Consistency',
      description: 'Ensure your premises do not contradict each other. Internal coherence is essential for a sound foundation.'
    },
    {
      icon: '🎯',
      title: 'Clear Definitions',
      description: 'Define your terms precisely. Ambiguity in definitions leads to unstable arguments.'
    },
    {
      icon: '⚖️',
      title: 'Burden of Proof',
      description: 'Recognize who bears the responsibility of demonstrating a claim. Extraordinary claims require extraordinary evidence.'
    }
  ],
  philosophers: [
    { name: 'Aristotle', contribution: 'Developed formal logic and the principle of non-contradiction as foundational to all reasoning.' },
    { name: 'Descartes', contribution: 'Sought an indubitable foundation with "Cogito, ergo sum" (I think, therefore I am).' },
    { name: 'Kant', contribution: 'Examined the conditions for the possibility of knowledge itself.' }
  ],
  modern: [
    'Scientific Method: Hypothesis formation based on foundational assumptions',
    'Mathematics: Axiomatic systems building from basic postulates',
    'Legal Systems: Constitutional law as the foundation for all other laws',
    'Software Architecture: Core design patterns and principles',
    'Critical Thinking: Evaluating arguments by examining their premises'
  ]
};

export default function Foundation() {
  return <ConceptPage concept={foundationData} />;
}
