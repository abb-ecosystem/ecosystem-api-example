/// <reference path="API-enums.ts" />
/// <reference path="../../rws-api/RWS.d.ts" />

declare namespace API {
  let ECOSYSTEM_API_VERSION: string;

  let verbose: boolean;
  let __unload: boolean;

  /**
   * Called when window has loaded
   * Currently nothing is done inside
   */
  function init(): Promise<any>;

  /**
   * Set vorbose-flag to print in Flexpendant debugging window any error catched within the API
   * @alias setVerbose
   * @param {boolean} [value] - if true, logs are exposed
   * @memberof API
   */
  function setVerbose(value?: boolean): void;

  /**
   * If verbose is true, logs to console
   * @param {string} msg
   * @private
   */
  function log(msg: string): void;

  /**
   * If verbose is true, errors to console (stringified so that it appears in Flexpendant debug window too.)
   * @param {any} e
   * @private
   */
  function error(e: Error): void;

  function rejectWithStatus(message: string, item?: object): Promise<any>;

  /**
   * Generates an UUIDs (Universally Unique IDentifier)
   * @alias generateUUID
   * @memberof API
   * @returns {string} UUID
   */
  function generateUUID(): string;

  /**
   * Asynchronous sleep function
   * @alias sleep
   * @memberof API
   * @param {number} ms - Time in miliseconds
   * @returns {Promise}
   * @example
   * await API.sleep(1000);
   */
  function sleep(ms: Number): Promise<any>;

  /**
   * Timeout function - this can be used with Promise.race to escape another asynchronous function which takes longer than the timeout
   * @alias timeout
   * @memberof API
   * @param {number} s - Time in seconds
   * @private
   */
  function timeout(s: Number): Promise<Error>;

  interface waitForConditionOptions {
    interval_ms?: Number;
    timeout_ms?: Number;
  }

  /**
   * Wait for a condition to be true. It can be used together with Promise.race and API.timeout for waiting for a condition with timeout
   * @alias waitForCondition
   * @memberof API
   * @param {function} func - Function containing the condition
   * @param {number} interval_ms - Interval in miliseconds
   * @returns {Promise}
   * @private
   */
  function waitForCondition(func: Function, options: waitForConditionOptions): Promise<any>;

  class Events {
    constructor();
    on(eventName: string, callback: Function);
    trigger(eventName: string, data?: any);
  }

  namespace CONTROLLER {
    let isAuto: boolean;
    let isManual: boolean;
    function monitorOperationMode(callback?: Function): Promise<any>;
    function monitorControllerState(callback?: Function): Promise<any>;
    function setOpMode(mode: API.CONTROLLER.OPMODE): Promise<void>;
    function setOpModeManual(): Promise<void>;
    function setOpModeAutomatic(): Promise<void>;
    function getOperationMode(): Promise<string>;
    function getControllerState(): Promise<string>;
    function getLanguage(): Promise<string>;
    function restart(): Promise<any>;
  }

  namespace CONFIG {
    type Action = 'add' | 'replace' | 'add-with-reset';
    function loadConfiguration(filepath: string, action?: Action);

    function getSignalAttributes(name: string): Promise<object>;
    function createSignalInstance(name: string): Promise<any>;
    function updateSignalAttributes(attr: any): void;
    function deleteSignal(name: string);

    function getCrossConnectionAttributes(name: string): Promise<object>;
    function createCrossConnectionInstance(name: string): Promise<any>;
    function updateCrossConnectionAttributes(attr: any): Promise<any>;
    function deleteCrossConnection(name: string);

    function fetchAllInstancesOfType(type: TYPE): Promise<object[]>;
    function fetchAllCrossConnections(): Promise<object[]>;
    function fetchAllSignals(): Promise<object[]>;
  }

  namespace DEVICE {
    function searchEthernetIPDevices(): Promise<string[]>;
    interface SignalAttributesProp {
      name?: string;
      device?: string;
      map?: string;
      type?: 'DI' | 'DO' | 'AI' | 'AO' | 'GI' | 'GO';
    }
    function find(attr): Promise<SIGNAL.Signal>;
  }

  namespace SIGNAL {
    class Signal {
      constructor(name, signal, attr);
      public name;
      getValue(): Promise<boolean>;
      setValue(value: boolean): void;
      get type(): string;
      get device(): string;
      get map(): string;
      get active(): boolean;

      updateSignalAttributes(a: any): void; // ToDo: check

      subscribe(raiseInitial?: boolean): Promise<any>;
      unsubscribe(): void;

      onChanged(callback: Function): void; // ToDo: check return
    }

    function getSignal(name: string): Promise<SIGNAL.Signal>;
    function createSignal(name: string, attr?: object): Promise<SIGNAL.Signal>;

    interface filterSignalSearch {
      name?: string;
      device?: string;
      network?: string;
      category?: string;
      type?: 'DI' | 'DO' | 'AI' | 'AO' | 'GI' | 'GO';
      invert?: boolean;
      blocked?: boolean;
    }

    function search(filter: filterSignalSearch, onlyName: boolean): Promise<string[] | SIGNAL.Signal[]>;

    function searchByName(name: string): Promise<string | string[]>;
    function searchByCategory(category: string): Promise<string | string[]>;
    function searchByType(type: string, device?: string): Promise<string | string[]>;

    function isAnySignalModified(): boolean;
  }

  namespace FILESYSTEM {
    interface directoryContent {
      directories: string[];
      files: string[];
    }

    interface FileContent {
      name: string;
      content: string;
    }

    function getDirectoryContents(path: string): directoryContent;

    function getFile(path: string, file: string): string;
    function getFiles(path: string): Promise<FileContent[]>;

    function updateFile(directoryPath: string, fileName: string, data: string): Promise<any>;

    function createDirectory(directoryPath: string): Promise<any>;

    function createNewFile(directoryPath: string, fileName: string, data: string, overwrite?: boolean): Promise<any>;

    function fileExists(directoryPath: string, fileName: string): Promise<boolean>;

    function deleteFile(directoryPath: string, fileName: string): Promise<any>;

    function copy(source: string, destination: string, overwrite?: boolean): Promise<any>;
  }

  namespace MOTION {
    type JogData = [number, number, number, number, number, number];

    type Pos = {
      x: number;
      y: number;
      z: number;
    };

    type Orient = {
      q1: number;
      q2: number;
      q3: number;
      q4: number;
    };

    type Pose = {
      trans: Pos;
      rot: Orient;
    };

    type RobConf = {
      cf1: number;
      cf4: number;
      cf6: number;
      cfx: number;
    };

    type ExtAx = {
      eax_a: number;
      eax_b: number;
      eax_c: number;
      eax_d: number;
      eax_e: number;
      eax_f: number;
    };

    interface RobTarget {
      trans: Pos;
      rot: Orient;
      robconf: RobConf;
      extax: ExtAx;
    }

    interface LoadData {
      mass: number;
      cog: Pos;
      aom: Orient;
      ix: number;
      iy: number;
      iz: number;
    }

    interface ToolData {
      robhold: boolean;
      tframe: Pose;
      tload: LoadData;
    }

    type RobAx = {
      rax_1: number;
      rax_2: number;
      rax_3: number;
      rax_4: number;
      rax_5: number;
      rax_6: number;
    };

    interface JointTarget {
      robax: RobAx;
      extax: ExtAx;
    }

    interface executeJoggingProps {
      tool?: string;
      wobj?: string;
      coords?: COORDS;
      jogMode?: JOGMODE;
      jogData?: number[];
      robTarget?: RobTarget;
      jointTarget?: JointTarget;
      doJoint?: boolean;
    }

    function executeJogging(props: executeJoggingProps): Promise<any>;

    function stopJogging(): Promise<any>;
    function getRobotPosition(): RobTarget;
    function getTool(): Promise<string>;
    function getWobj(): Promise<string>;
    function setTool(value: string): Promise<any>;
    function setWobj(value: string): Promise<any>;
  }

  namespace RAPID {
    function monitorExecutionState(callback: Function): Promise<any>;

    interface startExecutionProps {
      regainMode?: 'continue' | 'regain' | 'clear' | 'enter_consume';
      execMode?: 'continue' | 'step_over' | 'step_out' | 'step_backwards' | 'step_to_last' | 'step_to_motion';
      cycleMode?: 'forever' | 'as_is' | 'once';
      condition?: 'none' | 'call_chain';
      stopAtBreakpoint?: boolean;
      enableByTSP?: boolean;
    }

    interface executeProcedureProps {
      userLevel?: boolean;
      resetPP?: boolean;
      cycleMode?: 'forever' | 'as_is' | 'once';
    }

    interface stopExecutionProps {
      stopMode: 'cycle' | 'instruction' | 'stop' | 'quick_stop';
      useTSP: 'normal' | 'all_tasks';
    }

    interface searchSymbolProps {
      task?: string;
      module?: string;
      isInUse?: boolean;
      dataType?: RapidDataType;
      symbolType?: symbolTypes;
      filter?: string;
    }

    type RapidDataType = 'num' | 'dnum' | 'string' | 'bool' | 'robtarget' | 'tooldata' | 'wobjdata';

    type VariableSymbolType = 'constant' | 'variable' | 'persistent';
    type RoutineSymbolType = 'procedure' | 'function' | 'trap';

    interface filterVariables {
      name?: string;
      symbolType?: VariableSymbolType;
      dataType?: RapidDataType;
    }
    interface filterRoutines {
      name?: string;
      symbolType: RoutineSymbolType;
    }

    function searchTasks(filter: string, caseSensitive?: boolean): string[];
    class Task {
      public name: string;

      loadModule(path: string, replace?: boolean);
      unloadModule(path: string);
      executeProcedure(procedure: string, props: executeProcedureProps);
      stopExecution(props: stopExecutionProps);
      searchVariables(module: string, isInUse?: boolean, filter?: filterVariables): string[];
      searchModules(isInUse?: boolean, filter?: string): string[];
      searchProcedures(module: string, isInUse?: boolean, filter?: string): string[];
      searchRoutines(module: string, isInUse?: boolean, filter?: filterRoutines): string[];
      getValue(module: string, variable: string);
      setValue(module: string, variable: string, value: any);
      getVariable(module: string, variable: string);
    }

    interface VariableProps {
      taskName?: string;
      moduleName?: string;
      symbolName?: string;
      dataType?: string;
      symbolType?: VariableSymbolType;
      dimensions?: number[];
      scope?: 'local' | 'task' | 'global';
      dataTypeURL?: string;
    }

    class Variable {
      protected var: object;
      constructor(variable: RWS.Rapid.Data, props: VariableProps);
      getValue(): Promise<string | number | boolean>;
      setValue(v: any): Promise<any>;

      get type(): string;
      get declaration(): VariableSymbolType;

      subscribe(raiseInitial?: boolean);
      unsubscribe(): void;

      onChanged(callback: Function);
    }

    class VariableString {
      getValue(): Promise<string>;
      setValue(value: string);
    }

    class VariableBool {
      getValue(): Promise<string>;
      setValue(value: string);
    }

    class VariableNum {
      getValue(): Promise<string>;
      setValue(value: string);
    }

    function getVariable(task: string, module: string, name: string): RAPID.Variable;
    function getTask(task?: string): RAPID.Task;

    function loadModule(path: string, replace?: boolean, taskName?: string);
    function unloadModule(path: string, taskName?: string);
  }

  namespace RWS {
    type MastershipType = 'edit' | 'motion';

    function requestMastership(type: MastershipType): Promise<any>;
    function releaseMastership(type: MastershipType): Promise<any>;
    function getMastershipState(type: MastershipType): Promise<any>;

    namespace MOTIONSYSTEM {
      interface Mechunits {
        activationAllowed: string;
        driveModule: string;
        mode: string; // 'Activated', ...
        name: string;
      }

      interface Mechunit {
        axes: string;
        axesTotal: string;
        coords: string;
        hasIntegratedUnit: string;
        isIntegratedUnit: string;
        jogMode: string;
        mode: string;
        payload: string;
        status: string;
        task: string;
        tool: string;
        totalPayload: string;
        type: string;
        wobj: string;
        name: string;
      }
      function getMechunits(): Promise<Mechunits[]>;
      function getMechunit(name?: string): Promise<Mechunit>;

      interface SetMechunitProps {
        name?: string;
        tool?: string;
        wobj?: string;
        coords?: string;
        jogMode?: string;
        mode?: string;
        payload?: string;
        totalPayload?: string;
      }
      function setMechunit(props: SetMechunitProps): Promise<any>;
      function setRobotPositionTarget(r: MOTION.RobTarget);
      function setRobotPositionJoint(j: MOTION.JointTarget);
      function jog(jogdata: MOTION.JogData, ccount: number): Promise<any>;
      function getChangeCount(): number;
      function getRobTarget(tool?: string, wobj?: string, coords?: MOTION.COORDS, mechunit?: string): Promise<MOTION.RobTarget>;
      function getJointTarget(mechunit?: string): Promise<MOTION.JointTarget>;

      interface JointsSolutionProps {
        mechUnit?: string;
        robTarget: API.MOTION.RobTarget;
        toolData?: API.MOTION.ToolData;
      }

      interface JointsFromCartesianProps extends JointsSolutionProps {
        jointTarget: API.MOTION.JointTarget;
      }

      function getAllJointsSolution(props: JointsSolutionProps): Promise<any>;
      function getJointsFromCartesian(props: JointsFromCartesianProps): Promise<any>;
    }

    namespace RAPID {
      function loadModule(path: string, replace: boolean, taskName: string);
      function unloadModule(path: string, replace: boolean, taskName: string);
      function movePPToCursor(moduleName: string, taskName: string, line: string, column: string);
    }

    namespace CFG {
      function deleteConfigInstance(name: string, type: string, domain: string);
    }
  }
}
