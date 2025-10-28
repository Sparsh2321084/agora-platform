import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ items }) => {
  const navigate = useNavigate();

  return (
    <nav className="greek-breadcrumb">
      <div className="breadcrumb-path">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <div 
              className={`breadcrumb-item ${item.active ? 'active' : ''}`}
              onClick={() => !item.active && item.path && navigate(item.path)}
            >
              <div className="breadcrumb-stone">
                {index === 0 && <span className="breadcrumb-icon">🏛️</span>}
                {index > 0 && index < items.length - 1 && <span className="breadcrumb-icon">◆</span>}
                {index === items.length - 1 && <span className="breadcrumb-icon">⚜️</span>}
                <span className="breadcrumb-label">{item.label}</span>
              </div>
            </div>
            {index < items.length - 1 && (
              <div className="breadcrumb-divider">→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;
