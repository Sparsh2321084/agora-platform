import React from 'react';
import './ErrorBoundary.css';

/**
 * ERROR BOUNDARY - Catches JavaScript errors anywhere in the component tree
 * Prevents entire app from crashing and shows fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // TODO: Send error to logging service (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Reload the page to start fresh
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            {/* Greek Temple Broken Column */}
            <div className="broken-column">
              <div className="column-piece column-top">🏛️</div>
              <div className="column-crack">⚡</div>
              <div className="column-piece column-bottom">🏛️</div>
            </div>

            <h1 className="error-title">The Temple Has Fallen</h1>
            <p className="error-subtitle">
              Even the mightiest structures sometimes crumble
            </p>

            <div className="error-quote">
              <p className="quote-text">
                "From the ruins, wisdom emerges stronger"
              </p>
              <p className="quote-author">— Ancient Proverb</p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="error-actions">
              <button className="error-btn primary" onClick={this.handleReset}>
                <span className="btn-icon">🏛️</span>
                Return to Agora
              </button>
              <button 
                className="error-btn secondary" 
                onClick={() => window.location.reload()}
              >
                <span className="btn-icon">🔄</span>
                Rebuild Temple
              </button>
            </div>

            <p className="error-help-text">
              If this issue persists, please contact the Oracle (support)
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
