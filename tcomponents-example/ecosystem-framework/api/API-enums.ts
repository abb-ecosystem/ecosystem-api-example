namespace API.CONTROLLER {
  export enum STATE {
    Init = 'initializing', // the controller is starting up
    MotorsOn = 'motors_on', //motors on state
    MotorsOff = 'motors_off', // motors off state
    GuardStop = 'guard_stop', // stopped due to safety
    EStop = 'emergency_stop', // emergency stop state
    EStopR = 'emergency_stop_resetting', // emergency stop state resetting
    SysFailure = 'system_failure', // system failure state
  }

  export enum OPMODE {
    Auto = 'automatic',
    Manual = 'manual',
    ManualR = 'manual_reduced',
    ManualFull = 'manual_full',
  }
}

namespace API.CONFIG {
  export enum DOMAIN {
    EIO = 'EIO',
    SYS = 'SYS',
    MOC = 'MOC',
  }

  export enum TYPE {
    SIGNAL = 'EIO_SIGNAL',
    CROSS = 'EIO_CROSS',
    ETHERNETIP = 'ETHERNETIP_DEVICE',
  }
}

namespace API.MOTION {
  export enum JOGMODE {
    Align = 'Align',
    GoToPos = 'GoToPos',
    ConfigurationJog = 'ConfigurationJog',
    Cartesian = 'Cartesian',
    AxisGroup1 = 'AxisGroup1',
    AxisGroup2 = 'AxisGroup2',
    Current = '',
  }

  export enum COORDS {
    Wobj = 'Wobj',
    Base = 'Base',
    Tool = 'Tool',
    World = 'World',
    Current = '',
  }
}

namespace API.RAPID {
  export enum MODULETYPE {
    Program = 'program',
    System = 'system',
  }

  export enum symbolTypes {
    undefined = 0, //value not set
    constant = 1, //Rapid constant
    variable = 2, //Rapid var declared variable
    persistent = 4, //Rapid pers declared variable
    function = 8, //Rapid function
    procedure = 16, //Rapid procedure
    trap = 32, //Rapid trap
    module = 64, //Rapid module
    task = 128, //Rapid task
    routine = 8 + 16 + 32, //function, procedure or trap
    rapidData = 1 + 2 + 4, //constant, variable or persistent
    any = 255, //any of the above
  }
}

namespace API.RWS {
  export enum MASTERSHIP {
    Nomaster = 'nomaster',
    Remote = 'remote',
    Local = 'local',
    Internal = 'internal',
  }
}
