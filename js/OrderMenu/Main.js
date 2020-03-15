'use strict';

function Instance() {
    this.model = new OrderModel(this);
    this.controller = new OrderController(this);
}

var instance = new Instance();

instance.model.initialize();
instance.controller.initialize();
