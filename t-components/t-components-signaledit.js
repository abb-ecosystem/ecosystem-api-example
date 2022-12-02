'use strict';
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('SignalEdit_A')) {
    /**
     * Signal editor (normaly used together with the {@link TComponents.ModalWindow_A} and {@link TComponents.SignalView_A} components)
     * @class TComponents.SignalEdit_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @param {string | object} signal - Signal name, or API.CONFIG.SIGNAL.Signal object
     * @example
     * const signal = new TComponents.SignalView_A(
     *    document.querySelector('.signal-container'),
     *    'signal_name',
     *    true, //hasSwitch
     *    true //hasEditButton
     *  );
     *  await signal.render();
     *
     * const editSignal = new TComponents.SignalEdit_A(
     *   document.querySelector('.edit-signal'),
     *   'di_signal'
     * );
     *
     * // Modal window will contain the signal editor
     * const modalWindow =  new TComponents.ModalWindow_A(
     *   document.querySelector('.modal-window'),
     *   editSignal
     * );
     * await modalWindow.render();
     *
     * // In order to connect the signal to the modal window
     * // this is automatically forwarded to the signal editor
     * modalWindow.triggerElements(signal.getEditButton())
     * @see TComponents.SignalView_A
     * @see TComponents.ModalWindow_A
     */
    o.SignalEdit_A = class SignalEdit extends TComponents.Component_A {
      constructor(container, signal = null) {
        super(container);
        this._signal = signal;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        await this.setSignal(this._signal);

        this._btnUpdate = new FPComponents.Button_A();
        this._btnUpdate.text = 'update';
        this._btnUpdate.highlight = true;
        this._inputMap = new FPComponents.Input_A();
        this._inputMap.regex = /^-?[0-9]+(\.[0-9]+)?$/;

        this.devices = await API.DEVICE.searchEthernetIPDevices();
        this.devices.push('');

        this._inputMap.onchange = this.cbOnChange.bind(this);
      }

      /**
       * Instantiation of TComponents sub-components that shall be initialized in a synchronous way.
       * All this components are then accessible within {@link onRender() onRender} method by using this.child.<component-instance>
       * @private
       * @returns {object} Contains all child TComponents instances used within the component.
       */
      mapComponents() {
        return {
          _ddDevice: new TComponents.Dropdown_A(this.find('.modal-signal-device')),
        };
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        this.child._ddDevice.items = this.devices;
        this.child._ddDevice.onSelection(this.cbOnSelection.bind(this));

        if (this._data) {
          this.child._ddDevice.selected = this._data.device;
          this._inputMap.text = this._data.map;
        }

        this._inputMap.attachToElement(this.find('.modal-signal-map'));
        const mapEl = this.find('.modal-signal-map');
        const fpEl = mapEl.querySelector('.fp-components-input');
        fpEl.classList.add('tc-edit-signal-style');

        this._btnUpdate.enabled = false;
        this._btnUpdate.attachToElement(this.find('.modal-signal-update'));
        this._warning = this.find('.modal-warning');
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup({ _data }) {
        return `
      <form id="edit" class="modal-content">
        <div class="tc-row">
          <div class="tc-cols-4"><h4> Signal Name</h4></div>
          <div class="tc-cols-4"><h4>Type</h4></div>
          <div class="tc-cols-4"><h4>Device</h4></div>
          <div class="tc-cols-4"><h4>Map</h4></div>
        </div>
        <div class="tc-row">
          <div class="tc-cols-4"><p class="modal-signal-name">${this._data.name}</p></div>
          <div class="tc-cols-4"><p class="modal-signal-type">${this._data.type}</p></div>
          <div class="tc-cols-4"><div class="modal-signal-device"></div></div>
          <div class="tc-cols-4"><div class="modal-signal-map tc-item"></div></div>
        </div>
        <div class="modal-signal-update tc-ok"></div>
        <h3 class="modal-warning"></h3>
      </form>
     `;
      }

      onUpdate(handler) {
        const cbUpdate = function () {
          /**
           * @var
           */
          const attr = [];

          attr.Name = this.find('.modal-signal-name').textContent;
          attr.SignalType = this.find('.modal-signal-type').textContent;
          const selection = this.child._ddDevice.selected;

          if (selection !== '') {
            attr.Device = selection;
            attr.DeviceMap = this._inputMap.text;
          } else {
            attr.Device = '';
          }
          handler(attr);
        };

        this._btnUpdate.onclick = cbUpdate.bind(this);
      }

      async handleUpdateButton(attr) {
        let found = false;
        try {
          found = await API.DEVICE.find(attr);
          if (found) {
            this._btnUpdate.enabled = false;
            return found.name !== attr.name
              ? `Device "${attr.device}", Map "${attr.map}" already used by "${found.name}"`
              : null;
          } else {
            this._btnUpdate.enabled = true;
            return null;
          }
        } catch (err) {
          console.error(err);
        }
        return;
      }

      async cbOnSelection(index, obj) {
        this._warning.textContent = '';

        const attr = {
          // name: this._data.name,
          type: this._data.type,
          map: this._inputMap.text,
          device: this.child._ddDevice.selected,
        };
        console.log('😮');
        console.log(attr);

        const response = await this.handleUpdateButton(attr);

        if (!response) return;
        // if the update was unsuccessful, then restore old value
        this._warning.textContent = response;
        this.child._ddDevice.selected = this._data.device;
      }

      async cbOnChange(text) {
        this._warning.textContent = '';

        const attr = {
          // name: this._data.name,
          type: this._data.type,
          map: text,
          device: this.child._ddDevice.selected,
        };
        const response = await this.handleUpdateButton(attr);

        if (!response) return;
        // if the update was unsuccessful, then restore old value
        this._warning.textContent = response;
        this._inputMap.text = this._data.map;
      }

      async setSignal(s) {
        if (typeof s === 'string') {
          s = await API.SIGNAL.getSignal(s);
          this._data = { name: s.name, type: s.type, device: s.device, map: s.map };
        } else if (s !== null && typeof s === 'object' && s.constructor.name === 'Signal') {
          this._data = {
            name: signal.name,
            type: signal.type,
            device: signal.device,
            map: signal.map,
          };
        } else {
          this._data = { name: '', type: '', device: '', map: '' };
        }
        this._signal = s;
      }
    };
  }
})(TComponents);

var tComponentStyle = document.createElement('style');
tComponentStyle.innerHTML = `

.tc-edit-signal-style {
  min-height: 35px !important;
  padding: 5px;
}

`;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(tComponentStyle, ref);
