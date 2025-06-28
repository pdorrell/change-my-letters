# Words in Row Finder

The Words in Row finder page is a bit like a traditional word search puzzle,
but with one word at a time in a single row of letters.

There is no scoring - a given round is completed when the current set of
words to find have all been found.

The page contains the following panels:

* Controls panel, containing:
  * "Difficulty" radio buttons, either 'easy' or 'hard', defaults to 'easy'
  * "Forwards only" checkbox, defaults to checked
  * "Auto" checkbox, defaults to unchecked
  * (On the right side) "New" button, enabled when the activity is completed
* Instructions panel, saying "Click/touch any square in the bottom row to hear a word, then find the word in the line of letters."
* The row of letters that the word to find will appear in (blank when there is no current word to find)
* Words to Find panel, consisting of a button for each word to find, where each button initially shows a question mark.

The activity workflow is:

* The user chooses a word to find.
* The chosen word is pronounced and the word to find button displays a light orange background.
* The row of letters is populated, with the word to find somewhere in the letters.
* The user has to drag a selection, using either mouse or touch, starting with the first letter of
  the word and finishing with the last letter. The active selection is shown with a light orange background.
* If the word is selected correctly, then:
  * The selected word shows with a light green background (slightly darker for the first letter).
  * The word to find button switches to a green background.
  * The user can now click on the next word to find. (If auto is checked, the application will
    automatically choose the next word to find.)
* If the word is selected incorrectly, then:
  * The selected word shows with a light red background (slightly darker for the first letter).
  * The word to find button switches to a red background.
  * The user has to try again to correctly select the word to find. (They can always click again on the
    word-to-find button to hear it pronounced again.)
    
Once all the words have been found the "New" button is enabled.

## Difficulty

The difference between easy and hard is that in easy mode the other letters in the row are randomly
chosen, but in hard mode the other letters are more likely to be the same letters in the word itself
(but without the word appearing more than once in the row).

## Forwards only

In forwards-only mode the word always appears forward in the row of letters, and the user's selection
can only go forward from the starting point.

If not forwards-only, then there is a 50% chance that the word to find will appear backwards in the
row of letters. The user's selection has to start with the first letter of the word (so if the word
is backwards, such as "tac" for "cat", then the user has to start the selection with "c" and drag
backwards until they read the "t").



