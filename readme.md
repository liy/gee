# Compile native module: nodegit and node-pty

0. Use nvm install `node 14.16.1`
1. https://github.com/nodejs/node-gyp#on-windows Make sure Python 2.7 is installed. Visual Studio Build Tools is installed, and set msvs_version to 2017.
2. Install `electron-rebuild`
3. Add `electron-rebuild -f -w <your module>` in scripts section and run the command.

# Auto complete and Input

AutoComplete -------- selected data --------> CommandInput

CommandInput ----------- input -------------> CommandProcessor

CommandProcessor ----- first parse ---------> Command

Command ------------ ctrl + space ----------> AutoComplete Search

## Auto complete

Every command should have a template:

git <command> [--?<option> <value>?]|<value>

    command

Several contexts:

- command
- option
- value

In `command` context, search results should only returns commands that are part of current input.

In `[option] | value` context, search should return both options of the current command or references

Press `ESC` will hide suggestions.

Press `Ctrl + Space` wil show current suggestions.

### Value

Command config should specifies what type of value the command is expecting:

1. Reference, that is branch or tag
2. Hash, the commit hash.

### Search

Ctrl + Space triggers search. Search should searches commits, references and command templates. It gives list of `Candidate`s. The candidate value is returned when selected. Note that commit with reference should prefer reference instead of hash in context of certain command, e.g., git checkout

When the input is **not** started with `git`. Search is performed on both references and commit data, e.g., summary etc. When search candidate is selected, view should also select the correct entry.

### Selection

Once candidate is selected, the input section should be replaced with correct value.

When candidate is selected, different commands have different behaviours, e.g., `git commit -m <message>` should take the message of the selected commit, `git checkout <reference | hash>` should take the reference name or hash of the candidate.

---

    user input -------------> command -----------> auto complete --------------> input value
        |         onInput               update                      set value
        |
         -----------> input value

---

## Command process

user input -> input event -> debounce -> command.update event -> command process (update simulation only)

autocomplete selection event -> command.update event -> command process (update simulation only)

## Auto complete

user input -> input event -> update autocomplete candidates (update suggestions only)

keyboard event -> update autocomplete candidates (update suggestions only)

# Build protobuf type infor

```
 npx proto-loader-gen-types --longs=String --enums=String --defaults --oneofs --grpcLib=@grpc/grpc-js --outDir=src/protobuf/ protobuf/messages.proto
```
