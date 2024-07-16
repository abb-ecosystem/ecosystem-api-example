import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Button_A } from './t-components-button.js';

/**
 * @typedef TComponents.ButtonBoolProps
 * @prop {string} module RAPID module containig the variable
 * @prop {string} boolVariable RAPID variable
 * @prop {string} [task] RAPID Task in which the variable is contained (default = "T_ROB1" )
 * @prop {function|null} [onClick] - Function to be called when button is pressed
 * @prop {function|null} [onChange] - Function to be called when the variable value changes
 * @prop {string} [label] - label text
 * @prop {string|null} [icon] - Path to image file
 * @prop {string} [text] Button text
 */

/**
 * Connect a RAPID boolean variable to a button. When the button is pressed, it toogles the variable value and trigger any function registered with {@link onClick() onClick}
 * When variable value is true, the button is highlighted.
 * @class TComponents.ButtonBool_A
 * @extends TComponents.Button_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.ButtonBoolProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="btn"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const upButton = await new ButtonBool_A(
 *    document.querySelector('.btn'),{
 *    module: 'My_Module',
 *    variable: 'myBoolVariable',
 *    onClick: async function (value) {
 *      // do something with value
 *    },
 *    text: 'Toggle Bool',
 *    }
 *  ).render();
 */
export class ButtonBool_A extends Button_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonBoolProps}
     */
    this._props;

    this.active = false;

    this.initPropsDep(['module', 'variable']);
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonBool_A
   * @returns {TComponents.ButtonBoolProps}
   */
  defaultProps() {
    return {
      task: 'T_ROB1',
      module: '',
      boolVariable: '',
      onChange: null,
    };
  }

  async onInit() {
    try {
      if (!this._props.module || !this._props.boolVariable) {
        this.error = true;
        return;
      }

      this.task = await API.RAPID.getTask(this._props.task);
      this.varElement = await API.RAPID.getVariable(this.task.name, this._props.module, this._props.boolVariable);

      if (this.varElement.type !== 'bool') {
        throw new Error(`TComponents.ButtonBool : ${this._props.boolVariable} is not a bool variable`);
      }

      if (this._props.onChange) this.on('change', this._props.onChange);

      this.varElement.onChanged(this.cbUpdateButtonBool.bind(this));
      this.active = await this.varElement.getValue();
      this.highlight = this.active;
    } catch (e) {
      Popup_A.error(e, `TComponents.ButtonBool_A onInit failed.`);
    }

    return () => {
      this.varElement.unsubscribe();
    };
  }

  /**
   * Adds a callback funciton to be called when the variable changes its state
   * @alias onChange
   * @memberof TComponents.ButtonBool_A
   * @param   {Function}  func    The callback function which is called
   */
  onChange(func) {
    this.on('change', func);
  }

  /**
   * Callback function which is called when the button is pressed, it trigger any function registered with {@link onClick() onClick}
   * @alias cbOnClick
   * @memberof TComponents.ButtonBool_A
   * @private
   * @async
   */
  async cbOnClick() {
    try {
      if (!this.varElement) throw new Error('Variable not defined');
      this.active = await this.varElement.getValue();
      this.varElement.setValue(!this.active);
      this.trigger('click', this.active);
    } catch (e) {
      console.error(e);
      Popup_A.danger('ButtonBool', [e.message, e.description]);
    }
  }

  cbUpdateButtonBool(value) {
    this.active = value;
    this.highlight = this.active;
    this.trigger('change', value);
  }
}
