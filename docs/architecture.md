# Architecture

## MobX models and React

All React views are functional components.

In general React views should have one main prop which is the corresponding MobX model.

When child MobX objects need to reference parents, there should be an explicit
reference in the child to the parent.

ReactContext should not be used to give access to the global application model.

In many cases the access to the parent that a child requires can be expressed
in an interface that is limited to what calls the child actually needs to make
to the parent.

## Testing architecture

Mocks should not be used.

In preference the application should use *test doubles*.

A test double is something that replaces an actual param, for example in
a constructor of something being tested, and the test double satisfies
the same interface as the actual parameter.

In cases where global objects need to be replaced by a test double,
the access to the global object should be wrapped in an object
that wraps the access to the global object.

Some test doubles merely record calls made to them (a bit like what
mocks often do), some may just do nothing, and others may be partial
simulations for the objects that they replace.

Tests can and should be written for test doubles.

## Prevention of Layout Jumping

A major problem with browser applications when programming the DOM is
that of *layout jumping*. Something in the UI is programmed
to appear or disappear depending on some criterion, or perhaps it
just changes appearance somehow, and this causes other elements in the UI
to jump around unnecessarily.

Layout jumping should be avoided by using style changes that do not
cause the sizes of elements to change.

For example, when a border appears and disappears, the non-existent
border should be implemented as a transparent border the same size
and thickness as the visible border.

When an object changes the number of child elements contained, and 
it is desired to prevent layout jumping, then it may be necessary
to include dummy invisible child elements the same size as actual
child elements. (Main example in the application is when a word
can contain up to 5 letters, and if it has less, then invisible 
dummy letter elements are included at the end of the word.)
