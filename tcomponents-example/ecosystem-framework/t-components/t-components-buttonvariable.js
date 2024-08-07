import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Button_A } from './t-components-button.js';

/**
 * @typedef TComponents.ButtonVariableProps
 * @prop {string} module RAPID module containig the variable
 * @prop {string} variable RAPID variable
 * @prop {string} [task] RAPID Task in which the variable is contained (default = "T_ROB1" )
 * @prop {function|null} [onClick] - Function to be called when button is pressed
 * @prop {string} [label] - label text
 * @prop {string|null} [icon] - Path to image file
 * @prop {string} [text] Button text
 */

/**
 * Creates a button that triggers registered callback functions and pass them the value of a RAPID variable
 * @class TComponents.ButtonVariable_A
 * @extends TComponents.Button_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.ButtonVariableProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="btn"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const upButton = await new ButtonVariable_A(
 *    document.querySelector('.btn'),{
 *    module: 'Wizard',
 *    variable: 'UpLimit',
 *    onClick: async function (value) {
 *      Set_Pos(value);
 *    },
 *    text: 'Up',
 *    }
 *  ).render();
 */
export class ButtonVariable_A extends Button_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonVariableProps}
     */
    this._props;

    this.initPropsDep(['module', 'variable']);
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonVariable_A
   * @returns {TComponents.ButtonVariableProps}
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
    try {
      if (!this._props.module || !this._props.variable) {
        this.error = true;
        return;
      }

      this.task = await API.RAPID.getTask(this._props.task);
      this.varElement = await API.RAPID.getVariable(this.task.name, this._props.module, this._props.variable);
      this.varElement.onChanged(this.cbOnChange.bind(this));

      if (this._props.onChange) this.on('change', this._props.onChange);
    } catch (e) {
      Popup_A.error(e, `TComponents.ButtonVariable_A onInit failed.`);
    }

    return () => {
      this.varElement.unsubscribe();
    };
  }

  /**
   * Callback function which is called when the button is pressed, it trigger any function registered with {@link onClick() onClick}
   * @alias cbOnClick
   * @memberof TComponents.ButtonVariable_A
   * @private
   * @async
   */
  async cbOnClick() {
    try {
      const var_value = await this.varElement.getValue();
      this.trigger('click', var_value);
    } catch (e) {
      Popup_A.error(e, 'ButtonVariable_A');
    }
  }

  async cbOnChange(value) {
    this.trigger('change', value);
  }

  /**
   * Registers a callback function to be called when the RAPID variable changes value.
   * @alias onChange
   * @memberof TComponents.ButtonVariable_A
   * @param {Function} cb - The callback function to be called.
   */
  onChange(cb) {
    this.on('change', cb);
  }
}
