/////////////////
const inputSignalContainer = new SignalContainer('signal-container-input')
const outputSignalContainer = new SignalContainer('signal-container-output')

const btnReboot = new FPComponents.Button_A()
const btnRebootContainer = document.querySelector('#btn-reboot')

// UI functions
function configRebootButton() {
  btnReboot.text = 'Reboot'

  const handlerReboot = function () {
    RWS.Controller.restartController(RWS.Controller.RestartModes.restart)
  }

  btnReboot.onclick = handlerReboot
  btnReboot.highlight = true
  btnReboot.attachToId('btn-reboot')
}

// Model functions
const updateSignalIndicator = async function () {
  model.state.ios.inputs.forEach((io) => io.forceCallback())
  model.state.ios.outputs.forEach((io) => io.forceCallback())
}

// Handler functions
const handlerConfigureSignal = function (data, attr) {
  let found = false
  try {
    found = model.isAnyInputMappedTo(attr)
    if (found)
      return `Device "${attr.Device}", Map "${attr.DeviceMap}" already used by another signal!`
  } catch (err) {
    console.error(err)
  }
  return
}

const handlerChangeSignalValue = async function (name, value) {
  try {
    const signal = await API.SIGNAL.getSignalByName(name)
    signal.value = value
    // model.getSignalByName(name).value = value
  } catch (e) {
    console.error(e)
    FPComponents.Popup_A.message(e.message, [
      e.httpStatus.code,
      e.controllerStatus.name,
      e.controllerStatus.description,
    ])
  }
}

const handlerUpdateSignalAttr = async function (attr) {
  // Search signal api
  const signal = API.SIGNAL.getSignalByName(attr.Name)
  signal.attr = attr
  signal.type === 'DI'
    ? inputSignalContainer.updateSignalAttributes(attr)
    : outputSignalContainer.updateSignalAttributes(attr)

  let rebootRequired = API.SIGNAL.isAnySignalModified()

  rebootRequired
    ? btnRebootContainer.classList.remove('hidden')
    : btnRebootContainer.classList.add('hidden')
}

async function setupConfiguration() {
  // await model.init()

  // Digital inputs
  await API.SIGNAL.createSignal('di_is_gripper_opened')
  await API.SIGNAL.createSignal('di_is_gripper_closed')
  await API.SIGNAL.createSignal('di_machine_job_end')
  await API.SIGNAL.createSignal('di_part_clamped')
  await API.SIGNAL.createSignal('di_profile_free_machine')

  // Digital outputs
  await API.SIGNAL.createSignal('do_gripper_close')
  await API.SIGNAL.createSignal('do_gripper_open')
  await API.SIGNAL.createSignal('do_part_gripped')
  await API.SIGNAL.createSignal('do_part_in_clamping_pos')
  await API.SIGNAL.createSignal('do_profile_free_robot')

  // if (!(await model.isEverySignalConfigured())) {
  // if (true) {
  //   console.log('NOT every signal configured, loading from config file...')
  //   if (model.state.devices.some((dev) => dev === 'ABB_Scalable_IO')) {
  //     await loadIOConfigFromFile('EIO_ABB_Scalable_IO.cfg')
  //   } else {
  //     await loadIOConfigFromFile('EIO.cfg')
  //   }
  // } else {
  //   console.log('EVERY signal configured...')
  // }

  // model.updateSignalAttributes().then(() => {
  window.editSignalView.addHandlerRender(handlerConfigureSignal)
  const devices = await API.DEVICE.fetchEthernetIPDevices()
  window.editSignalView.initDeviceDropdown(devices)

  inputSignalContainer.render(API.SIGNAL.getSignalsOfType('DI'))
  // inputSignalContainer.addHandlerChangeSignalValue(handlerChangeSignalValue)

  outputSignalContainer.render(API.SIGNAL.getSignalsOfType('DO'))
  // outputSignalContainer.addHandlerChangeSignalValue(handlerChangeSignalValue)

  // Only after the signals are added to input and output container
  window.editSignalView.addHandlersShowWindow()
  window.editSignalView.addHandlerUpdate(handlerUpdateSignalAttr)

  // updateSignalIndicator()
  // })
}
