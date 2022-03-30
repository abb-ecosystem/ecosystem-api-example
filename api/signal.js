'use strict'

const Signal = function (attr, newSignal = true) {
  this.attr = attr
  this.attr.DeviceMap === undefined ||
  this.attr.Device === undefined ||
  newSignal === true
    ? (this.found = false)
    : (this.found = true)
}

// Signal.prototype.checkSignalConfig = async function () {
//   try {
//     const instance = await RWS.CFG.getInstanceByName(
//       "EIO",
//       "EIO_SIGNAL",
//       this.attr.Name
//     );
//     return instance;
//   } catch (e) {
//     console.error(e);
//     throw e;
//   }
// };

Signal.checkSignalConfig = async function (name) {
  try {
    const instance = await RWS.CFG.getInstanceByName('EIO', 'EIO_SIGNAL', name)
    return instance
  } catch (e) {
    console.error(e)
    throw e
  }
}

Signal.isSignalConfig = async function (name) {
  try {
    if (Signal.checkSignalConfig(name)) return true
  } catch (e) {
    return false
  }
}

Signal.prototype.configSignal = async function (device = '', map = '') {
  const attr = []
  attr['Device'] = device + ''
  attr['DeviceMap'] = map + ''
  attr['SignalType'] = this.attr.SignalType
  attr['Access'] = 'All'
  device === '' && map === '' ? (attr['Category'] = 'VIRTUAL') : 'ECOSYSTEM'
  // attr['Access'] = 'All';

  // this.attr['Device'] = device + '';
  // this.attr['DeviceMap'] = map + '';
  // device === '' && map === ''
  //   ? (this.attr['Category'] = 'VIRTUAL')
  //   : 'ECOSYSTEM';
  // this.attr['Access'] = 'All';

  try {
    const instance = await Signal.checkSignalConfig(this.name)

    instance &&
      console.log(`Instance found for ${this.attr.Name} in config database...`)
  } catch (e) {
    console.error(e)
    console.log(`Creating instance for ${this.attr.Name}...`)
    await RWS.CFG.createInstance('EIO', 'EIO_SIGNAL', this.attr.Name)
  }

  this._setNewAttr(attr)
}

Signal.prototype.subscribe = async function () {
  try {
    this.api = await RWS.IO.getSignal(this.attr.Name)

    const cbOnChange = async function (newValue) {
      // first time this is called, newValue is undefined.
      if (newValue == undefined) {
        newValue = await this.api.getValue()
      }
    }
    this.api.addCallbackOnChanged(cbOnChange.bind(this))
    this.failed = await this.api.subscribe(true)

    if (this.failed) console.log(this.failed)
  } catch (e) {
    console.error(e)
  }
}

Signal.prototype._setNewAttr = async function (attr) {
  try {
    const success = await RWS.CFG.updateAttributesByName(
      'EIO',
      'EIO_SIGNAL',
      this.attr.Name,
      attr
    )
    if (!success) return
  } catch (err) {
    console.error(err)
  }
}

Object.defineProperty(Signal.prototype, 'name', {
  get() {
    return this.attr.Name
  },
})

Object.defineProperty(Signal.prototype, 'type', {
  get() {
    return this.attr.SignalType
  },
})

Object.defineProperty(Signal.prototype, 'device', {
  get() {
    return this.attr.Device
  },
})

Object.defineProperty(Signal.prototype, 'map', {
  get() {
    return this.attr.DeviceMap
  },
})

Object.defineProperty(Signal.prototype, 'value', {
  get() {
    return (async () => {
      return this._getValue()
    })()
  },
  set(value) {
    this._setValue(value)
  },
})

Signal.prototype.addCallbackOnChanged = function (callback) {
  this.api.addCallbackOnChanged(callback)
  this._callback = callback
}

Signal.prototype.forceCallback = async function () {
  if (!this.found) return
  const value = await this._getValue()
  this._callback(value)
}

Signal.prototype.handlerChangeValue = async function (value) {
  try {
    await this._signal._setValue(value)
  } catch (e) {
    console.error(e)
    FPComponents.Popup_A.message(e.message, [
      e.httpStatus.code,
      e.controllerStatus.name,
      e.controllerStatus.description,
    ])
  }
}

Signal.prototype._setValue = async function (value) {
  try {
    this.api && (await this.api.setValue(value))
  } catch (err) {
    console.error(err)
  }
}

Signal.prototype._getValue = async function () {
  try {
    await this.api.fetch()
    return this.api && (await this.api.getValue())
  } catch (err) {
    console.error(err)
  }
}

Signal.prototype.updateSignalAttributes = async function () {
  const attr = await Signal.getSignalAttributes(this.name)
  if (attr !== undefined) this.attr = attr
  return
}

Signal.getSignalAttributes = async function (name) {
  try {
    // Check if instance is configured
    const instance = await RWS.CFG.getInstanceByName('EIO', 'EIO_SIGNAL', name)
    return instance.getAttributes()
  } catch (e) {
    console.error(e)
    throw e
  }
}

Signal.create = async function (name, type, subscribe = true) {
  let signal
  let newSignal = false
  let attr = []

  try {
    // Check if signal is already available
    const s = await RWS.IO.getSignal(name)
  } catch (e) {
    console.error(e)
    newSignal = true
  }

  try {
    attr = await Signal.getSignalAttributes(name)
  } catch (e) {
    console.error(e)
    attr['Name'] = name
    attr['SignalType'] = type
    attr['Access'] = 'All'
  }

  signal = new Signal(attr, newSignal)

  if (!subscribe || newSignal) return signal

  console.log(`Subscribing to ${name} signal...`)
  try {
    await signal.subscribe()
    return signal
  } catch (e) {
    console.error(e)
    FPComponents.Popup_A.message(`Signal.create() -- Subscribe signal failed`, [
      e.message,
      `Code: ${e.controllerStatus.code}`,
      e.controllerStatus.description,
    ])
    return undefined
  }
}

// Signal.create = async function (name, type, subscribe = true) {
//   let signal;
//   let newSignal = false;
//   let attr = [];

//   try {
//     // Check if signal is already available
//     const s = await RWS.IO.getSignal(name);
//   } catch (e) {
//     console.error(e);
//     newSignal = true;
//   }

//   try {
//     // Check if instance is configured
//     const instance = await RWS.CFG.getInstanceByName("EIO", "EIO_SIGNAL", name);
//     attr = instance.getAttributes();
//   } catch (e) {
//     console.error(e);
//     attr["Name"] = name;
//     attr["SignalType"] = type;
//     attr["Access"] = "All";
//   }

//   signal = new Signal(attr, newSignal);

//   if (!subscribe || newSignal) return signal;

//   console.log(`Subscribing to ${name} signal...`);
//   try {
//     await signal.subscribe();
//     return signal;
//   } catch (e) {
//     console.error(e);
//     FPComponents.Popup_A.message(`Signal.create() -- Subscribe signal failed`, [
//       e.message,
//       `Code: ${e.controllerStatus.code}`,
//       e.controllerStatus.description,
//     ]);
//     return undefined;
//   }
// };

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
