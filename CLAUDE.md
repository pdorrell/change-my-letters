# Change My Letters

*Change My Letters* is going to be a Javascript educational activity/game that runs
in an HTML web page.

The initial version will be delivered as a purely client-side application that runs 
in the user's web browser, so that the application can be run from a `file:/` URL
or served from a static web service such as Cloudfare. 

Session state, if required, can be stored in LocalStorage.

## Technology Stack

I have node v23.11.0 and npm v10.9.2 installed globally on my development Mac.

The primary stack will be:

* `Typescript`, with strict type-checking
* `mobx` for the model, mostly using Typescript classes
* Function React written in TSX for the view, where the view component props are mostly
  mobx model objects or attributes of those objects.
* `node` and `npm`
* `webpack` for compilation and development. This should support serving the HTML page on 
`<hostname>.local` server address to support testing on an ipad on the same local wifi network.

## High-level UI description

* The primary UI consists of display of the current *word* in a manner that takes up
  most of the width of the screen.
* The primary interaction is that the user can change one letter at a time of the
  current word to make a new word.
* Any running instance of the application will be based on a pre-defined word list.
  Use of a predefined word list avoids the appearance of objectionable words, and also
  avoids confusion that might be caused by the construction of "harder" words that the
  (probably young) user doesn't know.
* The UI will show the user, for each letter and also for each position before, between
  or after letters, indication that a one letter change can be made.
* Specific changes that can be made are:
    * For a letter -
       * Delete the letter
       * Change the letter to a different letter
       * Lower-case or upper-case the letter (this presumes that the word list might
         include upper-cased words such as names, and that these are considered distinct
         from the lower-case words, eg "Jack" and "jack". And "Jill", but not "jill" because
         "jill" is not a word).
    * For a position before, between or after letters:
       * Insert a letter
* Interactions may occur either by mouse-click or touch.
* Details of interaction for each change type are -
   * Deletion - a delete icon (eg a trash can) is shown, and click/touch results in immediate 
     deletion.
   * Change - a change icon is shown, and click/touch displays a list of possible replacement letters.
     A second click/touch on the selected replacement causes the replacement to occur. (Click/touch outside
     will cancel the change.)
   * Lower or upper casing - a lowering or uppering icon will be shown in each case, and click/touch
     results in the immediate case change.
   * Insertion - an icon of some kind will display in the position. Click/touch will display a list
     of possible letters to be inserted. Click/touch on a letter will result in the insertion happening.
* Session - interaction with the application occurs within a `session`. Each session starts with the
  an initial word that is selected somehow (possibly at random or some other way). The session state
  must include the full history of what change occurred to get from each word to the next. There will be
  an available "Clear session" button (which might actually be labelled "Start over" or something else 
  more user-friendly), which starts a new session, discarding the existing history.
* Session state enables the following additional UI features -
    * An indication of whether the user has previously visited this word.
    * For all change icons and letter choices, whether the user has already visited what the new word would be.
    * Ability to undo the last change (and to re-do if the last change was an undo).
    * Ability to view and review the full session, and maybe jump back to a previous state
* The application may provide a menu of pre-loaded word lists, and additionally might provide an option to 
  upload a word list by cutting-and-pasting text in form, or by uploading a file.
  
### Capitalisation

By default words are be lowercased. However the application will allow capitalised words such as common
names to be included.

When any non-case-change operation changes a letter, even if the starting word is capitalised, that operation will
generate a lower-cased word, but when there is no lower-cased word in the list, then it will choose
a non-lower-cased version of that word (of which almost always there will only be one).

When the option is available because lower-cased and capitalised versions of the same word appear
in the word list, a user can execute an upper-casing or lower-casing operation directly.

    
# Implementation details
  
* The application will contain a pre-computation step to convert the list of words into
  a graph of words linked by possible one-letter changes. Depending on how the word list is provided, 
  this precomputed graph may be saved as a JSON file and loaded directly, or it might be
  precomputed when the session is started (for example if the word list is being loaded by the user).
  At least one example of such a pre-computed file is included in the `examples` sub-directory of this project.

## View Components

I would expect the application to contain functional React components for each of the following items:

* `CurrentWordView` - The current word, which displays:
    * Has it previously been visited?
    * The alternating sequence of positions and letters
* `Letterview` each letter, which displays:
    * Delete icon if it can be deleted
    * Replacement icon if it can be replaced
    * Letter-choice menu is the replacement icon has been clicked
    * Upper or lower casing icon if it can be upper or lower-cased.
* `PositionView` each position, which displays:
    * Insert icon if a letter can be inserted
    * Letter-choice menu if the insert icon has been clicked
* Icons for delete, replace, insert, upper/lower casing.
   * Delete and casing icons should display a secondary characteristic to show if that change would visit
     a previously visited word.
* `LetterChoiceMenu` - Letter-choice menu - will display all possible letters that can be applied to the current insertion or
  replacement operation.
* `LetterChoiceOptionView` - Individual letter choice option
   * Each letter choice should display a secondary characteristic to show if that change would visit
     a previously visited word.
    
Additional global buttons or menu items would include:

* `See history` - which will visit a separate page to display the session history
* `Undo`, or `Re-do` if the last operation was an undo.

All model state should be contained in mobx class instances, so there should be no use of React `useEffect`.

## Model Components

Mostly the mobx model classes will correspond to the view components.

So:

* CurrentWord, with state:
  * The value of the word
  * Has it previously been visited?
  * The array of letters
  * Array of before, between & after positions
* Letter, with state:
  * The letter
  * Can it be deleted?
  * Can it be replaced, and if so by what letters?
  * Can it be upper/lower cased?
  * Is there a current replace menu open (ie with a choice of letters)?
* Position, with state:
  * Can any letter be inserted, and if so, what letters?
  * Is there a current insert menu open (ie with a choice of letters)?
  
* LetterChoiceMenu with state:
  * What are the possible letters, and which of them refer to a previous word?

There will also be a model for the WordGraph, which will not have it's own
view, but the CurrentWord model will refer to that graph to determine
it's own individual state when the word is updated.

There will be a separate HistoryModel, which is also used to populate
those elements of state depending on which words have previously been 
visited (in the session).

The HistoryModel will have a separate HistoryView which is different from the
main CurrentWordView, and some type of router will be used to navigate from
one to the other. This router should use a mobx state object to know which
page is currently being displayed.

## Source Code structure

It is preferred not to have too many small files, so smaller classes and functions can be grouped together.

For example all the components of the `CurrentWordView` could be in a single source file,
and similarly for the `CurrentWord` model class and it's components.

Large components like `HistoryModel` and `WordGraph` should be in their own separate files.

## History Model and View

The history model will contain enough information to reconstruct the actions the user has
taken to get from one word to another. It also tracks undo/redo state.

To keep things simple with the undo/redo state -

* The history is a simple linear sequence of word states. If there is no undo state, the
  the last state is the current state. Performing an undo state moves a pointer to the current
  word back in the history. Performing a redo moves forward again. If an operation that is not
  undo or redo is performed, then all existing undo state after the current word is deleted,
  and the latest change just goes after the current state.
  
The undo button is shown as disabled if no further undos are possible (ie the current word
is the first word in the history) and the redo button is shown as disabled if no more 
redos are possible (ie if the current word is the last word in the history).
  
* In most cases the operation to go from one word to another can be reconstructed from the
two words. However it would be more straightforward for the change to recorded explicitly,
eg `["delete_letter", 2]`, `["insert_letter", 3, "a"]`, `["upper_case_letter", 0]`, 
`["replace_letter", 2, "c"]`, which would avoid ambiguity in all cases, and avoid the need
to the compute the reconstruction.

The History View will show:

* A sequence of word states interleaved with the change operation from one word to the next.
* A pointer to the current word in the history.

The user can click on a given word in the history and click on a button to make that the current word,
and, optionally, navigate back to the current word view.

# Styling

CSS should be programmed using sccs.

Here is a suggested initial styling:

* Individual letters are drawn as boxes with black border and light yellow background and the letter
  text in black.
* Letter boxes display a delete icon and replace icon if those operations are possible.
* There is a gap between each letter box.
* Positions display an insert icon if an insert can be made.
* The letter choice menu (for insert or replace) shows letter choices as boxes, slightly smaller
  than the main letter boxes and with a light green background.
* A single common dull pink colour is used to indicate operations that revisit words already visited
  in the session: 
   * For letter menu choices this pink colour is the background colour.
   * For delete icon the pink colour replaces the icon's default background colour (the default background
     could just be transparent).

# Deployment

The application will be deployed to a static web server via a local git repository (where I will separately
connect this to a remote repository and configure deployment from the remote repository to the actual web hosting service).

There will be a `deploy` npm script which will make a copy of the files required for deployment in the 
`deploy` sub-directory. The `deploy` sub-directory will be git-ignored in this project, and it will have it's
own local git repository setup.

Some files will be generated each time the `deploy` script is run. For data files that are copied as is, the deploy
script will check if the source file is newer than the existing destination file (this is to allow for efficient
updating of large numbers of data files that may exist in the future).

The `deploy` script should not delete any destination files, unless run with the `--purge` option.

The result should be a website that can be accessed locally by the `file:///<project-base-dir>/deploy/index.html` in the browser.
