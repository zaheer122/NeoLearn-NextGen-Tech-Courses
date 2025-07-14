import React, { Component } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console or an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset() {
    // Reset the error boundary state
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Attempt to reload the component
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <AlertTriangle className="error-icon" size={48} />
            <h2>Something went wrong</h2>
            
            {this.state.error && (
              <div className="error-message">
                <p>{this.state.error.toString()}</p>
              </div>
            )}
            
            <div className="error-actions">
              <Button onClick={this.handleReset} className="reset-button">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="reload-button"
              >
                Reload Page
              </Button>
            </div>
            
            <p className="error-help-text">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 