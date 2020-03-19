// UndoManager.js
//
// The module for the UndoManager and Command classes.
// This serves as the implementation of the undo manager.
//
// UndoManager objects serve as undo managers, and Command objects
// represent commands that may be performed, undone, and redone by
// an UndoManager.
//
// Author: Love Waern

"use strict";

////////////////////////////////////////////////////////////////////////////////
// UndoManager CLASS
////////////////////////////////////////////////////////////////////////////////

// An undo manager, where commands are represented using the Command class
function UndoManager () {
    // The list of performed or redone commands.
    // Elements of the list are [command,argument]-tuples,
    // where "argument" was the result of the command's perform()/redo(),
    // and will be provided to the command's undo() when executed.
    this.undoList  = [];

    // The list of undone commands.
    // Elements of the list are [command,argument]-tuples,
    // where "argument" was the result of the command's undo(),
    // and will be provided to the command's redo() when executed.
    this.redoList  = [];

    // A list of functions to that should be called whenever the UndoManager is
    // modified (i.e. the undoList or redoList changed).
    this.callbacks = [];
}

////////////////////////////////////////////////////////////////////////////////
// Command CLASS AND BASIC MACHINERY
////////////////////////////////////////////////////////////////////////////////

// A Command is what can be used and stored by the UndoManager.
// It consists of three actions: perform(), undo(), and redo().
//
// Each of these must either return nothing, or a map
// '{success: ..., result: ...}', where 'success' is a boolean,
// and indicates whether the action succeeded, and 'result' is anything,
// and may be omitted.
//
// Any action that returns nothing will be converted such that it returns
// '{success: true}' instead.
//
// If the returned 'success' of any action is false,
// that action is considered to have failed.
//
// The 'result' of perform() or redo() (if not omitted) is provided as an
// argument to undo(), and the 'result' of undo() (if not omitted)
// is provided to redo().
//
// You may choose not to provide redo().
// If so, the redo() action will the same as perform().
function Command(perform, undo, redo) {
    if (typeof redo === "undefined") {
        redo = perform;
    }
    this.perform = function () {
        return convertCommandReturn("perform", this, perform());
    };
    this.undo = function (arg) {
        return convertCommandReturn("undo", this, undo(arg));
    };
    this.redo = function (arg) {
        return convertCommandReturn("redo", this, redo(arg));
    };
}

// Internal function to validate the result of the actions provided to the
// Command constructor, and convert them if neccesary.
function convertCommandReturn (name, command, result) {
    if (typeof result === 'undefined') {
        return {success: true, result: undefined};
    } else if (typeof result.success !== "boolean") {
        console.error(
            "UndoManager." + name + ": Invalid return value of Command." + name
        );
        console.error("Return value was:", result);
        console.error("Command is:", command);
        return undefined;
    } else {
        return result;
    }
};

////////////////////////////////////////////////////////////////////////////////
// UndoManager METHODS
////////////////////////////////////////////////////////////////////////////////

// Returns true if there's any command to undo.
UndoManager.prototype.undoAvailable = function () {
    return this.undoList.length > 0;
};

// Returns true if there's any command to redo.
UndoManager.prototype.redoAvailable = function () {
    return this.redoList.length > 0;
};

// Executes perform() of an command and, if successful,
// adds the command to the undo list and erases the redo list.
//
// If perform() fails neither the
// undo list nor the redo list is modified.
UndoManager.prototype.perform = function (command) {
    const result = command.perform();
    if (result.success) {
        const commandTuple = [command, result.result];
        this.undoList.push(commandTuple);
        this.redoList = [];
        this.invokeCallbacks();
    }
    return result;
};

// Undos the most recently performed/redone command
// and moves it to the redo list.
// 
// Returns 'undefined' if there is no command to undo.
// Otherwise returns whatever undo() of the command returns.
//
// If the command's undo() fails, then the command is removed from the
// UndoManager, and a warning will be printed to the console
// (as undone commands should never fail).
UndoManager.prototype.undo = function () {
    const tuple = this.undoList.pop();
    if (typeof tuple === 'undefined') {
        return undefined;
    }
    const command = tuple[0];
    const arg = tuple[1];
    const result = command.undo(arg);
    if (result.success) {
        this.redoList.push([command,result.result]);
    } else {
        console.warn(
            "Undo of command failed! Command is: ", command,
            "Arg is: ", arg
        );
    }
    this.invokeCallbacks();
    return result;
};

// Redos the most recently undone command and moves it to the undo list.
//
// Returns 'undefined' if there is no command to redo.
// Otherwise returns whatever 'redo' of the command returns.
//
// If command's redo() fails, then the command is removed from the UndoManager,
// and a warning is printed to the console (as redone commands should
// never fail).
UndoManager.prototype.redo = function () {
    let tuple = this.redoList.pop();
    if (typeof tuple === 'undefined') {
        return undefined;
    }
    const command = tuple[0];
    const arg = tuple[1];
    const result = command.redo(arg);
    if (result.success) {
        this.undoList.push([command,result.result]);
    } else {
        console.warn(
            "Redo of command failed! Command is: ", command,
            "Arg is: ", arg
        );
    }
    this.invokeCallbacks();
    return result;
};

// Registers a function (callback) to be called whenever the undo/redo lists
// are modified.
//
// This is useful for attaching functions for updating the view
// as commands or undone or redone.
UndoManager.prototype.registerCallback = function (callback) {
    this.callbacks.push(callback);
};

////////////////////////////////////////////////////////////////////////////////
// Command METHODS
////////////////////////////////////////////////////////////////////////////////

// 'command1.augment(command2)' returns a new command which is the composition
// of command1 and command2. Each action of the new command
// will execute the corresponding action of command1, and then,
// if that succeeds, executes the corresponding action of command2.
//
// Useful for stacking model commands with commands for updating the view.
Command.prototype.augment = function (command) {
    return new Command(
        function () {
            let res1 = this.perform();
            if (res1.success) {
                let res2 = command.perform();
                return {
                    success: res2.success,
                    result: {res1: res1.result, res2: res2.result}
                };
            } else {
                return {success: false, result: {res1: res1.result}};
            }
        }.bind(this),
        function (performRes) {
            let res1 = this.undo(performRes.res1);
            if (res1.success) {
                let res2 = command.undo(performRes.res2);
                return {
                    success: res2.success,
                    result: {res1: res1.result, res2: res2.result}
                };
            } else {
                return {success: false, result: {res1: res1.result}};
            }
        }.bind(this),
        function (undoRes) {
            let res1 = this.redo(undoRes.res1);
            if (res1.success) {
                let res2 = command.redo(undoRes.res2);
                return {
                    success: res2.success,
                    result: {res1: res1.result, res2: res2.result}
                };
            } else {
                return {success: false, result: {res1: res1.result}};
            }
        }.bind(this)
    );
};

// Returns a new command based off the current one, only that
// it never fails. If it ever were to fail, it will instead do nothing,
// and report success.
Command.prototype.unfailing = function () {
    return new Command(
        function () {
            const performRes = this.perform();
            return { success: true, result: performRes};
        }.bind(this),
        function (performRes) {
            if (performRes.success) {
                const undoRes = this.undo(performRes.result);
                return { success: true, result: undoRes};
            } else {
                return {success: true, result: performRes};
            }
        }.bind(this),
        function (undoRes) {
            if (undoRes.success) {
                const redoRes = this.redo(undoRes.result);
                return {success: true, result: redoRes};
            } else {
                return {success: true, result: undoRes};
            }
        }.bind(this)
    );
};


// Often, the behaviour of perform() of commands depend on when
// the command was created, not when perform() is called.
// Because of this, you sometimes want to delay creating a command
// until its perform() is needed. This function fulfills that niche: it takes
// a function that creates a command, and returns a command that, once perform()
// is called, uses the provided function to create a command and replaces itself
// with that command.
Command.delayCreation = function (createCommand) {
    return new Command(
        function () {
            const command = createCommand();
            const ret = command.perform();
            return {
                success: ret.success,
                result: {
                    command: command,
                    result: ret.result
                }
            };
        }.bind(this),
        function (commRes) {
            const ret = commRes.command.undo(commRes.result);
            return {
                success: ret.success,
                result: {
                    command: commRes.command,
                    result: ret.result
                }
            };
        }.bind(this),
        function (commRes) {
            const ret = commRes.command.redo(commRes.result);
            return {
                success: ret.success,
                result: {
                    command: commRes.command,
                    result: ret.result
                }
            };
        }.bind(this),
    );
};


////////////////////////////////////////////////////////////////////////////////
// INTERNAL METHODS
////////////////////////////////////////////////////////////////////////////////

// Invoke all callbacks registered to the UndoManager
UndoManager.prototype.invokeCallbacks = function () {
    this.callbacks.forEach(
        (callback,index,callbacks) => callback(index,callbacks)
    );
};
