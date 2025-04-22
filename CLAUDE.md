# Change My Letters

*Change My Letters* is going to be a Javascript educational activity/game that runs
in an HTML web page.

The initial version will be delivered as a purely client-side application that runs 
in the user's web browser, so that the application can be run from a `file:/` URL
or served from a static web service such as Cloudfare. 

Session state, if required, can be stored in LocalStorage.

## Technology Stack

The primary stack will be:

* `Typescript`, with strict type-checking
* `mobx` for the model, mostly using Typescript classes
* Function React written in TSX for the view, where the view component props are mostly
  mobx model objects or attributes of those objects.
* `node` and `npm`
* `webpack` for compilation and development

I have node v23.11.0 and npm v10.9.2 installed globally on my development Mac.

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
    
# Implementation details
  
* The application will contain a pre-computation step to convert the list of words into
  a graph of words linked by possible one-letter changes. Depending on how the word list is provided, 
  this precomputed graph may be saved as a JSON file and loaded directly, or it might be
  precomputed when the session is started (for example if the word list is being loaded by the user).
