import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component to catch and display errors in the app
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Send error to the webpack server console (if in development)
    this.logErrorToServer(error, errorInfo);
  }

  // Function to send error to the webpack server
  logErrorToServer(error: Error, errorInfo: ErrorInfo): void {
    // Only attempt in development mode when webpack server is running
    if (process.env.NODE_ENV === 'development') {
      try {
        const errorData = {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString()
        };

        // Send error to a custom endpoint
        fetch('/api/log-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(errorData)
        }).catch(err => {
          // Silently ignore failed logging - don't add more errors
          console.debug('Failed to send error to server:', err);
        });
      } catch (e) {
        // Ignore any errors in the error logging itself
      }
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render error UI
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>Something went wrong</h2>
            <div className="error-details">
              <div className="error-message">
                {this.state.error && this.state.error.toString()}
              </div>
              <details>
                <summary>Component Stack</summary>
                <pre>{this.state.errorInfo?.componentStack || 'No stack trace available'}</pre>
              </details>
              <div className="error-actions">
                <button onClick={() => window.location.reload()}>
                  Reload Application
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}