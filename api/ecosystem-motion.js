'use strict';

var API = API || {};
if (typeof API.constructedMotion === 'undefined') {
  (function (mot) {
    /**
     * @alias ECOSYSTEM_MOTION_LIB_VERSION
     * @memberof API
     * @constant
     * @type {number}
     */
    mot.ECOSYSTEM_MOTION_LIB_VERSION = '0.1';

    /**
     * @alias API.MOTION
     * @namespace
     */
    mot.MOTION = new (function () {
      let ccounter = null;
      let jogMonitor = null;
      this.jogStop = false;

      /**
       * @alias JOGMODE
       * @memberof API.MOTION
       * @readonly
       * @enum {string}
       */
      this.JOGMODE = {
        Align: 'Align',
        GoToPos: 'GoToPos',
        ConfigurationJog: 'ConfigurationJog',
        Cartesian: 'Cartesian',
        AxisGroup1: 'AxisGroup1',
        AxisGroup2: 'AxisGroup2',
      };

      /**
       * @alias COORDS
       * @memberof API.MOTION
       * @readonly
       * @enum {string}
       */
      this.COORDS = {
        Wobj: 'Wobj',
        Base: 'Base',
        Tool: 'Tool',
        World: 'World',
      };

      /**
       * Jogs the robot
       * @alias executeJogging
       * @memberof API.MOTION
       * @param {string} tool
       * @param {string} wobj
       * @param {string} coords
       * @param {string} jog_mode
       * @param {string} jogdata
       * @param {string} robtarget
       * @returns {undefined | Promise<{}>} - Promise rejected if failure
       */
      this.executeJogging = async function (tool, wobj, coords, jog_mode, jogdata, robtarget = '') {
        let state = null;
        try {
          this.jogStop = true;
          await API.RWS.requestMastership('motion');
          state = await API.RWS.getMastershipState('motion');

          await prepareJogging(tool, wobj, coords, jog_mode);
          await this.doJogging(jogdata, robtarget);
          await API.RWS.releaseMastership('motion');
        } catch (err) {
          if (
            state === (await API.RWS.getMastershipState('motion')) &&
            (state === API.RWS.MASTERSHIP.Remote || state === API.RWS.MASTERSHIP.Local)
          )
            await API.RWS.releaseMastership('motion');
          console.log(`Motion Mastership: ${state}`);
          return API.rejectWithStatus('Execute jogging failed.', err);
        }
      };

      /**
       * Prepares the MechUnit and ChangeCounter for jogging
       * @alias prepareJogging
       * @memberof API.MOTION
       * @param {string} tool
       * @param {string} wobj
       * @param {string} coords
       * @param {string} jog_mode
       * @returns {undefined |Promise<{}>} - Undefined or reject Promise if fails.
       * @private
       */
      const prepareJogging = async function (
        tool = 'tool0',
        wobj = 'wobj0',
        coords = 'Base',
        jog_mode
      ) {
        try {
          await API.RWS.MOTIONSYSTEM.setMechunit(tool, wobj, '', '', '', jog_mode, coords);

          ccounter = await API.RWS.MOTIONSYSTEM.getChangeCount();
        } catch (err) {
          return API.rejectWithStatus('Prepare jogging failed.', err);
        }
      };

      /**
       * Cyclic execution during jogging
       * @alias doJogging
       * @memberof API.MOTION
       * @private
       * @param {string} jogdata
       * @param {string} robtarget
       * @param {boolean} once
       * @returns {undefined |Promise<{}>} - Undefined or reject Promise if fails.
       */
      this.doJogging = async function (jogdata, robtarget = '', once = false) {
        this.jogStop = false;
        let opMode = await API.CONTROLLER.getOperationMode();
        let ctrlState = await API.CONTROLLER.getControllerState();
        if (
          ctrlState === API.CONTROLLER.STATE.MotorsOn &&
          opMode === API.CONTROLLER.OPMODE.ManualR
        ) {
          while (!this.jogStop) {
            try {
              if (robtarget !== '') {
                await API.RWS.MOTIONSYSTEM.setRobotPosition(robtarget);
              }
              await API.RWS.MOTIONSYSTEM.jog(jogdata, ccounter);

              await API.sleep(200);
              if (once) this.jogStop = true;
            } catch (err) {
              this.jogStop = true;
              return API.rejectWithStatus('Do jogging failed.', err);
            }
          }
        } else {
          this.jogStop = true;
          return API.rejectWithStatus(
            `Missing conditions to jog: CtrlState - ${ctrlState}, OpMode - ${opMode}`
          );
        }
      };

      /**
       * Stops any running jog
       * @alias stopJogging
       * @memberof API.MOTION
       * @returns {undefined |Promise<{}>} - Undefined or reject Promise if fails.
       */
      this.stopJogging = async function () {
        const jogdata = [0, 0, 0, 0, 0, 0];
        this.jogStop = true;
        try {
          await API.RWS.MOTIONSYSTEM.jog(jogdata, ccounter);
        } catch (err) {
          return API.rejectWithStatus('Stop jogging failed.', err);
        }
      };

      /**
       * Gets the current position of the robot
       * @alias getRobotPosition
       * @memberof API.MOTION
       * @returns {Promise<object>} - Object containing current position of the robot
       */
      this.getRobotPosition = async function () {
        try {
          let robTarget = await API.RWS.MOTIONSYSTEM.getRobTarget();
          return robTarget;
        } catch (err) {
          return API.rejectWithStatus('Get robot position failed.', err);
        }
      };
    })();

    mot.constructedMotion = true;
  })(API);
}
