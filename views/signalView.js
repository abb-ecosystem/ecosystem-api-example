// SignalView

const SignalView = function (signal, container) {
  View.call(this)
  this._signal = signal
  this.id = `signal-${this._signal.name}`
  this._parentElement = document.querySelector(`#${container}`)

  this._indicator = new FPComponents.Digital_A()
  this._edit = new FPComponents.Button_A()
  this._edit.text = 'edit'
  this._signal.modified ? (this.modified = true) : (this.modified = false)

  if (this._signal.active)
    this._signal.addCallbackOnChanged(this.updateIndicator.bind(this))

  const cbOnClick = async function () {
    this._indicator.active = !this._indicator.active
    this._indicator.active ? this._signal.handler(1) : this._signal.handler(0)
  }

  this._indicator.onclick = cbOnClick.bind(this)
}

SignalView.prototype = Object.create(View.prototype)

SignalView.prototype.addHandlerIndicator = function (handler) {
  const cbOnClick = async function () {
    let value = this._indicator.active ? 0 : 1
    // this._indicator.active = setValue;

    handler(this._signal.name, value)
  }

  this._indicator.onclick = cbOnClick.bind(this)
}

SignalView.prototype.callbackOnChanged = function (value) {
  this._indicator.active = value
}

SignalView.prototype._generateMarkup = function () {
  const markup = `
    <div id="${this.id}" class="digital-signal">
        <div class="row">
            <div class="cols-2">
              <div class="row">
                <div class="cols-3"><p id="${this.id}-ind"></p></div>
                <div class="cols-2"><p class="message">${
                  this._signal.name
                }</p></div>
              </div>
            </div>
            <div class="cols-2">
              <div class="row">
                <div class="cols-2"><p id="${this.id}-device">${
    this._signal.device ? this._signal.device : ''
  }: ${this._signal.map ? this._signal.map : ''}</p></div>

                <div class="cols-2 left"><div id="${
                  this.id
                }-edit" class="btn btn-edit-signal"
                  data-name="${this._signal.name}"
                  data-type="${this._signal.type}"
                  data-device="${
                    this._signal.device ? this._signal.device : ''
                  }"
                  data-map="${this._signal.map ? this._signal.map : ''}">
                </div></div>
              </div>
            </div>
        </div>
    </div>
  `

  return markup
}

SignalView.prototype._handleFPComponents = function () {
  if (this._FPCompAttached) return

  this._indicator.attachToId(`${this.id}-ind`)
  this._edit.attachToId(`${this.id}-edit`)
  this._device = this._parentElement.querySelector(`#${this.id}-device`)
  // this._map = this._parentElement.querySelector(`#${this.id}-map`);
  this._btnEdit = this._parentElement.querySelector(`#${this.id}-edit`)
  this._FPCompAttached = true
  this._msg = this._parentElement
    .querySelector(`#${this.id}`)
    .querySelector('.message')
  this.modified
    ? this._msg.classList.add('warning')
    : this._msg.classList.remove('warning')
}

SignalView.prototype.updateIndicator = function (value) {
  this._indicator.active = value
}

SignalView.prototype.updateAttributes = function (attr) {
  this._device &&
    (this._device.textContent = `${attr.Device ? attr.Device : ''}: ${
      attr.DeviceMap ? attr.DeviceMap : ''
    }`)

  if (
    this._btnEdit.dataset.device !== attr.Device ||
    this._btnEdit.dataset.map !== attr.DeviceMap
  ) {
    this.modified = true
    this._msg.classList.add('warning')
  } else {
    this.modified = false
    this._msg.classList.remove('warning')
  }
}

///////////////////////////////////////////////////
// Signal container

const SignalContainer = function (id) {
  View.call(this)
  this.id = id
  this._parentElement = document.querySelector(`#${id}`)
  this._errorMessage = 'No signals found 😆!'
  this._message = ''
  this._signals = []
}

SignalContainer.prototype = Object.create(View.prototype)

SignalContainer.prototype.addHandlerChangeSignalValue = function (handler) {
  this._signals.forEach((signal) => signal.addHandlerIndicator(handler))
}

SignalContainer.prototype._generateMarkup = function () {
  const markup = this._data
    .map((signal) => {
      const newSignal = new SignalView(signal, this.id)
      this._signals.push(newSignal)
      return newSignal.render(signal, false)
    })
    .join('')
  return markup
}

SignalContainer.prototype._handleFPComponents = function () {
  this._signals.forEach((signal) => signal._handleFPComponents())
}

SignalContainer.prototype.updateSignalAttributes = function (attr) {
  const signal = this._signals.find((signal) => {
    let signalName = signal.id.slice(7)
    return signalName === attr.Name
  })
  signal && signal.updateAttributes(attr)
}
