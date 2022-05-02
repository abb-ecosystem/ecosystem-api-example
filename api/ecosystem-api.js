'use strict'

var API = API || {}
if (typeof API.constructedApi === 'undefined') {
  ;(function (es) {
    // VERSION INFO
    es.ECOSYSTEM_LIB_VERSION = '0.1'

    /**
     * Initializes the ES object
     */
    es.init = () => {}
    window.addEventListener('load', es.init, false)

    es.__unload = false

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

      this.fetchEthernetIPDevices = async function () {
        try {
          const devices = await RWS.CFG.getInstances('EIO', 'ETHERNETIP_DEVICE')
          for (let device of devices) {
            console.log(device.getAttributes())
            console.log(
              `${device.getInstanceName()}: ${
                device.getAttributes().StateWhenStartup
              }`
            )
            this.ethernetIP.push(device.getInstanceName())
          }
          console.log(this.ethernetIP)
          return this.ethernetIP
        } catch (err) {
          console.error(err)
          throw err
        }
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
            'EIO',
            'ETHERNETIP_DEVICE'
          )

          for (let device of ethIPDevices) {
            this.ethernetIPDevices.push({
              device: device.getInstanceName(),
              signals: [],
            })

            console.log(device.getAttributes())
          }

          const eioSignals = await RWS.CFG.getInstances('EIO', 'EIO_SIGNAL')
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
      this.crossConnections = []

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
        console.log(API.DEVICE.ethernetIP)
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

        /**
         * @param {{ SignalType: any; }} a  object with attributes to be updated
         */
        set attr(a) {
          const f = function (key) {
            this._attr[key] = a[key]
          }
          Object.keys(a).forEach(f.bind(this))

          API.SIGNAL.updateAttributes(a)
          this.modified = true
        }

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
          // console.log(`Signal ${attr.Name} exist already... `);
        }

        // Check if signal is configured
        config = await this.getSignalInstance(attr.Name)
        if (config) {
          // console.log(
          //   `Signal ${attr.Name} found in configuration, use API.SIGNAL.updateAttributes to change attributes`
          // );
          attr = await config.getAttributes()
        } else {
          // Signal instance NOT found, create a config instance
          this.createConfigInstance(attr.Name)
          this.updateAttributes(attr)
          config = await this.getSignalInstance(attr.Name)
        }
        const s = new Signal(attr.Name, signal, config, attr)
        s.subscribe()
        this.signals.push(s)
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
       * @param {string} domain -- supported domains: EIO_SIGNAL, EIO_CROSS
       * @returns {object}The cofiguration instace
       */
      this.getConfigInstance = async function (name, domain) {
        try {
          const instance = await RWS.CFG.getInstanceByName('EIO', domain, name)
          return instance
        } catch (e) {
          console.error(`Error while getting configuration instance ${name}`)
          return null
        }
      }

      /**
       * Get a configuration instace of a signal from RWS.CFG Namespace
       * @param {string} name -- name of the signal
       * @returns {object}The cofiguration instace of a signal
       */
      this.getSignalInstance = async function (name) {
        return this.getConfigInstance(name, 'EIO_SIGNAL')
      }

      /**
       * Get a configuration instace of a cross-connection from RWS.CFG Namespace
       * @param {string} name -- name of the cross-connection
       * @returns {object}The cofiguration instace of a cross-connection
       */
      this.getCrossConnectionInstance = async function (name) {
        return this.getConfigInstance(name, 'EIO_CROSS')
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
      this.createConfigInstance = async function (name) {
        console.log(`Creating configuration instanceof signal ${name}...`)
        try {
          await RWS.CFG.createInstance('EIO', 'EIO_SIGNAL', name)
        } catch (e) {
          console.error(e)
        }
      }

      /**
       * Modify the attributes of a signal present in the configuration database
       * If the signal does not exist, no action is taken
       * @param {*} attr
       */

      this.updateAttributes = async function (attr) {
        try {
          await RWS.CFG.updateAttributesByName(
            'EIO',
            'EIO_SIGNAL',
            attr.Name,
            attr
          )
        } catch (err) {
          console.error(err)
        }
      }

      this.fetchAllCrossConnections = async function () {
        try {
          const crossConnections = await RWS.CFG.getInstances(
            'EIO',
            'EIO_CROSS'
          )
          for (let cc of crossConnections) {
            // console.log(cc.getAttributes());
            this.crossConnections.push(cc)
          }
          return this.crossConnections
        } catch (err) {
          console.error(err)
          throw err
        }
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
          // console.log(p);
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

      this.loadModule = function (
        path,
        isReplace = false,
        taskName = 'T_ROB1'
      ) {
        let hasMastership = false
        let error = null

        return this.requestMastership()
          .then(() => {
            hasMastership = true

            return RWS.Network.post(
              `/rw/rapid/tasks/${taskName}/loadmod`,
              'modulepath=' + path + '&replace=' + isReplace
            )
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
    })()

    es.constructedApi = true
  })(API)
}
