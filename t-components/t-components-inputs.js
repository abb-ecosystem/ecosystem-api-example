'use strict';
import { Base_A } from './t-components-base.js';
import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';

/**
 * @typedef TComponents.InputProps
 * @prop {Function} [callback] Function to be called when button is pressed
 * @prop {string} [label] Label text
 * @prop {boolean} [readOnly] Set to true to use the input field only to display but no to edit values
 * @prop {string} [description] Label to be displayed under the input field when open the keyboard editor
 * @prop {boolean} [useBorder] if true, creates a border around the value
 */

/**
 * Input field
 * @class TComponents.Input_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.InputProps} [props] - label text
 * @example
 * // index.html
 * ...
 * &lt;div class="input-field"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const inputField = new Input_A(
 *    document.querySelector('.input-field'),
 *    {label: 'Input field '}
 *  );
 *  await inputField.render();
 */
export class Input_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.InputProps}
     */
    this._props;

    this._inputField = new FPComponents.Input_A();
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Input_A
   * @returns {TComponents.InputProps}
   */
  defaultProps() {
    return {
      readOnly: false,
      description: '',
      useBorder: true,
    };
  }

  async onInit() {}

  onRender() {
    this._inputField.label = this._props.description;
    this._props.readOnly || (this._inputField.onchange = this.cbOnChange.bind(this));
    if (this._props.callback) this.onChange(this._props.callback);
    this._inputField.attachToElement(this.container);

    if (this._props.readOnly) {
      const el = this.container.querySelector('.fp-components-input');
      el.onclick = null;
    }
    if (!this._props.useBorder) {
      const el = this.container.querySelector('.fp-components-input');
      el.style.borderStyle = 'none';
    }
  }

  /**
   * This attribute represents the text content of the input field.
   * It can be read to get the current content. Setting it will programmatically
   * update the content and will not trigger the onchange callback function
   * to be called.
   * @alias text
   * @type {string}
   * @memberof TComponents.Input_A
   */
  get text() {
    return this._inputField.text;
  }

  /**
   * @private
   */
  set text(text) {
    this._inputField.text = text;
  }

  /**
   * Descriptive label string that will be visible below the editor field
   * on the keyboard when the input field is being edited.
   * Should describe the value that the user is editing, preferably
   * including any input limitations.
   * @alias description
   * @type {string}
   * @memberof TComponents.Input_A
   */
  get description() {
    return this._inputField.label;
  }

  /**
   * @private
   */
  set description(text) {
    this._inputField.label = text;
  }

  /**
   * A callback function that will execute whenever the user is altering one or more characters in the keyboard’s editable field.
   * The function signature should be:
   * <br>&emsp; function (val)
   * The val argument will be the current value (string) as it is being edited by the user. The callback function should return true when the value is acceptable and false when not acceptable.
   * Default value is null.
   * Can be used in combination with the regex argument.
   * Note that if the text of the input field is set programmatically using the text attribute, this input restriction does not apply.
   * @alias validator
   * @type {Function}
   * @memberof TComponents.Input_A
   */
  get validator() {
    return this._inputField.validator;
  }

  set validator(func) {
    this._inputField.validator = func;
  }

  /**
   * Initial keyboard variant to be shown. Possible values are FP_COMPONENTS_KEYBOARD_ALPHA or FP_COMPONENTS_KEYBOARD_NUM.
   * Default value is null.
   * @note This property is currently ignored and will not affect the appearance of the keyboard. This is due to limitations in built-in touch keyboard. It is possible that it will work in a future release.
   * @alias variant
   * @type {Number}
   * @memberof TComponents.Input_A
   */
  get variant() {
    return this._inputField.variant;
  }

  set variant(value) {
    this._inputField.variant = value;
  }

  /**
   * Type: Regular expression object
   * Standard JavaScript regular expression object used for validating and allowing the input.
   * Example:
   * <br>&emsp;myInput.regex = /^-?[0-9]+(\.[0-9]+)?$/;
   * will only allow input of floating-point numbers or integers.
   * Default value is null.
   * Can be used in combination with the validator argument.
   * Note that if the text of the input field is set programmatically using the text attribute, this input restriction does not apply.
   * @alias regex
   * @type {RegExp}
   * @memberof TComponents.Input_A
   */
  get regex() {
    return this._inputField.regex;
  }

  set regex(regexp) {
    this._inputField.regex = regexp;
  }

  /**
   * Adds a callback function that will be called when the RAPID variable value changes
   * @alias onChange
   * @memberof TComponents.Input_A
   * @param {function} func
   */
  onChange(func) {
    this.on('change', func);
  }

  /**
   * Callback function which is called when the button is pressed, it trigger any function registered with {@link onChange() onChange}
   * @alias cbOnChange
   * @memberof TComponents.Input_A
   * @param   {any}  value
   * @private
   * @async
   */
  async cbOnChange(value) {
    this.trigger('change', value);
  }
}

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

    this.initPropsDependencies = ['module', 'variable'];
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
      this.text = await this.varElement.getValue();
      // this._props.desciption || (this.description = `Variable type: ${this.varElement.type}`);
      if (this.varElement.type === 'num' || this.varElement.type === 'dnum')
        this.regex = /^-?[0-9]+(\.[0-9]+)?$/;
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
   */
  async cbOnChange(value) {
    try {
      if (!this.varElement) return;
      if (this.varElement.type === 'bool') {
        if (value.toLowerCase() === 'true') await this.varElement.setValue(true);
        else if (value.toLowerCase() === 'false') await this.varElement.setValue(false);
        else throw new Error('Boolean value not recognized');
      } else await this.varElement.setValue(value);
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
   */
  async cbUpdateInputField(value) {
    this.text = value;
    this.trigger('change' + this._compId, value);
  }
}

var tComponentStyle = document.createElement('style');
tComponentStyle.innerHTML = `

.tc-input-variable {
  min-width: 6rem;
}

`;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(tComponentStyle, ref);
