import React from 'react';
import ConceptPage from './components/ConceptPage';

const ideasData = {
  icon: '💭',
  title: 'Ideas',
  greek: 'Ἰδέαι',
  tagline: 'Platonic Forms: The Eternal Templates of Reality',
  gradient: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, transparent 50%), linear-gradient(135deg, #0d0d17 0%, #1a1a2e 100%)',
  quote: {
    text: 'Ideas are the source of all things.',
    author: 'Plato',
    greek: 'αἱ ἰδέαι εἰσὶν αἰτίαι πάντων'
  },
  definition: [
    'In Platonic philosophy, Ideas or Forms (Ἰδέαι) are the perfect, eternal, and unchanging templates of which the things we perceive in the physical world are imperfect copies. The Idea of a circle, for instance, is perfect and eternal, while any drawn circle is merely an approximation.',
    'Ideas exist in a realm beyond the physical—accessible not through the senses but through reason and intellectual contemplation. This "Theory of Forms" suggests that true knowledge is knowledge of these eternal Ideas, not of the changing, imperfect material world.',
    'Understanding Ideas involves recognizing the difference between appearance and reality, between the shadows on the cave wall and the objects casting those shadows in the sunlight.'
  ],
  principles: [
    {
      icon: '🌟',
      title: 'Eternal & Unchanging',
      description: 'True Ideas are timeless and perfect, unaffected by the flux and decay of the material world.'
    },
    {
      icon: '🔬',
      title: 'Accessible to Reason',
      description: 'Ideas cannot be perceived by the senses but can be grasped through rational thought and dialectic.'
    },
    {
      icon: '🎨',
      title: 'Creative Templates',
      description: 'Physical objects "participate" in Ideas. A beautiful painting participates in the Idea of Beauty itself.'
    },
    {
      icon: '📊',
      title: 'Hierarchical Order',
      description: 'Ideas are ordered, with the Idea of the Good at the pinnacle, illuminating all other Forms.'
    }
  ],
  philosophers: [
    { name: 'Plato', contribution: 'Developed the Theory of Forms, distinguishing between the world of Ideas and the world of appearances.' },
    { name: 'Aristotle', contribution: 'Critiqued Plato by arguing that forms exist within objects, not in a separate realm.' },
    { name: 'Plotinus', contribution: 'Synthesized Platonic Ideas with mysticism, seeing the One as the source of all Forms.' }
  ],
  modern: [
    'Mathematics: Pure mathematical concepts as perfect forms beyond physical instantiation',
    'Computer Science: Object-oriented programming with classes as templates for objects',
    'Design Theory: Archetypes and design patterns as ideal templates',
    'Psychology: Carl Jung\'s collective unconscious and universal archetypes',
    'Innovation: Conceptual thinking and ideation processes in creativity'
  ]
};

export default function Ideas() {
  return <ConceptPage concept={ideasData} />;
}
