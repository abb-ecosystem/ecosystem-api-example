import API from '../api/index.js';
import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';
import { SignalIndicator_A } from './t-components-signalindicator.js';
import { SwitchSignal_A } from './t-components-switchsignal.js';

/**
 * @typedef TComponents.SignalViewProps
 * @prop {string | object} signal - Signal name, or API.CONFIG.SIGNAL.Signal object
 * @prop {boolean} [control] - To enable/disable the precense of a swith
 * @prop {boolean} [edit] - To enable/disable the editing button
 */

/**
 * Instance of a Signal view containing an indicator, signal information (name, type, device, map) and a optional connection to TComponents.SignalEdit_A component for editing the signal.
 * @class TComponents.SignalView_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.SignalViewProps} props
 *
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
 *   { signal: 'di_signal'}
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
 * @see TComponents.SignalEdit_A
 */
export class SignalView_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SignalViewProps}
     */
    this._props;

    this.initPropsDep('signal');

    this._id = `signal-view-${API.generateUUID()}`;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SignalView_A
   * @returns {TComponents.SignalViewProps}
   */
  defaultProps() {
    return { signal: '', control: false, edit: true };
  }

  async onInit() {
    if (!this._props.signal) {
      this.error = true;
      return;
    }

    try {
      this._signal = typeof this._props.signal === 'string' ? await API.SIGNAL.getSignal(this._props.signal) : this._props.signal;

      this._signal.modified ? (this.modified = true) : (this.modified = false);
    } catch (e) {
      this.error = true;
      Popup_A.error(e, 'SignalView_A');
    }
  }

  mapComponents() {
    const children = {
      indicator: new SignalIndicator_A(this.find(`.tc-signal-view-ind`), {
        signal: this._signal ? this._signal.name : '',
        readOnly: true,
      }),
    };

    if (this._props.control)
      children.switch = new SwitchSignal_A(this.find('.tc-signal-view-switch'), {
        signal: this._signal ? this._signal.name : '',
      });

    return children;
  }

  onRender() {
    this._props.edit ? this.find(`.tc-edit-btn`).classList.remove('tc-hidden') : this.find(`.tc-edit-btn`).classList.add('tc-hidden');

    this._device = this.find(`.tc-signal-view-device`);
    this._btnEdit = this.find(`.tc-edit-btn`);
    this._msg = this.find(`.${this._id}`).querySelector('.message');
    this.modified ? this._msg.classList.add('tc-warning') : this._msg.classList.remove('tc-warning');
  }

  /**
   * Generates the HTML definition corresponding to the component.
   * @param {TComponents.SignalView_A} self - The instance on which this method was called.
   * @returns {string}
   */
  markup({ _id, _signal }) {
    return /*html*/ `
          <div class="${_id} tc-container-row ">
            <div class="tc-signal-view-ind tc-signalview-ind tc-item"></div>
            <div class="tc-signal-view-switch tc-signalview-switch tc-item"></div>
            <p class="tc-signalview-name tc-item">${this._props.signal && _signal ? _signal.name : 'No signal detected'}</p>
            <p class="tc-signal-view-device tc-signalview-device tc-item message">${this._props.signal && _signal.device ? _signal.device : ''}</p>
            <p class="tc-signal-view-device tc-signalview-map tc-item message">${this._props.signal && _signal.map ? _signal.map : ''}</p>
            <button class="tc-signal-view-edit btn tc-edit-btn tc-edit-icon"
              data-name="${this._props.signal && _signal.name}"
              data-type="${this._props.signal && _signal.type}"
              data-device="${this._props.signal && _signal.device ? _signal.device : ''}"
              data-map="${this._props.signal && _signal.map ? _signal.map : ''}">
            </button>
          </div>
        `;
  }

  get name() {
    return this._signal.name;
  }

  get type() {
    return this._signal.type;
  }

  get device() {
    return this._signal.device;
  }

  get map() {
    return this._signal.map;
  }

  /**
   * Prop: signal - Signal name, or API.CONFIG.SIGNAL.Signal object
   * @alias signal
   * @type {string | object}
   * @memberof SignalView_A
   */
  get signal() {
    return this._props.signal;
  }

  set signal(signal) {
    this.setProps({ signal });
  }

  /**
   * Prop: control - Enable/disable the precense of a swith
   * @alias control
   * @type {boolean}
   * @memberof SignalView_A
   */
  get control() {
    return this._props.control;
  }

  set control(control) {
    this.setProps({ control });
  }

  /**
   * Prop: edit - Enable/disable the editing button
   * @alias edit
   * @type {boolean}
   * @memberof SignalView_A
   */
  get edit() {
    return this._props.edit;
  }

  set edit(edit) {
    this.setProps({ edit });
  }

  updateAttributes(attr) {
    this._device && (this._device.textContent = `${attr.Device ? attr.Device : ''}: ${attr.DeviceMap ? attr.DeviceMap : ''}`);

    if (this._btnEdit.dataset.device !== attr.Device || this._btnEdit.dataset.map !== attr.DeviceMap) {
      this.modified = true;
      // this._msg.classList.add('tc-warning');
      // this._device.classList.add('tc-warning');
      this.cssAddClass('this', 'tc-warning');
    } else {
      this.modified = false;
      // this._msg.classList.remove('tc-warning');
      // this._device.classList.remove('tc-warning');
      this.cssRemoveClass('this', 'tc-warning');
    }
  }

  /**
   * Provides the edit button element. Then it is possible to add an event listener for triggering the edit window).
   * The signal information will be passed as data-set of this button element
   * @returns {HTMLElement} - Button element
   */
  getEditButton() {
    return this.find(`.tc-edit-btn`);
  }
}

SignalView_A.loadCssClassFromString(/*css*/ `

.tc-signalview-ind {
  width:2rem
}

.tc-signalview-switch {
  width:4rem
}
.tc-signalview-name {
  width:10rem
}
.tc-signalview-device {
  width:10rem
}
.tc-signalview-map {
  width:2rem
}

.tc-edit-btn {
  background-color: var(--t-color-GRAY-20);
  border: none;
  height: 40px;
  width: 40px;
  border-radius: 25%;
  margin-right: 4px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
}

.tc-edit-btn:hover,
.tc-edit-btn:active {
  background-color: var(--t-color-GRAY-40);
}

.tc-edit-btn:active {
  transform: scale(0.96, 0.96);
}

`);
