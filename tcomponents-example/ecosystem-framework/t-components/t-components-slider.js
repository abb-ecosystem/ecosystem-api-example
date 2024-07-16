import { Component_A } from './t-components-component.js';

/**
 * @typedef TComponents.SliderProps
 * @prop {number} [min] Minimum value of the slider
 * @prop {number} [max] Maximum value of the slider
 * @prop {string} [unit] Unit of the slider value
 * @prop {number} [value] Initial value of the slider
 * @prop {number} [step] Step of the slider
 * @prop {number} [numberOfDecimals] Number of decimals to display
 * @prop {boolean} [displayLabel] Display label
 * @prop {boolean} [displayValue] Display value
 * @prop {boolean} [displayTicks] Display ticks
 *
 * @prop {Function} [onDrag] Function to be called when slider is dragged
 * @prop {Function} [onRelease] Function to be called when slider is released
 * @prop {number} [width] Width of the slider
 * @prop {string} [label] Label text
 */

/**
 * Slider
 * @class TComponents.Slider_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.SliderProps} [props] - slider properties (SliderProps)
 * @example
 * // index.html
 * ...
 * &lt;div class="slider-element"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const slider = new Slider_A(
 *    document.querySelector('.slider-element'),
 *    {label: 'slider '}
 *  );
 *  await slider.render();
 */
export class Slider_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SliderProps}
     */
    this._props;

    this._slider = new FPComponents.Slider_A();
    this._slider.value = this._props.value;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Slider_A
   * @returns {TComponents.SliderProps}
   */
  defaultProps() {
    return {
      min: 0,
      max: 100,
      unit: '',
      value: 0,
      step: 1,
      numberOfDecimals: 0,
      displayLabel: true,
      displayValue: true,
      displayTicks: false,
      onDrag: null,
      onRelease: null,
      width: 200,
    };
  }

  async onInit() {}

  onRender() {
    this._slider.min = this._props.min;
    this._slider.max = this._props.max;
    this._slider.unit = this._props.unit;
    this._slider.tickStep = this._props.step;
    this._slider.numberOfDecimals = this._props.numberOfDecimals;
    this._slider.displayLabel = this._props.displayLabel;
    this._slider.displayValue = this._props.displayValue;
    this._slider.displayTicks = this._props.displayTicks;
    this._slider.width = this._props.width;

    this._slider.ondrag = this.cbOnDrag.bind(this);
    this._slider.onrelease = this.cbOnRelease.bind(this);

    this._slider.attachToElement(this.find('.tc-slider'));
  }

  markup() {
    return /*html*/ `<div class="tc-slider"></div>`;
  }

  /**
   * Registers a callback function to be called when the slider is being dragged.
   *
   * @param {Function} func - The callback function to be called when the slider is being dragged.
   */
  onDrag(func) {
    this.on('drag', func);
  }

  /**
   * Registers a callback function to be executed when the slider is released.
   *
   * @param {Function} func - The callback function to be executed.
   * @returns {void}
   */
  onRelease(func) {
    this.on('release', func);
  }

  /**
   * Callback function which is called when the button is pressed, it trigger any function registered with {@link onDrag() onDrag}
   * @alias cbOnDrag
   * @memberof TComponents.Slider_A
   * @param   {any}  value
   * @private
   * @async
   */
  cbOnDrag(value) {
    this.trigger('drag', value);
  }

  /**
   * Callback function which is called when the button is pressed, it trigger any function registered with {@link onRelease() onRelease}
   * @alias cbOnRelease
   * @memberof TComponents.Slider_A
   * @param   {any}  value
   * @private
   * @async
   */
  cbOnRelease(value) {
    this.trigger('release', value);
  }
}

Slider_A.loadCssClassFromString(/*css*/ `


`);
