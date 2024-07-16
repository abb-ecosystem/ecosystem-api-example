import API from '../api/index.js';
import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';

import { Button_A } from './t-components-button.js';
import { InputVariable_A } from './t-components-inputvariable.js';

/**
 * @typedef TComponents.VarIncrDecrProps
 * @prop {string} [module] - module to seach for variables
 * @prop {string} [variable] - Rapid variable to subpscribe to
 * @prop {boolean} [readOnly] - if true, variable value is displayed and can only be modified with the increment and decrement buttons. If false, the value can also be directly modified
 * @prop {number} [steps] - Increments/decrements steps applied at a button click (default = 1)
 * @prop {string} [label] Label text
 * @prop {Funtion} [onChange] Function to be called when button is pressed
 */

/**
 * Component connected to a variable together with increment and decrement buttons.
 * @class TComponents.VarIncrDecr_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @property props {TComponents.VarIncrDecrProps}
 * @example
 * // index.html
 * ...
 * &lt;div class="var-incr-decr"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const varIncrDecrInd = new TComponents.VarIncrDecr_A(document.querySelector('.var-incr-decr'), {
 *    module: this._module,
 *    variable: this._variable,
 *    readOnly: true,
 *    steps: 5,
 *    label: 'VarIncrDecr_A (readonly)',
 *  });
 * await varIncrDecrInd.render();
 */
export class VarIncrDecr_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.VarIncrDecrProps}
     */
    this._props;

    this.initPropsDep(['module', 'variable']);
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.VarIncrDecr_A
   * @returns {TComponents.VarIncrDecrProps}
   */
  defaultProps() {
    return {
      task: 'T_ROB1',
      module: '',
      variable: '',
      readOnly: false,
      steps: 1,
      label: '',
      useBorder: true,
      onChange: null,
    };
  }

  async onInit() {
    if (!this._props.module || !this._props.variable) {
      this.error = true;
      return;
    }

    try {
      this.task = await API.RAPID.getTask(this._props.task);
      this._var = await this.task.getVariable(this._props.module, this._props.variable);

      this._isNum = this._var.type === 'num' || this._var.type === 'dnum' ? true : false;

      if (!this._isNum)
        Popup_A.warning('VarIncrDecr view', [
          `${this._props.variable} is of type "${this._var.type}"`,
          'Only variables of type "num" are fully supported',
        ]);
    } catch (e) {
      Popup_A.error(e, 'VarIncrDecr view');
    }
  }

  mapComponents() {
    return {
      var: new InputVariable_A(this.find('.tc-varincrdecr-var'), {
        module: this._props.module,
        variable: this._props.variable,
        readOnly: this._props.readOnly,
        useBorder: this._props.useBorder,
        onChange: this._props.onChange,
      }),
      incrValue: new Button_A(this.find('.tc-varincrdecr-incr'), {
        onClick: this.cbIncr.bind(this),
        text: '+',
      }),
      decrValue: new Button_A(this.find('.tc-varincrdecr-decr'), {
        onClick: this.cbDecr.bind(this),
        text: '-',
      }),
    };
  }

  onRender() {
    if (!this._isNum) {
      this.child.incrValue.enabled = false;
      this.child.decrValue.enabled = false;
    }
  }

  markup() {
    return /*html*/ `
          <div class="tc-container-row">
            <div class="tc-varincrdecr-decr tc-item"></div>
            <div class="tc-varincrdecr-var tc-item"></div>
            <div class="tc-varincrdecr-incr tc-item"></div>
          </div>

          `;
  }

  /**
   * RAPID variable
   * @alias variable
   * @type {string}
   * @memberof TComponents.VarIncrDecr_A
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
   * @memberof TComponents.VarIncrDecr_A
   */
  get module() {
    return this._props.module;
  }

  set module(module) {
    this.setProps({ module });
  }

  /**
   * Increments/decrements steps applied at a button click (default = 1)
   * @alias steps
   * @type {number}
   * @memberof TComponents.VarIncrDecr_A
   */
  get steps() {
    return this._props.steps;
  }

  set steps(steps) {
    this.setProps({ steps });
  }

  /**
   * If true value can only be modified with the increment/decrement buttons. If false, the value can be directly modified by the user by clicking on it.
   * @alias readOnly
   * @type {boolean}
   * @memberof TComponents.VarIncrDecr_A
   */
  get readOnly() {
    return this._props.readOnly;
  }

  set readOnly(readOnly) {
    this.setProps({ readOnly });
  }

  /**
   * Callback function to update variable when increment button is clicked
   * @alias cbIncr
   * @memberof TComponents.VarIncrDecr_A
   * @async
   * @private
   */
  async cbIncr() {
    try {
      if (!this._var) throw new Error('Variable not defined');
      let cv = Number.parseFloat(await this._var.getValue());
      cv += this._props.steps;
      this._var.setValue(cv);
    } catch (e) {
      Popup_A.error(e, 'VarIncrDecr_A');
    }
  }

  /**
   * Callback function to update variable when decrement button is clicked
   * @alias cbDecr
   * @memberof TComponents.VarIncrDecr_A
   * @async
   * @private
   */
  async cbDecr() {
    try {
      if (!this._var) return;
      let cv = Number.parseFloat(await this._var.getValue());
      cv -= this._props.steps;
      this._var.setValue(cv);
    } catch (e) {
      Popup_A.error(e);
    }
  }

  /**
   * Adds a callback function that will be called when the RAPID variable value changes
   * @alias onChange
   * @memberof TComponents.VarIncrDecr_A
   * @param {function} func
   */
  onChange(func) {
    this.child.var.onChange(func);
  }
}

VarIncrDecr_A.loadCssClassFromString(/*css*/ `

.tc-varincrdecr-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  min-width: fit-content;
}

.tc-container-row .fp-components-input{
  justify-content: center;
}

`);

/**
 * @class VarIncrDecr_B
 * @classdesc This class creates a custom incremental/decremental input
 * @extends TComponents.Component_A
 * @memberof tunView
 * @param {HTMLElement} parent - The parent element to which the view will be rendered
 * @param {Object} props - The properties object to be passed to the view
 */
export class VarIncrDecr_B extends VarIncrDecr_A {
  constructor(parent, props) {
    super(parent, props);
  }

  onRender() {
    super.onRender();
    if (this._props.useBorder) this.find('.tc-container-row').classList.add('use-border');
  }

  markup() {
    return /*html*/ `
      <div class="tc-varincrdecr-b">
        ${super.markup()}
      </div>
      `;
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 * @memberof VarIncrDecr_B
 */
VarIncrDecr_B.loadCssClassFromString(/*css*/ `
  .tc-varincrdecr-b .fp-components-button,
  .tc-varincrdecr-b .fp-components-button-disabled {
    border-radius: 4px;
    padding: 0px;
    min-width: 30px;
    height: 30px;

  }
  .tc-varincrdecr-b .fp-components-input{
    border: none;
    min-height: 20px;
    justify-content: center;
  }
  .tc-varincrdecr-b {
    display: flex;
  }

  .tc-varincrdecr-b .use-border {
    border: solid 2px var(--fp-color-GRAY-20);
    border-radius: 4px;
  }

  .tc-varincrdecr-b .tc-container-row {
    align-items: center;
  }

  .tc-varincrdecr-b .fp-components-button-text{
    font-weight: bold;
    font-size: 18px;
    line-height: 15px;
  }
`);
