import React from 'react';
import ConceptPage from './components/ConceptPage';

const wisdomData = {
  icon: '🦉',
  title: 'Wisdom',
  greek: 'Σοφία',
  tagline: 'The Owl of Athena: Sophia Through Experience and Reflection',
  gradient: 'linear-gradient(135deg, rgba(106, 90, 205, 0.15) 0%, transparent 50%), linear-gradient(135deg, #0d0d17 0%, #1a1a2e 100%)',
  quote: {
    text: 'The only true wisdom is in knowing you know nothing.',
    author: 'Socrates',
    greek: 'ἓν οἶδα ὅτι οὐδὲν οἶδα'
  },
  definition: [
    'Sophia (Σοφία), or Wisdom, transcends mere knowledge (episteme). While knowledge is the accumulation of facts, wisdom is the judicious application of knowledge, tempered by experience, ethics, and deep understanding of human nature.',
    'The ancient Greeks distinguished between theoretical wisdom (sophia) and practical wisdom (phronesis). True wisdom involves both understanding universal truths and knowing how to act virtuously in particular situations.',
    'Wisdom is symbolized by the owl of Athena—a creature that sees clearly in darkness, representing the ability to perceive truth even in uncertain or difficult circumstances.'
  ],
  principles: [
    {
      icon: '🔍',
      title: 'Self-Knowledge',
      description: 'Understand your own limitations, biases, and ignorance. The Delphic maxim "Know Thyself" is the beginning of wisdom.'
    },
    {
      icon: '⏳',
      title: 'Patience & Reflection',
      description: 'Wisdom cannot be rushed. It requires time for contemplation, learning from mistakes, and integrating experiences.'
    },
    {
      icon: '🎭',
      title: 'Practical Judgment',
      description: 'Apply knowledge appropriately to real-world situations, considering context, consequences, and ethical implications.'
    },
    {
      icon: '💎',
      title: 'Value Discernment',
      description: 'Distinguish between what is truly valuable and what merely appears so. See through appearances to underlying reality.'
    }
  ],
  philosophers: [
    { name: 'Socrates', contribution: 'Taught that wisdom begins with recognizing one\'s own ignorance and questioning assumptions.' },
    { name: 'Aristotle', contribution: 'Distinguished between theoretical wisdom (sophia) and practical wisdom (phronesis).' },
    { name: 'Confucius', contribution: 'Emphasized wisdom as harmony between knowledge, virtue, and appropriate action.' }
  ],
  modern: [
    'Decision-Making: Considering long-term consequences beyond immediate gratification',
    'Leadership: Balancing competing interests with ethical principles',
    'AI Ethics: Understanding the limits and proper applications of technology',
    'Mental Health: Cultivating perspective and emotional regulation',
    'Education: Teaching critical thinking rather than mere memorization'
  ]
};

export default function Wisdom() {
  return <ConceptPage concept={wisdomData} />;
}
