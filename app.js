"use strict";

////////////////////////////////////////////////////////////////////
// Entry point
////////////////////////////////////////////////////////////////////
window.addEventListener("load", () => {
  RWS.setDebug(1, 0);
  fpComponentsEnableLog();
  console.log("windows loaded");

  constructUI(UIConstructionCompleted);
});

////////////////////////////////////////////////////////////////////
// GUI
////////////////////////////////////////////////////////////////////

async function constructUI(done) {
  initTabs();

  //   const btnUpdate = document.querySelector("#update-signal");
  //   btnUpdate.addEventListener("click", updateSignalIndicator);

  setTimeout(() => {
    done();
  }, 0);
}

function initTabs() {
  var tabContainer = new FPComponents.Tabcontainer_A();
  tabContainer.addTab("Digital IOs", "io-view");
  tabContainer.addTab("About", "about-view");
  tabContainer.attachToId("tab-container");
}

// Called after the constructUI function has finished.
async function UIConstructionCompleted() {
  setTimeout(async () => {
    try {
      console.log("UIConstructionCompleted called ...");

      // await createIOs();
      await setupConfiguration();
    } catch (e) {
      console.error(
        "Uncaught exception in UIConstructionCompleted: " + JSON.stringify(e)
      );
      console.error(e);
    }
  }, 0);
}

//////////////////
const handlerConfigureSignal = function (data, attr) {
  let found = false;
  try {
    found = model.isAnyInputMappedTo(attr);
    if (found) throw "Parameter already used by another signal";
    data.device = attr.device;
    data.map = attr.map;
  } catch (err) {
    console.error(err);
  }
  return !found;
};

const handlerChangeSignalValue = async function (name, value) {
  try {
    model.getSignalByName(name).value = value;
  } catch (e) {
    console.error(e);
    FPComponents.Popup_A.message(e.message, [
      e.httpStatus.code,
      e.controllerStatus.name,
      e.controllerStatus.description,
    ]);
  }
};

const updateSignalIndicator = async function () {
  model.state.ios.inputs.forEach((io) => io.forceCallback());
  model.state.ios.outputs.forEach((io) => io.forceCallback());
};

async function setupConfiguration() {
  await model.init();

  // Digital inputs
  model.addInputSignal(await Signal.create("di_is_gripper_opened"));
  model.addInputSignal(await Signal.create("di_is_gripper_closed"));
  model.addInputSignal(await Signal.create("di_machine_job_end"));
  model.addInputSignal(await Signal.create("di_part_clamped"));
  model.addInputSignal(await Signal.create("di_profile_free_machine"));

  // Digital outputs
  model.addOutputSignal(await Signal.create("do_gripper_close"));
  model.addOutputSignal(await Signal.create("do_gripper_open"));
  model.addOutputSignal(await Signal.create("do_part_gripped"));
  model.addOutputSignal(await Signal.create("do_part_in_clamping_pos"));
  model.addOutputSignal(await Signal.create("do_profile_free_robot"));

  window.editSignalView.addHandlerRender(handlerConfigureSignal);
  window.editSignalView.initDeviceDropdown(model.state.devices);

  const inputSignalContainer = new SignalContainer("signal-container-input");
  inputSignalContainer.render(model.state.ios.inputs);
  inputSignalContainer.addHandlerChangeSignalValue(handlerChangeSignalValue);

  const outputSignalContainer = new SignalContainer("signal-container-output");
  outputSignalContainer.render(model.state.ios.outputs);
  outputSignalContainer.addHandlerChangeSignalValue(handlerChangeSignalValue);

  // Only after the signals are added to input and output container
  window.editSignalView.addHandlersShowWindow();

  updateSignalIndicator();
}
