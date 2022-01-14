"use strict";

////////////////////////////////////////////////////////////////////
// Digital Signal
////////////////////////////////////////////////////////////////////
// const DigitalSignal = function (signal, id) {
//   this._signal = signal;
//   this._id = id;
// };

// Object.defineProperty(DigitalSignal.prototype, "name", {
//   get() {
//     return this._signal.name;
//   },
//   set(value) {
//     this._signal.name = value;
//   },
// });

// Object.defineProperty(DigitalSignal.prototype, "device", {
//   get() {
//     return this._signal.device;
//   },
//   set(value) {
//     this._signal.device = value;
//   },
// });

// Object.defineProperty(DigitalSignal.prototype, "type", {
//   get() {
//     return this._signal.type;
//   },
//   set(value) {
//     this._signal.type = value;
//   },
// });

// Object.defineProperty(DigitalSignal.prototype, "map", {
//   get() {
//     return this._signal.map;
//   },
//   set(value) {
//     this._signal.map = value;
//   },
// });

// Object.defineProperty(DigitalSignal.prototype, "value", {
//   get() {
//     return this._signal.value;
//   },
//   set(value) {
//     this._signal.value = value;
//   },
// });

// DigitalSignal.addHandlerOnChanged = function (handler) {
//   this._signal.addCallbackOnChanged(handler);
// };

// DigitalSignal.prototype.handlerIndicator = async function (value) {
//   try {
//     await this._signal._setValue(value);
//   } catch (e) {
//     console.error(e);
//     FPComponents.Popup_A.message(e.message, [
//       e.httpStatus.code,
//       e.controllerStatus.name,
//       e.controllerStatus.description,
//     ]);
//   }
// };

// DigitalSignal.create = async function (name, id) {
//   let signal = await Signal.create(name);
//   let digSignal = new DigitalSignal(signal, id);
//   // digSignal._init();
//   return digSignal;
// };

////////////////////////////////////////////////////////////////////
// Configuraiton
////////////////////////////////////////////////////////////////////

// async function setupConfiguration_____(){
//     let cfgFile = 'EIO_EXAMPLE.cfg';
//     let action;
//     let answer;

///////////////////
// verifyConfigurationFile
//     Reset any available previous configuration before loading the new one

// try{
//     cfgFile = 'EIO_EXAMPLE_BAD_CONFIG.cfg';
//     answer = await RWS.CFG.verifyConfigurationFile('/$home/WebApps/Ecosystemguide/config/' + cfgFile, action );
// } catch (e) {
//     console.error(e);
//     FPComponents.Popup_A.message(`CFG setupConfiguration() --Exception occurs:`, [e.message, `Code: ${e.controllerStatus.code}`, e.controllerStatus.description]);
// }

///////////////////
// loadConfiguration with 'add-with-reset' action
//     Reset any available previous configuration before loading the new one

// try{
//     cfgFile = 'EIO_ABB_Scalable.cfg'
//     action = 'add-with-reset';
//     answer = await RWS.CFG.loadConfiguration('/$home/WebApps/Ecosystemguide/config/' + cfgFile, action );
// } catch (e) {
//     console.error(e);
//     FPComponents.Popup_A.message(`CFG setupConfiguration() --Exception occurs:`, [e.message, `Code: ${e.controllerStatus.code}`, e.controllerStatus.description]);
// }

///////////////////
// loadConfiguration with 'add' action
//    Keeps the previous configuration and loads the new one
//    If a signal is exists already, then an exception occurs and the configuration is not loaded

// try{
//     cfgFile = 'EIO_EXAMPLE_ADD.cfg'
//     action = 'add';
//     answer = await RWS.CFG.loadConfiguration('/$home/WebApps/Ecosystemguide/config/' + cfgFile, action );

// //     cfgFile = 'EIO_EXAMPLE_BAD_ADD.cfg'
// //     action = 'add';
// //     answer = await RWS.CFG.loadConfiguration('/$home/WebApps/Ecosystemguide/config/' + cfgFile, action );
// } catch (e) {
//     console.error(e);
//     FPComponents.Popup_A.message(`CFG setupConfiguration() --Exception occurs:`, [e.message, `Code: ${e.controllerStatus.code}`, e.controllerStatus.description]);
// }

///////////////////
// loadConfiguration with 'replace' action
//    Keeps the previous configuration and loads the new one
//    If a signal is exists already, then this is overwriten

// try{
//     cfgFile = 'EIO_EXAMPLE_REPLACE.cfg'
//     action = 'replace';
//     answer = await RWS.CFG.loadConfiguration('/$home/WebApps/Ecosystemguide/config/' + cfgFile, action );
// } catch (e) {
//     console.error(e);
//     FPComponents.Popup_A.message(`CFG setupConfiguration() --Exception occurs:`, [e.message, `Code: ${e.controllerStatus.code}`, e.controllerStatus.description]);
// }

// try{

// let domainsList = await RWS.CFG.getDomains();

// for( const domain of domainsList){
//     console.log(domain.getName());
//     let types = await RWS.CFG.getTypes(domain.getName());
//     for( const type of types){
//         console.log(`  ${type.getName()}`);
//         let instances = await RWS.CFG.getInstances(domain.getName(), type.getName());
//         for( const instance of instances){
//             console.log(`      id: ${instance.getInstanceId()}, name: ${instance.getInstanceName()}` );
//         }
//     }
// }

//     const signalsObj = [];

//     let ethIPDevices = await RWS.CFG.getInstances('EIO', 'ETHERNETIP_DEVICE');
//     console.log('=== EthernetIP Devices ===');
//     for(let device of ethIPDevices){
//         console.log(device.getAttributes());
//         console.log(`${device.getInstanceName()}: ${device.getAttributes().StateWhenStartup}`);
//         signalsObj.push({device : device.getInstanceName(), signals : []});
//         ethernetDevices.push( device.getInstanceName());
//     }

//     for(let idx = 0; idx < signalsObj.length; idx++)
//     {
//         console.log(signalsObj[idx]);
//     }

//     let eioSignals = await RWS.CFG.getInstances('EIO', 'EIO_SIGNAL');
//     for(const signal of eioSignals){
//         let attr = signal.getAttributes();
//         for(let item of signalsObj){
//             (attr.Device === item.device) && item.signals.push({name:attr.Name, type:attr.SignalType, map:attr.DeviceMap});
//         }
//     }

//     for(let item of signalsObj){
//         console.log(item.signals);
//         console.log(item);
//     }

// } catch (e) {
//     console.error(e);
//     FPComponents.Popup_A.message(`CFG setupConfiguration() --Exception occurs:`, [e.message, `Code: ${e.controllerStatus.code}`, e.controllerStatus.description]);
// }

///////////////////
// saveConfiguration
//    Saves the specified domain configuration from controller into a file

// try{
//     await RWS.CFG.saveConfiguration('EIO','/$home/WebApps/Ecosystemguide/config/EIO.cfg');
// } catch (e) {
//     console.error(e);
//     FPComponents.Popup_A.message(`CFG setupConfiguration() --Exception occurs:`, [e.message, `Code: ${e.controllerStatus.code}`, e.controllerStatus.description]);
// }

// try{
// let network = await RWS.IO.getNetwork('EtherNetIP');
// console.log('Network ');
// console.log(network);
// let device = await RWS.IO.getDevice(network.getName(), 'ABB_Scalable_IO');
// console.log(device);
// let di_signal = await RWS.IO.getSignal('di_is_gripper_closed');
// let do_signal = await RWS.IO.getSignal('do_gripper_close');
// console.log(await di_signal.getValue());
// console.log(await do_signal.getValue());

// RWS.IO.setSignalValue('di_is_gripper_closed', 1);
// RWS.IO.setSignalValue('do_gripper_close', 1);

// let filterInputs = {
//     name: 'ESG_',
//     // type: 'DI',
// }
// let signals = await RWS.IO.searchSignals(filterInputs);
// if(signals.length > 0){
//     for(const signal of signals){
//         let value = await signal.getValue();
//         console.log(`${signal.getName()} = ${value}`);
//     }
// }

// let fiterDevice = {
//     device: 'ABB_Scalable_IO',
// }
// let signalsDevice = await RWS.IO.searchSignals(fiterDevice);
// console.dir(signalsDevice);
// if(signalsDevice.length > 0){
//     for(const signal of signalsDevice){
//         let value = await signal.getValue();
//         console.log(`${signal.getName()} = ${value}`);
//     }
// }
// } catch (e) {
//     console.error(e);
//     FPComponents.Popup_A.message(`CFG setupConfiguration() --Exception occurs:`, [e.message, `Code: ${e.controllerStatus.code}`, e.controllerStatus.description]);
// }

// }
