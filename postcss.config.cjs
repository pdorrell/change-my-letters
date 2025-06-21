const purgecss = require('@fullhuman/postcss-purgecss').default;

module.exports = {
  plugins: [
    // Only use purgecss in production builds
    ...(process.env.NODE_ENV === 'production' ? [
      purgecss({
        // Content sources - all TSX/TS files where CSS classes might be used
        content: [
          './src/**/*.{ts,tsx}',
          './src/index.html'
        ],
        
        // CSS sources to purge from
        css: ['./src/styles/**/*.scss'],
        
        // Default extractors for different file types
        defaultExtractor: content => {
          // Extract class names, including those with hyphens and underscores
          const broadMatches = content.match(/[A-Za-z0-9_-]+/g) || [];
          const innerMatches = content.match(/[A-Za-z0-9_-]*[A-Za-z0-9_-]/g) || [];
          return broadMatches.concat(innerMatches);
        },

        // Safelist - classes that should never be purged
        safelist: [
          // Dynamic classes that might be added by JS/React
          /^(hidden|loading|error|waiting|current|right|wrong|active|disabled|clickable)$/,
          /^(previously-visited|action-pending|touch-interactive-area)$/,
          /^(make-|word-|letter-|position-|finder-|review-|reset-)/, // Prefixed classes
          /^(ok|wrong|current-review|activity-mode)$/, // Review pronunciation states
          /^(correct-square|incorrect-square)$/, // Score panel squares
          /^(confirmation-|ellipsis)/, // Dialog and other dynamic classes
          
          // Utility classes
          /^(app-|page-|panel)/, // Layout classes
          /^(value-checkbox|show-history)/, // Component classes
          
          // State classes that might be toggled
          'delete-option',
          'hover',
          'focus',
          'focus-visible',
          
          // Pseudo-classes and pseudo-elements  
          ':hover',
          ':focus',
          ':active',
          ':disabled',
          ':first-child',
          ':last-child',
          ':not',
          
          // CSS custom properties that might be used
          /^--/
        ],

        // Skip keyframes since they're typically always needed
        keyframes: false,
        
        // Skip font-face rules since they're typically always needed  
        fontFace: false,

        // Reject function - don't purge certain selectors
        rejected: false, // Set to true to see what's being purged during development
        
        // Variables (CSS custom properties) should be kept
        variables: true
      })
    ] : [])
  ]
};