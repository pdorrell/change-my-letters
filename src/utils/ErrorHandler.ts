/**
 * Utility for global error handling
 */
export class ErrorHandler {
  private static errorDisplayEl: HTMLDivElement | null = null;
  private static errors: string[] = [];
  private static errorListener: ((error: string) => void) | null = null;

  /**
   * Initialize the global error handler
   */
  static initialize(): void {
    // Create error display container if it doesn't exist
    if (!ErrorHandler.errorDisplayEl) {
      const errorEl = document.createElement('div');
      errorEl.className = 'global-error-container';
      errorEl.style.position = 'fixed';
      errorEl.style.top = '0';
      errorEl.style.left = '0';
      errorEl.style.right = '0';
      errorEl.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
      errorEl.style.color = 'white';
      errorEl.style.padding = '10px';
      errorEl.style.fontFamily = 'monospace';
      errorEl.style.fontSize = '14px';
      errorEl.style.zIndex = '9999';
      errorEl.style.maxHeight = '50vh';
      errorEl.style.overflowY = 'auto';
      errorEl.style.display = 'none';
      
      document.body.appendChild(errorEl);
      ErrorHandler.errorDisplayEl = errorEl;
    }

    // Set up global error handlers
    window.onerror = (message, source, lineno, colno, error) => {
      const errorMessage = `[ERROR] ${message} (${source}:${lineno}:${colno})`;
      ErrorHandler.captureError(errorMessage, error);
      return false; // Let the default handler run
    };

    // Handle promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      const errorMessage = `[Unhandled Rejection] ${error?.message || event.reason}`;
      ErrorHandler.captureError(errorMessage, error);
    });

    // Listen for custom error events
    document.addEventListener('app-error', ((event: CustomEvent) => {
      const { error, message } = event.detail;
      ErrorHandler.captureError(message || '[Custom Error]', error);
    }) as EventListener);

    console.log('Global error handler initialized');
  }

  /**
   * Capture and display an error
   */
  static captureError(message: string, error?: Error | any): void {
    const errorMsg = error ? `${message}\n${error.stack || error}` : message;
    
    // Add to our list of errors
    ErrorHandler.errors.push(errorMsg);

    // Display in the UI
    ErrorHandler.updateErrorDisplay();

    // Notify any listeners
    if (ErrorHandler.errorListener) {
      ErrorHandler.errorListener(errorMsg);
    }

    // Send to server in development
    if (process.env.NODE_ENV === 'development') {
      ErrorHandler.sendErrorToServer(message, error);
    }
  }

  /**
   * Update the error display with all captured errors
   */
  private static updateErrorDisplay(): void {
    if (ErrorHandler.errorDisplayEl) {
      // Only show the most recent errors (last 5)
      const recentErrors = ErrorHandler.errors.slice(-5);
      
      if (recentErrors.length > 0) {
        ErrorHandler.errorDisplayEl.innerHTML = '';
        
        // Add a header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.marginBottom = '10px';
        
        const title = document.createElement('strong');
        title.textContent = 'Application Errors';
        header.appendChild(title);
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Clear All';
        closeBtn.style.backgroundColor = 'transparent';
        closeBtn.style.border = '1px solid white';
        closeBtn.style.color = 'white';
        closeBtn.style.padding = '2px 5px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => {
          ErrorHandler.errors = [];
          ErrorHandler.updateErrorDisplay();
        };
        header.appendChild(closeBtn);
        
        ErrorHandler.errorDisplayEl.appendChild(header);
        
        // Add each error with its own clear button
        recentErrors.forEach((err, index) => {
          const errorItem = document.createElement('div');
          errorItem.style.marginBottom = '10px';
          errorItem.style.padding = '10px';
          errorItem.style.backgroundColor = 'rgba(0,0,0,0.2)';
          errorItem.style.position = 'relative';
          
          const errorClose = document.createElement('button');
          errorClose.textContent = '×';
          errorClose.style.position = 'absolute';
          errorClose.style.right = '5px';
          errorClose.style.top = '5px';
          errorClose.style.backgroundColor = 'transparent';
          errorClose.style.border = 'none';
          errorClose.style.color = 'white';
          errorClose.style.fontSize = '16px';
          errorClose.style.cursor = 'pointer';
          errorClose.onclick = () => {
            ErrorHandler.errors.splice(ErrorHandler.errors.length - 5 + index, 1);
            ErrorHandler.updateErrorDisplay();
          };
          
          const errorText = document.createElement('pre');
          errorText.style.margin = '0';
          errorText.style.whiteSpace = 'pre-wrap';
          errorText.style.wordBreak = 'break-word';
          errorText.textContent = err;
          
          errorItem.appendChild(errorClose);
          errorItem.appendChild(errorText);
          ErrorHandler.errorDisplayEl.appendChild(errorItem);
        });
        
        // Show the container
        ErrorHandler.errorDisplayEl.style.display = 'block';
      } else {
        // Hide the container when there are no errors
        ErrorHandler.errorDisplayEl.style.display = 'none';
      }
    }
  }

  /**
   * Send error to the webpack server
   */
  static sendErrorToServer(message: string, error?: any): void {
    try {
      const errorData = {
        message,
        stack: error?.stack,
        timestamp: new Date().toISOString()
      };

      // Send error to a custom endpoint
      fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
      }).catch(() => {
        // Silently ignore failed logging
      });
    } catch (e) {
      // Ignore any errors in the error logging itself
    }
  }

  /**
   * Register a callback for when errors occur
   */
  static onError(callback: (error: string) => void): void {
    ErrorHandler.errorListener = callback;
  }

  /**
   * Manually report an error
   */
  static reportError(error: Error | string, context?: string): void {
    const message = typeof error === 'string' 
      ? error 
      : error.message;
    
    const fullMessage = context 
      ? `[${context}] ${message}` 
      : message;
    
    ErrorHandler.captureError(fullMessage, typeof error === 'string' ? undefined : error);
  }
}