import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Digital_A } from './t-components-digital.js';

/**
 * @typedef TComponents.IndicatorVariableProps
 * @prop {string} [task] RAPID Task in which the variable is contained (default = "T_ROB1" )
 * @prop {string} [variable] - Rapid variable to subpscribe to
 * @prop {string} [module] - Module containig the rapid variable
 * @prop {Function} [onChange] Callback called when the variable changes its state
 * @prop {boolean} [readOnly] If true (default), clicks on indicator does not change the state of the variable
 * @prop {string} [label] Label text
 */

/**
 * Connects a bool variable to a digital indicator
 * @class TComponents.IndicatorVariable_A
 * @extends TComponents.Digital_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.IndicatorVariableProps} [props]
 * @example
 * // index.html
 * ...
 *  &lt;div class="variable-indicator"&gt;&lt;/div&gt;
 * ...
 * // index.js
 * const variableIndicator = new TComponents.IndicatorVariable_A(document.querySelector('.variable-indicator'), {
 *    variable: 'myBoolVariable',
 *    readOnly: false,
 *    label: 'Is Gripper Closed',
 *    onChange: (value) => {
 *      console.log(`VariableIndicator callback onChange called -- value ${value}`);
 *    },
 *  });
 * await variableIndicator.render();
 */
export class IndicatorVariable_A extends Digital_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.IndicatorVariableProps}
     */
    this._props;

    this.initPropsDep(['task', 'module', 'variable']);
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.IndicatorVariable_A
   * @returns {TComponents.IndicatorVariableProps}
   */
  defaultProps() {
    return {
      task: 'T_ROB1',
      variable: '',
      module: '',
      onChange: null,
      readOnly: true,
    };
  }

  async onInit() {
    if (!this._props.module || !this._props.variable) {
      this.error = true;
      return;
    }

    try {
      this.task = await API.RAPID.getTask(this._props.task);
      this.varElement = await this.task.getVariable(this._props.module, this._props.variable);

      this.varElement.onChanged(this.cbUpdateIndicator.bind(this));
      this._props.onChange && this.onChange(this._props.onChange);

      if (this.varElement.type !== 'bool') {
        throw new Error(`TComponents.IndicatorVariable_A : ${this._props.variable} is not a bool variable`);
      }

      this.active = await this.varElement.getValue();
    } catch (e) {
      this.error = true;
      Popup_A.error(e);
    }
  }

  get variable() {
    return this._props.variable;
  }

  /**
   * Callback function which is called when the indicatoer is pressed, it trigger any function registered with {@link TComponents.Digital_A.onClick() onClick}
   * @alias cbOnClick
   * @memberof TComponents.IndicatorVariable_A
   * @async
   * @private
   */
  async cbOnClick() {
    if (this._props.readOnly) return;

    const value = this.active;
    try {
      if (!this.varElement) throw new Error('Variable not defined');

      value ? await this.varElement.setValue(false) : await this.varElement.setValue(true);
    } catch (e) {
      console.error(e);
      Popup_A.danger('IndicatorVariable_A', [e.message, e.description]);
    }
    this.trigger('click', value);
  }

  /**
   * Adds a callback funciton to be called when the variable changes its state
   * @alias onChange
   * @memberof TComponents.IndicatorVariable_A
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
