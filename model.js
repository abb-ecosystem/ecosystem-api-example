// import { EthernetDevices as EthernetIP } from "./api/ethernetDevicesApi.js";

model = {
  state: {
    devices: [],
    ios: {
      inputs: [],
      outputs: [],
    },
    ioChanged: false,
    eth: {},
  },

  addInputSignal: function (input) {
    this.state.ios.inputs.push(input);
  },

  addOutputSignal: function (input) {
    this.state.ios.outputs.push(input);
  },

  getSignalByName: function (name) {
    const found = this.state.ios.inputs.find((signal) => signal.name === name);
    return (
      found || this.state.ios.outputs.find((signal) => signal.name === name)
    );
  },

  isAnyInputMappedTo: function (attr) {
    console.log(this.state.eth.data);
    const device = this.state.eth.data.find(
      (dev) => dev.device === attr.device
    );
    const found =
      device &&
      device.signals.some(
        (signal) =>
          signal.map === attr.map &&
          signal.type === attr.type &&
          signal.name !== attr.name
      );
    return found;
  },

  init: async function () {
    ///////////////////
    // loadConfiguration with 'replace' action
    //    Keeps the previous configuration and loads the new one
    //    If a signal is exists already, then this is overwriten
    // const cfgFile = 'EIO_ECOSYSTEM_GUIDE.cfg'
    // const action = 'replace';
    // loadConfigFromFile(cfgFile, action);

    // get available ethernet devices from controller
    this.state.devices = await getEthernetDevices();

    this.state.eth = await EthernetDevices.create();
  },
};

////////////////////////////////////////////////////////////////////
// Configuraiton
////////////////////////////////////////////////////////////////////

const getEthernetDevices = async function () {
  const devList = [];
  try {
    const devices = await RWS.CFG.getInstances("EIO", "ETHERNETIP_DEVICE");
    // console.log('=== EthernetIP Devices ===');
    for (let device of devices) {
      // console.log(device.getAttributes());
      // console.log(`${device.getInstanceName()}: ${device.getAttributes().StateWhenStartup}`);
      devList.push(device.getInstanceName());
    }
    return devList;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const loadConfigFromFile = async function (cfgFile, action = "replace") {
  try {
    const answer = await RWS.CFG.loadConfiguration(
      "/$home/WebApps/Ecosystemguide/config/" + cfgFile,
      action
    );
    // console.log(`Config file ${cfgFile}, action(${action}): Loading returns ${answer}`);
  } catch (e) {
    console.error(e);
    FPComponents.Popup_A.message(`loadConfigFromFile() --Exception occurs:`, [
      e.message,
      `Code: ${e.controllerStatus.code}`,
      e.controllerStatus.description,
    ]);
  }
};

////////////////////////////////////////////////////////////////////
// RWS Interface
////////////////////////////////////////////////////////////////////
const RWS_Interface = function (task, module) {
  this.task = task;
  this.module = module;
};

RWS_Interface.prototype.subscribeVariable = async function (variable, id) {
  // console.log(`subscribeVariable() called ... ${this.task} , ${this.module} , ${variable} , ${id}`);
  let varEl = await RWS.Rapid.getData(this.task, this.module, variable);
  varEl.addCallbackOnChanged(async function (value) {
    document.getElementById(id).textContent = value;
  });
  await varEl.subscribe(true);

  // this.variables.set(variable, varEl);

  return varEl;
};

////////////////////////////////////////////////////////////////////
// WebApp Initialization
const WebApp_Interface = new RWS_Interface("T_ROB1", "ECOSYSTEM_Base_TEMP");
