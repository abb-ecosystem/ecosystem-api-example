import API from '../api/index.js';
import { Input_A } from './t-components-input.js';
import { Popup_A } from './t-components-popup.js';

/**
 * @typedef TComponents.InputVariableProps
 * @prop {string} [variable] Rapid variable to subpscribe to
 * @prop {string} [module] Module containig the rapid variable
 * @prop {Function} [callback] Function to be called when button is pressed
 * @prop {string} [label] Label text
 * @prop {boolean} [readOnly] Set to true to use the input field only to display but no to edit values
 * @prop {string} [description] Label to be displayed under the input field when open the keyboard editor
 * @prop {boolean} [useBorder] if true, creates a border around the value
 */

/**
 * Input field connected to a RAPID variable
 * @class TComponents.InputVariable_A
 * @extends TComponents.Input_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.InputVariableProps} [props]
 * @example
 * // index.html
 * ...
 * &lt;div class="var-input"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const inVar = new TComponents.InputVariable_A(this.find('.var-input'), {
 *   module: this._module,
 *   variable: this._variableString,
 *   label: 'InputVariable_A (string)',
 * });
 * await inVar.render();
 */
export class InputVariable_A extends Input_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.InputVariableProps}
     */
    this._props;

    this.initPropsDep(['module', 'variable']);
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.InputVariable_A
   * @returns {TComponents.InputVariableProps}
   */
  defaultProps() {
    return {
      module: '',
      variable: '',
    };
  }

  async onInit() {
    // await super.onInit();

    if (!this._props.module || !this._props.variable) {
      this.error = true;
      return;
    }

    try {
      if (!this.task) this.task = await API.RAPID.getTask();
      this.varElement = await this.task.getVariable(this._props.module, this._props.variable);
      this.varElement.onChanged(this.cbUpdateInputField.bind(this));

      const value = await this.varElement.getValue();
      this.isArray = Array.isArray(value);

      this.text = this.isArray ? JSON.stringify(value) : value;
      // this._props.desciption || (this.description = `Variable type: ${this.varElement.type}`);
      if (this.varElement.type === 'num' || this.varElement.type === 'dnum')
        this.regex = this.isArray ? /^(\[.*\]|-?\d+(\.\d+)?)$/ : /^-?[0-9]+(\.[0-9]+)?$/;
      if (this.varElement.type === 'bool') this.regex = /^([Tt][Rr][Uu][Ee]|[Ff][Aa][Ll][Ss][Ee])$/;
    } catch (e) {
      this.error = true;
      Popup_A.error(e, 'TComponents.InputVariable_A.onInit');
    }
  }

  onRender() {
    super.onRender();
    this.container.classList.add('tc-input-variable');
  }

  /**
   * RAPID variable
   * @alias variable
   * @type {string}
   * @memberof TComponents.InputVariable_A
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
   * @memberof TComponents.InputVariable_A
   */
  get module() {
    return this._props.module;
  }

  set module(module) {
    this.setProps({ module });
  }

  /**
   * Callback function to update variable when input field state changes
   * @alias cbOnChange
   * @memberof TComponents.InputVariable_A
   * @async
   * @private
   */
  async cbOnChange(value) {
    try {
      if (!this.varElement) return;
      if (this.varElement.type === 'bool') {
        if (value.toLowerCase() === 'true') await this.varElement.setValue(true);
        else if (value.toLowerCase() === 'false') await this.varElement.setValue(false);
        else throw new Error('Boolean value not recognized');
      } else {
        await this.varElement.setValue(value);
      }
    } catch (e) {
      console.error(e);
      Popup_A.error(e, 'TComponents.InputVariable_A.cbOnChange');
    }
  }

  /**
   * Callback function to update input field when variable changes
   * @alias cbUpdateInputField
   * @memberof TComponents.InputVariable_A
   * @async
   * @private
   */
  async cbUpdateInputField(value) {
    this.text = this.isArray ? JSON.stringify(value) : value;
    this.trigger('change' + this.compId, value);
  }
}

InputVariable_A.loadCssClassFromString(/*css*/ `

.tc-input-variable {
  min-width: 6rem;
}

`);
