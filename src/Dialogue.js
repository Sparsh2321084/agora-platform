import React from 'react';
import ConceptPage from './components/ConceptPage';

const dialogueData = {
  icon: '🤝',
  title: 'Dialogue',
  greek: 'Διάλογος',
  tagline: 'The Socratic Method: Truth Through Conversation',
  gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, transparent 50%), linear-gradient(135deg, #0d0d17 0%, #1a1a2e 100%)',
  quote: {
    text: 'Dialogue is the art of thinking together.',
    author: 'Plato',
    greek: 'ὁ διάλογός ἐστι τέχνη τοῦ συνδιαλέγεσθαι'
  },
  definition: [
    'Dialogue (Διάλογος) in the philosophical sense is not mere conversation, but a structured method of inquiry where two or more individuals collaboratively seek truth through questioning and reasoning. The Socratic dialogues exemplify this approach.',
    'Unlike debate, where opponents seek to win, philosophical dialogue aims at mutual understanding and discovery. Participants are willing to follow the argument wherever it leads, even if it means abandoning cherished beliefs.',
    'True dialogue requires humility (recognizing you might be wrong), charity (interpreting others\' arguments in their best light), and intellectual honesty (acknowledging valid counterarguments).'
  ],
  principles: [
    {
      icon: '❓',
      title: 'Socratic Questioning',
      description: 'Use probing questions to examine assumptions and expose contradictions, leading interlocutors to truth through their own reasoning.'
    },
    {
      icon: '🎯',
      title: 'Collaborative Inquiry',
      description: 'Engage in joint exploration of ideas rather than competitive argumentation. The goal is shared understanding, not victory.'
    },
    {
      icon: '🔄',
      title: 'Dialectical Process',
      description: 'Thesis meets antithesis to produce synthesis. Through opposing views, a higher truth emerges.'
    },
    {
      icon: '🎧',
      title: 'Active Listening',
      description: 'Genuinely hear and consider opposing viewpoints. Understanding precedes evaluation.'
    }
  ],
  philosophers: [
    { name: 'Socrates', contribution: 'Pioneered the elenctic method: questioning to expose contradictions and lead to aporia (perplexity).' },
    { name: 'Plato', contribution: 'Preserved Socratic dialogues and developed dialectic as a path to knowledge of Forms.' },
    { name: 'Hegel', contribution: 'Formalized the dialectical method as thesis-antithesis-synthesis progression.' }
  ],
  modern: [
    'Counseling & Therapy: Socratic questioning to help clients examine beliefs',
    'Education: Discussion-based learning vs. lecture-only formats',
    'Business: Collaborative problem-solving and brainstorming sessions',
    'Conflict Resolution: Mediation through structured dialogue',
    'Online Communities: Forums like AGORA that facilitate respectful discourse'
  ]
};

export default function Dialogue() {
  return <ConceptPage concept={dialogueData} />;
}
