/**
 * API Namespace
 * @namespace API
 */

// @ts-ignore
const factoryApiBase = function (es) {
  /**
   * @alias ECOSYSTEM_LIB_VERSION
   * @memberof API
   * @constant
   * @type {number}
   */
  es.ECOSYSTEM_API_VERSION = '0.8';

  const TIMEOUT_SEC = 5;
  es.verbose = false;

  /**
   * @alias init - called when window 'load' event occurs
   * @memberof API
   * @private
   */
  es.init = async () => {
    // await API.CONTROLLER._init()

    function buildErrorArray(e) {
      const errArr = [];
      if (typeof e === 'string') {
        errArr.push(e);
      } else if (typeof e === 'object') {
        errArr.push(e.message);
        if (e.controllerStatus) {
          errArr.push(`Code: ${e.controllerStatus.code} `);
          errArr.push(e.controllerStatus.description);
        }
      }
      return errArr;
    }

    window.addEventListener('error', (e) => {
      API.error(e);
    });

    window.addEventListener('unhandledrejection', (evt) => {
      API.error(evt.reason);
    });
  };
  window.addEventListener('load', es.init, false);

  es.__unload = false;

  /**
   * Clean up when the web page is closed
   */
  window.addEventListener(
    'beforeunload',
    () => {
      es.__unload = true;

      return null;
    },
    false
  );

  /**
   * Modifies an Error so it can be used with JSON.strigify
   * @alias replaceErrors
   * @memberof API
   * @private
   * @param {any} key
   * @param {any} value
   * @returns {object}
   */
  const replaceErrors = function (key, value) {
    if (value instanceof Error) {
      var error = {};

      Object.getOwnPropertyNames(value).forEach(function (propName) {
        error[propName] = value[propName];
      });

      return error;
    }

    return value;
  };

  /**
   * Builds an status object.
   * @alias createStatusObject
   * @memberof API
   * @private
   * @param {string}  message
   * @param {Error | object | string}      item
   */
  function createStatusObject(message, item = {}) {
    let r = {};
    try {
      let msg = '';
      if (typeof message === 'string' && message !== null) msg = message;
      r.message = msg;

      if (item instanceof Error) {
        if (r.message.length <= 0) r.message = `Exception: ${item.message}`;
        else r.message += ` >>> Exception: ${item.message}`;
      } else if (typeof item === 'string') {
        if (r.message.length <= 0) r.message = item;
        else r.message += ` >>> ${item}`;
      } else if (item.hasOwnProperty('message')) {
        r = JSON.parse(JSON.stringify(item));
        r.message = msg;
        if (typeof item.message === 'string' && item.message.length > 0) r.message += ` >>> ${item.message}`;
      }
    } catch (error) {
      r = {};
      r.message = `Failed to create status object. >>> Exception: ${error.message}`;
    }

    return r;
  }

  /**
   * Checks if input is a non empty string
   * @alias isNonEmptyString
   * @memberof API
   * @private
   * @param {any} x - String to be evaluated
   * @returns {boolean}
   */
  const isNonEmptyString = (x) => {
    if (x === null) return false;
    if (typeof x !== 'string') return false;
    if (x === '') return false;
    if (x === 'undefined') return false;

    return true;
  };

  /**
   * Set vorbose-flag to print in Flexpendant debugging window any error catched within the API
   * @alias setVerbose
   * @param {boolean} [value] - if true, logs are exposed
   * @memberof API
   */
  es.setVerbose = (value = true) => {
    es.verbose = value;
    console.log(`API.verbose set to ${es.verbose}`);
  };

  /**
   * If verbose is true, logs to console
   * @param {string} msg
   * @private
   */
  es.log = (msg) => {
    try {
      es.verbose && console.log(JSON.stringify(msg));
    } catch (e) {
      console.log(msg);
    }
  };

  /**
   * If verbose is true, errors to console (stringified so that it appears in Flexpendant debug window too.)
   * @param {any} e
   * @private
   */
  es.error = (e) => {
    try {
      es.verbose && console.error(JSON.stringify(e, replaceErrors));
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Rejects with status object.
   * @alias rejectWithStatus
   * @memberof API
   * @private
   * @param {string}  message
   * @param {object} item
   * @returns {Promise} Promise.reject with message and item information
   */
  es.rejectWithStatus = function (message, item = {}) {
    if (es.verbose) {
      API.log(message);
      API.error(item);
    }
    let r = createStatusObject(message, item);
    return Promise.reject(r);
  };

  /**
   * Generates an UUIDs (Universally Unique IDentifier)
   * @alias generateUUID
   * @memberof API
   * @returns {string} UUID
   */
  // https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid/
  es.generateUUID = () => {
    // Public Domain/MIT
    var d = new Date().getTime(); //Timestamp
    var d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16; //random number between 0 and 16
      if (d > 0) {
        //Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        //Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  };

  /**
   * Asynchronous sleep function
   * @alias sleep
   * @memberof API
   * @param {number} ms - Time in miliseconds
   * @returns {Promise}
   * @example
   * await API.sleep(1000);
   */
  es.sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  /**
   * Timeout function - this can be used with Promise.race to escape another asynchronous function which takes longer than the timeout
   * @alias timeout
   * @memberof API
   * @param {number} ms - Time in miliseconds
   * @private
   */
  es.timeout = function (ms) {
    return new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error(`Request took too long! Timeout after ${ms} milisecond`));
      }, ms);
    });
  };

  /**
   * Wait for a condition to be true. It can be used together with Promise.race and API.timeout for waiting for a condition with timeout
   * @alias waitForCondition
   * @memberof API
   * @param {function} func - Function containing the condition
   * @param {API.waitForConditionOptions} interval_ms - Interval in miliseconds
   * @returns {Promise}
   * @private
   */
  es.waitForCondition = async function (func, { interval_ms = 100, timeout_ms = 10000 } = {}) {
    try {
      let condition = false;
      // while (condition !== true) {
      //   condition = func();
      //   if (!condition) await API.sleep(interval_ms);
      // }
      const ret = await Promise.race([
        (async () => {
          while (condition !== true) {
            condition = func();
            if (!condition) await API.sleep(interval_ms);
          }
        })(),
        API.timeout(timeout_ms), // milisecs
      ]);
    } catch (e) {
      return API.rejectWithStatus('Error while waiting for condition', e);
    }
  };

  /**
   * @class API.Events
   * @memberof API
   */
  es.Events = class Events {
    constructor() {
      this.events = {};
    }

    /**
     * Subscribe to an event
     * @alias on
     * @memberof API.Events
     * @param {string} eventName - name of the triggering event
     * @param {function} callback -function to be called when event is triggered
     */
    on(eventName, callback) {
      if (typeof callback !== 'function') throw new Error('callback is not a valid function');
      const handlers = this.events[eventName] || [];
      if (handlers.includes(callback)) return;
      handlers.push(callback);
      this.events[eventName] = handlers;
    }

    /**
     * Triggers all callback fuction that have subscribe to an event
     * @alias trigger
     * @memberof API.Events
     * @param {string} eventName - Name of the event to be triggered
     * @param {any} data - Data passed to the callback as input parameter
     */
    trigger(eventName, data = null) {
      const handlers = this.events[eventName];
      if (!handlers || handlers.length === 0) {
        return;
      }
      handlers.forEach((callback) => {
        callback(data);
      });
    }
  };
  es._events = new es.Events();

  /**
   * @alias API.CONTROLLER
   * @namespace
   */
  es.CONTROLLER = new (function () {
    /**
     * @alias STATE
     * @memberof API.CONTROLLER
     * @readonly
     * @enum {string}
     */
    this.STATE = {
      Init: 'initializing', // the controller is starting up
      MotorsOn: 'motors_on', //motors on state
      MotorsOff: 'motors_off', // motors off state
      GuardStop: 'guard_stop', // stopped due to safety
      EStop: 'emergency_stop', // emergency stop state
      EStopR: 'emergency_stop_resetting', // emergency stop state resetting
      SysFailure: 'system_failure', // system failure state
    };

    /**
     * @alias OPMODE
     * @memberof API.CONTROLLER
     * @readonly
     * @enum {string}
     */
    this.OPMODE = {
      Auto: 'automatic',
      Manual: 'manual',
      ManualR: 'manual_reduced',
      ManualFull: 'manual_full',
    };

    /**
     * @memberof API.CONTROLLER
     * @param {RWS.Controller.MonitorResources} res
     * @param {Function} func
     * @returns {Promise<{}>}
     * @private
     */
    const subscribeRes = async function (res, func) {
      try {
        const monitor = await RWS.Controller.getMonitor(res);
        monitor.addCallbackOnChanged(func);
        await monitor.subscribe();
      } catch (e) {
        return API.rejectWithStatus(`Subscription to ${res} failed.`, e);
      }
    };

    /**
     * Subscribe to 'operation-mode'. Current state is stored in
     * {@link opMode}. Additionally, {@link isManReduced}
     * is updated with the corresponding value.
     * @alias monitorOperationMode
     * @memberof API.CONTROLLER
     * @param {function} [callback] - Callback function called when operation mode changes
     */
    this.monitorOperationMode = async function (callback = null) {
      if (this.opMode === undefined) {
        try {
          /**
           * @alias opMode
           * @memberof API.CONTROLLER
           * @property {boolean} opMode Stores the operation mode.
           * This property is available only after calling API.CONTROLLER.monitorController()
           */
          this.opMode = await RWS.Controller.getOperationMode();
          /**
           * @alias isManual
           * @memberof API.CONTROLLER
           * @property {boolean} isManual true if operation mode is manual reduced, false otherwise
           * This property is available only after calling API.CONTROLLER.monitorController()
           */
          this.isManual = this.opMode === API.CONTROLLER.OPMODE.ManualR ? true : false;

          /**
           * @alias isAuto
           * @memberof API.CONTROLLER
           * @property {boolean} isAuto true if operation mode is manual reduced, false otherwise
           * This property is available only after calling API.CONTROLLER.monitorController()
           */
          this.isAuto = this.opMode === API.CONTROLLER.OPMODE.Auto ? true : false;
          const cbOpMode = function (data) {
            this.opMode = data;
            data === API.CONTROLLER.OPMODE.ManualR ? (this.isManual = true) : (this.isManual = false);
            data === API.CONTROLLER.OPMODE.Auto ? (this.isAuto = true) : (this.isAuto = false);
            es._events.trigger('op-mode', data);
            API.verbose && console.log(this.opMode);
          };
          subscribeRes(RWS.Controller.MonitorResources.operationMode, cbOpMode.bind(this));
        } catch (e) {
          return API.rejectWithStatus('Failed to subscribe operation mode', e);
        }
      }

      es._events.on('op-mode', callback);
    };

    /**
     * Subscribe to 'controller-state' and 'operation-mode'. Current state is stored in
     * {@link ctrlState}. Additionally, {@link isMotOn}
     * is updated with the corresponding value.
     * @alias monitorControllerState
     * @memberof API.CONTROLLER
     * @param {function} [callback] - Callback function called when controller state changes
     */
    this.monitorControllerState = async function (callback) {
      if (this.ctrlState === undefined) {
        try {
          /**
           * @alias ctrlState
           * @memberof API.CONTROLLER
           * @property {string} ctrlState the current state of the controller.
           * This property is available only after calling API.CONTROLLER.monitorController()
           */
          this.ctrlState = await RWS.Controller.getControllerState();
          /**
           * @alias isMotOn
           * @memberof API.CONTROLLER
           * @property {boolean} isMotOn true if motors are on, false otherwise
           * This property is available only after calling API.CONTROLLER.monitorController()
           */
          this.isMotOn = this.ctrlState === API.CONTROLLER.STATE.MotorsOn ? true : false;
          const cbControllerState = function (data) {
            this.ctrlState = data;

            data === API.CONTROLLER.STATE.MotorsOn ? (this.isMotOn = true) : (this.isMotOn = false);
            es._events.trigger('controller-state', data);
            API.verbose && console.log(this.ctrlState);
          };
          subscribeRes(RWS.Controller.MonitorResources.controllerState, cbControllerState.bind(this));
        } catch (e) {
          return API.rejectWithStatus('Failed to subscribe controller state', e);
        }
      }
      es._events.on('controller-state', callback);
    };

    // this.monitorMechUnit = async function (callback) {
    //   try {
    //     if (typeof callback !== 'function' && callback !== null)
    //       throw new Error('callback is not a valid function');

    //     const cbMechUnit = function (data) {
    //       this.mechUnit = data;

    //       callback && callback(data);
    //       API.verbose && console.log(this.mechUnit);
    //     };
    //     subscribeRes('mechunit', cbMechUnit.bind(this));
    //   } catch (e) {
    //     return API.rejectWithStatus('Failed to subscribe controller state', e);
    //   }
    // };

    /**
     * Set operation mode to manual
     * @alias setOpMode
     * @memberof API.CONTROLLER
     */
    this.setOpMode = async function (mode) {
      if (mode === API.CONTROLLER.OPMODE.Manual) await this.setOpModeManual();
      else if (mode === API.CONTROLLER.OPMODE.Auto) await this.setOpModeAutomatic();
    };

    /**
     * Set operation mode to manual
     * @alias setOpModeManual
     * @memberof API.CONTROLLER
     */
    this.setOpModeManual = async function () {
      await RWS.Controller.setOperationMode(API.CONTROLLER.OPMODE.Manual);
    };

    /**
     * Set operation mode to Automatic
     * @alias setOpModeAutomatic
     * @memberof API.CONTROLLER
     */
    this.setOpModeAutomatic = async function () {
      await RWS.Controller.setOperationMode(API.CONTROLLER.OPMODE.Auto);
    };

    /**
     * Gets operation mode. Possible modes are:
     *    <br>&emsp;'initializing' controller is starting up, but not yet ready
     *    <br>&emsp;'automatic_changing' automatic mode requested
     *    <br>&emsp;'manual_full_changing' manual full speed mode requested
     *    <br>&emsp;'manual_reduced' manual reduced speed mode
     *    <br>&emsp;'manual_full' manual full speed mode
     *    <br>&emsp;'automatic' automatic mode
     *    <br>&emsp;'undefined' undefined
     * @alias getOperationMode
     * @memberof API.CONTROLLER
     * @returns {Promise<RWS.Controller.OperationModes>} A promise with a string containing the operation mode.
     */
    this.getOperationMode = function () {
      return (async () => {
        return await RWS.Controller.getOperationMode();
      })();
    };

    /**
     * Gets controller state. Possible states are:
     *  <br>&emsp;'initializing' the controller is starting up
     *  <br>&emsp;'motors_on' motors on state
     *  <br>&emsp;'motors_off' motors off state
     *  <br>&emsp;'guard_stop' stopped due to safety
     *  <br>&emsp;'emergency_stop' emergency stop state
     *  <br>&emsp;'emergency_stop_resetting' emergency stop state resetting
     *  <br>&emsp;'system_failure' system failure state
     * @alias getControllerState
     * @memberof API.CONTROLLER
     * @returns {Promise<RWS.Controller.ControllerStates>} A promise with a string containing the controller state.
     */
    this.getControllerState = function () {
      return (async () => {
        return await RWS.Controller.getControllerState();
      })();
    };

    /**
     * Get the current language
     * @alias getLanguage
     * @memberof API.CONTROLLER
     * @returns {Promise<string>}
     */
    this.getLanguage = async function () {
      return await RWS.Controller.getEnvironmentVariable('$LANGUAGE');
    };

    /**
     * Restarts the controller.  Possible modes are:
     *     <br>&emsp;'restart' normal warm start
     *     <br>&emsp;'shutdown' shut down the controller
     *     <br>&emsp;'boot_application' start boot application
     *     <br>&emsp;'reset_system' reset system
     *     <br>&emsp;'reset_rapid' reset Rapid
     *     <br>&emsp;'revert_to_auto' revert to last auto-save
     *     <br>&emsp;NOTE! An enum ‘RWS.Controller.RestartModes’ with the valid values is provided for ease of use.
     * @alias restart
     * @memberof API.CONTROLLER
     * @param [mode] - The parameter mode indicates what kind of restart is requested.
     * @returns {Promise<{}>}
     */
    this.restart = async function (mode = RWS.Controller.RestartModes.restart) {
      try {
        await API.sleep(1000);
        await RWS.Controller.restartController(mode);
      } catch (e) {
        return API.rejectWithStatus('Failed to restart controller', e);
      }
    };
  })();

  es.constructedBase = true;
};

const API = {};
factoryApiBase(API);

export default API;
