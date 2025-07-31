import { Component, ErrorInfo, ReactNode } from 'react';

// Helper function to safely convert unknown to string
function safeToString(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.stack || value.toString();
  try {
    return String(value);
  } catch (_e) {
    return 'Unknown value (could not convert to string)';
  }
}

// Helper function to get all causes in an error chain
function getErrorCauses(error: Error): Error[] {
  const causes: Error[] = [];
  let currentError: Error | null = error;

  while (currentError && 'cause' in currentError && currentError.cause instanceof Error) {
    causes.push(currentError.cause);
    currentError = currentError.cause;
  }

  return causes;
}

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
// eslint-disable-next-line mobx/missing-observer
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
    if (process.env.NODE_ENV === 'development') {
      this.logErrorToServer(error, errorInfo);
    }
  }

  // Function to send error to the webpack server
  logErrorToServer(error: Error, errorInfo: ErrorInfo): void {
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
    } catch (_e) {
      // Ignore any errors in the error logging itself
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const error = this.state.error;

      // For development mode, show full error details
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="error-boundary">
            <div className="error-container">
              <h2>Something went wrong</h2>
              <div className="error-details">
                <div className="error-message">
                  {error && error.toString()}
                </div>

                {/* Show error cause chain if available */}
                {error && 'cause' in error && error.cause !== null && error.cause !== undefined && (
                  <details>
                    <summary>Error Causes</summary>
                    {error.cause instanceof Error ? (
                      <>
                        <div>
                          <strong>Immediate cause:</strong>
                          <pre>{error.cause.stack || error.cause.toString()}</pre>
                        </div>

                        {/* Show nested causes if any */}
                        {getErrorCauses(error.cause).length > 0 && (
                          <div>
                            <strong>Nested causes:</strong>
                            {getErrorCauses(error.cause).map((cause, index) => (
                              <div key={index} style={{ marginLeft: '20px', marginTop: '10px' }}>
                                <div><strong>Cause {index + 1}:</strong></div>
                                <pre>{cause.stack || cause.toString()}</pre>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <pre>{safeToString(error.cause)}</pre>
                    )}
                  </details>
                )}

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

      // For production mode, show minimal error message
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>Something went wrong</h2>
            <div className="error-message">
              {error ? error.message : 'An error occurred while rendering the application.'}
            </div>
            <div className="error-actions">
              <button onClick={() => window.location.reload()}>
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
