import { Component_A } from './t-components-component.js';

/**
 * @typedef TComponents.LevelmeterProps
 * @prop {number} [min] Minimum value of the levelmeter
 * @prop {number} [max] Maximum value of the levelmeter
 * @prop {string} [unit] Unit of the levelmeter value
 * @prop {number} [value] Initial value of the levelmeter
 * @prop {number} [width] Width of the levelmeter
 * @prop {string} [label] Label text
 */

/**
 * Levelmeter
 * @class TComponents.Levelmeter_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.LevelmeterProps} [props] - levelmeter properties (LevelmeterProps)
 * @example
 * // index.html
 * ...
 * &lt;div class="levelmeter-element"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const levelmeter = new Levelmeter_A(
 *    document.querySelector('.levelmeter-element'),
 *    {label: 'levelmeter '}
 *  );
 *  await levelmeter.render();
 */
export class Levelmeter_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.LevelmeterProps}
     */
    this._props;

    this._levelmeter = new FPComponents.Levelmeter_A();
    this._levelmeter.value = this._props.value;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Levelmeter_A
   * @returns {TComponents.LevelmeterProps}
   */
  defaultProps() {
    return {
      min: 0,
      max: 100,
      lim1: 100,
      lim2: 100,
      unit: '',
      value: 0,
      width: 200,
    };
  }

  onRender() {
    this._levelmeter.min = this._props.min;
    this._levelmeter.max = this._props.max;
    this._levelmeter.lim1 = this._props.lim1;
    this._levelmeter.lim2 = this._props.lim2;
    this._levelmeter.unit = this._props.unit;
    this._levelmeter.width = this._props.width;

    this._levelmeter.attachToElement(this.find('.tc-levelmeter'));
  }

  markup() {
    return /*html*/ `<div class="tc-levelmeter"></div>`;
  }
}

Levelmeter_A.loadCssClassFromString(/*css*/ `


`);
