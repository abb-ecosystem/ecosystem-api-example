import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Button_A } from './t-components-button.js';

/**
 * @typedef TComponents.ButtonMoveToProps
 * @prop {string} variable Rapid variable to subpscribe to
 * @prop {string} module Module containig the rapid variable
 * @prop {string} [tool] Active tool - default='', which means current tool,
 * @prop {string} [wobj] Active working object - defaut='', which means current working object,
 * @prop {string} [coords] Active coordinate system {@link API.MOTION.COORDS} , defaut=API.MOTION.COORDS.Current,
 * @prop {Function} [callback] Function to be called when button is pressed
 * @prop {string} [label] Label text
 * @prop {string|null} [icon] Path to image file
 */

/**
 * Button to jog the robot to a position provided by a RAPID robtarget variable.
 * @class TComponents.ButtonMoveTo_A
 * @extends TComponents.Button_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ButtonMoveToProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-move"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const btnMove = new ButtonMoveTo_A(document.querySelector('.btn-move'), {
 *    variable: 'esTarget02',
 *    module: 'Ecosystem_BASE',
 *    text: 'move to',
 *  });
 *  await btnMove.render();
 *
 */
export class ButtonMoveTo_A extends Button_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonMoveToProps}
     */
    this._props;

    this.initPropsDep(['module', 'variable']);

    this._value = null;
    this._isJogging = false;
    if (this._props.text === this._getAllDefaultProps().text) this._props.text = 'Move to';
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonMoveTo_A
   * @returns {TComponents.ButtonMoveToProps}
   */
  defaultProps() {
    return {
      module: '',
      variable: '',
      tool: '',
      wobj: '',
      coords: API.MOTION.COORDS.Current,
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
    } catch (e) {
      this.error = true;

      Popup_A.warning(`Move to button`, [`Error when gettin variable ${this._props.variable}`, e.message]);
    }
  }

  onRender() {
    super.onRender();
    const elemBtnMove = this.container;
    this.addEventListener(elemBtnMove, 'pointerdown', this.move.bind(this));
    this.addEventListener(elemBtnMove, 'pointerup', this.stop.bind(this));
    this.addEventListener(elemBtnMove, 'pointerleave', this.stop.bind(this));
  }

  /**
   * Jogs the robot to the position defined at variable
   * @alias move
   * @memberof TComponents.ButtonMoveTo_A
   * @async
   */
  async move() {
    if (this._btn.enabled) {
      const jogData = [500, 500, 500, 500, 500, 500];
      this._value = await this.task.getValue(this._props.module, this._props.variable);
      if (!this._value) return;
      try {
        this._isJogging = true;

        let props = {
          jogMode: API.MOTION.JOGMODE.GoToPos,
          jogData: jogData,
          robTarget: this._value,
        };
        if (this._props.tool) props = Object.assign({ props }, { tool: this._props.tool });
        if (this._props.wobj) props = Object.assign({ props }, { wobj: this._props.wobj });
        if (this._props.coords) props = Object.assign({ props }, { coords: this._props.coords });

        await API.MOTION.executeJogging(props);
      } catch (e) {
        this._isJogging = false;
        Popup_A.error(e, 'TComponents.ButtonMoveTo_A');
      }
    }
  }

  /**
   * Stops jogging
   * @alias stop
   * @memberof TComponents.ButtonMoveTo_A
   * @async
   */
  async stop() {
    if (this._btn.enabled) {
      if (this._isJogging) {
        try {
          await API.MOTION.stopJogging();
        } catch (e) {
          Popup_A.error(e, 'TComponents.ButtonMoveTo_A');
        }
        this._isJogging = false;
      }
    }
  }
}
