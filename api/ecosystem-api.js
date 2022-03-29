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

    /**
     * The domain used for Signal handling
     */
    es.SIGNAL = new (function () {
      this.signals = []

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
          this.attr = attr
        }

        /**
         * Subscribe to the signal and set the callback function
         * @param {*} callback function to be called on change
         * @returns
         */
        async subscribe(callback) {
          try {
            console.log(this.signal)
            if (!this.signal) {
              console.log(`Signal ${this.name} not available for subscription`)
              return
            }

            const cb = async (value) => {
              // first time this is called, newValue is undefined.
              if (value === undefined) {
                value = await this.signal.getValue()
              }

              console.log(
                `${this.name} callback function called: value(${value})`
              )
              callback(value)
            }

            this.signal.addCallbackOnChanged(cb.bind(this))
            const failed = await this.signal.subscribe(true)

            if (failed) console.log(failed)
          } catch (e) {
            console.error(e)
          }
        }

        async unsubscribe() {
          return this.signal.unsubscribe()
        }

        async handler(value) {
          if (!this.signal) return
          this.signal.setValue(value)
        }
      }

      this.getSignalByName = function (name) {
        return this.signals.find((signal) => signal.name === name)
      }

      this.createSignal = async (attr) => {
        let signal = null
        let config = null

        // Check if signal is already available
        signal = await this.getSignal(attr.Name)
        if (signal) {
          console.log(`Signal ${attr.Name} exist already... `)
        }

        // Check if signal is configured
        config = await this.getConfigInstance(attr.Name)
        if (config) {
          console.log(
            `Signal ${attr.Name} found in configuration, use API.SIGNAL.setSignalAttributes to change attributes`
          )
        } else {
          // Signal instance NOT found, create a config instance
          this.createConfigInstance(attr.Name)
          this.setSignalAttributes(attr)
        }

        const s = new Signal(attr.Name, signal, config, attr)
        this.signals.push(s)
        return s
      }

      this.getSignalFromController = async (name) => {
        let signal = null
        let attr = []

        // Check if signal is already available
        signal = await this.getSignal(name)

        // Check if signal is configured
        let config = await this.getConfigInstance(name)
        // console.log(config)
        if (config) {
          // Signal instance found, get attributes of signal
          attr = await config.getAttributes()
          // console.log(attr)
        }

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
       * Get the configuration instace of a signal from RWS.CFG Namespace
       * @return {object} The cofiguration instace of a signal
       */
      this.getConfigInstance = async function (name) {
        try {
          const instance = await RWS.CFG.getInstanceByName(
            'EIO',
            'EIO_SIGNAL',
            name
          )
          return instance
        } catch (e) {
          console.error(
            `Error while getting configuration instance of a signal ${name}`
          )
          return null
        }
      }

      /**
       * Get the attributes of a signal
       * @return {object} The attributes of a signal
       */
      this.getAttributes = async function (name) {
        try {
          // Check if instance is configured (which does not necesarily means that the signal is already availabe),
          // after creating an instance, a Reboot is reqiured
          let config = await this.getConfigInstance()
          let attr = null
          if (config !== null) attr = config.getAttributes()
          console.log(attr)
          return attr
        } catch (e) {
          // if singal not available, then an exception will occur
          console.error(`Error while getting attributes of a signal ${name} `)
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

      this.setSignalAttributes = async function (attr) {
        try {
          console.log(attr.Name)
          console.log(attr.Access)
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
    })()

    es.constructedApi = true
  })(API)
}
