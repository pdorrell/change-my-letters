# Change My Letters

An educational activity/game where words are changed one letter at a time to make different words.

## Getting Started

### Prerequisites

- Node.js (v23.11.0 or later)
- npm (v10.9.2 or later)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd change-my-letters
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The application will open in your default browser at `http://local.<hostname>:3000`.

## Features

- Change one letter at a time to create new words
- Delete, insert, or replace letters
- Change case of letters when applicable
- Track history of changes and allow undo/redo
- Highlight previously visited words

## Technology Stack

- TypeScript
- MobX for state management
- React for UI components
- Webpack for bundling
- SCSS for styling

## Example Word Lists

The `examples` directory contains sample word lists that can be used with the application.

## Development

- `npm start` - Start the development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint and automatically fix issues when possible
- `npm run test` - Run tests
- `npm run serve` - Serve the production build on http://localhost:3001/

## Deployment

The application can be deployed to any static web hosting service:

- `npm run deploy` - Run typechecking, linting, tests, and build the project for production
- `npm run deploy:skip-tests` - Run typechecking, linting, and build (skipping tests)
- `npm run deploy:quick` - Quick build for production (skips all checks)
- `npm run deploy:fix` - Run typechecking, auto-fix linting issues, run tests, and build for production

After running one of the deployment commands, upload the contents of the `dist` directory to your web hosting service.

### Deployment Options

For quick local testing of the production build:
```
npm run serve
```
This will serve the application at http://localhost:3001/

For deployment to services like Netlify, Vercel, or GitHub Pages, configure the service to:
1. Run `npm run deploy` as the build command
2. Use `dist` as the publish directory
3. Configure for client-side routing by serving `index.html` for all routes (for 404 fallbacks)