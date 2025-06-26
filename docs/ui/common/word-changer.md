# Word Changer Control

The Word Changer control is used to display a single word in large letters
and gives the user the ability to choose a new word by changing one letter.

The changes can be any of:

* Delete a letter
* Replace a letter
* Insert a letter, before the start of the word, between two lettes, or after the start of the word.

The option to make any of these changes is only available if the resulting word is a word
in the full word list.

The Word Changer is presented in one of two modes two display change availability:

* Visible: For each letter and each insertion position the control displays to the user which
  of deletion, insertion or replacement is available.
* Hidden: For each letter and each insertion position no immediate indication is given
  if deletion, insertion or replacement is available.
  
Interaction occurs as follows:

* For insertion, the user clicks on a large "+" icon at the insertion position, and a menu
  pops up showing possible letters to insert at that position.
* For deletion or replacement, the user clicks on the letter itself, and a menu pops
  up showing the option of deletion with a bin icon, if available, and the possible letters
  to replace the current letter.
  
In visible mode, each letter shows a small bin icon at bottom left if deletion is available,
and a replacement icon at bottom right if any replacement is available.

In hidden mode no icons are shown and if the user clicks on a letter with no options
to delete or replace, then an empty menu will appear.

In visible mode, the "+" insertion icons are shown in the positions where insertion is available.

In hidden mode the "+" insertion icons are shown at all possible insertion positions. If the
user clicks on a position with no insertions available then an empty menu will appear.

Visible mode is used in the Changer page.

Hidden mode is used in the Make page (where the user sees the current word and hears the new word,
and they have to decide what change to make to "make" the new word).

