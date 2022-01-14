"use strict";

const Signal = function (attr) {
  this.attr = attr;
};

Signal.prototype.subscribe = async function () {
  try {
    this.api = await RWS.IO.getSignal(this.attr.Name);
    const cbOnChange = async function (newValue) {
      // first time this is called, newValue is undefined.
      if (newValue == undefined) {
        newValue = await this.api.getValue();
      }
    };
    this.api.addCallbackOnChanged(cbOnChange.bind(this));
    await this.api.subscribe(true);
  } catch (e) {
    FPComponents.Popup_A.message(e.message, [
      e.message,
      `Couldn't find I/O with name ${this.attr.Name}`,
    ]);
  }
};

Object.defineProperty(Signal.prototype, "name", {
  get() {
    return this.attr.Name;
  },
  set(value) {
    const attr = this.attr;
    attr.Name = value;
    this._setNewAttr(attr);
  },
});

Object.defineProperty(Signal.prototype, "type", {
  get() {
    return this.attr.SignalType;
  },
  set(value) {
    const attr = this.attr;
    attr.SignalType = value;
    this._setNewAttr(attr);
  },
});

Object.defineProperty(Signal.prototype, "device", {
  get() {
    return this.attr.Device;
  },
  set(value) {
    var attr = [];
    attr["Category"] = "TEST";
    attr["Access"] = "All";
    attr["Device"] = value;
    attr["DeviceMap"] = this.attr.DeviceMap;
    attr["SignalType"] = this.attr.SignalType;
    this._setNewAttr(attr);
  },
});

Object.defineProperty(Signal.prototype, "map", {
  get() {
    return this.attr.DeviceMap;
  },
  set(value) {
    var attr = [];
    attr["Category"] = "TEST";
    attr["Access"] = "All";
    attr["Device"] = this.attr.Device;
    attr["DeviceMap"] = "" + value;
    attr["SignalType"] = this.attr.SignalType;

    this._setNewAttr(attr);
  },
});

Object.defineProperty(Signal.prototype, "value", {
  get() {
    return (async () => {
      return this._getValue();
    })();
  },
  set(value) {
    this._setValue(value);
  },
});

Signal.prototype._setNewAttr = async function (attr) {
  try {
    console.log(this.attr.Name);
    console.log(attr);
    const success = await RWS.CFG.updateAttributesByName(
      "EIO",
      "EIO_SIGNAL",
      this.attr.Name,
      attr
    );
    if (!success) return;
  } catch (err) {
    console.error(err);
  }
};

Signal.prototype.addCallbackOnChanged = function (callback) {
  this.api.addCallbackOnChanged(callback);
  this._callback = callback;
};

Signal.prototype.forceCallback = async function () {
  const value = await this.value;
  console.log(value);
  this._callback(value);
};

Signal.prototype.handlerChangeValue = async function (value) {
  try {
    await this._signal._setValue(value);
  } catch (e) {
    console.error(e);
    FPComponents.Popup_A.message(e.message, [
      e.httpStatus.code,
      e.controllerStatus.name,
      e.controllerStatus.description,
    ]);
  }
};

Signal.prototype._setValue = async function (value) {
  try {
    this.api && (await this.api.setValue(value));
  } catch (err) {
    console.error(err);
  }
};

Signal.prototype._getValue = async function () {
  try {
    return this.api && (await this.api.getValue());
  } catch (err) {
    console.error(err);
  }
};

Signal.create = async function (signal_name, subscribe = true) {
  let signal;
  try {
    const instance = await RWS.CFG.getInstanceByName(
      "EIO",
      "EIO_SIGNAL",
      signal_name
    );
    if (!instance) throw `${signal_name} NOT found in controller...`;
    const attr = instance.getAttributes();
    signal = new Signal(attr);

    if (!subscribe) return signal;
    await signal.subscribe();

    // if (instance) {
    //   const attr = instance.getAttributes();
    //   signal = new Signal(attr);
    //   await signal.subscribe();
    // } else {
    //   console.log(`${signal_name} NOT found in controller...`);
    //   signal = undefined;
    // }

    return signal;
  } catch (e) {
    console.error(e);
    FPComponents.Popup_A.message(`Signal.create() -- Exception occurs:`, [
      e.message,
      `Code: ${e.controllerStatus.code}`,
      e.controllerStatus.description,
    ]);
    return undefined;
  }
};
