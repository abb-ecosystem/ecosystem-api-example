import API from '../api/index.js';
import { Switch_A } from './t-components-switch.js';
import { Popup_A } from './t-components-popup.js';

/**
 * @typedef TComponents.SwitchVariableProps
 * @prop {string} [variable] - Rapid variable to subpscribe to
 * @prop {string} [module] - Module containig the rapid variable
 * @prop {Function} [callback] Function to be called when button is pressed
 * @prop {string} [label] Label text
 */

/**
 * Switch connected to a RAPID variable. The variable must be of type boolean, otherwise an Error is thrown during initialization.
 * @class TComponents.SwitchVariable_A
 * @extends TComponents.Switch_A
 * @param {HTMLElement} parent DOM element in which this component is to be inserted
 * @param {TComponents.SwitchVariableProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="var-switch-bool"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const switchVar = new TComponents.SwitchVariable_A(document.querySelector('.var-switch-bool'), {
 *   module: this._module,
 *   variable: this._variableBool,
 *   label: 'SwitchVariable_A',
 *   onChange: () => {
 *     console.log('SwitchVariable_A changed...');
 *   },
 * });
 * await switchVar.render();
 */
export class SwitchVariable_A extends Switch_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SwitchVariableProps}
     */
    this._props;

    this.initPropsDep(['variable', 'module']);
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SwitchVariable_A
   * @returns {TComponents.SwitchVariableProps}
   */
  defaultProps() {
    return { variable: '', module: '' };
  }

  async onInit() {
    if (!this._props.module || !this._props.variable) {
      this.error = true;
      return;
    }

    try {
      if (!this.task) this.task = await API.RAPID.getTask();
      this.varElement = await this.task.getVariable(this._props.module, this._props.variable);

      this.varElement.onChanged(this.cbUpdateSwitch.bind(this));
      this._switch.active = await this.varElement.getValue();

      if (this.varElement.type !== 'bool') throw new Error(`TComponents.SwitchVariable_A : ${this._props.variable} is not a bool variable`);
    } catch (e) {
      this.error = true;
      Popup_A.error(e);
    }
  }

  /**
   * RAPID variable
   * @alias variable
   * @type {string}
   * @memberof TComponents.SwitchVariable_A
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
   * @memberof TComponents.SwitchVariable_A
   */
  get module() {
    return this._props.module;
  }

  set module(module) {
    this.setProps({ module });
  }

  /**
   * Callback function to update variable when switch state changes
   * @alias cbOnChange
   * @memberof TComponents.SwitchVariable_A
   * @async
   * @private
   */
  async cbOnChange(value) {
    try {
      await this.varElement.setValue(value);
    } catch (e) {
      console.error(e);
      Popup_A.danger('SwitchVariable_A.cbOnChange', [e.message, e.description]);
    }
  }

  /**
   * Callback function to update switch when variable changes
   * @alias cbUpdateSwitch
   * @memberof TComponents.SwitchVariable_A
   * @async
   * @private
   */
  cbUpdateSwitch(value) {
    this._switch.active = value;
    this.trigger('change', value);
  }
}
