import React from 'react';
import ConceptPage from './components/ConceptPage';

const excellenceData = {
  icon: '👑',
  title: 'Excellence',
  greek: 'Ἀρετή',
  tagline: 'Arete: The Highest Form of Human Flourishing',
  gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, transparent 50%), linear-gradient(135deg, #0d0d17 0%, #1a1a2e 100%)',
  quote: {
    text: 'Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution.',
    author: 'Aristotle',
    greek: 'ἡ ἀρετὴ οὐκ ἔστι τύχη ἀλλὰ ἔργον'
  },
  definition: [
    'Arete (Ἀρετή), often translated as "excellence" or "virtue," represents the fulfillment of purpose—being the best version of what something is meant to be. For a knife, arete is sharpness; for a horse, speed and strength; for a human, the cultivation of reason, courage, wisdom, and moral character.',
    'Excellence is not a single act but a way of being, cultivated through habit. Aristotle taught that we become excellent through repeatedly performing excellent actions until virtue becomes our nature. It is both a means to eudaimonia (flourishing) and constitutive of it.',
    'The ancient Greeks saw excellence as encompassing the whole person: physical fitness (gymnastics), intellectual development (philosophy), artistic skill, moral virtue, and civic contribution. True excellence harmonizes all these dimensions.'
  ],
  principles: [
    {
      icon: '🎯',
      title: 'Telos (Purpose)',
      description: 'Understand and fulfill your unique purpose. Excellence is achieving what you are meant to achieve.'
    },
    {
      icon: '🔄',
      title: 'Habitual Practice',
      description: 'Virtue is a habit, not an isolated act. Repeat excellent actions until they become second nature.'
    },
    {
      icon: '⚖️',
      title: 'Golden Mean',
      description: 'Excellence is the mean between deficiency and excess. Courage is between cowardice and recklessness.'
    },
    {
      icon: '🌟',
      title: 'Holistic Development',
      description: 'Cultivate mind, body, and character. True arete integrates intellectual, physical, and moral excellence.'
    }
  ],
  philosophers: [
    { name: 'Homer', contribution: 'Depicted arete in heroes like Achilles—excellence in battle, honor, and fulfilling one\'s destiny.' },
    { name: 'Socrates', contribution: 'Redefined arete as moral virtue and knowledge of the good, not just physical prowess.' },
    { name: 'Aristotle', contribution: 'Systematized virtue ethics: arete as the mean between extremes, cultivated through habit.' },
    { name: 'Stoics', contribution: 'Taught that virtue alone is sufficient for eudaimonia; external goods are "preferred indifferents."' }
  ],
  modern: [
    'Performance Excellence: Peak performance in sports, arts, and professions',
    'Character Education: Teaching virtues like honesty, courage, and compassion in schools',
    'Professional Ethics: Standards of excellence in medicine, law, and other professions',
    'Personal Development: Self-actualization and reaching one\'s full potential',
    'Organizational Culture: Pursuit of excellence as a core value in companies and institutions'
  ]
};

export default function Excellence() {
  return <ConceptPage concept={excellenceData} />;
}
