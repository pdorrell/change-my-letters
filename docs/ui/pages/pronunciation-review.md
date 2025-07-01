# Pronunciation Review Page

The Review sub-page provides more controls (and is typically used by developers on larger screens)
for systematically reviewing the quality of pronunciation of words.

Review mode allows the user to save or load review state from a JSON file. Also the user can download a list
of "wrong" words in the format of one word per line in a text file.

For each word the review state consists of:

* Reviewed or unreviewed
* OK, wrong or not yet decided.

## Review State Controls

* "+ Load State" button to load a previously saved review state JSON file - press the button, or,
  drag a file and drop it on the button.
* "Save State" button - save current review state to a file (in local dev, if the user saves the file
  to `src/data/local_dev/review-pronunciation-state.json` then webpack hotloading will reload
  the application with that initial review state).
* "Download Wrong Words" button
* "Reset All to Unreviewed" - set all words to be un-reviewed in the application
* "Reset All to OK" - set all words to be OK
* "Review Wrong Words" - set only the "wrong" words to be un-reviewed

## Filter Controls

* Filter controls as described in [../common/filter.md].
* "Review state" - to filter the words based on their review state, with options:
   * All
   * Un-reviewed
   * Wrong
   * Un-reviewed or Wrong

## Review Controls

* Current word display - displays word being reviewed in large bold white text on blue background
* "Sounds Wrong" - mark current word as wrong
* "Sounds OK" - mark current word as OK
* "Auto" button, which causes the filtered words to be pronounced automatically in sequence.
* Select for delay between words in Auto mode, with options 100ms, 200ms, 300ms, 400ms & 500ms

## Mini-header Panel

* Word count showing how many words are selected by the filter
* An explanation of keyboard shortcuts

## Word List

The word list shows the list of filtered words. Words are styled according to:
* Review state (wrong words appear in red, OK words appear in green)
* Which word is the current word (highlighted)

## Keyboard Shortcuts

* Left & right arrows to go to previous or next word
* Alt-right to start autoplay
* Space bar to toggle sounds wrong for the current word
* Escape to stop autoplay

In auto mode, any mouse or keyboard interaction stops the auto. (In auto mode a user might hit
space bar to mark a word as wrong, but if they are too slow they'll mark the wrong word, so they
will have to go back and adjust the review state of both words manually.)