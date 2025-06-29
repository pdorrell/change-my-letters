# Word MP3s

The application pronounces words by playing an MP3 file. Words fall into two 
main groups -

* The main word list consisting of the set of words which the activities use
  as words to display and/or pronounce for the user to learn the patterns
  of spelling and pronunciation in English.
* Sets of "emotional" words, currently consisting of two sub-groups:
  * "happy" words, to indicate that the user succeeded in something
  * "sad" words, indicating the the user failed in some way
  
The word MP3 files are currently maintained in a separate "deploy" git repository,
but this is checked in the "deploy" sub-directory of the working repo for this
application.

In both local dev (using webpack) and in the deployed application, URLs starting with '/assets'
are mapped to the 'deploy/assets' sub-directory, and words are currently contained
in the 'deploy/assets/words/amazon_polly' directory. This directory has three sub-directories:

* `words` - the main word list
* `happy` - the happy words
* `sad` - the sad words

As suggested by the name, the current set of word MP3s was generated using the Amazon Polly
service, but this is not an essential or fixed feature of the application, and a set of 
recorded MP3s could potentially be used instead.

In some cases the application can preload words that are likely to be pronounced next
given the current activity (the MP3 files are not that large, and preloading makes
the pronunciation more immediate if a given word happens to be pre-loaded).
