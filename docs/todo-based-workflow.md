# TODO-based workflow

The todo-based workflow defines items to work on based on "TODO" comments in the docs or in the actual source code.

There are two types of todo - informal & formal.

Informal todos are marked by the word "TODO", usually in parentheses followed by space. An informal todo marks
an observation that there is something that probably could be done to improve the application or fix a problem.
However informal todos should not be acted on - instead Claude should wait for an informal todo to be formalised.

A formal todo is marked by its id which consists of the word todo with a numerical suffix, for example, TODO1234.

Within the docs directory a formal todo will be a separate paragraph starting with the todo id.

For example:

````
TODO1234 - make some change here because something is broken.
````

In code it will be defined by a comment starting with the todo id, eg:

````
x = y; // TODO34 x should be derived separately from user input
````

A single todo might have multiple todo paragraphs and comments all marked with the same ID.

When a todo is being worked on, it may go through several stages, and its ID (in all locations it occurs)
will be updated accordingly:

* Analysis - Claude may be requested to analyse the todo (if it's sufficiently complex that such analysis
  is warranted). Claude should just respond directly in it's terminal output unless otherwise instructed
  (ie by default don't update the todo texts).
* Start work - Claude will update the todo to be DOING, eg DOING1234, and will make required changes.
* Once the todo is judged to be done, Claude will be instructed to update the todo to DONE, eg DONE1234.
* Finally Claude will be instructed to update the current docs, to reflect the change, and delete 
  the DONE texts for that id.
  
Claude should commit each time it makes any changes to files (ie for all items in the previous list 
except for analysis).
  
In some cases I may perform some of these workflow steps myself.
  
When instructed to do a specific todo, Claude should only work on that todo. This allows for the possibility
that multiple Claudes could work on separate todos in separate local repos in parallel.
  
## New unimplemented features

In some cases I will add a self-contained section to docs describing a not-yet implemented feature. 
This will be marked by a suffix TODO on the heading of the section describing the feature.

Similar to other todos, Claude should not proceed to implement the feature until the todo is formalised
by adding a numerical id suffix and Claude is instructed to implement it.
