var API = API || {};
if (typeof API.constructedRapid === 'undefined') {
  (function (r) {
    /**
     * @alias ECOSYSTEM_RAPID_LIB_VERSION
     * @memberof API
     * @constant
     * @type {number}
     */
    r.ECOSYSTEM_RAPID_LIB_VERSION = '0.4';

    /**
     * Shallow compare does check for equality. When comparing scalar values (numbers, strings)
     * it compares their values. When comparing objects, it does not compare their attributes -
     * only their references are compared (e.g. "do they point to same object?").
     * @param {object} object1
     * @param {object} object2
     * @returns {boolean} true if objects are shallow equal
     * @private
     */
    const shallowEqual = function (object1, object2) {
      const keys1 = Object.keys(object1);
      const keys2 = Object.keys(object2);
      if (keys1.length !== keys2.length) {
        return false;
      }
      for (let key of keys1) {
        if (object1[key] !== object2[key]) {
          return false;
        }
      }
      return true;
    };

    /**
     * @alias API.RAPID
     * @namespace
     */
    r.RAPID = new (function () {
      this.variables = [];

      /**
       * @alias EXEC
       * @memberof API.RAPID
       * @readonly
       * @enum {string}
       */
      this.EXEC = {
        Running: 'running',
        Stopped: 'stopped',
      };

      /**
       * @alias MODULETYPE
       * @memberof API.RAPID
       * @readonly
       * @enum {string}
       */
      this.MODULETYPE = {
        Program: 'program',
        System: 'system',
      };

      /**
       * @memberof API
       * @param {string} res
       * @param {function} func
       * @param {string} [task]
       * @returns {undefined |Promise<{}>}
       * @private
       */
      const subscribeRes = async function (res, func, task = 'T_ROB1') {
        try {
          const monitor = await RWS.Rapid.getMonitor(res, task);
          monitor.addCallbackOnChanged(func);
          await monitor.subscribe();
        } catch (e) {
          return API.rejectWithStatus(`Subscription to ${res} failed.`, e);
        }
      };

      /**
       * Subscribe to 'execution'. Current state is stored in
       * {@link execMode}. Additionally, {@link isRunning}
       * is updated with the corresponding value.
       * @alias monitorExecutionState
       * @memberof API.RAPID
       * @param {function} [callback] - Callback function called when operation mode changes
       */
      this.monitorExecutionState = async function (callback = null) {
        try {
          if (typeof callback !== 'function' && callback !== null)
            throw new Error('callback is not a valid function');
          this.execMode = await RWS.Rapid.getExecutionState();
          this.isRunning = this.execMode === API.RAPID.EXEC.Running ? true : false;
          const cbExecMode = function (data) {
            this.execMode = data;
            data === API.RAPID.EXEC.Running ? (this.isRunning = true) : (this.isRunning = false);
            callback && callback(data);
            API.log(this.execMode);
          };
          subscribeRes('execution', cbExecMode.bind(this));
        } catch (e) {
          return API.rejectWithStatus('Failed to subscribe execution state', e);
        }
      };

      /**
       * Get execution state
       * @alias getExecutionState
       * @memberof API.RAPID
       * @returns {Promise<string>}
       */
      this.getExecutionState = async function () {
        return await RWS.Rapid.getExecutionState();
      };

      /**
       * Class representing a RAPID Task. It abstract usefull ready to use functionalities
       * which otherwise require greater effort when implementing only with the Omnicore SDK.
       * This class cannot be direct instantiated. Therefore the {@link API.RAPID.getTask()}
       * method instead.
       * @class Task
       * @memberof API.RAPID
       * @param {object} task - RWS.RAPID Task Object
       * @example
       * const task = await API.RAPID.getTask('T_ROB1');
       * const modules = await task.searchModules();
       * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
       */
      class Task {
        constructor(task) {
          this._task = task;
          this.name = task.getName();
        }
        /**
         *
         * @param {string} regainMode - valid values: 'continue', 'regain', 'clear' or 'enter_consume'
         * @param {string} execMode - valid values: 'continue', 'step_in', 'step_over', 'step_out', 'step_backwards', 'step_to_last' or 'step_to_motion'
         * @param {string} cycleMode - valid values: 'forever', 'as_is' or 'once'
         * @param {string} condition - valid values: 'none' or 'call_chain'
         * @param {boolean} stopAtBreakpoint - stop at breakpoint
         * @param {boolean} enableByTSP - all tasks according to task selection panel
         * @private
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
          });
        }
        /**
         * Execute a RAPID procedure
         * @alias executeProcedure
         * @memberof API.RAPID.Task
         * @param {string} proc Procedure name
         * @param {boolean} [userLevel] - if true, executes the procedure at user-leve,
         * i.e. as a service routine (default: false).
         * @param {boolean} [resetPP] - Resets the pointer to its previous position before execution
         * @example
         * const task = await API.RAPID.getTask('T_ROB1');
         * await task.executeProcedure('myProcedure', false);
         */
        async executeProcedure(proc, userLevel = false, resetPP = false) {
          console.log(`Task.executeProcedure called, (as Service Routine: ${userLevel})...`);
          let pp;
          let progress;

          API.log(`proc: ${proc}, userLevel : ${userLevel}`);

          try {
            ///////////////////////////////////////////////////////////////////////////
            progress = 'step0'; // check conditions (execution state, operation mode)
            //////////////////////////////////////////////////////////////////////////
            let exeState = await API.RAPID.getExecutionState();

            if (exeState !== API.RAPID.EXEC.Running) {
              let opMode = await RWS.Controller.getOperationMode();
              //////////////////////////////////////////////////////////////////////
              progress = 'step1'; // 1 - check controller state
              //////////////////////////////////////////////////////////////////////
              let state = await RWS.Controller.getControllerState();
              // if (state === API.CONTROLLER.STATE.GuardStop) {
              //   throw new Error(
              //     'Controller state in Guard Stop - procedure execution not possible'
              //   );
              // }
              if (state !== API.CONTROLLER.STATE.MotorsOn && userLevel === false) {
                throw new Error('Turn on the motors to execute procedure');
              }
              //////////////////////////////////////////////////////////////////////
              progress = 'step2'; // 2 - controller prepared for calling procedure
              //////////////////////////////////////////////////////////////////////
              let pointers = await this._task.getPointers();
              pp = pointers.programPointer;
              if (pp.hasValue === false) {
                await RWS.Rapid.resetPP();
                pointers = await this._task.getPointers();
                pp = pointers.programPointer;
              }
              //////////////////////////////////////////////////////////////////////
              progress = 'step3'; // 3 - current pointer gotten
              //////////////////////////////////////////////////////////////////////
              // Move pointer to procedure
              await this._task.movePPToRoutine(proc, userLevel);
              //////////////////////////////////////////////////////////////////////
              progress = 'step4'; // 4 - moved to routine pointer
              //////////////////////////////////////////////////////////////////////
              await Task._startExecution('continue', 'continue', 'once', 'none', true, true);
              //////////////////////////////////////////////////////////////////////
              progress = 'step5'; // 5 - execution started
              //////////////////////////////////////////////////////////////////////
              state = await RWS.Rapid.getExecutionState();
              while (state === 'running') {
                await API.sleep(200);
                state = await RWS.Rapid.getExecutionState(); // ToDo: this is actually not working, modify it
              }
              state = await RWS.Rapid.getExecutionState();
              //////////////////////////////////////////////////////////////////////
              progress = 'step6'; // 6 - execution finished
              //////////////////////////////////////////////////////////////////////
              await API.sleep(500);
              state = await RWS.Rapid.getExecutionState();
              API.log(state);
              API.log(pp);

              if (resetPP && pp.hasValue === true) {
                pointers = await this._task.getPointers();
                let cp = pointers.programPointer;
                if (!shallowEqual(cp, pp)) {
                  const s = pp.beginPosition;
                  let position = s.search(',');
                  let line = s.slice(0, position);
                  let column = s.slice(position + 1);
                  await this._task.movePPToRoutine(pp.routineName);
                  await API.RWS.RAPID.movePPToCursor(pp.moduleName, this.name, line, column);
                }
              }

              //////////////////////////////////////////////////////////////////////
              progress = 'step7'; // 7 - pointer back to original position
              //////////////////////////////////////////////////////////////////////
            } else {
              API.log('ExecutionStae already RUNNING!!!!');
            }
          } catch (e) {
            API.log(`💥 Exception occur at ${progress}`);
            switch (progress) {
              case 'step2': //
                API.log('10067: Program Pointer Reset');
                return API.rejectWithStatus('Program Pointer Reset', {
                  message: 'Unable to reset the program pointer for task T_ROB1.',
                  description: `The program will not start.&#13;&#10;Causes: &#13;&#10;
                    • No program is loaded.&#13;&#10;• The main routine is missing.&#13;&#10;• There are errors in the program.`,
                });
              case 'step6':
              // await RWS.Rapid.resetPP();
              default:
                var state = await RWS.Rapid.getExecutionState();
                if (state === 'running') {
                  await RWS.Rapid.stopExecution({
                    stopMode: 'stop',
                    useTSP: 'normal',
                  });
                  await setTimeout(() => {}, 2000);
                  state = await RWS.Rapid.getExecutionState();
                  if (state === 'stopped') {
                    API.log('Rapid execution stopped.');
                  }
                }
                return API.rejectWithStatus('Execute procedure failed.', e);
            }
          }
        }

        /**
         * Stop a running RAPID program execution
         * @alias stopExecution
         * @memberof API.RAPID.Task
         * @param {string} [stopMode] stop mode, valid values: 'cycle', 'instruction', 'stop' or 'quick_stop'
         * @param {string} [useTSP] use task selection panel, valid values: 'normal' or 'all_tasks'
         * @example
         * const task = await API.RAPID.getTask('T_ROB1');
         * await task.stopExecution();
         */
        async stopExecution(stopMode = 'stop', useTSP = 'normal') {
          var state = await RWS.Rapid.getExecutionState();
          if (state === 'running') {
            await RWS.Rapid.stopExecution({
              stopMode: stopMode,
              useTSP: 'normal',
            });
          }
        }

        /**
         * @alias _searchSymbol
         * @memberof API.RAPID.Task
         * @param {string} module - module where the search takes place
         * @param {string} symbolType - RWS.Rapid.SymbolTypes.<option>
         * where options can be equal one of the following values:
         *       <br>&emsp;constant
         *       <br>&emsp;variable
         *       <br>&emsp;persistent
         *       <br>&emsp;function
         *       <br>&emsp;procedure
         *       <br>&emsp;trap
         *       <br>&emsp;module
         *       <br>&emsp;task
         *       <br>&emsp;routine
         *       <br>&emsp;rapidData
         *       <br>&emsp;any
         * @param {boolean} [isInUse] only return symbols that are used in a Rapid program,
         * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
         * @returns {Promise<object>}
         * A Promise with list of objects. Each object contains:
         *      <br>&emsp;(string) name name of the data symbol
         *      <br>&emsp;([string]) scope symbol scope
         *      <br>&emsp;(string) symbolType type of the symbol, e.g. 'pers'
         *      <br>&emsp;(string) dataType type of the data, e.g. 'num'
         * @private
         * @todo not yet working properly
         */
        static async _searchSymbol(module = null, symbolType, isInUse = false) {
          let vars = [];
          var properties = RWS.Rapid.getDefaultSearchProperties();
          // properties.method = RWS.SearchMethods.block
          properties.searchURL = `RAPID/${this.name}${module === null ? `` : `/${module}`}`;
          properties.types = symbolType;
          properties.isInUse = isInUse;
          var hits = await RWS.Rapid.searchSymbols(properties);
          if (hits.length > 0) {
            for (let i = 0; i < hits.length; i++) {
              // API.log(JSON.stringify(hits[i]));
              vars.push(hits[i]);
            }
          }
          return vars;
        }

        /**
         * @alias searchConstants
         * @memberof API.RAPID.Task
         * @param {string} module - module where the search takes place
         * @param {boolean} [isInUse] only return symbols that are used in a Rapid program,
         * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
         * @returns {Promise<object>}
         * @private
         * @todo not yet working
         */
        async searchConstants(module = null, isInUse = false) {
          return Task._searchSymbol(module, RWS.Rapid.SymbolTypes.constant, isInUse);
        }

        /**
         * @alias searchPersistents
         * @memberof API.RAPID.Task
         * @param {string} module - module where the search takes place
         * @param {boolean} [isInUse] only return symbols that are used in a Rapid program,
         * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
         * @returns {Promise<object>}
         * @private
         * @todo not yet working
         */
        async searchPersistents(module = null, isInUse = false) {
          return Task._searchSymbol(module, RWS.Rapid.SymbolTypes.persistent, isInUse);
        }

        /**
         * Search for variable contained in a module
         * @alias searchVariables
         * @memberof API.RAPID.Task
         * @param {string} module - module where the search takes place
         * @param {boolean} [isInUse] only return symbols that are used in a Rapid program,
         * @param {object} [filter] - The following filters can be applied:
         * <br>&emsp;name - name of the data symbol (not casesensitive)
         * <br>&emsp;symbolType - valid values: 'constant', 'variable', 'persistent' (array with multiple values is supported)
         * <br>&emsp;dataType - type of the data, e.g. 'num'(only one data type is supported)
         * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
         * @returns {Promise<object>}
         */
        async searchVariables(module = null, isInUse = false, filter = {}) {
          let vars = [];
          try {
            var properties = RWS.Rapid.getDefaultSearchProperties();
            properties.searchURL = `RAPID/${this.name}${module === null ? `` : `/${module}`}`;

            let symbolType = 0;
            if (filter.hasOwnProperty('symbolType')) {
              const hasValue = (value) => {
                if (value.toLowerCase() === 'constant')
                  symbolType += RWS.Rapid.SymbolTypes.constant;
                else if (value.toLowerCase() === 'variable')
                  symbolType += RWS.Rapid.SymbolTypes.variable;
                else if (value.toLowerCase() === 'persistent')
                  symbolType += RWS.Rapid.SymbolTypes.persistent;
              };
              Array.isArray(filter.symbolType)
                ? filter.symbolType.map((entry) => hasValue(entry))
                : hasValue(filter.symbolType);
            } else {
              symbolType = RWS.Rapid.SymbolTypes.rapidData;
            }
            properties.types = symbolType;

            properties.isInUse = isInUse;
            const regexp = filter.hasOwnProperty('name') ? `^.*${filter.name}.*$` : '';
            const dataType = filter.hasOwnProperty('dataType') ? filter.dataType : '';

            var hits = await RWS.Rapid.searchSymbols(properties, dataType, regexp);

            if (hits.length > 0) {
              for (let i = 0; i < hits.length; i++) {
                vars.push(hits[i]);
              }
            }
            return vars;
          } catch (e) {
            return API.rejectWithStatus(
              `Failed to search variables -  module: ${module}, isInUse: ${isInUse}`,
              e
            );
          }
        }

        /**
         * Search for procedures contained in a module
         * @alias searchProcedures
         * @memberof API.RAPID.Task
         * @param {string} module - module where the search takes place
         * @param {boolean} [isInUse] only return symbols that are used in a Rapid program,
         * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
         * @param {string} [filter] - only symbols containing the string patern (not casesensitive)
         * @returns {Promise<object>}
         */
        async searchProcedures(module = null, isInUse = false, filter = '') {
          try {
            let items = [];
            var properties = await RWS.Rapid.getDefaultSearchProperties();
            properties.searchURL = `RAPID/${this.name}${module === null ? `` : `/${module}`}`;
            properties.types = RWS.Rapid.SymbolTypes.procedure;
            properties.isInUse = isInUse;
            const regexp = filter !== '' ? `^.*${filter}.*$` : '';
            var hits = await RWS.Rapid.searchSymbols(properties, '', regexp);
            if (hits.length > 0) {
              for (let i = 0; i < hits.length; i++) {
                items.push(hits[i]);
              }
            }
            return items;
          } catch (e) {
            return API.rejectWithStatus(
              `Failed to search procedures -  module: ${module}, isInUse: ${isInUse}`,
              e
            );
          }
        }

        /**
         * Search for available module
         * @alias searchModules
         * @memberof API.RAPID.Task
         * @param {boolean} [isInUse] only return symbols that are used in a Rapid program,
         * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
         * @param {string} [filter] - only symbols containing the string patern (not casesensitive)
         * @returns {Promise<object>}
         */
        async searchModules(isInUse = false, filter = '') {
          let items = [];

          try {
            var properties = await RWS.Rapid.getDefaultSearchProperties();
            properties.searchURL = `RAPID/${this.name}`;
            properties.types = RWS.Rapid.SymbolTypes.module;
            properties.isInUse = isInUse;
            const regexp = filter !== '' ? `^.*${filter}.*$` : '';
            var hits = await RWS.Rapid.searchSymbols(properties, '', regexp);
            if (hits.length > 0) {
              for (let i = 0; i < hits.length; i++) {
                // API.log(JSON.stringify(hits[i]));
                items.push(hits[i]);
              }
            }
            return items;
          } catch (e) {
            return API.rejectWithStatus(`Failed to search modules -  isInUse: ${isInUse}`, e);
          }

          // return Task._searchSymbol('', RWS.Rapid.SymbolTypes.module, isInUse)
        }

        async searchFunctions(module = null, isInUse = false) {
          return Task._searchSymbol(module, RWS.Rapid.SymbolTypes.function, isInUse);
        }

        async searchRoutines(module = null, isInUse = false) {
          return Task._searchSymbol(module, RWS.Rapid.SymbolTypes.routine, isInUse);
        }

        async searchTraps(module = null, isInUse = false) {
          return Task._searchSymbol(module, RWS.Rapid.SymbolTypes.trap, isInUse);
        }

        async searchRapidData(module = null, isInUse = false) {
          return Task._searchSymbol(module, RWS.Rapid.SymbolTypes.rapidData, isInUse);
        }

        /**
         * Get the value of a variable
         * @alias getValue
         * @memberof API.RAPID.Task
         * @param {string} module - module containing the variable
         * @param {string} variable - variable name
         * @returns {Promise<object>}
         */
        async getValue(module, variable) {
          try {
            var data = await this._task.getData(module, variable);
            return await data.getValue();
          } catch (e) {
            return API.rejectWithStatus(
              `Variable ${variable} not found at ${this._task.getName()} : ${module} module.`,
              e
            );
          }
        }

        /**
         * Set the value of a variable
         * @alias setValue
         * @memberof API.RAPID.Task
         * @param {string} module - module containing the variable
         * @param {string} variable - variable name
         * @param {object} value - value of the variable
         * @returns {Promise<object>}
         */
        async setValue(module, variable, value) {
          try {
            var data = await this._task.getData(module, variable);
            await data.setValue(value);
          } catch (err) {
            return API.rejectWithStatus(`Set variable ${module}:${variable} failed.`, err);
          }
        }

        /**
         * Gets and subscribe to a RAPID variable
         * @alias getVariable
         * @memberof API.RAPID.Task
         * @param {*} module - module containing the variable
         * @param {*} variable - variable name
         * @returns {Promise<object>} API.RAPID.Variable object
         */
        async getVariable(module, variable) {
          return await API.RAPID.getVariable(this.name, module, variable);
        }

        /**
         * Gets a RWS.Rapid Module Object
         * @alias getModule
         * @memberof API.RAPID.Task
         * @param {*} module - module containing the variable
         * @returns {Promise<object>} API.RAPID.Variable object
         * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
         */
        async getModule(module) {
          return await this._task.getModule(module);
        }

        /**
         * Get the name of modules available within the task
         * @alias getModuleNames
         * @memberof API.RAPID.Task
         * @param {string} type - it can be 'program' or 'system', otherwise all modules are returned
         * @returns {Promise<array>} - List of found modules
         * @private
         */
        async getModuleNames(type = '') {
          let ret = [];
          try {
            const modules = await RWS.Rapid.getModuleNames(this.name);
            if (
              modules.hasOwnProperty('programModules') === true &&
              type !== API.RAPID.MODULETYPE.System
            ) {
              for (let i = 0; i < modules['programModules'].length; i++) {
                ret.push(modules['programModules'][i]);
              }
            }
            if (
              modules.hasOwnProperty('systemModules') === true &&
              type !== API.RAPID.MODULETYPE.Program
            ) {
              for (let i = 0; i < modules['systemModules'].length; i++) {
                ret.push(modules['systemModules'][i]);
              }
            }
            return ret;
          } catch (e) {
            return API.rejectWithStatus('Failed to get modules', e);
          }
        }
      }

      /**
       * Class representing a RAPID Variable.
       * @class Variable
       * @memberof API.RAPID
       * @param {object} task - RWS.RAPID Task Object
       * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
       * @todo not fully implemented
       */
      class Variable extends API.Events {
        constructor(variable, props) {
          super();
          this.props = props;
          this.var = variable;
          this.callbacks = [];
          this._subscrided = false;
        }

        get name() {
          return this.props.symbolName;
        }

        get value() {
          return (async () => {
            try {
              await this.var.fetch();
              return await this.var.getValue();
            } catch (e) {
              return API.rejectWithStatus(`Failed to get value of variable "${this.name}"`, e);
            }
          })();
        }

        set value(v) {
          this.var && this.var.setValue(v);
        }

        async getValue() {
          try {
            await this.var.fetch();
            return await this.var.getValue();
          } catch (e) {
            return API.rejectWithStatus(`Failed to get value of variable "${this.name}"`, e);
          }
        }

        async setValue(v) {
          try {
            if (this.type === 'num' && typeof v === 'string') v = Number.parseInt(v);
            return this.var && (await this.var.setValue(v));
          } catch (e) {
            return API.rejectWithStatus(`Failed to set value of variable ${this.name}`, e);
          }

          // this.signal && this.signal.setValue(v)
        }

        get type() {
          return this.props.dataType;
        }

        /**
         * Returns the declaration type of the data, valid values:
         * 'constant'
         * 'variable'
         * 'persistent'
         */
        get declaration() {
          return this.props.symbolType;
        }

        /**
         * Subscribe to a RAPID variable
         * @param {boolean} raiseInitial raises an event after subscription
         * @returns {undefined | Promise<{}>} undefined at success, reject Promise at fail.
         */
        async subscribe(raiseInitial = false) {
          try {
            await this._onChanged();

            // const ret = await Promise.race(this.var.subscribe(raiseInitial), timeout(TIMEOUT_SEC));
            if (!this._subscrided) {
              await this.var.subscribe(raiseInitial);
              this._subscrided = true;
            }
          } catch (e) {
            return API.rejectWithStatus(`Failed to subscribe variable "${this.name}"`, e);
          }
        }

        async unsubscribe() {
          if (this._subscrided) return this.var.unsubscribe();
        }

        /**
         * Internal callback for variable specific handling. This method is called inside the subscribe method
         * @returns {undefined | Promise<{}>} undefined at success, reject Promise at fail.
         * @protected
         */
        async _onChanged() {
          try {
            const cb = async (value) => {
              if (value === undefined) {
                value = await this.var.getValue();
              }
              this.trigger('changed', value);
            };

            this.var.addCallbackOnChanged(cb.bind(this));
          } catch (e) {
            return API.rejectWithStatus(`Failed to add callback on changed for "${this.name}"`);
          }
        }

        onChanged(callback) {
          this.on('changed', callback);
        }
      }

      class VariableString extends Variable {
        async getValue() {
          const value = await super.getValue();
          return value;
        }

        async setValue(value) {
          super.setValue(value);
        }

        /**
         * Internal callback for variable specific handling. This method is called inside the subscribe method
         * @returns {undefined | Promise<{}>} undefined at success, reject Promise at fail.
         * @protected
         */
        async _onChanged() {
          try {
            const cb = async (value) => {
              if (value === undefined) {
                value = await this.var.getValue();
              }
              value = value.replace(/"$/, '').replace(/^"/, '');
              this.trigger('changed', value);
            };

            this.var.addCallbackOnChanged(cb.bind(this));
          } catch (e) {
            return API.rejectWithStatus(`Failed to add callback on changed for "${this.name}"`);
          }
        }
      }

      class VariableBool extends Variable {
        async getValue() {
          const value = (await super.getValue()) ? true : false;
          return value;
        }

        async setValue(value) {
          super.setValue(value);
        }

        /**
         * Internal callback for variable specific handling. This method is called inside the subscribe method
         * @returns {undefined | Promise<{}>} undefined at success, reject Promise at fail.
         * @protected
         */
        async _onChanged() {
          try {
            const cb = async (value) => {
              if (value === undefined) {
                value = await this.var.getValue();
              }

              // this.trigger('changed', value.toLowerCase());
              this.trigger('changed', value === 'TRUE' || value === 'true' ? true : false);
            };

            this.var.addCallbackOnChanged(cb.bind(this));
          } catch (e) {
            return API.rejectWithStatus(`Failed to add callback on changed for "${this.name}"`);
          }
        }
      }

      class VariableNum extends Variable {
        async getValue() {
          const value = Number(await super.getValue());
          return value;
        }

        async setValue(value) {
          super.setValue(Number(value));
        }

        /**
         * Internal callback for variable specific handling. This method is called inside the subscribe method
         * @returns {undefined | Promise<{}>} undefined at success, reject Promise at fail.
         * @protected
         */
        async _onChanged() {
          try {
            const cb = async (value) => {
              if (value === undefined) {
                value = await this.var.getValue();
              }

              this.trigger('changed', Number(value));
            };

            this.var.addCallbackOnChanged(cb.bind(this));
          } catch (e) {
            return API.rejectWithStatus(`Failed to add callback on changed for "${this.name}"`);
          }
        }
      }

      /**
       * Subscribe to a existing RAPID variable.
       * @alias getVariable
       * @memberof API.RAPID
       * @param {string} task  - RAPID Task in which the variable is contained
       * @param {string} module -RAPID module where the variable is contained
       * @param {string} name - name of RAPID variable
       * @param {string} id  (optional) - DOM element id in which "textContent" will get the value of  the variable
       * @returns RWS.RAPID Data object
       */
      this.getVariable = async (task, module, name, id = null) => {
        if (task && module && name) {
          let found = this.variables.find((v) => v.name === name);
          try {
            let variable;
            if (found) {
              variable = found;
            } else {
              const v = await RWS.Rapid.getData(task, module, name);
              const p = await v.getProperties();

              if (p.dataType === 'string') variable = new VariableString(v, p);
              else if (p.dataType === 'bool') variable = new VariableBool(v, p);
              else if (p.dataType === 'num' || p.dataType === 'dnum')
                variable = new VariableNum(v, p);
              else variable = new Variable(v, p);
            }

            //check again before pushing
            const findIndex = this.variables.findIndex((v) => v.name === name);

            if (findIndex === -1) {
              variable.subscribe();
              this.variables.push(variable);
            } else {
              variable = this.variables[findIndex];
            }

            return variable;
          } catch (e) {
            return API.rejectWithStatus(
              `Failed to subscribe to variable ${name} at ${task}->${module} module.`,
              e
            );
          }
        }
      };

      /**
       * Gets an instance of a API.RAPID.Task class
       * @alias getTask
       * @memberof API.RAPID
       * @param {string} task - Task name
       * @returns {Promise<object>} - API.RAPID.Task
       */
      this.getTask = async function (task = 'T_ROB1') {
        const t = await RWS.Rapid.getTask(task);
        return new Task(t);
      };

      /**
       * Load a RAPID module from a file
       * @alias loadModule
       * @memberof API.RAPID
       * @param {string} path - path of the module file
       * @param {boolean} replace - if true, replace an existing module with the same name
       * @param {string} [taskName]
       */
      this.loadModule = async function (path, replace = false, taskName = 'T_ROB1') {
        const opmode = API.CONTROLLER.opMode;
        if (API.CONTROLLER.opMode !== API.CONTROLLER.OPMODE.ManualR) {
          await API.CONTROLLER.setOpModeManual();
          await API.sleep(1000);
        }
        await API.RWS.RAPID.loadModule.apply(null, arguments);
      };

      /**
       * Unload a RAPI module
       * @alias unloadModule
       * @memberof API.RAPID
       * @param {string} moduleName
       * @param {string} [taskName]
       */
      this.unloadModule = async function (moduleName, taskName = 'T_ROB1') {
        await API.RWS.RAPID.unloadModule.apply(null, arguments);
      };
    })();

    r.constructedRapid = true;
  })(API);
}
