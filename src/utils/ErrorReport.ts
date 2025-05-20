/**
 * Error class for application errors that should be displayed to the user
 */
export class ErrorReport extends Error {
  /**
   * Creates a new ErrorReport
   * @param message The main error message
   * @param cause The original error that caused this error (if any)
   */
  constructor(
    message: string,
    public readonly cause?: Error | unknown
  ) {
    super(message);
    this.name = 'ErrorReport';
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorReport);
    }
  }
}