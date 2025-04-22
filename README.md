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
- `npm build` - Build for production
- `npm typecheck` - Run TypeScript type checking
- `npm lint` - Run ESLint
- `npm test` - Run tests