import React from 'react';
import ConceptPage from './components/ConceptPage';

const justiceData = {
  icon: '⚖️',
  title: 'Justice',
  greek: 'Δικαιοσύνη',
  tagline: 'The Highest Virtue: Giving Each Their Due',
  gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, transparent 50%), linear-gradient(135deg, #0d0d17 0%, #1a1a2e 100%)',
  quote: {
    text: 'Justice is the advantage of the stronger.',
    author: 'Thrasymachus (disputed by Socrates)',
    greek: 'τὸ δίκαιον οὐκ ἄλλο τι ἐστὶν ἢ τὸ τοῦ κρείττονος συμφέρον'
  },
  definition: [
    'Justice (Δικαιοσύνη) is the supreme virtue that harmonizes all others. Plato argued in The Republic that justice is the proper ordering of the soul, where reason rules over spirit and appetite, and the proper ordering of society, where each class performs its appropriate function.',
    'The Greeks distinguished between distributive justice (fair allocation of resources), retributive justice (appropriate punishment for wrongdoing), and corrective justice (restoring balance after injury). Justice requires both equality (treating like cases alike) and equity (accounting for relevant differences).',
    'True justice is not merely following laws, which may themselves be unjust, but aligning with the Good itself—an eternal standard of right independent of human conventions.'
  ],
  principles: [
    {
      icon: '⚖️',
      title: 'Impartiality',
      description: 'Justice is blind to irrelevant differences like wealth, status, or personal relationships. All deserve fair consideration.'
    },
    {
      icon: '🎯',
      title: 'Proportionality',
      description: 'Punishments should fit crimes. Rewards should match merit. Justice is the mean between excess and deficiency.'
    },
    {
      icon: '📜',
      title: 'Rule of Law',
      description: 'Laws should be general, public, clear, and applied consistently. No one is above the law.'
    },
    {
      icon: '🌍',
      title: 'Universal Principles',
      description: 'Justice transcends cultural boundaries. What is truly just is just everywhere and always.'
    }
  ],
  philosophers: [
    { name: 'Plato', contribution: 'Defined justice as harmony of the soul and the state, with each part performing its proper function.' },
    { name: 'Aristotle', contribution: 'Distinguished types of justice (distributive, corrective) and defined it as giving each their due.' },
    { name: 'John Rawls', contribution: 'Developed "justice as fairness" with the veil of ignorance thought experiment.' }
  ],
  modern: [
    'Legal Systems: Constitutional frameworks ensuring equal protection under law',
    'Restorative Justice: Focusing on healing and rehabilitation rather than pure punishment',
    'Distributive Economics: Fair allocation of resources (taxation, social programs)',
    'International Law: Human rights declarations and war crimes tribunals',
    'Social Movements: Civil rights, environmental justice, economic equality'
  ]
};

export default function Justice() {
  return <ConceptPage concept={justiceData} />;
}
