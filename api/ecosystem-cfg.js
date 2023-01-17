'use strict';

var API = API || {};
if (typeof API.constructedCfg === 'undefined') {
  (function (cfg) {
    /**
     * @alias ECOSYSTEM_CFG_LIB_VERSION
     * @memberof API
     * @constant
     * @type {number}
     */
    cfg.ECOSYSTEM_CFG_LIB_VERSION = '0.2';

    /**
     * @alias API.CONFIG
     * @namespace
     * @property {enum} DOMAIN
     * @property {enum} TYPE
     */
    cfg.CONFIG = {
      DOMAIN: {
        EIO: 'EIO',
        SYS: 'SYS',
        MOC: 'MOC',
      },
      TYPE: {
        SIGNAL: 'EIO_SIGNAL',
        CROSS: 'EIO_CROSS',
        ETHERNETIP: 'ETHERNETIP_DEVICE',
      },
    };

    /**
     * Loads a configuration file on the controller configuration data base.
     * A controller restart is required after loading a new configuration to make this configuration effective.
     * @alias loadConfiguration
     * @memberof API.CONFIG
     * @param  {string} filepath : the path to the file, including file name
     * @param  {string} action="replace" :the validation method, valid values: 'add', 'replace' and 'add-with-reset'.
     */
    cfg.loadConfiguration = async function (filepath, action = 'add') {
      try {
        const answer = await RWS.CFG.loadConfiguration(filepath, action);
      } catch (e) {
        console.error(e);
        API.rejectWithStatus(`Failed to load ${filepath} `, e);
      }
    };

    /**
     * @alias API.CONFIG.DEVICE
     * @namespace
     */
    cfg.DEVICE = new (function () {
      /**
       * @alias fetchEthernetIPDevices
       * @memberof API.CONFIG
       * @returns {Promise<object[]>} - List of device objects including containing signals
       * @private
       */
      const fetchEthernetIPDevices = async function () {
        const ethernetIPDevices = [];
        try {
          const ethIPDevices = await RWS.CFG.getInstances(
            API.CONFIG.DOMAIN.EIO,
            API.CONFIG.TYPE.ETHERNETIP
          );

          for (let device of ethIPDevices) {
            ethernetIPDevices.push({
              name: device.getInstanceName(),
              signals: [],
            });
          }

          const eioSignals = await RWS.CFG.getInstances(
            API.CONFIG.DOMAIN.EIO,
            API.CONFIG.TYPE.SIGNAL
          );
          for (const signal of eioSignals) {
            let attr = signal.getAttributes();
            for (let item of ethernetIPDevices) {
              attr.Device === item.name && item.signals.push({ attributes: attr });
            }
          }

          return ethernetIPDevices;
        } catch (e) {
          console.error(e);
          FPComponents.Popup_A.message(`ethDevices - Exception occurs:`, [
            e.message,
            `Code: ${e.controllerStatus.code}`,
            e.controllerStatus.description,
          ]);
          return undefined;
        }
      };

      /**
       * Search for avalable Ethernet/IP devices
       * @alias searchEthernetIPDevices
       * @memberof API.CONFIG.DEVICE
       * @returns {Promise<object[]>} - List of device names
       */
      this.searchEthernetIPDevices = async function () {
        const devices = [];
        const ethIPDevices = await fetchEthernetIPDevices();

        for (let device of ethIPDevices) {
          devices.push(device.name);
        }

        return devices;
      };

      // /**
      //  *
      //  * @alias isAnySignalMappedTo
      //  * @memberof API.CONFIG
      //  * @param {object} attr
      //  * @returns {Promise<object[]>} - List of device names
      //  * @private
      //  */
      // const isAnySignalMappedTo = async function (attr) {
      //   const ethIPDevices = await fetchEthernetIPDevices();
      //   const device = ethIPDevices.find((dev) => dev.name === attr.device);
      //   console.log(device);
      //   const found =
      //     device &&
      //     device.signals.some(
      //       (signal) =>
      //         signal.attributes.DeviceMap === attr.map &&
      //         signal.attributes.SignalType === attr.type &&
      //         signal.attributes.Name !== attr.name
      //     );
      //   console.log(found);
      //   return found;
      // };

      /**
       * @alias find
       * @memberof API.CONFIG.DEVICE
       * @param {object} attr An object with the following information:
       * <br>&emsp;(string) name signal name
       * <br>&emsp;(string) device device name
       * <br>&emsp;(string) map device map name
       * @returns {Promise<object | undefined>} API.CONFIG.Signal instance if found, otherwise undefined
       */
      this.find = async function (attr) {
        const ethIPDevices = await fetchEthernetIPDevices();

        const checkCondition = function (device) {
          return (
            device &&
            device.signals.find(
              (signal) =>
                (attr.hasOwnProperty('map') ? signal.attributes.DeviceMap === attr.map : true) &&
                (attr.hasOwnProperty('type') ? signal.attributes.SignalType === attr.type : true) &&
                (attr.hasOwnProperty('name') ? signal.attributes.Name === attr.name : true)
            )
          );
        };

        let found = undefined;
        if (attr.hasOwnProperty('device')) {
          const device = ethIPDevices.find((dev) => dev.name === attr.device);
          found = checkCondition(device);
        } else {
          for (const device of ethIPDevices) {
            found = checkCondition(device);
            if (found) break;
          }
        }
        return found ? API.SIGNAL.getSignal(found.attributes.Name) : found;
      };
    })();

    /**
     * @alias API.CONFIG.SIGNAL
     * @namespace
     */
    cfg.SIGNAL = new (function () {
      this.signals = [];
      this.crossConns = [];

      // class Instance {
      //   constructor(attr) {
      //     this._attr = attr;
      //     this.modified = false;
      //     this.InstanceType = undefined;
      //   }

      //   /**
      //    *
      //    */
      //   async updateAttributes(attr) {
      //     const f = function (key) {
      //       this._attr[key] = attr[key];
      //     };
      //     Object.keys(attr).forEach(f.bind(this));

      //     if (!this.InstanceType) {
      //       console.error('Instance type is not defined');
      //       return;
      //     }

      //     await API.SIGNAL.updateInstanceAttributes(attr, this.InstanceType);
      //     this.modified = true;
      //   }
      // }

      // class crossConnection extends Instance {
      //   constructor() {
      //     super(attr);
      //     this.InstanceType = API.CONFIG.TYPE.CROSS;
      //   }
      //   set attr(a) {
      //     this.updateAttributes(a);
      //   }
      // }

      /**
       * Signal class containing all relevant elements to access the signal
       * and its configuration.
       * Instance of this class can be created by {@link API.CONFIG.createSignal()} when creating a new signal
       * or {@link API.CONFIG.getSignal()} when looking for an existing one.
       * @class Signal
       * @memberof API.CONFIG.SIGNAL
       * @param {string} name - Name of the signal
       * @param {string|object} signal - Instance of a RWS.IO.getSignal(name)
       * @param {object} config - Object from signal.getConfigInstance(name, API.CONFIG.TYPE.SIGNAL)
       * @param {Object} attr - Attribute properties comming out of config.getAttributes();
       * @example
       *  const mySignal = await API.SIGNAL.getSignal('signal_name');
       */
      class Signal {
        constructor(name, signal, attr) {
          this.name = name;
          this.signal = signal;
          this._attr = attr;
          this.InstanceType = API.CONFIG.TYPE.SIGNAL;

          this.signal ? (this.modified = false) : (this.modified = true);
        }

        async getValue() {
          try {
            await this.signal.fetch();
            return await this.signal.getValue();
          } catch (e) {
            return API.rejectWithStatus(`Failed to get value of signal ${this.name}`, e); // fallback value
          }
        }

        async setValue(v) {
          try {
            if (!this.signal)
              return API.rejectWithStatus(
                `Signal ${this.name} not yet availabe. If confiugred a system restart may be required.`
              );
            return await this.signal.setValue(v);
          } catch (e) {
            return API.rejectWithStatus(`Failed to set value of signal ${this.name}`, e);
          }

          // this.signal && this.signal.setValue(v)
        }

        get type() {
          return this._attr.SignalType;
        }

        get device() {
          return this._attr.Device;
        }

        get map() {
          return this._attr.DeviceMap;
        }

        get active() {
          return this.signal === null ? false : true;
        }

        // set attr(a) {
        //   const f = function (key) {
        //     this._attr[key] = a[key];
        //   };
        //   Object.keys(a).forEach(f.bind(this));

        //   API.SIGNAL.updateSignalAttributes(a);
        //   this.modified = true;
        // }

        async setAttr(a) {
          const f = function (key) {
            this._attr[key] = a[key];
          };
          Object.keys(a).forEach(f.bind(this));

          await API.SIGNAL.updateSignalAttributes(a);
          this.modified = true;
        }

        /**
         * Subscribe to the signal and set the callback function
         * @param {function} callback function to be called on change
         * @returns {undefined | Promise<{}>} - undefine if success, otherwise a reject Promise
         */
        async subscribe(callback) {
          try {
            if (!this.signal)
              return API.rejectWithStatus(`Signal ${this.name} not available for subscription`);

            return await this.signal.subscribe(true);
          } catch (e) {
            return API.rejectWithStatus(`Failed to subscribe to signal ${this.name}`, e);
          }
        }

        async unsubscribe() {
          return await this.signal.unsubscribe();
        }

        onChanged(callback) {
          try {
            if (!this.signal) {
              console.log(`Signal ${this.name} not available for subscription`);
              return;
            }
            const cb = async (value) => {
              // first time this is called, newValue is undefined.
              if (value === undefined) {
                value = await this.signal.getValue();
              }
              callback(value);
            };
            this.signal.addCallbackOnChanged(cb.bind(this));
            // force the callback to update to current value
            cb();
          } catch (e) {
            return API.rejectWithStatus(`Failed to add callback to signal ${this.name}`, e);
          }
        }
      }

      /**
       * Creates a new signal in the config databes in case this is not already existing.
       * If exists, then the attributes are taken from the existing one
       * @alias createSignal
       * @memberof API.CONFIG.SIGNAL
       * @param {*} name
       * @param {*} attr
       * @returns {Promise<object>}
       */
      this.createSignal = async (name, attr = {}) => {
        const found = this.signals.find((s) => s.name === name);

        if (found) return found;

        let signal = null;
        attr.Name = name;

        try {
          signal = await RWS.IO.getSignal(name);
          let config = await this.getConfigInstance(name, API.CONFIG.TYPE.SIGNAL);
          attr = await config.getAttributes();
        } catch (e) {
          try {
            let config = await this.getConfigInstance(name, API.CONFIG.TYPE.SIGNAL);
            attr = await config.getAttributes();
          } catch (e) {
            // Signal instance NOT found, create a config instance
            if (!attr.Name || !attr.SignalType || !attr.Access)
              return API.rejectWithStatus(
                `Mandatory attributes missing: ${!attr.Name ? 'Name ' : ''}${
                  !attr.SignalType ? 'SignalType ' : ''
                }${!attr.Access ? 'Access ' : ''} `
              );
            this.createSignalInstance(attr);
            let config = await this.getConfigInstance(attr.Name, API.CONFIG.TYPE.SIGNAL);
          }
        }
        const s = new Signal(name, signal, attr);
        if (signal) {
          s.subscribe();
          this.signals.push(s);
        }

        return s;
      };

      /**
       * Gets an Instance of API.CONFIG.Signal connected to an existing signal .
       * If not found a Promise.reject is returned
       * @alias getSignal
       * @memberof API.CONFIG.SIGNAL
       * @param {string} name
       * @returns {Promise<object>}
       */
      this.getSignal = async function (name) {
        if (name) {
          let found = this.signals.find((signal) => signal.name === name);
          if (found) return found;
          try {
            const signal = await RWS.IO.getSignal(name);
            let config = await this.getConfigInstance(name, API.CONFIG.TYPE.SIGNAL);
            let attr = await config.getAttributes();
            const s = new Signal(name, signal, attr);
            //check again before pushing
            const findIndex = this.signals.findIndex((signal) => signal.name === name);
            findIndex !== -1 ? (this.signals[findIndex] = s) : this.signals.push(s);
            return s;
          } catch (e) {
            return API.rejectWithStatus(`Failed to get signal ${name}`, e);
          }
        } else {
          throw new Error('API.SIGNAL.getSignal: name parameter is empty!');
        }
      };

      /**
       * Get a configuration instace from RWS.CFG Namespace
       * @param {string} name -- name of the insance
       * @param {string} type -- supported types: EIO_SIGNAL, EIO_CROSS
       * @returns {object}The cofiguration instace
       */
      this.getConfigInstance = async function (name, type) {
        try {
          const instance = await RWS.CFG.getInstanceByName(API.CONFIG.DOMAIN.EIO, type, name);
          return instance;
        } catch (e) {
          return API.rejectWithStatus(
            `Configuration instance ${name} not found in current configuration...`,
            e
          );
          // return null
        }
      };

      /**
       * Get the attributes of a signal
       * @return {object} The attributes of a signal
       */
      this.getSignalAttributes = async function (name) {
        try {
          // Check if instance is configured (which does not necesarily means that the signal is already availabe),
          // after creating an instance, a Reboot is reqiured
          let config = await this.getConfigInstance(name, API.CONFIG.TYPE.SIGNAL);
          let attr = null;
          if (config !== null) attr = config.getAttributes();
          return attr;
        } catch (e) {
          // if singal not available, then an exception will occur
          console.error(`Error while getting attributes of a signal ${name} `);
          return null;
        }
      };

      /**
       * Get the attributes of a signal
       * @return {object} The attributes of a signal
       */
      this.getCrossConnectionAttributes = async function (name) {
        try {
          // Check if instance is configured (which does not necesarily means that the signal is already availabe),
          // after creating an instance, a Reboot is reqiured
          let config = await this.getConfigInstance(name, API.CONFIG.TYPE.CROSS);
          let attr = null;
          if (config !== null) attr = config.getAttributes();
          return attr;
        } catch (e) {
          // if singal not available, then an exception will occur
          console.error(`Error while getting attributes of the cross-conneciton ${name} `);
          return null;
        }
      };

      /**
       * Create signal configuraiton instance with attributes
       */
      this.createConfigInstance = async function (name, type) {
        try {
          await RWS.CFG.createInstance(API.CONFIG.DOMAIN.EIO, type, name);
        } catch (e) {
          return API.rejectWithStatus(`Failed to create configuration instance of ${name}`, e);
        }
      };

      this.createSignalInstance = async function (attr) {
        try {
          await this.createConfigInstance(attr.Name, API.CONFIG.TYPE.SIGNAL);
          await this.updateSignalAttributes(attr);
        } catch (e) {
          throw e;
        }
      };

      this.createCrossConnectionInstance = async function (attr) {
        try {
          this.createConfigInstance(attr.Name, API.CONFIG.TYPE.CROSS);
          this.updateCrossConnectionAttributes(attr);
        } catch (e) {
          throw e;
        }
      };

      /**
       * Modify the attributes of a signal present in the configuration database
       * If the signal does not exist, no action is taken
       * @param {*} attr
       */

      this.updateInstanceAttributes = async function (attr, type) {
        try {
          await RWS.CFG.updateAttributesByName(API.CONFIG.DOMAIN.EIO, type, attr.Name, attr);
        } catch (err) {
          console.error(err);
        }
      };

      this.updateSignalAttributes = async function (attr) {
        if (attr.Device === '') {
          console.log('Device is a empty string...');
          delete attr.Device;
          await API.SIGNAL.deleteSignal(attr.Name);
          await API.SIGNAL.createConfigInstance(attr.Name, API.CONFIG.TYPE.SIGNAL);
        }

        await this.updateInstanceAttributes(attr, API.CONFIG.TYPE.SIGNAL);
      };

      this.updateCrossConnectionAttributes = async function (attr) {
        await this.updateInstanceAttributes(attr, API.CONFIG.TYPE.CROSS);
      };

      this.fetchAllInstancesFromType = async function (type) {
        try {
          const instances = await RWS.CFG.getInstances(API.CONFIG.DOMAIN.EIO, type);
          return instances;
        } catch (err) {
          console.error(err);
          return undefined;
        }
      };

      this.fetchAllCrossConnections = async function () {
        try {
          const ccs = await this.fetchAllInstancesFromType(API.CONFIG.TYPE.CROSS);
          if (!ccs) return;
          this.crossConns.length = 0;
          this.crossConns.push(...ccs);
          return this.crossConns;
        } catch (err) {
          console.error(err);
          throw err;
        }
      };

      /**
       * Search for available signals in the controller.
       * @alias search
       * @memberof API.CONFIG.SIGNAL
       * @param {Object} filter - The result can be filtered by using
       * an object with the following possible elements:
       *     <br>&emsp;(string) name signal name
       *     <br>&emsp;(string) device device name
       *     <br>&emsp;(string) network network name
       *     <br>&emsp;(string) category category string
       *     <br>&emsp;(string) category-pon
       *     <br>&emsp;(string) type type of signal, valid values: 'DI', 'DO', 'AI', 'AO', 'GI' or 'GO'
       *     <br>&emsp;(boolean) invert inverted signals
       *     <br>&emsp;(boolean) blocked blocked signals
       *
       * Search system for signals matching the filter. The signal name does not have to be an exact match,
       * any signal where the filter value is a substring of the name will be returned.
       * The type filter can contain several types by grouping the values within '[', ']'
       * and separated by ',', e.g. '["DI","DO"]'.
       *
       *  Example:
       *       var filter = {
       *             name: 'TestDI',
       *       }
       * @returns {Promise<object[]>} - List of API.CONFIG.SIGNAL.Signal instances
       */
      this.search = async function (filter = {}, onlyName = false) {
        try {
          var ss = await RWS.IO.searchSignals(filter);
          if (onlyName)
            return ss.map((s) => {
              return s.getName();
            });
          const signals = [];
          for (var i = 0; i < ss.length; i++) {
            signals.push(await this.getSignal(ss[i].getName()));
          }
          return signals;
        } catch (e) {
          return API.rejectWithStatus('Failed to serach signals', e);
        }
      };

      const fetchAllSignals = async () => {
        console.log('🤷‍♂️');
        this.fetchAllSignalsCalled = true;
        try {
          const ss = await this.search({});
          this.fetchAllSignalsDone = true;
          return ss;
        } catch (err) {
          console.error(err);
          throw err;
        }
      };

      const getAllSignals = async () => {
        if (this.fetchAllSignalsCalled) {
          try {
            const ret = await Promise.race([
              API.waitForCondition(() => {
                return this.fetchAllSignalsDone === true;
              }),
              API.timeout(5), // secs
            ]);
            return this.signals;
          } catch (e) {
            return API.rejectWithStatus(`Faile while getting all signals`, e);
          }
        } else {
          return await fetchAllSignals();
        }
      };

      // this.getSignalByName = async (name) => {
      //   const signals = await getAllSignals();
      //   return signals.find((signal) => signal.name === name);
      // };

      this.searchByName = async (name) => {
        const signals = await this.search({ name: name });
        return signals.length === 1 ? signals[0] : signals;
      };

      this.searchByCategory = async (category) => {
        const signals = await this.search({ category: category });
        return signals.length === 1 ? signals[0] : signals;
      };

      // this.getSignalsOfType = async (type, device = null) => {
      //   const signals = await getAllSignals();
      //   const sot = signals.filter((s) => {
      //     const ret = device === null ? s.type === type : s.type === type && s.device === device;
      //     return ret;
      //   });
      //   return sot;
      // };

      this.searchByType = async (type, device = null) => {
        if (Array.isArray(type)) {
          const t = type.join(',');
          type = `[${t}]`;
        }
        return device === null
          ? await this.search({ type: type })
          : await this.search({ type: type, device: device });
      };

      this.isAnySignalModified = async () => {
        // const signals = await getAllSignals();
        return this.signals.some((signal) => signal.modified === true);
      };

      this.isAnyInputMappedTo = (attr) => {
        const device = API.DEVICE.ethernetIP.find((dev) => dev.device === attr.Device);
        const found =
          device &&
          device.signals.some(
            (signal) =>
              signal.map === attr.Map &&
              signal.type === attr.SignalType &&
              signal.name !== attr.Name
          );
        return found;
      };

      this.deleteConfigInstance = async function (name, type) {
        try {
          await API.RWS.deleteConfigInstance(name, type, API.CONFIG.DOMAIN.EIO);
        } catch (e) {
          console.error(`Error while deleting configuration instance ${name}`);
          return null;
        }
      };

      // ToDo: remove from this.crossConns
      // ToDo: handle reject
      this.deleteCrossConnection = async function (name) {
        return await this.deleteConfigInstance(name, API.CONFIG.TYPE.CROSS);
      };

      // ToDo: remove from this.signals
      // ToDo: handle reject
      this.deleteSignal = async function (name) {
        return await this.deleteConfigInstance(name, API.CONFIG.TYPE.SIGNAL);
      };
    })();

    cfg.constructedCfg = true;
  })(API);
}
