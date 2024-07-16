
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.4.1

declare namespace RWS {

    const RWS_LIB_VERSION: string;
    const RAPIDDATA_LIB_VERSION: string;

    function isVirtualController(): Promise<boolean>;

}

declare namespace RWS.Rapid {


    enum MonitorResources {
        execution,
        programPointer,
        motionPointer,
        uiInstruction
    }

    enum RegainModes {
        continue,
        regain,
        clear,
        enterConsume
    }

    enum ExecutionModes {
        continue,
        stepIn,
        stepOver,
        stepOut,
        stepBackwards,
        stepToLast,
        stepToMotion
    }

    enum CycleModes {
        forever,
        asIs,
        once
    }

    enum Conditions {
        none,
        callChain
    }

    enum StopModes {
        cycle,
        instruction,
        stop,
        quickStop
    }

    enum UseTSPOptions {
        normal,
        allTasks
    }

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

    enum ExecutionStates {
        running,
        stopped
    }

    enum UiinstrEvents {
        send,
        post,
        abort
    }

    enum UiinstrExecLevels {
        user,
        normal
    }

    enum TaskTypes {
        normal,
        static,
        semistatic,
        unknown
    }

    enum TaskStates {
        empty,
        initiated,
        linked,
        loaded,
        uninitialized
    }

    enum TaskExecutionStates {
        ready,
        stopped,
        started,
        uninitialized
    }

    enum TaskActiveStates {
        on,
        off
    }

    enum TaskTrustLevels {
        sys_fail,
        sys_halt,
        sys_stop,
        none
    }

    enum TaskExecutionLevels {
        none,
        normal,
        trap,
        user,
        unknown
    }

    enum TaskExecutionModes {
        continous,
        step_over,
        step_in,
        step_out_of,
        step_back,
        step_last,
        stepwise,
        unknown
    }

    enum TaskExecutionTypes {
        none,
        normal,
        interrupt,
        external_interrupt,
        user_routine,
        event_routine,
        unknown
    }

    enum DataSymbolTypes {
        constant,
        variable,
        persistent
    }

    enum DataScopes {
        local,
        task,
        global
    }



    interface Monitor {
        getTitle(): string;
        getResourceString(): string;
        addCallbackOnChanged(callback: (value: ExecutionStates|PointerState|UiInstrState)=>void): void;
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
        event: UiinstrEvents;
        task: string;
        message: string;
        executionLevel: UiinstrExecLevels;
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
        abortServiceRoutine() : Promise<void>;

    }

    interface TaskProperties {
        name?: string;
        taskType?: TaskTypes;
        taskState?: TaskStates;
        executionState?: TaskExecutionStates;
        activeState?: TaskActiveStates;
        isMotionTask?: boolean;
        trustLevel?: TaskTrustLevels;
        id?: number;
        executionLevel?: TaskExecutionLevels;
        executionMode?: TaskExecutionModes;
        executionType?: TaskExecutionTypes;
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
        getSymbolType(): Promise<DataSymbolTypes>;
        getDimensions(): Promise<number[]>;
        getScope(): Promise<DataScopes>;
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
        symbolType: DataSymbolTypes;
        dimensions: number[];
        scope: DataScopes;
        dataTypeURL: string;
    }

    interface StartExecutionParameters {
        regainMode?: RegainModes;
        executionMode?: ExecutionModes;
        cycleMode?: CycleModes;
        condition?:  Conditions;
        stopAtBreakpoint?: boolean;
        enableByTSP?: boolean;
    }

    interface StopExecutionParameters {
        stopMode?: StopModes;
        useTSP?: UseTSPOptions;
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

    function getMonitor(resource: MonitorResources, taskName?: string): Monitor;
    function getTasks(): Promise<Task[]>;
    function getTask(taskName: string): Promise<Task>;
    function getProgramInfo(taskName: string): Promise<TaskProgramInfo>;
    function getModuleNames(taskName: string): Promise<TaskModuleNames>;
    function getModule(taskName: string, moduleName: string): Promise<Module>;
    function getData(taskName: string, moduleName: string, symbolName: string): Promise<Data>;
    function setDataValue(taskName: string, moduleName: string, symbolName: string, rawValue: string, ...indexes: number[]): Promise<void>;
    function getSharedData(symbolName: string): Promise<Data>;
    function setSharedDataValue(symbolName: string, rawValue: string): Promise<void>;
    function getExecutionState(): Promise<ExecutionStates>;
    function resetPP(): Promise<void>;
    function startExecution(parameters: StartExecutionParameters): Promise<void>;
    function stopExecution(parameters: StopExecutionParameters): Promise<void>;
    function searchSymbols(parameters?: SymbolSearchParameters, dataType?: string, regexp?: string): Promise<SymbolSearchResult[]>;
    function getDefaultSearchProperties(): SymbolSearchParameters;

}

declare namespace RWS.Controller {


    enum MonitorResources {
        controllerState,
        operationMode
    }


    enum RestartModes {
        restart,
        shutdown,
        bootApplication,
        resetSystem,
        resetRapid,
        revertToAutoSave
    }


    enum BackupIgnoreMismatches {
        all,
        systemId,
        templateId,
        none
    }


    enum BackupInclude {
        all,
        cfg,
        modules
    }


    enum ControllerStates {
        initializing,
        motors_on,
        motors_off,
        guard_stop,
        emergency_stop,
        emergency_stop_resetting,
        system_failure
    }
    
    enum MotorsState {
        motors_on,
        motors_off
    }

    enum OperationModes {
        initializing,
        automatic_changing,
        manual_full_changing,
        manual_reduced,
        manual_full,
        automatic,
        undefined
    }

    enum SettableOperationModes {
        manual,
        manual_full,
        automatic
    }

    enum BackupStatus {
        ok,
        system_id_mismatch,
        template_id_mismatch,
        file_or_directory_missing,
        cfg_file_corrupt
    }

    interface Monitor {
        getTitle(): string;
        getResourceString(): string;
        addCallbackOnChanged(callback: (value: ControllerStates|OperationModes)=>void) : void;
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

    function getMonitor(resource: MonitorResources): Monitor;
    function getControllerState(): Promise<ControllerStates>;
    function setMotorsState(state: MotorsState): Promise<void>;
    function getOperationMode(): Promise<OperationModes>;
    function setOperationMode(mode: SettableOperationModes): Promise<void>;
    function restartController(mode?: RestartModes): Promise<void>;
    function getEnvironmentVariable(variable: string): Promise<string>;
    function getTime(): Promise<string>;
    function getTimezone(): Promise<string>;
    function getIdentity(): Promise<string>;
    function getNetworkSettings(): Promise<NetworkSettings[]>; 
    function getNetworkConnections(): Promise<NetworkConnection[]>;
    function verifyOption(option: string): Promise<boolean>;
    function createBackup(path: string, timeout: number): Promise<void>;
    function verifyBackup(path: string, options: {
        ignoreMismatches?: BackupIgnoreMismatches,
        includeControllerSettings?: boolean,
        includeSafetySettings?: boolean,
        include?: BackupInclude
    }): Promise<BackupStatus[]>;
    function restoreBackup(path: string, options: {
        ignoreMismatches?: BackupIgnoreMismatches,
        deleteDir?: boolean,
        includeSafetySettings?: boolean,
        include?: BackupInclude
    }): Promise<void>;
    function saveDiagnostics(path: string, timeout: number): Promise<void>;
    function isVirtualController(): Promise<boolean>;
}

declare namespace RWS.FileSystem {

    interface DirectoryProperties {
        name: string,
        created: Date,
        modified: Date
    }

    interface FileProperties {
        name: string,
        created: Date,
        modified: Date,
        size: number,
        isReadOnly: boolean

    }

    interface DirectoryContents {
        directories: DirectoryProperties[],
        files: FileProperties[]
    }

    interface Directory {
        getPath() : string;
        getProperties() : Promise<DirectoryProperties>;
        getContents() : Promise<DirectoryContents>;
        delete() : Promise<void>;
        create(newDirectory: string) : Promise<Directory>;
        createFileObject(fileName: string) : File;
        rename(newName: string) : Promise<void>;
        copy(copyPath: string, overwrite: boolean, isRelativePath?: boolean) : Promise<void>;
        fetch() : Promise<void>;
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
        setContents(newContents?: string|Document|Blob|ArrayBuffer|XMLHttpRequestBodyInit|DataView|FormData|URLSearchParams) : boolean;
        fileExists(): Promise<boolean>;
        save(overwrite: boolean, isBinary?: boolean): Promise<void>;
        delete(): Promise<void>;
        rename(newName: string): Promise<void>;
        copy(copyName: string, overwrite: boolean, relativePath?: boolean) : Promise<void>;
        fetch() : Promise<void>;
    }

    function getDirectory(directoryPath: string) : Promise<Directory>;
    function createDirectory(directoryPath: string) : Promise<Directory>;
    function getFile(filePath: string) : Promise<File>;
    function createFileObject(filePath: string): File;

}


declare namespace RWS.IO {

    enum NetworkPhysicalState {
        halted,
        running,
        error,
        startup,
        init,
        unknown
    }

    enum NetworkLogicalState {
        stopped,
        started,
        unknown
    }

    enum DevicePhysicalState {
        deact,
        running,
        error,
        unconnect,
        unconfg,
        startup,
        init,
        unknown
    }

    enum DeviceLogicalState {
        disabled,
        enabled,
        unknown
    }

    enum SignalQuality {
        bad,
        good,
        unknown
    }

    enum SignalType {
        DI,
        DO,
        AI,
        AO,
        GI,
        GO
    }

    interface Network {
        getName(): string;
        getPhysicalState(): Promise<NetworkPhysicalState>;
        getLogicalState(): Promise<NetworkLogicalState>;
        fetch(): Promise<void>;
    }
    
    interface Device {

        getName(): string;
        getNetworkName(): string;
        getPhysicalState(): Promise<DevicePhysicalState>;
        getLogicalState(): Promise<DeviceLogicalState>;
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
        getQuality(): Promise<SignalQuality>;
        getResourceString(): string;
        getTitle(): string;
        getType(): Promise<SignalType>;
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


declare namespace RWS.CFG {

    enum LoadMode {
        add,
        replace,
        'add-with-reset'
    }

    interface Domain {
        getName() : string;
        getTypes() : Promise<Type[]>;
        getInstances(type: string) : Promise<Instance[]>;
        getInstanceByName(type: string, name: string) : Promise<Instance>;
        getInstanceById(type: string, id: string) : Promise<Instance>;
        createInstance(type: string, name?: string) : Promise<void>;
        updateAttributesByName(type: string, name: string, attributes: {[key:string]: string|undefined}) : Promise<void>; 
        updateAttributesById(type: string, id: string, attributes: {[key:string]: string|undefined}) : Promise<void>;
        deleteInstanceByName(type: string, name: string) : Promise<void>; 
        deleteInstanceById(type: string, id: string) : Promise<void>; 
        saveToFile(filePath: string) : Promise<void>;
    }
    
    interface Type {
        getName() : string;
        getDomainName() : string;
        getDomain() : Domain;
        getInstances() : Promise<Instance[]>;
        getInstanceByName(name: string) : Promise<Instance>;
        getInstanceById(id: string) : Promise<Instance>;
        createInstance(name?: string) : Promise<void>;
        updateAttributesByName(name: string, attributes: {[key:string]: string|undefined}) : Promise<void>; 
        updateAttributesById(id: string, attributes: {[key:string]: string|undefined}) : Promise<void>;
        deleteInstanceByName(name: string) : Promise<void>; 
        deleteInstanceById(id: string) : Promise<void>;         
    }

    interface Instance {
        getInstanceId() : string;
        getInstanceName() : string;
        getTypeName() : string;
        getType() : Type;
        getAttributes() : Promise<{[key:string]: string|undefined}>;
        updateAttributes(attributes: {[key:string]: string|undefined}) : Promise<void>;
        delete() : Promise<void>; 
    }

    function getDomains() : Promise<Domain[]>;
    function saveConfiguration(domain: string, filePath: string) : Promise<void>;
    function verifyConfigurationFile(filePath: string, action?: LoadMode) : Promise<void>;
    function loadConfiguration(filePath: string, action?: LoadMode) : Promise<void>;
    function getTypes(domain: string) : Promise<Type[]>;
    function getInstances(domain: string, type: string) : Promise<Instance[]>;
    function getInstanceByName(domain: string, type: string, name: string) : Promise<Instance>;
    function getInstanceById(domain: string, type: string, id: string) : Promise<Instance>;
    function createInstance(domain: string, type: string, name?: string) : Promise<void>;
    function updateAttributesByName(domain: string, type: string, name: string, attributes: {[key:string]: string|undefined}) : Promise<void>; 
    function updateAttributesById(domain: string, type: string, id: string, attributes: {[key:string]: string|undefined}) : Promise<void>;
    function deleteInstanceByName(domain: string, type: string, name: string) : Promise<void>;
    function deleteInstanceById(domain: string, type: string, id: string) : Promise<void>;


}


declare namespace RWS.Elog {

    enum EventType {
        informational,
        warning,
        error
    }

    enum DomainId {
        common,
        operational,
        system,
        hardware,
        program,
        motion,
        io,
        user,
        safety,
        internal,
        process,
        configuration,
        rapid,
        connectedServices
    }

    interface Event {
        getContents(): Promise<EventContents>;
        isValid(): boolean;
    }

    interface Domain {
        getDomainNumber(): DomainId;
        clearElog(): Promise<void>;
        getBufferSize(): Promise<number>;
        getNumberOfEvents(): Promise<number>;
        getEvents(language?: string): Promise<{ [key: number]: Event | undefined }>;
        getEventsPaged(language?: string, count?: number, page?: number): Promise<{ [key: number]: Event | undefined }>;
        addCallbackOnChanged(callback: (sequenceNumber: number)=>void): void;
        subscribe(): Promise<void>;
        unsubscribe(): Promise<void>;
    }

    interface EventContents {
        sequenceNumber: number,
        eventType: EventType,
        timeStamp: Date,
        code: number,
        title: string,
        description: string,
        consequences: string,
        causes: string,
        actions: string,
        arguments: EventArgument[];
    }

    interface EventArgument {
        type: string,
        value: string|number
    }

    function clearElogAll(): Promise<void>;
    function clearElog(domainNumber: DomainId): Promise<void>;
    function getBufferSize(domainNumber: DomainId): Promise<number>;
    function getNumberOfEvents(domainNumber: DomainId): Promise<number>;
    function getEvents(domainNumber: DomainId, language?: string): Promise<{ [key: number]: Event | undefined }>;
    function getEventsPaged(domainNumber: DomainId, language?: string, count?: number, page?: number): Promise<{ [key: number]: Event | undefined }>;
    function getEvent(sequenceNumber: number, language?: string): Event;
    function getDomain(domainNumber: DomainId): Domain;

}


declare namespace RWS.UAS {

    interface User {
        alias: string,
        name: string,
        locale: string,
        application: string,
        location: string
    }

    interface Grant {
        reference: string,
        name: string,
        description: string
    }

    function getUser(): Promise<User>;
    function getGrants(): Promise<{[reference: string]: Grant|undefined}>;
    function hasGrant(grant: string): Promise<boolean>;
    function hasRole(role: string): Promise<boolean>;
}


declare namespace RWS.Mastership {

    function request(): Promise<void>;
    function release(): Promise<void>;

}