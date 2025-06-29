# Development

## Deployment Commands

* Run npm command `lint:fix-whitespace` to fix all the missing eolns
* Use the `/kill` URL to kill the webpack server


## Code Formatting Standards

* ALWAYS end files with exactly one newline character
* NEVER include trailing whitespace on any line
* When writing code, ensure proper line ending formatting from the start
* Before considering code complete, verify no trailing spaces exist

### React Props
* make all 'Props' interfaces one-liners, unless the line gets tooo long
* A 'Props' interface for props for a particular view function should appear immediately before the function.

This is because a Props interface is really just part of the view function's parameter declarations.


## Git commits

When I request a change, first make sure that the git status is clean with no unstaged or
uncommitted files. If it's not clean, then stop and tell me that I need to fix that first.

One exception to this is: if the only change is in file "version.txt", then it's OK to 
include that in any other commit.

After making a change, commit your change to the local repo (on whatever the current branch is)
with a commit message starting with "claude: " and describing the change made.

Do not push to any remote repository.
