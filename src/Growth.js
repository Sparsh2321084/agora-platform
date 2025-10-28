import React from 'react';
import ConceptPage from './components/ConceptPage';

const growthData = {
  icon: '🌿',
  title: 'Growth',
  greek: 'Αὔξησις',
  tagline: 'Continuous Cultivation of Mind and Character',
  gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, transparent 50%), linear-gradient(135deg, #0d0d17 0%, #1a1a2e 100%)',
  quote: {
    text: 'We are what we repeatedly do. Excellence, then, is not an act but a habit.',
    author: 'Aristotle',
    greek: 'οἱ γὰρ ἀνθρώποι ἀγαθοὶ γίγνονται διὰ τρία'
  },
  definition: [
    'Growth (Αὔξησις) in the philosophical sense is the continuous development of one\'s intellectual capacities, moral character, and understanding of truth. Like a plant growing toward sunlight, the philosopher grows toward wisdom and virtue.',
    'The Greeks believed in paideia (παιδεία)—the lifelong process of education and self-cultivation that transforms a person into their best possible self. This is not just acquiring knowledge, but developing character, judgment, and excellence (arete).',
    'Philosophical growth requires both contemplation (theoria) and practice (praxis). Understanding virtue is insufficient—one must habitually practice virtuous actions until they become second nature.'
  ],
  principles: [
    {
      icon: '🌱',
      title: 'Incremental Progress',
      description: 'Growth happens gradually through consistent effort. Small daily improvements compound into significant transformation.'
    },
    {
      icon: '🔄',
      title: 'Iterative Learning',
      description: 'Learn from mistakes and feedback. Each failure is data for improvement, not a final judgment.'
    },
    {
      icon: '🎯',
      title: 'Deliberate Practice',
      description: 'Mere repetition is insufficient. Growth requires focused effort on areas of weakness with immediate feedback.'
    },
    {
      icon: '📈',
      title: 'Metacognition',
      description: 'Reflect on your own thinking processes. Awareness of how you learn accelerates learning itself.'
    }
  ],
  philosophers: [
    { name: 'Aristotle', contribution: 'Taught that virtue is developed through habitual practice and that we become what we repeatedly do.' },
    { name: 'Epictetus', contribution: 'Emphasized daily practice of Stoic exercises to cultivate wisdom and resilience.' },
    { name: 'John Dewey', contribution: 'Advocated for experiential learning and growth through reflective experience.' }
  ],
  modern: [
    'Growth Mindset (Carol Dweck): Belief that abilities can be developed through dedication and hard work',
    'Deliberate Practice (Anders Ericsson): Focused, purposeful training to improve performance',
    'Lifelong Learning: Continuous education beyond formal schooling',
    'Personal Development: Self-improvement through reading, meditation, therapy, coaching',
    'Agile Methodology: Iterative development with continuous feedback and improvement'
  ]
};

export default function Growth() {
  return <ConceptPage concept={growthData} />;
}
