import API from './ecosystem-rws.js';

export const factoryApiMotion = function (mot) {
  /**
   * @alias API.MOTION
   * @namespace
   */
  mot.MOTION = new (function () {
    let ccounter = null;
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
     */

    /**
     * @typedef Rot
     * @prop {number} q1
     * @prop {number} q2
     * @prop {number} q3
     * @prop {number} q4
     * @memberof API.MOTION
     */

    /**
     * @typedef RobConf
     * @prop {number} cf1
     * @prop {number} cf4
     * @prop {number} cf6
     * @prop {number} cfx
     * @memberof API.MOTION
     */

    /**
     * @typedef ExtAx
     * @prop {number}  eax_a
     * @prop {number}  eax_b
     * @prop {number}  eax_c
     * @prop {number}  eax_d
     * @prop {number}  eax_e
     * @prop {number}  eax_f
     * @memberof API.MOTION
     */

    /**
     * @typedef RobTarget
     * @prop {Trans} trans
     * @prop {Rot} rot
     * @prop {RobConf} robconf
     * @prop {ExtAx} extax
     * @memberof API.MOTION
     */

    /**
     * @typedef RobAx
     * @prop {number} rax_1
     * @prop {number} rax_2
     * @prop {number} rax_3
     * @prop {number} rax_4
     * @prop {number} rax_5
     * @prop {number} rax_6
     * @memberof API.MOTION
     */

    /**
     * @typedef JointTarget
     * @prop {RobAx} robax
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
     * @prop {RobTarget} [robTarget]
     * @prop {JointTarget} [jointTarget]
     * @prop {boolean} [doJoint]
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
      robTarget = null,
      jointTarget = null,
      doJoint = false,
    }) {
      console.log('🚀 executeJogging:', tool, wobj, coords, jogMode, jogData, robTarget, jointTarget, doJoint);

      let state = null;
      try {
        jogStop = true;
        await API.RWS.requestMastership('motion');
        state = await API.RWS.getMastershipState('motion');

        await prepareJogging(tool, wobj, coords, jogMode);

        if (doJoint && jointTarget !== null) await doJogging(jogData, jointTarget, false, true);
        else await doJogging(jogData, robTarget, false, false);
        await API.RWS.releaseMastership('motion');
      } catch (err) {
        if (state === (await API.RWS.getMastershipState('motion')) && (state === API.RWS.MASTERSHIP.Remote || state === API.RWS.MASTERSHIP.Local))
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
    const prepareJogging = async function (tool = '', wobj = '', coords = 'Base', jogMode = '') {
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
     * @param {API.MOTION.RobTarget | API.MOTION.JointTarget} target
     * @param {boolean} once - If true, send jog command only once
     * @param {boolean} doJoint	- If true, target is a JointTarget
     * @returns {undefined |Promise<{}>} - Undefined or reject Promise if fails.
     */
    const doJogging = async function (jogData, target = null, once = false, doJoint = false) {
      jogStop = false;
      let opMode = await API.CONTROLLER.getOperationMode();
      let ctrlState = await API.CONTROLLER.getControllerState();
      if (ctrlState === API.CONTROLLER.STATE.MotorsOn && opMode === API.CONTROLLER.OPMODE.ManualR) {
        while (!jogStop) {
          try {
            if (target !== null) {
              if (doJoint) await API.RWS.MOTIONSYSTEM.setRobotPositionJoint(target);
              else await API.RWS.MOTIONSYSTEM.setRobotPositionTarget(target);
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
        return API.rejectWithStatus(`Missing conditions to jog: CtrlState - ${ctrlState}, OpMode - ${opMode}`);
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

    /**
     * Gets the current tool
     * @alias getTool
     * @memberof API.MOTION
     * @returns {Promise<object>} - Object containing current position of the robot
     */
    this.getTool = async function () {
      try {
        const mechUnit = await API.RWS.MOTIONSYSTEM.getMechunit();
        return mechUnit.tool;
      } catch (e) {
        return API.rejectWithStatus('Get tool failed.', e);
      }
    };

    /**
     * Gets the current working object
     * @alias getWobj
     * @memberof API.MOTION
     * @returns {Promise<object>} - Object containing current position of the robot
     */
    this.getWobj = async function () {
      try {
        const mechUnit = await API.RWS.MOTIONSYSTEM.getMechunit();
        return mechUnit.wobj;
      } catch (e) {
        return API.rejectWithStatus('Get wobj failed.', e);
      }
    };

    /**
     * Sets the active tool to the specified value
     * @alias getTool
     * @memberof API.MOTION
     * @param {string} tool - Name of the tool
     * @returns {Promise<object>} - Object containing current position of the robot
     */
    this.setTool = async function (tool) {
      try {
        await API.RWS.requestMastership('motion');
        await API.RWS.MOTIONSYSTEM.setMechunit({ tool });
        await API.RWS.releaseMastership('motion');
      } catch (e) {
        return API.rejectWithStatus('Set tool failed.', e);
      }
    };

    /**
     * Sets the active working object to the specified value
     * @alias getWobj
     * @memberof API.MOTION
     * @param {string} value - Name of the working object
     * @returns {Promise<object>} - Object containing current position of the robot
     */
    this.setWobj = async function (value) {
      try {
        await API.RWS.requestMastership('motion');
        await API.RWS.MOTIONSYSTEM.setMechunit({ wobj: value });
        await API.RWS.releaseMastership('motion');
      } catch (e) {
        return API.rejectWithStatus('Set wobj failed.', e);
      }
    };
  })();

  mot.constructedMotion = true;
};

if (typeof API.constructedMotion === 'undefined') {
  factoryApiMotion(API);
}

export default API;
