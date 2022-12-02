'use strict';

var API = API || {};
if (typeof API.constructedRWS === 'undefined') {
  (function (rws) {
    // VERSION INFO
    rws.ECOSYSTEM_RWS_LIB_VERSION = '0.1';

    function parseJSON(json) {
      try {
        return JSON.parse(json);
      } catch (error) {
        return undefined;
      }
    }

    /**
     * Extension of RWS not yet available at the omnicore.rws SDK
     */
    rws.RWS = new (function () {
      this.MASTERSHIP = {
        Nomaster: 'nomaster',
        Remote: 'remote',
        Local: 'local',
        Internal: 'internal',
      };

      this.requestMastership = function (type = 'edit') {
        if (type === 'edit')
          return RWS.Mastership.request()
            .then(() => Promise.resolve())
            .catch((err) => API.rejectWithStatus('Could not get Mastership.', err));
        else if (type != '') type = type + '/';
        return this._post(
          `/rw/mastership/${type}request`,
          '',
          `Request ${type} mastership failed.`
        );
      };

      // Releases the Mastership, if it fails it should log the error and hide the rejection.
      this.releaseMastership = function (type = 'edit') {
        if (type === 'edit')
          return RWS.Mastership.release()
            .then(() => Promise.resolve())
            .catch((err) => {
              RWS.writeDebug(`Could not release Mastership. >>> ${err.message}`);
              return Promise.resolve();
            });
        else if (type != '') type = type + '/';
        return this._post(
          `/rw/mastership/${type}release`,
          '',
          `Release ${type} mastership failed.`
        );
      };

      this.requestMastershipAround = async function (func, args, type = 'edit') {
        let hasMastership = false;
        let error = null;

        return this.requestMastership(type)
          .then(() => {
            hasMastership = true;
            func.apply(this, args);
          })
          .then(() => this.releaseMastership(type))
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
       *
       * @param {string} type - Mastership can be 'edit' and 'motion'
       * @returns {string}
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

      this.MOTIONSYSTEM = new (function () {
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

        this.getMechunit = async function (mU = 'ROB_1') {
          try {
            let res = await RWS.Network.get(`/rw/motionsystem/mechunits/${mU}?continue-on-err=1`);
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

        this.setMechunit = async function (
          tool = '',
          wobj = '',
          payload = '',
          total_payload = '',
          mode = '',
          jog_mode = '',
          coords = '',
          mechunit = 'ROB_1'
        ) {
          let url = `/rw/motionsystem/mechunits/${mechunit}?continue-on-err=1`;
          let body = '';
          body += tool ? 'tool=' + tool : '';
          body += wobj ? (body ? '&' : '') + 'wobj=' + wobj : '';
          body += payload ? (body ? '&' : '') + 'payload=' + payload : '';
          body += total_payload ? (body ? '&' : '') + 'total-payload=' + total_payload : '';
          body += mode ? (body ? '&' : '') + 'mode=' + mode : '';
          body += jog_mode ? (body ? '&' : '') + 'jog-mode=' + jog_mode : '';
          body += coords ? (body ? '&' : '') + 'coord-system=' + coords : '';

          let res = await API.RWS._post(url, body, 'Failed to set mechunit.');
          return res;
        };

        this.setRobotPosition = function (r) {
          if (r.trans === undefined || r.rot === undefined || r.robconf === undefined)
            return Promise.reject("Parameter 'r' is not a robtarget.");

          let url = `/rw/motionsystem/position-target`;
          let body = `pos-x=${r.trans.x}&pos-y=${r.trans.y}&pos-z=${r.trans.z}&orient-q1=${
            r.rot.q1
          }&orient-q2=${r.rot.q2}&orient-q3=${r.rot.q3}&orient-q4=${r.rot.q4}&config-j1=${
            r.robconf.cf1
          }&config-j4=${r.robconf.cf4}&config-j6=${r.robconf.cf6}&config-jx=${
            r.robconf.cfx
          }&extjoint-1=${r.extjoint ? r.extax.eax_a : 9e9}&extjoint-2=${
            r.extax ? r.extax.eax_b : 9e9
          }&extjoint-3=${r.extax ? r.extax.eax_c : 9e9}&extjoint-4=${
            r.extax ? r.extax.eax_d : 9e9
          }&extjoint-5=${r.extax ? r.extax.eax_e : 9e9}&extjoint-6=${
            r.extax ? r.extax.eax_f : 9e9
          }`;

          return API.RWS._post(url, body, 'Failed to set robot position.');
        };

        this.jog = async function (jogdata, ccount) {
          let url = `/rw/motionsystem/jog`;
          let body = `axis1=${jogdata[0]}&axis2=${jogdata[1]}&axis3=${jogdata[2]}\
                      &axis4=${jogdata[3]}&axis5=${jogdata[4]}&axis6=${jogdata[5]}&ccount=${ccount}`;

          return API.RWS._post(url, body, 'Failed to jog.');
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

        this.getRobTarget = async function (tool = '', wobj = '', coords = '', mechunit = 'ROB_1') {
          let params = '';
          params += tool ? '?tool=' + tool : '';
          params += wobj ? (params ? '&' : '?') + 'wobj=' + wobj : '';
          params += coords ? (params ? '&' : '?') + 'coordinate=' + coords : '';

          let res = await RWS.Network.get(
            `/rw/motionsystem/mechunits/${mechunit}/robtarget${params}`
          );

          let obj = parseJSON(res.responseText);

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

        this.getJointTarget = async function (mechunit = 'ROB_1') {
          let res = await RWS.Network.get(`/rw/motionsystem/mechunits/${mechunit}/jointtarget`);
          let obj = parseJSON(res.responseText);

          let jt = { robax: {}, extax: {} };
          jt.robax.rax_1 = obj['state'][0]['rax_1'];
          jt.robax.rax_2 = obj['state'][0]['rax_2'];
          jt.robax.rax_3 = obj['state'][0]['rax_3'];
          jt.robax.rax_4 = obj['state'][0]['rax_4'];
          jt.robax.rax_5 = obj['state'][0]['rax_5'];
          jt.robax.rax_6 = obj['state'][0]['rax_6'];
          jt.extax.eax_a = obj['state'][0]['eax_a'];
          jt.extax.eax_b = obj['state'][0]['eax_b'];
          jt.extax.eax_c = obj['state'][0]['eax_c'];
          jt.extax.eax_d = obj['state'][0]['eax_d'];
          jt.extax.eax_e = obj['state'][0]['eax_e'];
          jt.extax.eax_f = obj['state'][0]['eax_f'];

          return jt;
        };
      })();

      this.RAPID = new (function () {
        this.loadModule = async function (path, isReplace = false, taskName = 'T_ROB1') {
          const f = async function () {
            return await RWS.Network.post(
              `/rw/rapid/tasks/${taskName}/loadmod`,
              'modulepath=' + path + '&replace=' + isReplace
            );
          };
          return await API.RWS.requestMastershipAround(f);
        };

        this.unloadModule = async function (moduleName, taskName = 'T_ROB1') {
          const f = function () {
            return RWS.Network.post(
              `/rw/rapid/tasks/${taskName}/unloadmod`,
              'module=' + moduleName
            );
          };
          return await API.RWS.requestMastershipAround(f);
        };

        this.movePPToCursor = function (moduleName, taskName, line, column) {
          if (typeof moduleName !== 'string')
            return Promise.reject("Parameter 'module' is not a string.");
          if (typeof line !== 'string') return Promise.reject("Parameter 'line' is not a string.");
          if (typeof column !== 'string')
            return Promise.reject("Parameter 'column' is not a string.");

          let url = `/rw/rapid/tasks/${encodeURIComponent(
            taskName
          )}/pcp/cursor?mastership=implicit`;
          let body = `module=${encodeURIComponent(moduleName)}&line=${encodeURIComponent(
            line
          )}&column=${encodeURIComponent(column)}`;

          // console.log(` ${url} ${body}`);
          return API.RWS._post(url, body, 'Failed to set PP to cursor.');
        };
      })();

      this.deleteConfigInstance = async function (name, type, domain) {
        const f = function () {
          return RWS.Network.delete(`/rw/cfg/${domain}/${type}/instances/${name}`);
        };
        return await API.RWS.requestMastershipAround(f);
      };

      this._post = function (url, body, error_msg) {
        return RWS.Network.post(url, body)
          .then(() => Promise.resolve())
          .catch((err) => {
            return API.rejectWithStatus(error_msg, err);
          });
      };
    })();

    rws.constructedRWS = true;
  })(API);
}
