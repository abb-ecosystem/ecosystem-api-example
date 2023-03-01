'use strict';

import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';

/**
 * @typedef TComponents.ButtonProps
 * @prop {Function} [callback] Function to be called when button is pressed
 * @prop {string|null} [icon] - Path to image file
 * @prop {string} [label] Label text
 */

/**
 * Rounded button that triggers a callback when pressed. Additional callbacks can be added with the {@link TComponents.Button_A#onClick|onClick} method.
 * @class TComponents.Button_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ButtonProps} [props]
 * @property {ButtonProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 *  const btnExecute = new Button_A(document.querySelector('.btn-container'), {
 *     callback: () => {
 *       console.log('execute');
 *     },
 *     label: 'Execute',
 *   });
 */
export class Button_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonProps}
     */
    this._props;

    this._btn = new FPComponents.Button_A();
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Button_A
   * @returns {TComponents.ButtonProps}
   */
  defaultProps() {
    return {
      callback: null,
      icon: null,
    };
  }

  async onInit() {}

  onRender() {
    this.label = this._props.label;
    this._btn.icon = this._props.icon;
    this._btn.onclick = this.cbOnClick.bind(this);
    if (this._props.callback) this.onClick(this._props.callback);
    this._btn.attachToElement(this.container);
  }

  /**
   * Component label text
   * @alias label
   * @type {string}
   * @memberof TComponents.Button_A
   */
  get label() {
    return this._btn.text;
  }

  /**
   * @protected
   */
  set label(text) {
    this._props.label = text;
    this._btn.text = text;
  }

  get highlight() {
    return this._btn.highlight;
  }

  set highlight(value) {
    this._btn.highlight = value;
  }

  get icon() {
    return this._btn.icon;
  }

  set icon(value) {
    this._btn.icon = value;
  }

  /**
   * Adds a callback funciton to the component. This will be called after the button is pressed and released
   * @alias onClick
   * @memberof TComponents.Button_A
   * @param   {function}  func    The callback function which is called when the button is pressed
   */
  onClick(func) {
    this.on('click', func);
  }

  /**
   * Callback function which is called when the button is pressed, it trigger any function registered with {@link onClick() onClick}
   * @alias cbOnClick
   * @memberof TComponents.Button_A
   * @param   {any}  value
   * @protected
   * @async
   */
  async cbOnClick(value) {
    this.trigger('click', value);
  }
}

/**
 * @typedef TComponents.ButtonVariableProps
 * @prop {string} module RAPID module containig the variable
 * @prop {string} variable RAPID variable
 * @prop {string} [task] RAPID Task in which the variable is contained (default = "T_ROB1" )
 * @prop {function|null} [callback] - Function to be called when button is pressed
 * @prop {string} [label] - label text
 * @prop {string|null} [icon] - Path to image file
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
 * &lt;div class="btn-move-up"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const upButton = await new ButtonVariable_A(
 *    document.querySelector('#button-move-up'),
 *    'Wizard',
 *    'UpLimit',
 *    async function (value) {
 *      Set_Pos(value);
 *    },
 *    'Up'
 *  ).render();
 */
export class ButtonVariable_A extends Button_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonVariableProps}
     */
    this._props;

    this.initPropsDependencies = ['module', 'variable'];
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonVariable_A
   * @returns {TComponents.ButtonVariableProps}
   */
  defaultProps() {
    return {
      module: '',
      variable: '',
      task: 'T_ROB1',
    };
  }

  /**
   * Contains component specific asynchronous implementation (like access to controller).
   * This method is called internally during initialization process orchestrated by {@link init() init}.
   * @protected
   * @async
   */
  async onInit() {
    try {
      if (!this._props.module || !this._props.variable) {
        this.error = true;
        return;
      }

      if (!this.task) this.task = await API.RAPID.getTask(this._props.task);
      this.varElement = await API.RAPID.getVariable(
        this.task.name,
        this._props.module,
        this._props.variable
      );
    } catch (e) {
      Popup_A.error(e, `TComponents.ButtonVariable_A onInit failed.`);
    }
  }

  /**
   * Callback function which is called when the button is pressed, it trigger any function registered with {@link onClick() onClick}
   * @alias cbOnClick
   * @memberof TComponents.Button_A
   * @protected
   * @async
   */
  async cbOnClick() {
    const var_value = await this.varElement.getValue();
    this.trigger('click', var_value);
  }
}

/**
 * @typedef TComponents.ButtonProcedureProps
 * @prop {string} [procedure] - Procedure to be called
 * @prop {Boolean} [userLevel] - if true, execution level is set to “user level”, i.e. execute as a service routine.
 * In this case "motor on" is not required in procedures that no motion is executed.
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
 *    label: 'Execute',
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

    this.initPropsDependencies = ['procedure'];
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonProcedure_A
   * @returns {TComponents.ButtonProcedureProps}
   */
  defaultProps() {
    return {
      procedure: '',
      userLevel: false,
      stopOnRelease: false,
      task: 'T_ROB1',
    };
  }

  /**
   * Contains component specific asynchronous implementation (like access to controller).
   * This method is called internally during initialization process orchestrated by {@link init() init}.
   * @protected
   * @async
   */
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

  /**
   * Contains component specific asynchronous implementation (like access to controller).
   * This method is called internally during initialization process orchestrated by {@link init() init}.
   * @protected
   */
  onRender() {
    super.onRender();

    this._props.stopOnRelease || this.onClick(this.cbOnClick.bind(this));

    if (this._props.stopOnRelease) {
      const elemBtnMove = this.find('.fp-components-button');
      elemBtnMove.addEventListener('pointerdown', this.cbOnClick.bind(this));
      elemBtnMove.addEventListener('pointerup', this.cbStop.bind(this));
      elemBtnMove.addEventListener('pointerleave', this.cbStop.bind(this));
    }
  }

  /**
   * Excecutes a procedure when button is pressed. The behaviour depends on the constructor stopOnRelease (default=false).
   * When stopOnRelease equals false, then the procedure is started after press and release of the button.
   * Wehn stopOnRelease equals true, then the procedure is started when pressing, and stopped when releasing the button.
   * @alias cbOnClick
   * @memberof TComponents.ButtonProcedure_A
   * @async
   * @protected
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
    // (async () => {
    //   this._props.task = text;
    //   this.rapidTask = await API.RAPID.getTask(this._props.task);
    //   this.render();
    // })();
  }
}

/**
 * @typedef TComponents.ButtonRebootProps
 * @prop {boolean} confirm - Popup an confirmation message before restarting
 * @prop {function|null} [callback] - Function to be called when button is pressed
 * @prop {string|null} [icon] - Path to image file
 * @prop {string} [label] - label text
 */

/**
 * Button to restart the controller.
 * @class TComponents.ButtonReboot_A
 * @extends TComponents.Button_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ButtonRebootProps} props -
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-reboot"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const btnReboot = new ButtonReboot_A(document.querySelector('.btn-reboot'), {
 *  confirm: true
 * });
 * btnRebbot.render();
 */
export class ButtonReboot_A extends Button_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonRebootProps}
     */

    if (!this._props.label) this._props.label = 'Reboot';
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonReboot_A
   * @returns {TComponents.ButtonRebootProps}
   */
  defaultProps() {
    return { confirm: false };
  }

  async onInit() {
    // await super.onInit();

    this.onClick(this.reboot.bind(this));
    this.highlight = true;
  }

  /**
   * Restarts the controller
   * @alias reboot
   * @memberof TComponents.ButtonReboot_A
   * @private
   */
  async reboot() {
    try {
      if (this._props.confirm) {
        Popup_A.confirm(
          'Reboot',
          `You are about to reboot the controller.
               Do you want to proceed?`,
          async (value) => {
            if (value === 'ok') {
              try {
                await API.CONTROLLER.restart();
              } catch (e) {
                Popup_A.error(e, 'TComponents.Reboot_A ');
              }
            }
          }
        );
      } else {
        await API.CONTROLLER.restart();
      }
    } catch (e) {
      Popup_A.error(e, 'TComponents.Reboot_A ');
    }
  }
}

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
 *    label: 'teach',
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

    this.initPropsDependencies = ['module', 'variable'];

    if (!this.label) this.label = 'Teach';
    this._value = null;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonTeach_A
   * @returns {TComponents.ButtonTeachProps}
   */
  defaultProps() {
    return {
      variable: '',
      module: '',
    };
  }

  /**
   * Contains component specific asynchronous implementation (like access to controller).
   * This method is called internally during initialization process orchestrated by {@link init() init}.
   * @protected
   * @async
   */
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
      Popup_A.warning(`Teach button`, [
        `Error when gettin variable ${this._props.variable}`,
        e.message,
      ]);
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
 *    label: 'move to',
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

    this.initPropsDependencies = ['module', 'variable'];

    this._value = null;
    this._isJogging = false;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonMoveTo_A
   * @returns {TComponents.ButtonMoveToProps}
   */
  defaultProps() {
    return {
      variable: '',
      module: '',
      tool: '',
      wobj: '',
      coords: API.MOTION.Current,
    };
  }

  /**
   * Contains component specific asynchronous implementation (like access to controller).
   * This method is called internally during initialization process orchestrated by {@link init() init}.
   * @protected
   * @async
   */
  async onInit() {
    if (!this.label) this.label = 'Move to';
    if (!this._props.module || !this._props.variable) {
      this.error = true;
      return;
    }
    try {
      this.task = await API.RAPID.getTask();
      this._value = await this.task.getValue(this._props.module, this._props.variable);
    } catch (e) {
      this.error = true;

      Popup_A.warning(`Move to button`, [
        `Error when gettin variable ${this._props.variable}`,
        e.message,
      ]);
    }
  }

  /**
   * Contains component specific asynchronous implementation (like access to controller).
   * This method is called internally during initialization process orchestrated by {@link init() init}.
   * @protected
   */
  onRender() {
    super.onRender();
    const elemBtnMove = this.container;
    elemBtnMove.addEventListener('pointerdown', this.move.bind(this));
    elemBtnMove.addEventListener('pointerup', this.stop.bind(this));
    elemBtnMove.addEventListener('pointerleave', this.stop.bind(this));
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

        const props = {
          jogMode: API.MOTION.JOGMODE.GoToPos,
          jogData: jogData,
          robtarget: this._value,
        };
        if (this._props.tool) props = Object.assign({ props }, { tool: this._props.tool });
        if (this._props.wobj) props = Object.assign({ props }, { wobj: this._props.wobj });
        if (this._props.coords) props = Object.assign({ props }, { coords: this._props.coords });

        console.log('😚', props);

        await API.MOTION.executeJogging(props);

        // await API.MOTION.executeJogging({
        //   jogMode: API.MOTION.JOGMODE.GoToPos,
        //   jogData: jogData,
        //   robtarget: this._value,
        // });
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

/**
 * @typedef TComponents.ButtonAlignProps
 * @prop {string} [tool] Active tool - default='', which means current tool,
 * @prop {string} [wobj] Active working object - defaut='', which means current working object,
 * @prop {string} [coords] Active coordinate system {@link API.MOTION.COORDS} , defaut=API.MOTION.COORDS.Current,
 * @prop {Function} [callback] Function to be called when button is pressed
 * @prop {string} [label] Label text
 * @prop {string|null} [icon] - Path to image file
 */

/**
 * Button to jog the robot to a position provided by a RAPID robtarget variable.
 * @class TComponents.ButtonAlign_A
 * @extends TComponents.Button_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ButtonAlignProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-align"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const btnMove = new ButtonAlign_A(
 *    document.querySelector('.btn-align'),
 *    {label: 'Align'}
 *  );
 *  await btnMove.render();
 */
export class ButtonAlign_A extends Button_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this._isJogging = false;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonAlign_A
   * @returns {TComponents.ButtonAlignProps}
   */
  defaultProps() {
    return {
      tool: '',
      wobj: '',
      coords: API.MOTION.Current,
    };
  }

  onRender() {
    super.onRender();
    if (!this.label) this.label = 'Align';
    const elemBtnMove = this.container;
    elemBtnMove.addEventListener('pointerdown', this.align.bind(this));
    elemBtnMove.addEventListener('pointerup', this.stop.bind(this));
    elemBtnMove.addEventListener('pointerleave', this.stop.bind(this));
  }

  /**
   * Align the robot TCP
   * @alias align
   * @memberof TComponents.ButtonAlign_A
   * @async
   */
  async align() {
    if (this._btn.enabled) {
      const jogData = [500, 500, 500, 500, 500, 500];

      const props = {
        jogMode: API.MOTION.JOGMODE.Align,
        jogData: jogData,
      };
      if (this._props.tool) props = Object.assign({ props }, { tool: this._props.tool });
      if (this._props.wobj) props = Object.assign({ props }, { wobj: this._props.wobj });
      if (this._props.coords) props = Object.assign({ props }, { coords: this._props.coords });

      console.log('😚', props);

      try {
        this._isJogging = true;
        await API.MOTION.executeJogging(props);
      } catch (e) {
        this._isJogging = false;
        Popup_A.error(e, 'TComponents.ButtonAlign_A');
      }
    }
  }

  /**
   * Stops align
   * @alias stop
   * @memberof TComponents.ButtonAlign_A
   * @async
   */
  async stop() {
    if (this._btn.enabled) {
      if (this._isJogging) {
        try {
          await API.MOTION.stopJogging();
        } catch (e) {
          Popup_A.error(e, 'TComponents.ButtonAlign_A');
        }
        this._isJogging = false;
      }
    }
  }
}

/**
 * @typedef TComponents.ButtonTeachMoveProps
 * @prop {string} variable - Rapid variable to subpscribe to
 * @prop {string} module - Module containig the rapid variable
 * @prop {string} [label] Label text
 */

/**
 * Component that combine {@link TComponents.ButtonTeach_A} and {@link TComponents.ButtonMoveTo_A} together.
 * @class TComponents.ButtonTeachMove_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent
 * @param {TComponents.ButtonTeachMoveProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-teach-move"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const btnTeach = new ButtonTeachMove_A(
 *    document.querySelector('.btn-teach-move'), {
 *     variable: 'esTarget02',
 *     module: 'Ecosystem_BASE',
 *     label: 'teach'
 *    }
 *  );
 *  await btnTeach.render();
 */
export class ButtonTeachMove_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonTeachMoveProps}
     */
    this._props;

    this.robTarget = null;
    this._isJogging = false;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonTeachMove_A
   * @returns {TComponents.ButtonTeachMoveProps}
   */
  defaultProps() {
    return {
      variable: '',
      module: '',
    };
  }

  mapComponents() {
    return {
      _btnMoveTo: new ButtonMoveTo_A(this.find('.tc-button-teachmove-move'), {
        variable: this._props.variable,
        module: this._props.module,
      }),
      _btnTeach: new ButtonTeach_A(this.find('.tc-button-teachmove-teach'), {
        variable: this._props.variable,
        module: this._props.module,
      }),
    };
  }

  markup() {
    return `
          <div class="tc-btnteachmove-location tc-btnteachmove-location-row">
            <div class="tc-button-teachmove-teach tc-button-teachmove-btn tc-item"></div>
            <div class="tc-button-teachmove-move tc-button-teachmove-btn tc-item"></div>
            <p>${this._props.label}</p>
          </div>
        `;
  }

  set label(label) {
    this.setProps({ label });
  }
}

var tComponentStyle = document.createElement('style');
tComponentStyle.innerHTML = `

      .tc-btnteachmove-location {
        display: flex;
        flex-direction: column;
        height: 100px;
        width: max-content;
        /* justify-content: space-around; */
        align-items: flex-start;
      }

      .tc-btnteachmove-location-row {
        flex-direction: row;
        height: auto;
        align-items: center;

        margin-right: 10px;
      }

      .tc-button-teachmove-btn {
        font-size: 14px;
        margin-left: 5px;
      }

      `;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(tComponentStyle, ref);
