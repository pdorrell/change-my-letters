# Pronunciation Page

The pronunciation page has two modes:

* Activity mode (the default), where the user can explore the relationship between the pronunciations
  of words that start with, end with or contain a specified substring (ie the filter text).
* Review mode, where the developer can systematically review the quality of pronunciation
  of the words
  
In review mode, the page consists of:

* Controls:
   * Filter controls as described in [../common/filter.md].
   * "Auto" button, which causes the filtered words to be pronounced automatically in sequence.
   * "Review mode" checkbox (unchecked), to switch to review mode
* Mini-header panel:
   * Word count showing how many words are selected by the filter
   * An explanation of keyboard shortcuts
* The word list showing the list of filtered words. By default at most the first 20 words are shown,
  with an ellipsis button shown if there are more words to show. Clicking on the ellipsis button
  doubles the maximum number of words to show. The maximum is reset back to 20 if any change is made
  to the filtering control. (TODO - don't do the reset - but then a manual reset option would be required)

In review mode more controls are shown (and typically a developer would use this mode on a larger screen).

Review mode allows the user to save or load review state from a JSON file. Also the user can download a list
of "wrong" words in the format of one word per line in a text file.

For each word the review state consists of:

* Reviewed or unreviewed
* OK, wrong or not yet decided.

* Review State controls:
   * "+ Load State" button to load a previously saved review state JSON file - press the button, or,
     drag a file and drop it on the button.
   * "Save State" button - save current review state to a file (in local dev, if the user saves the file
     to `src/data/local_dev/review-pronunciation-state.json` then webpack hotloading will reload
     the application with that initial review state).
   * "Download Wrong Words" button
   * "Reset All to Unreviewed" - set all words to be un-reviewed in the application
   * "Reset All to OK" - set all words to be OK
   * "Review Wrong Words" - set only the "wrong" words to be un-reviewed (TODO - the button could be reworded)
* Controls:
   * Filter controls as described in [../common/filter.md].
   * "Review state" - to filter the words based on their review state, with options:
      * All
      * Un-reviewed
      * Wrong
      * Un-reviewed or Wrong
   * "Review mode" checkbox (checked), to switch back to activity mode
* Review controls:
   * Current word display - displays word being reviewed in large bold white text on blue background
   * "Sounds Wrong" - mark current word as wrong
   * "Sounds OK" - mark current word as OK
   * "Auto" button, which causes the filtered words to be pronounced automatically in sequence.
   * Select for delay between words in Auto mode, with options 100ms, 200ms, 300ms, 400ms & 500ms
* Mini-header panel:
   * Word count showing how many words are selected by the filter
   * An explanation of keyboard shortcuts
* The word list showing the list of filtered words. Words are styled according to:
   * Review state
   * Which word is the current word

## Keyboard shortcuts

Keyboard shortcuts are:

* Left & right arrows to go to previous or next word
* Alt-right to start autoplay

In review mode only:

* Space bar to toggle sounds wrong

In auto mode, any mouse of keyboard interaction stops the auto. (In auto mode a user might hit
space bar to mark a word as wrong, but if they are too slow they'll mark the wrong word, so they
will have to go back and adjust the review state of both words manually.)
