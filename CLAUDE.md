# Change My Letters

*Change My Letters* is a JavaScript educational activity/game that runs in an HTML web page. It allows users to transform words one letter at a time through various operations like deleting, inserting, replacing, or changing the case of letters.

The application is delivered as a purely client-side application that runs in the user's web browser, so it can be run from a `file:/` URL or served from a static web service such as Cloudflare.

## Technology Stack

The application is built using:

* `TypeScript`, with strict type-checking
* `mobx` for the model, mostly using TypeScript classes
* Functional React components written in TSX, where component props are mostly mobx model objects or attributes
* `node` and `npm` for development
* `webpack` for compilation and development, with support for serving the HTML page on `<hostname>.local` to facilitate testing on devices on the same local WiFi network

## High-level UI description

* The primary UI displays the current word prominently across the screen.
* The user can change one letter at a time of the current word to make a new word.
* The application uses a pre-defined word list to avoid objectionable words or unfamiliar, complex words.
* The UI shows the user where changes can be made:
    * For each letter - indicators for possible deletion, replacement, or case changes
    * For each position before, between, or after letters - indicators for possible insertions
* Specific changes that can be made are:
    * For a letter:
       * Delete the letter
       * Change the letter to a different letter
       * Change case (uppercase or lowercase) when applicable
    * For a position before, between, or after letters:
       * Insert a letter
* Interactions work with both mouse clicks and touch.
* The interaction details are:
   * Deletion - A delete icon is shown; clicking results in immediate deletion
   * Change - A change icon is shown; clicking displays a list of possible replacement letters
   * Case change - Upper/lowercase icons are shown; clicking results in immediate case change
   * Insertion - An insert icon is shown; clicking displays a list of possible letters to insert
* The application maintains session state, including:
   * An indication of whether the current word has been previously visited
   * Visual indicators for operations that would revisit previously seen words
   * Undo/redo functionality for word changes
   * A history view to see and navigate through the session history

## Reset Page

The application includes a dedicated Reset page that allows users to:
* Start a new session with a different initial word
* Filter the word list with a text input
* Choose to match only words that start with the filter text
* Select a word from the filtered list
* Choose a random word from the filtered list
* Cancel and return to the current word

This Reset page replaces the originally planned "Start over" button and the word list upload functionality.

## Audio Features

The application includes automatic audio pronunciation of words. For this reason, the application must contain MP3 files for all the words in the word list, which makes adding custom word lists difficult for a static website deployment.

## Model Structure

The application uses a clear separation between static state and interaction state:

* Static models (Word, Letter, Position) - represent the structure and properties of elements
* Interaction models (WordInteraction, LetterInteraction, PositionInteraction, ResetInteraction) - handle user interactions with those elements

### Core Models

* **Word** - Represents a word in the graph:
  * Contains the word string and operations that can be performed on it
  * Has properties for possible deletions, replacements, insertions, and case changes
  * Has computed properties (getters) for letters and positions
  
* **Letter** - Represents a single letter in a word:
  * Contains the letter value and its position
  * Has computed properties for possible operations (delete, replace, change case)
  
* **Position** - Represents a position where letters can be inserted:
  * Contains the position index
  * Has computed properties for insertion possibilities

### Interaction Models

* **WordInteraction** - Manages interactions with the current word:
  * Contains the Word object and whether it has been previously visited
  * Manages letter and position interactions
  * Handles word updates and menu states
  
* **LetterInteraction** - Manages interactions with a letter:
  * Contains the Letter object
  * Manages replacement menu state
  
* **PositionInteraction** - Manages interactions with a position:
  * Contains the Position object
  * Manages insert menu state
  
* **ResetInteraction** - Manages the Reset page:
  * Handles word filtering and selection
  * Manages filter state and matching options

### Other Key Models

* **WordGraph** - Represents the graph of words and their possible transitions
* **HistoryModel** - Tracks the history of words and changes, with undo/redo support
* **AppState** - Main application state that manages the current page and models

## View Components

The application contains these main view components:

* `CurrentWordView` - Displays the current word with all interaction elements
* `LetterView` - Displays a letter with its interaction options
* `PositionView` - Displays a position with its insertion options
* `LetterChoiceMenu` - Displays possible letters for insertion or replacement
* `HistoryView` - Shows the session history
* `ResetView` - Provides word filtering and selection for starting a new session

## Deployment

The application is deployed to a static web server. The deployment process includes:

1. Running the TypeScript compiler for type checking
2. Running ESLint for code quality
3. Running tests to ensure everything works
4. **Regenerating the word graph JSON file** from the word list
5. Building the application with webpack
6. Copying the built files to the deploy directory

The deploy scripts are configured to always regenerate the word graph JSON file to ensure it's up-to-date with the word list.

## Testing and Type Checking

All changes to the application should pass:

* `npm test` - Run the Jest test suite
* `npm run typecheck` - Verify TypeScript type correctness
* `npm run lint` - Check code quality with ESLint


## Use Test Doubles not Mocks

If at all possible, do not use mocks for testing.

Instead, use *Test Doubles* where a Test Double is an object `tx` of type `X` that _substitutes_ for
an object `x` of type `X` passed as a parameter to some method or constructor. `tx` may or may not
be a partial simulation of `x`, or it may be a dummy replacement that does nothing, or it might just
record method calls made (a bit like what mocks do, but the important thing is that it is a test double
and it's not a mock).

Where there is some global object of service that an application depends on that we do not
want to invoke in a test, create a wrapper object that uses the global object to perform the functions
required by the application, and then in the tests create a test double for the wrapper object.

There can exist tests for test doubles, for example to make sure they behave in a reasonable manner
compared to the thing they are a double of.

In this project, test doubles are in directory `tests/test_doubles` and tests for test doubles are
in `tests/test_double_tests`.

Current test doubles are -

* `DataFileFetcherTestDouble` which is a test double for `DataFileFetcher` which wraps use of global `fetch` to
  get the contents of application data files.
* `WordSayerTestDouble` which is a test double for `WordSayer` which wraps use of the global `Audio` class to
  generate audio of words from MP3 files.

