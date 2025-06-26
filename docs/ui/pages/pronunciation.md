# Pronunciation Page

The pronunciation page has two modes:

* Activity mode (the default), where the user can explore the relationship between the pronunciations
  of words that start with, end with or contain a specified substring (ie the filter text).
* Review mode, where the developer can systematically review the quality of pronunciation
  of the words
  
In review mode, the page consists of:

* Controls:
   * Filter controls as described in [../common/filter.md].
   * An Auto button, which causes the filtered words to be pronounced automatically in sequence.
   * The "Review mode" checkbox (unchecked), to switch to review mode
* Mini-header panel:
   * Word count showing how many words are selected by the filter
   * An explanation of keyboard shortcuts
* The word list showing the list of filtered words. By default at most the first 20 words are shown,
  with an ellipsis button shown if there are more words to show. Clicking on the ellipsis button
  doubles the maximum number of words to show. The maximum is reset back to 20 if any change is made
  to the filtering control. (TODO - don't do the reset ??)

In review mode more controls are shown (and typically a developer would use this mode on a larger screen).

