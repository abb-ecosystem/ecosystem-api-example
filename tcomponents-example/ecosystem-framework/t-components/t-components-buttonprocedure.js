import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Button_A } from './t-components-button.js';

/**
 * @typedef TComponents.ButtonProcedureProps
 * @prop {string} [procedure] - Procedure to be called
 * @prop {Boolean} [userLevel] - if true, execution level is set to “user level”, i.e. execute as a service routine.
 * In this case "motor on" is not required in procedures that no motion is executed.
 * @prop {string} [cycleMode] - 'once' (default), 'forever', 'as_is'
 * @prop {boolean} [stopOnRelease]
 * @prop {string} [task]
 * @prop {function|null} [callback] - Function to be called when button is pressed
 * @prop {string|null} [icon] - Path to image file
 * @prop {string} [label] - label text
 */

/**
 * Button for procedure execution. The behaviour depends on stopOnRelease value  (default=false).
 * When stopOnRelease equals false, then the procedure is started after press and release of the button.
 * Wehn stopOnRelease equals true, then the procedure is started when pressing, and stopped when releasing the button.
 * @class TComponents.ButtonProcedure_A
 * @extends TComponents.Button_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ButtonProcedureProps} props- props
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-procedure"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * btnProcedure = new ButtonProcedure_A(document.querySelector('.btn-procedure'), {
 *    procedure: 'myProcedure',
 *    userLevel: true,
 *    text: 'Execute',
 *    stopOnRelease: true
 *  });
 */
export class ButtonProcedure_A extends Button_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonProcedureProps}
     */
    this._props;

    this.initPropsDep('procedure');
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonProcedure_A
   * @returns {TComponents.ButtonProcedureProps}
   */
  defaultProps() {
    return {
      task: 'T_ROB1',
      procedure: '',
      userLevel: false,
      cycleMode: 'once',
      stopOnRelease: false,
    };
  }

  async onInit() {
    try {
      if (!this._props.procedure) {
        this.error = true;
        return;
      }

      if (!this.rapidTask) this.rapidTask = await API.RAPID.getTask(this._props.task);
    } catch (e) {
      this.error = true;
      Popup_A.error(e, `TComponents.ButtonProcedure`);
    }
  }

  onRender() {
    super.onRender();

    this._props.stopOnRelease || this.onClick(this.cbOnClick.bind(this));

    if (this._props.stopOnRelease) {
      const elemBtnMove = this.find('.fp-components-button');
      this.addEventListener(elemBtnMove, 'pointerdown', this.cbOnClick.bind(this));
      this.addEventListener(elemBtnMove, 'pointerup', this.cbStop.bind(this));
      this.addEventListener(elemBtnMove, 'pointerleave', this.cbStop.bind(this));
    }
  }

  /**
   * Excecutes a procedure when button is pressed. The behaviour depends on the constructor stopOnRelease (default=false).
   * When stopOnRelease equals false, then the procedure is started after press and release of the button.
   * Wehn stopOnRelease equals true, then the procedure is started when pressing, and stopped when releasing the button.
   * @alias cbOnClick
   * @memberof TComponents.ButtonProcedure_A
   * @async
   * @private
   */
  async cbOnClick() {
    if (this._enabled) {
      try {
        this.stop = false;
        if (this._props.procedure) {
          const cb = async () => {
            this._enabled = false;
            await API.sleep(500);
            this._enabled = true;
          };
          setTimeout(cb.bind(this));
          await this.rapidTask.executeProcedure(this._props.procedure, {
            userLevel: this._props.userLevel,
            cycleMode: this._props.cycleMode,
          });
        }
        this.stopped = true;
      } catch (e) {
        this.stopped = true;
        if (!this.stop) Popup_A.error(e, `Procedure ${this._props.procedure}`);
      }
    }
  }

  /**
   * Stops running procedure
   * @alias cbStop
   * @memberof TComponents.ButtonProcedure_A
   * @async
   * @private
   */
  async cbStop() {
    try {
      this.stop = true;
      await this.rapidTask.stopExecution();
      // just in case the procedure has not yet started
      await API.sleep(200);
      await this.rapidTask.stopExecution();
    } catch (e) {
      Popup_A.danger('Failed to execute procedure', [e.message, e.description]);
    }
  }

  /**
   * Procedure to be executed
   * @alias procedure
   * @type {string}
   * @memberof TComponents.ButtonProcedure_A
   */
  get procedure() {
    return this._props.procedure;
  }

  set procedure(procedure) {
    this.setProps({ procedure });
  }

  /**
   * If true, the procedure is executed as service routine, therefore, motor on is not required
   * If false, the procedure is executed
   * @alias userLevel
   * @type {boolean}
   * @memberof TComponents.ButtonProcedure_A
   */
  get userLevel() {
    return this._props.userLevel;
  }
  set userLevel(userLevel) {
    this.setProps({ userLevel });
  }

  /**
   * Task containing the procedure (default value "T_ROB1").
   * @alias task
   * @type {string}
   * @memberof TComponents.ButtonProcedure_A
   */
  get task() {
    return this._props.task;
  }

  set task(task) {
    this.setProps({ task });
  }

  get cycleMode() {
    return this._props.cycleMode;
  }

  set cycleMode(cycleMode) {
    this.setProps({ cycleMode });
  }
}
