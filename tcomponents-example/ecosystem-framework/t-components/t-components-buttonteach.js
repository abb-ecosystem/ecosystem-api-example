import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Button_A } from './t-components-button.js';

/**
 * @typedef TComponents.ButtonTeachProps
 * @prop {string} variable - Rapid variable to subpscribe to
 * @prop {string} module - Module containig the rapid variable
 * @prop {Function} [callback] Function to be called when button is pressed
 * @prop {string} [label] Label text
 * @prop {string|null} [icon] - Path to image file
 */

/**
 * Button to teach the current position into a RAPID robtarget variable
 * @class TComponents.ButtonTeach_A
 * @extends TComponents.Button_A
 * @param {HTMLElement} container
 * @param {TComponents.ButtonTeachProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-teach"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const btnTeach = new ButtonTeach_A(document.querySelector('.btn-teach'), {
 *    variable: 'esTarget02',
 *    module: 'Ecosystem_BASE',
 *    text: 'teach',
 *  });
 *  await btnTeach.render();
 */
export class ButtonTeach_A extends Button_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonTeachProps}
     */
    this._props;

    this.initPropsDep(['module', 'variable']);

    this._value = null;

    if (this._props.text === this._getAllDefaultProps().text) this._props.text = 'Teach';
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonTeach_A
   * @returns {TComponents.ButtonTeachProps}
   */
  defaultProps() {
    return {
      module: '',
      variable: '',
    };
  }

  async onInit() {
    if (!this._props.module || !this._props.variable) {
      this.error = true;
      return;
    }

    try {
      this.task = await API.RAPID.getTask();
      this._value = await this.task.getValue(this._props.module, this._props.variable);

      this.onClick(this.teach.bind(this));
    } catch (e) {
      this._btn.enabled = false;
      Popup_A.warning(`Teach button`, [`Error when gettin variable ${this._props.variable}`, e.message]);
    }
  }

  onRender() {
    super.onRender();
  }

  /**
   * Saves the current robot position in to variable. This method is called when pressing the instance button.
   * @alias teach
   * @memberof TComponents.ButtonTeach_A
   * @async
   */
  async teach() {
    this._value = await API.MOTION.getRobotPosition();
    try {
      await this.task.setValue(this._props.module, this._props.variable, this._value);
    } catch (e) {
      Popup_A.error(e, `ButtonTeach: robtarget: ${this._props.variable}`);
    }
  }
}
