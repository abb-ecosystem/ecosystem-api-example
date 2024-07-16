import { Component_A } from './t-components-component.js';

/**
 * @typedef TComponents.CheckboxProps
 * @prop {Function} [onChange] Function to be called when button is pressed
 */

/**
 * Checkbox element. Additional callbacks can be added with the {@link TComponents.Checkbox_A#onClick|onChange} method.
 * @class TComponents.Checkbox_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.CheckboxProps} props
 * @property {CheckboxProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="checkbox-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 *  const checkbox = new Checkbox_A(document.querySelector('.checkbox-container'), {
 *     onChange: () => {
 *       console.log('checkbox was toggled');
 *     },
 *     label: 'Toggle',
 *   });
 *  await checkbox.render();
 */
export class Checkbox_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.CheckboxProps}
     */
    this._props;

    this._checkbox = new FPComponents.Checkbox_A();
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Checkbox_A
   * @returns {TComponents.CheckboxProps}
   */
  defaultProps() {
    return { onChange: null };
  }

  onRender() {
    // this._checkbox.desc = this._props.label;
    this._checkbox.onchange = this.cbOnChange.bind(this);
    if (this._props.onChange) this.onChange(this._props.onChange);
    this._checkbox.attachToElement(this.find('.tc-checkbox'));
  }

  markup() {
    return /*html*/ `<div class="tc-checkbox"></div>`;
  }

  /**
   * Checkbox status: true if checked, false otherwise
   * @alias checked
   * @type {boolean}
   * @memberof TComponents.Checkbox_A
   * @private
   */
  get checked() {
    return this._checkbox.checked;
  }

  /**
   * @private
   */
  set checked(value) {
    this._checkbox.checked = value;
  }

  /**
   * Set this attribute to change the visual scale of the component.
   * A value of 1.0 corresponds to the "normal" base size used by the FlexPendant shell.
   * A value of 1.3 means 30% larger, 2.0 double the size, and so on.
   * @alias scale
   * @type {Number}
   * @memberof TComponents.Checkbox_A
   * @private
   */
  get scale() {
    return this._checkbox.scale;
  }

  /**
   * @private
   */
  set scale(value) {
    this._checkbox.scale = value;
  }

  /**
   * Adds a callback funciton to the component. This will be called after the button is pressed and released
   * @alias onChange
   * @memberof TComponents.Checkbox_A
   * @param   {Function}  func    The callback function which is called when the button is pressed
   */
  onChange(func) {
    this.on('change', func);
  }

  /**
   * Callback function which is called when the button is pressed, it trigger any function registered with {@link onChange() onChange}
   * @alias cbOnChange
   * @memberof TComponents.Checkbox_A
   * @param   {any}  value
   * @private
   * @async
   */
  async cbOnChange(value) {
    this.trigger('change', value);
  }
}
