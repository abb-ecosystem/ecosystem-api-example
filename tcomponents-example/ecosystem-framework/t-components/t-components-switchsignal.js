import API from '../api/index.js';
import { Switch_A } from './t-components-switch.js';
import { Popup_A } from './t-components-popup.js';

/**
 * @typedef TComponents.SwitchSignalProps
 * @prop {string | object} signal - Signal name, or API.CONFIG.SIGNAL.Signal object
 * @prop {Function} [callback] Function to be called when button is pressed
 * @prop {string} [label] Label text
 * @todo Update the signal type with API interface
 */

/**
 * Creates an instance of a switch connected to a signal
 * @class TComponents.SwitchSignal_A
 * @extends TComponents.Switch_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.SwitchSignalProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="signal-switch"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const switchSignal = new TComponents.SwitchSignal_A(document.querySelector('.signal-switch'), {
 *   signal: this._signal,
 *   label: 'DI Is Gripper Closed',
 * }),
 * switchSignal.render();
 */
export class SwitchSignal_A extends Switch_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SwitchSignalProps}
     */
    this._props;

    this.initPropsDep('signal');
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SwitchSignal_A
   * @returns {TComponents.SwitchSignalProps}
   */
  defaultProps() {
    return { signal: '' };
  }

  async onInit() {
    if (!this._props.signal) {
      this.error = true;
      return;
    }

    try {
      this._signal =
        typeof this._props.signal === 'string' ? await API.SIGNAL.getSignal(this._props.signal) : this._props.signal;
      this._switch.active = await this._signal.getValue();
      this._signal.onChanged(this.cbUpdateSwitch.bind(this));
      this._signal.subscribe();
    } catch (e) {
      console.error(e);
      Popup_A.error(e, `TComponent.SwitchSignal - signal ${this._signal.name}`);
    }

    // this._switch.onchange = this.cbOnChange.bind(this);
  }

  async cbUpdateSwitch(value) {
    value ? (this._switch.active = true) : (this._switch.active = false);
  }

  async cbOnChange(value) {
    try {
      this._switch.active ? await this._signal.setValue(1) : await this._signal.setValue(0);
    } catch (e) {
      console.error(e);
      Popup_A.error(e);
    }
  }

  /**
   * Prop: signal - Signal name, or API.CONFIG.SIGNAL.Signal object
   * @alias signal
   * @type {string | object}
   * @memberof SwitchSignal_A
   */
  get signal() {
    return this._props.signal;
  }

  set signal(signal) {
    this.setProps({ signal });
  }
}
