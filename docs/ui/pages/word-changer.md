# Word Changer Page

The short label for the Word Changer page is "Changer".

The page consists of:

* A controls panel:
   * "Undo" button, enabled if there is an item in the history earlier than the current word
   * "Redo" button, enabled if there is an item in the history later than the current word
   * "Say" button, which if clicked makes the app say the current word.
   * "Say immediately" checkbox, enabled by default. If enabled then when the word is changed
     the new word is pronounced immediately.
* Word Changer control in visible mode, as documented at [../common/word-changer.md]
  When a new word is selected, it is updated in place.
* History, consisting of a list of words, with the current active word highlighted with a light blue background.

## History

The word history behaves as follows:

* If a new word is chosen using the Word Changer control, then any words in the history after
  the current active word are deleted from the history, and the new word is added to the end
  of the history and it becomes the current active word.
* If Undo is clicked, the word in the history before the current active word becomes the active word.
* If Redo is clicked, the word in the history after the current active word becomes the active word.

When the Word Changer page is reset via the Reset page, history is reset to one item consisting
of the new current word.

