const moduleName = 'myModule'
const modulePath = `HOME/WebApps/EcosystemGuide/rapid/${moduleName}.sysx`

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

function createConfigView() {
  const loadBtn = new FPComponents.Button_A()
  const unloadBtn = new FPComponents.Button_A()
  const getCrossConn = new FPComponents.Button_A()
  const setCrossConn = new FPComponents.Button_A()

  getCrossConn.attachToId('cross-connection-get')
  getCrossConn.text = 'Get cross-connections'
  setCrossConn.attachToId('cross-connection-set')
  setCrossConn.text = 'Set cross-connections'

  cbOnClickGetCC = async () => {
    const textArea = document.getElementById('cross-connection-output')
    textArea.textContent = ''
    const crossConns = await API.SIGNAL.fetchAllCrossConnections()

    textArea.textContent = crossConns
      .map((conn) => JSON.stringify(conn.getAttributes()))
      .join(' \n ')
  }
  getCrossConn.onclick = cbOnClickGetCC

  cbOnClickSetCC = async () => {
    const attrs = {
      Name: 'newConnection',
      Res: 'ZG_DI0',
      Act1: 'ZG_DI1',
      Act1_invert: 'false',
      Oper1: 'AND',
      Act2: 'ZG_DI2',
      Act2_invert: 'false',
      // Oper2: '',
      // Act3: '',
      // Act3_invert: '',
      // Oper3: '',
      // Act4: '',
      // Act4_invert: 'false',
      // Oper4: '',
      // Act5: '',
      // Act5_invert: 'false',
    }

    try {
      await API.SIGNAL.createCrossConnectionInstance(attrs)
    } catch (e) {
      console.error(e)
    }
  }
  setCrossConn.onclick = cbOnClickSetCC

  loadBtn.attachToId('load-module')
  loadBtn.text = 'Load Module'
  unloadBtn.attachToId('unload-module')
  unloadBtn.text = 'Unload Module'

  cbOnClickLoad = async () => {
    try {
      await API.RAPID.loadModule(modulePath, true)
    } catch (e) {
      console.error('Uncaught exception in cbOnClickLoad: ' + JSON.stringify(e))
      console.error(e)
    }
  }
  loadBtn.onclick = cbOnClickLoad

  cbOnClickUnload = async () => {
    try {
      await API.RAPID.unloadModule(moduleName)
    } catch (e) {
      console.error(
        'Uncaught exception in cbOnClickUnload: ' + JSON.stringify(e)
      )
      console.error(e)
    }
  }
  unloadBtn.onclick = cbOnClickUnload
}

// Handler functions
const handlerConfigureSignal = function (attr) {
  let found = false
  try {
    found = API.DEVICE.isAnySignalMappedTo(attr)
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

  window.editSignalView.addHandlerRender(handlerConfigureSignal)
  const devices = await API.DEVICE.fetchEthernetIPDevices()

  const deviceNames = devices.map((item) => item.device)
  window.editSignalView.initDeviceDropdown(deviceNames)

  inputSignalContainer.render(API.SIGNAL.getSignalsOfType('DI'))
  outputSignalContainer.render(API.SIGNAL.getSignalsOfType('DO'))

  // Only after the signals are added to input and output container
  window.editSignalView.addHandlersShowWindow()
  window.editSignalView.addHandlerUpdate(handlerUpdateSignalAttr)
}
