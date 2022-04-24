const EditSignalView = function () {
  View.call(this)

  this._parentElement = document.querySelector('.modal-content')
  this._errorMessage = 'Error while editing signal 😆!'
  this._message = ''

  this._window = document.querySelector('.modal')
  this._overlay = document.querySelector('.overlay')
  this._btnsOpen = document.querySelectorAll('.btn-edit-signal')
  this._btnClose = document.querySelector('.close-modal')

  this._modalDeviceDropDown = new FPComponents.Dropdown_A()
  this._modalMapInput = new FPComponents.Input_A()
  this._btnUpdate = new FPComponents.Button_A()

  this._btnUpdate.text = 'update'
  this._btnUpdate.highlight = true
  this._modalMapInput.regex = /^-?[0-9]+(\.[0-9]+)?$/

  this._addHandlerHideWindow()
}

EditSignalView.prototype = Object.create(View.prototype)

EditSignalView.prototype.openWindow = function (e) {
  const btn = e.target.closest('.btn-edit-signal')
  if (btn) {
    this.render(btn.dataset)
  }

  this.toggleWindow()
}

EditSignalView.prototype.toggleWindow = function () {
  this._overlay.classList.toggle('hidden')
  this._window.classList.toggle('hidden')
}

EditSignalView.prototype.addHandlersShowWindow = function () {
  this._btnsOpen = document.querySelectorAll('.btn-edit-signal')

  Array.from(this._btnsOpen).forEach((node) =>
    node.addEventListener('click', this.openWindow.bind(this))
  )
}

EditSignalView.prototype._addHandlerHideWindow = function () {
  this._btnClose.addEventListener('click', this.toggleWindow.bind(this))
  this._overlay.addEventListener('click', this.toggleWindow.bind(this))
}

EditSignalView.prototype.initDeviceDropdown = function (devices) {
  console.log('😎')
  console.log(devices)
  this._modalDeviceDropDown.model = { items: devices }
}

EditSignalView.prototype.addHandlerRender = function (update) {
  const cbOnSelection = function (index, obj) {
    this._warning.textContent = ''
    const attr = {
      Name: this._data.name,
      SignalType: this._data.type,
      Device:
        this._modalDeviceDropDown.model.items[
          this._modalDeviceDropDown.selected
        ],
      DeviceMap: this._modalMapInput.text,
    }

    console.log('👍', JSON.stringify(attr))
    const response = update(attr)

    if (!response) return

    // if the update was unsuccessful, then restore old value
    this._warning.textContent = response

    this._modalDeviceDropDown.selected =
      this._modalDeviceDropDown.model.items.indexOf(this._data.device)
  }

  this._modalDeviceDropDown.onselection = cbOnSelection.bind(this)

  const cbOnChange = function (text) {
    this._warning.textContent = ''

    const attr = {
      Name: this._data.name,
      SignalType: this._data.type,
      Device:
        this._modalDeviceDropDown.model.items[
          this._modalDeviceDropDown.selected
        ],
      DeviceMap: text,
    }

    const response = update(attr)

    if (!response) return

    // if the update was unsuccessful, then restore old value
    this._warning.textContent = response

    this._modalMapInput.text = this._data.map
  }
  this._modalMapInput.onchange = cbOnChange.bind(this)
}

EditSignalView.prototype._generateMarkup = function () {
  const markup = `
    <div class="row">
        <div class="cols-4"><h3> Signal Name</h3></div>
        <div class="cols-4"><h3>Type</h3></div>
        <div class="cols-4"><h3>Device</h3></div>
        <div class="cols-4"><h3>Map</h3></div>
    </div>
    <div class="row">
        <div class="cols-4"><p class="modal-signal-name">${this._data.name}</p></div>
        <div class="cols-4"><p class="modal-signal-type">${this._data.type}</p></div>
        <div class="cols-4"><div id="modal-signal-device"></div></div>
        <div class="cols-4"><div id="modal-signal-map"></div></div>
    </div>
    <div class="row">
      <div class="cols-1">
        <div id="modal-signal-update" class="btn ok"></div>
      </div>
    </div>
    <div class="row">
      <div class="cols-1">
        <h3 class="modal-warning"></h3>
      </div>
    </div>
    `

  console.log('😝')
  console.log(this._modalDeviceDropDown)

  this._modalDeviceDropDown.selected =
    this._modalDeviceDropDown.model.items.indexOf(this._data.device)
  this._modalMapInput.text = this._data.map

  return markup
}

EditSignalView.prototype._handleFPComponents = function () {
  this._modalDeviceDropDown.attachToId('modal-signal-device')
  this._modalMapInput.attachToId('modal-signal-map')
  this._btnUpdate.attachToId('modal-signal-update')
  this._warning = this._parentElement.querySelector('.modal-warning')
}

EditSignalView.prototype.addHandlerUpdate = function (handler) {
  const cbUpdate = function () {
    const attr = []

    attr.Name =
      this._parentElement.querySelector('.modal-signal-name').textContent
    attr.SignalType =
      this._parentElement.querySelector('.modal-signal-type').textContent
    attr.Device =
      this._modalDeviceDropDown.model.items[this._modalDeviceDropDown.selected]
    attr.DeviceMap = this._modalMapInput.text

    console.log('💢')
    console.log(attr)
    handler(attr)
    this.toggleWindow()
  }

  this._btnUpdate.onclick = cbUpdate.bind(this)
}

window.editSignalView = new EditSignalView()
