# Word Choice Finder

The Word Choice finder page is an activity where a user clicks on a button
to hear a word, and must then click on a button to choose which word was said.
The user only gets one chance to choose the right word, and a score is kept.

The page consists of:

* Words to Choose panel, consisting of a button for each word to choose
* Words to Find panel, containing:
   * a row of buttons for each word to find
* Score & controls panel, containing: 
  * A display of how may correct out of how many attempted so far
  * Control buttons on the right:
    * Retry button, that is enabled when all words have been attempted
    * New button (always enabled)

The words to find are a random permutation of the words to choose.

The words to choose display the actual word. Also they do not display
any memory of which words the user has previously chosen (whether correct or incorrect).

The words to find are displayed initially as a question mark with white background.

The activity workflow for the user for each word to find is:

* Click on a word to find (even with auto, the first word has to be manually selected)
* The word displays as the current word to find with a yellow background (still showing
  the question mark)
* The word is said.
* The user then has to click on one of the words to choose. (They can click on the
  same word to find to hear it again, but clicking on a different word to find does nothing.)
* The chosen word is said.
* Then, depending on whether the correct word was chosen:
  * Correct:
     * The word to find displays in a green background and the question mark disappears
  * Incorrect:
     * The word to find displays in a red background and the question mark disappears
     * The application says a sad word.
     
If "Auto" is selected, then if there are more words to find, the application chooses
one at random. Otherwise the user has to manually click on the next word.

If the user gets 10/10 correct, then the applicatio says a happy word.

The New button can be pressed at any time to re-start with a new set of words,
but if the current round is not completed a dialog will pop up to confirm if
the user wants to quit and restart.

