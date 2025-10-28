import React from 'react';
import './Timeline.css';

const Timeline = ({ items }) => {
  const getIcon = (status) => {
    switch (status) {
      case 'active':
        return '💬';
      case 'resolved':
        return '🏺'; // Wax seal
      case 'archived':
        return '🏛️'; // Amphora
      default:
        return '📜';
    }
  };

  return (
    <div className="greek-timeline">
      <div className="timeline-path">
        {items.map((item, index) => (
          <div key={index} className={`timeline-item ${item.status}`}>
            <div className="timeline-marker">
              <div className="marker-icon">{getIcon(item.status)}</div>
              <div className="marker-line"></div>
            </div>
            <div className="timeline-content">
              <div className="timeline-scroll">
                <h4 className="timeline-title">{item.title}</h4>
                <p className="timeline-description">{item.description}</p>
                <span className="timeline-date">{item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
