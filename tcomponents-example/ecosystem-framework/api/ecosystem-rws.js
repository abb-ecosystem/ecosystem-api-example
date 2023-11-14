import API from './ecosystem-base.js';

const factoryApiRws = function (rws) {
  /**
   * Extension of RWS not yet available at the omnicore.rws SDK
   * @alias API.RWS
   * @namespace
   */
  rws.RWS = new (function () {
    this.MASTERSHIP = {
      Nomaster: 'nomaster',
      Remote: 'remote',
      Local: 'local',
      Internal: 'internal',
    };

    function parseJSON(json) {
      try {
        return JSON.parse(json);
      } catch (error) {
        return undefined;
      }
    }

    function rwsPost(url, body, error_msg) {
      return RWS.Network.post(url, body)
        .then((ret) => {
          return ret && ret.response ? Promise.resolve(JSON.parse(ret.response)) : Promise.resolve();
        })
        .catch((err) => {
          return API.rejectWithStatus(error_msg, err);
        });
    }

    /**
     * @typedef {'edit' | 'motion' } MastershipType
     * @memberof API.RWS
     */

    const requestMastership = function (type = 'edit') {
      if (type === 'edit')
        return RWS.Mastership.request()
          .then(() => Promise.resolve())
          .catch((err) => API.rejectWithStatus('Could not get Mastership.', err));
      else if (type != '') type = type + '/';
      return rwsPost(`/rw/mastership/${type}request`, '', `Request ${type} mastership failed.`);
    };
    /**
     * @alias requestMastership
     * @memberof API.RWS
     * @param {MastershipType} type
     * @returns {Promise<any>}
     */
    this.requestMastership = requestMastership;

    const releaseMastership = function (type = 'edit') {
      if (type === 'edit')
        return RWS.Mastership.release()
          .then(() => Promise.resolve())
          .catch((err) => {
            RWS.writeDebug(`Could not release Mastership. >>> ${err.message}`);
            return Promise.resolve();
          });
      else if (type != '') type = type + '/';
      return rwsPost(`/rw/mastership/${type}release`, '', `Release ${type} mastership failed.`);
    };
    /**
     * @alias releaseMastership
     * @memberof API.RWS
     * @param {MastershipType} type
     * @returns {Promise<any>}
     */
    this.releaseMastership = releaseMastership;

    /**
     * @alias requestMastershipAround
     * @memberof API.RWS
     * @param {any} args
     * @param {Function} func
     * @param {MastershipType} type
     * @returns {Promise<any>}
     */
    const requestMastershipAround = async function (func, args, type = 'edit') {
      let hasMastership = false;
      let error = null;

      return requestMastership(type)
        .then(() => {
          hasMastership = true;
          func.apply(this, args);
        })
        .then(() => releaseMastership(type))
        .then(() => {
          if (error !== null) return console.error('Failed to set value.', error);
          return Promise.resolve();
        })
        .catch((err) => {
          if (hasMastership === true) {
            error = err;
            return Promise.resolve();
          }
          return API.rejectWithStatus('Failed to get Mastership.', err);
        });
    };
    /**
     * @alias getMastershipState
     * @memberof API.RWS
     * @param {string} type - Mastership can be 'edit' and 'motion'
     * @returns {Promise<string>}
     */
    this.getMastershipState = async function (type = 'edit') {
      try {
        let res = await RWS.Network.get(`/rw/mastership/${type}`);
        let obj = parseJSON(res.responseText);
        return obj['state'][0]['mastership'];
      } catch (err) {
        console.error(err);
      }
    };

    function parseResponse(res) {
      let items = [];
      let obj = parseJSON(res.responseText);
      if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

      let resources = obj._embedded.resources;
      resources.forEach((item) => {
        let it = {};
        it.name = item._title;
        for (let prop in item) {
          if (prop.indexOf('_') === -1) {
            it[prop] = item[prop];
          }
        }
        items.push(it);
      });
      return items;
    }

    /**
     * @namespace MOTIONSYSTEM
     * @memberof API.RWS
     */
    this.MOTIONSYSTEM = new (function () {
      /**
       *
       * @typedef Mechunits
       * @prop {string} activationAllowed
       * @prop {string} driveModule
       * @prop {string} mode // 'Activated', ...
       * @prop {string} name
       * @memberof API.RWS.MOTIONSYSTEM
       */

      /**
       *
       * @typedef Mechunit
       * @prop {string} axes
       * @prop {string} axesTotal
       * @prop {string} coords
       * @prop {string} hasIntegratedUnit
       * @prop {string} isIntegratedUnit
       * @prop {string} jogMode
       * @prop {string} mode
       * @prop {string} payload
       * @prop {string} status
       * @prop {string} task
       * @prop {string} tool
       * @prop {string} totalPayload
       * @prop {string} type
       * @prop {string} wobj
       * @prop {string} name
       * @memberof API.RWS.MOTIONSYSTEM
       */

      /**
       * @alias getMechunits
       * @memberof API.RWS.MOTIONSYSTEM
       * @returns {Promise<Mechunits[]>}
       */
      this.getMechunits = async function () {
        try {
          let res = await RWS.Network.get('/rw/motionsystem/mechunits');
          let items = [];
          let obj = parseJSON(res.responseText);
          if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

          let resources = obj._embedded.resources;
          resources.forEach((item) => {
            let it = {};
            it.name = item._title;
            for (let prop in item) {
              if (prop.indexOf('_') === -1) {
                it[prop] = item[prop];
              }
            }
            items.push(it);
          });
          return items;
        } catch (err) {
          return API.rejectWithStatus('Could not get mechunits.', err);
        }
      };

      /**
       * @alias getMechunit
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {string} name Mechunit's name, e.g. 'ROB_1'
       * @returns {Promise<Mechunit>}
       */
      this.getMechunit = async function (name = 'ROB_1') {
        try {
          let res = await RWS.Network.get(`/rw/motionsystem/mechunits/${name}?continue-on-err=1`);
          let obj = parseJSON(res.responseText);

          let mechunit = {};

          mechunit.axes = obj.state[0].axes;
          mechunit.axesTotal = obj.state[0]['axes-total'];
          mechunit.coords = obj.state[0]['coord-system'];
          mechunit.hasIntegratedUnit = obj.state[0]['has-integrated-unit'];
          mechunit.isIntegratedUnit = obj.state[0]['is-integrated-unit'];
          mechunit.jogMode = obj.state[0]['jog-mode'];
          mechunit.mode = obj.state[0]['mode'];
          mechunit.payload = obj.state[0]['payload-name'];
          mechunit.status = obj.state[0]['status'];
          mechunit.task = obj.state[0]['task-name'];
          mechunit.tool = obj.state[0]['tool-name'];
          mechunit.totalPayload = obj.state[0]['total-payload-name'];
          mechunit.type = obj.state[0]['type'];
          mechunit.wobj = obj.state[0]['wobj-name'];
          mechunit.name = obj.state[0]._title;

          return mechunit;
        } catch (err) {
          return API.rejectWithStatus('Could not get mechunit.', err);
        }
      };

      /**
       * @typedef SetMechunitProps
       * @prop {string} [name]
       * @prop {string} [tool]
       * @prop {string} [wobj]
       * @prop {string} [coords]
       * @prop {string} [jogMode]
       * @prop {string} [mode]
       * @prop {string} [payload]
       * @prop {string} [totalPayload]
       * @memberof API.RWS.MOTIONSYSTEM
       */

      /**
       * @alias setMechunit
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {SetMechunitProps} props
       * @returns {Promise<any>}
       */
      this.setMechunit = async function ({
        name = 'ROB_1',
        tool = '',
        wobj = '',
        coords = '',
        payload = '',
        totalPayload = '',
        mode = '',
        jogMode = '',
      } = {}) {
        let url = `/rw/motionsystem/mechunits/${name}?continue-on-err=1`;
        let body = '';
        body += tool ? 'tool=' + tool : '';
        body += wobj ? (body ? '&' : '') + 'wobj=' + wobj : '';
        body += payload ? (body ? '&' : '') + 'payload=' + payload : '';
        body += totalPayload ? (body ? '&' : '') + 'total-payload=' + totalPayload : '';
        body += mode ? (body ? '&' : '') + 'mode=' + mode : '';
        body += jogMode ? (body ? '&' : '') + 'jog-mode=' + jogMode : '';
        body += coords ? (body ? '&' : '') + 'coord-system=' + coords : '';

        let res = await rwsPost(url, body, 'Failed to set mechunit.');
        return res;
      };

      /**
       * Set robot position target
       * @alias setRobotPositionTarget
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {API.MOTION.RobTarget} r
       * @returns {Promise<any>}
       */
      this.setRobotPositionTarget = function (r) {
        if (r.trans === undefined || r.rot === undefined || r.robconf === undefined) return Promise.reject("Parameter 'r' is not a robtarget.");

        let url = `/rw/motionsystem/position-target`;
        let body = `pos-x=${r.trans.x}&pos-y=${r.trans.y}&pos-z=${r.trans.z}&orient-q1=${r.rot.q1}&orient-q2=${r.rot.q2}&orient-q3=${
          r.rot.q3
        }&orient-q4=${r.rot.q4}&config-j1=${r.robconf.cf1}&config-j4=${r.robconf.cf4}&config-j6=${r.robconf.cf6}&config-jx=${
          r.robconf.cfx
        }&extjoint-1=${r.extax ? r.extax.eax_a : 9e9}&extjoint-2=${r.extax ? r.extax.eax_b : 9e9}&extjoint-3=${
          r.extax ? r.extax.eax_c : 9e9
        }&extjoint-4=${r.extax ? r.extax.eax_d : 9e9}&extjoint-5=${r.extax ? r.extax.eax_e : 9e9}&extjoint-6=${r.extax ? r.extax.eax_f : 9e9}`;

        return rwsPost(url, body, 'Failed to set robot position.');
      };

      /**
       * Allows the robot to GoTo the position defined in jointtarget parameter
       * @alias setRobotPositionJoint
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {API.MOTION.JointTarget} j
       * @returns {Promise<any>}
       */
      this.setRobotPositionJoint = function (j) {
        if (j.robax === undefined) return Promise.reject("Parameter 'j' is not a jointtarget.");

        let url = `/rw/motionsystem/position-joint`;
        let body = `robjoint=${j.robax.rax_1},${j.robax.rax_2},${j.robax.rax_3},${j.robax.rax_4},${j.robax.rax_5},${j.robax.rax_6}&extjoint=${
          j.extax ? j.extax.eax_a : 9e9
        },${j.extax ? j.extax.eax_b : 9e9},${j.extax ? j.extax.eax_c : 9e9},${j.extax ? j.extax.eax_d : 9e9},${j.extax ? j.extax.eax_e : 9e9},${
          j.extax ? j.extax.eax_f : 9e9
        }`;

        return rwsPost(url, body, 'Failed to set joint position.');
      };

      /**
       * Perform jogging. This RWS has to be applied cyclically during jogging
       * @alias jog
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {API.MOTION.JogData} jogdata Axis jogging speed
       * @param {number} ccount Counter value. Shall be obtained by {@link getChangeCount} before starting jogging
       * @returns {Promise<any>}
       */
      this.jog = async function (jogdata, ccount) {
        let url = `/rw/motionsystem/jog`;
        let body = `axis1=${jogdata[0]}&axis2=${jogdata[1]}&axis3=${jogdata[2]}&axis4=${jogdata[3]}&axis5=${jogdata[4]}&axis6=${jogdata[5]}&ccount=${ccount}`;

        return rwsPost(url, body, 'Failed to jog.');
      };

      this.getChangeCount = async function () {
        try {
          let res = await RWS.Network.get(`/rw/motionsystem?resource=change-count`);
          let obj = parseJSON(res.responseText);
          return obj['state'][0]['change-count'];
        } catch (err) {
          return API.rejectWithStatus('Could not get change counter.', err);
        }
      };

      /**
       * Get the current robot position
       * @alias getRobTarget
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {string} [tool]
       * @param {string} [wobj]
       * @param {string} [coords]
       * @param {string} [mechunit]
       * @returns {Promise<API.MOTION.RobTarget>}
       */
      this.getRobTarget = async function (tool = '', wobj = '', coords = '', mechunit = 'ROB_1') {
        let params = '';
        params += tool ? '?tool=' + tool : '';
        params += wobj ? (params ? '&' : '?') + 'wobj=' + wobj : '';
        params += coords ? (params ? '&' : '?') + 'coordinate=' + coords : '';

        let res = await RWS.Network.get(`/rw/motionsystem/mechunits/${mechunit}/robtarget${params}`);

        let obj = parseJSON(res.responseText);

        console.log('😛 getRobTarget:', obj);

        let rt = { trans: {}, rot: {}, robconf: {}, extax: {} };
        rt.trans.x = parseFloat(obj['state'][0]['x']);
        rt.trans.y = parseFloat(obj['state'][0]['y']);
        rt.trans.z = parseFloat(obj['state'][0]['z']);
        rt.rot.q1 = parseFloat(obj['state'][0]['q1']);
        rt.rot.q2 = parseFloat(obj['state'][0]['q2']);
        rt.rot.q3 = parseFloat(obj['state'][0]['q3']);
        rt.rot.q4 = parseFloat(obj['state'][0]['q4']);
        rt.robconf.cf1 = parseFloat(obj['state'][0]['cf1']);
        rt.robconf.cf4 = parseFloat(obj['state'][0]['cf4']);
        rt.robconf.cf6 = parseFloat(obj['state'][0]['cf6']);
        rt.robconf.cfx = parseFloat(obj['state'][0]['cfx']);
        rt.extax.eax_a = parseFloat(obj['state'][0]['eax_a']);
        rt.extax.eax_b = parseFloat(obj['state'][0]['eax_b']);
        rt.extax.eax_c = parseFloat(obj['state'][0]['eax_c']);
        rt.extax.eax_d = parseFloat(obj['state'][0]['eax_d']);
        rt.extax.eax_e = parseFloat(obj['state'][0]['eax_e']);
        rt.extax.eax_f = parseFloat(obj['state'][0]['eax_f']);

        return rt;
      };

      const parseJointTarget = function (jointTarget, toDegrees = false) {
        let jt = { robax: {}, extax: {} };
        let factor = 180 / Math.PI;
        console.log('😯', jointTarget, toDegrees, factor);
        jt.robax.rax_1 = toDegrees ? parseFloat(jointTarget['rax_1']) * factor : parseFloat(jointTarget['rax_1']);
        jt.robax.rax_2 = toDegrees ? parseFloat(jointTarget['rax_2']) * factor : parseFloat(jointTarget['rax_2']);
        jt.robax.rax_3 = toDegrees ? parseFloat(jointTarget['rax_3']) * factor : parseFloat(jointTarget['rax_3']);
        jt.robax.rax_4 = toDegrees ? parseFloat(jointTarget['rax_4']) * factor : parseFloat(jointTarget['rax_4']);
        jt.robax.rax_5 = toDegrees ? parseFloat(jointTarget['rax_5']) * factor : parseFloat(jointTarget['rax_5']);
        jt.robax.rax_6 = toDegrees ? parseFloat(jointTarget['rax_6']) * factor : parseFloat(jointTarget['rax_6']);
        jt.extax.eax_a = parseFloat(jointTarget['eax_a']);
        jt.extax.eax_b = parseFloat(jointTarget['eax_b']);
        jt.extax.eax_c = parseFloat(jointTarget['eax_c']);
        jt.extax.eax_d = parseFloat(jointTarget['eax_d']);
        jt.extax.eax_e = parseFloat(jointTarget['eax_e']);
        jt.extax.eax_f = parseFloat(jointTarget['eax_f']);
        return jt;
      };

      /**
       * Get the current joints position
       * @alias getJointTarget
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {string} mechunit
       * @returns {Promise<API.MOTION.JointTarget>}
       */
      this.getJointTarget = async function (mechunit = 'ROB_1') {
        let res = await RWS.Network.get(`/rw/motionsystem/mechunits/${mechunit}/jointtarget`);
        let obj = parseJSON(res.responseText);

        let jt = parseJointTarget(obj['state'][0], false);

        return jt;
      };

      /**
       *
       * @typedef JointsSolutionProps
       * @prop {string} [mechUnit]
       * @prop {API.MOTION.RobTarget} robTarget
       * @prop {API.MOTION.ToolData} [toolData]
       */

      /**
       * Get all joint solutions
       * @alias getAllJointsSolution
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {JointsSolutionProps} props
       * @returns {Promise<any>}
       */
      this.getAllJointsSolution = async function ({ mechUnit = 'ROB_1', robTarget, toolData }) {
        /*
         * {
         *   curr_position*	string
         *   [x,y,z]
         *
         *   curr_ext_joints*	string
         *   [j1,j2,j3,j4,j5,j6]
         *
         *   tool_frame_position*	string
         *   [x, y, z]
         *
         *   curr_orientation*	string
         *   [u0, u1, u2, u3]
         *
         *   tool_frame_orientation*	string
         *   [u0, u1, u2, u3]
         *
         *   robot_fixed_object*	string
         *   TRUE|FALSE
         *
         *   robot_configuration*	string
         *   [quarter_rev_j1, quarter_rev_j4, quarter_rev_j6, quarter_rev_jx]
         *
         *   }
         */
        const r = robTarget;
        const t = toolData ? toolData : { robhold: true, tframe: { trans: { x: 0, y: 0, z: 0 }, rot: { q1: 1, q2: 0, q3: 0, q4: 0 } } };
        const toMeters = 0.001;

        if (r.trans === undefined || r.rot === undefined || r.robconf === undefined)
          return Promise.reject("Parameter 'robTarget' is not a robtarget.");

        let url = `/rw/motionsystem/mechunits/${mechUnit}/all-joints-solution`;
        let body = `curr_position=[${r.trans.x * toMeters},${r.trans.y * toMeters},${r.trans.z * toMeters}]&curr_ext_joints=[${
          r.extax ? r.extax.eax_a : 9e9
        },${r.extax ? r.extax.eax_b : 9e9},${r.extax ? r.extax.eax_c : 9e9},${r.extax ? r.extax.eax_d : 9e9},${r.extax ? r.extax.eax_e : 9e9},${
          r.extax ? r.extax.eax_f : 9e9
        }]&tool_frame_position=[${t.tframe.trans.x * toMeters},${t.tframe.trans.y * toMeters},${t.tframe.trans.z * toMeters}]&curr_orientation=[${
          r.rot.q1
        },${r.rot.q2},${r.rot.q3},${r.rot.q4}]&tool_frame_orientation=[${t.tframe.rot.q1},${t.tframe.rot.q2},${t.tframe.rot.q3},${
          t.tframe.rot.q4
        }]&robot_fixed_object=${t.robhold ? 'TRUE' : 'FALSE'}&robot_configuration=[${r.robconf.cf1},${r.robconf.cf4},${r.robconf.cf6},${
          r.robconf.cfx
        }]`;

        let res = await rwsPost(url, body, 'Failed to get Joints from Cartesian');

        let toDegree = 180 / Math.PI;
        let jtArray = res.state.map((jointData) => {
          let jt = { robax: {}, extax: {}, robconf: {} };

          jt.robax.rax_1 = parseFloat(jointData['robotjoint1']) * toDegree;
          jt.robax.rax_2 = parseFloat(jointData['robotjoint2']) * toDegree;
          jt.robax.rax_3 = parseFloat(jointData['robotjoint3']) * toDegree;
          jt.robax.rax_4 = parseFloat(jointData['robotjoint4']) * toDegree;
          jt.robax.rax_5 = parseFloat(jointData['robotjoint5']) * toDegree;
          jt.robax.rax_6 = parseFloat(jointData['robotjoint6']) * toDegree;
          jt.extax.eax_a = parseFloat(jointData['extjoint1']);
          jt.extax.eax_b = parseFloat(jointData['extjoint2']);
          jt.extax.eax_c = parseFloat(jointData['extjoint3']);
          jt.extax.eax_d = parseFloat(jointData['extjoint4']);
          jt.extax.eax_e = parseFloat(jointData['extjoint5']);
          jt.extax.eax_f = parseFloat(jointData['extjoint6']);
          jt.robconf.cf1 = parseInt(jointData['quarter_rev_j11']);
          jt.robconf.cf4 = parseInt(jointData['quarter_rev_j4']);
          jt.robconf.cf6 = parseInt(jointData['quarter_rev_j6']);
          jt.robconf.cfx = parseInt(jointData['quarter_rev_jx']);

          return jt;
        });

        return jtArray;
      };

      /**
       *
       * @typedef JontsFromCartesianProps
       * @prop {string} [mechUnit]
       * @prop {API.MOTION.RobTarget} robTarget
       * @prop {API.MOTION.ToolData} [toolData]
       * @prop {API.MOTION.JointTarget} jointTarget
       */

      /**
       * Get all joint solutions
       * @alias getJointsFromCartesian
       * @memberof API.RWS.MOTIONSYSTEM
       * @param {JontsFromCartesianProps} props
       * @returns {Promise<any>}
       */
      this.getJointsFromCartesian = async function ({ mechUnit = 'ROB_1', robTarget, toolData, jointTarget }) {
        /*
         * {
         *    curr_position*	string
         *    [x,y,z]
         *
         *    curr_ext_joints*	string
         *    [j1,j2,j3,j4,j5,j6]
         *
         *    tool_frame_position*	string
         *    [x, y, z]
         *
         *    curr_orientation*	string
         *    [u0, u1, u2, u3]
         *
         *    tool_frame_orientation*	string
         *    [u0, u1, u2, u3]
         *
         *    old_rob_joints*	string
         *    [j1,j2,j3,j4,j5,j6]
         *
         *    old_ext_joints*	string
         *    [j1,j2,j3,j4,j5,j6]
         *
         *    robot_fixed_object*	string
         *    TRUE|FALSE
         *
         *    robot_configuration*	string
         *    [quarter_rev_j1, quarter_rev_j4, quarter_rev_j6, quarter_rev_jx]
         *
         *    elog_at_error*	string
         *    TRUE|FALSE
         *
         *  }
         */
        const r = robTarget;
        const j = jointTarget;
        const t = toolData ? toolData : { robhold: true, tframe: { trans: { x: 0, y: 0, z: 0 }, rot: { q1: 1, q2: 0, q3: 0, q4: 0 } } };

        const toRadians = Math.PI / 180;
        console.log('😯', toRadians);

        const toMeters = 0.001;

        if (r.trans === undefined || r.rot === undefined || r.robconf === undefined || j.robax === undefined)
          return Promise.reject("Parameter 'robTarget' is not a robtarget.");

        let url = `/rw/motionsystem/mechunits/${mechUnit}/joints-from-cartesian`;
        let body = `curr_position=[${r.trans.x * toMeters},${r.trans.y * toMeters},${r.trans.z * toMeters}]&curr_ext_joints=[${
          r.extax ? r.extax.eax_a : 9e9
        },${r.extax ? r.extax.eax_b : 9e9},${r.extax ? r.extax.eax_c : 9e9},${r.extax ? r.extax.eax_d : 9e9},${r.extax ? r.extax.eax_e : 9e9},${
          r.extax ? r.extax.eax_f : 9e9
        }]&tool_frame_position=[${t.tframe.trans.x},${t.tframe.trans.y},${t.tframe.trans.z}]&curr_orientation=[${r.rot.q1},${r.rot.q2},${r.rot.q3},${
          r.rot.q4
        }]&tool_frame_orientation=[${t.tframe.rot.q1},${t.tframe.rot.q2},${t.tframe.rot.q3},${t.tframe.rot.q4}]&old_rob_joints=[${
          j.robax.rax_1 * toRadians
        },${j.robax.rax_2 * toRadians},${j.robax.rax_3 * toRadians},${j.robax.rax_4 * toRadians},${j.robax.rax_5 * toRadians},${
          j.robax.rax_6 * toRadians
        }]&old_ext_joints=[${j.extax ? j.extax.eax_a : 9e9},${j.extax ? j.extax.eax_b : 9e9},${j.extax ? j.extax.eax_c : 9e9},${
          j.extax ? j.extax.eax_d : 9e9
        },${j.extax ? j.extax.eax_e : 9e9},${j.extax ? j.extax.eax_f : 9e9}]&robot_fixed_object=${
          t.robhold ? 'TRUE' : 'FALSE'
        }&robot_configuration=[${r.robconf.cf1},${r.robconf.cf4},${r.robconf.cf6},${r.robconf.cfx}]&elog_at_error=TRUE`;

        let res = await rwsPost(url, body, 'Failed to get Joints from Cartesian');

        let jt = { robax: {}, extax: {} };
        let toDegree = 180 / Math.PI;

        jt.robax.rax_1 = parseFloat(res.state[0]['robotjoint1']) * toDegree;
        jt.robax.rax_2 = parseFloat(res.state[0]['robotjoint2']) * toDegree;
        jt.robax.rax_3 = parseFloat(res.state[0]['robotjoint3']) * toDegree;
        jt.robax.rax_4 = parseFloat(res.state[0]['robotjoint4']) * toDegree;
        jt.robax.rax_5 = parseFloat(res.state[0]['robotjoint5']) * toDegree;
        jt.robax.rax_6 = parseFloat(res.state[0]['robotjoint6']) * toDegree;
        jt.extax.eax_a = parseFloat(res.state[0]['extjoint1']);
        jt.extax.eax_b = parseFloat(res.state[0]['extjoint2']);
        jt.extax.eax_c = parseFloat(res.state[0]['extjoint3']);
        jt.extax.eax_d = parseFloat(res.state[0]['extjoint4']);
        jt.extax.eax_e = parseFloat(res.state[0]['extjoint5']);
        jt.extax.eax_f = parseFloat(res.state[0]['extjoint6']);
        return jt;
      };
    })();

    /**
     * @namespace RAPID
     * @memberof API.RWS
     */
    this.RAPID = new (function () {
      /**
       * Load a module from controller HOME filesystem to RAPID
       * @alias loadModule
       * @memberof API.RWS.RAPID
       * @param {string} path Path to the module file in
       * the HOME directory (included extension of the module).
       * @param {boolean} [replace] If true, it will replace an existing module in RAPID with the same name
       * @param {string} [taskName] Task's name
       * @returns {Promise<any>}
       */
      this.loadModule = async function (path, replace = false, taskName = 'T_ROB1') {
        const f = async function () {
          return await RWS.Network.post(`/rw/rapid/tasks/${taskName}/loadmod?mastership=implicit`, 'modulepath=' + path + '&replace=' + replace);
        };
        return await requestMastershipAround(f);
      };

      /**
       * Unload a rapid module
       * @alias unloadModule
       * @memberof API.RWS.RAPID
       * @param {string} moduleName Module's name
       * @param {string} taskName Task's name
       * @returns {Promise<any>}
       */
      this.unloadModule = async function (moduleName, taskName = 'T_ROB1') {
        const f = function () {
          return RWS.Network.post(`/rw/rapid/tasks/${taskName}/unloadmod?mastership=implicit`, 'module=' + moduleName);
        };
        return await requestMastershipAround(f);
      };

      /**
       * Move the program pointer to an specific cursor position
       * @alias movePPToCursor
       * @memberof API.RWS.RAPID
       * @param {string} moduleName Module's name
       * @param {string} taskName Task's name
       * @param {string} line Line number where pointer is desired within the module file
       * @param {string} column Column number where pointer is desired within the module file
       * @returns {Promise<any>}
       */
      this.movePPToCursor = function (moduleName, taskName, line, column) {
        if (typeof moduleName !== 'string') return Promise.reject("Parameter 'module' is not a string.");
        if (typeof line !== 'string') return Promise.reject("Parameter 'line' is not a string.");
        if (typeof column !== 'string') return Promise.reject("Parameter 'column' is not a string.");

        let url = `/rw/rapid/tasks/${encodeURIComponent(taskName)}/pcp/cursor?mastership=implicit`;
        let body = `module=${encodeURIComponent(moduleName)}&line=${encodeURIComponent(line)}&column=${encodeURIComponent(column)}`;
        return rwsPost(url, body, 'Failed to set PP to cursor.');
      };
    })();

    /**
     * @namespace CFG
     * @memberof API.RWS
     */
    this.CFG = new (function () {
      /**
       * Delete an existing entry from the configuraiton database
       * @alias deleteConfigInstance
       * @memberof API.RWS.CFG
       * @param {string} name
       * @param {string} type
       * @param {string} domain
       * @returns {Promise<any>}
       */
      this.deleteConfigInstance = async function (name, type, domain) {
        const f = function () {
          return RWS.Network.delete(`/rw/cfg/${domain}/${type}/instances/${name}`);
        };
        return await requestMastershipAround(f);
      };
    })();
  })();

  rws.constructedRWS = true;
};

if (typeof API.constructedRWS === 'undefined') {
  factoryApiRws(API);
}

export default API;
export { factoryApiRws };
