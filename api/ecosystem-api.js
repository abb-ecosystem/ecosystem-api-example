'use strict'

var API = API || {}
if (typeof API.constructedApi === 'undefined') {
  ;(function (es) {
    // VERSION INFO
    es.ECOSYSTEM_LIB_VERSION = '0.02'

    /**
     * Initializes the ES object
     */
    es.init = () => {}
    window.addEventListener('load', es.init, false)

    es.__unload = false

    es.CONFIG = {
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
    }

    /**
     * Clean up when the web page is closed
     */
    window.addEventListener(
      'beforeunload',
      () => {
        es.__unload = true

        return null
      },
      false
    )

    const isNonEmptyString = (x) => {
      if (x === null) return false
      if (typeof x !== 'string') return false
      if (x === '') return false
      if (x === 'undefined') return false

      return true
    }

    es.DEVICE = new (function () {
      this.ethernetIP = []

      this.getEthernetIPDeviceByName = (name) => {
        return this.devices.find((device) => device.name === name)
      }
    })()

    es.DEVICE = new (function () {
      this.ethernetIPDevices = []

      this.getEthernetIPDeviceByName = (name) => {
        return this.devices.find((device) => device.name === name)
      }

      this.fetchEthernetIPDevices = async function () {
        try {
          const ethIPDevices = await RWS.CFG.getInstances(
            API.CONFIG.DOMAIN.EIO,
            API.CONFIG.TYPE.ETHERNETIP
          )

          for (let device of ethIPDevices) {
            this.ethernetIPDevices.push({
              device: device.getInstanceName(),
              signals: [],
            })
          }

          const eioSignals = await RWS.CFG.getInstances(
            API.CONFIG.DOMAIN.EIO,
            API.CONFIG.TYPE.SIGNAL
          )
          for (const signal of eioSignals) {
            let attr = signal.getAttributes()
            for (let item of this.ethernetIPDevices) {
              attr.Device === item.device &&
                item.signals.push({ attributes: attr })
            }
          }

          return this.ethernetIPDevices
        } catch (e) {
          console.error(e)
          FPComponents.Popup_A.message(`ethDevices - Exception occurs:`, [
            e.message,
            `Code: ${e.controllerStatus.code}`,
            e.controllerStatus.description,
          ])
          return undefined
        }
      }

      this.isAnySignalMappedTo = function (attr) {
        const device = this.ethernetIPDevices.find(
          (dev) => dev.device === attr.Device
        )
        const found =
          device &&
          device.signals.some(
            (signal) =>
              signal.attributes.DeviceMap === attr.DeviceMap &&
              signal.attributes.SignalType === attr.SignalType &&
              signal.attributes.Name !== attr.Name
          )
        return found
      }
    })()

    /**
     * The domain used for Signal handling
     */
    es.SIGNAL = new (function () {
      this.signals = []
      this.crossConns = []

      this.getSignalByName = (name) => {
        return this.signals.find((signal) => signal.name === name)
      }

      this.getSignalsOfType = (type) => {
        return this.signals.filter((signal) => signal.type === type)
      }

      this.isAnySignalModified = () => {
        return this.signals.some((signal) => signal.modified === true)
      }

      this.isAnyInputMappedTo = (attr) => {
        const device = API.DEVICE.ethernetIP.find(
          (dev) => dev.device === attr.Device
        )
        const found =
          device &&
          device.signals.some(
            (signal) =>
              signal.map === attr.Map &&
              signal.type === attr.SignalType &&
              signal.name !== attr.Name
          )
        return found
      }

      class Instance {
        constructor(attr) {
          this._attr = attr
          this.modified = false
          this.InstanceType = undefined
        }

        /**
         *
         */
        updateAttributes(attr) {
          const f = function (key) {
            this._attr[key] = attr[key]
          }
          Object.keys(attr).forEach(f.bind(this))

          if (!this.InstanceType) {
            console.error('Instance type is not defined')
            return
          }

          API.SIGNAL.updateInstanceAttributes(attr, this.InstanceType)
          this.modified = true
        }
      }

      class crossConnection extends Instance {
        constructor() {
          super(attr)
          this.InstanceType = API.CONFIG.TYPE.CROSS
        }
        set attr(a) {
          this.updateAttributes(a)
        }
      }

      /**
       * Signal class containing all relevant elements to access the signal
       * and its configuration. Methods for subsbription and callbacks to the signal are
       * included
       * @param {string} name               Name of the signal
       * @param {RWS.IO.Signal} signal      Signal of IO domain
       * @param {RWS.CFG.Instance} config   Instance of configuration domain
       * @param {Object} attr                    Instance attributes
       */
      class Signal {
        constructor(name, signal, config, attr) {
          this.name = name
          this.signal = signal
          this.config = config
          this._attr = attr
          this.InstanceType = API.CONFIG.TYPE.SIGNAL

          this.signal ? (this.modified = false) : (this.modified = true)
        }

        get value() {
          return this.signal || this.signal.getValue()
        }

        set value(v) {
          this.signal || this.signal.setValue(v)
        }

        get type() {
          return this._attr.SignalType
        }

        get device() {
          return this._attr.Device
        }

        get map() {
          return this._attr.DeviceMap
        }

        get active() {
          return this.signal === null ? false : true
        }

        set attr(a) {
          console.log('calling Signal setter attr...')
          const f = function (key) {
            this._attr[key] = a[key]
          }
          Object.keys(a).forEach(f.bind(this))

          API.SIGNAL.updateSignalAttributes(a)
          // this.config = API.SIGNAL.getSignalInstance(a.Name)
          this.modified = true
        }

        // set attr(a) {
        //   const f = function (key) {
        //     this._attr[key] = a[key]
        //   }
        //   Object.keys(a).forEach(f.bind(this))

        //   this.modified = true

        //   return async () => {
        //     await API.SIGNAL.updateSignalAttributes(a)
        //     this.config = await API.SIGNAL.getSignalInstance(a.Name)
        //   }
        // }

        /**
         * Subscribe to the signal and set the callback function
         * @param {*} callback function to be called on change
         * @returns
         */
        async subscribe(callback) {
          try {
            if (!this.signal) {
              console.log(`Signal ${this.name} not available for subscription`)
              return
            }

            const failed = await this.signal.subscribe(true)

            if (failed) console.log(failed)
          } catch (e) {
            console.error(e)
          }
        }

        async unsubscribe() {
          return this.signal.unsubscribe()
        }

        addCallbackOnChanged(callback) {
          try {
            if (!this.signal) {
              console.log(`Signal ${this.name} not available for subscription`)
              return
            }

            const cb = async (value) => {
              // first time this is called, newValue is undefined.
              if (value === undefined) {
                value = await this.signal.getValue()
              }
              callback(value)
            }
            this.signal.addCallbackOnChanged(cb.bind(this))
            // force the callback to update to current value
            cb()
          } catch (e) {
            console.error(e)
          }
        }

        async handler(value) {
          if (!this.signal) return
          this.signal.setValue(value)
        }
      }

      this.createSignal = async (name, attr = {}) => {
        let signal = null
        let config = null

        attr.Name = name

        // Check if signal is already available
        signal = await this.getSignal(attr.Name)
        if (signal) {
          console.log(`Signal ${attr.Name} exist already... `)
        }

        // Check if signal is configured
        config = await this.getSignalInstance(attr.Name)
        if (config) {
          console.log(`Signal ${attr.Name} found in configuration... `)
          attr = await config.getAttributes()
        } else {
          // Signal instance NOT found, create a config instance
          this.createSignalInstance(attr)
          config = await this.getSignalInstance(attr.Name)
        }
        const s = new Signal(attr.Name, signal, config, attr)

        if (signal) {
          s.subscribe()
          this.signals.push(s)
        }
        return s
      }

      this.fetchSignalFromController = async (name) => {
        let signal = null
        let attr = []

        // Check if signal is already available
        signal = await this.getSignal(name)

        // Check if signal is configured
        let config = await this.getSignalInstance(name)
        if (config) {
          // Signal instance found, get attributes of signal
          attr = await config.getAttributes()
        }

        // ToDo: check if the signal is aldready available and replace it if so.
        const s = new Signal(name, signal, config, attr)
        this.signals.push(s)
        return s
      }

      this.searchSignals = async function (filter = {}) {
        try {
          var signals = await RWS.IO.searchSignals(filter)
          if (signals.length > 0) {
            for (let i = 0; i < signals.length; i++) {
              var testValue = await signals[i].getValue()
              // console.log(`${signals[i].getName()} = ${testValue}`)
            }
          }
          return signals
        } catch (e) {
          console.error(e)
          return null
        }
      }

      /**
       *  Get a signal instance from RWS.IO Namespace
       * @param {} name
       * @returns signal instance
       */
      this.getSignal = async function (name) {
        try {
          return await RWS.IO.getSignal(name)
        } catch (e) {
          console.error(e)
          return null
        }
      }

      /**
       * Get a configuration instace from RWS.CFG Namespace
       * @param {string} name -- name of the insance
       * @param {string} type -- supported types: EIO_SIGNAL, EIO_CROSS
       * @returns {object}The cofiguration instace
       */
      this.getConfigInstance = async function (name, type) {
        try {
          const instance = await RWS.CFG.getInstanceByName(
            API.CONFIG.DOMAIN.EIO,
            type,
            name
          )
          return instance
        } catch (e) {
          console.log(
            `Configuration instance ${name} not found in current configuration...`
          )
          return null
        }
      }

      /**
       * Get a configuration instace of a signal from RWS.CFG Namespace
       * @param {string} name -- name of the signal
       * @returns {object}The cofiguration instace of a signal
       */
      this.getSignalInstance = async function (name) {
        return this.getConfigInstance(name, API.CONFIG.TYPE.SIGNAL)
      }

      /**
       * Get a configuration instace of a cross-connection from RWS.CFG Namespace
       * @param {string} name -- name of the cross-connection
       * @returns {object}The cofiguration instace of a cross-connection
       */
      this.getCrossConnectionInstance = async function (name) {
        return this.getConfigInstance(name, API.CONFIG.TYPE.CROSS)
      }

      /**
       * Get the attributes of a signal
       * @return {object} The attributes of a signal
       */
      this.getSignalAttributes = async function (name) {
        try {
          // Check if instance is configured (which does not necesarily means that the signal is already availabe),
          // after creating an instance, a Reboot is reqiured
          let config = await this.getSignalInstance(name)
          let attr = null
          if (config !== null) attr = config.getAttributes()
          return attr
        } catch (e) {
          // if singal not available, then an exception will occur
          console.error(`Error while getting attributes of a signal ${name} `)
          return null
        }
      }

      /**
       * Get the attributes of a signal
       * @return {object} The attributes of a signal
       */
      this.getCrossConnectionAttributes = async function (name) {
        try {
          // Check if instance is configured (which does not necesarily means that the signal is already availabe),
          // after creating an instance, a Reboot is reqiured
          let config = await this.getCrossConnectionInstance(name)
          let attr = null
          if (config !== null) attr = config.getAttributes()
          return attr
        } catch (e) {
          // if singal not available, then an exception will occur
          console.error(
            `Error while getting attributes of the cross-conneciton ${name} `
          )
          return null
        }
      }

      /**
       * Create signal configuraiton instance with attributes
       */
      this.createConfigInstance = async function (name, type) {
        console.log(
          `Creating configuration instance ${name} of type ${type}...`
        )
        try {
          await RWS.CFG.createInstance(API.CONFIG.DOMAIN.EIO, type, name)
        } catch (e) {
          console.error(e)
        }
      }

      this.createSignalInstance = async function (attr) {
        this.createConfigInstance(attr.Name, API.CONFIG.TYPE.SIGNAL)
        this.updateSignalAttributes(attr)
      }

      this.createCrossConnectionInstance = async function (attr) {
        this.createConfigInstance(attr.Name, API.CONFIG.TYPE.CROSS)
        this.updateCrossConnectionAttributes(attr)
      }

      /**
       * Modify the attributes of a signal present in the configuration database
       * If the signal does not exist, no action is taken
       * @param {*} attr
       */

      this.updateInstanceAttributes = async function (attr, type) {
        try {
          await RWS.CFG.updateAttributesByName(
            API.CONFIG.DOMAIN.EIO,
            type,
            attr.Name,
            attr
          )
        } catch (err) {
          console.error(err)
        }
      }

      this.updateSignalAttributes = async function (attr) {
        console.log('calling SIGNAL.updateSignalAttributes')
        console.log(attr)
        if (!attr.SignalType) {
          console.log('Signal type was not defined, DI will be used')
          attr.SignalType = 'DI'
        }
        if (attr.Device === '') {
          console.log('Device is a empty string...')
          delete attr.Device
          await API.SIGNAL.deleteSignal(attr.Name)
          await API.SIGNAL.createConfigInstance(
            attr.Name,
            API.CONFIG.TYPE.SIGNAL
          )
        }

        await this.updateInstanceAttributes(attr, API.CONFIG.TYPE.SIGNAL)
      }

      this.updateCrossConnectionAttributes = async function (attr) {
        await this.updateInstanceAttributes(attr, API.CONFIG.TYPE.CROSS)
      }

      this.fetchAllCrossConnections = async function () {
        try {
          const crossConnections = await this.fetchAllInstancesFromType(
            API.CONFIG.TYPE.CROSS
          )
          if (!crossConnection) return
          this.crossConns.length = 0
          // for (let cc of crossConnections) {
          //   this.crossConns.push(cc)
          // }
          this.crossConns.push(...crossConnections)
          return this.crossConns
        } catch (err) {
          console.error(err)
          throw err
        }
      }

      this.fetchAllSignals = async function () {
        try {
          const signals = await this.fetchAllInstancesFromType(
            API.CONFIG.TYPE.SIGNAL
          )
          this.signals.length = 0
          for (let signal of signals) {
            this.signals.push(signal)
          }
          return this.signals
        } catch (err) {
          console.error(err)
          throw err
        }
      }

      this.fetchAllInstancesFromType = async function (type) {
        try {
          const instances = await RWS.CFG.getInstances(
            API.CONFIG.DOMAIN.EIO,
            type
          )
          return instances
        } catch (err) {
          console.error(err)
          return undefined
        }
      }

      this.deleteConfigInstance = async function (name, type) {
        try {
          await API.RWS_EXTRA.deleteConfigInstance(
            name,
            type,
            API.CONFIG.DOMAIN.EIO
          )
        } catch (e) {
          console.error(`Error while deleting configuration instance ${name}`)
          return null
        }
      }

      // ToDo: remove from this.crossConns
      // ToDo: handle reject
      this.deleteCrossConnection = async function (name) {
        return await this.deleteConfigInstance(name, API.CONFIG.TYPE.CROSS)
      }

      // ToDo: remove from this.signals
      // ToDo: handle reject
      this.deleteSignal = async function (name) {
        return await this.deleteConfigInstance(name, API.CONFIG.TYPE.SIGNAL)
      }
    })()

    es.RAPID = new (function () {
      this.variables = []
      this.procedures = []
      this.modules = []

      class Variable {
        constructor(variable, props) {
          this.props = props
          this.var = variable
        }

        get name() {
          return this.props.symbolName
        }

        get value() {
          return (async () => {
            try {
              return await this.var.getValue()
            } catch (e) {
              return undefined // fallback value
            }
          })()
        }

        set value(v) {
          this.var && this.var.setValue(v)
        }

        get type() {
          return this.props.dataType
        }

        /**
         * Returns the declaration type of the data, valid values:
         * 'constant'
         * 'variable'
         * 'persistent'
         */
        get declaration() {
          return this.props.symbolType
        }

        /**
         * Subscribe to the variable and set the callback function
         * @param {*} callback function to be called on change
         * @returns
         */
        async subscribe(callback) {
          try {
            if (!this.var) {
              console.log(
                `Variable ${this.name} not available for subscription`
              )
              return
            }

            const failed = await this.var.subscribe(true)

            if (failed) console.log(failed)
          } catch (e) {
            console.error(e)
          }
        }

        async unsubscribe() {
          return this.var.unsubscribe()
        }

        addCallbackOnChanged(callback) {
          try {
            if (!this.var) {
              console.log(
                `Variable ${this.name} not available for subscription`
              )
              return
            }

            const cb = async (value) => {
              if (value === undefined) {
                value = await this.var.getValue()
              }
              callback(value)
            }

            this.var.addCallbackOnChanged(cb.bind(this))

            // force the callback to update to current value
            cb()
          } catch (e) {
            console.error(e)
          }
        }

        async handler(value) {
          if (!this.var) return
          this.var.setValue(value)
        }
      }

      /**
       * Subscribe to a existing RAPID variable.
       * @param {string} task  - RAPID Task in which the variable is contained
       * @param {string} module -RAPID module where the variable is contained
       * @param {string} name - name of RAPID variable
       * @param {string} id  (optional) - DOM element id in which "textContent" will get the value of  the variable
       * @returns API.RAPID.variable or undifined if variable does not exist in the controller
       */
      this.subscribeToVariable = async (task, module, name, id) => {
        try {
          const variable = await RWS.Rapid.getData(task, module, name)

          const p = await variable.getProperties()
          const v = new Variable(variable, p)

          if (id) {
            v.addCallbackOnChanged(async function (value) {
              document.getElementById(id).textContent = value
            })
          }

          await v.subscribe(true)
          this.variables.push(v)
          return v
        } catch (e) {
          console.error(e)
          return undefined
        }
      }

      // this.requestMastership = function () {
      //   return RWS.Mastership.request()
      //     .then(() => Promise.resolve())
      //     .catch((err) =>
      //       Promise.reject(console.log('Could not get Mastership.', err))
      //     )
      // }

      // // Releases the Mastership, if it fails it should log the error and hide the rejection.
      // this.releaseMastership = function () {
      //   return RWS.Mastership.release()
      //     .then(() => Promise.resolve())
      //     .catch((err) => {
      //       RWS.writeDebug(`Could not release Mastership. >>> ${err.message}`)
      //       return Promise.resolve()
      //     })
      // }

      // this.loadModule = function (
      //   path,
      //   isReplace = false,
      //   taskName = 'T_ROB1'
      // ) {
      //   let hasMastership = false
      //   let error = null

      //   return this.requestMastership()
      //     .then(() => {
      //       hasMastership = true

      //       return RWS.Network.post(
      //         `/rw/rapid/tasks/${taskName}/loadmod`,
      //         'modulepath=' + path + '&replace=' + isReplace
      //       )
      //     })
      //     .catch((err) => {
      //       if (hasMastership === true) {
      //         error = err
      //         return Promise.resolve()
      //       }

      //       return console.error('Failed to get Mastership.', err)
      //     })
      //     .then(() => this.releaseMastership())
      //     .then(() => {
      //       if (error !== null)
      //         return console.error('Failed to set value.', error)
      //       return Promise.resolve()
      //     })
      // }

      // this.unloadModule = function (moduleName, taskName = 'T_ROB1') {
      //   let hasMastership = false
      //   let error = null

      //   return this.requestMastership()
      //     .then(() => {
      //       hasMastership = true

      //       return RWS.Network.post(
      //         `/rw/rapid/tasks/${taskName}/unloadmod`,
      //         'module=' + moduleName
      //       )
      //     })
      //     .catch((err) => {
      //       if (hasMastership === true) {
      //         error = err
      //         return Promise.resolve()
      //       }

      //       return console.error('Failed to get Mastership.', err)
      //     })
      //     .then(() => this.releaseMastership())
      //     .then(() => {
      //       if (error !== null)
      //         return console.error('Failed to set value.', error)
      //       return Promise.resolve()
      //     })
      // }

      this.loadModule = function (
        path,
        isReplace = false,
        taskName = 'T_ROB1'
      ) {
        API.RWS_EXTRA.loadModule.apply(null, arguments)
      }

      this.unloadModule = function (moduleName, taskName = 'T_ROB1') {
        API.RWS_EXTRA.unloadModule.apply(null, arguments)
      }
    })()

    /**
     * Extension of RWS not yet available at the omnicore.rws SDK
     */
    es.RWS_EXTRA = new (function () {
      this.requestMastership = function () {
        return RWS.Mastership.request()
          .then(() => Promise.resolve())
          .catch((err) =>
            Promise.reject(console.log('Could not get Mastership.', err))
          )
      }

      // Releases the Mastership, if it fails it should log the error and hide the rejection.
      this.releaseMastership = function () {
        return RWS.Mastership.release()
          .then(() => Promise.resolve())
          .catch((err) => {
            RWS.writeDebug(`Could not release Mastership. >>> ${err.message}`)
            return Promise.resolve()
          })
      }

      this.requestMastershipAround = function (func, args) {
        let hasMastership = false
        let error = null

        return this.requestMastership()
          .then(() => {
            hasMastership = true

            func.apply(this, args)
            // func()
          })
          .catch((err) => {
            if (hasMastership === true) {
              error = err
              return Promise.resolve()
            }

            return console.error('Failed to get Mastership.', err)
          })
          .then(() => this.releaseMastership())
          .then(() => {
            if (error !== null)
              return console.error('Failed to set value.', error)
            return Promise.resolve()
          })
      }

      this.loadModule = function (
        path,
        isReplace = false,
        taskName = 'T_ROB1'
      ) {
        const cb = function () {
          return RWS.Network.post(
            `/rw/rapid/tasks/${taskName}/loadmod`,
            'modulepath=' + path + '&replace=' + isReplace
          )
        }
        return API.RWS_EXTRA.requestMastershipAround(cb)
      }

      this.unloadModule = function (moduleName, taskName = 'T_ROB1') {
        const cb = function () {
          return RWS.Network.post(
            `/rw/rapid/tasks/${taskName}/unloadmod`,
            'module=' + moduleName
          )
        }
        return API.RWS_EXTRA.requestMastershipAround(cb)
      }

      this.deleteConfigInstance = function (name, type, domain) {
        const cb = function () {
          return RWS.Network.delete(
            `/rw/cfg/${domain}/${type}/instances/${name}`
          )
        }
        return API.RWS_EXTRA.requestMastershipAround(cb)
      }
    })()

    es.constructedApi = true
  })(API)
}
