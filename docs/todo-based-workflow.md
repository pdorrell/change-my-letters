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
* Start work - Claude will make required changes, and update the todo id to be prefixed with DONE, eg DONE-TODO1234.
* Once I have reviewed and accepted them, I will tell Claude that I accept the changes, and Claude should then 
  change the todo to ACCEPTED, eg ACCEPTED-TODO1234.
* Finally Claude will be instructed to update the current docs, to reflect the change, and delete 
  the TODO texts for that id.
  
Claude should commit each time it makes any changes to files (ie for all items in the previous list 
except for analysis).
  
In some cases I may perform some of these workflow steps myself. Also sometimes I may accept the changes
but then do a followup TODO to fix issues with the changes.
  
When instructed to do a specific todo, Claude should only work on that todo. This allows for the possibility
that multiple Claudes could work on separate todos in separate local repos in parallel.
  
## New unimplemented features

In some cases I will add a self-contained section to docs describing a not-yet implemented feature. 
This will be marked by a suffix TODO on the heading of the section describing the feature.

Similar to other todos, Claude should not proceed to implement the feature until the todo is formalised
by adding a numerical id suffix and Claude is instructed to implement it.

## Separate TODO<number>.md file

If the TODO is too complex to fit comfortably in a single paragraph, then it may be placed in
a separate markdown file. This file may be referenced from another doc file or source file.
(The file will most likely be in the same directory as the TODO comment that references it.)

## Multi-step Todos

A more complex todo may have multiple steps, marked with STEP <n> labels, eg contents of TODO1234.md:

````
* STEP 1 Do the first thing
* STEP 2 Do the second thing
````

For a multi-step TODO, I may give instructions to do one step at a time, eg "Do STEP 1 of TODO1234",
and Claude would mark individual steps as DONE when finished.

This will mostly happen when I want to review the completion of one STEP before allowing Claude
to proceed with the next STEP.

On the other hand, a TODO may contain a list of items, but I might still instruct Claude to do the whole
TODO in one go.
