
/// <reference path="RWS-enums.ts" />

declare namespace RWS.Rapid {

    enum SearchMethods {
        block,
        scope
    }

    enum SymbolTypes {
        undefined,
        constant,
        variable,
        persistent,
        function,
        procedure,
        trap,
        module,
        task,
        routine,
        rapidData,
        any
    }

    interface Monitor {
        getTitle(): string;
        getResourceString(): string;
        addCallbackOnChanged(callback: (value: string|PointerState|UiInstrState)=>void): void;
        subscribe(raiseInitial?: boolean): Promise<void>;
        unsubscribe(): Promise<void>;
    }

    interface PointerState {
        moduleName: string;
        routineName: string;
        beginPosition: string;
        endPosition: string;
        hasValue: boolean;
    }

    interface UiInstrState {
        instruction: string;
        event: AppMaker.Rapid.UiinstrEvent;
        task: string;
        message: string;
        executionLevel: AppMaker.Rapid.UiinstrExecLvl;
        id: string;
        parameters: any;
    }

    interface Task {
        getName(): string;
        getProperties(): Promise<TaskProperties>;
        getServiceRoutines(): Promise<ServiceRoutine[]>;
        getData(moduleName: string, symbol: string): Promise<Data>;
        getProgramInfo(): Promise<TaskProgramInfo>;
        getModuleNames(): Promise<TaskModuleNames>;
        getModule(moduleName: string): Promise<Module>;
        getPointers(): Promise<TaskPointers>;
        movePPToRoutine(routineName: string, userLevel?: boolean, moduleName?: string): Promise<void>;

    }

    interface TaskProperties {
        name?: string;
        taskType?: AppMaker.Rapid.Task.Type;
        taskState?: AppMaker.Rapid.Task.State;
        executionState?: AppMaker.Rapid.Task.ExecutionState;
        activeState?: AppMaker.Rapid.Task.ActiveState;
        isMotionTask?: boolean;
        trustLevel?: AppMaker.Rapid.Task.TrustLevel;
        id?: number;
        executionLevel?: AppMaker.Rapid.Task.ExecutionLevel;
        executionMode?: AppMaker.Rapid.Task.ExecutionMode;
        executionType?: AppMaker.Rapid.Task.ExecutionType;
        progEntryPoint?: string;
        bindRef?: boolean;
        taskInForeground?: string;
    }

    interface TaskProgramInfo {
        name: string,
        entrypoint: string;
    }

    interface TaskModuleNames {
        programModules: string[];
        systemModules: string[];
    }

    interface TaskPointers {
        programPointer: PointerState;
        motionPointer: PointerState;
    }

    interface ServiceRoutine {
        getName(): string;
        getUrl(): string;
        setPP(): Promise<void>;

    }

    interface Module {
        getName(): string;
        getTaskName(): string;
        getProperties(): Promise<ModuleProperties>;
        getData(symbolName: string): Promise<Data>; 
    }

    interface ModuleProperties {
        taskName: string;
        moduleName: string;
        fileName: string;
        attributes: string;
    }

    interface Data {
        getTitle(): string;
        getProperties(): Promise<DataProperties>;
        getName(): string;
        getModuleName(): string;
        getTaskName(): string;
        getDataType(): Promise<string>;
        getSymbolType(): Promise<AppMaker.Rapid.Data.SymbolType>;
        getDimensions(): Promise<number[]>;
        getScope(): Promise<AppMaker.Rapid.Data.Scope>;
        getTypeURL(): Promise<string>;
        getValue(): Promise<any>;
        getArrayItem(...indexes: number[]): Promise<any>;
        getRecordItem(...components: string[]): Promise<any>;
        getRawValue(): Promise<string>;
        fetch(): Promise<void>;
        setValue(value: any): Promise<void>;
        setArrayItem(value: any, ...indexes: number[]): Promise<void>;
        setRecordItem(value: any, ...components: string[]): Promise<void>;
        setRawValue(rawValue: string, ...indexes: number[]): Promise<void>;
        getResourceString(): Promise<string>;
        addCallbackOnChanged(callback: (rawValue: string)=>void): void;
        subscribe(raiseInitial?: boolean): Promise<void>;
        unsubscribe(): Promise<void>;

    }

    interface DataProperties {
        taskName: string;
        moduleName: string;
        symbolName: string;
        dataType: string;
        symbolType: AppMaker.Rapid.Data.SymbolType;
        dimensions: number[];
        scope: AppMaker.Rapid.Data.Scope;
        dataTypeURL: string;
    }

    interface StartExecutionParameters {
        regainMode?: AppMaker.Rapid.RegainMode;
        executionMode?: AppMaker.Rapid.ExecutionMode;
        cycleMode?: AppMaker.Rapid.CycleMode;
        condition?:  AppMaker.Rapid.StartCondition;
        stopAtBreakpoint?: boolean;
        enableByTSP?: boolean;
    }

    interface StopExecutionParameters {
        stopMode?: AppMaker.Rapid.StopMode;
        useTSP?: AppMaker.Rapid.StopTSP;
    }

    interface SymbolSearchParameters {
        method: SearchMethods;
        searchURL: string;
        types: SymbolTypes;
        isInstalled: boolean;
        isShared: boolean;
        recursive: boolean;
        skipShared: boolean;
        isInUse: boolean;
    }

    interface SymbolSearchResult {
        name: string;
        scope: string[];
        symbolType: string;
        dataType: string;
    }

    function getMonitor(resource: AppMaker.Rapid.MonitorResources): Monitor;
    function getTasks(): Promise<Task[]>;
    function getTask(taskName: string): Promise<Task>;
    function getProgramInfo(taskName: string): Promise<TaskProgramInfo>;
    function getModuleNames(taskName: string): Promise<TaskModuleNames>;
    function getModule(taskName: string, moduleName: string): Promise<Module>;
    function getData(taskName: string, moduleName: string, symbolName: string): Promise<Data>;
    function setDataValue(taskName: string, moduleName: string, symbolName: string, rawValue: string, ...indexes: number[]): Promise<void>;
    function getSharedData(symbolName: string): Promise<Data>;
    function setSharedDataValue(symbolName: string, rawValue: string): Promise<void>;
    function getExecutionState(): Promise<AppMaker.Rapid.ExecutionStates>;
    function resetPP(): Promise<void>;
    function startExecution(parameters: StartExecutionParameters): Promise<void>;
    function stopExecution(parameters: StopExecutionParameters): Promise<void>;
    function searchSymbols(parameters?: SymbolSearchParameters, dataType?: string, regexp?: string): Promise<SymbolSearchResult[]>;
    function getDefaultSearchProperties(): SymbolSearchParameters;

}

declare namespace RWS.Controller {

    interface Monitor {
        getTitle(): string;
        getResourceString(): string;
        addCallbackOnChanged(callback: (value: AppMaker.Controller.ControllerStates|AppMaker.Controller.OperationModes)=>void) : void;
        subscribe(raiseInitial?: boolean): Promise<void>;
        unsubscribe(): Promise<void>;
    }

    interface NetworkSettings {
        id: string;
        logicalName: string;
        network: string;
        address: string;
        mask: string;
        primaryDNS: string;
        secondaryDNS: string;
        DHCP: string;
        gateway: string;
    }

    interface NetworkConnection {
        id: string;
        MACAddress: string;
        connected: boolean;
        enabled: boolean;
        speed: string;
    }

    interface BackupError {
        status: string;
        path?: string;
    }

    function getMonitor(resource: AppMaker.Controller.MonitorResources): Monitor;
    function getControllerState(): Promise<AppMaker.Controller.ControllerStates>;
    function setMotorsState(state: AppMaker.Controller.MotorsState): Promise<void>;
    function getOperationMode(): Promise<AppMaker.Controller.OperationModes>;
    function setOperationMode(mode: AppMaker.Controller.SettableOperationModes): Promise<void>;
    function restartController(mode?: AppMaker.Controller.RestartModes): Promise<void>;
    function getEnvironmentVariable(variable: string): Promise<string>;
    function getTime(): Promise<string>;
    function getTimezone(): Promise<string>;
    function getIdentity(): Promise<string>;
    function getNetworkSettings(): Promise<NetworkSettings[]>; 
    function getNetworkConnections(): Promise<NetworkConnection[]>;
    function verifyOption(option: string): Promise<boolean>;
    function createBackup(path: string, timeout: number): Promise<void>;
    function verifyBackup(path: string, options: {
        ignoreMismatches?: AppMaker.Controller.BackupMismatches,
        includeControllerSettings?: boolean,
        includeSafetySettings?: boolean,
        include?: AppMaker.Controller.BackupComponents
    }): Promise<AppMaker.Controller.BackupStatus[]>;
    function restoreBackup(path: string, options: {
        ignoreMismatches?: AppMaker.Controller.BackupMismatches,
        deleteDir?: boolean,
        includeSafetySettings?: boolean,
        include?: AppMaker.Controller.BackupComponents
    }): Promise<void>;
    function saveDiagnostics(path: string, timeout: number): Promise<void>;
}

declare namespace RWS.FileSystem {

    interface Directory {
        getPath() : string;
        getProperties() : Promise<any>;
        getContents() : Promise<any>;
        delete() : Promise<any>;
        create(newDirectory: string) : Promise<Directory>;
        createFileObject(fileName: string) : File;
        rename(newName: string) : Promise<any>;
        copy(copyPath: string, overWrite: boolean, isRelativePath?: boolean) : Promise<any>;
        fetch() : Promise<any>;
    }

    interface File {
        getContentType() : string;
        getProperties() : Promise<{
            created: Date,
            isReadOnly: boolean,
            modified: Date,
            name: string,
            size: number
        }>;
        getContents() : Promise<string>;
        setContents(newContents?: string) : boolean;
        fileExists(): Promise<boolean>;
        save(overwrite: boolean, isBinary?: boolean): Promise<any>;
        delete(): Promise<any>;
        rename(newName: string): Promise<any>;
        copy(copyName: string, overwrite: boolean, relativePath?: boolean) : Promise<any>;
        fetch() : Promise<any>;
    }

    function getDirectory(directoryPath: string) : Promise<Directory>;
    function createDirectory(directoryPath: string) : Promise<Directory>;
    function getFile(filePath: string) : Promise<File>;
    function createFileObject(filePath: string): File;

}


declare namespace RWS.IO {

    interface Network {
        getName(): string;
        getPhysicalState(): Promise<AppMaker.IO.Network.PhysicalState>;
        getLogicalState(): Promise<AppMaker.IO.Network.LogicalState>;
        fetch(): Promise<void>;
    }
    
    interface Device {

        getName(): string;
        getNetworkName(): string;
        getPhysicalState(): Promise<AppMaker.IO.Device.PhysicalState>;
        getLogicalState(): Promise<AppMaker.IO.Device.LogicalState>;
        getNetwork(): Network;
        getSignal(signalName: string): Promise<Signal>;
    }

    interface Signal {

        addCallbackOnChanged(callback: (value: number)=>void ): void;
        fetch(): Promise<void>;
        getCategory(): Promise<string>;
        getDevice(): Promise<Device>;
        getDeviceName(): string;
        getIsSimulated(): Promise<boolean>;
        getName(): string;
        getNetworkName(): string;
        getPath(): string;
        getQuality(): Promise<AppMaker.IO.Signal.Quality>;
        getResourceString(): string;
        getTitle(): string;
        getType(): Promise<AppMaker.IO.Signal.Type>;
        getValue(): Promise<number>;
        setValue(value: number): Promise<void>;
        subscribe(raiseInitial?: boolean): Promise<void>;
        unsubscribe(): Promise<void>;
    }

    function getNetwork(networkName: string): Promise<Network>;
    function getDevice(networkName: string, deviceName: string): Promise<Device>;
    function getSignal(signalName: string): Promise<Signal>;
    function setSignalValue(signalName: string, value: number): Promise<void>;
    function searchSignals(filter?: {
        name?: string,
        device?: string,
        network?: string,
        category?: string,
        "category-pon"?: string,
        type: string,
        invert: boolean,
        blocked: boolean
    }): Promise<Signal[]>;
}