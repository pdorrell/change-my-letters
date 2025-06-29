# Change My Letters - Summary

*Change My Letters* is an educational application that runs in a web browser page.
The tech stack is Typescript, MobX and functional React components. It is deployed
to a static web hosting service (currently Cloudflare).

The goal of the application is to help children learn the relationship between
the sounds and spelling of individual English words. The target user of the application
is a child perhaps 4-7 years old, who is starting to learn to read English.

The application consists of various activities. Some activities allow the user to observe the 
relationship between spelling and sound, and other activities require the user to correctly 
guess what a word sounds like, or how a given word should be spelled.

The application is based on a set of 1359 common words and pre-generated pronunciations
of each word. The words form a *graph* where one word is connected to another word in the
graph if there is a single letter difference between the two words.

There are also some happy and sad words used to communicate success or failure for some
of the activities.

The application currently has six different pages:

* *Word Changer* - where the application starts with a randomly chosen word, and
  can change the word one letter at a time (by inserting, deleting or replacing one letter)
  to make a new word. Depending on a mode setting, the new word may be pronounced
  when it appears, or, the word can be pronounced when a "Say" button is pressed.
* *Pronunciation* - this had two modes. The main mode presents a UI where words can
  be filtered based on a sub-string, and the user can choose to pronounce individual words,
  or all the words automatically. There is a secondary "review" mode which is aimed at the
  developer, to help them efficiently review the quality of pronunciation of all the words.
* *Finders* - a page with 2 sub-pages:
   * *Word Choice Finder* - in this activity 10 words are chosen and displayed, and there
     is a separate list of buttons corresponding to those words in a different order. 
     Clicking on a button pronounces that word, and the user has to select the displayed word.
   * *Words in Row* - this also has ten buttons to click representing words that the user has
     to find. When a button is clicked, the word is pronounced, and a row of 10 letters is 
     displayed that contains the word. The user has to find and select the pronounced word in each case.
* *Make* - the application starts with a randomly chosen word, and there is a "New Word" button.
  When the user presses the button, the new word is pronounced, and the user has to make the
  correct one letter change to make the new word.
* *Reset* - from either *Make* or *Word Changer* page the Reset button can be clicked, which
  takes the user to a page which allows them to choose a new initial word for the page
  they came from (ie Make or Word Changer).


# Target devices

As a web application, the application is designed to run in any of -

* Computer with a mouse
* Touch-enabled tablet
* Touch-enabled smartphone (but only usable in landscape mode)

In practice it has mostly been tested on:

* On a Mac desktop running Firefox
* iPad
* iPhone
