Currently PronunciationInteraction.maxNumWordsToShow is reset to 20 if filter values are changed.

Change this logic to instead do the following:

* Define an attribute PronunciationInteraction.defaultMaxNumWordsToShow=20.
* Initialise maxNumWordsToShow to that value.
* When in activity mode:
   * The ellipsis button continues to double the current maxNumWordsToShow.
   * Don't automatically reset maxNumWordsToShow when filter options are changed
   * Display a button  with a reset icon & ellipsis just to the left of the keyboard shortcut instructions.
     The tooltip says "Reset maximum number of words to show to {defaultMaxNumWordsToShow}"
   * If maxNumWordsToShow != defaultMaxNumWordsToShow, the button is enabled, and pressing the button
     resets maxNumWordsToShow to defaultMaxNumWordsToShow

The result is that the user can increase the maximum for example to 40, and continue to see up to 40
words as they change filter values. But they can still manually reset back to the default of 20.
