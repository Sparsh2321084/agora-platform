import React from 'react';
import ConceptPage from './components/ConceptPage';

const knowledgeData = {
  icon: '📜',
  title: 'Knowledge',
  greek: 'Ἐπιστήμη',
  tagline: 'Episteme vs. Doxa: Justified True Belief',
  gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, transparent 50%), linear-gradient(135deg, #0d0d17 0%, #1a1a2e 100%)',
  quote: {
    text: 'Knowledge is justified true belief.',
    author: 'Plato (Theaetetus)',
    greek: 'ἡ ἐπιστήμη ἐστὶν ἀληθὴς δόξα μετὰ λόγου'
  },
  definition: [
    'Episteme (Ἐπιστήμη) represents genuine knowledge—not mere opinion (doxa) or belief, but understanding grounded in reason and evidence. The ancient Greeks distinguished between knowing that something is true and understanding why it must be true.',
    'Plato defined knowledge as "justified true belief": (1) you believe it, (2) it is actually true, and (3) you have good reasons (justification) for believing it. However, Edmund Gettier later challenged this definition with counterexamples.',
    'Knowledge differs from wisdom in that knowledge concerns facts and truths, while wisdom involves their proper application. One can be knowledgeable without being wise.'
  ],
  principles: [
    {
      icon: '✅',
      title: 'Truth Condition',
      description: 'Knowledge must correspond to reality. False beliefs, no matter how justified, are not knowledge.'
    },
    {
      icon: '🧠',
      title: 'Belief Condition',
      description: 'You cannot know something you do not believe. Knowledge requires cognitive acceptance.'
    },
    {
      icon: '📚',
      title: 'Justification Condition',
      description: 'Knowledge requires adequate reasons or evidence, not lucky guesses or unfounded intuitions.'
    },
    {
      icon: '🔬',
      title: 'Empirical Grounding',
      description: 'A posteriori knowledge comes from sensory experience and empirical investigation.'
    }
  ],
  philosophers: [
    { name: 'Plato', contribution: 'Defined knowledge as justified true belief and distinguished episteme from doxa (mere opinion).' },
    { name: 'Aristotle', contribution: 'Emphasized empirical knowledge and the importance of logical demonstration.' },
    { name: 'Descartes', contribution: 'Sought certain knowledge through methodological skepticism and rational intuition.' },
    { name: 'Gettier', contribution: 'Challenged the traditional definition with cases of justified true belief that don\'t count as knowledge.' }
  ],
  modern: [
    'Scientific Method: Empirical testing and peer review to establish reliable knowledge',
    'Information Theory: Distinguishing data, information, knowledge, and wisdom',
    'Epistemology: Academic study of the nature, sources, and limits of knowledge',
    'AI & Machine Learning: Knowledge representation and automated reasoning',
    'Education: Bloom\'s Taxonomy levels from remembering facts to evaluating and creating'
  ]
};

export default function Knowledge() {
  return <ConceptPage concept={knowledgeData} />;
}
