"use strict";

const Signal = function (attr) {
  this.attr = attr;
  this.attr.DeviceMap === undefined
    ? (this.found = false)
    : (this.found = true);
};

Signal.prototype.checkSignalConfig = async function () {
  try {
    const instance = await RWS.CFG.getInstanceByName(
      "EIO",
      "EIO_SIGNAL",
      this.attr.Name
    );
    return instance;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

Signal.prototype.configSignal = async function (device = "", map = "") {
  const attr = [];
  attr["Device"] = device + "";
  attr["DeviceMap"] = map + "";
  attr["SignalType"] = this.attr.SignalType;
  attr["Access"] = "All";
  device === "" && map === "" ? (attr["Category"] = "VIRTUAL") : "ECOSYSTEM";
  // attr['Access'] = 'All';

  // this.attr['Device'] = device + '';
  // this.attr['DeviceMap'] = map + '';
  // device === '' && map === ''
  //   ? (this.attr['Category'] = 'VIRTUAL')
  //   : 'ECOSYSTEM';
  // this.attr['Access'] = 'All';

  try {
    const instance = await this.checkSignalConfig();

    instance &&
      console.log(`Instance found for ${this.attr.Name} in config database...`);
  } catch (e) {
    console.error(e);
    console.log(`Creating instance for ${this.attr.Name}...`);
    await RWS.CFG.createInstance("EIO", "EIO_SIGNAL", this.attr.Name);
  }

  this._setNewAttr(attr);
  // this._setNewAttr(this.attr);
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
    this.failed = await this.api.subscribe(true);

    if (this.failed) console.log(this.failed);
  } catch (e) {
    console.error(e);

    // FPComponents.Popup_A.message(e.message, [
    //   e.message,
    //   `Couldn't find I/O with name ${this.attr.Name}`,
    // ]);
  }
};

Signal.prototype._setNewAttr = async function (attr) {
  try {
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

Object.defineProperty(Signal.prototype, "name", {
  get() {
    return this.attr.Name;
  },
  // set(value) {
  //   const attr = this.attr;
  //   attr.Name = value;
  //   this._setNewAttr(attr);
  // },
});

Object.defineProperty(Signal.prototype, "type", {
  get() {
    return this.attr.SignalType;
  },
  // set(value) {
  //   const attr = this.attr;
  //   attr.SignalType = value;
  //   this._setNewAttr(attr);
  // },
});

Object.defineProperty(Signal.prototype, "device", {
  get() {
    return this.attr.Device;
  },
  // set(value) {
  //   var attr = [];
  //   attr['Device'] = value;
  //   this._setNewAttr(attr);
  // },
});

Object.defineProperty(Signal.prototype, "map", {
  get() {
    return this.attr.DeviceMap;
  },
  // set(value) {
  //   var attr = [];
  //   attr['DeviceMap'] = '' + value;
  //   this._setNewAttr(attr);
  // },
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

Signal.prototype.addCallbackOnChanged = function (callback) {
  this.api.addCallbackOnChanged(callback);
  this._callback = callback;
};

Signal.prototype.forceCallback = async function () {
  if (!this.found) return;
  const value = await this._getValue();
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
    await this.api.fetch();
    return this.api && (await this.api.getValue());
  } catch (err) {
    console.error(err);
  }
};

Signal.create = async function (name, type, subscribe = true) {
  let signal;
  let cancel = false;
  let attr = [];

  try {
    const instance = await RWS.CFG.getInstanceByName("EIO", "EIO_SIGNAL", name);
    attr = instance.getAttributes();
  } catch (e) {
    console.error(e);
    attr["Name"] = name;
    attr["SignalType"] = type;
    attr["Access"] = "All";
    cancel = true;
  }

  signal = new Signal(attr);

  if (!subscribe || cancel) return signal;

  console.log(`Subscribing to ${name} signal...`);
  try {
    await signal.subscribe();
    return signal;
  } catch (e) {
    console.error(e);
    FPComponents.Popup_A.message(`Signal.create() -- Subscribe signal failed`, [
      e.message,
      `Code: ${e.controllerStatus.code}`,
      e.controllerStatus.description,
    ]);
    return undefined;
  }
};

// Signal.confirmPopUp = async function (e, question, handlerOk, handlerCancel) {
//   await FPComponents.Popup_A.confirm(e.message, question, function (action) {
//     if (action == FPComponents.Popup_A.OK) {
//       handlerOk();
//       return true;
//     } else if (action == FPComponents.Popup_A.CANCEL) {
//       handlerCancel();
//       return false;
//     }
//   });
// };

// const ok = () => {

//   signal.configSignal()
// };
// const cancel = () => {

// };
// await Signal.confirmPopUp(
//   e,
//   ['Configure signal?', 'After configurate REBOOT is required'],
//   ok,
//   cancel
// );
