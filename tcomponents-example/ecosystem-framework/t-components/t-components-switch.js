import { Component_A } from './t-components-component.js';

/**
 * @typedef TComponents.SwitchProps
 * @prop {string} [variant] Type of switch: 'checkbox', 'radio' or 'switch' (default = 'switch')
 * @prop {Function} [onChange] Function to be called when button is pressed
 *
 */

/**
 * Switch element. Additional callbacks can be added with the {@link TComponents.Switch_A#onClick|onChange} method.
 * @class TComponents.Switch_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.SwitchProps} props
 * @property {SwitchProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="switch-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 *  const switch = new Switch_A(document.querySelector('.switch-container'), {
 *     onChange: () => {
 *       console.log('switch was toggled');
 *     },
 *     label: 'Toggle',
 *   });
 *  await switch.render();
 */
export class Switch_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SwitchProps}
     */
    this._props;

    this._switch = new FPComponents.Switch_A();
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Switch_A
   * @returns {TComponents.SwitchProps}
   */
  defaultProps() {
    return { onChange: null, variant: 'switch' };
  }

  onInit() {
    if (this._props.onChange) this.onChange(this._props.onChange);

    if (this._props.variant === 'checkbox' && !(this._switch instanceof FPComponents.Checkbox_A)) {
      this._switch = this._switchComponent(this._switch, FPComponents.Checkbox_A);
    } else if (this._props.variant === 'radio' && !(this._switch instanceof FPComponents.Radio_A)) {
      this._switch = this._switchComponent(this._switch, FPComponents.Radio_A);
    } else if (this._props.variant === 'switch' && !(this._switch instanceof FPComponents.Switch_A)) {
      this._switch = this._switchComponent(this._switch, FPComponents.Switch_A);
    }
    // in case the fp-component changed, lets update its enabled status
    this.enabled = this.enabled;

    switch (this._props.variant) {
      case 'checkbox':
      case 'radio':
        this._switch.onclick = this.cbOnChange.bind(this);
        break;
      case 'switch':
        this._switch.onchange = this.cbOnChange.bind(this);
        break;
      default:
        break;
    }
  }

  _switchComponent(oldComponent, newComponentConstructor) {
    const active = oldComponent.active || oldComponent.checked;
    const scale = oldComponent.scale;
    oldComponent.onchange = null;
    oldComponent.onclick = null;
    const newComponent = new newComponentConstructor();
    newComponent.active = active;
    newComponent.scale = scale;

    return newComponent;
  }

  onRender() {
    // this._switch.desc = this._props.label;

    this._switch.attachToElement(this.find('.tc-switch'));
  }

  markup() {
    return /*html*/ `<div class="tc-switch"></div>`;
  }

  get propsEnums() {
    return { variant: ['checkbox', 'radio', 'switch'] };
  }

  /**
   * Switch status: true if active, false otherwise
   * @alias active
   * @type {boolean}
   * @memberof TComponents.Switch_A
   * @private
   */
  get active() {
    const status = this._props.variant === 'switch' ? this._switch.active : this._switch.checked;
    return status;
  }

  /**
   * @private
   */
  set active(value) {
    this._props.variant === 'switch' ? (this._switch.active = value) : (this._switch.checked = value);
  }

  /**
   * Set this attribute to change the visual scale of the component.
   * A value of 1.0 corresponds to the "normal" base size used by the FlexPendant shell.
   * A value of 1.3 means 30% larger, 2.0 double the size, and so on.
   * @alias scale
   * @type {Number}
   * @memberof TComponents.Switch_A
   * @private
   */
  get scale() {
    return this._switch.scale;
  }

  /**
   * @private
   */
  set scale(value) {
    this._switch.scale = value;
  }

  /**
   * Adds a callback funciton to the component. This will be called after the button is pressed and released
   * @alias onChange
   * @memberof TComponents.Switch_A
   * @param   {Function}  func    The callback function which is called when the button is pressed
   */
  onChange(func) {
    this.on('change', func);
  }

  /**
   * Callback function which is called when the button is pressed, it trigger any function registered with {@link onChange() onChange}
   * @alias cbOnChange
   * @memberof TComponents.Switch_A
   * @param   {any}  value
   * @private
   * @async
   */
  async cbOnChange(value) {
    this.trigger('change', value);
  }
}
