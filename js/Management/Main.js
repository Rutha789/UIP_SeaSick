////////////////////////////////////////////////////////////////////////////////
// Management/Main.js
//
// The glue code for preparing the model and controller for the management page.
//
// Author: Love Waern
////////////////////////////////////////////////////////////////////////////////
"use strict";

// A simple collection of the model and controller
function Instance() {
    this.model = new ManagementModel(this);
    this.controller = new ManagementController(this);
}

// Global variable to be accessed if you need to
// access the model or controller.
var instance = new Instance();

instance.model.initialize();
instance.controller.initialize();
