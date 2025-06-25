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

## Deployment Commands

* Run npm command `lint:fix-whitespace` to fix all the missing eolns
* Use the `/kill` URL to kill the webpack server

## Development Notes

* If version.txt happens to change, it's OK to include as is in the commit for other changes
