define(['views/signalContainer', 'views/editSignal', 'views/reboot'], function (
  SignalContainer,
  EditSignal,
  Reboot
) {
  return class IoView {
    constructor(container) {
      this.container = container
      this.init()
    }

    async init() {
      await this.setup()

      this.render()
    }

    render() {
      this.container.innerHTML = IoView.markup(this)

      /////////////////
      this.inputSignalContainer = new SignalContainer(
        this.container.querySelector('#signal-container-input'),
        API.SIGNAL.getSignalsOfType('DI')
      )
      this.outputSignalContainer = new SignalContainer(
        this.container.querySelector('#signal-container-output'),
        API.SIGNAL.getSignalsOfType('DO')
      )

      this.editSignal = new EditSignal(
        this.container.querySelector('.edit-window')
      )

      this.editSignal.initDeviceDropdown(this.deviceNames)

      // Only after the signals are added to input and output container
      this.editSignal.addHandlersShowToElements(
        this.container.querySelectorAll('.btn-edit-signal')
      )

      this.editSignal.addHandlerUpdate(this.updateSignalAttr.bind(this))

      this.btnReboot = new Reboot(this.container.querySelector('.reboot-view'))
    }

    static markup() {
      return `
    <div id="io-signals" class="container border">
    <div class="row">
      <div class="cols-1 infobox">
        <div>
          <p>Digital IOs</p>
          <!-- <button id="update-signal">update signals</button> -->
        </div>
      </div>
    </div>
    <div class="row">
      <div class="cols-2 infobox">
        <div><p>Inputs</p></div>
        <div id="signal-container-input"></div>
      </div>
      <div class="cols-2 infobox">
        <div><p>Outputs</p></div>
        <div id="signal-container-output"></div>
      </div>
    </div>
    <div class="row">
      <div class="reboot-view"></div>
    </div>
  </div>

  <div class="edit-window"></div>
    `
    }

    async setup() {
      const devices = await API.DEVICE.fetchEthernetIPDevices()
      this.deviceNames = devices.map((item) => item.device)

      for (var i = 0; i < this.deviceNames.length; i++) {
        const filter = {
          device: this.deviceNames[i],
        }
        let signals = await API.SIGNAL.searchSignals(filter)
        for (var j = 0; j < signals.length; j++) {
          // console.log(signals[j].getName())
          await API.SIGNAL.createSignal(signals[j].getName())
        }
      }

      // Add also virtual signals
      const filter = {
        device: '',
      }
      let signals = await API.SIGNAL.searchSignals(filter)
      for (var j = 0; j < signals.length; j++) {
        // console.log(signals[j].getName())
        await API.SIGNAL.createSignal(signals[j].getName())
      }
    }

    async updateSignalAttr(attr) {
      const signal = API.SIGNAL.getSignalByName(attr.Name)
      signal.attr = attr
      signal.type === 'DI'
        ? this.inputSignalContainer.updateSignalAttributes(attr)
        : this.outputSignalContainer.updateSignalAttributes(attr)

      let rebootRequired = API.SIGNAL.isAnySignalModified()

      console.log('😒')
      console.log(`Reboot required: ${rebootRequired}`)

      rebootRequired ? this.btnReboot.show() : this.btnReboot.hide()
    }
  }
})
