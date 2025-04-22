# Word List and Graph

This directory contains a sample word list to be used by the application,
and an example of the JSON file generated to represent the graph where
the vertices are the words and the edges are the one letter changes
to change one word into another.

The JSON file is not the most optimal internal representation, but 
it is close enough that the optimal representation can easily be
generated from it.

These examples files are manually created, so we actually need to 
write a script to test that the example JSON file is correct.
This script will call code that also needs to be part of the application,
for example when the application is given only the raw word list,
and needs to precompute the full graph.

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

It should be possible to compute the graph in a time roughly proportional to (length of 
word list) times (average word length) time (number of letters in alphabet).

Outline of Algorithm:

* Create a Set of all the words (ie actual Typescript Set).
* For each word, and for each operation type:
    * `delete` - compute all possible deletions, and determine which ones are in the Words set.
    * `insert` - this will be the reverse of all the `delete` edges found
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
      
