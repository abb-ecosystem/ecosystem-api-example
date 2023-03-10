
namespace AppMaker.Rapid {

    export enum MonitorResources {
        EXECUTION = 'execution',
        PROGRAM_POINTER = 'program-pointer',
        MOTION_POINTER = 'motion-pointer',
        UIINSTR = 'uiinstr'
    }

    export enum ExecutionStates {
        RUNNING = 'running',
        STOPPED = 'stopped'
    }

    export enum UiinstrEvent {
        SEND = 'send',
        POST = 'post',
        ABORT = 'abort'
    }

    export enum UiinstrExecLvl {
        USER = 'user',
        NORMAL = 'normal'
    }

    export enum RegainMode {
        CONTINUE = 'continue',
        REGAIN = 'regain',
        CLEAR = 'clear',
        ENTER_CONSUME = 'enter_consume'
    }

    export enum ExecutionMode {
        CONTINUE = 'continue',
        STEP_IN = 'step_in',
        STEP_OVER = 'step_over',
        STEP_OUT = 'step_out',
        STEP_BACKWARDS = 'step_backwards',
        STEP_TO_LAST = 'step_to_last',
        STEP_TO_MOTION = 'step_to_motion'
    }

    export enum CycleMode {
        FOREVER = 'forever',
        AS_IS = 'as_is',
        ONCE = 'once'
    }

    export enum StartCondition {
        NONE = 'none',
        CALL_CHAIN = 'call_chain'
    }

    export enum StopMode {
        CYCLE = 'cycle',
        INSTRUCTION = 'instruction',
        STOP = 'stop',
        QUICK_STOP = 'quick_stop'
    }

    export enum StopTSP {
        NORMAL = 'normal',
        ALL_TASKS = 'all_tasks'
    }

}

namespace AppMaker.Rapid.Task {

    export enum Type {
        NORMAL = 'normal',
        STATIC = 'static',
        SEMISTATIC = 'semistatic',
        UNKNOWN = 'unknown'
    }

    export enum State {
        EMPTY = 'empty',
        INITIATED = 'initiated',
        LINKED = 'linked',
        LOADED = 'loaded',
        UNINITIALIZED = 'uninitialized'
    }

    export enum ExecutionState {
        READY = 'ready',
        STOPPED = 'stopped',
        STARTED = 'started',
        UNINITIALIZED = 'uninitialized'
    }

    export enum ActiveState {
        ON = 'on',
        OFF = 'off'
    }

    export enum TrustLevel {
        SYS_FAIL = 'sys_fail',
        SYS_HALT = 'sys_halt',
        SYS_STOP = 'sys_stop',
        NONE = 'none'
    }

    export enum ExecutionLevel {
        NONE = 'none',
        NORMAL = 'normal',
        TRAP = 'trap',
        USER = 'user',
        UNKNOWN = 'unknown'
    }

    export enum ExecutionMode {
        CONTINOUS = 'continous',
        STEP_OVER = 'step_over',
        STEP_IN = 'step_in',
        STEP_OUT_OF = 'step_out_of',
        STEP_BACK = 'step_back',
        STEP_LAST = 'step_last',
        STEPWISE = 'stepwise',
        UNKNOWN = 'unknown'
    }

    export enum ExecutionType {
        NONE = 'none',
        NORMAL = 'normal',
        INTERRUPT = 'interrupt',
        EXTERNAL_INTERRUPT = 'external_interrupt',
        USER_ROUTINE = 'user_routine',
        EVENT_ROUTINE = 'event_routine',
        UNKNOWN = 'unknown'
    }
}


namespace AppMaker.Rapid.Data {

    export enum SymbolType {
        CONSTANT = 'constant',
        VARIABLE = 'variable',
        PERSISTENT = 'persistent'
    }

    export enum Scope {
        LOCAL = 'local',
        TASK = 'task',
        GLOBAL = 'global'
    }

}


namespace AppMaker.Controller {

    export enum MonitorResources {
        CONTROLLER_STATE = 'controller-state',
        OPERATION_MODE = 'operation-mode'
    }

    export enum ControllerStates {
        INITIALIZING = 'initializing',
        MOTORS_ON = 'motors_on',
        MOTORS_OFF = 'motors_off',
        GUARD_STOP = 'guard_stop',
        EMERGENCY_STOP = 'emergency_stop',
        EMERGENCY_STOP_RESETTING = 'emergency_stop_resetting',
        SYSTEM_FAILURE = 'system_failure'
    }
    
    export enum MotorsState {
        MOTORS_ON = 'motors_on',
        MOTORS_OFF = 'motors_off'
    }

    export enum OperationModes {
        INITIALIZING = 'initializing',
        AUTOMATIC_CHANGING = 'automatic_changing',
        MANUAL_FULL_CHANGING = 'manual_full_changing',
        MANUAL_REDUCED = 'manual_reduced',
        MANUAL_FULL = 'manual_full',
        AUTOMATIC = 'automatic',
        UNDEFINED = 'undefined'
    }

    export enum SettableOperationModes {
        MANUAL = 'manual',
        MANUAL_FULL = 'manual_full',
        AUTOMATIC = 'automatic'
    }

    export enum RestartModes {
        RESTART = 'restart',
        SHUTDOWN = 'shutdown',
        BOOT_APPLICATION = 'boot_application',
        RESET_SYSTEM = 'reset_system',
        RESET_RAPID = 'reset_rapid',
        REVERT_TO_AUTO_SAVE = 'revert_to_auto'
    }

    export enum BackupMismatches {
        ALL = 'all',
        SYSTEM_ID = 'system-id',
        TEMPLATE_ID = 'template-id',
        NONE = 'none'
    }

    export enum BackupComponents {
        CFG = 'cfg',
        MODULES = 'modules',
        ALL = 'all'
    }

    export enum BackupStatus {
        OK = 'ok',
        SYSTEM_ID_MISMATCH = 'system_id_mismatch',
        TEMPLATE_ID_MISMATCH = 'template_id_mismatch',
        FILE_OR_DIRECTORY_MISSING = 'file_or_directory_missing',
        CFG_FILE_CORRUPT = 'cfg_file_corrupt'
    }
    

}

namespace AppMaker.IO.Network {

    export enum PhysicalState {
        HALTED = 'halted',
        RUNNING = 'running',
        ERROR = 'error',
        STARTUP = 'startup',
        INIT = 'init',
        UNKNOWN = 'unknown'
    };

    export enum LogicalState {
        STOPPED = 'stopped',
        STARTED = 'started',
        UNKNOWN = 'unknown'
    }
}

namespace AppMaker.IO.Device {

    export enum PhysicalState {
        DEACT = 'deact',
        RUNNING = 'running',
        ERROR = 'error',
        UNCONNECT = 'unconnect',
        UNCONFG = 'unconfg',
        STARTUP = 'startup',
        INIT = 'init',
        UNKNOWN = 'unknown',
    }

    export enum LogicalState {
        DISABLED = 'disabled',
        ENABLED = 'enabled',
        UNKNOWN = 'unknown'
    }
}

namespace AppMaker.IO.Signal {

    export enum Quality {
        BAD = 'bad',
        GOOD = 'good',
        UNKNOWN = 'unknown'
    }

    export enum Type {
        DIGITAL_IN = "DI",
        DIGITAL_OUT = "DO",
        ANALOG_IN = "AI",
        ANALOG_OUT = "AO",
        GROUP_IN = "GI",
        GROUP_OUT = "GO"
    }
}