function UndoManager () {
    this.undoList = [];
    this.redoList = [];
}

// A Command is what can be stored by the UndoManager. It consists of three functions:
// 'perform', 'undo', 'redo'.
// 'perform', 'undo', 'redo' should all return 'undefined' or an object '{success: ..., result: ...}'', where 'success' is a boolean, and 'result' is anything.
// The 'result' of 'perform' or 'redo' is provided to 'undo',
// and the 'result' of 'undo' is provided to 'redo'.
function Command(perform, undo, redo) {
    this.perform = perform;
    this.undo = undo;
    this.redo = redo;
}

// Returns true if there's any command to undo.
UndoManager.prototype.undoAvailable = function () {
    return this.undoList.length > 0;
};

// Returns true if there's any command to redo.
UndoManager.prototype.redoAvailable = function () {
    return this.undoList.length > 0;
};

function convertCommandReturn (name, command, result) {
    if (typeof result === 'undefined') {
        return {success: true, result: undefined};
    } else if (!("result" in result
                 && typeof result.success === "boolean")) {
        console.error("UndoManager." + name + ": Invalid return value of Command.perform");
        console.error("Return value was:", result);
        console.error("Command is:", command);
        return undefined;
    } else {
        return result;
    }
};

// Executes an command and, if successful, adds it to the undo list and erases the redo list.
// If "perform" of command returns undefined, then this returns
// '{success: true, result: undefined}'. Otherwise
// this returns whatever 'perform' of command returns.
// If 'perform' fails (success == false) neither the undo list nor the redo list is modified.
UndoManager.prototype.perform = function (command) {
    const result = convertCommandReturn("perform", command, command.perform());
    if (result.success) {
        const commandTuple = [command, result.result];
        this.undoList.push(commandTuple);
        this.redoList = [];
    }
    return result;
};

// Undos the most recent command and puts it in the redo-list.
// Returns "undefined" if there is no command to undo.
// Otherwise returns whatever 'undo' of the command returns.
// If 'undo' fails (success == false) then the redo list is not modified.
UndoManager.prototype.undo = function () {
    const tuple = this.undoList.pop();
    if (typeof tuple === 'undefined') {
        return undefined;
    }
    const command = tuple[0];
    const arg = tuple[1];
    const result = convertCommandReturn("undo", command, command.undo(arg));
    if (result.success) {
        this.redoList.push([command,result.result]);
    }
    return result;
};

// Redos the most recent undone command and puts it in the undo list.
// Returns "undefined" if there is no command to redo.
// Otherwise returns whatever 'redo' of the command returns.
// If 'redo' fails (success == false) then the undo list is not modified.
UndoManager.prototype.redo = function () {
    let tuple = this.redoList.pop();
    if (typeof tuple === 'undefined') {
        return undefined;
    }
    const command = tuple[0];
    const arg = tuple[1];
    const result = convertCommandReturn("redo", command, command.redo(arg));
    if (result.success) {
        this.undoList.push([command,result.result]);
    }
    return result;
};
