import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Digital_A } from './t-components-digital.js';

/**
 * @typedef TComponents.SignalIndicatorProps
 * @prop {string | API.SIGNAL.Signal} [signal] Signal to connect. It can be either the name of the signal or an {@link API.SIGNAL.Signal} object
 * @prop {Function} [onChange] Callback called when the signal changes its state
 * @prop {boolean} [readOnly] If true (default), clicks on indicator does not change the state of the signal
 * @prop {Function} [callback] Function to be called when indicator is pressed
 * @prop {string} [label] Label text
 */

/**
 * @class TComponents.SignalIndicator_A
 * @extends TComponents.Digital_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.SignalIndicatorProps} [props]
 * @example
 * // index.html
 * ...
 *  &lt;div class="signal-indicator"&gt;&lt;/div&gt;
 * ...
 * // index.js
 * const signalIndicator = new TComponents.SignalIndicator_A(document.querySelector('.signal-indicator'), {
 *    signal: this._signal,
 *    readOnly: false,
 *    label: 'DI Is Gripper Closed',
 *    onChange: (value) => {
 *      console.log(`SignalIndicator callback onChange called -- value ${value}`);
 *    },
 *  });
 * await signalIndicator.render();
 */
export class SignalIndicator_A extends Digital_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SignalIndicatorProps}
     */
    this._props;

    this.initPropsDep('signal');
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SignalIndicator_A
   * @returns {TComponents.SignalIndicatorProps}
   */
  defaultProps() {
    return {
      signal: '',
      onChange: null,
      readOnly: true,
    };
  }

  async onInit() {
    if (!this._props.signal) {
      this.error = true;
      return;
    }

    try {
      this._signal = typeof this._props.signal === 'string' ? await API.SIGNAL.getSignal(this._props.signal) : this._props.signal;

      this._signal.onChanged(this.cbUpdateIndicator.bind(this));
      this._props.onChange && this.onChange(this._props.onChange);

      this._signal.subscribe();

      this.active = await this._signal.getValue();
    } catch (e) {
      Popup_A.error(e, 'TComponents.SignalIndicator_A');
    }
  }

  get signal() {
    return this._signal;
  }

  /**
   * Callback function which is called when the indicatoer is pressed, it trigger any function registered with {@link TComponents.Digital_A.onClick() onClick}
   * @alias cbOnClick
   * @memberof TComponents.SignalIndicator_A
   * @async
   * @private
   */
  async cbOnClick() {
    if (this._props.readOnly) return;

    const value = this.active;
    try {
      value ? await this._signal.setValue(false) : await this._signal.setValue(true);
    } catch (e) {
      console.error(e);
      Popup_A.error(e);
    }
    this.trigger('click', value);
  }

  /**
   * Adds a callback funciton to be called when the signal changes its state
   * @alias onChange
   * @memberof TComponents.SignalIndicator_A
   * @param   {Function}  func    The callback function which is called when the button is pressed
   */
  onChange(func) {
    this.on('change', func);
  }

  cbUpdateIndicator(value) {
    this.active = value;
    this.trigger('change', value);
  }
}
