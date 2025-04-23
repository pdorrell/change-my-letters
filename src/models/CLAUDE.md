A word list is a list of words that can be the current word
in the application.

From the word list the application must compute a graph where
the vertices are the words and the edges are the one letter changes
to change one word into another.


The Graph JSON file is not the most optimal internal representation, but 
it is close enough that the optimal representation can easily be
generated from it.

## Graph Format

The graph format is defined as follows:

* Each word in the word list is a key in the dict, and the corresponding
  value is a dict with the following keys and values:
    * `delete` - a string the same length as the word, where all the deletable
      letters are shown, and other letters are replaced with "."
    * `replace` - an array the same length as the word, where each string
      is the set of letter values that can replace the letter in that position
      in the word
    * `insert` - an array one longer then the word, corresponding to the positions
      before, between and after the letters, where each string is the set of letter
      values that can be inserted in that position.
    * `uppercase` - a string the same length as the word, where all the upper-caseable
      letters are shown as upper-cased, and other letters are replaced with "."
    * `lowercase` - a string the same length as the word, where all the lower-caseable
      letters are shown as lower-cased, and other letters are replaced with "."


# Implementation of Efficient Algorithm to Precompute the Graph

It should be possible to compute the graph in a time proportional to (length of 
word list) times (average word length).

Outline of Algorithm:

* Create a Set of all the words (ie actual Typescript Set).
* For each word, and for each operation type:
    * `delete` - for each word computer all possible deletions, and then for each deletion,
       determine which of those are words in the Words set.
    * `insert` - at the same time as all "delete" edges are found, also populate the "insert"
      edges where the insert is the reverse of the delete.
    * `replace` -
        * For each word and each letter position, derive the "dotted word" with that position
          replaced by ".", and accumlate those values into a dict which maps every 
          dotted word to the list of words that it derives from.
        * Then for each dotted word, there will be replace operations going both ways 
          between each pair of distinct words that it derives from.
    * `uppercase` and `lowercase` - 
        * iterate through all the words, and for those with upper
          case letters, accumulate a dict from the lowercased word to the list of corresponding upper-cased
          words.
        * For each key in the dict, if the lowercased key is in the Words set, then there will be 
          corresponding uppercase & lowercase operations linking the lowercased key and the corresponding
          uppercased word (or words). Note that even if multiple upper-cased words exist for a lowercase word,
          like "Ben" and "beN", there won't be any single operation going between those two.
