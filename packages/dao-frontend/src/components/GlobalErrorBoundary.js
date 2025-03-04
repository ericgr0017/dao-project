import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
    
    // Track mounted state to prevent memory leaks
    this._isMounted = true;
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);
    
    // Only update state if component is still mounted
    if (this._isMounted) {
      this.setState(prevState => ({
        errorInfo,
        errorCount: prevState.errorCount + 1
      }));
    }
    
    // You can also log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }
  
  componentDidMount() {
    // Add event listener for unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handlePromiseRejection);
    
    // Reset error state when route changes
    if (this.props.location) {
      this._lastLocation = this.props.location.pathname;
    }
  }
  
  componentDidUpdate() {
    // Reset error state when route changes
    if (this.props.location && this._lastLocation !== this.props.location.pathname) {
      this._lastLocation = this.props.location.pathname;
      if (this.state.hasError) {
        this.setState({ 
          hasError: false, 
          error: null, 
          errorInfo: null 
        });
      }
    }
  }
  
  componentWillUnmount() {
    // Prevent memory leaks
    this._isMounted = false;
    
    // Remove event listeners
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
  }
  
  handlePromiseRejection = (event) => {
    // Prevent the default handling of the error
    event.preventDefault();
    
    console.error('Unhandled Promise Rejection:', event.reason);
    
    // Only update state if component is still mounted
    if (this._isMounted) {
      this.setState({ 
        hasError: true, 
        error: event.reason,
        errorInfo: { componentStack: 'Unhandled Promise Rejection' }
      });
    }
  }

  handleRestart = () => {
    // Clear the error state
    if (this._isMounted) {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null 
      });
    }
    
    // Use the navigate function passed as a prop
    if (this.props.navigate) {
      this.props.navigate('/');
    } else {
      // Force a reload of the current page as a last resort
      window.location.href = '/';
    }
  }

  render() {
    if (this.state.hasError) {
      // If we've had multiple errors in succession, suggest a full page reload
      const shouldSuggestReload = this.state.errorCount > 2;
      
      // Render fallback UI
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <div className="error-details">
            <p>The application encountered an unexpected error. This is often caused by network issues or contract interactions.</p>
            <p className="note">You can try the following:</p>
            <ul>
              <li>Return to the dashboard</li>
              <li>Check your wallet connection</li>
              {shouldSuggestReload && <li><strong>Refresh the page completely</strong> (recommended)</li>}
            </ul>
            <div className="error-actions">
              <button 
                className="back-home-button" 
                onClick={this.handleRestart}
              >
                Return to Dashboard
              </button>
              
              {shouldSuggestReload && (
                <button 
                  className="reload-button" 
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

// Wrapper component to provide navigation and location
const GlobalErrorBoundaryWithNavigation = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <GlobalErrorBoundary navigate={navigate} location={location}>
      {children}
    </GlobalErrorBoundary>
  );
};

export default GlobalErrorBoundaryWithNavigation; 