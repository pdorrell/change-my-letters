# Make Page

The Make page is an activity where the user has to click on a button to hear a new word,
and make that new word by changing one letter of the current word that they see.

After a new word is correctly made, it becomes the new current word, and the previous
current word is added to the history of words made.

(There is no scoring and no completion - the activity can just go on forever.)

The page consists of:

* A history of words made prior to the current word (initially empty). The words
  in the history are presented as a list of words going down the page.
* The current word panel -
   * The current word  as a word changer component as described at [../components/word-changer.md]
     with the display of change availability in Hidden mode, that is the user cannot tell
     looking at the current word which one letter changes are available.
   * To the right of that, a "New Word" button
* The new word panel, initially empty.

The words in the history, current and new word panels are all aligned with each other, ie the
1st letters of each word form a straight vertical column and similarly for the 2nd letters and so on.

When the user presses on the "New Word" button, the following happens:

* The application randomly chooses a new word to make, (but choosing from words not yet
  visited in the current round, if there are any to choose from).
* The application pronounces the new word to make.
* The user must then make a single letter change to the current word.
* What happens next depends on whether the user made the correct new word:
  * Correct: 
     * The application pronounces the new word and displays it in the new word panel with
       a light green background.
     * After a short wait, the application moves the history forward, ie:
       * The current word is added to the history so far
       * The newly made word becomes the current word
       * A new empty "new word" panel is created.
       * If necessary, the application scrolls the browser page down so that the new word panel
         is fully visible.
  * Incorrect:
    * The application pronounces the new (incorrect) word and displays it in the new word panel with
       a light pink background and with a large "X" icon to the right of it.
    * The "New Word" button is disabled
    * The user must then press the "X" icon, after which:
      * The new word panel is reset to empty, and the New Word button is re-enabled, waiting for
        the user to try again.

When the Make page is reset via the Reset page, a new current word is randomly chosen, and the
history is reset to empty.
