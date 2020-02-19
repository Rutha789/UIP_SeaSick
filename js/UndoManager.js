function UndoManager () {
    this.undoList = [];
    this.redoList = [];
}

// An Action is what can be stored by the UndoManager. It consists of three functions:
// 'perform', 'undo', 'redo'.
// 'perform', 'undo', 'redo' should all return 'undefined' or an object '{success: ..., result: ...}'', where 'success' is a boolean, and 'result' is anything.
// The 'result' of 'perform' or 'redo' is provided to 'undo',
// and the 'result' of 'undo' is provided to 'redo'.
function Action(perform, undo, redo) {
    this.perform = perform;
    this.undo = undo;
    this.redo = redo;
}

// Returns true if there's any action to undo.
UndoManager.prototype.undoAvailable = function () {
    return this.undoList.length > 0;
};

// Returns true if there's any action to redo.
UndoManager.prototype.redoAvailable = function () {
    return this.undoList.length > 0;
};

function convertActionReturn (name, action, result) {
    if (typeof result === 'undefined') {
        return {success: true, result: undefined};
    } else if (!("result" in result
                 && typeof result.success === "boolean")) {
        console.error("UndoManager." + name + ": Invalid return value of Action.perform");
        console.error("Return value was:", result);
        console.error("Action is:", action);
        return undefined;
    } else {
        return result;
    }
};

// Executes an action and, if successful, adds it to the undo list and erases the redo list.
// If "perform" of action returns undefined, then this returns
// '{success: true, result: undefined}'. Otherwise
// this returns whatever 'perform' of action returns.
// If 'perform' fails (success == false) neither the undo list nor the redo list is modified.
UndoManager.prototype.perform = function (action) {
    const result = convertActionReturn("perform", action, action.perform());
    if (result.success) {
        const actionTuple = [action, result.result];
        this.undoList.push(actionTuple);
        this.redoList = [];
    }
    return result;
};

// Undos the most recent action and puts it in the redo-list.
// Returns "undefined" if there is no action to undo.
// Otherwise returns whatever 'undo' of the action returns.
// If 'undo' fails (success == false) then the redo list is not modified.
UndoManager.prototype.undo = function () {
    const tuple = this.undoList.pop();
    if (typeof tuple === 'undefined') {
        return undefined;
    }
    const action = tuple[0];
    const arg = tuple[1];
    const result = convertActionReturn("undo", action, action.undo(arg));
    if (result.success) {
        this.redoList.push([action,result.result]);
    }
    return result;
};

// Redos the most recent undone action and puts it in the undo list.
// Returns "undefined" if there is no action to redo.
// Otherwise returns whatever 'redo' of the action returns.
// If 'redo' fails (success == false) then the undo list is not modified.
UndoManager.prototype.redo = function () {
    let tuple = this.redoList.pop();
    if (typeof tuple === 'undefined') {
        return undefined;
    }
    const action = tuple[0];
    const arg = tuple[1];
    const result = convertActionReturn("redo", action, action.redo(arg));
    if (result.success) {
        this.undoList.push([action,result.result]);
    }
    return result;
};
