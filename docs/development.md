# Development

## Source layout

The source layout is mostly a standard npm-based development layout.

* `src` - main source code
  * `src/scripts` - scripts used to analyse and generate graphs
  * `src/data/wordlists` - word list and word graph JSON files for the actual main words list.
    These files are copied into dist by the build command. (In general, to save tokens & context, 
    do not read these files and instead look in the `examples` directories to see smaller examples of the same files.)
  * `src/data/local_dev` - saved review-pronunciation state files that are only loaded
    when the application runs in the local dev environment.
    
* `tests` - test code
* `scripts` - ad hoc scripts
* `examples` - sample word list and word graph files.

* standard git-ignored directories:
   * `build`, `dist`, `node_modules`
   
The `deploy` directory is gitignored and is itself maintained as a 
separate git repository. In contains two sets of files:

* The contents of `dist` that are refreshed into the `deploy` directory
  when the `deploy` command is run.
* The `assets` sub-directory containing 'asset' files that are maintained separately
  (containing the word MP3s and some alternative MP3s not actually used currently).

The `deploy` directory is the git repository from which the final application
is deployed as a static website (to Cloudfare currently).
  

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
