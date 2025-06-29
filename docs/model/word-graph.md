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

