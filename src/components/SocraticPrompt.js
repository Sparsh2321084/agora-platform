import React, { useState } from 'react';
import './SocraticPrompt.css';

/**
 * SocraticPrompt - Interactive Socratic Method Dialogue
 * Implements the questioning technique of Socrates
 * Guides users through inquiry and reasoning
 */

const QUESTION_TYPES = {
  clarification: {
    icon: '🔍',
    prompts: [
      'What do you mean by that?',
      'Can you give an example?',
      'How does this relate to what we discussed?'
    ],
    color: 'var(--azurite)'
  },
  assumption: {
    icon: '🤔',
    prompts: [
      'What are you assuming?',
      'Is this always true?',
      'What if we questioned that belief?'
    ],
    color: 'var(--olive-green)'
  },
  evidence: {
    icon: '📊',
    prompts: [
      'What evidence supports this?',
      'How do you know this is true?',
      'Can you cite a source?'
    ],
    color: 'var(--ochre-yellow)'
  },
  viewpoint: {
    icon: '👁️',
    prompts: [
      'What might others think?',
      'How would this look from another perspective?',
      'What is the counter-argument?'
    ],
    color: 'var(--tyrian-purple)'
  },
  implication: {
    icon: '⚖️',
    prompts: [
      'What are the consequences of this view?',
      'How does this affect the larger issue?',
      'What would happen if everyone believed this?'
    ],
    color: 'var(--cinnabar-red)'
  },
  question: {
    icon: '❓',
    prompts: [
      'Why is this question important?',
      'What problem does this solve?',
      'Is there a better question to ask?'
    ],
    color: 'var(--olympic-gold)'
  }
};

const SocraticPrompt = ({ 
  mode = 'all', // 'all' or specific type
  onSelect,
  compact = false
}) => {
  const [selectedType, setSelectedType] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState(null);

  const types = mode === 'all' ? Object.keys(QUESTION_TYPES) : [mode];

  const handleTypeClick = (type) => {
    setSelectedType(type);
    const prompts = QUESTION_TYPES[type].prompts;
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setCurrentPrompt(randomPrompt);
    
    if (onSelect) {
      onSelect({ type, prompt: randomPrompt });
    }
  };

  const resetPrompt = () => {
    setSelectedType(null);
    setCurrentPrompt(null);
  };

  if (compact) {
    return (
      <div className="socratic-prompt compact">
        <button 
          className="socratic-button"
          onClick={() => {
            const randomType = types[Math.floor(Math.random() * types.length)];
            handleTypeClick(randomType);
          }}
        >
          <span>⚡</span> Ask Socratic Question
        </button>
        
        {currentPrompt && (
          <div className="prompt-bubble" onClick={resetPrompt}>
            <p className="prompt-text">{currentPrompt}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="socratic-prompt">
      <div className="socratic-header">
        <h3 className="socratic-title text-epigraphic">Socratic Method</h3>
        <p className="socratic-subtitle">Question to discover truth</p>
      </div>

      <div className="question-types">
        {types.map((type) => {
          const typeData = QUESTION_TYPES[type];
          return (
            <button
              key={type}
              className={`type-button ${selectedType === type ? 'active' : ''}`}
              onClick={() => handleTypeClick(type)}
              style={{ 
                '--type-color': typeData.color 
              }}
            >
              <span className="type-icon">{typeData.icon}</span>
              <span className="type-name">{type}</span>
            </button>
          );
        })}
      </div>

      {currentPrompt && (
        <div 
          className="prompt-display"
          style={{ 
            '--prompt-color': QUESTION_TYPES[selectedType].color 
          }}
        >
          <div className="prompt-content">
            <span className="prompt-icon">{QUESTION_TYPES[selectedType].icon}</span>
            <p className="prompt-text">{currentPrompt}</p>
          </div>
          
          <button className="reset-button" onClick={resetPrompt}>
            Ask Different Question
          </button>
        </div>
      )}
    </div>
  );
};

export default SocraticPrompt;
export { QUESTION_TYPES };
