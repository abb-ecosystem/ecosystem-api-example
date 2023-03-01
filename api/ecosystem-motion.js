'use strict';
// @ts-ignore
var API = API || {};
if (typeof API.constructedMotion === 'undefined') {
  (function (mot) {
    /**
     * @alias API.MOTION
     * @namespace
     */
    mot.MOTION = new (function () {
      let ccounter = null;
      let jogMonitor = null;
      let jogStop = false;

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
        Current: '',
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
        Current: '',
      };

      // /**
      //  * @typedef {number} JogDataIdx0
      //  * @typedef {number} JogDataIdx1
      //  * @typedef {number} JogDataIdx2
      //  * @typedef {number} JogDataIdx3
      //  * @typedef {number} JogDataIdx4
      //  * @typedef {number} JogDataIdx5
      //  * @type {[JogDataIdx0, JogDataIdx1, JogDataIdx2, JogDataIdx3, JogDataIdx4, JogDataIdx5]} JogData
      //  */

      /**
       * @typedef Trans
       * @prop {number} x
       * @prop {number} y
       * @prop {number} z
       * @memberof API.MOTION
       *
       * @typedef Rot
       * @prop {number} q1
       * @prop {number} q2
       * @prop {number} q3
       * @prop {number} q4
       * @memberof API.MOTION
       *
       * @typedef RobConf
       * @prop {number} cf1
       * @prop {number} cf4
       * @prop {number} cf6
       * @prop {number} cfx
       * @memberof API.MOTION
       *
       * @typedef ExtAx
       * @prop {number}  eax_a
       * @prop {number}  eax_b
       * @prop {number}  eax_c
       * @prop {number}  eax_d
       * @prop {number}  eax_e
       * @prop {number}  eax_f
       * @memberof API.MOTION
       *
       * @typedef RobTarget
       * @prop {Trans} trans
       * @prop {Rot} rot
       * @prop {RobConf} robconf
       * @prop {ExtAx} extax
       * @memberof API.MOTION
       */

      /**
       * @typedef executeJoggingProps
       * @prop {string} [tool]
       * @prop {string} [wobj]
       * @prop {COORDS} [coords]
       * @prop {JOGMODE} [jogMode]
       * @prop {JogData} [jogData]
       * @prop {RobTarget} [robtarget]
       * @memberof API.MOTION
       */

      /**
       * Jogs the robot
       * @alias executeJogging
       * @memberof API.MOTION
       * @param {executeJoggingProps} props
       * @returns {undefined | Promise<{}>} - Promise rejected if failure
       */
      this.executeJogging = async function ({
        tool = '',
        wobj = '',
        coords = this.COORDS.Current,
        jogMode = this.JOGMODE.GoToPos,
        jogData = [500, 500, 500, 500, 500, 500],
        robtarget = null,
      }) {
        let state = null;
        try {
          jogStop = true;
          await API.RWS.requestMastership('motion');
          state = await API.RWS.getMastershipState('motion');

          await prepareJogging(tool, wobj, coords, jogMode);
          await doJogging(jogData, robtarget);
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
       * @param {string} jogMode
       * @returns {undefined |Promise<{}>} - Undefined or reject Promise if fails.
       * @private
       */
      const prepareJogging = async function (
        tool = 'tool0',
        wobj = 'wobj0',
        coords = 'Base',
        jogMode = ''
      ) {
        try {
          await API.RWS.MOTIONSYSTEM.setMechunit({ tool, wobj, jogMode, coords });

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
       * @param {API.MOTION.JogData} jogData
       * @param {API.MOTION.RobTarget} robtarget
       * @param {boolean} once
       * @returns {undefined |Promise<{}>} - Undefined or reject Promise if fails.
       */
      const doJogging = async function (jogData, robtarget = null, once = false) {
        jogStop = false;
        let opMode = await API.CONTROLLER.getOperationMode();
        let ctrlState = await API.CONTROLLER.getControllerState();
        if (
          ctrlState === API.CONTROLLER.STATE.MotorsOn &&
          opMode === API.CONTROLLER.OPMODE.ManualR
        ) {
          while (!jogStop) {
            try {
              if (robtarget !== null) {
                await API.RWS.MOTIONSYSTEM.setRobotPositionTarget(robtarget);
              }
              await API.RWS.MOTIONSYSTEM.jog(jogData, ccounter);

              await API.sleep(200);
              if (once) jogStop = true;
            } catch (err) {
              jogStop = true;
              return API.rejectWithStatus('Do jogging failed.', err);
            }
          }
        } else {
          jogStop = true;
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
        const jogData = [0, 0, 0, 0, 0, 0];
        jogStop = true;
        try {
          await API.RWS.MOTIONSYSTEM.jog(jogData, ccounter);
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
