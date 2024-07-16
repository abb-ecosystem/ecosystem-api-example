import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Button_A } from './t-components-button.js';

/**
 * @typedef TComponents.ButtonMoveToProps
 * @prop {string} robTarget Rapid robTarget to subpscribe to
 * @prop {string} module Module containig the rapid robTarget
 * @prop {string} [tool] Active tool - default='', which means current tool,
 * @prop {string} [wobj] Active working object - defaut='', which means current working object,
 * @prop {string} [coords] Active coordinate system {@link API.MOTION.COORDS} , defaut=API.MOTION.COORDS.Current,
 * @prop {number} [speed] Speed of the movement in %, default=100
 * @prop {Function} [onClick] Function to be called when button is pressed
 * @prop {string} [label] Label text
 * @prop {string|null} [icon] Path to image file
 * @prop {string} [text] Button text
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
 *    robTarget: 'esTarget02',
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

    this.initPropsDep(['module', 'robTarget']);

    this._variable = null;
    this._isJogging = false;
    if (this._props.text === this._getAllDefaultProps().text) this._props.text = 'Move';
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
      robTarget: '',
      tool: '',
      wobj: '',
      coords: API.MOTION.COORDS.Current,
      speed: 100,
    };
  }

  async onInit() {
    if (!this._props.module || !this._props.robTarget) {
      this.error = true;
      return;
    }
    try {
      this.task = await API.RAPID.getTask();

      this._variable = await this.task.getVariable(this._props.module, this._props.robTarget);

      if (!this._variable || this._variable.type !== 'robtarget')
        throw new Error(`Variable ${this._props.robTarget} is not a robtarget`);
    } catch (e) {
      this.error = true;

      Popup_A.warning(`Move to button`, [`Error when getting variable ${this._props.robTarget}`, e.message]);
    }
  }

  onRender() {
    super.onRender();

    const btn = this.find('.tc-button');
    this.addEventListener(btn, 'pointerdown', this.move.bind(this));
    this.addEventListener(btn, 'pointerup', this.stop.bind(this));
    this.addEventListener(btn, 'pointerleave', this.stop.bind(this));
  }

  /**
   * Jogs the robot to the position defined at variable
   * @alias move
   * @memberof TComponents.ButtonMoveTo_A
   * @async
   */
  async move() {
    if (this._btn.enabled) {
      try {
        const speed = this._props.speed > 100 ? 100 : this._props.speed < 2 ? 2 : this._props.speed;
        const jogData = [
          (1000 * speed) / 100,
          (1000 * speed) / 100,
          (1000 * speed) / 100,
          (1000 * speed) / 100,
          (1000 * speed) / 100,
          (1000 * speed) / 100,
        ];
        const value = await this._variable.getValue();
        if (!value) return;

        const tool = this._props.tool ? this._props.tool : 'tool0';
        const wobj = this._props.wobj ? this._props.wobj : 'wobj0';
        const coords = this._props.coords ? this._props.coords : API.MOTION.COORDS.Current;
        const jogMode = API.MOTION.JOGMODE.GoToPos;
        const robTarget = value;

        this._isJogging = true;

        await API.MOTION.executeJogging(tool, wobj, coords, jogMode, jogData, robTarget);
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
