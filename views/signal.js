define(function () {
  return class Signal {
    constructor(container, signal) {
      this.container = container
      this._signal = signal
      this.id = `signal-${this._signal.name}`
      this.init()
    }

    init() {
      this._indicator = new FPComponents.Digital_A()
      this._edit = new FPComponents.Button_A()

      this._edit.text = 'edit'
      this._signal.modified ? (this.modified = true) : (this.modified = false)

      const cbUpdateIndicator = function (value) {
        this._indicator.active = value
      }
      if (this._signal.active)
        this._signal.addCallbackOnChanged(cbUpdateIndicator.bind(this))

      const cbOnClick = async function () {
        this._indicator.active = !this._indicator.active
        this._indicator.active
          ? (this._signal.value = 1)
          : (this._signal.value = 0)
      }

      this._indicator.onclick = cbOnClick.bind(this)

      this.render()
    }

    render() {
      this.container.innerHTML = Signal.markup(this)

      this._indicator.attachToElement(
        this.container.querySelector(`.${this.id}-ind`)
      )

      this._edit.attachToElement(
        this.container.querySelector(`.${this.id}-edit`)
      )

      this._device = this.container.querySelector(`.${this.id}-device`)
      this._btnEdit = this.container.querySelector(`.${this.id}-edit`)
      this._FPCompAttached = true
      this._msg = this.container
        .querySelector(`.${this.id}`)
        .querySelector('.message')
      this.modified
        ? this._msg.classList.add('warning')
        : this._msg.classList.remove('warning')
    }

    static markup(signal_view) {
      return `
    <div class="row">
      <div class="col-1">
        <div class="${signal_view.id} digital-signal">
          <div class="row">
            <div class="cols-2">
              <div class="row">
                <div class="cols-3">
                  <p class="${signal_view.id}-ind"></p></div>
                    <div class="cols-2"><p class="message">${
                      signal_view._signal.name
                    }</p>
                  </div>
                </div>
              </div>
              <div class="cols-2">
                <div class="row">
                  <div class="cols-2">
                    <p class="${signal_view.id}-device">${
        signal_view._signal.device ? signal_view._signal.device : ''
      }: ${signal_view._signal.map ? signal_view._signal.map : ''}</p>
                  </div>
                  <div class="cols-2 left">
                    <div class="${signal_view.id}-edit btn btn-edit-signal"
                      data-name="${signal_view._signal.name}"
                      data-type="${signal_view._signal.type}"
                      data-device="${
                        signal_view._signal.device
                          ? signal_view._signal.device
                          : ''
                      }"
                      data-map="${
                        signal_view._signal.map ? signal_view._signal.map : ''
                      }">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
    }

    // addHandlerIndicator(handler) {
    //   const cbOnClick = async function () {
    //     let value = this._indicator.active ? 0 : 1
    //     // this._indicator.active = setValue;

    //     handler(this._signal.name, value)
    //   }

    //   this._indicator.onclick = cbOnClick.bind(this)
    // }

    // callbackOnChanged(value) {
    //   this._indicator.active = value
    // }

    // updateIndicator(value) {
    //   this._indicator.active = value
    // }

    updateAttributes(attr) {
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
  }
})
