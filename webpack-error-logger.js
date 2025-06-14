/**
 * Simple express middleware for webpack dev server to log client-side errors
 */
export default function setupErrorLogger() {
  return (req, res, next) => {
    // Handle error logging endpoint
    if (req.path === '/api/log-error' && req.method === 'POST') {
      let data = '';

      req.on('data', chunk => {
        data += chunk;
      });

      req.on('end', () => {
        try {
          const errorData = JSON.parse(data);

          // Format the error message for console output
          const timestamp = new Date().toISOString();
          const message = errorData.message || 'Unknown error';
          const stack = errorData.stack || '';

          // Print error in bold red in the console
          console.error('\n\x1b[31m\x1b[1m--- CLIENT ERROR ---\x1b[0m');
          console.error(`\x1b[1mTimestamp:\x1b[0m ${timestamp}`);
          console.error(`\x1b[1mMessage:\x1b[0m ${message}`);

          if (stack) {
            console.error('\x1b[1mStack:\x1b[0m');
            console.error(stack);
          }

          console.error('\x1b[31m\x1b[1m------------------\x1b[0m\n');
        } catch (e) {
          console.error('Error parsing client error:', e);
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'logged' }));
      });
    } else {
      next();
    }
  };
}
