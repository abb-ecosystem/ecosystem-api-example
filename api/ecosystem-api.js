'use strict'

var API = API || {}
if (typeof API.constructedApi === 'undefined') {
  ;(function (es) {
    // VERSION INFO
    es.ECOSYSTEM_LIB_VERSION = '0.02'

    /**
     * Initializes the ES object
     */
    es.init = async () => {
      await API.CONTROLLER._init()
      await API.RAPID._init()
    }
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

    const sleep = (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }

    function parseJSON(json) {
      try {
        return JSON.parse(json)
      } catch (error) {
        return undefined
      }
    }

    /**
     * Rejects with status object.
     *
     * @param {string}  message
     * @param {{}}      item
     */
    function rejectWithStatus(message, item = {}) {
      let r = createStatusObject(message, item)
      return Promise.reject(r)
    }

    /**
     * Builds an status object.
     *
     * @param {string}  message
     * @param {{}}      item
     */
    function createStatusObject(message, item = {}) {
      let r = {}

      try {
        let msg = ''
        if (typeof message === 'string' && message !== null) msg = message
        r.message = msg

        if (typeof item === 'Error') {
          if (r.message.length <= 0) r.message = `Exception: ${item.message}`
          else r.message += ` >>> Exception: ${item.message}`
        } else if (typeof item === 'string') {
          if (r.message.length <= 0) r.message = item
          else r.message += ` >>> ${item}`
        } else if (item.hasOwnProperty('message')) {
          r = JSON.parse(JSON.stringify(item))
          r.message = msg
          if (typeof item.message === 'string' && item.message.length > 0)
            r.message += ` >>> ${item.message}`
        }
      } catch (error) {
        r = {}
        r.message = `Failed to create status object. >>> Exception: ${error.message}`
      }

      return r
    }

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
          const f = function (key) {
            this._attr[key] = a[key]
          }
          Object.keys(a).forEach(f.bind(this))

          API.SIGNAL.updateSignalAttributes(a)
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
          // console.log(`Signal ${attr.Name} exist already... `)
        }

        // Check if signal is configured
        config = await this.getSignalInstance(attr.Name)
        if (config) {
          // console.log(`Signal ${attr.Name} found in configuration... `)
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
            // for (let i = 0; i < signals.length; i++) {
            //   // var testValue = await signals[i].getValue()
            //   // console.log(`${signals[i].getName()} = ${testValue}`)
            // }
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
        // console.log('calling SIGNAL.updateSignalAttributes')
        // console.log(attr)
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
          const ccs = await this.fetchAllInstancesFromType(
            API.CONFIG.TYPE.CROSS
          )
          if (!ccs) return
          this.crossConns.length = 0
          this.crossConns.push(...ccs)
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
          await API.RWS.deleteConfigInstance(name, type, API.CONFIG.DOMAIN.EIO)
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

      this.EXEC = {
        Running: 'running',
        Stopped: 'stopped',
      }

      const subscribeRes = async function (res, func, task = 'T_ROB1') {
        try {
          const monitor = await RWS.Rapid.getMonitor(res, task)
          monitor.addCallbackOnChanged(func)
          await monitor.subscribe()
        } catch (error) {
          console.error(`Subscription to ${res} failed. >>> ${error}`)
        }
      }

      this._init = async function () {
        this.execMode = null
        const cbExecMode = function (data) {
          this.execMode = data
          console.log(this.execMode)
        }
        subscribeRes('execution', cbExecMode.bind(this))
      }
      class Task {
        constructor(task) {
          this._task = task
          this.name = task.getName()
        }
        /**
         *
         * @param {*} regainMode - valid values: 'continue', 'regain', 'clear' or 'enter_consume'
         * @param {*} execMode - valid values: 'continue', 'step_in', 'step_over', 'step_out', 'step_backwards', 'step_to_last' or 'step_to_motion'
         * @param {*} cycleMode - valid values: 'forever', 'as_is' or 'once'
         * @param {*} condition - valid values: 'none' or 'call_chain'
         * @param {*} stopAtBreakpoint - stop at breakpoint
         * @param {*} enableByTSP - all tasks according to task selection panel
         */
        static async _startExecution(
          regainMode,
          execMode,
          cycleMode,
          condition,
          stopAtBreakpoint,
          enableByTSP
        ) {
          await RWS.Rapid.startExecution({
            regainMode: regainMode,
            executionMode: execMode,
            cycleMode: cycleMode,
            condition: condition,
            stopAtBreakpoint: stopAtBreakpoint,
            enableByTSP: enableByTSP,
          })
        }

        /**
         *
         * @param {string} proc Procedure name
         * @param {boolean} asSR Execute as a service routine. Motors has not to be turned on for execution
         */
        async executeProcedure(proc, asSR = false) {
          console.log('Task.executeProcedure called...')
          try {
            let opMode = await RWS.Controller.getOperationMode()
            console.log(opMode)

            let state = await RWS.Controller.getControllerState()
            // console.log('😍')
            // console.log(state)

            if (state === API.CONTROLLER.STATE.GuardStop) {
              await RWS.Controller.setOperationMode(
                API.CONTROLLER.OPMODE.Manual
              )
              await RWS.Controller.setMotorsState(API.CONTROLLER.STATE.MotorsOn)
            }
            if (state !== API.CONTROLLER.STATE.MotorsOn && asSR === false) {
              await RWS.Controller.setMotorsState(API.CONTROLLER.STATE.MotorsOn)
            }

            let pointers = await this._task.getPointers()
            let pp = pointers.programPointer

            if (pp.hasValue === false) RWS.Rapid.resetPP()

            // Move pointer to procedure
            this._task.movePPToRoutine(proc, asSR)

            await Task._startExecution(
              'continue',
              'continue',
              'once',
              'none',
              true,
              true
            )

            state = await RWS.Rapid.getExecutionState()
            while (state === 'running') {
              await sleep(200)
              state = await RWS.Rapid.getExecutionState() // ToDo: this is actually not working, modify it
            }

            if (pp.hasValue === true) {
              const s = pp.beginPosition
              let position = s.search(',')
              let line = s.slice(0, position)
              let column = s.slice(position + 1)

              await API.RWS.movePPToCursor(
                pp.moduleName,
                this.name,
                line,
                column
              )
            }
          } catch (error) {
            console.log('API.TASK.executeProcedure failed...')
            console.error(error)
          }
        }

        async getVariable(module, variable) {
          try {
            var data = await this._task.getData(module, variable)
            return await data.getValue()
          } catch (e) {
            return rejectWithStatus(
              `Variable ${variable} not found at ${this._task.getName()} : ${module} module.`,
              e
            )
          }
        }

        async setVariable(module, variable, value) {
          try {
            var data = await this._task.getData(module, variable)
            await data.setValue(value)
          } catch (err) {
            return rejectWithStatus(
              `Set variable ${module}:${variable} failed.`,
              err
            )
          }
        }
      }

      class Module {}

      class Variable {
        constructor(name, props) {
          this.props = props
          this.var = name
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

        // async handler(value) {
        //   if (!this.var) return
        //   this.var.setValue(value)
        // }
      }

      class RobTarget extends Variable {
        // get value() {
        //   return await super.value
        // }
        // set value(v) {
        //   super.value = v
        // }
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

      this.getTask = async function (task = 'T_ROB1') {
        const t = await RWS.Rapid.getTask(task)

        return new Task(t)
      }

      // this.callProcedure = async function (name, task = 'T_ROB1') {}

      this.loadModule = function (
        path,
        isReplace = false,
        taskName = 'T_ROB1'
      ) {
        API.RWS.loadModule.apply(null, arguments)
      }

      this.unloadModule = function (moduleName, taskName = 'T_ROB1') {
        API.RWS.unloadModule.apply(null, arguments)
      }
    })()

    es.CONTROLLER = new (function () {
      this.STATE = {
        Init: 'initializing', // the controller is starting up
        MotorsOn: 'motors_on', //motors on state
        MotorsOff: 'motors_off', // motors off state
        GuardStop: 'guard_stop', // stopped due to safety
        EStop: 'emergency_stop', // emergency stop state
        EStopR: 'emergency_stop_resetting', // emergency stop state resetting
        SysFailure: 'system_failure', // system failure state
      }

      this.OPMODE = {
        Auto: 'automatic',
        Manual: 'manual',
        ManualR: 'manual_reduced',
        ManualFull: 'manual_full',
      }

      const subscribeRes = async function (res, func) {
        try {
          const monitor = await RWS.Controller.getMonitor(res)
          monitor.addCallbackOnChanged(func)
          await monitor.subscribe()
        } catch (error) {
          console.error(`Subscription to ${res} failed. >>> ${error}`)
        }
      }

      this._init = async function () {
        this.ctrlState = await RWS.Controller.getControllerState()
        this.isMotOn = this.ctrlState === this.STATE.MotorsOn ? true : false
        const cbControllerState = function (data) {
          this.ctrlState = data

          data === this.STATE.MotorsOn
            ? (this.isMotOn = true)
            : (this.isMotOn = false)
          console.log(this.ctrlState)
        }
        subscribeRes('controller-state', cbControllerState.bind(this))

        this.opMode = await RWS.Controller.getOperationMode()
        this.isManR = this.opMode === this.OPMODE.ManualR ? true : false
        const cbOpMode = function (data) {
          this.opMode = data
          data === this.OPMODE.ManualR
            ? (this.isManR = true)
            : (this.isManR = false)
          console.log(this.opMode)
        }
        subscribeRes('operation-mode', cbOpMode.bind(this))
      }

      this.getLanguage = async function () {
        return await RWS.Controller.getEnvironmentVariable('$LANGUAGE')
      }
    })()

    es.MOTION = new (function () {
      let ccounter = null
      let jogMonitor = null
      this.jogStop = false

      this.JOGMODE = {
        Align: 'Align',
        GoToPos: 'GoToPos',
        ConfigurationJog: 'ConfigurationJog',
        Cartesian: 'Cartesian',
        AxisGroup1: 'AxisGroup1',
        AxisGroup2: 'AxisGroup2',
      }

      this.COORDS = {
        Wobj: 'Wobj',
        Base: 'Base',
        Tool: 'Tool',
        World: 'World',
      }

      // this.setMechunit = async function (
      //   tool,
      //   wobj,
      //   jog_mode,
      //   coords,
      //   load = '',
      //   mU = 'ROB_1'
      // ) {
      //   await API.RWS.MOTIONSYSTEM.setMechunit(
      //     tool,
      //     wobj,
      //     load,
      //     '',
      //     '',
      //     jog_mode,
      //     coords
      //   )
      //   return
      // }

      this.executeJogging = async function (
        tool,
        wobj,
        coords,
        jog_mode,
        jogdata,
        robtarget = ''
      ) {
        try {
          this.jogStop = true
          await prepareJogging(tool, wobj, coords, jog_mode)
          await this.doJogging(jogdata, robtarget)
        } catch (err) {
          return rejectWithStatus('Execute jogging failed.', err)
        }
      }

      const prepareJogging = async function (
        tool = 'tool0',
        wobj = 'wobj0',
        coords = 'Base',
        jog_mode
      ) {
        try {
          await API.RWS.requestMastership('motion')

          let state = await API.RWS.getMastershipState('motion')
          console.log(`Motion Mastership: ${state}`)

          await API.RWS.MOTIONSYSTEM.setMechunit(
            tool,
            wobj,
            '',
            '',
            '',
            jog_mode,
            coords
          )
          // let mechUnit = await API.RWS.MOTIONSYSTEM.getMechunit()

          ccounter = await API.RWS.MOTIONSYSTEM.getChangeCount()
        } catch (err) {
          return rejectWithStatus('Prepare jogging failed.', err)
        }
      }

      this.doJogging = async function (jogdata, robtarget = '', once = false) {
        this.jogStop = false
        while (!this.jogStop) {
          let isManR = API.CONTROLLER.isManR
          let isMotOn = API.CONTROLLER.isMotOn
          // if (isManR && isMotOn) {
          if (true) {
            try {
              if (robtarget !== '') {
                await API.RWS.MOTIONSYSTEM.setRobotPosition(robtarget)
              }
              await API.RWS.MOTIONSYSTEM.jog(jogdata, ccounter)

              await sleep(200)
              if (once) this.jogStop = true
            } catch (err) {
              // console.error(JSON.stringify(err))
              this.jogStop = true
              return rejectWithStatus('Do jogging failed.', err)
            }
          } else {
            this.jogStop = true
            return rejectWithStatus(
              `Missing conditions to jog: Manual - ${isManR}, OpMode - ${isMotOn}`
            )
          }
        }
        console.log('Exit doJogging()')
      }

      this.stopJogging = async function () {
        const jogdata = [0, 0, 0, 0, 0, 0]
        this.jogStop = true
        try {
          await API.RWS.MOTIONSYSTEM.jog(jogdata, ccounter)
        } catch (err) {
          return rejectWithStatus('Stop jogging failed.', err)
        }
      }

      this.getRobotPosition = async function () {
        try {
          let robTarget = await API.RWS.MOTIONSYSTEM.getRobTarget()
          return robTarget
        } catch (err) {
          return rejectWithStatus('Get robot position failed.', err)
        }
      }
    })()

    /**
     * Extension of RWS not yet available at the omnicore.rws SDK
     */
    es.RWS = new (function () {
      const MASTERSHIP_STATE = {
        Nomaster: 'nomaster',
        Remote: 'remote',
        Local: 'local',
        Internal: 'internal',
      }

      this.requestMastership = function (type = 'edit') {
        if (type === 'edit')
          return RWS.Mastership.request()
            .then(() => Promise.resolve())
            .catch((err) =>
              Promise.reject(console.log('Could not get Mastership.', err))
            )
        else if (type != '') type = type + '/'
        return this._post(
          `/rw/mastership/${type}request`,
          '',
          `Request ${type} mastership failed.`
        )
      }

      // Releases the Mastership, if it fails it should log the error and hide the rejection.
      this.releaseMastership = function (type = 'edit') {
        if (type === 'edit')
          return RWS.Mastership.release()
            .then(() => Promise.resolve())
            .catch((err) => {
              RWS.writeDebug(`Could not release Mastership. >>> ${err.message}`)
              return Promise.resolve()
            })
        else if (type != '') type = type + '/'
        return this._post(
          `/rw/mastership/${type}release`,
          '',
          `Release ${type} mastership failed.`
        )
      }

      this.requestMastershipAround = function (func, args, type = 'edit') {
        let hasMastership = false
        let error = null

        return this.requestMastership(type)
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
          .then(() => this.releaseMastership(type))
          .then(() => {
            if (error !== null)
              return console.error('Failed to set value.', error)
            return Promise.resolve()
          })
      }
      this.getMastershipState = async function (type) {
        try {
          let res = await RWS.Network.get(`/rw/mastership/${type}`)
          let obj = parseJSON(res.responseText)
          return obj['state'][0]['mastership']
        } catch (err) {
          console.error(err)
        }
      }

      function parseResponse(res) {
        let items = []
        let obj = parseJSON(res.responseText)
        if (typeof obj === 'undefined')
          return Promise.reject('Could not parse JSON.')

        let resources = obj._embedded.resources
        resources.forEach((item) => {
          let it = {}
          it.name = item._title
          for (let prop in item) {
            if (prop.indexOf('_') === -1) {
              it[prop] = item[prop]
            }
          }
          items.push(it)
        })
        return items
      }

      this.MOTIONSYSTEM = new (function () {
        this.getMechunits = async function () {
          try {
            let res = await RWS.Network.get('/rw/motionsystem/mechunits')
            let items = []
            let obj = parseJSON(res.responseText)
            if (typeof obj === 'undefined')
              return Promise.reject('Could not parse JSON.')

            let resources = obj._embedded.resources
            resources.forEach((item) => {
              let it = {}
              it.name = item._title
              for (let prop in item) {
                if (prop.indexOf('_') === -1) {
                  it[prop] = item[prop]
                }
              }
              items.push(it)
            })
            return items
          } catch (err) {
            console.log(err)
            return rejectWithStatus('Could not get mechunits.', err)
          }
        }

        this.getMechunit = async function (mU = 'ROB_1') {
          try {
            let res = await RWS.Network.get(
              `/rw/motionsystem/mechunits/${mU}?continue-on-err=1`
            )
            let obj = parseJSON(res.responseText)

            let mechunit = {}

            mechunit.axes = obj.state[0].axes
            mechunit.axesTotal = obj.state[0]['axes-total']
            mechunit.coords = obj.state[0]['coord-system']
            mechunit.hasIntegratedUnit = obj.state[0]['has-integrated-unit']
            mechunit.isIntegratedUnit = obj.state[0]['is-integrated-unit']
            mechunit.jogMode = obj.state[0]['jog-mode']
            mechunit.mode = obj.state[0]['mode']
            mechunit.payload = obj.state[0]['payload-name']
            mechunit.status = obj.state[0]['status']
            mechunit.task = obj.state[0]['task-name']
            mechunit.tool = obj.state[0]['tool-name']
            mechunit.totalPayload = obj.state[0]['total-payload-name']
            mechunit.type = obj.state[0]['type']
            mechunit.wobj = obj.state[0]['wobj-name']
            mechunit.name = obj.state[0]._title

            return mechunit
          } catch (err) {
            console.log(err)
            return rejectWithStatus('Could not get mechunit.', err)
          }
        }

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
          let url = `/rw/motionsystem/mechunits/${mechunit}?continue-on-err=1`
          let body = ''
          body += tool ? 'tool=' + tool : ''
          body += wobj ? (body ? '&' : '') + 'wobj=' + wobj : ''
          body += payload ? (body ? '&' : '') + 'payload=' + payload : ''
          body += total_payload
            ? (body ? '&' : '') + 'total-payload=' + total_payload
            : ''
          body += mode ? (body ? '&' : '') + 'mode=' + mode : ''
          body += jog_mode ? (body ? '&' : '') + 'jog-mode=' + jog_mode : ''
          body += coords ? (body ? '&' : '') + 'coord-system=' + coords : ''

          let res = await API.RWS._post(url, body, 'Failed to set mechunit.')
          return res
        }

        this.setRobotPosition = function (r) {
          if (
            r.trans === undefined ||
            r.rot === undefined ||
            r.robconf === undefined
          )
            return Promise.reject("Parameter 'r' is not a robtarget.")

          let url = `/rw/motionsystem/position-target`
          let body = `pos-x=${r.trans.x}&pos-y=${r.trans.y}&pos-z=${
            r.trans.z
          }&orient-q1=${r.rot.q1}&orient-q2=${r.rot.q2}&orient-q3=${
            r.rot.q3
          }&orient-q4=${r.rot.q4}&config-j1=${r.robconf.cf1}&config-j4=${
            r.robconf.cf4
          }&config-j6=${r.robconf.cf6}&config-jx=${r.robconf.cfx}&extjoint-1=${
            r.extjoint ? r.extax.eax_a : 9e9
          }&extjoint-2=${r.extax ? r.extax.eax_b : 9e9}&extjoint-3=${
            r.extax ? r.extax.eax_c : 9e9
          }&extjoint-4=${r.extax ? r.extax.eax_d : 9e9}&extjoint-5=${
            r.extax ? r.extax.eax_e : 9e9
          }&extjoint-6=${r.extax ? r.extax.eax_f : 9e9}`

          return API.RWS._post(url, body, 'Failed to set robot position.')
        }

        this.jog = async function (jogdata, ccount) {
          let url = `/rw/motionsystem/jog`
          let body = `axis1=${jogdata[0]}&axis2=${jogdata[1]}&axis3=${jogdata[2]}\
                      &axis4=${jogdata[3]}&axis5=${jogdata[4]}&axis6=${jogdata[5]}&ccount=${ccount}`

          return await API.RWS._post(url, body, 'Failed to jog.')
        }

        this.getChangeCount = async function () {
          try {
            let res = await RWS.Network.get(
              `/rw/motionsystem?resource=change-count`
            )
            let obj = parseJSON(res.responseText)
            return obj['state'][0]['change-count']
          } catch (err) {
            console.log(err)
            return rejectWithStatus('Could not get change counter.', err)
          }
        }

        this.getRobTarget = async function (
          tool = '',
          wobj = '',
          coords = '',
          mechunit = 'ROB_1'
        ) {
          let params = ''
          params += tool ? '?tool=' + tool : ''
          params += wobj ? (params ? '&' : '?') + 'wobj=' + wobj : ''
          params += coords ? (params ? '&' : '?') + 'coordinate=' + coords : ''

          let res = await RWS.Network.get(
            `/rw/motionsystem/mechunits/${mechunit}/robtarget${params}`
          )

          let obj = parseJSON(res.responseText)

          let rt = { trans: {}, rot: {}, robconf: {}, extax: {} }
          rt.trans.x = parseFloat(obj['state'][0]['x'])
          rt.trans.y = parseFloat(obj['state'][0]['y'])
          rt.trans.z = parseFloat(obj['state'][0]['z'])
          rt.rot.q1 = parseFloat(obj['state'][0]['q1'])
          rt.rot.q2 = parseFloat(obj['state'][0]['q2'])
          rt.rot.q3 = parseFloat(obj['state'][0]['q3'])
          rt.rot.q4 = parseFloat(obj['state'][0]['q4'])
          rt.robconf.cf1 = parseFloat(obj['state'][0]['cf1'])
          rt.robconf.cf4 = parseFloat(obj['state'][0]['cf4'])
          rt.robconf.cf6 = parseFloat(obj['state'][0]['cf6'])
          rt.robconf.cfx = parseFloat(obj['state'][0]['cfx'])
          rt.extax.eax_a = parseFloat(obj['state'][0]['eax_a'])
          rt.extax.eax_b = parseFloat(obj['state'][0]['eax_b'])
          rt.extax.eax_c = parseFloat(obj['state'][0]['eax_c'])
          rt.extax.eax_d = parseFloat(obj['state'][0]['eax_d'])
          rt.extax.eax_e = parseFloat(obj['state'][0]['eax_e'])
          rt.extax.eax_f = parseFloat(obj['state'][0]['eax_f'])

          return rt
        }

        this.getJointTarget = async function (mechunit = 'ROB_1') {
          let res = await RWS.Network.get(
            `/rw/motionsystem/mechunits/${mechunit}/jointtarget`
          )
          let obj = parseJSON(res.responseText)
          console.log('🤣')
          console.log(obj)

          let jt = { robax: {}, extax: {} }
          jt.robax.rax_1 = obj['state'][0]['rax_1']
          jt.robax.rax_2 = obj['state'][0]['rax_2']
          jt.robax.rax_3 = obj['state'][0]['rax_3']
          jt.robax.rax_4 = obj['state'][0]['rax_4']
          jt.robax.rax_5 = obj['state'][0]['rax_5']
          jt.robax.rax_6 = obj['state'][0]['rax_6']
          jt.extax.eax_a = obj['state'][0]['eax_a']
          jt.extax.eax_b = obj['state'][0]['eax_b']
          jt.extax.eax_c = obj['state'][0]['eax_c']
          jt.extax.eax_d = obj['state'][0]['eax_d']
          jt.extax.eax_e = obj['state'][0]['eax_e']
          jt.extax.eax_f = obj['state'][0]['eax_f']

          return jt
        }
      })()

      this.loadModule = function (
        path,
        isReplace = false,
        taskName = 'T_ROB1'
      ) {
        const f = function () {
          return RWS.Network.post(
            `/rw/rapid/tasks/${taskName}/loadmod`,
            'modulepath=' + path + '&replace=' + isReplace
          )
        }
        return API.RWS.requestMastershipAround(f)
      }

      this.unloadModule = function (moduleName, taskName = 'T_ROB1') {
        const f = function () {
          return RWS.Network.post(
            `/rw/rapid/tasks/${taskName}/unloadmod`,
            'module=' + moduleName
          )
        }
        return API.RWS.requestMastershipAround(f)
      }

      this.movePPToCursor = function (moduleName, taskName, line, column) {
        if (typeof moduleName !== 'string')
          return Promise.reject("Parameter 'module' is not a string.")
        if (typeof line !== 'string')
          return Promise.reject("Parameter 'line' is not a string.")
        if (typeof line !== 'string')
          return Promise.reject("Parameter 'column' is not a string.")

        let url = `/rw/rapid/tasks/${encodeURIComponent(
          taskName
        )}/pcp/cursor?mastership=implicit`
        let body = `module=${encodeURIComponent(
          moduleName
        )}&line=${line}&column=${column}`

        // console.log(` ${url} ${body}`)
        return this._post(url, body, 'Failed to set PP to cursor.')

        // return RWS.Network.post(url, body)
        //   .then(() => Promise.resolve())
        //   .catch((err) => {
        //     console.error(err)
        //     console.error('Failed to set PP to cursor.')
        //   })
      }

      this.deleteConfigInstance = function (name, type, domain) {
        const f = function () {
          return RWS.Network.delete(
            `/rw/cfg/${domain}/${type}/instances/${name}`
          )
        }
        return API.RWS.requestMastershipAround(f)
      }

      this._post = function (url, body, error_msg) {
        return RWS.Network.post(url, body)
          .then(() => Promise.resolve())
          .catch((err) => {
            console.log(JSON.stringify(err))
            console.error(error_msg)
            return rejectWithStatus(error_msg, err)
          })
      }
    })()

    es.constructedApi = true
  })(API)
}
