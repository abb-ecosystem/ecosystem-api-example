/////////////////
const inputSignalContainer = new SignalContainer("signal-container-input");
const outputSignalContainer = new SignalContainer("signal-container-output");

const btnReboot = new FPComponents.Button_A();
const btnRebootContainer = document.querySelector("#btn-reboot");

// UI functions
function configRebootButton() {
  btnReboot.text = "Reboot";

  const handlerReboot = function () {
    RWS.Controller.restartController(RWS.Controller.RestartModes.restart);
  };

  btnReboot.onclick = handlerReboot;
  btnReboot.highlight = true;
  btnReboot.attachToId("btn-reboot");
}

// Model functions
const updateSignalIndicator = async function () {
  model.state.ios.inputs.forEach((io) => io.forceCallback());
  model.state.ios.outputs.forEach((io) => io.forceCallback());
};

// Handler functions
const handlerConfigureSignal = function (data, attr) {
  console.log(data);
  console.log(attr);
  let found = false;
  try {
    found = model.isAnyInputMappedTo(attr);
    if (found)
      return `Device "${attr.device}", Map "${attr.map}" already used by another signal!`;
  } catch (err) {
    console.error(err);
  }
  return;
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

const handlerUpdateSignalAttr = async function (attr) {
  // Search signal api
  const input = model.state.ios.inputs.find(
    (signal) => signal.name === attr.name
  );
  if (input) {
    input && input.configSignal(attr.device, attr.map);
    // update visualization
    inputSignalContainer.updateSignalAttributes(attr);
  } else {
    const output = model.state.ios.outputs.find(
      (signal) => signal.name === attr.name
    );
    output && output.configSignal(attr.device, attr.map);
    // Update values in the visualization
    outputSignalContainer.updateSignalAttributes(attr);
  }

  let rebootRequired = inputSignalContainer._signals.some(
    (signal) => signal.modified === true
  );
  rebootRequired |= outputSignalContainer._signals.some(
    (signal) => signal.modified === true
  );

  rebootRequired
    ? btnRebootContainer.classList.remove("hidden")
    : btnRebootContainer.classList.add("hidden");
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

  inputSignalContainer.render(model.state.ios.inputs);
  inputSignalContainer.addHandlerChangeSignalValue(handlerChangeSignalValue);

  outputSignalContainer.render(model.state.ios.outputs);
  outputSignalContainer.addHandlerChangeSignalValue(handlerChangeSignalValue);

  // Only after the signals are added to input and output container
  window.editSignalView.addHandlersShowWindow();
  window.editSignalView.addHandlerUpdate(handlerUpdateSignalAttr);

  updateSignalIndicator();
}
