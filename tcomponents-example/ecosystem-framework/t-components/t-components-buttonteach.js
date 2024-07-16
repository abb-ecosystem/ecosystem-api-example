import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Button_A } from './t-components-button.js';

/**
 * @typedef TComponents.ButtonTeachProps
 * @prop {string} robTarget - Rapid variable to subpscribe to
 * @prop {string} module - Module containig the rapid variable
 * @prop {Function} [onClick] Function to be called when button is pressed
 * @prop {string} [label] Label text
 * @prop {string|null} [icon] - Path to image file
 * @prop {string} [text] Button text
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
 *    robTarget: 'esTarget02',
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

    this.initPropsDep(['module', 'robTarget']);

    this._variable = null;

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
      robTarget: '',
    };
  }

  async onInit() {
    if (!this._props.module || !this._props.robTarget) {
      this.error = true;
      return;
    }

    try {
      this.task = await API.RAPID.getTask();
      this._variable = await this.task.getVariable(this._props.module, this._props.robTarget, false);
      if (!this._variable || this._variable.type !== 'robtarget')
        throw new Error(`Variable ${this._props.robTarget} is not a robtarget`);

      this.onClick(this.teach.bind(this));
    } catch (e) {
      this._btn.enabled = false;
      Popup_A.warning(`Teach button`, [`Error when getting variable ${this._props.robTarget}`, e.message]);
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
    try {
      if (!this._variable) throw new Error('Variable not initialized');
      await this._variable.setValue(await API.MOTION.getRobotPosition());
    } catch (e) {
      Popup_A.error(e, `ButtonTeach -- robtarget: ${this._props.robTarget}`);
    }
  }
}
