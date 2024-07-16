import API from '../api/index.js';
import { Slider_A } from './t-components-slider.js';
import { Popup_A } from './t-components-popup.js';

/**
 * @typedef TComponents.SliderVariableProps
 * @prop {string} [task] RAPID Task in which the variable is contained (default = "T_ROB1" )
 * @prop {string} [variable] Rapid variable to subpscribe to
 * @prop {string} [module] Module containig the rapid variable
 * @prop {number} [min] Minimum value of the slider
 * @prop {number} [max] Maximum value of the slider
 * @prop {string} [unit] Unit of the slider value
 * @prop {number} [value] Initial value of the slider
 * @prop {number} [step] Step of the slider
 * @prop {number} [numberOfDecimals] Number of decimals to display
 * @prop {boolean} [displayLabel] Display label
 * @prop {boolean} [displayValue] Display value
 * @prop {boolean} [displayTicks] Display ticks
 * @prop {Function} [onChange] Function to be called when button is pressed
 * @prop {Function} [onDrag] Function to be called when slider is dragged
 * @prop {Function} [onRelease] Function to be called when slider is released
 * @prop {number} [width] Width of the slider
 * @prop {string} [label] Label text
 */

/**
 * Slider connected to a rapid variable
 * @class TComponents.SliderVariable_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.SliderVariableProps} [props] - slider properties (SliderVariableProps)
 * @example
 * // index.html
 * ...
 * &lt;div class="slider-element"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const slider = new SliderVariable_A(
 *    document.querySelector('.slider-element'),
 *    {label: 'slider '}
 *  );
 *  await slider.render();
 */
export class SliderVariable_A extends Slider_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SliderVariableProps}
     */
    this._props;

    this.initPropsDep(['task', 'module', 'variable']);
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SliderVariable_A
   * @returns {TComponents.SliderVariableProps}
   */
  defaultProps() {
    return {
      task: 'T_ROB1',
      module: '',
      variable: '',
      onChange: null,
    };
  }

  async onInit() {
    if (!this._props.module || !this._props.variable) {
      this.error = true;
      return;
    }

    if (this._props.onChange) this.on('change', this._props.onChange);

    try {
      this.task = await API.RAPID.getTask(this._props.task);
      this.varElement = await this.task.getVariable(this._props.module, this._props.variable);
      this.varElement.onChanged(this.cbUpdateSlider.bind(this));

      const value = await this.varElement.getValue();

      if ((this.varElement.type !== 'num' && this.varElement.type !== 'dnum') || Array.isArray(value)) {
        this.varElement = null;
        throw new Error(`Variable ${this._props.variable} is not a number or is an array of numbers`);
      }

      this._slider.value = value;
    } catch (e) {
      this.error = true;
      Popup_A.error(e, 'TComponents.SliderVariable_A.onInit');
    }
  }

  /**
   * RAPID variable
   * @alias variable
   * @type {string}
   * @memberof TComponents.SliderVariable_A
   */
  get variable() {
    return this._props.variable;
  }

  set variable(variable) {
    this.setProps({ variable });
  }

  /**
   * RAPID module
   * @alias module
   * @type {string}
   * @memberof TComponents.SliderVariable_A
   */
  get module() {
    return this._props.module;
  }

  set module(module) {
    this.setProps({ module });
  }

  /**
   * Callback function to update variable when slider state changes
   * @alias cbOnRelease
   * @memberof TComponents.SliderVariable_A
   * @async
   * @private
   */
  async cbOnRelease(value) {
    try {
      if (!this.varElement) return;

      await this.varElement.setValue(value);
      this.trigger('release', value);
    } catch (e) {
      console.error(e);
      Popup_A.error(e, 'TComponents.SliderVariable_A.cbOnRelease');
    }
  }

  /**
   * Callback function to update slider when variable changes
   * @alias cbUpdateSlider
   * @memberof TComponents.SliderVariable_A
   * @async
   * @private
   */
  async cbUpdateSlider(value) {
    this._slider.value = value;
    this.trigger('change', value);
  }
}

// SliderVariable_A.loadCssClassFromString(/*css*/ `

// `);
