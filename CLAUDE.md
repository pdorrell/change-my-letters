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


## Review Pronunciation Page

There is an additional "Review Pronunciation" page. This page allows the user to
review the pronunciation of the word MP3s, so that the use can download a list
of words that sound wrong, which can be passed to separate software to re-generate
or re-record those words.

The page is enabled by a global flag in the source code - it is only relevant when developing the
application, so it will be disabled once all words are deemed satisfactory, 
but it will need to be re-enabled when a new set of MP3s is being created.

The state of the review pronunciation is managed by a process of uploading and downloading 
files, in particular:

* review-pronunciation-state.json - A JSON file that contains the review state of those words
  that have been reviewed or marked as sounding wrong (ie any word not in the file is assumed to be not reviewed
  yet, and an empty file is a valid file).
* words-that-sound-wrong.txt - A text file where each line is a word that the user has marked 
  as sounding wrong.
  
The review state file has a format like: 

`{'reviewed': ['cat', 'dog', 'cow', 'hose', 'ache'], 'soundsWrong': ['hose', 'ache']}`
  
In local developer mode, and only in local developer mode, the initial review pronunciation state
is loaded from src/data/local_dev/review-pronunciation-state.json when the application starts.
This makes it convenient for the developer to save an updated review pronunciation state as a new copy of that file.

### Review Word State

Review state is determined by three boolean attributes on each Word:

* reviewed - has it been reviewed?
* currentReview - is it the word currently being reviewed (and the user may still be deciding
  whether or not it sounds wrong)
* soundsWrong - did it sound wrong?

Only one word can have currentReview=true, but this constraint is managed by the ReviewPronunciationModel.

### UI

The UI for the Review Pronuncation page contains a display of filtered words somewhat similar
to that of the Reset page.

A button with "-> Review Pronunciation" is shown at the far right of the main "Current Word" panel.
When in the Review Pronunciation page, there is a corresponding "-> Current Word" button to go
back to the current word.

The page has the following components -

* Action Buttons Panel -
   * "Load State" - upload review-pronunciation-state.json, where the supplied file has to have
     exactly that name. This button also acts as a drag-and-drop target to upload the same file.
   * "Save State" - save review-pronunciation-state.json by allowing the user to download it
   * Download wrong words - save words-that-sound-wrong.txt by allowing the user to download it
   * "Reset All to Unreviewed"
   * "Reset All to OK"
   * "Review Wrong Words" - set `reviewed = not soundsWrong` for all words, and clear currentReviewWord is it's not wrong
* Just Reviewed word panel -
   * The word last reviewed (if any), shown in review state colour
   * "Sounds Wrong" button to mark that word as sounding wrong (enabled if current word is currently marked OK)
   * "Sounds OK" to mark word OK (enabled if current word is currently marked wrong)
* Filter Panel
   * Filter text
   * Match start checkbox
   * Selector to additionally filter on review state -
      * All (default)
      * Un-reviewed (not yet reviewed)
      * Wrong (already marked wrong)
      * Un-reviewed or Wrong
* Filtered words
   * For each word a span
   * Show review state background colour -
      * Light blue if reviewed and OK
      * Light pink if wrong
      * For the currentReview word - use a stronger blue & pink, and have a black border (also use
        a transparent border if not black of the same size, to prevent layout jumping)
      
When clicking on word span -
   * The current review word (if any) is marked as reviewed
   * The word clicked on becomes the current review word
   * The soundsWrong value for either of those words is _not_ changed. (That is, soundsWrong
     for the current review word is only updated by clicking on the "Sounds Wrong" or "Sounds OK" buttons)
     
This supports a process where the user clicks on each word once to hear it said, and
only needs to do an extra click if it sounds wrong (with "Sounds OK" to deal with the case
where they change their mind or they accidently clicked on Sounds Wrong unintentionally).
   
When initially navigating to the review pronunciation page, the following items are reset -

* currentReviewWord is set to null (and currentReview attribute on the last word if any is set to false)
* Filter text set to empty
* Match start is set to true
* Review state filter set to All

Apart from that, the reviewed & soundsWrong attributes on individual words are _not_ updated
when navigating to the Review Pronunciation page.

### Implementation outline

The view will be a `ReviewPronunciationView` based on a `ReviewPronunciationInteraction` model.

ReviewPronunciationInteraction will have the following attributes & methods -

* Public constructor params:
  * sortedWords: Word[] - words already sorted, ie from WordGraph.sortedWords
  * wordSayer: WordSayer
* wordsMap: map from str->Word
* filter: string
* reviewStateFilter: ReviewStateFilterOption
* reviewStateFilterOptions: ReviewStateFilterOption[] (a fixed list of 4 options)
* matchStartOnly: boolean
* currentReviewWord: Word | null
* setReviewState(jsonData)
* getReviewState() => json data (only include words reviewed or soundsWrong)
* getWrongSoundingWords() => string[] (sorted in alphabetic order)
* resetAllToUnreviewed()
* resetAllToOK()
* reviewWrongWords() - 
* markOK(word: str)
* markSoundsWrong(word: str)
* reviewWord(word: str) set word to be new current review word, and say that word

Also, define ButtonAction's for all the buttons.

ReviewStateFilterOption is a class with attributes:

* label
* include(word: Word) => bool

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

Typescript typechecking is set to `strict`.

The keywords `as` and `any` should not be used unless absolutely necessary, and if they are used
this should be accompanied by a comment explaining why they have to be used.


## Use Test Doubles not Mocks

If at all possible, do not use mocks for testing. In particular, do not use `jest.mock` or `jest.fn` 
(or any other attribute of `jest`).

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

## eslint settings

There are eslint settings to enforce the following rules -

* no trailing spaces (therefore all blank lines are completely empty)
* source files must end on a eoln character
* no unused variables, and unused parameters must start with _
* no unused imports
* check for missing mobx `observer` for functional react components

## Make Me

"Make Me" is an additional feature of the main "Word" page.

* A button "Make Me" to the right of the other buttons
* When the user presses "Make Me", the application randomly chooses
  a word that can be made from the current word in one step, giving
  preference to words not yet visited, and the application says that word.
  * If the "Make Me" word has been set, then pressing the "Make Me"
    button again just makes it say the same make me word again, 
    for example if the user didn't hear it properly the first time.
    But pressing it again doesn't otherwise alter the current state.
  * When the user changes the current word, the application says the
    new current word (whether or not Say Immediately is checked)
    * If the new word matches the Make Me word, the user scores 1 corrrect
    * If the new words doesn't match, the user scores 1 incorrect
  * After the user changes the current word, the "Make Me" button is 
    re-enabled
  * The score is displayed in a panel below the main word display, but above the history
  
The score display shows as a label on the left, "Make Me Score", and two rows of squares -
* The first row is one green square for each correct answer
* The second row is one red square for each incorrect answer

The user is free to make normal word changes even if the "Make Me" button isn't
pressed.

The score panel only displays after the "Make Me" button has been pressed the first
time after starting the application or resetting the current word.

The mobx state supporting this feature would be:

* A ScoreModel class that contains two values, both starting at 0 -
  * correct : int
  * incorrect : int
* ScoreModel also has a label param of type string[] (usually just 2 lines so
  that the label matches the height of the green & red rows.
  
AppState has the following -

* makeMeWord: Word | null - the current word if the Make Me button has been pressed
* makeMeScore: ScoreModel the score for the Make Me button initialised with a label `['"Make Me"', 'Score'] (so actually
  showing quotes around Make Me).
* makeMeButtonAction: ButtonAction - The action for makeMeButtonAction calls
  a method AppState.makeMeSay() which:
  * if makeWord already exists, just says it again
  * if makeWord doesn't yet exist:
    * chooses the makeMeWord
    * says the makeMeWord
    * creates a new makeMeScore if there isn't one yet
* update AppState.setCurrentWord so that:
  * if makeMeWord is not null and the new word matches the makeMeWord, say one
    of the 4 special words cool!! wow!! hooray!! or yes!! (at random)
  * otherwise, if makeMeWord is not null or sayImmediately is checked, then say the new current word 
  * if makeMeWord is not null
     * check if makeMeWord matches the new word
       * defensively creates a makeMeScore if it doesn't yet exist (actually always it will,
         but this makes the type-checking easier)
       * increment the makeMeScore.correct or incorrect value accordingly
     * set makeMeWord back to null

Suggested names of new view class -

* ScorePanel, taking scoreModel: ScoreModel as a prop
