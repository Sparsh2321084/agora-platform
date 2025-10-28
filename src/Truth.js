import React from 'react';
import ConceptPage from './components/ConceptPage';

const truthData = {
  icon: '🔥',
  title: 'Truth',
  greek: 'Ἀλήθεια',
  tagline: 'Aletheia: Unveiling Reality from Behind the Veil',
  gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, transparent 50%), linear-gradient(135deg, #0d0d17 0%, #1a1a2e 100%)',
  quote: {
    text: 'Truth is the beginning of every good thing.',
    author: 'Plato',
    greek: 'ἡ ἀλήθεια ἐστὶν ἀρχὴ πάντων ἀγαθῶν'
  },
  definition: [
    'Aletheia (Ἀλήθεια), the Greek word for truth, literally means "unconcealment" or "unveiling." Truth is not created but discovered—it is reality revealed, the removal of ignorance like prisoners ascending from Plato\'s cave into sunlight.',
    'Philosophy distinguishes between correspondence truth (statements matching reality), coherence truth (consistency within a system), and pragmatic truth (beliefs that work in practice). The ancient Greeks primarily embraced correspondence: truth is saying of what is that it is, and of what is not that it is not.',
    'The pursuit of truth requires intellectual courage. We must be willing to follow arguments wherever they lead, even if they contradict our cherished beliefs or threaten our comfort.'
  ],
  principles: [
    {
      icon: '🔍',
      title: 'Correspondence',
      description: 'Truth means alignment with reality. A statement is true if and only if it corresponds to the facts of the world.'
    },
    {
      icon: '🧩',
      title: 'Coherence',
      description: 'True beliefs form a consistent, mutually supporting system. Contradictions indicate error.'
    },
    {
      icon: '⚡',
      title: 'Unchanging',
      description: 'Truth is eternal and objective. What is true does not change with opinion, culture, or time.'
    },
    {
      icon: '💡',
      title: 'Self-Evident',
      description: 'Some truths are immediately apparent to reason (e.g., the law of non-contradiction). They require no proof beyond themselves.'
    }
  ],
  philosophers: [
    { name: 'Parmenides', contribution: 'Argued that truth is unchanging and eternal; only Being truly exists.' },
    { name: 'Plato', contribution: 'Contrasted the eternal truth of Forms with the changing illusions of the sensory world.' },
    { name: 'Aristotle', contribution: 'Defined truth as correspondence: "To say of what is that it is, or of what is not that it is not, is true."' },
    { name: 'Nietzsche', contribution: 'Challenged absolute truth, asking "What if truth is a woman?" and questioning our will to truth.' }
  ],
  modern: [
    'Scientific Realism: Science aims to discover objective truths about nature',
    'Journalism Ethics: Commitment to factual reporting and verification',
    'Legal Truth: Evidence-based determination of what actually occurred',
    'Fact-Checking: Combating misinformation in the digital age',
    'Philosophy of Truth: Ongoing debates about relativism vs. objectivism'
  ]
};

export default function Truth() {
  return <ConceptPage concept={truthData} />;
}
