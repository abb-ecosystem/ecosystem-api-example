import API from './ecosystem-base.js';

export const factoryApiRapid = function (r) {
  /**
   * @alias API.RAPID
   * @namespace
   */
  r.RAPID = new (function () {
    this.variables = [];
    this.subscriptions = new Map();

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
     * @alias MODULETYPE
     * @memberof API.RAPID
     * @readonly
     * @enum {string}
     */
    const MODULETYPE = {
      Program: 'program',
      System: 'system',
    };
    this.MODULETYPE = MODULETYPE;

    /**
     * @memberof API
     * @param {RWS.Rapid.MonitorResources} res
     * @param {Function} func
     * @param {string} [task]
     * @returns {Promise<any>}
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
     * @typedef searchSymbolProps
     * @prop {string} [task] - task where the search takes place (default: 'T_ROB1')
     * @prop {string} [module] - module where the search takes place
     * @prop {boolean} [isInUse] only return symbols that are used in a Rapid program,
     * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
     * @prop {object} [dataType] - type of the data, e.g. 'num'(only one data type is supported)
     * @prop {number} [symbolType] - options can be equal one of the following values:
     *       <br>&emsp;undefined: 0
     *       <br>&emsp;constant: 1
     *       <br>&emsp;variable: 2
     *       <br>&emsp;persistent: 4
     *       <br>&emsp;function: 8
     *       <br>&emsp;procedure: 16
     *       <br>&emsp;trap: 32
     *       <br>&emsp;module: 64
     *       <br>&emsp;task: 128
     *       <br>&emsp;routine: 8 + 16 + 32
     *       <br>&emsp;rapidData: 1 + 2 + 4
     *       <br>&emsp;any: 255
     * @prop {string | Array} [name] name of the data symbol (not casesensitive)
     * @memberof API.RAPID
     */

    /**
     * @alias searchSymbol
     * @memberof API.RAPID
     * @param {searchSymbolProps} props
     * @returns {Promise<RWS.Rapid.SymbolSearchResult[]>}
     * A Promise with list of objects. Each object contains:
     *      <br>&emsp;(string) name name of the data symbol
     *      <br>&emsp;([string]) scope symbol scope
     *      <br>&emsp;(string) symbolType type of the symbol, e.g. 'pers'
     *      <br>&emsp;(string) dataType type of the data, e.g. 'num'
     * @private
     * @todo not yet working properly
     */
    const searchSymbol = async function ({
      task = 'T_ROB1',
      module = null,
      isInUse = false,
      dataType = '',
      symbolType = RWS.Rapid.SymbolTypes.rapidData,
      name = '',
    } = {}) {
      let elements = [];
      try {
        var properties = RWS.Rapid.getDefaultSearchProperties();
        let url = `RAPID/${task}`;
        if (module) url = url + `/${module}`;
        properties.searchURL = url;
        properties.types = symbolType;
        properties.isInUse = isInUse;
        var hits = [];
        if (name instanceof Array) {
          for (const index in name) {
            const regexp = name[index] !== '' ? `^.*${name[index]}.*$` : '';
            hits.push(...(await RWS.Rapid.searchSymbols(properties, dataType, regexp)));
          }
        } else {
          const regexp = name !== '' ? `^.*${name}.*$` : '';
          hits = await RWS.Rapid.searchSymbols(properties, dataType, regexp);
        }

        if (hits.length > 0) {
          for (let i = 0; i < hits.length; i++) {
            // API.log(JSON.stringify(hits[i]));
            elements.push(hits[i]);
          }
        }
        return elements;
      } catch (e) {
        return API.rejectWithStatus(`Failed to search variable ${name} -  module: ${module}, isInUse: ${isInUse}`, e);
      }
    };

    /**
     * Search for available tasks
     * @alias searchTasks
     * @memberof API.RAPID
     * @param {string} [filter] Only symbols containing the string pattern
     * @param {boolean} [caseSensitive] If false (default) the filter applies non-case-sensitive, otherwise it is case-sensitive
     * @returns {Promise<object>}
     */
    this.searchTasks = async function (filter = '', caseSensitive = false) {
      if (typeof filter !== 'string') {
        throw new Error('The filter string should be a valid string.');
      }
      const allTasks = await RWS.Rapid.getTasks();
      const taskNames = allTasks.map((t) => t.getName());

      const flags = caseSensitive ? '' : 'i';
      const regex = new RegExp(filter, flags);

      const filteredTaskNames = taskNames.filter((element) => regex.test(element));
      return taskNames.filter((element) => regex.test(element));
    };

    /**
     * Monitors changes to the Rapid program execution state. It is possible to provide
     * a callback function that will be called every time the state changes.
     * Current state is stored in{@link executionState} variable. Additionally, {@link isRunning}
     * is updated correspondingly.
     * @alias monitorExecutionState
     * @memberof API.RAPID
     * @param {function} [callback] - Callback function called when operation mode changes
     */
    this.monitorExecutionState = async function (callback = null) {
      if (this.executionState === undefined) {
        try {
          this.executionState = await RWS.Rapid.getExecutionState();
          this.isRunning = this.executionState === RWS.Rapid.ExecutionStates.running ? true : false;
          const cbExecState = function (data) {
            this.executionState = data;
            data === RWS.Rapid.ExecutionStates.running ? (this.isRunning = true) : (this.isRunning = false);
            API._events.trigger('execution', data);
            API.log(this.executionState);
          };
          subscribeRes(RWS.Rapid.MonitorResources.execution, cbExecState.bind(this));
        } catch (e) {
          return API.rejectWithStatus('Failed to subscribe execution state', e);
        }
      }
      API._events.on('execution', callback);
    };

    // this.monitorMechUnit = async function (callback = null) {
    //   try {
    //     if (typeof callback !== 'function' && callback !== null)
    //       throw new Error('callback is not a valid function');

    //     const cbMechUnit = function (data) {
    //       this.mechUnit = data;
    //       callback && callback(data);
    //       API.log(this.mechUnit);
    //     };
    //     subscribeRes('mechunit', cbMechUnit.bind(this));
    //   } catch (e) {
    //     return API.rejectWithStatus('Failed to subscribe execution state', e);
    //   }
    // };

    /**
     * @typedef startExecutionProps
     * @prop {string} regainMode - valid values: 'continue', 'regain', 'clear' or 'enter_consume'
     * @prop {string} execMode - valid values: 'continue', 'step_in', 'step_over', 'step_out', 'step_backwards', 'step_to_last' or 'step_to_motion'
     * @prop {string} cycleMode - valid values: 'forever', 'as_is' or 'once'
     * @prop {string} condition - valid values: 'none' or 'call_chain'
     * @prop {boolean} stopAtBreakpoint - stop at breakpoint
     * @prop {boolean} enableByTSP - all tasks according to task selection panel
     * @private
     */

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
       * Load a module from the controller HOME files
       * @alias loadModule
       * @memberof API.RAPID.Task
       * @param {string} path Path to the module file in
       * the HOME directory (included extension of the module).
       * @param {boolean} replace If true, it will replace an existing module in RAPID with the same name
       * @example
       * let url = `${this.path}/${this.name}${this.extension}`;
       * await task.loadModule(url, true);
       */
      loadModule(path, replace = false) {
        loadModule(path, replace, this.name);
      }

      /**
       * Unload a module from RAPID
       * @alias unloadModule
       * @memberof API.RAPID.Task
       * @param {string} module Module's name
       */
      unloadModule(module) {
        unloadModule(module, this.name);
      }

      /**
       * @typedef executeProcedureProps
       * @prop {boolean} [userLevel] If true, executes the procedure at user-leve,
       * i.e. as a service routine (default: false).
       * @prop {boolean} [resetPP] Resets the pointer to its previous position before execution
       * @prop {RWS.Rapid.CycleModes} [cycleMode] valid values: 'forever', 'as_is' or 'once'
       * @memberof API.RAPID.Task
       */

      /**
       * Execute a RAPID procedure
       * @alias executeProcedure
       * @memberof API.RAPID.Task
       * @param {string} procedure Procedure name
       * @param {executeProcedureProps} [props] Properties
       * @example
       * const task = await API.RAPID.getTask('T_ROB1');
       * await task.executeProcedure('myProcedure', { userLevel: true, resetPP: false});
       */
      async executeProcedure(procedure, { userLevel = false, resetPP = false, cycleMode = RWS.Rapid.CycleModes.once } = {}) {
        let pp;
        let progress;

        API.log(`👍 Task.executeProcedure: procedure: ${procedure}, userLevel : ${userLevel}`);

        try {
          ///////////////////////////////////////////////////////////////////////////
          progress = 'step0'; // check conditions (execution state, operation mode)
          //////////////////////////////////////////////////////////////////////////
          let exeState = await RWS.Rapid.getExecutionState();

          if (exeState !== RWS.Rapid.ExecutionStates.running) {
            // let opMode = await RWS.Controller.getOperationMode();
            //////////////////////////////////////////////////////////////////////
            progress = 'step1'; // 1 - check controller state
            //////////////////////////////////////////////////////////////////////
            let state = await RWS.Controller.getControllerState();
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
            await this._task.movePPToRoutine(procedure, userLevel);
            //////////////////////////////////////////////////////////////////////
            progress = 'step4'; // 4 - moved to routine pointer
            //////////////////////////////////////////////////////////////////////
            await RWS.Rapid.startExecution({
              regainMode: RWS.Rapid.RegainModes.continue,
              executionMode: RWS.Rapid.ExecutionModes.continue,
              cycleMode,
              condition: RWS.Rapid.Conditions.none,
              stopAtBreakpoint: true,
              enableByTSP: true,
            });
            //////////////////////////////////////////////////////////////////////
            progress = 'step5'; // 5 - execution started
            //////////////////////////////////////////////////////////////////////
            let exState = await RWS.Rapid.getExecutionState();
            while (exState === RWS.Rapid.ExecutionStates.running) {
              await API.sleep(200);
              exState = await RWS.Rapid.getExecutionState(); // ToDo: this is actually not working, modify it
            }
            exState = await RWS.Rapid.getExecutionState();
            //////////////////////////////////////////////////////////////////////
            progress = 'step6'; // 6 - execution finished
            //////////////////////////////////////////////////////////////////////
            await API.sleep(500);
            exState = await RWS.Rapid.getExecutionState();
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
            API.log('Execution already RUNNING!!!!');
          }
        } catch (e) {
          let ret;
          API.log(`💥 Exception occur at ${progress}`);
          switch (progress) {
            case 'step2': //
              API.log('10067: Program Pointer Reset');
              ret = API.rejectWithStatus('Program Pointer Reset', {
                message: 'Unable to reset the program pointer for task T_ROB1.',
                description: `The program will not start.`,
                cause: ['• No program is loaded.', '• The main routine is missing.', '• There are errors in the program.'],
              });
            case 'step6':
            // await RWS.Rapid.resetPP();
            default:
              ret = API.rejectWithStatus('Execute procedure failed.', e);
          }

          var state = await RWS.Rapid.getExecutionState();
          API.log('Rapid execution state on error:', state);
          if (state === RWS.Rapid.ExecutionStates.running) {
            await RWS.Rapid.stopExecution({
              stopMode: RWS.Rapid.StopModes.stop,
              useTSP: RWS.Rapid.UseTSPOptions.normal,
            });
            await setTimeout(() => {}, 2000);
            state = await RWS.Rapid.getExecutionState();
          }
          API.log(`Rapid execution state after stopExecution: ${state}`);
          return ret;
        }
      }

      /**
       * @typedef stopExecutionProps
       * @prop {RWS.Rapid.StopModes} [stopMode] stop mode, valid values: 'cycle', 'instruction', 'stop' or 'quick_stop'
       * @prop {RWS.Rapid.UseTSPOptions.normal} [useTSP] use task selection panel, valid values: 'normal' or 'all_tasks'
       * @memberof API.RAPID.Task
       */

      /**
       * Stops the Rapid execution with the settings given in the parameter object. All or any of the defined parameters can be supplied, if a value is omitted a default value will be used. The default values are:
       * stopMode = 'stop'
       * useTSP = 'normal'
       * @alias stopExecution
       * @memberof API.RAPID.Task
       * @param {stopExecutionProps} props
       * @example
       * const task = await API.RAPID.getTask('T_ROB1');
       * await task.stopExecution();
       */
      async stopExecution({ stopMode = RWS.Rapid.StopModes.stop, useTSP = RWS.Rapid.UseTSPOptions.normal } = {}) {
        var state = await RWS.Rapid.getExecutionState();
        if (state === RWS.Rapid.ExecutionStates.running) {
          await RWS.Rapid.stopExecution({
            stopMode,
            useTSP,
          });
        }
      }

      /**
       * @typedef { 'constant' | 'variable' | 'persistent'} VariableSymbolType ;
       * @memberof API.RAPID
       */

      /**
       * @typedef filterVariables
       * @prop {string} [name] Name of the data symbol (not casesensitive)
       * @prop {VariableSymbolType} [symbolType] valid values: 'constant', 'variable', 'persistent' (array with multiple values is supported)
       * @prop {string} [dataType] type of the data, e.g. 'num'(only one data type is supported)
       * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
       * @memberof API.RAPID
       */

      /**
       * Search for variable contained in a module
       * @alias searchVariables
       * @memberof API.RAPID.Task
       * @param {string} module - Module where the search takes place
       * @param {boolean} [isInUse] Only return symbols that are used in a Rapid program,
       * @param {filterVariables} [filter] See {@link filterVariables}
       * @returns {Promise<RWS.Rapid.SymbolSearchResult[]>}
       */

      async searchVariables(module = null, isInUse = false, filter = {}) {
        let searchFilter = { module, isInUse };
        let types;
        if (filter.hasOwnProperty('symbolType')) {
          types = Array.isArray(filter.symbolType)
            ? filter.symbolType.reduce((all, entry, idx, arr) => {
                if (entry === 'rapidData') {
                  arr.splice(1); // eject early
                  return RWS.Rapid.SymbolTypes[entry];
                }
                return entry === 'constant' || entry === 'variable' || entry === 'persistent' ? all + RWS.Rapid.SymbolTypes[entry] : all;
              }, 0)
            : RWS.Rapid.SymbolTypes[filter.symbolType];
        } else {
          types = RWS.Rapid.SymbolTypes['rapidData:'];
        }
        if (types !== undefined) {
          searchFilter.symbolType = types;
        }

        searchFilter.task = this.name;
        if (filter.hasOwnProperty('name')) searchFilter.name = filter.name;
        if (filter.hasOwnProperty('dataType')) searchFilter.dataType = filter.dataType;
        return searchSymbol(searchFilter);
      }

      /**
       * Search for available module
       * @alias searchModules
       * @memberof API.RAPID.Task
       * @param {boolean} [isInUse] Only return symbols that are used in a Rapid program,
       * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
       * @param {string} [filter] Only symbols containing the string patern (not casesensitive)
       * @returns {Promise<RWS.Rapid.SymbolSearchResult[]>}
       */
      async searchModules(isInUse = false, filter = '') {
        return searchSymbol({
          task: this.name,
          isInUse: isInUse,
          symbolType: RWS.Rapid.SymbolTypes.module,
          name: filter,
        });
      }

      /**
       * Search for procedures contained in a module
       * @alias searchProcedures
       * @memberof API.RAPID.Task
       * @param {string} module Module where the search takes place
       * @param {boolean} [isInUse] Only return symbols that are used in a Rapid program,
       * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
       * @param {string} [filter] Only symbols containing the string patern (not casesensitive)
       * @returns {Promise<RWS.Rapid.SymbolSearchResult[]>}
       */
      async searchProcedures(module = null, isInUse = false, filter = '') {
        return searchSymbol({
          task: this.name,
          module: module,
          isInUse: isInUse,
          symbolType: RWS.Rapid.SymbolTypes.procedure,
          name: filter,
        });
      }

      /**
       * @typedef { 'procedure' | 'function' | 'trap'} RoutineSymbolType ;
       * @memberof API.RAPID
       */

      /**
       * @typedef filterRoutines
       * @prop {string} [name] Name of the data symbol (not casesensitive)
       * @prop {RoutineSymbolType} [symbolType] Valid values: 'procedure', 'function', 'trap' , 'routine'(array with multiple values is supported)
       * @memberof API.RAPID
       */

      /**
       * Search for routines contained in a module
       * @alias searchRoutines
       * @memberof API.RAPID.Task
       * @param {string} module Module where the search takes place
       * @param {boolean} [isInUse] Only return symbols that are used in a Rapid program,
       * @param {filterRoutines} [filter] See {@link filterRoutines}
       *
       * @returns {Promise<RWS.Rapid.SymbolSearchResult[]>}
       */
      async searchRoutines(module = null, isInUse = false, filter = {}) {
        let types;
        if (filter.hasOwnProperty('symbolType')) {
          types = Array.isArray(filter.symbolType)
            ? filter.symbolType.reduce((all, entry, idx, arr) => {
                if (entry === 'routine') {
                  arr.splice(1); // eject early
                  return RWS.Rapid.SymbolTypes[entry];
                }
                return entry === 'procedure' || entry === 'function' || entry === 'trap' ? all + RWS.Rapid.SymbolTypes[entry] : all;
              }, 0)
            : RWS.Rapid.SymbolTypes[filter.symbolType];
        } else {
          types = RWS.Rapid.SymbolTypes['routine'];
        }

        return searchSymbol({
          task: this.name,
          module: module,
          isInUse: isInUse,
          symbolType: types,
          name: filter.name,
        });
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
          return API.rejectWithStatus(`Variable ${variable} not found at ${this._task.getName()} : ${module} module.`, e);
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
       * @todo Valiation of value not yet applied
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
       * Gets and a an RWS Data object variable
       * @alias getVariable
       * @memberof API.RAPID.Task
       * @param {string} module - module containing the variable
       * @param {string} variable - variable name
       * @returns {Promise<object>} API.RAPID.Variable object
       * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
       */
      async getVariable(module, variable) {
        return await getVariableInstance(this.name, module, variable);
      }

      /**
       * Gets a module. This will retrieve the properties for the module from the controller and initialize the object.
       * @alias getModule
       * @memberof API.RAPID.Task
       * @param {object} module - The name of the module
       * @returns {Promise<object>} a RWS Module object
       * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
       */
      async getModule(module) {
        return await this._task.getModule(module);
      }
    }

    /**
     * @typedef VariableProps
     * @prop {string} [taskName] task's name
     * @prop {string} [moduleName] module's name
     * @prop {string} [symbolName] symbol's name
     * @prop {string} [dataType] symbol's data type
     * @prop {string} [symbolType] the declaration type of the data, valid values:
     *     'constant'
     *     'variable'
     *     'persistent'
     * @prop {number[]} dimensions list of dimensions for arrays
     * @prop {string} [scope] the data's scope, valid values:
     *     'local'
     *     'task'
     *     'global'
     * @prop {string} [dataTypeURL] RWS URL to the data’s type symbol
     * @memberof API.RAPID
     */

    /**
     * Class representing a RAPID Variable.
     * @class Variable
     * @memberof API.RAPID
     * @param {RWS.Rapid.Data} variable
     * @param {VariableProps} props See {@link VariableProps}
     * @property {object} var Object returned by RWS.Rapid.getData().
     * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
     */
    class Variable extends API.Events {
      constructor(variable, props) {
        super();
        this.props = props;
        this.var = variable;
        this.callbacks = [];
        this._subscribed = false;
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
       * @alias subscribe
       * @param {boolean} raiseInitial raises an event after subscription
       * @returns {undefined | Promise<{}>} undefined at success, reject Promise at fail.
       * @memberof API.RAPID.Variable
       */
      async subscribe(raiseInitial = false) {
        try {
          await this._onChanged();

          if (!this._subscrided) {
            await this.var.subscribe(raiseInitial);
            this._subscrided = true;
          }
        } catch (e) {
          return API.rejectWithStatus(`Failed to subscribe variable "${this.name}"`, e);
        }
      }

      /**
       * Unsubscribe a RAPID variable
       * @alias unsubscribe
       * @returns {undefined | Promise<{}>} undefined at success, reject Promise at fail.
       * @memberof API.RAPID.Variable
       */
      async unsubscribe() {
        if (this._subscrided) {
          try {
            this._subscribed = false;
            return API.RAPID.unsubscribeVariable(this.props.taskName, this.props.moduleName, this.name);
          } catch (e) {
            return API.rejectWithStatus(`Failed to unsubscribe variable "${this.name}"`, e);
          }
        }
      }

      /**
       * Internal callback for variable specific handling. This method is called inside the subscribe method
       * @returns {undefined | Promise<{}>} undefined at success, reject Promise at fail.
       * @private
       */
      async _onChanged() {
        try {
          const cb = async (value) => {
            if (value === undefined) {
              value = await this.var.getValue();
            }
            this.trigger('changed', this._adapter(value));
          };

          this.var.addCallbackOnChanged(cb.bind(this));
        } catch (e) {
          return API.rejectWithStatus(`Failed to add callback on changed for "${this.name}"`);
        }
      }

      _adapter(value) {
        return value;
      }

      /**
       * Add a callback function to be executed when the variable value changes
       * @alias onChanged
       * @param {*} callback
       * @memberof API.RAPID.Variable
       */
      onChanged(callback) {
        this.on('changed', callback);
      }
    }

    /**
     * Class representing a RAPID Variable of type 'string'.
     * @class VariableString
     * @extends API.RAPID.Variable
     * @memberof API.RAPID
     * @param {string} variable
     * @param {VariableProps} props See {@link VariableProps}
     * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
     */
    class VariableString extends Variable {
      async getValue() {
        const value = await super.getValue();
        return value;
      }

      async setValue(value) {
        super.setValue(value);
      }

      _adapter(value) {
        return value.replace(/"$/, '').replace(/^"/, '');
      }
    }

    /**
     * Class representing a RAPID Variable of type 'bool'.
     * @class VariableBool
     * @extends API.RAPID.Variable
     * @memberof API.RAPID
     * @param {string} variable
     * @param {VariableProps} props See {@link VariableProps}
     * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
     */
    class VariableBool extends Variable {
      async getValue() {
        const value = (await super.getValue()) ? true : false;
        return value;
      }

      async setValue(value) {
        super.setValue(value);
      }

      _adapter(value) {
        return value === 'TRUE' || value === 'true' ? true : false;
      }
    }

    /**
     * Class representing a RAPID Variable of type 'num' and 'dnum'.
     * @class VariableNum
     * @extends API.RAPID.Variable
     * @memberof API.RAPID
     * @param {string} variable
     * @param {VariableProps} props See {@link VariableProps}
     * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
     */
    class VariableNum extends Variable {
      async getValue() {
        const value = await super.getValue();
        return this._getArrayItems(value);
      }

      async setValue(value) {
        const setArrayItems = function (array, variable, indices = []) {
          array.forEach((element, index) => {
            if (Array.isArray(element)) {
              setArrayItems(element, variable, [...indices, index + 1]);
            } else {
              variable.setArrayItem(Number(element), ...[...indices, index + 1]);
            }
          });
        };

        if (typeof value === 'string') value = JSON.parse(value);

        if (Array.isArray(value)) {
          setArrayItems(value, this.var);
        } else {
          super.setValue(Number(value));
        }
      }

      _adapter(value) {
        return this._getArrayItems(value);
      }

      _getArrayItems(value) {
        if (typeof value === 'string') value = JSON.parse(value);
        if (Array.isArray(value)) {
          const ret = value.map((v) => this._getArrayItems(v));
          return ret;
        } else {
          return Number(value);
        }
      }
    }

    const createVariable = async function (task, module, name) {
      const v = await RWS.Rapid.getData(task, module, name);
      const p = await v.getProperties();

      let variable;

      if (p.dataType === 'string') variable = new VariableString(v, p);
      else if (p.dataType === 'bool') variable = new VariableBool(v, p);
      else if (p.dataType === 'num' || p.dataType === 'dnum') variable = new VariableNum(v, p);
      else variable = new Variable(v, p);

      return variable;
    };

    this.subscribeVariable = async function (task, module, name) {
      const refName = task + ':' + module + ':' + name;
      let entry = this.subscriptions.get(refName);

      if (entry) {
        entry.count++;
        return entry.variable;
      } else {
        let newVariable = await createVariable(task, module, name);

        // double check case parallel async subscriptions just happened
        let entry = this.subscriptions.get(refName);
        if (!entry) {
          this.subscriptions.set(refName, { variable: newVariable, count: 1 });

          newVariable.subscribe();
          return newVariable;
        } else {
          return entry.variable;
        }
      }
    };

    this.unsubscribeVariable = function (task, module, name) {
      const refName = task + ':' + module + ':' + name;
      let entry = this.subscriptions.get(refName);
      if (entry && --entry.count === 0) {
        entry.variable.unsubscribe();
        this.subscriptions.delete(refName);
      }
    };

    /**
     * Subscribe to a existing RAPID variable.
     * @alias getVariableInstance
     * @memberof API.RAPID
     * @param {string} task  - RAPID Task in which the variable is contained
     * @param {string} module -RAPID module where the variable is contained
     * @param {string} name - name of RAPID variable
     * @returns RWS.RAPID Data object
     * @private
     */
    const getVariableInstance = async (task, module, name) => {
      if (task && module && name) {
        try {
          const v = await this.subscribeVariable(task, module, name);
          return v;
        } catch (e) {
          return API.rejectWithStatus(`Failed to subscribe to variable ${name} at ${task}->${module} module.`, e);
        }
      }
    };

    /**
     * Subscribe to a existing RAPID variable.
     * @alias getVariable
     * @memberof API.RAPID
     * @param {string} task  - RAPID Task in which the variable is contained
     * @param {string} module -RAPID module where the variable is contained
     * @param {string} name - name of RAPID variable
     * @returns {API.RAPID.Variable}
     */
    this.getVariable = getVariableInstance;

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
     * Load a module from the controller HOME files
     * @alias loadModule
     * @memberof API.RAPID
     * @param {string} path Path to the module file in
     * the HOME directory (included extension of the module).
     * @param {boolean} replace If true, it will replace an existing module in RAPID with the same name
     * @param {string} taskName Task's name where the module belongs to
     * @example
     * let url = `${this.path}/${this.name}${this.extension}`;
     * await task.loadModule(url, true);
     */
    const loadModule = async function (path, replace = false, taskName = 'T_ROB1') {
      await API.RWS.RAPID.loadModule.apply(null, arguments);
    };
    this.loadModule = loadModule;

    /**
     * Unload a RAPI module
     * @alias unloadModule
     * @memberof API.RAPID
     * @param {string} moduleName
     * @param {string} [taskName]
     */
    const unloadModule = async function (moduleName, taskName = 'T_ROB1') {
      // await API.RWS.requestMastership('edit');
      await API.RWS.RAPID.unloadModule.apply(null, arguments);
      // await API.RWS.releaseMastership('edit');
    };
    this.unloadModule = unloadModule;
  })();

  r.constructedRapid = true;
};

if (typeof API.constructedRapid === 'undefined') {
  factoryApiRapid(API);
}

export default API;
