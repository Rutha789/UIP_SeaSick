////////////////////////////////////////////////////////////////////////////////
// OrderMenu/Main.js
//
// The glue code for preparing the model and controller for the customer page.
//
// Author: Love Waern
////////////////////////////////////////////////////////////////////////////////
"use strict";

// A simple collection of the model and controller
function Instance() {
    this.model = new OrderModel(this);
    this.controller = new OrderController(this);
}

// Global variable to be accessed if you need to
// access the model or controller.
var instance = new Instance();

instance.model.initialize();
instance.controller.initialize();
