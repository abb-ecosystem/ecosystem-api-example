import API from './ecosystem-base.js';

const factoryApiCfg = function (cfg) {
  /**
   * @alias API.CONFIG
   * @namespace
   * @property {enum} DOMAIN
   * @property {enum} TYPE
   */
  cfg.CONFIG = new (function () {
    /**
     * Enum for configuration domains
     * @readonly
     * @enum {string}
     * @memberof API.CONFIG
     */
    this.DOMAIN = {
      EIO: 'EIO',
      SYS: 'SYS',
      MOC: 'MOC',
    };

    /**
     * Enum for configuration types
     * @readonly
     * @enum {string}
     * @memberof API.CONFIG
     */
    this.TYPE = {
      SIGNAL: 'EIO_SIGNAL',
      CROSS: 'EIO_CROSS',
      ETHERNETIP: 'ETHERNETIP_DEVICE',
    };
    /**
     * Loads a configuration file on the controller configuration data base.
     * A controller restart is required after loading a new configuration to make this configuration effective.
     * @alias loadConfiguration
     * @memberof API.CONFIG
     * @param  {string} filepath : the path to the file, including file name
     * @param  {RWS.CFG.LoadMode} action="replace" :the validation method, valid values: 'add', 'replace' and 'add-with-reset'.
     */
    this.loadConfiguration = async function (filepath, action = RWS.CFG.LoadMode.add) {
      try {
        const answer = await RWS.CFG.loadConfiguration(filepath, action);
      } catch (e) {
        console.error(e);
        API.rejectWithStatus(`Failed to load ${filepath} `, e);
      }
    };

    /**
     * Get the attributes of a signal
     * @alias getSignalAttributes
     * @memberof API.CONFIG
     * @return {Promise<object>} The attributes of a signal
     */
    this.getSignalAttributes = async function (name) {
      try {
        // Check if instance is configured (which does not necesarily means that the signal is already availabe),
        // after creating an instance, a Reboot is reqiured
        let config = await RWS.CFG.getInstanceByName(API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.SIGNAL, name);

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
     * @alias getCrossConnectionAttributes
     * @memberof API.CONFIG
     * @return {Promise<object>} The attributes of a signal
     */
    this.getCrossConnectionAttributes = async function (name) {
      try {
        // Check if instance is configured (which does not necesarily means that the signal is already availabe),
        // after creating an instance, a Reboot is reqiured
        let config = await RWS.CFG.getInstanceByName(API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.CROSS, name);
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
     * Create a SIGNAL configuraiton instance with attributes
     * @alias createSignalInstance
     * @memberof API.CONFIG
     * @returns {Promise<any>} - A Promise which is empty if it resolves and contains a status if it is rejected.
     */
    this.createSignalInstance = async function (attr) {
      try {
        await RWS.CFG.createInstance(API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.SIGNAL, attr.Name);
        await this.updateSignalAttributes(attr);
      } catch (e) {
        throw e;
      }
    };

    /**
     * Create a Cross-Conneciton configuraiton instance with attributes
     * @alias createCrossConnectionInstance
     * @memberof API.CONFIG
     * @returns {Promise<any>} - A Promise which is empty if it resolves and contains a status if it is rejected.
     */
    this.createCrossConnectionInstance = async function (attr) {
      try {
        await RWS.CFG.createInstance(API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.CROSS, attr.Name);
        this.updateCrossConnectionAttributes(attr);
      } catch (e) {
        throw e;
      }
    };

    /**
     * Updates attributes of a signal instance in the configuration data-base.
     * The attributes Object should only contain valid members, i.e. attributes valid for the instance’s specific Type, and the corresponding values.
     * @alias updateSignalAttributes
     * @memberof API.CONFIG
     * @returns {Promise<object>} - A Promise with an instance object
     */
    this.updateSignalAttributes = async function (attr) {
      if (attr.Device === '') {
        console.log('Device is a empty string...');
        delete attr.Device;
        await this.deleteSignal(attr.Name);
        await RWS.CFG.createInstance(API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.SIGNAL, attr.Name);
      }

      await RWS.CFG.updateAttributesByName(API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.SIGNAL, attr.Name, attr);
    };

    /**
     * Updates attributes of a cross-connection instance in the configuration data-base.
     * The attributes Object should only contain valid members, i.e. attributes valid for the instance’s specific Type, and the corresponding values.
     * @alias updateCrossConnectionAttributes
     * @memberof API.CONFIG
     * @returns {Promise<object>} - A Promise with an instance object
     */
    this.updateCrossConnectionAttributes = async function (attr) {
      await RWS.CFG.updateAttributesByName(API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.CROSS, attr.Name, attr);
    };

    /**
     * Get all instances on a type
     * @alias fetchAllInstancesOfType
     * @param {API.CONFIG.TYPE} type - Type of the instance to be fetch from controller
     * @memberof API.CONFIG
     * @returns {Promise<object[]>} - A Promise with an list of objects
     */
    this.fetchAllInstancesOfType = async function (type) {
      try {
        const instances = await RWS.CFG.getInstances(API.CONFIG.DOMAIN.EIO, type);
        return instances;
      } catch (e) {
        return API.rejectWithStatus(`Failed to fetch instances of type ${type}`, e);
      }
    };

    /**
     * Get all cross-connection instances
     * @alias fetchAllCrossConnections
     * @memberof API.CONFIG
     * @returns {Promise<object[]>} - A Promise with an list of objects
     */
    this.fetchAllCrossConnections = async function () {
      return await this.fetchAllInstancesOfType(API.CONFIG.TYPE.CROSS);
    };

    /**
     * Get all signal instances
     * @alias fetchAllSignals
     * @memberof API.CONFIG
     * @returns {Promise<object[]>} - A Promise with an list of objects
     */
    this.fetchAllSignals = async function () {
      return await this.fetchAllInstancesOfType(API.CONFIG.TYPE.SIGNAL);
    };

    /**
     * Delete a cross-conneciton instance from the configuration data-base.
     * @alias deleteCrossConnection
     * @memberof API.CONFIG
     * @returns {Promise<any>} - A Promise which is empty if it resolves and contains a status if it is rejected.
     * @private
     */
    this.deleteCrossConnection = async function (name) {
      return await API.RWS.CFG.deleteConfigInstance(name, API.CONFIG.TYPE.CROSS, API.CONFIG.DOMAIN.EIO);
    };

    /**
     * Delete a signal instance from the configuration data-base.
     * @alias deleteSignal
     * @memberof API.CONFIG
     * @returns {Promise<any>} - A Promise which is empty if it resolves and contains a status if it is rejected.
     * @private
     */
    this.deleteSignal = async function (name) {
      return await API.RWS.CFG.deleteConfigInstance(name, API.CONFIG.TYPE.SIGNAL, API.CONFIG.DOMAIN.EIO);
    };
  })();

  /**
   * @alias API.DEVICE
   * @namespace
   */
  cfg.DEVICE = new (function () {
    /**
     * @alias fetchEthernetIPDevices
     * @memberof API
     * @returns {Promise<object[]>} - List of device objects including containing signals
     * @private
     */
    const fetchEthernetIPDevices = async function () {
      const ethernetIPDevices = [];
      try {
        const ethIPDevices = await RWS.CFG.getInstances(API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.ETHERNETIP);

        for (let device of ethIPDevices) {
          ethernetIPDevices.push({
            name: device.getInstanceName(),
            signals: [],
          });
        }

        const eioSignals = await RWS.CFG.getInstances(API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.SIGNAL);
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
     * @returns {Promise<string[]>} - List of device names
     */
    this.searchEthernetIPDevices = async function () {
      const devices = [];
      const ethIPDevices = await fetchEthernetIPDevices();

      for (let device of ethIPDevices) {
        devices.push(device.name);
      }

      return devices;
    };
    /**
     * @typedef API.DEVICE.SignalAttributesProp
     * @prop {string} [name] Name of the signal
     * @prop {string} [device] Device to which the signal is assigned
     * @prop {string} [map] Mapping number
     * @prop {string} [type] Type of signal: 'DI' | 'DO' | 'AI' | 'AO' | 'GI' | 'GO'
     */

    /**
     * @alias find
     * @memberof API.DEVICE
     * @param {API.DEVICE.SignalAttributesProp} attr An object with the following information:
     * <br>&emsp;(string) name signal name
     * <br>&emsp;(string) device device name
     * <br>&emsp;(string) map device map name
     * <br>&emsp;(string) type signal type: : 'DI' | 'DO' | 'AI' | 'AO' | 'GI' | 'GO'
     * @returns {Promise<object | undefined>} API.Signal instance if found, otherwise undefined
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
   * @alias API.SIGNAL
   * @namespace
   * @property {API.SIGNAL.Signal} Signal
   */
  cfg.SIGNAL = new (function () {
    this.signals = [];

    /**
     * Signal class containing all relevant elements to access the signal
     * and its configuration.
     * Instance of this class can be created by {@link API.SIGNAL.createSignal()} when creating a new signal
     * or {@link API.SIGNAL.getSignal()} when looking for an existing one.
     * @class Signal
     * @memberof API.SIGNAL
     * @param {string} name - Name of the signal
     * @param {string|object} signal - Instance of a RWS.IO.getSignal(name)
     * @param {object} config - Object from RWS.CFG.getInstanceByName(
     *     API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.SIGNAL, name);
     * @param {Object} attr - Attribute properties comming out of config.getAttributes();
     * @example
     *  const mySignal = await API.SIGNAL.getSignal('signal_name');
     * @todo define the config object returne from RWS
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

      async setValue(value) {
        const v = value ? 1 : 0;
        try {
          if (!this.signal) return API.rejectWithStatus(`Signal ${this.name} not yet availabe. If confiugred a system restart may be required.`);
          return await this.signal.setValue(v);
        } catch (e) {
          return API.rejectWithStatus(`Failed to set value of signal ${this.name}`, e);
        }
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

      async updateSignalAttributes(a) {
        const f = function (key) {
          this._attr[key] = a[key];
        };
        Object.keys(a).forEach(f.bind(this));

        await API.CONFIG.updateSignalAttributes(a);
        this.modified = true;
      }

      /**
       * Subscribe to the signal and set the callback function
       * @param {boolean} [raiseInitial] flag indicating whether an initial event is raised when subscription is registered
       * @returns {undefined | Promise<any>} - undefine if success, otherwise a reject Promise
       */
      async subscribe(raiseInitial = false) {
        try {
          if (!this.signal) return API.rejectWithStatus(`Signal ${this.name} not available for subscription`);

          return await this.signal.subscribe(raiseInitial);
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
        } catch (e) {
          return API.rejectWithStatus(`Failed to add callback to signal ${this.name}`, e);
        }
      }
    }

    /**
     * Creates a new signal in the config databes in case this is not already existing.
     * If exists, then the attributes are taken from the existing one
     * @alias createSignal
     * @memberof API.SIGNAL
     * @param {string} name
     * @param {*} attr
     * @returns {Promise<API.SIGNAL.Signal>}
     */
    this.createSignal = async (name, attr = {}) => {
      const found = this.signals.find((s) => s.name === name);

      if (found) return found;

      let signal = null;
      attr.Name = name;

      try {
        signal = await RWS.IO.getSignal(name);
        let config = await RWS.CFG.getInstanceByName(API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.SIGNAL, name);
        attr = await config.getAttributes();
      } catch (e) {
        try {
          let config = await RWS.CFG.getInstanceByName(API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.SIGNAL, name);
          attr = await config.getAttributes();
        } catch (e) {
          // Signal instance NOT found, create a config instance
          if (!attr.Name || !attr.SignalType || !attr.Access)
            return API.rejectWithStatus(
              `Mandatory attributes missing: ${!attr.Name ? 'Name ' : ''}${!attr.SignalType ? 'SignalType ' : ''}${!attr.Access ? 'Access ' : ''} `
            );
          API.CONFIG.createSignalInstance(attr);
          let config = await RWS.CFG.getInstanceByName(API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.SIGNAL, attr.Name);
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
          let config = await RWS.CFG.getInstanceByName(API.CONFIG.DOMAIN.EIO, API.CONFIG.TYPE.SIGNAL, name);

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
     * @typedef filterSignalSearch
     * @prop {string} [name]
     * @prop {string} [device]
     * @prop {string} [network]
     * @prop {string} [category]
     * @prop {'DI' | 'DO' | 'AI' | 'AO' | 'GI' | 'GO'} [type]
     * @prop {string} [invert]
     * @prop {string} [blocked]
     * @memberof API.CONFIG.SIGNAL
     */

    /**
     * Search for available signals in the controller.
     * @alias search
     * @memberof API.CONFIG.SIGNAL
     * @param {API.SIGNAL.filterSignalSearch} filter - The result can be filtered by using
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
     * @returns {Promise<object[] | string[]> } - List of API.CONFIG.SIGNAL.Signal instances
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

    this.searchByName = async (name) => {
      const signals = await this.search({ name: name });
      return signals.length === 1 ? signals[0] : signals;
    };

    this.searchByCategory = async (category) => {
      const signals = await this.search({ category: category });
      return signals.length === 1 ? signals[0] : signals;
    };

    this.searchByType = async (type, device = null) => {
      if (Array.isArray(type)) {
        const t = type.join(',');
        type = `[${t}]`;
      }
      return device === null ? await this.search({ type: type }) : await this.search({ type: type, device: device });
    };

    this.isAnySignalModified = async () => {
      return this.signals.some((signal) => signal.modified === true);
    };
  })();

  cfg.constructedCfg = true;
};

if (typeof API.constructedCfg === 'undefined') {
  factoryApiCfg(API);
}

export default API;
export { factoryApiCfg };
