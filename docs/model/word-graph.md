# Word Graph

The main words list defines a `Word Graph` where the graph is defined as follows:

* Each word is a node
* Two words are connected by an edge if they are separated by a single letter change
  which is one of:
  * A replacement
  * A deletion
  * An insertion
  
Every replacement has a corresponding opposite replacement, and every insertion
corresponds to an opposite deletion, and vice versa.

So the graph edges can also be considered as undirected.

The main word list consists of a list of (currently) 1359 words chosen as follows:

* Each word is a common word that a child learning to read might be expected to know
* Each word connects to at least one other word in the graph (so no isolated nodes)
* The graph is fully connected (this is not absolutely essential, but it is currently the case)
* The maximum length of any word is 5 letters.

Some of the activities do not particularly depend on the words being in a graph, so in
principle the word list could be extended to include sets of isolated words (or separate sub-graphs)
that could be used in those activities.

## Graph JSON Format

The graph format is defined as follows:

* Each word in the word list is a key in the dict, and the corresponding
  value is a dict with the following keys and values:
    * `delete` - a string the same length as the word, where all the deletable
      letters are shown, and other letters are replaced with "."
    * `replace` - a slash-separated string of sub-strings, which represents
       an array of strings the same length as the word, where each string
      is the set of letter values that can replace the letter in that position
      in the word
    * `insert` - a slash-separated string of sub-strings, which represents
      an array of strings than the word, corresponding to the positions
      before, between and after the letters, where each string is the set of letter
      values that can be inserted in that position.
    * `uppercase` - a string the same length as the word, where all the upper-caseable
      letters are shown as upper-cased, and other letters are replaced with "."
    * `lowercase` - a string the same length as the word, where all the lower-caseable
      letters are shown as lower-cased, and other letters are replaced with "."

