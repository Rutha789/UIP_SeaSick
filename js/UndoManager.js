
// A Command is what can be stored by the UndoManager. It consists of three functions:
// 'perform', 'undo', 'redo'.
// 'perform', 'undo', 'redo' should each return 'undefined' or an object '{success: ..., result: ...}'', where 'success' is a boolean, and 'result' is anything.
// The 'result' of 'perform' or 'redo' is provided to 'undo',
// and the 'result' of 'undo' is provided to 'redo'.
//
// You may choose not to provide "redo". If so, the "redo" action will the same as "perform".
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

function convertCommandReturn (name, command, result) {
    if (typeof result === 'undefined') {
        return {success: true, result: undefined};
    } else if (!(typeof result.success === "boolean")) {
        console.error("UndoManager." + name + ": Invalid return value of Command.perform");
        console.error("Return value was:", result);
        console.error("Command is:", command);
        return undefined;
    } else {
        return result;
    }
};

// Creates a new command where "this" and the argument are combined,
// such that each action first performs the corresponding action of "this",
// and then that of the argument.
//
// Useful for stacking model commands with view animations
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
                return res1;
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
                return res1;
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
                return res1;
            }
        }.bind(this)
    );
};

function UndoManager () {
    this.callbacks = [];
    this.undoList  = [];
    this.redoList  = [];
}

// Returns true if there's any command to undo.
UndoManager.prototype.undoAvailable = function () {
    return this.undoList.length > 0;
};

// Returns true if there's any command to redo.
UndoManager.prototype.redoAvailable = function () {
    return this.redoList.length > 0;
};


// Executes an command and, if successful, adds it to the undo list and erases the redo list.
// If "perform" of command returns undefined, then this returns
// '{success: true, result: undefined}'. Otherwise
// this returns whatever 'perform' of command returns.
// If 'perform' fails (success == false) neither the undo list nor the redo list is modified.
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
    const result = command.undo(arg);
    if (result.success) {
        this.redoList.push([command,result.result]);
    }
    this.invokeCallbacks();
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
    const result = command.redo(arg);
    if (result.success) {
        this.undoList.push([command,result.result]);
    }
    this.invokeCallbacks();
    return result;
};

UndoManager.prototype.invokeCallbacks = function () {
    this.callbacks.forEach((callback,ix,arr) => callback(ix,arr));
};

UndoManager.prototype.registerCallback = function (callback) {
    this.callbacks.push(callback);
};
