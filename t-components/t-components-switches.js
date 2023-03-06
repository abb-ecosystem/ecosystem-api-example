'use strict';

import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';

/**
 * @typedef TComponents.SwitchProps
 * @prop {Function} [callback] Function to be called when button is pressed
 * @prop {string} [label] Label text
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
 *     callback: () => {
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
    return { callback: null, label: '' };
  }

  /**
   * Contains component specific asynchronous implementation (like access to controller).
   * This method is called internally during initialization process orchestrated by {@link init() init}.
   * @private
   */
  onRender() {
    this._switch.onchange = this.cbOnChange.bind(this);
    if (this._props.callback) this.onChange(this._props.callback);
    this._switch.attachToElement(this.container);
  }

  /**
   * Component label text
   * @alias label
   * @type {string}
   * @memberof TComponents.Switch_A
   */
  get label() {
    return this._switch.desc;
  }

  set label(label) {
    this.setProps({ label });
    this._switch.desc = label;
  }

  /**
   * Switch status: true if active, false otherwise
   * @alias active
   * @type {boolean}
   * @memberof TComponents.Switch_A
   * @private
   */
  get active() {
    return this._switch.active;
  }

  /**
   * @private
   */
  set active(value) {
    this._switch.active = value;
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
   * @param   {function}  func    The callback function which is called when the button is pressed
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
 *   callback: () => {
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

    this.initPropsDependencies = ['variable', 'module'];
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

      if (this.varElement.type !== 'bool')
        throw new Error(
          `TComponents.SwitchVariable_A : ${this._props.variable} is not a bool variable`
        );
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
   */
  cbUpdateSwitch(value) {
    this._switch.active = value;
    this.trigger('change', value);
  }
}

/**
 * @typedef TComponents.SwitchSignalProps
 * @prop {string | object} signal - Signal name, or API.CONFIG.SIGNAL.Signal object
 * @prop {Function} [callback] Function to be called when button is pressed
 * @prop {string} [label] Label text
 * @todo Update the signal type with API interface
 */

/**
 * Creates an instance of a switch connected to a signal
 * @class TComponents.SwitchSignal_A
 * @extends TComponents.Switch_A
 * @param {HTMLElement} parent - DOM element in which this component is to be inserted
 * @param {TComponents.SwitchSignalProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="signal-switch"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const switchSignal = new TComponents.SwitchSignal_A(document.querySelector('.signal-switch'), {
 *   signal: this._signal,
 *   label: 'DI Is Gripper Closed',
 * }),
 * switchSignal.render();
 */
export class SwitchSignal_A extends Switch_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SwitchSignalProps}
     */
    this._props;

    this.initPropsDependencies = ['signal'];
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SwitchSignal_A
   * @returns {TComponents.SwitchSignalProps}
   */
  defaultProps() {
    return { signal: null };
  }

  async onInit() {
    if (!this._props.signal) {
      this.error = true;
      return;
    }

    try {
      this._signal =
        typeof this._props.signal === 'string'
          ? await API.SIGNAL.getSignal(this._props.signal)
          : this._props.signal;
      this._switch.active = await this._signal.getValue();
      this._signal.onChanged(this.cbUpdateSwitch.bind(this));
      this._signal.subscribe();
    } catch (e) {
      console.error(e);
      Popup_A.error(e, `TComponent.SwitchSignal - signal ${this._signal.name}`);
    }

    // this._switch.onchange = this.cbOnChange.bind(this);
  }

  async cbUpdateSwitch(value) {
    value ? (this._switch.active = true) : (this._switch.active = false);
  }

  async cbOnChange(value) {
    try {
      this._switch.active ? await this._signal.setValue(1) : await this._signal.setValue(0);
    } catch (e) {
      console.error(e);
      Popup_A.error(e);
    }
  }

  /**
   * Prop: signal - Signal name, or API.CONFIG.SIGNAL.Signal object
   * @alias signal
   * @type {string | object}
   * @memberof SwitchSignal_A
   */
  get signal() {
    return this._props.signal;
  }

  set signal(signal) {
    this.setProps({ signal });
  }
}
