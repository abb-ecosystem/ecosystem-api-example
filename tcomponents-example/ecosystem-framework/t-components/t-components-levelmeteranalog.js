import { Levelmeter_A } from './t-components-levelmeter.js';

/**
 * @typedef TComponents.LevelmeterAnalogProps
 * @prop {string} [signal] Analog Signal name
 * @prop {number} [min] Minimum value of the levelmeter
 * @prop {number} [max] Maximum value of the levelmeter
 * @prop {string} [unit] Unit of the levelmeter value
 * @prop {number} [value] Initial value of the levelmeter
 * @prop {number} [width] Width of the levelmeter
 * @prop {string} [label] Label text
 */

/**
 * Levelmeter
 * @class TComponents.LevelmeterAnalog_A
 * @extends TComponents.Levelmeter_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.LevelmeterAnalogProps} [props] - levelmeter properties (LevelmeterAnalogProps)
 * @example
 * // index.html
 * ...
 * &lt;div class="levelmeter-element"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const levelmeter = new LevelmeterAnalog_A(
 *    document.querySelector('.levelmeter-element'),
 *    {label: 'levelmeter '}
 *  );
 *  await levelmeter.render();
 */
export class LevelmeterAnalog_A extends Levelmeter_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.LevelmeterAnalogProps}
     */
    this._props;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.LevelmeterAnalog_A
   * @returns {TComponents.LevelmeterAnalogProps}
   */
  defaultProps() {
    return {
      signal: '',
    };
  }

  async onInit() {
    super.onInit();
    if (!this._props.signal) {
      this.error = true;
      return;
    }

    try {
      this._signal =
        typeof this._props.signal === 'string' ? await API.SIGNAL.getSignal(this._props.signal) : this._props.signal;

      if (this._signal && this._signal.type !== 'analog') {
        this._slider.active = await this._signal.getValue();
        this._signal.onChanged(this.cbUpdateLevemeter.bind(this));
        this._signal.subscribe();
      } else {
        throw new Error(`Signal ${this._props.signal} either not found or is not analog`);
      }
    } catch (e) {
      console.error(e);
      Popup_A.error(e, `TComponent.LevemeterAnalog_A - signal ${this._signal.name}`);
    }
  }

  async cbUpdateLevemeter(value) {
    this._levelmeter.value = value;
  }
}

// LevelmeterAnalog_A.loadCssClassFromString(/*css*/ `

// `);
