import API from '../api/index.js';
import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';
import { SelectorEthernetIPDevices_A } from './t-components-selectorsethernetip.js';

/**
 * @typedef TComponents.SignalEditProps
 * @prop {string | object} signal - Signal name, or API.CONFIG.SIGNAL.Signal object
 */

/**
 * Signal editor (normaly used together with the {@link TComponents.ModalWindow_A} and {@link TComponents.SignalView_A} components)
 * @class TComponents.SignalEdit_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.SignalEditProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="signal-container"&gt;&lt;/div&gt;
 * &lt;div class="edit-signal"&gt;&lt;/div&gt;
 * &lt;div class="modal-window"&gt;&lt;/div&gt;

 * ...
 *
 * // index.js
 * const signal = new SignalView_A(
 *    document.querySelector('.signal-container'),
 *    {
 *      signal: 'signal_name',
 *      control: true,
 *      edit: true
 *    }
 *  );
 *  await signal.render();
 *
 * const editSignal = new SignalEdit_A(
 *   document.querySelector('.edit-signal'),
 *   { signal: 'di_signal' }
 * );
 *
 * // Modal window will contain the signal editor
 * const modalWindow =  new ModalWindow_A(
 *   document.querySelector('.modal-window'),
 *   {content: editSignal}
 * );
 * await modalWindow.render();
 *
 * // In order to connect the signal to the modal window
 * // this is automatically forwarded to the signal editor
 * modalWindow.triggerElements(signal.getEditButton())
 * @see TComponents.SignalView_A
 * @see TComponents.ModalWindow_A
 */
export class SignalEdit_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SignalEditProps}
     */
    this._props;

    this.initPropsDep('signal');
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SignalEdit_A
   * @returns {TComponents.SignalEditProps}
   */
  defaultProps() {
    return { signal: null };
  }

  async onInit() {
    try {
      this._signal = typeof this._props.signal === 'string' ? await API.SIGNAL.getSignal(this._props.signal) : this._props.signal;
    } catch (e) {
      Popup_A.error(e);
    }

    this._btnUpdate = new FPComponents.Button_A();
    this._btnUpdate.text = 'update';
    this._btnUpdate.highlight = true;
    this._inputMap = new FPComponents.Input_A();
    this._inputMap.regex = /^-?[0-9]+(\.[0-9]+)?$/;
    this._inputMap.onchange = this.cbOnChange.bind(this);

    await this.setSignal(this._signal);
    this.devices = await API.DEVICE.searchEthernetIPDevices();
    this.devices.push('');
  }

  mapComponents() {
    return {
      _ddDevice: new SelectorEthernetIPDevices_A(this.find('.modal-signal-device')),
    };
  }

  onRender() {
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

  markup() {
    return /*html*/ `
        <form id="edit" class="modal-content">
          <div class="tc-row">
            <div class="tc-cols-4"><h4> Signal Name</h4></div>
            <div class="tc-cols-4"><h4>Type</h4></div>
            <div class="tc-cols-4"><h4>Device</h4></div>
            <div class="tc-cols-4"><h4>Map</h4></div>
          </div>
          <div class="flex-row ">
            <div class="tc-cols-4"><p class="modal-signal-name">${this._data.name}</p></div>
            <div class="tc-cols-4"><p class="modal-signal-type">${this._data.type}</p></div>
            <div class="tc-cols-4"><div class="modal-signal-device"></div></div>
            <div class="tc-cols-4"><div class="modal-signal-map"></div></div>
          </div>
          <h3 class="modal-warning"></h3>
          <div class="flex-row justify-end">
            <div class="modal-signal-update tc-ok"></div>
          </div>

        </form>
       `;
  }

  /**
   * Prop: signal - Signal name, or API.CONFIG.SIGNAL.Signal object
   * @alias signal
   * @type {string | object}
   * @memberof TComponents.SignalEdit_ASignalEdit_A
   */
  get signal() {
    return this._props.signal;
  }

  set signal(signal) {
    this.setProps({ signal });
  }

  /**
   * Add a external handler function that may require to be updated after signal configuration change
   * @alias onUpdate
   * @param {Function} handler
   * @memberof TComponents.SignalEdit_A
   */
  onUpdate(handler) {
    const cbUpdate = async function () {
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
      const signal = await API.SIGNAL.searchByName(attr.Name);
      await signal.updateSignalAttributes(attr);

      handler(attr);
    };

    this._btnUpdate.onclick = cbUpdate.bind(this);
  }

  async handleUpdateButton(attr) {
    let found = null;
    try {
      found = await API.DEVICE.find({ device: attr.device, map: attr.map, type: attr.type });
      if (found) {
        this._btnUpdate.enabled = false;
        return found.name !== attr.name ? `Device "${attr.device}", Map "${attr.map}" already used by "${found.name}"` : null;
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
      name: this._data.name,
      type: this._data.type,
      map: this._inputMap.text,
      device: this.child._ddDevice.selected,
    };

    const response = await this.handleUpdateButton(attr);

    if (!response) return;
    // if the update was unsuccessful, then restore old value
    this._warning.textContent = response;
    this.child._ddDevice.selected = this._data.device;
  }

  async cbOnChange(text) {
    this._warning.textContent = '';

    const attr = {
      name: this._data.name,
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
    if (!s) {
      this._data = { name: '', type: '', device: '', map: '' };
    } else {
      if (typeof s === 'string') {
        s = await API.SIGNAL.getSignal(s);
      }

      this._data = {
        name: s.name,
        type: s.type,
        device: s.device,
        map: s.map,
      };
    }
    this._signal = s;
  }
}

SignalEdit_A.loadCssClassFromString(/*css*/ `

.tc-edit-signal-style {
  min-height: 35px !important;
  padding: 5px;
}

.modal-warning {
  height: 24px;
}

`);
