# Words in Grid Finder

The Words in Grid finder page is a bit like a traditional word search puzzle,
the main difference being that words only appear horizontally.

There is no scoring - the search is completed when the current set of
words to find have all been found.

The page contains the following panels:

* Controls panel, containing:
  * "Difficulty" radio buttons, either 'easy' or 'hard', defaults to 'easy'
  * "Forwards only" checkbox, defaults to checked
  * "Auto" checkbox, defaults to unchecked
  * (On the right side) "New" button, enabled when the activity is completed
* A 10 x 10 grid of letters containing the hidden words.
* Words to Find panel, consisting of a button for each of ten words to find, where each button initially shows a question mark.

The activity workflow is:

* The user chooses a word to find.
* The chosen word is pronounced and the word to find button displays a light orange background.
* The user has to drag a selection, using either mouse or touch, starting with the first letter of
  the word and finishing with the last letter. The active selection is shown with a light orange background.
  The words are only located horizontally in the grid, so the selection can only extend with the same row.
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
* Special case: a palindromic word can be selected by the user in either direction, if the activity
  is in not forwards-only mode. (In forwards-only mode it can only be selected forwards, because the
  application will only allow the user to select in a forwards direction.)
    
Successfully found words remain highlighted in green as the activity proceeds.
    
Once all the words have been found the "New" button is enabled.

## Difficulty

The difference between easy and hard is that in easy mode other letters in the grid are randomly
chosen, but in hard mode the other letters are more likely to be the same letters of the words to 
find (but without any of the words to find appearing more than once in the grid - see below
for details of how to avoid this).

## Forwards only

In forwards-only mode the word always appears forward in the row it's located in, and the user's selection
can only go forward from the starting point.

If not forwards-only, then there is a 50% chance that the word to find will appear backwards in the
row containing it. The user's selection has to start with the first letter of the word (so if the word
is backwards, such as "tac" for "cat", then the user has to start the selection with "c" and drag
backwards until they read the "t").

## Positioning and Population algorithm

Rules for populating the grid:

Firstly, how to choose and place the list of 10 words to find:

* The words to find have to be at least 3 letters long.
* Additionally no word to find can be a sub-string of another word to find.
* Ten words are chosen randomly from the words list - but there must be at least one letter of
  the alphabet that is not in any of the words. So the algorithm must keep track of the set of
  letters not in any of the words so far chosen, and if the next choice of word reduces the number
  of unchosen letters to zero, then that choice of word must be rejected.
* Words are chosen randomly by choosing a random index in the ordered word list. If a word 
  cannot be chosen, because it is already chosen, or because it would use up all the letters
  not yet chosen, or because it is not at least 3 letters long, or because it is a substring
  or superstring of a word already chosen, then the algorithm should 
  search forward through the list until it can find a next word that can be chosen.
* Each word in turn is placed randomly within the grid, ie randomly chosen
  from the set of positions that it can fit without overlapping with any
  other word already placed, and without being next to another word already placed (that is,
  there is always at least one letter of separation between words in the same row).
* In forwards-only mode, words can only be placed in the forwards direction.
  In not forwards-only mode, there is a 50% chance that a word will be placed backwards.
  
Secondly, how to place other letters into the remaining spaces in the grid:

* Firstly, determine the set of letters to choose from:
   * In easy mode - all the letters of the alphabet
   * In hard mode - chosen randomly from a string that is the concatenation of the ten
     words to find
* For each position to be populated, choose a random letter from the set of letters.
* Then, find any false placements of the words to find, depending on mode:
  * In forwards-only mode, a false placement of a word is an occurrence of the word
    in the forwards direction that is not its chosen placement.
  * In non forwards-only mode, a false placement of a word is an occurrence of the
    word in either direction that is not its chosen placement. One special case is
    that a palindromic word-to-find will exist both backwards and forwards in its placement.
* The rule for fixing a false placement is:
  * For the first letter of the false placement that is not part of an actual placement,
    randomly choose one of the letters in the not chosen set to replace that letter.
    (In some cases fixing one false placement might fix another false placement not yet
    fixed, so always check first that the false placement has not already been fixed.)

It is very unlikely that this algorithm could get stuck trying to place words and remaining
letters, but if it does get stuck, then try again. After a certain number of attempts (eg 10)
fail with an error message - repeated failure almost certainly implies some bug in either
the design or implementation of the placement algorithm. And if more than one attempt
but not more than ten attempts are required, pop up an alert saying how many attempts were required
(and then allow the user to carry on with the activity after dismissing the alert).




