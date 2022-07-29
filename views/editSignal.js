const VIRTUAL_SIGNAL = 'Virtual Signal'

// class EditSignal extends View {
define(function () {
  return class EditSignal {
    constructor(container) {
      this.container = container

      this._modalDeviceDropDown = new FPComponents.Dropdown_A()
      this._modalMapInput = new FPComponents.Input_A()
      this._btnUpdate = new FPComponents.Button_A()

      this.init()

      return this
    }

    init() {
      this._errorMessage = 'Error while editing signal 😆!'
      this._message = ''

      this._btnUpdate.text = 'update'
      this._btnUpdate.highlight = true
      this._modalMapInput.regex = /^-?[0-9]+(\.[0-9]+)?$/

      this._initCallbacks()
    }

    render(data) {
      this.container.innerHTML = EditSignal.markup(data)

      this._data = data
      this._window = this.container.querySelector('.modal')
      this._overlay = this.container.querySelector('.overlay')
      this._btnsOpen = this.container.querySelectorAll('.btn-edit-signal')
      this._btnClose = this.container.querySelector('.close-modal')

      this._btnClose.addEventListener('click', this.toggleWindow.bind(this))
      this._overlay.addEventListener('click', this.toggleWindow.bind(this))

      this._modalDeviceDropDown.selected =
        this._modalDeviceDropDown.model.items.indexOf(this._data.device)
      this._modalMapInput.text = this._data.map

      this._modalDeviceDropDown.attachToElement(
        this.container.querySelector('.modal-signal-device')
      )
      this._modalDeviceDropDown.attachToElement(
        this.container.querySelector('.modal-signal-device')
      )
      this._modalMapInput.attachToElement(
        this.container.querySelector('.modal-signal-map')
      )
      this._btnUpdate.attachToElement(
        this.container.querySelector('.modal-signal-update')
      )
      this._warning = this.container.querySelector('.modal-warning')
    }

    static markup({ name, type }) {
      return `
    <div class="modal hidden">
      <button class="close-modal">&times;</button>
      <form id="edit" class="modal-content">
        <div class="row">
          <div class="cols-4"><h3> Signal Name</h3></div>
          <div class="cols-4"><h3>Type</h3></div>
          <div class="cols-4"><h3>Device</h3></div>
          <div class="cols-4"><h3>Map</h3></div>
        </div>
        <div class="row">
          <div class="cols-4"><p class="modal-signal-name">${name}</p></div>
          <div class="cols-4"><p class="modal-signal-type">${type}</p></div>
          <div class="cols-4"><div class="modal-signal-device"></div></div>
          <div class="cols-4"><div class="modal-signal-map"></div></div>
        </div>
        <div class="row">
          <div class="cols-1">
            <div class="modal-signal-update btn ok"></div>
          </div>
        </div>
        <div class="row">
          <div class="cols-1">
            <h3 class="modal-warning"></h3>
          </div>
        </div>
      </form>
    </div>
    <div class="overlay hidden"></div>    
    `
    }

    initDeviceDropdown(devices) {
      this._modalDeviceDropDown.model = { items: [...devices, VIRTUAL_SIGNAL] }
    }

    _initCallbacks() {
      const cbOnSelection = function (index, obj) {
        this._warning.textContent = ''
        const attr = {
          Name: this._data.name,
          SignalType: this._data.type,
          // Device:
          //   this._modalDeviceDropDown.model.items[
          //     this._modalDeviceDropDown.selected
          //   ],
          DeviceMap: this._modalMapInput.text,
        }

        const selection =
          this._modalDeviceDropDown.model.items[
            this._modalDeviceDropDown.selected
          ]
        if (selection !== VIRTUAL_SIGNAL) {
          console.log('selection !== virtual signal')
          attr.Device = selection
        } else {
          console.log('selection === virtual signal')
          attr.Device = ''
        }

        console.log('👍', JSON.stringify(attr))
        console.log(attr)
        const response = this.updateSignal(attr)

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
          // Device:
          //   this._modalDeviceDropDown.model.items[
          //     this._modalDeviceDropDown.selected
          //   ],
          DeviceMap: text,
        }

        const selection =
          this._modalDeviceDropDown.model.items[
            this._modalDeviceDropDown.selected
          ]
        if (selection !== VIRTUAL_SIGNAL) {
          console.log('selection !== virtual signal')
          attr.Device = selection
        } else {
          console.log('selection === virtual signal')
          attr.Device = ''
        }

        const response = this.updateSignal(attr)

        if (!response) return

        // if the update was unsuccessful, then restore old value
        this._warning.textContent = response

        this._modalMapInput.text = this._data.map
      }
      this._modalMapInput.onchange = cbOnChange.bind(this)
    }

    addHandlersShowWindow(id) {
      this._btnsOpen = document.querySelectorAll(`.${id}`)

      Array.from(this._btnsOpen).forEach((node) =>
        node.addEventListener('click', this.openWindow.bind(this))
      )
    }

    addHandlersShowToElements(elements) {
      this._btnsOpen = elements

      Array.from(this._btnsOpen).forEach((node) =>
        node.addEventListener('click', this.openWindow.bind(this))
      )
    }

    addHandlerUpdate(handler) {
      const cbUpdate = function () {
        const attr = []

        attr.Name =
          this.container.querySelector('.modal-signal-name').textContent
        attr.SignalType =
          this.container.querySelector('.modal-signal-type').textContent
        const selection =
          this._modalDeviceDropDown.model.items[
            this._modalDeviceDropDown.selected
          ]
        // attr.Device = selection === VIRTUAL_SIGNAL ? '' : selection
        if (selection !== VIRTUAL_SIGNAL) {
          attr.Device = selection
          attr.DeviceMap = this._modalMapInput.text
        } else {
          attr.Device = ''
        }
        handler(attr)
        this.toggleWindow()
      }

      this._btnUpdate.onclick = cbUpdate.bind(this)
    }

    openWindow(e) {
      const btn = e.target.closest('.btn-edit-signal')
      if (btn) {
        this.render(btn.dataset)
      }

      this.toggleWindow()
    }

    toggleWindow() {
      this._overlay.classList.toggle('hidden')
      this._window.classList.toggle('hidden')
    }

    updateSignal(attr) {
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
  }
})
