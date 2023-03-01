
// (c) Copyright 2020-2023 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.2

'use strict';

var RWS = RWS || {};
if (typeof RWS.constructedMain === "undefined") {
    (function (o) {

        // VERSION INFO
        o.RWS_LIB_VERSION = "1.2";

        var script = document.createElement('script');
        script.src = "rws-api/rapiddata-rws.js";
        document.head.appendChild(script);

        const HTTP_REQUEST_TIMEOUT = 30000;                                     // timeout for XMLHttpRequest calls, in milliseconds.
        const COMMON_TIMEOUT = 120;                                             // Number of seconds to wait before rejecting an action. 
        const VC_NOT_SUPPORTED = "Not supported on virtual controller.";        // Error text when calling routines that are not available on VC
        const SHARED_TAG = '%%SHARED%%';                                        // Tag used to identify shared modules, etc
        const UNASSIGNED_TAG = '%%UNASSIGNED%%';                                // Tag used to identify unassigned IO signals
        var isVirtual = null;
        let debugType = 1;
        let debugSeverity = 2;

        /**
        * Gets the controller type, i.e. checks if controller is a VC
        * 
        * @returns {boolean}   A boolean indicating if currently connected to a virtual controller.
        */
        o.isVirtualController = () => {
            if (isVirtual === null) throw new Error("RWS has not been initialized properly yet.");
            return isVirtual;
        }

        /**
         * Initializes the RWS object
         */
        o.init = () => {

            o.Network.get("/ctrl")
                .then(res => {
                    let obj = null;
                    try {
                        obj = JSON.parse(res.responseText);
                    } catch (error) {
                        return Promise.reject("Could not parse JSON.");
                    }

                    for (const item of obj._embedded.resources) {
                        if (item._type === "ctrl-identity-info-li") {
                            isVirtual = item['ctrl-type'] === "Virtual Controller";
                            break;
                        }
                    }
                })
                .catch(err => console.warn(`Init failed to read controller. >>> ${err}`));

            o.Network.heartBeat();
            if (typeof (window.external) !== 'undefined' && ('notify' in window.external)) window.external.notify("GetCookies");
        }
        window.addEventListener("load", o.init, false);

        o.__unload = false;

        /**
         * Unsubscribes to all data when the web page is closed
         */
        window.addEventListener("beforeunload", () => {

            o.Mastership.releaseAll();          // Must run before setting __unload = true, as this call needs to be asynchronous

            o.__unload = true;
            o.Subscriptions.unsubscribeToAll();

            return null;
        }, false);


        /**
         * Encodes the path part of an uri.
         * 
         * NOTE! RWS uses some characters that are encoded improperly if uriEncode is used, hence this function.
         * 
         * @param {string}      path    The path to encode
         * @returns {string}            A string with the encoded path
         */
        function encodePath(path) {
            let s = path.split('/');
            let p = '';
            for (let item of s) {
                p += encodeURIComponent(item) + '/';
            }
            return p.slice(0,-1);
        }

        /**
         * Rejects with status object.
         * 
         * @param {string}  message
         * @param {{}}      item
         */
        function rejectWithStatus(message, item = {}) {
            let r = createStatusObject(message, item);
            return Promise.reject(r);
        }

        /**
         * Builds an status object. 
         * 
         * @param {string}  message
         * @param {{}}      item
         */
        function createStatusObject(message, item = {}) {
            let r = {};

            try {
                let msg = '';
                if (typeof message === 'string' && message !== null) msg = message;
                r.message = msg;

                if (typeof item === 'Error') {
                    if (r.message.length <= 0) r.message = `Exception: ${item.message}`;
                    else r.message += ` >>> Exception: ${item.message}`;
                } else if (typeof item === 'string') {
                    if (r.message.length <= 0) r.message = item;
                    else r.message += ` >>> ${item}`;
                } else if (item.hasOwnProperty('message')) {
                    r = JSON.parse(JSON.stringify(item));
                    r.message = msg;
                    if (typeof item.message === 'string' && item.message.length > 0) r.message += ` >>> ${item.message}`;
                }
            }
            catch (error) {
                r = {};
                r.message = `Failed to create status object. >>> Exception: ${error.message}`;
            }

            return r;
        }

        /**
         * Set debug level and type
         * 
         * @param {number} dtype        Type of debug; 0 = off, 1 = console, 2 = console with file reference and 3 = console with stack trace
         * @param {number} severity     Severity to listen to; 0 = log, 1 = info, 2 = warning and 3 = error
         */
        o.setDebug = (dtype = 0, severity = 2) => {
            debugType = dtype;
            debugSeverity = severity;
        }

        o.isDebugActive = (x) => {
            return x >= debugSeverity;
        }

        o.writeDebug = (text, severity = 0) => {
            if (debugSeverity > severity) return;

            const getFileRef = (stack) => {
                let splits = stack.split('\n');
                let s = '';
                for (let iii = 2; iii < splits.length; iii++) {
                    s = splits[iii].trim();
                    if (s !== 'at Promise (native code)') break;
                }

                return s.slice(3);
            }

            let t = '';

            if (debugType === 1) {
                t = text;
            } else if (debugType === 2) {
                let s = getFileRef(new Error().stack);
                t = `${text}   [${s}]`;
            } else if (debugType === 3) {
                if (severity >= 3) {
                    let errStack = new Error().stack;
                    let splits = errStack.split('\n');
                    let s = '';
                    for (let iii = 2; iii < splits.length; iii++) {
                        s += "   " + splits[iii].trim().slice(3) + "\n";
                    }
                    t = `${text}\nCall stack:\n${s.trim()}`;
                } else {
                    let s = getFileRef(new Error().stack);
                    t = `${text}   [${s}]`;
                }
            }

            if (debugType > 0) {
                if (severity === 0) {
                    console.log(t);
                } else if (severity === 1) {
                    console.info(t);
                } else if (severity === 2) {
                    console.warn(t);
                } else if (severity === 3) {
                    console.error(t);
                }
            }
        }

        const isNonEmptyString = (x) => {
            if (x === null) return false;
            if (typeof x !== 'string') return false;
            if (x === '') return false;

            return true;
        }

        function verifyDataType(data, reference) {            

            if (data === Object(data)) {
                if (reference !== Object(reference)) {
                    return 'Unexpected data type.';
                }

                let s = '';

                for (let item of Object.keys(data)) {
                    if (reference.hasOwnProperty(item) === true) {
                        if (typeof data[item] !== typeof reference[item]) {
                            s += `Unexpected data type, property '${item}'\n`;
                        }
                    } else {
                        s += `Unexpected property '${item}'\n`;
                    }
                }
                if (s.length > 0) s = s.slice(0,-1);
                return s;

            } else {
                if (typeof data !== typeof reference) {
                    return 'Unexpected data type.';
                }
            }

            return '';
        }

        var errorCodeCache = {};

        function verifyReturnCode(json) {

            return new Promise((resolve, reject) => {
                try {
                    if (json.hasOwnProperty('state') === false) return resolve(undefined);

                    let errors = [];
                    let returnValues = {};
                    for (let iii = 0; iii < json.state.length; iii++) {
                        let item = json.state[iii];

                        for (let subitem in item) {
                            if (item[subitem].hasOwnProperty('_links')) {
                                let x1 = item[subitem]['_links'];
                                if (x1.hasOwnProperty('error')) {
                                    let x2 = x1['error'];
                                    if (x2.hasOwnProperty('href')) {
                                        let errUrl = x2['href'];

                                        if (errorCodeCache.hasOwnProperty(errUrl)) {
                                            returnValues[subitem] = errorCodeCache[errUrl];
                                            continue;
                                        }

                                        errors.push(o.Network.get(errUrl)
                                            .then(x => {
                                                let obj = getReponseAsJSON(x);

                                                let r = {
                                                    name: obj.state[0].name,
                                                    code: obj.state[0].code,
                                                    severity: obj.state[0].severity,
                                                    description: obj.state[0].description
                                                };

                                                errorCodeCache[errUrl] = r;
                                                returnValues[subitem] = r;
                                                return Promise.resolve();
                                            })
                                            .catch(err => {
                                                let errStr = `Failed to get error code, url '${errUrl}'. >>> ${err}`;
                                                o.writeDebug(errStr, 3);
                                                return Promise.resolve();
                                            }));
                                    }
                                }
                            }
                        }
                    }

                    if (errors.length > 0) {
                        return Promise.all(errors)
                            .then(() => reject(returnValues));
                    }
                    if (Object.keys(returnValues).length > 0) {
                        return reject(returnValues);
                    }

                    return resolve(undefined);
                }
                catch (error) {
                    o.writeDebug(`Failed to get error code. >>> ${error}`, 2);
                    return resolve(undefined);
                }

                return resolve(undefined);
            });
        }

        function verfifyErrorCode(text) {

            let code = '';

            try {
                let obj = parseJSON(text);
                if (typeof obj !== 'undefined') {
                    if (obj.hasOwnProperty('status') === false || obj.status.hasOwnProperty('code') === false) throw new Error('JSON does not include status code.');

                    code = obj.status.code;
                } else {
                    o.writeDebug(`Could not parse JSON error code. >>> ${text}`, 2);

                    if (text.startsWith('<?xml') === true) {
                        let parser = new DOMParser();
                        let data = parser.parseFromString(text, 'text/xml');

                        let items = data.getElementsByTagName('div')[0].getElementsByTagName('span');
                        for (let iii = 0; iii < items.length; iii++) {
                            let className = items[iii].getAttribute('class');
                            if (className === 'code') {
                                code = items[iii].innerHTML;
                                break;
                            }
                        }
                    } else {
                        let idx1 = text.indexOf("\"code\":");
                        let idx2 = text.indexOf(", \"msg\":");
                        if (idx1 >= 0 && idx2 >= 0 && idx2 > idx1) {
                            code = text.substring(idx1 + 7, idx2);
                        }
                    }

                    if (code == '') return Promise.resolve(undefined);
                }
            }
            catch (error) {
                let errStr = `Failed to get error code. >>> ${error}`;
                o.writeDebug(errStr, 0);
                return Promise.reject(errStr);
            }

            return getStatusCode(code);
        }

        function getStatusCode(code) {
            let url = `/rw/retcode?code=${encodeURIComponent(code)}`;
            if (errorCodeCache.hasOwnProperty(url)) {
                return Promise.resolve(errorCodeCache[url]);
            } else {
                return o.Network.get(url)
                    .then(x => {
                        let obj = getReponseAsJSON(x);

                        let r = {
                            name: obj.state[0].name,
                            code: obj.state[0].code,
                            severity: obj.state[0].severity,
                            description: obj.state[0].description
                        };

                        errorCodeCache[url] = r;
                        return Promise.resolve(r);
                    })
                    .catch(err => {
                        let errStr = `Failed to get error code, url '${errUrl}'. >>> ${err}`;
                        o.writeDebug(errStr, 3);
                        return Promise.reject(errStr);
                    });
            }
        }

        function getReponseAsJSON(request) {
            return parseJSON(request.responseText);
        }

        function parseJSON(json) {
            try {
                return JSON.parse(json);
            } catch (error) {
                o.writeDebug(`Failed to parse JSON. >>> ${error}`,0);
                return undefined;
            }
        }

        function requestMastership () {
            return o.Mastership.request()
                .then(() => Promise.resolve())
                .catch(err => Promise.reject(rejectWithStatus('Could not get Mastership.', err)));
        }

        // Releases the Mastership, if it fails it should log the error and hide the rejection.
        function releaseMastership () {
            return o.Mastership.release()
                .then(() => Promise.resolve())
                .catch(err => {
                    o.writeDebug(`Could not release Mastership. >>> ${err.message}`);
                    return Promise.resolve();
                });
        }

        /**
         * Waits for a RWS progress to complete
         * 
         * @param   {string}            location    The path where the compressed result is placed
         * @param   {number}            timeout     The time (in seconds) to wait for the process to finish
         * @returns {Promise<{}>}                   A Promise with the status code of the progress monitored
         */
        function waitProgressCompletion(location, timeout = 60) {
            if (isNaN(timeout) == true || timeout < 0) return Promise.reject("timeout not valid.");

            const checkProgress = (loops) => {
                if (loops <= 0) {
                    let s = `${location} did not complete within ${timeout}s.`;
                    return Promise.reject(s);
                }

                const wait1s = () => new Promise(resolve => setTimeout(resolve, 1000));

                return wait1s()
                    .then(() => {
                        return o.Network.get(location)
                            .then(res2 => {
                                let json2 = parseJSON(res2.responseText);
                                if (typeof json2 === 'undefined') return Promise.reject();

                                let code = 0;
                                let ready = false;
                                for (const item of json2.state) {
                                    if (item._type === "progress" && item.state === "ready") {
                                        ready = true;
                                        code = item.code;
                                        break;
                                    }
                                }

                                if (ready === true) return Promise.resolve(code);
                                else return Promise.reject();
                            });
                    })
                    .then(x1 => {
                        return Promise.resolve(x1);
                    })
                    .catch(() => {
                        return checkProgress(loops - 1);
                    });
            }

            return checkProgress(timeout);
        }

        /**
         * The domain used for Rapid handling
         */
        o.Rapid = new function () {

            /**
             * Enum for Monitor resources
             */
            this.MonitorResources = {
                execution: 'execution',
                programPointer: 'program-pointer',
                motionPointer: 'motion-pointer',
                uiInstruction: 'uiinstr'
            }

            /**
             * A Monitoring object for subscriptions
             * 
             * @param   {string}    resource    The resource to monitor. Valid values: 'execution', 'program-pointer', 'motion-pointer', 'uiinstr'
             * @param   {string}    task        The task to watch. NOTE! For resource 'execution' and 'uiinstr' task is ignored.
             * 
             */
            function Monitor(resource, task = '') {

                if (typeof resource !== 'string' || 
                    (resource.toLowerCase() !== o.Rapid.MonitorResources.execution &&
                    resource.toLowerCase() !== o.Rapid.MonitorResources.programPointer &&
                    resource.toLowerCase() !== o.Rapid.MonitorResources.motionPointer &&
                    resource.toLowerCase() !== o.Rapid.MonitorResources.uiInstruction)) {
                    o.writeDebug('Unable to create Rapid Monitor: Illegal resource.', 3);
                    return;
                }
                if (task === null || (resource !== o.Rapid.MonitorResources.execution && resource !== o.Rapid.MonitorResources.uiInstruction && task === '')) {
                    o.writeDebug('Unable to create Monitor: Illegal task.', 3);
                    return;
                }

                let resourceName = resource;

                const urls = {
                    'execution': '/rw/rapid/execution',
                    'program-pointer': `/rw/rapid/tasks/${encodeURIComponent(task)}/pcp`,
                    'motion-pointer': `/rw/rapid/tasks/${encodeURIComponent(task)}/pcp`,
                    'uiinstr': '/rw/rapid/uiinstr/active'
                }

                const resourceStrings = {
                    'execution': '/rw/rapid/execution;ctrlexecstate',
                    'program-pointer': `/rw/rapid/tasks/${encodeURIComponent(task)}/pcp;programpointerchange`,
                    'motion-pointer': `/rw/rapid/tasks/${encodeURIComponent(task)}/pcp;motionpointerchange`,
                    'uiinstr': '/rw/rapid/uiinstr;uievent'
                }

                var callbacks = [];

                /**
                 * Gets the title of the object
                 * 
                 * @returns {string}       An identifier for the object.
                 */
                this.getTitle = function () {
                    return urls[resourceName];
                }

                /**
                 * Gets the resource url for subscription.
                 * 
                 * @returns {string}       A url to the subscribed resource
                 */
                this.getResourceString = function () {
                    return resourceStrings[resourceName];
                }

                /**
                 * Adds a callback which will be called when the controller state changes
                 * 
                 * @param   {function}  callback    The callback function which is called when the controller state changes
                 */
                this.addCallbackOnChanged = function (callback) {
                    if (typeof callback !== "function") throw new Error("callback is not a valid function");
                    callbacks.push(callback);
                }

                /**
                 * Calls all callback functions with the new controller state
                 * 
                 * @param   {string}    newValue    The new controller state
                 */
                this.onchanged = async function (newValue) {

                    let parsedValue = {};

                    switch (resourceName) {
                        case 'execution':
                            if (newValue.hasOwnProperty('ctrlexecstate')) parsedValue = newValue['ctrlexecstate'];
                            break;
                        case 'program-pointer':
                        case 'motion-pointer':
                            let pp = {};
                            pp['moduleName'] = newValue.hasOwnProperty('module-name') ? newValue['module-name'] : '';
                            pp['routineName'] = newValue.hasOwnProperty('routine-name') ? newValue['routine-name'] : '';
                            pp['beginPosition'] = newValue.hasOwnProperty('BegPosLine') ? newValue.BegPosLine : '';
                            if (newValue.hasOwnProperty('BegPosCol')) {
                                pp['beginPosition'] += "," + newValue.BegPosCol;
                            }
                            pp['endPosition'] = newValue.hasOwnProperty('EndPosLine') ? newValue.EndPosLine : '';
                            if (newValue.hasOwnProperty('EndPosCol')) {
                                pp['endPosition'] += "," + newValue.EndPosCol;
                            }
                            pp['hasValue'] = pp['moduleName'] !== '' ||
                                pp['routineName'] !== '' ||
                                pp['beginPosition'] !== '' ||
                                pp['endPosition'] !== '';

                            parsedValue = pp;
                            break;
                        case 'uiinstr':
                            let t = null;
                            try {
                                t = await processUIInstr(newValue);
                            } catch (error) {
                                o.writeDebug(`processUIInstr failed. >>> ${error.toString()}`, 2);
                            }
                            parsedValue = t;

                            break;
                        default:
                            o.writeDebug(`Unhandled event, '${JSON.stringify(newValue)}'`);
                            return;
                    }

                    for (let iii = 0; iii < callbacks.length; iii++) {
                        try {
                            callbacks[iii](parsedValue);
                        } catch (error) {
                            o.writeDebug(`Rapid.Monitor callback failed. >>> ${error.toString()}`, 3);
                        }
                    }
                }

                const processUIInstr = async (uiinstr) => {
                    if (uiinstr.hasOwnProperty('instr') === false || uiinstr.hasOwnProperty('event') === false) {
                        o.writeDebug(`Unhandled uiinstr event, '${JSON.stringify(uiinstr)}'`);
                        return;
                    }

                    // ToDo UIMsgWrite breaks VC so we can not support them yet
                    if (uiinstr['instr'] === 'UIMsgWrite') {
                        o.writeDebug(`Unhandled uiinstr event, 'UIMsgWrite' not supported`);
                        return;
                    }

                    let stack = uiinstr['stack'].split("/");
                    let data = {
                        instruction: uiinstr['instr'],
                        event: uiinstr['event'].toLowerCase(),
                        task: stack[1],
                        message: uiinstr['msg'].replace(/^"/g, '').replace(/"$/g, ''),
                        executionLevel: uiinstr['execlv'].toLowerCase(),
                    };

                    switch (uiinstr['event']) {
                        case 'POST':
                            data['id'] = '';
                            break;
                        case 'SEND':
                            data['id'] = stack[2].slice(2);

                            let t = `/rw/rapid/uiinstr/active/params/RAPID/${data.task}/%$${data.id}`
                            let callUrl = encodePath(t);
                            await o.Network.get(callUrl)
                                .then(res => {
                                    let obj = parseJSON(res.responseText);
                                    if (typeof obj === 'undefined') return o.writeDebug('Could not parse JSON.');

                                    let parameters = {};
                                    for (const item of obj._embedded.resources) {
                                        let val = getUIInstrData(item);
                                        if (val !== null) parameters[item._title] = val;
                                    }

                                    data['parameters'] = parameters;
                                })
                                .catch(err => o.writeDebug(`Failed to get parameters for uiinstr event for instruction '${uiinstr['instr']}' >>> ${err}`, 2));
                            break;
                        case 'ABORT':
                            data['id'] = stack[2].slice(2);
                            break;
                        default:
                            o.writeDebug(`Unsupported uiinstr event '${uiinstr['event']}' for instruction '${uiinstr['instr']}'`);
                            return;
                    }
                    return data;
                }
                const getUIInstrData = (item) => {
                    if (item.hasOwnProperty('_type') === false || item._type !== 'rap-uiparams-li') return null;
                    if (item.hasOwnProperty('_title') === false) return null;
                    if (item.value === null) return null;

                    let symbol = null;

                    switch (item._title) {
                        case 'Buttons':
                        case 'Icon':
                        case 'MaxTime':
                        case 'BreakFlag':
                        case 'TPAnswer':
                        case 'InitValue':
                        case 'MinValue':
                        case 'MaxValue':
                        case 'Increment':
                        case 'ResultIndex':
                            symbol = parseFloat(item.value);
                            break;
                        case 'TPCompleted':
                        case 'Wrap':
                        case 'DIpass':
                        case 'DOpass':
                        case 'PersBoolPassive':
                        case 'AsInteger':
                            symbol = item.value.toUpperCase() == 'TRUE';
                            break;
                        case 'Result':
                        case 'Header':
                        case 'Image':
                        case 'InstrUsingIMessageBox':
                        case 'TPText':
                        case 'TPFK1':
                        case 'TPFK2':
                        case 'TPFK3':
                        case 'TPFK4':
                        case 'TPFK5':
                        case 'InitString':
                            symbol = item.value.replace(/^"/g, '').replace(/"$/g, '');
                            break;
                        case 'MsgArray':
                        case 'BtnArray':
                        case 'ListItems':
                            symbol = JSON.parse(item.value);
                            break;
                        default:
                            o.writeDebug(`Unhandled symbol type '${item._title}'`);
                            return null;
                    }

                    return symbol;
                }

                const raiseEvent = async () => {

                    const getValue = async () => {
                        let rawValue = await o.Network.get(urls[resourceName])
                            .then(x1 => {
                                let obj = parseJSON(x1.responseText);
                                if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                                return obj;
                            })
                            .catch(err => {
                                if (err.hasOwnProperty('httpStatus') && err.httpStatus.hasOwnProperty('code') && err.httpStatus.code !== 404) {
                                    let s = JSON.stringify(err);
                                    o.writeDebug(`Rapid.raiseEvent failed getting value. >>> ${s}`);
                                }
                                return null;
                            });
                        if (rawValue === null) return null;

                        let parsedValue = null;
                        switch (resourceName) {
                            case 'execution':
                                if (rawValue.hasOwnProperty('state') && rawValue['state'].length > 0) {
                                    let state = rawValue['state'][0];
                                    if (state.hasOwnProperty('ctrlexecstate')) {
                                        parsedValue = state['ctrlexecstate'];
                                    }
                                }
                                break;
                            case 'program-pointer':
                            case 'motion-pointer':
                                let pointers = parsePointers(rawValue);
                                if (resourceName === 'program-pointer') {
                                    parsedValue = pointers.programPointer;
                                } else {
                                    parsedValue = pointers.motionPointer;
                                }
                                break;
                            case 'uiinstr':
                                if (rawValue.hasOwnProperty('state')) parsedValue = await processUIInstr(rawValue.state[0]);
                                break;
                            default:
                                o.writeDebug(`Unsupported resource '${resourceName}'`);
                                break;
                        }

                        return parsedValue;
                    }

                    let value = await getValue();
                    if (value === null) return;

                    for (let iii = 0; iii < callbacks.length; iii++) {
                        try {
                            callbacks[iii](value);
                        } catch (error) {
                            o.writeDebug(`Rapid.Monitor callback failed. >>> ${error.toString()}`, 3);
                        }
                    }
                }

                /**
                 * Subscribes to the controller state
                 * 
                 * @param   {boolean}       raiseInitial    Flag indicating if an initial event should be raised when the subscription is registered.
                 * @returns {Promise<{}>}                   A Promise with a status
                 */
                this.subscribe = function (raiseInitial = false) {
                    if (raiseInitial === true) return o.Subscriptions.subscribe([this], raiseEvent);

                    return o.Subscriptions.subscribe([this]);
                }

                /**
                 * Unsubscribes from the controller state
                 * 
                 * @returns {Promise<{}>}           A Promise with a status
                 */
                this.unsubscribe = function () {
                    return o.Subscriptions.unsubscribe([this]);
                }
            }

            /**
             * Gets a Monitor object for Rapid
             * 
             * @param   {string}    resource    The resource to monitor. Valid values: 'execution', 'program-pointer', 'motion-pointer'
             * @param   {string}    taskName    The task to watch. NOTE! For resource 'execution' task is ignored.
             *
             * @returns {Monitor}               A Monitor object for subscriptions
             */
            this.getMonitor = function (resource, taskName) {
                return new Monitor(resource, taskName);
            }


            /**
             * Rapid-task object
             * 
             * @param   {string}    name    The task's name
             */
            function Task(name) {
                var taskName = name;
                var taskType = null;
                var taskState = null;
                var executionState = null;
                var activeState = null;
                var isMotionTask = null;
                var trustLevel = null;
                var id = null;
                var executionLevel = null;
                var executionMode = null;
                var executionType = null;
                var progEntrypoint = null;
                var bindRef = null;
                var taskInForeground = null;

                /**
                 * Gets the name of the task
                 * 
                 * @returns {string}    The task name
                 */
                this.getName = function () { return taskName; }

                /**
                 * Gets the properties of the task
                 * 
                 * @returns {Promise<{}>}    A Promise with the Properties object
                 */
                this.getProperties = function () {

                    return refreshProperties()
                        .then(() => {
                            var properties = {
                                name: taskName,
                                taskType: taskType,
                                taskState: taskState,
                                executionState: executionState,
                                activeState: activeState,
                                isMotionTask: isMotionTask,
                                trustLevel: trustLevel, 
                                id: id,
                                executionLevel: executionLevel,
                                executionMode: executionMode,
                                executionType: executionType,
                                progEntrypoint: progEntrypoint,
                                bindRef: bindRef,
                                taskInForeground: taskInForeground
                            };

                            return Promise.resolve(properties);
                        })
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Service routine 
                 * 
                 * @param   {string}    urlToRoutine    The url to the service routine
                 */
                function ServiceRoutine(urlToRoutine) {
                    var routineUrl = urlToRoutine;
                    var routineName = '';

                    (function () {
                        let splits = routineUrl.split('/');
                        routineName = splits.pop();
                    }());

                    /**
                     * Gets the name of the service routine
                     * 
                     * @returns {string}    The routine name
                     */
                    this.getName = function () { return routineName; }

                    /**
                     * Gets the url
                     * 
                     * @returns {string}    The url
                     */
                    this.getUrl = function () { return routineUrl; }

                    /**
                     * Set PP to the service routine.
                     * 
                     * @returns {Promise<status>}    A Promise with the status of the call.
                     */
                    this.setPP = function () {
                        let t = `/rw/rapid/tasks/${taskName}/pcp/routine`;
                        let callUrl = `${encodePath(t)}?mastership=implicit`;
                        let body = `routine=${encodeURIComponent(routineName)}&userlevel=TRUE`;
                        return o.Network.post(callUrl, body)
                            .then(() => Promise.resolve())
                            .catch(err => rejectWithStatus('Failed to set PP to service routine.', err));
                    }
                }

                /**
                 * Get service routines
                 * 
                 * @returns {Promise<[ServiceRoutine]>}    A Promise with an array of service routine objects.
                 */
                this.getServiceRoutines = function () {

                    let callUrl = `/rw/rapid/tasks/${taskName}/serviceroutine`;
                    return o.Network.get(callUrl)
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            let serviceRoutines = [];

                            for (const item of obj.state) {
                                if (item._type === "rap-task-routine" && item['service-routine'] === 'TRUE') {
                                    if (item.hasOwnProperty('url-to-routine') === false) continue;

                                    let sr = new ServiceRoutine(item['url-to-routine']);
                                    serviceRoutines.push(sr);
                                }
                            }
                            return Promise.resolve(serviceRoutines);
                        })
                        .catch(err => rejectWithStatus('Failed to get service routines.', err));

                }

                /**
                 * Gets the Data object of a symbol
                 * 
                 * @param   {string}            moduleName  The module name
                 * @param   {string}            symbolName  The symbol name
                 * @returns {Prommise<Data>}                The Data item
                 */
                this.getData = function (moduleName, symbolName) {
                    return RWS.Rapid.getData(taskName, moduleName, symbolName);
                }

                /**
                 * Updates the properties of the task
                 * 
                 * @returns {Promise}    A Promise with a status message
                 */
                var refreshProperties = function () {

                    const replacables = {
                        'SysFail': 'sys_fail',
                        'SysHalt': 'sys_halt',
                        'SysStop': 'sys_stop',
                        'StepOver': 'step_over',
                        'StepIn': 'step_in',
                        'StepOutOf': 'step_out_of',
                        'StepBack': 'step_back',
                        'StepLast': 'step_last',
                        'StepWise': 'stepwise',
                        'Inter': 'interrupt',
                        'ExInter': 'external_interrupt',
                        'UsRout': 'user_routine',
                        'EvRout': 'event_routine'
                    };
                    const processString = function (text) {
                        if (typeof text !== 'string' || text === null) return '';
                        if (replacables.hasOwnProperty(text) === false) return text.toLowerCase();

                        return replacables[text];
                    }

                    return o.Network.get(`/rw/rapid/tasks/${encodeURIComponent(taskName)}`)
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            let itemFound = false;

                            for (const item of obj.state) {
                                if (item._type === "rap-task") {

                                    taskType = processString(item.type);
                                    taskState = processString(item.taskstate);
                                    executionState = processString(item.excstate);
                                    activeState = processString(item.active);
                                    if (item.hasOwnProperty('motiontask')) {
                                        isMotionTask = item.motiontask.toLowerCase() === 'true';
                                    } else {
                                        isMotionTask = false;
                                    }
                                    trustLevel = processString(item.trust);
                                    id = parseInt(item.taskID);
                                    executionLevel = processString(item.execlevel);
                                    executionMode = processString(item.execmode);
                                    executionType = processString(item.exectype);
                                    progEntrypoint = item.prodentrypt;
                                    if (item.hasOwnProperty('bind_ref')) {
                                        bindRef = item.bind_ref.toLowerCase() === 'true';
                                    } else {
                                        bindRef = false;
                                    }
                                    taskInForeground = item.task_in_forgnd;

                                    itemFound = true;
                                    break;
                                }
                            }

                            if (itemFound === false) {
                                return Promise.reject("Could not find symbol rap-task value in RWS response");
                            }

                            return Promise.resolve("Success");
                        })
                        .catch(err => rejectWithStatus('Failed getting properties.', err));
                        
                }

                /**
                 * Gets program info for the task
                 * 
                 * @returns {Promise}    A Promise with a object contining program name and entry point
                 */
                this.getProgramInfo = function () {

                    return o.Network.get(`/rw/rapid/tasks/${encodeURIComponent(taskName)}/program`)
                        .then(res => {
                            if (typeof res.responseText == 'undefined' || res.responseText === "") {
                                return Promise.resolve({ name : "", entrypoint : ""});
                            }

                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            let programInfo = {};

                            for (const item of obj.state) {
                                if (item._type === "rap-program") {
                                    programInfo.name = item.name;
                                    programInfo.entrypoint = item.entrypoint;
                                }
                            }

                            return Promise.resolve(programInfo);
                        })
                        .catch(err => rejectWithStatus('Failed getting program info.',err));
                }

                /**
                 * Gets module names for the task
                 * 
                 * @returns {Promise<{}>}    A Promise with a object contining a list of program modules and a list of system modules
                 */
                this.getModuleNames = function () {

                    return o.Network.get(`/rw/rapid/tasks/${encodeURIComponent(taskName)}/modules`)
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            let modules = {};

                            modules.programModules = [];

                            for (const item of obj.state) {
                                if (item._type === "rap-module-info-li" && item.type === "ProgMod") {
                                    modules.programModules.push(item.name);
                                }
                            }

                            modules.systemModules = [];

                            for (const item of obj.state) {
                                if (item._type === "rap-module-info-li" && item.type === "SysMod") {
                                    modules.systemModules.push(item.name);
                                }
                            }

                            return Promise.resolve(modules);
                        })
                        .catch(err => rejectWithStatus('Failed getting module name.', err));
                }

                /**
                 * Gets a Module object
                 * 
                 * @param   {string}            moduleName      The module name
                 * @returns {Promise<Module>}                   The Module object with retrieved properties
                 */
                this.getModule = function (moduleName) {
                    return RWS.Rapid.getModule(taskName, moduleName);
                }

                /**
                 * Set PP to a routine.
                 * 
                 * @param   {string}                routineName     The name of the routine
                 * @param   {bool}                  [userLevel]     use userLevel
                 * @param   {string}                [moduleName]    use userLevel
                 * @returns {Promise<status>}                       A Promise with the status of the call.
                 */
                this.movePPToRoutine = function (routineName, userLevel = false, moduleName = undefined) {
                    if (typeof routineName !== 'string') return Promise.reject("Parameter 'routineName' is not a string.");
                    if (typeof userLevel !== 'boolean') return Promise.reject("Parameter 'userLevel' is not a boolean.");

                    let url = `/rw/rapid/tasks/${encodeURIComponent(taskName)}/pcp/routine?mastership=implicit`;
                    let moduleArg = moduleName ? `&module=${encodeURIComponent(moduleName)}` : "";
                    let body = `routine=${encodeURIComponent(routineName)}${moduleArg}&userlevel=${userLevel}`;
                    return o.Network.post(url, body)
                        .then(() => Promise.resolve())
                        .catch(err => rejectWithStatus('Failed to set PP to routine.', err));

                }
                

                /**
                 * Gets program pointer and motion pointer
                 * 
                 * @returns {Promise<{}>}    A Promise with a object contining information of program pointer and motion pointer
                 */
                this.getPointers = function () {

                    let callUrl = `/rw/rapid/tasks/${encodeURIComponent(taskName)}/pcp`;

                    return o.Network.get(callUrl)
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            let pcp = parsePointers(obj);

                            return Promise.resolve(pcp);
                        })
                        .catch(err => rejectWithStatus('Failed getting pointers.', err));
                }
            }

            /**
             * Rapid-module object
             * 
             * @param   {string}    task        The task name
             * @param   {string}    module        The module name
             */
            function Module(task, module) {
                
                var taskName = isNonEmptyString(task) === true ? task : '';
                var moduleName = isNonEmptyString(module) === true ? module : '';

                var fileName = null;
                var attributes = null;

                /**
                 * Gets the name of the module
                 * 
                 * @returns {string}    The module's name
                 */
                this.getName = function () { return moduleName; }

                /**
                 * Gets the name of the task that owns the module
                 * 
                 * @returns {string}    The task's name
                 */
                this.getTaskName = function () { return taskName; }

                /**
                 * Gets the name of the module's file
                 * 
                 * @returns {string}    The module's file name
                 */
                this.getFileName = function () { return fileName; }

                /**
                 * Gets the attributes of the module
                 * 
                 * @returns {string}    The module's attributes
                 */
                this.getAttributes = function () { return attributes; }

                /**
                 * Gets the refreshed properties of the module.
                 * Note! If refreshing the properties is unwanted, get properties by their respective accessor.
                 * 
                 * @returns {Promise<{}>}    A Promise with the Properties object
                 */
                this.getProperties = function () {

                    return refreshProperties().then(() => {

                        var properties = {
                            taskName: taskName,
                            moduleName: moduleName,
                            fileName: fileName,
                            attributes: attributes
                        };

                        return Promise.resolve(properties);
                    })
                    .catch(err => Promise.reject(err));
                }

                /**
                 * Gets the Data object of a symbol
                 * 
                 * @param   {string}        symbolName  The symbol name
                 * @returns {Promise<Data>}             The Data item
                 */
                this.getData = function (symbolName) {
                    return new Data(taskName, moduleName, symbolName);
                }

                /**
                 * Updates the properties of the module
                 * 
                 * @returns {Promise}    A Promise with a status message
                 */
                var refreshProperties = function () {

                    let url = `/rw/rapid/tasks/${encodeURIComponent(taskName)}/modules/${encodeURIComponent(moduleName)}`;

                    return o.Network.get(url)
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            let itemFound = false;

                            for (const item of obj.state) {
                                if (item._type === "rap-module") {

                                    fileName = item.filename;
                                    attributes = item.attribute;

                                    itemFound = true;
                                    break;
                                }
                            }

                            if (itemFound === false) {
                                return Promise.reject("Could not find symbol rap-module value in RWS response");
                            }

                            return Promise.resolve("Success");
                        })
                        .catch(err => rejectWithStatus('Failed getting properties.', err));

                }
            }

            /**
             * Rapid-data object
             * 
             * @param   {string}    task    The task name
             * @param   {string}    module  The module name
             * @param   {string}    symbol  The symbol name
             */
            function Data(task, module, symbol) {

                var taskName = isNonEmptyString(task) === true ? task : '';
                var moduleName = isNonEmptyString(module) === true ? module : '';
                var symbolName = isNonEmptyString(symbol) === true ? symbol : '';
                var dataType = null;
                var symbolType = null;
                var dataTypeURL = null;
                var symbolValue = null;
                var dimensions = null;
                var scope = null;
                var parsedType = null;

                var isSharedModule = taskName === SHARED_TAG && moduleName === SHARED_TAG;
                var symbolTitle = isSharedModule === true ? `RAPID/${symbolName}` : `RAPID/${taskName}/${moduleName}/${symbolName}`;

                /**
                 * Flag that indicates whether the object has a valid setup
                 * 
                 * @returns {bool}    true if valid, otherwise false
                 */
                var hasValidSetup = (function () {
                    if (taskName === null || moduleName === null || symbolName === null) return false;
                    if (taskName === '' || moduleName === '' || symbolName === '') return false;

                    return true;
                })();

                /**
                 * Gets the title of the symbol
                 * 
                 * @returns {string}    The symbol title
                 */
                this.getTitle = function () { return symbolTitle; }

                /**
                 * Gets the properties of the data
                 * 
                 * @returns {Promise<{}>}    A Promise with the Properties object
                 */
                this.getProperties = function () {

                    return refreshProperties().then(() => {

                        var properties = {
                            taskName: taskName,
                            moduleName: moduleName,
                            symbolName: symbolName,
                            dataType: dataType,
                            symbolType: symbolType,
                            dimensions: dimensions,
                            scope: scope,
                            dataTypeURL: dataTypeURL
                        };

                        return Promise.resolve(properties);
                    })
                    .catch(err => Promise.reject(err));
                }

                /**
                 * Gets the name of the symbol
                 * 
                 * @returns{string}    The symbol name
                 */
                this.getName = function () { return symbolName; }

                /**
                 * Gets the name of the module that owns the symbol
                 * 
                 * @returns {string}    The module name
                 */
                this.getModuleName = function () { return moduleName; }

                /**
                 * Gets the name of the task that owns the module that owns the symbol
                 * 
                 * @returns {string}    The task name
                 */
                this.getTaskName = function () { return taskName; }

                /**
                 * Gets the datatype of the symbol
                 * 
                 * @returns {Promise<string>}   A Promise with the data type
                 */
                this.getDataType = function () {
                    if (dataType !== null) return Promise.resolve(dataType);
                    return refreshProperties()
                        .then(() => Promise.resolve(dataType))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Gets the declaration type of the symbol
                 * 
                 * @returns {Promise<string>}   A Promise with the declaration type (constant, variable or persistent)
                 */
                this.getSymbolType = function () {
                    if (symbolType !== null) return Promise.resolve(symbolType);
                    return refreshProperties()
                        .then(() => Promise.resolve(symbolType))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Gets the dimensions of the symbol
                 * 
                 * @returns {Promise<[number]>}   A Promise with a list of dimensions
                 */
                this.getDimensions = function () {
                    if (dimensions !== null) return Promise.resolve(dimensions);
                    return refreshProperties()
                        .then(() => Promise.resolve(dimensions))
                        .catch(err => Promise.reject(err));
                }
                               
                /**
                 * Gets the data's scope, i.e. 'local', 'task' or 'global' 
                 * NOTE! constants can not be 'task'
                 *
                 * @returns {Promise<string>}   A Promise with a string
                 */
                this.getScope = function () {
                    if (scope !== null) return Promise.resolve(scope);
                    return refreshProperties()
                        .then(() => Promise.resolve(scope))
                        .catch(err => Promise.reject(err));
                }
                
                /**
                 * Gets the type URL of the symbol
                 * 
                 * @returns  {Promise<string>}   A Promise with the symbol type URL
                 */
                this.getTypeURL = function () {
                    if (dataTypeURL !== null) return Promise.resolve(dataTypeURL);
                    return refreshProperties()
                        .then(() => Promise.resolve(dataTypeURL))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Gets the parsed value of the symbol
                 * 
                 * @returns {Promise}       A Promise with the parsed symbol value
                 */
                this.getValue = function () {
                    if (symbolValue !== null) {
                        if (parsedType === null) {
                            return RWS.RapidData.Type.getType(this)
                                .then(x => {
                                    parsedType = x;
                                    return RWS.RapidData.Value.parseRawValue(parsedType, symbolValue);
                                })
                                .catch(err => Promise.reject(err));
                        }

                        return RWS.RapidData.Value.parseRawValue(parsedType, symbolValue);
                    }

                    return this.fetch()
                        .then(() => {
                            return RWS.RapidData.Type.getType(this)
                                .then(x => {
                                    parsedType = x;
                                    return RWS.RapidData.Value.parseRawValue(parsedType, symbolValue);
                                })
                                .catch(err => Promise.reject(err));
                        })
                        .catch(err => Promise.reject(err));
                }

                const getArrayType = (base, indexes) => {
                    if (base.isArray === false) throw new Error(`Type '${base.type}' is not an array.`);
                    if (indexes.length > base.dimensions.length) throw new Error('More indexes provided than array contains dimensions.');

                    let ret = JSON.parse(JSON.stringify(base));
                    for (let iii = 0; iii < indexes.length; iii++) {
                        ret.dimensions.shift();
                    }
                    if (ret.dimensions.length <= 0) ret.isArray = false;
                    ret.url = dataTypeURL;

                    return ret;
                }

                /**
                 * Gets the parsed value of a specific item in an array.
                 * 
                 * @param   {...number}    indexes      A parameter list of numbers which are the indexes of the item to get
                 * @returns {Promise}                   A Promise with the parsed symbol value
                 */
                this.getArrayItem = async function (...indexes) {
                    if (dimensions === null || dimensions.length <= 0) return rejectWithStatus('Get array item failed. >>> Cannot access data as array.');

                    if (indexes.length > dimensions.length) return rejectWithStatus('Get array item failed. >>> More indexes provided than array contains dimensions.');
                    for (let iii = 0; iii < indexes.length; iii++) {
                        if (typeof indexes[iii] !== 'number' || dimensions[iii] < indexes[iii] || indexes[iii] < 1) return rejectWithStatus('Get array item failed. >>> Index out of bounds.');
                    }

                    if (parsedType === null) {
                        parsedType = await RWS.RapidData.Type.getType(this);
                    }

                    let arrayType = null;
                    try {
                        arrayType = getArrayType(parsedType, indexes);
                    } catch (error) {
                        return rejectWithStatus('Failed to get array item.', error);
                    }
                    return fetchItem(indexes)
                        .then(x => RWS.RapidData.Value.parseRawValue(arrayType, x))
                        .catch(err => rejectWithStatus('Error fetching value.',  err));
                }

                /**
                 * Gets the parsed value of a specific component in the Record
                 * 
                 * @param   {...string}         components  The components of the item to set
                 * @returns {Promise}                       A Promise with the parsed symbol value
                 */
                this.getRecordItem = function (...components) {
                    let indexes = [];
                    let type = null;
                    return getParsedType(this)
                        .then(x1 => getRecordIndexes(x1, components, indexes))
                        .then(x2 => {
                            type = x2.type;
                            return fetchItem(x2.indexes);
                        })
                        .then(x3 => RWS.RapidData.Value.parseRawValue(type, x3))
                        .catch(err => rejectWithStatus('Get record item failed.', err));
                }

                /**
                 * Gets the value of the symbol as it is returned by RWS
                 * 
                 * @returns {Promise<string>}       A Promise with the symbol's raw value as a string
                 */
                this.getRawValue = function () {
                    if (symbolValue !== null) {
                        return Promise.resolve(symbolValue);
                    }
                    return this.fetch()
                        .then(() => Promise.resolve(symbolValue))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Sets the value of the symbol
                 * 
                 * @param   {{}}                value   The new value as an atomic, array or object (Record in Rapid)
                 * @returns {Promise<{}>}               A Promise with a status
                 */
                this.setValue = (value) => {
                    if (hasValidSetup === false) return Promise.reject(`Symbol path '${getSymbolUrl()}' not valid.`);

                    let url = getSymbolUrl() + "/data";
                    let sVal = RWS.RapidData.String.stringify(value);
                    let hasMastership = false;
                    let error = null;

                    return requestMastership()
                        .then(() => {
                            hasMastership = true;
                            return o.Network.post(url, "value=" + encodeURIComponent(sVal));
                        })
                        .catch(err => {
                            if (hasMastership === true) {
                                error = err;
                                return Promise.resolve();
                            }

                            return rejectWithStatus("Failed to get Mastership.", err);
                        })
                        .then(() => releaseMastership())
                        .then(() => {
                            if (error !== null) return rejectWithStatus("Failed to set value.", error);
                            return Promise.resolve();
                        });
                }

                /**
                 * Sets the raw value of the symbol
                 * 
                 * @param   {string}            value       The new value
                 * @param   {...number}         indexes     Optional indexes for setting specific items in arrays and records
                 * @returns {Promise<{}>}                   A Promise with a status
                 */
                this.setRawValue = (value, ...indexes) => {
                    if (hasValidSetup === false) return rejectWithStatus(`Symbol path '${getSymbolUrl()}' not valid.`);

                    let sInd = '';
                    if (indexes !== null && Array.isArray(indexes) && indexes.length > 0) {
                        sInd = '{';
                        for (let iii = 0; iii < indexes.length; iii++) {
                            sInd += indexes[iii].toString();
                            if (iii < indexes.length - 1) sInd += ',';
                        }
                        sInd += '}';
                    }

                    let url = getSymbolUrl() + encodeURIComponent(sInd) + "/data";
                    let hasMastership = false;
                    let error = null;

                    return requestMastership()
                        .then(() => {
                            hasMastership = true;
                            return o.Network.post(url, "value=" + encodeURIComponent(value));
                        })
                        .catch(err => {
                            if (hasMastership === true) {
                                error = err;
                                return Promise.resolve();
                            }

                            return rejectWithStatus("Failed to get Mastership.", err);
                        })
                        .then(() => releaseMastership())
                        .then(() => {
                            if (error !== null) return rejectWithStatus("Failed to set raw value.", error);
                            return Promise.resolve();
                        });
                }

                /**
                 * Sets the value of a specific item in an array.
                 * 
                 * @param   {}                  value       The value of the item
                 * @param   {...number}         indexes     A parameter list of numbers which are the indexes of the item to get
                 * @returns {Promise<{}>}                   A Promise with the status of the request
                 */
                this.setArrayItem = function (value, ...indexes) {
                    if (dimensions === null || dimensions.length <= 0) return rejectWithStatus('Set array item failed. >>> Cannot access data as array.');
                    if (indexes.length > dimensions.length) return rejectWithStatus('Set array item failed. >>> More indexes provided than array contains dimensions.');
                    for (let iii = 0; iii < indexes.length; iii++) {
                        if (typeof indexes[iii] !== 'number' || dimensions[iii] < indexes[iii] || indexes[iii] < 1) return rejectWithStatus('Set array item failed. >>> Index out of bounds.');
                    }

                    let sVal = RWS.RapidData.String.stringify(value);
                    return setItem(indexes, sVal);
                }                

                /**
                 * Sets the value of a component in a Record.
                 * 
                 * @param   {}                  value       The value of the item
                 * @param   {...string}         components  The components of the item to set
                 * @returns {Promise<{}>}                   A Promise with the status of the request
                 */
                this.setRecordItem = function (value, ...components) {
                    let indexes = [];
                    return getParsedType(this)
                        .then(x1 => getRecordIndexes(x1, components, indexes))
                        .then(() => {
                            let sVal = RWS.RapidData.String.stringify(value);
                            return setItem(indexes, sVal);
                        })
                        .catch(err => rejectWithStatus('Set record item failed.', err));
                }

                /**
                 * Updates the value of the symbol
                 * 
                 * @returns {Promise<{}>}           A Promise with a status
                 */
                this.fetch = function () {
                    if (hasValidSetup === false) return rejectWithStatus(`Symbol path '${getSymbolUrl()}' not valid.`);

                    const processData = (json) => {
                        for (const item of json.state) {
                            if (item._type === "rap-data") {
                                symbolValue = item.value;
                                break;
                            }
                        }
                    }

                    let url = getSymbolUrl() + "/data"
                    return o.Network.get(url)
                        .then(res => {

                            let json = parseJSON(res.responseText);
                            if (json === undefined) return reject('Could not parse JSON..');

                            return verifyReturnCode(json)
                                .then(() => {
                                    processData(json);
                                    return Promise.resolve("Fetched Data!");
                                })
                                .catch(errors => {
                                    if (errors.hasOwnProperty('pgmname_ret')) {
                                        let err = errors['pgmname_ret'];
                                        if (err.hasOwnProperty('code') === false || err.code !== '-1073445865') { // SYS_CTRL_E_BUFFER_OVERFLOW
                                            return Promise.reject(err);
                                        }

                                        if (dimensions.length > 0) {
                                            return fetchByItem();
                                        }

                                        // ToDo, we only support big arrays, Records are not supported.
                                        return Promise.reject("Data is too large to retrieve.");
                                    }

                                    processData(json);
                                    return Promise.resolve("Fetched Data!");
                                });                                
                        })
                        .catch(err => rejectWithStatus('Error fetching Rapid data value.', err));
                }

                const getParsedType = function (data) {
                    if (parsedType !== null && typeof parsedType !== 'undefined') return Promise.resolve(parsedType);

                    return RWS.RapidData.Type.getType(data)
                        .then(x => {
                            parsedType = x;
                            return Promise.resolve(x);
                        })
                        .catch(err => Promise.reject(err));
                }

                const getRecordIndexes = function (rdType, components, indexes = []) {
                    let component = '';
                    try {
                        if (components.length <= 0) return Promise.resolve({ type: rdType, indexes: indexes });

                        if (rdType.isRecord === false) return Promise.reject(`Get record indexes failed. >>> Data type '${rdType.url}' is not a Record.`);

                        component = components.shift();
                        for (let iii = 0; iii < rdType.components.length; iii++) {
                            if (rdType.components[iii].name === component) {
                                indexes.push(iii + 1);
                                let t = RWS.getCachedSymbolType(rdType.components[iii].type.url);
                                if (typeof t === 'undefined') return Promise.reject(`Get record indexes failed. >>> Component '${component}' not found in Record '${rdType.type}'.`);

                                return getRecordIndexes(t, components, indexes);
                            }
                        }
                    } catch (error) {
                        o.writeDebug(`Get record indexes failed.\n${error}'`, 3)
                        return Promise.reject(`Get record indexes failed. >>> ${error}'`);
                    }

                    return Promise.reject(`Get record indexes failed. >>> Component '${component}' not found in Record '${rdType.type}'.`);
                }

                const fetchItem = function (indexes) {
                    return new Promise((resolve, reject) => {

                        let s = '{';
                        for (let iii = 0; iii < indexes.length; iii++) {
                            s += indexes[iii];
                            if (iii < indexes.length - 1) s += ',';
                        }
                        s += '}';
                        let url = `${getSymbolUrl()}${encodeURIComponent(s)}/data`;

                        return o.Network.get(url)
                            .then(res => {
                                let obj = parseJSON(res.responseText);
                                if (obj === undefined) return Promise.reject('Could not parse JSON.');

                                for (const item of obj.state) {
                                    if (item._type === "rap-data") {
                                        return resolve(item.value);
                                    }
                                }

                                reject(toStatus(`Data not found when fetching Rapid data item with index = ${indexes.toString()}.`));
                            })
                            .catch(err => reject(toStatus(`Error fetching Rapid data item with index = ${indexes.toString()}.`, err)));
                    });
                }

                const setItem = function (indexes, value) {
                    let url = null;
                    let body = null;
                    try {
                        let s = '{';
                        for (let iii = 0; iii < indexes.length; iii++) {
                            s += indexes[iii];
                            if (iii < indexes.length - 1) s += ',';
                        }
                        s += '}';
                        url = `${getSymbolUrl()}${encodeURIComponent(s)}/data`;
                        body = `value=${encodeURIComponent(value)}`;
                    }
                    catch (error) {
                        let s = `Failed to set item value. >>> ${error}`;
                        o.writeDebug(s);
                        return rejectWithStatus(s);
                    }

                    return o.Mastership.request()
                        .then(() => {
                            return o.Network.post(url, body)
                                .then(() => {
                                    return o.Mastership.release()
                                        .then(() => Promise.resolve("Value set!"))
                                        .catch(err => Promise.reject("Item value set but failed to release mastership. >>> " + err));
                                })
                                .catch(err => {
                                    let handled = false;
                                    let error = JSON.stringify(err);
                                    return o.Mastership.release()
                                        .then(() => {
                                            handled = true;
                                            return Promise.reject("Failed to set item value. >>> " + error);
                                        })
                                        .catch(err2 => {
                                            if (handled === true) {
                                                return Promise.reject(err2);
                                            } else {
                                                return Promise.reject("Failed to set item value. >>> " + error + " >>> Failed to release mastership. >>> " + JSON.stringify(err2));
                                            }
                                        });
                                });
                        })
                        .catch(err => rejectWithStatus('setItem failed.', err));
                }

                const fetchByItem = function () {
                    return new Promise((resolve, reject) => {

                        let s = '[';
                        let parts = [];

                        for (let iii = 1; iii <= dimensions[0]; iii++) {
                            let url = `${getSymbolUrl()}{${iii.toString()}}/data`;

                            parts.push(() => new Promise((resolve, reject) => {
                                o.Network.get(url)
                                    .then(res => {
                                        let obj = parseJSON(res.responseText);
                                        if (obj === undefined) return Promise.reject('Could not parse JSON.');

                                        for (const item of obj.state) {
                                            if (item._type === "rap-data") {
                                                s += item.value + ",";
                                                break;
                                            }
                                        }

                                        return resolve();
                                    })
                                    .catch(err => reject(`Error fetching Rapid data value >>> ${err}`));
                            }));
                        }

                        return parts.reduce((partChain, currentPart) => partChain.then(currentPart), Promise.resolve())
                            .then(() => {
                                symbolValue = s.slice(0,-1) + "]";
                                resolve("Fetched Data!");
                            })
                            .catch(err => reject(err));
                    });
                }

                /**
                 * Updates the properties of the symbol
                 * 
                 * @returns {Promise}    A Promise with a status message
                 */
                var refreshProperties = function () {
                    if (hasValidSetup === false) return Promise.reject(`Symbol path '${getSymbolUrl()}' not valid.`);

                    let url = getSymbolUrl() + '/properties';

                    return o.Network.get(url)
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (obj === undefined) return Promise.reject('Could not parse JSON.');

                            for (const item of obj._embedded.resources) {

                                if (item._type === 'rap-symproppers' || item._type === 'rap-sympropvar' || item._type === 'rap-sympropconstant') {
                                    if (item.symtyp === 'per') symbolType = 'persistent';
                                    else if (item.symtyp === 'con') symbolType = 'constant';
                                    else if (item.symtyp === 'var') symbolType = 'variable';
                                    else symbolType = item.symtyp;

                                    if (item.hasOwnProperty('local') && item.local.toLowerCase() === 'true') scope = 'local';
                                    else if (symbolType === 'persistent' && item.hasOwnProperty('taskpers') && item.taskpers.toLowerCase() === 'true') scope = 'task';
                                    else if (symbolType === 'variable' && item.hasOwnProperty('taskvar') && item.taskvar.toLowerCase() === 'true') scope = 'task';
                                    else scope = 'global';

                                    dataType = item.dattyp;
                                    dataTypeURL = item.typurl;
                                    dimensions = [];
                                    if (isNonEmptyString(item.dim.trim()) === true) {
                                        let splits = item.dim.trim().split(' ');
                                        for (const s of splits) {
                                            dimensions.push(parseInt(s));
                                        }
                                    }
                                    break;
                                }
                            }

                            if (dataType === null || dataTypeURL === null) {
                                return Promise.reject("Could not find symbol's data value in RWS response.");
                            }

                            return Promise.resolve();
                        })
                        .catch(err => rejectWithStatus('Failed getting properties.', err));
                }

                var callbacks = [];

                /**
                 * Adds a callback which will be called when the signal value changes if the signal is subscribed to
                 * 
                 * @param   {function}  callback    The callback function which is called when the signal changes with the new value as parameter
                 */
                this.addCallbackOnChanged = function (callback) {
                    if (typeof callback !== "function") throw new Error("callback is not a valid function");
                    callbacks.push(callback);
                }

                /**
                 * Calls all callback functions with the new value of the data
                 * 
                 * @param   {string}    newValue    Not used
                 */
                this.onchanged = function (newValue) {
                    this.fetch()
                        .then(() => {
                            for (let iii = 0; iii < callbacks.length; iii++) {
                                try {
                                    callbacks[iii](symbolValue);
                                } catch (error) {
                                    o.writeDebug(`Rapid.Data callback failed. >>> ${error.toString()}`, 3);
                                }
                            }
                        })
                        .catch(err => o.writeDebug(`Failed to get value for '${this.getTitle()}'. >>> ${err}`));
                }

                /**
                 * Gets the resource url for this data.
                 * 
                 * @returns {string}       A url to the subscribed resource
                 */
                this.getResourceString = function () {
                    return getSymbolUrl() + "/data;value";
                }

                const raiseEvent = async () => {
                    this.onchanged(null);
                }

                /**
                 * Subscribes to the symbol
                 * 
                 * @param   {boolean}       raiseInitial    Flag indicating if an initial event should be raised when the subscription is registered.
                 * @returns {Promise<{}>}                   A Promise with a status
                 */
                this.subscribe = function (raiseInitial = false) {
                    if (raiseInitial === true) return o.Subscriptions.subscribe([this], raiseEvent);

                    return o.Subscriptions.subscribe([this]);
                }

                /**
                 * Unsubscribes from the symbol
                 * 
                 * @returns {Promise<{}>}       A Promise with a status
                 */
                this.unsubscribe = function () {
                    return o.Subscriptions.unsubscribe([this]);
                }


                function getSymbolUrl() {
                    let url = "/rw/rapid/symbol/RAPID/";
                    url += isSharedModule === true ? encodeURIComponent(symbolName) : `${encodeURIComponent(taskName)}/${encodeURIComponent(moduleName)}/${encodeURIComponent(symbolName)}`;
                    return url;
                }
            }

            /*
             * 
             * 
             * 
             */
            function parsePointers(obj) {                
                let pcp = {};

                pcp.programPointer = {};
                pcp.motionPointer = {};

                for (const item of obj.state) {
                    if (item._type === "pcp-info" && item._title === "progpointer") {
                        pcp.programPointer['moduleName'] = item.hasOwnProperty('modulemame') ? item.modulemame : '';
                        pcp.programPointer['routineName'] = item.hasOwnProperty('routinename') ? item.routinename : '';
                        pcp.programPointer['beginPosition'] = item.hasOwnProperty('beginposition') ? item.beginposition : '';
                        pcp.programPointer['endPosition'] = item.hasOwnProperty('endposition') ? item.endposition : '';
                        pcp.programPointer['hasValue'] = pcp.programPointer['moduleName'] !== '' ||
                            pcp.programPointer['routineName'] !== '' ||
                            pcp.programPointer['beginPosition'] !== '' ||
                            pcp.programPointer['endPosition'] !== '';
                    }
                    if (item._type === "pcp-info" && item._title === "motionpointer") {
                        pcp.motionPointer['moduleName'] = item.hasOwnProperty('modulemame') ? item.modulemame : '';
                        pcp.motionPointer['routineName'] = item.hasOwnProperty('routinename') ? item.routinename : '';
                        pcp.motionPointer['beginPosition'] = item.hasOwnProperty('beginposition') ? item.beginposition : '';
                        pcp.motionPointer['endPosition'] = item.hasOwnProperty('endposition') ? item.endposition : '';
                        pcp.motionPointer['hasValue'] = pcp.motionPointer['moduleName'] !== '' ||
                            pcp.motionPointer['routineName'] !== '' ||
                            pcp.motionPointer['beginPosition'] !== '' ||
                            pcp.motionPointer['endPosition'] !== '';
                    }
                }

                return pcp;
            }

            /**
             * Gets a list of Task objects
             * 
             * @returns {Promise<[Task]>}       A Promise with a list of Task objects
             */
            this.getTasks = function () {
                return o.Network.get("/rw/rapid/tasks")
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let tasks = [];

                        for (const item of obj._embedded.resources) {
                            if (item._type === "rap-task-li") {
                                tasks.push(new Task(item.name));
                            }
                        }

                        return Promise.resolve(tasks);
                    })
                    .catch(err => rejectWithStatus('Error getting task list.', err));
            }

            /**
             * Gets a Task object
             * 
             * @param   {string}    taskName    The task name
             * @returns {Promise<Task>}         A Promise with the Task with retrieved properties
             */
            this.getTask = function (taskName) {

                let task = new Task(taskName);

                return task.getProperties()
                    .then(() => Promise.resolve(task))
                    .catch(err => Promise.reject(err));
            }

            /**
             * Gets program info for a task
             * 
             * @param   {string}        taskName    The module name
             * @returns {Promise<{}>}               A promise with a program info object
             */
            this.getProgramInfo = function (taskName) {
                return new Task(taskName).getProgramInfo();
            }

            /**
             * Gets module names for a task
             * 
             * @param   {string}        taskName    The task name
             * @returns {Promise<{}>}               A promise with a module names
             */
            this.getModuleNames = function (taskName) {
                return new Task(taskName).getModuleNames();
            }

            /**
             * Gets a Module object
             * 
             * @param   {string}    taskName        The task name
             * @param   {string}    moduleName      The module name
             * @returns {Promise<Module>}           The Module object with retrieved properties
             */
            this.getModule = function (taskName, moduleName) {
                let mod = new Module(taskName, moduleName);

                return mod.getProperties()
                    .then(() => Promise.resolve(mod))
                    .catch(err => Promise.reject(err));
            }

            /**
             * Gets the Data object of a symbol
             * 
             * @param   {string}    taskName    The module name
             * @param   {string}    moduleName  The module name
             * @param   {string}    symbolName  The symbol name
             * @returns {Promise<Data>}         The Data item with retrieved properties
             */
            this.getData = function (taskName, moduleName, symbolName) {
                let data = new Data(taskName, moduleName, symbolName);
                return data.getProperties()
                    .then(() => Promise.resolve(data))
                    .catch(err => Promise.reject(err));
            }

            /**
             * Sets the value of a symbol
             * 
             * @param   {string}    taskName        The task name
             * @param   {string}    moduleName      The module name
             * @param   {string}    symbolName      The symbol name
             * @param   {string}    value           The new value
             * @param   {...number} indexes         Optional indexes for setting specific items in arrays and records
             * @returns {Promise}                   A Promise with a status message
             */
            this.setDataValue = function (taskName, moduleName, symbolName, value, ...indexes) {
                return new Data(taskName, moduleName, symbolName).setRawValue(value, ...indexes);
            }

            /**
             * Gets the Data object of a symbol in a shared module
             * 
             * @param   {string}            symbolName  The symbol name
             * @returns {Promise<Data>}                 The Data item
             */
            this.getSharedData = function (symbolName) {
                let data = new Data(SHARED_TAG, SHARED_TAG, symbolName);
                return data.getProperties()
                    .then(() => Promise.resolve(data))
                    .catch(err => Promise.reject(err));
            }

            /**
             * Sets the value of a symbol
             * 
             * @param   {string}            symbolName  The symbol name
             * @param   {string}            value       The new value
             * @returns {Promise<{}>}                   A Promise with a status
             */
            this.setSharedDataValue = function (symbolName, value) {
                return new Data(SHARED_TAG, SHARED_TAG, symbolName).setRawValue(value);
            }

            /**
             * Gets the rapid execution state
             * 
             * @returns {Promise<string>}    The execution state
             */
            this.getExecutionState = () => {
                return o.Network.get("/rw/rapid/execution")
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let mode = null;

                        for (const item of obj.state) {

                            if (item._type === "rap-execution") {
                                mode = item.ctrlexecstate;
                                break;
                            }
                        }

                        if (mode === null) {
                            return Promise.reject('Could not find the execution state in RWS response');
                        }
                        return Promise.resolve(mode);
                    })
                    .catch(err => rejectWithStatus('Could not get the execution state.', err));
            }

            /**
             * Enum for regain modes
             */
            this.RegainModes = {
                continue: 'continue',
                regain: 'regain',
                clear: 'clear',
                enterConsume: 'enter_consume'
            }

            /**
             * Enum for execution modes
             */
            this.ExecutionModes = {
                continue: 'continue',
                stepIn: 'step_in',
                stepOver: 'step_over',
                stepOut: 'step_out',
                stepBackwards: 'step_backwards',
                stepToLast: 'step_to_last',
                stepToMotion: 'step_to_motion',
            }

            /**
             * Enum for cycle modes
             */
            this.CycleModes = {
                forever: 'forever',
                asIs: 'as_is',
                once: 'once',
            }

            /**
             * Enum for conditions
             */
            this.Conditions = {
                none: 'none',
                callChain: 'callchain',
            }

            /**
             * Starts the rapid execution
             * 
             * @param   {{}}                An object with propeties for the start command, as follows:
             *                                  {string} regainMode                 the regain mode, valid values: 'continue', 'regain', 'clear' or 'enter_consume'
             *                                  {string} executionMode              the execution mode, valid values: 'continue', 'step_in', 'step_over', 'step_out', 'step_backwards', 'step_to_last' or 'step_to_motion'
             *                                  {string} cycleMode                  the cycle mode, valid values: 'forever', 'as_is' or 'once'
             *                                  {string} condition                  condition, valid values: 'none' or 'call_chain'
             *                                  {boolean} stopAtBreakpoints         stop at breakpoints
             *                                  {boolean} enableByTSP               activate tasks as set in the task selection panel
             * @returns {Promise<{}>}       A Promise with a status
             */
            this.startExecution = ({
                regainMode = "continue",
                executionMode = "continue",
                cycleMode = "forever",
                condition = "none",
                stopAtBreakpoint = true,
                enableByTSP = true
            } = {}) => {

                const validRegainModes = { 'continue': 'continue', 'regain': 'regain', 'clear': 'clear', 'enter_consume': 'enterconsume'};
                const validExecutionModes = { 'continue': 'continue', 'step_in': 'stepin', 'step_over': 'stepover', 'step_out': 'stepout', 'step_backwards': 'stepback', 'step_to_last': 'steplast', 'step_to_motion': 'stepmotion' };
                const validCycleModes = { 'forever': 'forever', 'as_is': 'asis', 'once': 'once' };
                const validConditions = { 'none': 'none', 'call_chain': 'callchain' };

                if (validRegainModes.hasOwnProperty(regainMode) === false) rejectWithStatus("Illegal parameter 'regainMode'");
                if (validExecutionModes.hasOwnProperty(executionMode) === false) rejectWithStatus("Illegal parameter 'executionMode'");
                if (validCycleModes.hasOwnProperty(cycleMode) === false) rejectWithStatus("Illegal parameter 'cycleMode'");
                if (validConditions.hasOwnProperty(condition) === false) rejectWithStatus("Illegal parameter 'condition'");

                let body = "";
                body += "regain=" + encodeURIComponent(validRegainModes[regainMode]);
                body += "&execmode=" + encodeURIComponent(validExecutionModes[executionMode]);
                body += "&cycle=" + encodeURIComponent(validCycleModes[cycleMode]);
                body += "&condition=" + encodeURIComponent(validConditions[condition]);
                if (stopAtBreakpoint === true) body += "&stopatbp=enabled";
                else body += "&stopatbp=disabled";
                if (enableByTSP === true) body += "&alltaskbytsp=true";
                else body += "&alltaskbytsp=false";

                return o.Network.post('/rw/rapid/execution/start', body)
                    .then(() => Promise.resolve())
                    .catch(err => rejectWithStatus('Could not start execution.', err));
            }

            /**
             * Enum for stop modes
             */
            this.StopModes = {
                cycle: 'cycle',
                instruction: 'instruction',
                stop: 'stop',
                quickStop: 'quick_stop',
            }

            /**
             * Enum for task selection panel options
             */
            this.UseTSPOptions = {
                normal: 'normal',
                allTasks: 'all_tasks',
            }

            /**
             * Stops the rapid execution
             * 
             * @param   {{}}                An object with propeties for the stop command, as follows:
             *                                  {string} stopMode                 the stop mode, valid values: 'cycle', 'instruction', 'stop' or 'quick_stop'
             *                                  {string} useTSP                   the execution mode, valid values: 'normal', 'all_tasks'
             * @returns {Promise<{}>}       A Promise with a status
             */
            this.stopExecution = ({
                stopMode = 'stop',
                useTSP = 'normal'
            } = {}) => {
                const validStopModes = { 'cycle': 'cycle', 'instruction': 'instr', 'stop': 'stop', 'quick_stop': 'qstop' };
                const validUseTSPOptions = { 'normal': 'normal', 'all_tasks': 'alltask'};

                if (validStopModes.hasOwnProperty(stopMode) === false) rejectWithStatus("Illegal parameter 'stopMode'");
                if (validUseTSPOptions.hasOwnProperty(useTSP) === false) rejectWithStatus("Illegal parameter 'useTSP'");

                let body = '';
                body += 'stopmode=' + encodeURIComponent(validStopModes[stopMode]);
                body += '&usetsp=' + encodeURIComponent(validUseTSPOptions[useTSP]);
                return o.Network.post('/rw/rapid/execution/stop', body)
                    .then(() => Promise.resolve())
                    .catch(err => rejectWithStatus('Could not stop execution.', err));
            }

            /**
             * Reset PP (move to main)
             *
             * @returns {Promise<{}>}           A Promise with a status
             */
            this.resetPP = () => {
                let body = '';
                let hasMastership = false;
                let error = null;

                return requestMastership()
                    .then(() => {
                        hasMastership = true;
                        return o.Network.post("/rw/rapid/execution/resetpp", body);
                    })
                    .catch(err => {
                        if (hasMastership === true) {
                            error = err;
                            return Promise.resolve();
                        }

                        return rejectWithStatus("Failed to get Mastership.", err);
                    })
                    .then(() => releaseMastership())
                    .then(() => {
                        if (error !== null) return rejectWithStatus("Failed to reset PP.", error);
                        return Promise.resolve();
                    });
            }


            /**
             * Enum for symbol search method.
             */
            this.SearchMethods = {
                block: 1,
                scope: 2,
            }

            /**
             * Flag Enum for types of symbols that can be searched for.
             */
            this.SymbolTypes = {
                undefined: 0,
                constant: 1,
                variable: 2,
                persistent: 4,
                function: 8,
                procedure: 16,
                trap: 32,
                module: 64,
                task: 128,
                routine: 8 + 16 + 32,
                rapidData: 1 + 2 + 4,
                any: 255,
            }

            /**
             * Get default properties for a symbol search.
             *
             * @returns {{}}        An object with default settings.
             */
            this.getDefaultSearchProperties = () => {
                return {
                    isInstalled: false,
                    isShared: false,
                    method: this.SearchMethods.block,
                    searchURL: 'RAPID',
                    types: this.SymbolTypes.any,
                    recursive: true,
                    skipShared: false,
                    isInUse: false
                };
            }

            /**
             * Search data
             *
             * @param   {{}}                properties  A set of search properties, get a base set calling 'getDefaultSearchProperties' and modify as needed before calling 'searchSymbols'.
             * @param   {string}            dataType    The datatype to look for, can be empty.
             * @param   {string}            regexp      A regexp to filter by, can be empty.
             * @returns {Promise<[]>}                   A Promise with a list of variable scopes for the hit symbols
             */
            this.searchSymbols = (
                properties = this.getDefaultSearchProperties(),
                dataType = '',
                regexp = '') => {

                const rwsSymbolType = {
                    'con': 'constant',
                    'var': 'variable',
                    'per': 'pers',
                    'fun': 'function',
                    'prc': 'procedure',
                    'trp': 'trap',
                    'mod': 'module',
                    'tsk': 'task'
                };

                const checkProperties = (properties) => {
                    let errors = [];

                    const validProperties = ['isInstalled', 'isShared', 'method', 'searchURL', 'types', 'recursive', 'skipShared','isInUse'];
                    let keys = Object.keys(properties);
                    for (let iii = 0; iii < keys.length; iii++) {
                        if (validProperties.includes(keys[iii]) === false) errors.push(`Properties include unknown setting '${keys[iii]}'`);
                    }

                    if (properties.hasOwnProperty('isInstalled') !== true) {
                        errors.push("Search property 'isInstalled' is missing.");
                    } else {
                        if (typeof properties.isInstalled !== 'boolean') errors.push("Search property 'isInstalled' is invalid.");
                    }

                    if (properties.hasOwnProperty('isShared') !== true) {
                        errors.push("Search property 'isShared' is missing.");
                    } else {
                        if (typeof properties.isShared !== 'boolean') errors.push("Search property 'isShared' is invalid.");
                    }

                    if (properties.hasOwnProperty('method') !== true) {
                        errors.push("Search property 'method' is missing.");
                    } else {
                        if (properties.method !== this.SearchMethods.block &&
                            properties.method !== this.SearchMethods.scope) errors.push("Search property 'method' is invalid.");

                        if (properties.hasOwnProperty('searchURL') !== true) {
                            errors.push("Search property 'searchURL' is missing.");
                        } else {
                            if (typeof properties.searchURL !== 'string') errors.push("Search property 'searchURL' is invalid.");
                        }
                    }

                    if (properties.hasOwnProperty('types') !== true) {
                        errors.push("Search property 'types' is missing.");
                    } else {
                        if (typeof properties.types !== 'number') errors.push("Search property 'types' is invalid.");
                    }

                    if (properties.hasOwnProperty('recursive') !== true) {
                        errors.push("Search property 'recursive' is missing.");
                    } else {
                        if (typeof properties.recursive !== 'boolean') errors.push("Search property 'recursive' is invalid.");
                    }

                    if (properties.hasOwnProperty('skipShared') !== true) {
                        errors.push("Search property 'skipShared' is missing.");
                    } else {
                        if (typeof properties.skipShared !== 'boolean') errors.push("Search property 'skipShared' is invalid.");
                    }

                    if (properties.hasOwnProperty('isInUse') !== true) {
                        errors.push("Search property 'isInUse' is missing.");
                    } else {
                        if (typeof properties.isInUse !== 'boolean') errors.push("Search property 'isInUse' is invalid.");
                    }

                    return errors;
                }

                const getBodyText = (properties, dataType, regexp) => {
                    let text = ``;
                    if ((properties.method & this.SearchMethods.scope) == this.SearchMethods.scope) text = `view=scope`;
                    else if ((properties.method & this.SearchMethods.block) == this.SearchMethods.block) text = `view=block`;

                    text += `&blockurl=${encodeURIComponent(properties.searchURL)}`;

                    if ((properties.types & this.SymbolTypes.constant) == this.SymbolTypes.constant) text += `&symtyp=con`;
                    if ((properties.types & this.SymbolTypes.variable) == this.SymbolTypes.variable) text += `&symtyp=var`;
                    if ((properties.types & this.SymbolTypes.persistent) == this.SymbolTypes.persistent) text += `&symtyp=per`;
                    if ((properties.types & this.SymbolTypes.function) == this.SymbolTypes.function) text += `&symtyp=fun`;
                    if ((properties.types & this.SymbolTypes.procedure) == this.SymbolTypes.procedure) text += `&symtyp=prc`;
                    if ((properties.types & this.SymbolTypes.trap) == this.SymbolTypes.trap) text += `&symtyp=trp`;
                    if ((properties.types & this.SymbolTypes.module) == this.SymbolTypes.module) text += `&symtyp=mod`;
                    if ((properties.types & this.SymbolTypes.task) == this.SymbolTypes.task) text += `&symtyp=tsk`;
                    text += `&recursive=${properties.recursive.toString().toUpperCase()}`;
                    text += `&skipshared=${properties.skipShared.toString().toUpperCase()}`;
                    text += `&onlyused=${properties.isInUse.toString().toUpperCase()}`;
                    if (regexp !== '') text += `&regexp=${regexp}`;
                    if (dataType !== '') {
                        if (properties.isShared === true || properties.isInstalled === true) {
                            text += `&dattyp=${dataType}`;
                        } else {
                            let typurl = dataType.startsWith('/') ? dataType : `/${dataType}`;
                            typurl = typurl.toUpperCase().startsWith('/RAPID') ? typurl : encodeURIComponent(`RAPID${typurl}`);
                            text += `&typurl=${typurl}`;
                        }
                    }

                    return text;
                }

                const getSymbol = (item) => {

                    let symbol = {};

                    if (item.hasOwnProperty('name')) {
                        symbol['name'] = item['name'];
                    } else {
                        symbol['name'] = '';
                    }
                    if (item.hasOwnProperty('symburl')) {
                        symbol['scope'] = item['symburl'].split('/');
                    } else {
                        symbol['scope'] = [];
                    }
                    if (item.hasOwnProperty('symtyp')) {
                        if (rwsSymbolType.hasOwnProperty(item['symtyp'])) {
                            symbol['symbolType'] = rwsSymbolType[item['symtyp']];
                        } else {
                            symbol['symbolType'] = '';
                        }
                    } else {
                        symbol['symbolType'] = '';
                    }
                    if (item.hasOwnProperty('dattyp')) {
                        symbol['dataType'] = item['dattyp'];
                    } else {
                        symbol['dataType'] = '';
                    }

                    return symbol;
                }

                const doSearch = (url, body, symbols) => {
                    if (url === '') return Promise.resolve(symbols);

                    return o.Network.post(url, body)
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            if (obj._links.hasOwnProperty('next')) {
                                url = "/rw/rapid/" + obj._links['next'].href;
                            } else {
                                url = '';
                            }

                            for (const item of obj._embedded.resources) {
                                let sym = getSymbol(item);
                                symbols.push(sym);
                            }

                            return doSearch(url, body, symbols);
                        })
                        .catch(err => Promise.reject(err));
                }

                let errList = checkProperties(properties);
                if (errList.length > 0) {
                    let s = errList.reduce((a, c) => a + '\n' + c, '').trim();
                    return rejectWithStatus('Indata contains errors.', s);
                }

                let body = getBodyText(properties, dataType, regexp);

                let symbols = [];
                let url = "/rw/rapid/symbols/search";

                return doSearch(url, body, symbols)
                    .then(() => Promise.resolve(symbols))
                    .catch(err => rejectWithStatus('Failed to search symbols.', err));
            }
        }

        /**
         * The domain used for IO handling
         */
        o.IO = new function () {

            /**
             * IO-network object
             * 
             * @param   {string}    network    The network name
             */
            function Network(network) {
                var isUnassigned = network === UNASSIGNED_TAG;
                var networkPath = isUnassigned === true ? '' : `networks/${encodeURIComponent(network)}`;
                var networkName = isNonEmptyString(network) === true ? network : '';
                var physicalState = null;
                var logicalState = null;

                /**
                 * Gets the name of the network
                 * 
                 * @returns {string}    The network name
                 */
                this.getName = function () {
                    return networkName;
                }

                /**
                 * Gets the physical state of the network
                 * 
                 * @returns {Promise<string>}    A Promise with the physical state
                 */
                this.getPhysicalState = function () {
                    if (physicalState !== null) return Promise.resolve(physicalState);
                    return this.fetch()
                        .then(() => Promise.resolve(physicalState))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Gets the logical state of the network
                 * 
                 * @returns {Promise<string>}    A Promise with the logical state
                 */
                this.getLogicalState = function () {
                    if (logicalState !== null) return Promise.resolve(logicalState);
                    return this.fetch()
                        .then(() => Promise.resolve(logicalState))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Gets a Device object
                 * 
                 * @param   {string}            deviceName  The device name
                 * @returns {Promise<Device>}               A Promise with a Device object
                 */
                this.getDevice = function (deviceName) {
                    if (isUnassigned) return rejectWithStatus("Not allowed as Network is unassigned.");
                    return RWS.IO.getDevice(networkName, deviceName);
                }

                /**
                 * Updates the data of the network
                 * 
                 * @returns {Promise<{}>}           A Promise with a status
                 */
                this.fetch = function () {
                    if (isUnassigned) return rejectWithStatus("Network is not valid, as it is unassigned.");
                    return o.Network.get(`/rw/iosystem/${networkPath}`)
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            for (const item of obj._embedded.resources) {

                                if (item._type === "ios-network-li") {
                                    physicalState = item.pstate;
                                    logicalState = item.lstate;
                                    break;
                                }
                            }
                            return Promise.resolve();
                        })
                        .catch(err => rejectWithStatus('Failed updating network data.', err));

                }
            }

            /**
             * Internal factory method for Signal objects.
             * 
             * @param {string}      network
             * @param {string}      device
             * @param {string}      signal
             * @returns {Signal}                A Signal object
             */
            this.createSignal_internal = (network, device, signal) => {
                return new Signal(network, device, signal);
            }

            /**
             * IO-Device object
             * 
             * @param   {string}        network     The name of the network on which the signal resides
             * @param   {string}        device      The name of the device on which the signal resides
             */
            function Device(network, device) {

                var isUnassigned = network === UNASSIGNED_TAG || device === UNASSIGNED_TAG;
                var devicePath = isUnassigned === true ? "" : `devices/${encodeURIComponent(network)}/${encodeURIComponent(device)}`;

                var networkName = isNonEmptyString(network) === true ? network : '';
                var deviceName = isNonEmptyString(device) === true ? device : '';
                var physicalState = null;
                var logicalState = null;

                /**
                 * Gets the name of the device
                 * 
                 * @returns {string}   The device name
                 */
                this.getName = function () {
                    return deviceName;
                }

                /**
                 * Gets the name of the network that owns the device
                 * 
                 * @returns {string}   The network name
                 */
                this.getNetworkName = function () {
                    return networkName;
                }

                /**
                 * Gets the network that owns the device
                 * 
                 * @returns {Promise<Network>}   A Promise with a Network object
                 */
                this.getNetwork = function () {
                    return RWS.IO.getNetwork(networkName);
                }

                /**
                 * Gets the physical state of the network
                 * 
                 * @returns {Promise<string>}    A Promise with the physical state
                 */
                this.getPhysicalState = function () {
                    if (physicalState !== null) return Promise.resolve(physicalState);
                    return this.fetch()
                        .then(() => Promise.resolve(physicalState))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Gets the logical state of the network
                 * 
                 * @returns {Promise<string>}    A Promise with the logical state
                 */
                this.getLogicalState = function () {
                    if (logicalState !== null) return Promise.resolve(logicalState);
                    return this.fetch()
                        .then(() => Promise.resolve(logicalState))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Gets a Signal object
                 * 
                 * @param   {string}            signalName  The signal name
                 * @returns {Promise<Signal>}               A Promise with a Signal object
                 */
                this.getSignal = function (signalName) {
                    let signal = RWS.IO.createSignal_internal(networkName, deviceName, signalName);
                    return signal.fetch()
                        .then(() => Promise.resolve(signal))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Updates the data of the device
                 * 
                 * @returns {Promise<{}>}           A Promise with a status
                 */
                this.fetch = function () {
                    if (isUnassigned) return rejectWithStatus("Device is not valid, as it is unassigned.");
                    return o.Network.get(`/rw/iosystem/${devicePath}`)
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            for (const item of obj._embedded.resources) {

                                if (item._type === "ios-device-li") {
                                    physicalState = item.pstate;
                                    logicalState = item.lstate;
                                    break;
                                }
                            }
                            return Promise.resolve();
                        })
                        .catch(err => rejectWithStatus('Failed updating device data.', err));
                }

            }

            /**
             * IO-Signal object
             * 
             * @param   {string}        network     The name of the network on which the signal resides
             * @param   {string}        device      The name of the device on which the signal resides
             * @param   {string}        signal      The name of the signal
             */
            function Signal(network, device, signal,
                _category=null, _signalType=null, _signalValue=null, _isSimulated=null, _quality=null) {

                let isUnassigned = network === UNASSIGNED_TAG && device === UNASSIGNED_TAG;
                let signalPath = isUnassigned === true ? `${encodeURIComponent(signal)}` : `${encodeURIComponent(network)}/${encodeURIComponent(device)}/${encodeURIComponent(signal)}`;

                let networkName = isNonEmptyString(network) === true ? network : '';
                let deviceName = isNonEmptyString(device) === true ? device : '';
                let signalName = isNonEmptyString(signal) === true ? signal : '';

                let category = _category;
                let signalType = _signalType;
                let signalValue = _signalValue;
                let isSimulated = _isSimulated;
                let quality = _quality;

                /**
                 * Gets the path of the signal
                 * 
                 * @returns {string}    The path
                 */
                this.getPath = function () {
                    return signalPath
                }

                /**
                 * Gets the name of the signal
                 * 
                 * @returns {string}    The signal name
                 */
                this.getName = function () {
                    return signalName;
                }

                /**
                 * Gets the name of the network that owns the device that owns the signal
                 * 
                 * @returns {string}    The network name
                 */
                this.getNetworkName = function () {
                    return networkName;
                }

                /**
                 * Gets the name of the device that owns the signal
                 * 
                 * @returns {string}    The device name
                 */
                this.getDeviceName = function () {
                    return deviceName;
                }

                /**
                 * Gets the title of the signal
                 * 
                 * @returns {string}    The title
                 */
                this.getTitle = function () {
                    return signalName;
                }

                /**
                 * Gets the flag indicating if the signal is simulated.
                 * 
                 * @returns {Promise<string>}    A Promise with a flag indicating if signal is simulated.
                 */
                this.getIsSimulated = function () {
                    if (isSimulated !== null) return Promise.resolve(isSimulated);
                    return this.fetch()
                        .then(() => Promise.resolve(isSimulated))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Gets the quality of the signal's value
                 * 
                 * @returns {Promise<string>}    A Promise with the quality of the signal
                 */
                this.getQuality = function () {
                    if (quality !== null) return Promise.resolve(quality);
                    return this.fetch()
                        .then(() => Promise.resolve(quality))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Gets the category of the signal
                 * 
                 * @returns {Promise<string>}   A Promise with the category
                 */
                this.getCategory = function () {
                    if (category !== null) return Promise.resolve(category);
                    return this.fetch()
                        .then(() => Promise.resolve(category))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Gets the type of the signal
                 * 
                 * @returns {Promise<string>}   A Promise with the signal type as a string {DO|DI...}
                 */
                this.getType = function () {
                    if (signalType !== null) return Promise.resolve(signalType);
                    return this.fetch()
                        .then(() => Promise.resolve(signalType))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Gets the value of the signal
                 * 
                 * @returns {Promise<string>}   A Promise with the signal value
                 */
                this.getValue = function () {
                    if (signalValue !== null) return Promise.resolve(signalValue);
                    return this.fetch()
                        .then(() => Promise.resolve(signalValue))
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Gets the device that owns the signal
                 * 
                 * @returns {Promise<Device>}   A Promise with the Device object
                 */
                this.getDevice = function () {
                    if (isUnassigned) return rejectWithStatus("Not allowed as Signal is unassigned.");
                    return RWS.IO.getDevice(networkName, deviceName);
                }

                /**
                 * Updates the data of the signal
                 * 
                 * @returns {Promise<{}>}       A Promise with a status
                 */
                this.fetch = function () {
                    return o.Network.get(`/rw/iosystem/signals/${signalPath}`)
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            for (const item of obj._embedded.resources) {
                                if (item._type === "ios-signal-li") {

                                    signalType = item.type;

                                    if (signalType === 'AI' || signalType === 'AO') {
                                        signalValue = parseFloat(item.lvalue);
                                    } else {
                                        signalValue = parseInt(item.lvalue);
                                    }

                                    isSimulated = item.lstate === "simulated";
                                    quality = item.quality;
                                    category = item.category;
                                    break;
                                }
                            }
                            return Promise.resolve("Refreshed Signal.");
                        })
                        .catch(err => rejectWithStatus('Failed refreshing data.', err));
                }

                /**
                 * Sets the value of an IO-signal
                 * 
                 * @param   {number}            value   The new value
                 * @returns {Promise<{}>}               A Promise with a status
                 */
                this.setValue = (value) => {
                    let hasMastership = false;
                    let error = null;

                    return requestMastership()
                        .then(() => {
                            hasMastership = true;
                            return o.Network.post(`/rw/iosystem/signals/${signalPath}/set-value`, `lvalue=${encodeURIComponent(value)}`);
                        })
                        .catch(err => {
                            if (hasMastership === true) {
                                error = err;
                                return Promise.resolve();
                            }

                            return rejectWithStatus("Failed to get Mastership.", err);
                        })
                        .then(() => releaseMastership())
                        .then(() => {
                            if (error !== null) return rejectWithStatus("Failed to set value.", error);
                            return Promise.resolve();
                        });
                }

                var callbacks = [];

                /**
                 * Adds a callback which will be called when the signal value changes if the signal is subscribed to
                 * 
                 * @param   {function}  callback    The callback function which is called when the signal changes with the new value as parameter
                 */
                this.addCallbackOnChanged = function (callback) {
                    if (typeof callback !== "function") throw new Error("callback is not a valid function");
                    callbacks.push(callback);
                }

                /**
                 * Calls all callback functions with the new value of the signal
                 * 
                 * @param   {string}    newValue    The new value of the signal
                 */
                this.onchanged = function (newValue) {
                    let lvalue = '';
                    if (newValue.hasOwnProperty('lvalue')) lvalue = newValue['lvalue'];

                    if (this.signalType === 'AI' || this.signalType === 'AO') this.signalValue = parseFloat(lvalue);
                    else this.signalValue = parseInt(lvalue);

                    for (let iii = 0; iii < callbacks.length; iii++) {
                        try {
                            callbacks[iii](this.signalValue);
                        } catch (error) {
                            o.writeDebug(`IO.Signal callback failed. >>> ${error.toString()}`, 3);
                        }
                    }
                }

                /**
                 * Gets the resource url for this signal.
                 * 
                 * @returns {string}       A url to the subscribed resource
                 */
                this.getResourceString = function () {
                    return `/rw/iosystem/signals/${encodePath(signalPath)};state`;
                }

                const raiseEvent = async () => {

                    try {
                        await this.fetch();
                    } catch (error) {
                        o.writeDebug(`IO.Signal fetch failed. >>> ${error.toString()}`, 3);
                    }

                    for (let iii = 0; iii < callbacks.length; iii++) {
                        try {
                            callbacks[iii](signalValue);
                        } catch (error) {
                            o.writeDebug(`IO.Signal callback failed. >>> ${error.toString()}`, 3);
                        }
                    }                    
                }

                /**
                 * Subscribes to the signal
                 * 
                 * @param   {boolean}       raiseInitial    Flag indicating if an initial event should be raised when the subscription is registered.
                 * @returns {Promise<{}>}                   A Promise with a status
                 */
                this.subscribe = function (raiseInitial = false) {
                    if (raiseInitial === true) return o.Subscriptions.subscribe([this], raiseEvent);

                    return o.Subscriptions.subscribe([this]);
                }

                /**
                 * Unsubscribes from the signal
                 * 
                 * @returns {Promise<{}>}           A Promise with a status
                 */
                this.unsubscribe = function () {
                    return o.Subscriptions.unsubscribe([this]);
                }
            }

            /**
             * Gets a Signal object with retrieved properties
             * 
             * @param   {string}            signal      The name of the signal
             * @returns {Promise<Signal>}               The Signal object
             */
            this.getSignal = function (signal) {
                return this.searchSignals({ name: signal })
                    .then(x => {
                        if (x.length < 1) return rejectWithStatus("Error getting signal.", "Signal not found.");

                        let s = null;
                        for (let iii = 0; iii < x.length; iii++) {
                            if (x[iii].getName() === signal) {
                                s = x[iii];
                                break;
                            }
                        }
                        if (s === null) return rejectWithStatus("Error getting signal.", "Signal not found.");

                        return Promise.resolve(s);
                    })
                    .catch(err => Promise.reject(err));
            }

            /**
             * Sets the value of an IO-signal
             * 
             * @param   {string}            signal      The name of the signal
             * @param   {number}            value       The new value
             * @returns {Promise<{}>}                   A Promise with a status
             */
            this.setSignalValue = function (signal, value) {
                return this.getSignal(signal)
                    .then(x => x.setValue(value))
                    .catch(err => rejectWithStatus('Error setting signal.', err));
            }

            /**
             * Searches for signals
             * 
             * @param   {{}}        filter  The filter used when searching
             * @returns {[Signal]}          A list of Signal items that matches the filter
             * 
             * filter ={
             *      name: "<signal_name>"
             *      device: "<device_name>"
             *      network: "<network_name>"
             *      category: "<category_name>"
             *      category-pon: "<categorypon_name>"
             *      type: "<DO | DI | AO | AI | GI | GO>"
             *      invert: <true | false>
             *      blocked: <true | false>
             * }
             */
            this.searchSignals = (filter = {}) => {
                let body = "";

                const refObject = {
                    name: '',
                    device: '',
                    network: '',
                    category: '',
                    'category-pon': '',
                    type: '',
                    invert: true,
                    blocked: true
                };

                let s = verifyDataType(filter, refObject);
                if (s !== '') {
                    return rejectWithStatus('Failed searching signal.', s);
                }

                try {
                    Object.keys(filter).forEach((key) => {
                        body += `${key}=${encodeURIComponent(filter[key])}&`;
                    });
                    body = body.slice(0, -1);
                } catch (error) {
                    return rejectWithStatus('Failed searching signal.', error);
                }

                return o.Network.post("/rw/iosystem/signals/signal-search-ex", body, { "Accept": "application/hal+json;v=2.0" })
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let signals = []
                        for (const item of obj._embedded.resources) {
                            if (item._type === "ios-signal-li") {
                                let path = item._title.split("/");
                                let networkName = UNASSIGNED_TAG;
                                let deviceName = UNASSIGNED_TAG;
                                let signalName = '';
                                if (path.length === 1) {
                                    signalName = path[0];
                                } else if (path.length === 3) {
                                    networkName = path[0];
                                    deviceName = path[1];
                                    signalName = path[2];
                                } else {
                                    Console.error(`Illegal data: '${item._title}'`);
                                    continue;
                                }

                                let signalValue;
                                if (item.type === 'AI' || item.type === 'AO') {
                                    signalValue = parseFloat(item.lvalue);
                                } else {
                                    signalValue = parseInt(item.lvalue);
                                }

                                let signal = new Signal(networkName, deviceName, signalName,
                                    item.category, item.type, signalValue, item.lstate==="simulated", item.quality);

                                signals.push(signal)
                            }

                        }
                        return Promise.resolve(signals);
                    })
                    .catch(err => rejectWithStatus('Failed searching signal.', err));
            }

            /**
             * Gets a Network object
             * 
             * @param   {string}            networkName     The network name
             * @returns {Promise<Network>}                   A Promise with a Network object
             */
            this.getNetwork = function (networkName) {

                let url = "/rw/iosystem/networks";
                let body = `name=${encodeURIComponent(networkName)}`;

                return o.Network.post(url, body)
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        for (const item of obj._embedded.resources) {
                            if (item._type !== 'ios-network-li') continue;
                            if (item.name === networkName) {
                                let network = new Network(networkName);
                                return Promise.resolve(network);
                            }
                        }

                        return Promise.reject(`Network '${networkName}' not found.`);
                    })
                    .catch(err => rejectWithStatus('Failed to search networks.', err));                
            }

            /**
             * Gets a Device object
             * 
             * @param   {string}            networkName     The network name
             * @param   {string}            deviceName      The device name
             * @returns {Promise<Device>}                   A Promise with a Device object
             */
            this.getDevice = function (networkName, deviceName) {

                let url = '/rw/iosystem/devices';
                let body = `network=${encodeURIComponent(networkName)}&name=${encodeURIComponent(deviceName)}`;

                return o.Network.post(url, body)
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        for (const item of obj._embedded.resources) {
                            if (item._type !== 'ios-device-li') continue;
                            if (item.name === deviceName) {
                                let device = new Device(networkName, deviceName);
                                return Promise.resolve(device);
                            }
                        }

                        return Promise.reject(`Device '${deviceName}' not found on network '${networkName}'.`);
                    })
                    .catch(err => rejectWithStatus('Failed to search devices.', err));                
            }

        }

        /**
         * The domain used for configuration database handling
         */
        o.CFG = new function () {

            /**
             * CFG-domain object
             * 
             * @param   {string}    name    The domain name
             */
            function Domain(name) {
                var domainName = name;

                /**
                 * Gets the name of the domain
                 * 
                 * @returns {string}    The domain name
                 */
                this.getName = function () {
                    return domainName;
                }

                /**
                 * Gets the types in the domain
                 * 
                 * @returns {Promise<[Domain]>}   A Promise with the list of all types in the domain
                 */
                this.getTypes = function () {

                    const processGet = (url, instances) => {
                        if (url === '') return Promise.resolve(instances);

                        return o.Network.get(url)
                            .then(res => {
                                let obj = parseJSON(res.responseText);
                                if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                                if (obj._links.hasOwnProperty('next')) {
                                     url = "/rw/cfg/" + encodeURI(obj._links['next'].href);
                                } else {
                                    url = '';
                                }

                                for (const item of obj._embedded.resources) {
                                    if (item._type !== 'cfg-dt-li') continue;

                                    let i = new Type(this, item._title);                                    
                                    types.push(i);
                                }

                                return processGet(url, types);
                            })
                            .catch(err => Promise.reject(err));
                    }

                    let types = [];
                    let url = "/rw/cfg/" + encodeURIComponent(domainName);

                    return processGet(url, types)
                        .then(() => Promise.resolve(types))
                        .catch(err => rejectWithStatus('Failed to get types.', err));
                }

                /**
                 * Gets the instances in a type in the domain
                 * 
                 * @param   {string}    type            The type name
                 * @returns {Promise<[Instance]>}       A Promise with the list of all instances in a type
                 */
                this.getInstances = function (type) {
                    return new Type(this, type).getInstances();
                }

                /**
                 * Gets the instance of a type in the domain
                 * 
                 * @param   {string}            type        The config type name
                 * @param   {string}            name        The name of the config instance to be updated
                 * @returns {Promise<Instance>}             A Promise with instance of a type
                 */
                this.getInstanceByName = function (type, name) {
                    return new Type(this, type).getInstanceByName(name);
                }

                /**
                 * Gets the instance of a type in a domain
                 * 
                 * @param   {string}            type        The config type name
                 * @param   {string}            id          The instance id of the config instance to be updated
                 * @returns {Promise<Instance>}             A Promise with the instance
                 */
                this.getInstanceById = function (type, id) {
                    return new Type(this, type).getInstanceById(id);
                }

                /**
                 * Create an instance of a type in the domain
                 * 
                 * @param   {string}            type        The config type name
                 * @param   {string}            name        The name of the instance. The name can be omitted if the config type does not use name.
                 * @returns {Promise<{}>}                   A Promise with a status
                 */
                this.createInstance = function (type, name = "") {
                    return new Type(this, type).createInstance(name);
                }

                /**
                 * Update a list of attributes on an instance of a type
                 * 
                 * @param   {string}            type        The config type name
                 * @param   {string}            name        The name of the config instance to be updated
                 * @param   {{}}                attributes  The attributes list, items are name and value pair
                 * @returns {Promise<Instance>}             A Promise with the instance
                 */
                this.updateAttributesByName = function (type, name, attributes) {
                    return new Type(this, type).updateAttributesByName(name, attributes);
                }

                /**
                 * Update a list of attributes on an instance of a type
                 * 
                 * @param   {string}            type        The config type name
                 * @param   {string}            id          The instance id of the config instance to be updated
                 * @param   {{}}                attributes  The attributes list, items are name and value pair
                 * @returns {Promise<Instance>}             A Promise with the instance
                 */
                this.updateAttributesById = function (type, id, attributes) {
                    return new Type(this, type).updateAttributesById(id, attributes);
                }

                /**
                 * Save domain to file
                 *  
                 * @param   {string}            filePath    The file to save to.
                 * @returns {Promise<{}>}                   A Promise with a status
                 */
                this.saveToFile = function (filePath) {
                    let path = `/fileservice/${filePath}`;
                    let body = `filepath=${encodeURIComponent(path)}`;
                    return o.Network.post('/rw/cfg/' + encodePath(domainName) + '/saveas', body)
                        .then(() => Promise.resolve())
                        .catch(err => rejectWithStatus('Failed to save file.', err));
                }
            }

            /**
             * CFG-type object
             * 
             * @param   {Domain}    domain    The domain where type resides
             * @param   {string}    name      The type name
             */
            function Type(domain, name) {
                var parent = domain;
                var domainName = parent.getName();
                var typeName = name;

                /**
                 * Gets the name of the type
                 * 
                 * @returns {string}    The type name
                 */
                this.getName = function () {
                    return typeName;
                }

                /**
                 * Gets the name of the domain
                 * 
                 * @returns {string}    The domain name
                 */
                this.getDomainName = function () {
                    return domainName;
                }

                /**
                 * Gets the domain that owns the type
                 * 
                 * @returns {Domain}    The domain object
                 */
                this.getDomain = function () {
                    return parent;
                }

                /**
                 * Gets the instances in the type
                 * 
                 * @returns {Promise<[Instance]>}   A Promise with the list of all instances in the type
                 */
                this.getInstances = function () {

                    const getInstance = (item) => {
                        let id = item.instanceid;

                        let attributes = {};
                        let name = "";
                        for (var u = 0; u < item.attrib.length; u++) {
                            attributes[item.attrib[u]._title] = item.attrib[u].value;
                            if (typeof item.attrib[u]._title === "string" && item.attrib[u]._title.toLowerCase() === "name") name = item.attrib[u].value;
                        }
                        return new Instance(this, id, name, attributes);
                    }

                    const checkExists = (instances, instance) => {
                        for (const i of instances) {
                            if (i.getInstanceId() === instance.getInstanceId()) return true;
                        }

                        return false;
                    }

                    const processGet = (url, instances) => {
                        if (url === '') return Promise.resolve(instances);

                        return o.Network.get(url)
                            .then(res => {
                                let obj = parseJSON(res.responseText);
                                if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                                if (obj._links.hasOwnProperty('next')) {
                                    // ToDo Due to a bug in RWS we cannot use the 'next' link, we have to build our own url
                                    // url = "/rw/cfg/" + obj._links['next'].href;
                                    let splits = obj._links['next'].href.split('?');
                                    if (splits.length === 2) {
                                        url = "/rw/cfg/" + encodeURIComponent(domainName) + "/" + encodeURIComponent(typeName) + "/instances?" + splits[1];
                                    } else {
                                        url = '';
                                    }
                                } else {
                                    url = '';
                                }

                                // ToDo Due to a bug in RWS we must verify if there are resources, sometimes there is a 'next' link even if there are no more data
                                if (obj._embedded.resources.length === 0) url = '';

                                for (const item of obj._embedded.resources) {
                                    if (item._type !== 'cfg-dt-instance-li') continue;

                                    let i = getInstance(item);
                                    // ToDo Due to a bug in RWS we must check if the instance already has been added, as several pages can contain the instance
                                    if (checkExists(instances, i) === false) instances.push(i);
                                }

                                return processGet(url, instances);
                            })
                            .catch(err => Promise.reject(err));
                    }

                    let instances = [];
                    let url = "/rw/cfg/" + encodeURIComponent(domainName) + "/" + encodeURIComponent(typeName) + "/instances";

                    return processGet(url, instances)
                        .then(() => Promise.resolve(instances))
                        .catch(err => rejectWithStatus('Failed to get instances.', err));
                }

                /**
                 * Gets the instance by name
                 * 
                 * @param   {string}            name    The name of the config instance
                 * @returns {Promise}                   A Promise with the instance
                 */
                this.getInstanceByName = function (name) {
                    return o.Network.get("/rw/cfg/" + encodeURIComponent(domainName) + "/" + encodeURIComponent(typeName) + "/instances/" + encodeURIComponent(name))
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            let attributes = {};
                            let instanceName = "";
                            let instanceId = "";
                            for (const item of obj.state) {
                                if (item._type === "cfg-dt-instance") {
                                    instanceId = item.instanceid;
                                    for (var iii = 0; iii < item.attrib.length; iii++) {
                                        attributes[item.attrib[iii]._title] = item.attrib[iii].value;
                                        if (typeof item.attrib[iii]._title === "string" && item.attrib[iii]._title.toLowerCase() === "name") instanceName = item.attrib[iii].value;
                                    }
                                    break;
                                }
                            }

                            if (instanceName !== "") {
                                return Promise.resolve(new Instance(this, instanceId, instanceName, attributes));
                            }
                            else {
                                return Promise.reject("Incorrect instance returned.");
                            }

                        })
                        .catch(err => rejectWithStatus(`Could not get instance '${name}'.`, err));
                }

                /**
                 * Gets the instance with id
                 * 
                 * @param   {string}            id      The instance id of the config instance
                 * @returns {Promise}                   A Promise with the instance
                 */
                this.getInstanceById = function (id) {
                    return o.Network.get("/rw/cfg/" + encodeURIComponent(domainName) + "/" + encodeURIComponent(typeName) + "/instances/" + encodeURIComponent(id))
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            let attributes = {};
                            let instanceName = "";
                            let instanceId = "";
                            for (const item of obj.state) {
                                if (item._type === "cfg-dt-instance") {
                                    instanceId = item.instanceid;
                                    for (var iii = 0; iii < item.attrib.length; iii++) {
                                        attributes[item.attrib[iii]._title] = item.attrib[iii].value;
                                        if (typeof item.attrib[iii]._title === "string" && item.attrib[iii]._title.toLowerCase() === "name") instanceName = item.attrib[iii].value;
                                    }
                                    break;
                                }
                            }

                            if (instanceId !== "") {
                                return Promise.resolve(new Instance(this, instanceId, instanceName, attributes));
                            }
                            else {
                                return Promise.reject("Incorrect instance returned.");
                            }

                        })
                        .catch(err => Promise.reject(toStauts(`Could not get instance '${id}'.`, err)));
                }

                /**
                 * Creates a default instance
                 * 
                 * @param   {string}    name        The name of the instance. The name can be omitted if the config type does not use name.
                 * @returns {Promise<Instance>}     A Promise with the newly created Instance object.
                 */
                this.createInstance = function (name = "") {

                    let body = "name=";
                    let uri = "/rw/cfg/" + encodeURIComponent(domainName) + "/" + encodeURIComponent(typeName) + "/instances/create-default";

                    if (typeof name === 'string' && name !== "") {
                        body += name;
                    }

                    return o.Network.post(uri, body)
                        .then(x1 => Promise.resolve(x1))
                        .catch(err => rejectWithStatus('Failed to create instance.', err));
                }

                /**
                 * Update a list of attributes on an instance
                 *  
                 * @param   {string}            name        The name of the config instance to be updated
                 * @param   {{}}                attributes  The attributes list, items are name and value pair
                 * @returns {Promise<Instance>}             A Promise with the instance
                 */
                this.updateAttributesByName = function (name, attributes) {
                    return this.getInstanceByName(name)
                        .then(instance => {
                            let inst = instance.updateAttributes(attributes);
                            return Promise.resolve(inst);
                        })
                        .catch(err => rejectWithStatus('Could not update attributes.', err));
                }

                /**
                 * Update a list of attributes on an instance
                 *  
                 * @param   {string}            id          The instance id of the config instance to be updated
                 * @param   {{}}                attributes  The attributes list, items are name and value pair
                 * @returns {Promise<Instance>}             A Promise with the instance
                 */
                this.updateAttributesById = function (id, attributes) {
                    return this.getInstanceById(id)
                        .then(instance => {
                            let inst = instance.updateAttributes(attributes);
                            return Promise.resolve(inst);
                        })
                        .catch(err => rejectWithStatus('Could not update attributes.', err));
                }
            }

            /**
             * CFG-instance object
             * 
             * @param   {Type}      type            The Type the instance resides in
             * @param   {string}    id              The id of the instance
             * @param   {string}    name            The name of the instance
             * @param   {{}}        attributes      The attributes of the instance
             */
            function Instance(type, id, name, attributes) {
                var parent = type;
                var instanceId = id;
                var instanceName = name;
                var domainName = parent.getDomainName();
                var typeName = parent.getName();

                var instanceAttributes = attributes;

                /**
                 * Gets the id of the instance
                 * 
                 * @returns {number}    The id of the instance
                 */
                this.getInstanceId = function () {
                    return instanceId;
                }

                /**
                 * Gets the name of the instance
                 * 
                 * @returns {string}    The name of the instance
                 */
                this.getInstanceName = function () {
                    return instanceName;
                }

                /**
                 * Gets the name of the type that owns the instance
                 * 
                 * @returns {string}    The name of the parent type
                 */
                this.getTypeName = function () {
                    return typeName;
                }

                /**
                 * Gets the name of the type that owns the instance
                 * 
                 * @returns {Type}    The parent Type object
                 */
                this.getType = function () {
                    return parent;
                }

                /**
                 * Gets the attributes of the instance
                 * 
                 * @returns {{}}    The attributes of the instance
                 */
                this.getAttributes = function () {
                    return instanceAttributes;
                }

                /**
                 * Updates an attribute on the instance (on the controller)
                 * 
                 * @param   {{}}                attributes      The attributes list, items are name and value pair
                 * @returns {Promise<{}>}                       A Promise with a status
                 */
                this.updateAttributes = function (attributes) {
                    var body = "";

                    for (let item in attributes) {
                        body += item + "=" + encodeURIComponent("[" + attributes[item] + ",1]") + "&";
                    }

                    body = body.replace(/&$/g, "");

                    var uri = "/rw/cfg/" + encodeURIComponent(domainName) + "/" + encodeURIComponent(typeName) + "/instances/" + encodeURIComponent(instanceId);

                    return o.Network.post(uri, body)
                        .then(() => {
                            try {
                                for (let item in attributes) {
                                    if (instanceAttributes[item] !== undefined) {
                                        instanceAttributes[item] = attributes[item];
                                    }
                                    else {
                                        let s = instanceName == "" ? instanceId : instanceName;
                                        o.writeDebug("attribute '" + item + "' does not exist on instance '" + s + "'")
                                    }
                                }
                            } catch (error) {
                                o.writeDebug("Failed updating Instance object.");
                            }

                            return Promise.resolve();
                        })
                        .catch(err => rejectWithStatus('Failed updating attributes.', err));
                }
            }

            /**
             * Gets the domains
             * 
             * @returns {Promise}   A Promise with the list of all domains
             */
            this.getDomains = function () {
                return o.Network.get("/rw/cfg")
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let domains = [];

                        for (const item of obj._embedded.resources) {
                            if (item._type === "cfg-domain-li") {
                                domains.push(new Domain(item._title));
                            }
                        }

                        if (domains.length == 0) {
                            return Promise.reject("Could not find any domains in RWS response");
                        }
                        return Promise.resolve(domains);
                    })
                    .catch(err => rejectWithStatus('Failed getting domains.', err));
            }

            /**
             * Save domain to file
             *  
             * @param   {string}            domain      The domain to save
             * @param   {string}            filePath    The file to save to.
             * @returns {Promise<{}>}                   A Promise with the status
             */
            this.saveConfiguration = function (domain, filePath) {
                return new Domain(domain).saveToFile(filePath);
            }

            /**
             * Verify a cfg file.
             * NOTE! Not completely implemented as RWS behaves oddly. Do not use!
             *  
             * @param   {string}            filePath    The file to verify.
             * @param   {string}            action      The action type to verify for, valid values; "add", "replace", "add-with-reset"
             * @returns {Promise<{}>}                   A Promise with the status
             */
            this.verifyConfigurationFile = function (filePath, action = "add") {
                if (isNonEmptyString(filePath) === false) return rejectWithStatus("Invalid parameter 'filePath'.");

                if (typeof action === 'string') action = action.toLowerCase();
                if (action !== "add" && action !== "replace" && action !== "add-with-reset") return rejectWithStatus("Invalid parameter 'action'.");

                let body = `filepath=${encodeURIComponent(filePath)}&action-type=${encodeURIComponent(action)}`;

                return o.Network.post('/rw/cfg/validate', body)
                    .then(() => Promise.resolve())
                    .catch(err => rejectWithStatus(`Failed to verify the file '${filePath}'.`, err));
            }

            /**
             * Load configuration from file
             *  
             * @param   {string}            filePath    The file to verify.
             * @param   {string}            action      The action type to use for load, valid values; "add", "replace", "add-with-reset"
             * @returns {Promise<{}>}                   A Promise with the status
             */
            this.loadConfiguration = function (filePath, action = "add") {
                if (isNonEmptyString(filePath) === false) return rejectWithStatus("Invalid parameter 'filePath'.");
                if (typeof action === 'string') action = action.toLowerCase();
                if (action !== "add" && action !== "replace" && action !== "add-with-reset") return rejectWithStatus("Invalid parameter 'action'.");

                let body = `filepath=${encodeURIComponent(filePath)}&action-type=${encodeURIComponent(action)}`;

                return o.Network.post('/rw/cfg/load', body)
                    .then(res => {
                        let location = res.getResponseHeader('Location');
                        if (location !== null) {
                            return waitProgressCompletion(location, COMMON_TIMEOUT)
                                .then(code => getStatusCode(code))
                                .then(status => {
                                    if (status.severity.toLowerCase() === 'error') return Promise.reject({ message: 'Progress resource reported error.', controllerStatus: status });
                                    return Promise.resolve();
                                })
                                .catch(err => Promise.reject(err));
                        }

                        o.writeDebug('loadConfiguration: Failed to get the location of progress resource. The file will be loaded but the call returns before it has completed.', 2);
                        return Promise.resolve();
                    })
                    .catch(err => rejectWithStatus(`Failed to load the file '${filePath}'.`, err));
            }

            /**
             * Gets the types in a domain
             * 
             * @param   {string}    domain  The domain name
             * @returns {Promise<[Type]>}   A Promise with the list of all types in a domain
             */
            this.getTypes = function (domain) {
                return new Domain(domain).getTypes();
            }

            /**
             * Gets the instances in a type in a domain
             * 
             * @param   {string}    domain  The domain name
             * @param   {string}    type    The type name
             * @returns {Promise<[Instance]>}   A Promise with the list of all instances in a type
             */
            this.getInstances = function (domain, type) {
                return new Domain(domain).getInstances(type);
            }

            /**
             * Gets the instance of a type in a domain
             * 
             * @param   {string}            domain      The domain name
             * @param   {string}            type        The type name
             * @param   {string}            name        The name of the config instance to be updated
             * @returns {Promise<Instance>}             A Promise with the instance
             */
            this.getInstanceByName = function (domain, type, name) {
                return new Domain(domain).getInstanceByName(type, name);
            }

            /**
             * Gets the instance of a type in a domain
             * 
             * @param   {string}            domain      Config domain
             * @param   {string}            type        Config type
             * @param   {string}            id          The instance id of the config instance to be updated
             * @returns {Promise<Instance>}             A Promise with the instance
             */
            this.getInstanceById = function (domain, type, id) {
                return new Domain(domain).getInstanceById(type, id);
            }

            /**
             * Create an instance of a type in a domain
             * 
             * @param   {string}            domain      Config domain
             * @param   {string}            type        Config type
             * @param   {string}            name        The name of the instance. The name can be omitted if the config type does not use name.
             * @returns {Promise<{}>}                   A Promise with a status
             */
            this.createInstance = function (domain, type, name = "") {
                return new Domain(domain).createInstance(type, name);
            }

            /**
             * Update a list of attributes on an instance of a type in a domain
             * 
             * @param   {string}            domain      Config domain
             * @param   {string}            type        Config type
             * @param   {string}            name        The name of the config instance to be updated
             * @param   {{}}                attributes  a listof attributes, items are name and value pair
             * @returns {Promise<Instance>}             A Promise with the updated instance
             */
            this.updateAttributesByName = function (domain, type, name, attributes) {
                return new Domain(domain).updateAttributesByName(type, name, attributes);
            }

            /**
             * Update a list of attributes on an instance of a type in a domain
             * 
             * @param   {string}            domain      Config domain
             * @param   {string}            type        Config type
             * @param   {string}            id          The instance id of the config instance to be updated
             * @param   {{}}                attributes  The attributes list, items are name and value pair
             * @returns {Promise<Instance>}             A Promise with the updated instance
             */
            this.updateAttributesById = function (domain, type, id, attributes) {
                return new Domain(domain).updateAttributesById(type, id, attributes);
            }
        }

        /**
         * The domain used for Controller handling
         */
        o.Controller = new function () {

            const replacables = {
                'init': 'initializing',
                'motoron': 'motors_on',
                'motoroff': 'motors_off',
                'guardstop': 'guard_stop',
                'emergencystop': 'emergency_stop',
                'emergencystopreset': 'emergency_stop_resetting',
                'sysfail': 'system_failure',
                'INIT': 'initializing',
                'AUTO_CH': 'automatic_changing',
                'MANF_CH': 'manual_full_changing',
                'MANR': 'manual_reduced',
                'MANF': 'manual_full',
                'AUTO': 'automatic',
                'UNDEF': 'undefined'
            };

            const processString = function (text) {
                if (typeof text !== 'string' || text === null) return '';
                if (replacables.hasOwnProperty(text) === false) return text.toLowerCase();

                return replacables[text];
            }

            /**
             * Enum for Monitor resources
             */
            this.MonitorResources = {
                controllerState: 'controller-state',
                operationMode: 'operation-mode'
            }
            /**
             * A Monitoring object for subscriptions
             * 
             * @param   {string}    resource    The resource to monitor. Valid values: 'controller-state', 'operation-mode'
             * 
             */
            function Monitor(resource) {
                if (resource.toLowerCase() !== o.Controller.MonitorResources.controllerState && resource.toLowerCase() !== o.Controller.MonitorResources.operationMode) {
                    o.writeDebug('Unable to create Controller Monitor: Illegal resource.', 3);
                    return;
                }

                let resourceName = resource;

                const urls = {
                    'controller-state': '/rw/panel/ctrl-state',
                    'operation-mode': '/rw/panel/opmode'
                }

                const resourceStrings = {
                    'controller-state': '/rw/panel/ctrl-state',
                    'operation-mode': '/rw/panel/opmode'
                }

                var callbacks = [];

                /**
                 * Gets the title of the object
                 * 
                 * @returns {string}       An identifier for the object.
                 */
                this.getTitle = function () {
                    return urls[resourceName];
                }

                /**
                 * Gets the resource url for subscription.
                 * 
                 * @returns {string}       A url to the subscribed resource
                 */
                this.getResourceString = function () {
                    return resourceStrings[resourceName];
                }

                /**
                 * Adds a callback which will be called when the controller state changes
                 * 
                 * @param   {function}  callback    The callback function which is called when the controller state changes
                 */
                this.addCallbackOnChanged = function (callback) {
                    if (typeof callback !== "function") throw new Error("callback is not a valid function");
                    callbacks.push(callback);
                }

                /**
                 * Calls all callback functions with the new controller state
                 * 
                 * @param   {string}    newValue    The new controller state
                 */
                this.onchanged = function (newValue) {
                    let parsedValue = {};

                    switch (resourceName) {
                        case 'controller-state':
                            if (newValue.hasOwnProperty('ctrlstate')) parsedValue = processString(newValue['ctrlstate']);
                            break;
                        case 'operation-mode':
                            if (newValue.hasOwnProperty('opmode')) parsedValue = processString(newValue['opmode']);
                            break;
                        default:
                            parsedValue = '';
                    }

                    for (let iii = 0; iii < callbacks.length; iii++) {
                        try {
                            callbacks[iii](parsedValue);
                        } catch (error) {
                            o.writeDebug(`Controller.Monitor callback failed. >>> ${error.toString()}`, 3);
                        }
                    }
                }

                const raiseEvent = async () => {
                    const getValue = async () => {
                        let rawValue = await o.Network.get(urls[resourceName])
                            .then(x1 => {
                                let obj = parseJSON(x1.responseText);
                                if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                                return obj;
                            })
                            .catch(err => {
                                let s = JSON.stringify(err);
                                o.writeDebug(`Controller.raiseEvent failed getting value. >>> ${s}`);

                                return null;
                            });
                        if (rawValue === null) return null;

                        if (rawValue.hasOwnProperty('state') === false) return null;

                        let state = rawValue['state'][0];
                        let parsedValue = null;
                        switch (resourceName) {
                            case 'controller-state':
                                if (state.hasOwnProperty('ctrlstate')) parsedValue = processString(state['ctrlstate']);
                                break;
                            case 'operation-mode':
                                if (state.hasOwnProperty('opmode')) parsedValue = processString(state['opmode']);
                                break;
                            default:
                                o.writeDebug(`Unsupported resource '${resourceName}'`);
                        }

                        return parsedValue;
                    }

                    let value = await getValue();
                    if (value === null) return;

                    for (let iii = 0; iii < callbacks.length; iii++) {
                        try {
                            callbacks[iii](value);
                        } catch (error) {
                            o.writeDebug(`Controller.Monitor callback failed. >>> ${error.toString()}`, 3);
                        }
                    }
                }

                /**
                 * Subscribes to the controller state
                 * 
                 * @param   {boolean}       raiseInitial    Flag indicating if an initial event should be raised when the subscription is registered.
                 * @returns {Promise<{}>}                   A Promise with a status
                 */
                this.subscribe = function (raiseInitial = false) {
                    if (raiseInitial === true) return o.Subscriptions.subscribe([this], raiseEvent);

                    return o.Subscriptions.subscribe([this]);
                }

                /**
                 * Unsubscribes from the controller state
                 * 
                 * @returns {Promise<{}>}           A Promise with a status
                 */
                this.unsubscribe = function () {
                    return o.Subscriptions.unsubscribe([this]);
                }
            }

            /**
             * Gets a Monitor object for Rapid
             * 
             * @param   {string}    resource    The resource to monitor. Valid values: 'controller-state', 'operation-mode'
             *
             * @returns {Monitor}               A Monitor object for subscriptions
             */
            this.getMonitor = function (resource) {
                return new Monitor(resource);
            }

            /**
             * Gets the state of the controller
             * 
             * @returns {Promise<string>}   A Promise with the state
             */
            this.getControllerState = () => {

                return o.Network.get("/rw/panel/ctrl-state")
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let state = null;

                        for (const item of obj.state) {

                            if (item._type === "pnl-ctrlstate") {
                                state = processString(item.ctrlstate);
                                break;
                            }
                        }

                        if (state === null) {
                            return Promise.reject("Could not find the controller state in RWS response");
                        }
                        return Promise.resolve(state);
                    })
                    .catch((err) => rejectWithStatus('Could not get controller state.', err));
            }

            /**
             * Sets the state of the motors
             * 
             * @param   {string}            state   The new state of the motors
             * @returns {Promise<{}>}               A Promise with a status
             */
            this.setMotorsState = (state) => {
                let body = "ctrl-state=";
                if (typeof state === 'string' && state.toLowerCase() === 'motors_on') {
                    body += "motoron";
                }
                else if (typeof state === 'string' && state.toLowerCase() == 'motors_off') {
                    body += "motoroff";
                }
                else {
                    return rejectWithStatus('Unknown state.');
                }

                return o.Network.post("/rw/panel/ctrl-state", body)
                    .then(() => Promise.resolve())
                    .catch(err => rejectWithStatus('Could not set motors state.', err));
            }

            /**
             * Gets the operation mode of the controller
             * 
             * @returns {Promise}   A Promise with the operation mode
             */
            this.getOperationMode = () => {

                return o.Network.get("/rw/panel/opmode").then(
                    (req) => {
                        let obj = null;
                        try {
                            obj = JSON.parse(req.responseText);
                        } catch (error) {
                            return Promise.reject("Could not parse JSON.");
                        }

                        let mode = null;

                        for (const item of obj.state) {

                            if (item._type === "pnl-opmode") {
                                mode = processString(item.opmode);
                                break;
                            }
                        }

                        if (mode === null) {
                            return Promise.reject("Could not find the controller operation mode in RWS response");
                        }
                        return Promise.resolve(mode);
                    })
                    .catch(err => rejectWithStatus('Could not get controller operation mode.', err));
            }

            /**
             * Sets the operation mode of the controller
             * NOTE! This call will fail on RC as it is not yet implemented.
             * 
             * @param   {string}            mode    The new operation mode of the controller, valid values: "automatic", "manual" and "manual_full"
             * @returns {Promise<{}>}               A Promise with a status
             */
            this.setOperationMode = (mode) => {
                if (typeof mode !== 'string') return rejectWithStatus("Invalid parameter, 'mode' is not a string.");
                mode = mode.toLowerCase();

                let body = '';
                if (mode === 'automatic') body = 'opmode=auto';
                else if (mode === 'manual') body = 'opmode=man';
                else if (mode === 'manual_full') body = 'opmode=manf';
                else return rejectWithStatus(`Invalid parameter mode='${mode}'.`);

                return o.Network.post('/rw/panel/opmode', body)
                    .then(() => Promise.resolve())
                    .catch(err => rejectWithStatus('Could not set controller operation mode.', err));
            }

            /**
             * Enum for controller restart modes
             */
            this.RestartModes = {
                'restart': 'restart',
                'shutdown': 'shutdown',
                'bootApplication': 'boot_application',
                'resetSystem': 'reset_system',
                'resetRapid': 'reset_rapid',
                'revertToAutoSave': 'revert_to_auto',
            }

            /**
             * Restart the controller
             * 
             * @param   {string}            mode    The restart mode, valid values: 'restart', 'shutdown', 'boot_application', 'reset_system', 'reset_rapid' or 'revert_to_auto'
             * @returns {Promise<{}>}               A Promise with a status
             */
            this.restartController = (mode = 'restart') => {
                if (typeof mode !== 'string') return rejectWithStatus("Invalid parameter, 'mode' is not a string.");
                mode = mode.toLowerCase();

                let body = '';
                if (mode === 'restart') body = 'restart-mode=restart';
                else if (mode === 'shutdown') body = 'restart-mode=shutdown';
                else if (mode === 'boot_application') body = 'restart-mode=xstart';
                else if (mode === 'reset_system') body = 'restart-mode=istart';
                else if (mode === 'reset_rapid') body = 'restart-mode=pstart';
                else if (mode === 'revert_to_auto') body = 'restart-mode=bstart';
                else return rejectWithStatus(`'@{mode}' is not a valid restart mode.`);
                
                return o.Network.post("/ctrl/restart?mastership=implicit", body)
                    .then(() => Promise.resolve())
                    .catch(err => rejectWithStatus('Restart failed.', err));
            }

            /**
             * Get controller time
             * 
             * @param   {string}    variable    The name of the instance. The name can be omitted if the config type does not use name.
             * @returns {Promise<string>}       A Promise with the contents of the environment variable
             */
            this.getEnvironmentVariable = (variable) => {
                if (typeof variable !== "string") return rejectWithStatus('Illegal environment variable.');
                return o.Network.get(`/ctrl/${encodeURIComponent(variable)}`)
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let value = '';
                        for (const item of obj.state) {
                            if (item._type === "ctrl-env") {
                                value = item['value'];
                                break;
                            }
                        }

                        if (value === '') return Promise.reject("value not found.");

                        return Promise.resolve(value);

                    })
                    .catch(err => rejectWithStatus(`Could not get environment variable '${variable}'.`, err));
            }

            /**
             * Get controller time
             * 
             * @returns {Promise<string>}   A Promise with the time
             */
            this.getTime = () => {
                return o.Network.get("/ctrl/clock")
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let datetime = '';
                        for (const item of obj.state) {
                            if (item._type === "ctrl-clock-info") {
                                datetime = item['datetime'];
                                break;
                            }
                        }

                        if (datetime === '') return Promise.reject("'datetime' not found.");

                        return Promise.resolve(datetime);

                    })
                    .catch(err => rejectWithStatus('Could not get time.', err));
            }

            /**
             * Get controller timezone
             * 
             * @returns {Promise}   A Promise with the timezone information
             */
            this.getTimezone = () => {
                if (isVirtual === true) return rejectWithStatus(VC_NOT_SUPPORTED);

                return o.Network.get("/ctrl/clock/timezone")
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let timezone = '';
                        for (const item of obj.state) {
                            if (item._type === "ctrl-timezone") {
                                timezone = item.timezone;
                                break;
                            }
                        }

                        if (timezone === '') return Promise.reject("'ctrl-timezone' not found.");

                        return Promise.resolve(timezone);
                    })
                    .catch(err => rejectWithStatus('Could not get timezone.', err));
            }

            /**
             * Get controller identity
             * 
             * @returns {Promise<string>}   A Promise with the controllers identity
             */
            this.getIdentity = () => {
                return o.Network.get("/ctrl/identity")
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let identity = '';
                        for (const item of obj.state) {
                            if (item._type === "ctrl-identity-info") {
                                identity = item['ctrl-name'];
                                break;
                            }
                        }

                        if (identity === '') return Promise.reject("'ctrl-name' not found.");

                        return Promise.resolve(identity);

                    })
                    .catch(err => rejectWithStatus('Could not get identity.', err));
            }

            /**
             * Get network settings
             * 
             * @returns {Promise<[{}]>}   A Promise with the controllers network settings
             */
            this.getNetworkSettings = () => {
                if (isVirtual === true) return rejectWithStatus(VC_NOT_SUPPORTED);

                return o.Network.get("/ctrl/network")
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let settingsList = [];

                        for (const item of obj.state) {
                            if (item._type === 'ctrl-netw') {
                                let settings = {
                                    id: item.title,
                                    logicalName: item['logical-name'],
                                    network: item['network'],
                                    address: item['addr'],
                                    mask: item['mask'],
                                    primaryDNS: item['dns-primary'],
                                    secondaryDNS: item['dns-secondary'],
                                    DHCP: item['dhcp'].toLowerCase() === 'true',
                                    gateway: item['gateway']
                                };

                                settingsList.push(settings);
                            }
                        }

                        return Promise.resolve(settingsList);

                    })
                    .catch(err => rejectWithStatus('Could not get network settings.', err));
            }

            /**
             * Get network connections
             * 
             * @returns {Promise<{}>}   A Promise with the controllers network connections
             */
            this.getNetworkConnections = () => {
                if (isVirtual === true) return rejectWithStatus(VC_NOT_SUPPORTED);

                return o.Network.get("/ctrl/network/advanced")
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let connectionsList = [];

                        for (const item of obj.state) {
                            if (item._type === "ctrl-netw-adv") {
                                let connection = {
                                    id: item.title,
                                    MACAddress: item["mac-address"],
                                    connected: item["media-state"].toLowerCase() === 'plugged',
                                    enabled: item["enabled"].toLowerCase() === 'true',
                                    speed: item["speed"]
                                };

                                connectionsList.push(connection);
                            }
                        }

                        return Promise.resolve(connectionsList);

                    })
                    .catch(err => rejectWithStatus('Could not get network connections.', err));
            }

            /**
             * Verify that an option exists on system
             * 
             * @param   {string}            option  The option to look for, NOTE! this is case sensitive
             * @returns {Promise<boolean>}          A Promise with a boolean indicating if the option exists
             */
            this.verifyOption = (option) => {
                if (typeof option !== 'string' || option === '') return rejectWithStatus("Invalid parameter 'option'.");

                let uri = "/ctrl/options/" + encodeURIComponent(option);

                return o.Network.get(uri)
                    .then(() => Promise.resolve(true))
                    .catch(err => {
                        if (err.hasOwnProperty('httpStatus') && err.httpStatus.hasOwnProperty('code') && err.httpStatus.code === 404) return Promise.resolve(false);
                        else return rejectWithStatus('Failed to verify option.', err);
                    });
            }


            /**
             * Create backup
             * 
             * @param   {string}            path        The path where the backup is created including the backups name
             * @param   {number}            timeout     The time (in seconds) to wait for backup to finish
             * @returns {Promise<{}>}                   A Promise with the status of the backup process
             */
            this.createBackup = (path, timeout = 60) => {
                if (typeof path !== 'string' || path === '') return rejectWithStatus('Invalid path.');
                if (typeof timeout !== 'number' || timeout <= 0) return rejectWithStatus('Invalid timeout.');

                let p = `/fileservice/${path}`;
                let body = `backup=${encodeURIComponent(p)}`;

                return o.Network.post("/ctrl/backup/create", body)
                    .then(res => {
                        let location = res.getResponseHeader('Location');
                        if (location !== null) {
                            return waitProgressCompletion(location, timeout)
                                .then(code => getStatusCode(code))
                                .then(status => {
                                    if (status.severity.toLowerCase() === 'error') return Promise.reject({ message: 'Progress resource reported error.', controllerStatus: status });
                                    return Promise.resolve();
                                })
                                .catch(err => Promise.reject(err));
                        }

                        o.writeDebug('createBackup: Failed to get the location of progress resource. The backup will be created but the call returns before it has completed.', 2);
                        return Promise.resolve();
                    })
                    .catch(err => rejectWithStatus('Backup process failed.', err));
            }

            /**
             * Enum for controller settings verification
             */
            this.BackupIgnoreMismatches = {
                all: 'all',
                systemId: 'system-id',
                templateId: 'template-id',
                none: 'none'
            }

            /**
             * Enum for safety settings verification
             */
            this.BackupInclude = {
                all: 'all',
                cfg: 'cfg',
                modules: 'modules'
            }

            /**
             * Verify backup
             * 
             * @param   {string}            path        The path where the backup is created including the backups name
             * @param   {}                  anonymous   Options for the verify operation
             *                                              string ignoreMismatches, valid values: "all", "system-id", "template-id" and "none"
             *                                              boolean includeControllerSettings
             *                                              boolean includeSafetySettings
             *                                              string include, valid values: "cfg", "modules" and "all"
             * @returns {Promise<{}>}                   A Promise with the status of the backup process
             */
            this.verifyBackup = (path, {
                ignoreMismatches = this.BackupIgnoreMismatches.none,
                includeControllerSettings = true,
                includeSafetySettings = true,
                include = this.BackupInclude.all } = {}) => {

                const replacables = {
                    'ACCEPTED': 'ok',
                    'RESTORE_MISMATCH_SYSTEM_ID': 'system_id_mismatch',
                    'RESTORE_MISMATCH_TEMPLATE_ID': 'template_id_mismatch',
                    'DIR_NOT_COMPLETE': 'file_or_directory_missing',
                    'CFG_DATA_INCORRECT': 'cfg_file_corrupt'
                };

                const processString = function (text) {
                    if (typeof text !== 'string' || text === null) return '';
                    if (replacables.hasOwnProperty(text) === false) return text.toLowerCase();

                    return replacables[text];
                }

                if (typeof path !== "string" || path === "") return rejectWithStatus('Invalid path.');
                if (ignoreMismatches !== "all" && ignoreMismatches !== "system-id" && ignoreMismatches !== "template-id" && ignoreMismatches !== "none") return rejectWithStatus("Invalid parameter 'ignoreMismatches'.");
                if (typeof includeControllerSettings !== "boolean") return rejectWithStatus("Invalid parameter 'includeControllerSettings'.");
                if (typeof includeSafetySettings !== "boolean") return rejectWithStatus("Invalid parameter 'includeSafetySettings'.");
                if (include !== "cfg" && include !== "modules" && include !== "all") return rejectWithStatus("Invalid parameter 'include'.");

                let p = `/fileservice/${path}`;
                let body = `backup=${encodeURIComponent(p)}`;
                body += "&ignore=" + encodeURIComponent(ignoreMismatches);
                body += "&include-cs=" + encodeURIComponent(includeControllerSettings.toString());
                body += "&include-ss=" + encodeURIComponent(includeSafetySettings.toString());
                body += "&include=" + encodeURIComponent(include);

                return o.Network.post("/ctrl/backup/check-restore", body)
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let statuses = [];

                        for (const item of obj.state) {
                            if (item._type === "ctrl-checkrestore" && item['status'] !== "ACCEPTED") {
                                let status = {
                                    status: processString(item['status']),
                                    path: item['path'] === undefined ? "" : item['path']
                                };

                                statuses.push(status);
                            }
                        }

                        return Promise.resolve(statuses);
                    })
                    .catch(err => rejectWithStatus('Verify backup failed.', err));
            }

            /**
             * Restore backup
             * 
             * @param   {string}            path        The path for the backup to be restored
             * @param   {}                  anonymous   Options for the restore operation
             *                                              string ignoreMismatches, valid values: "all", "system-id", "template-id" and "none"
             *                                              boolean deleteDir
             *                                              boolean includeSafetySettings
             *                                              string include, valid values: "cfg", "modules" and "all"
             * @returns {Promise<string>}               A Promise with the progress location used for subscription
             */
            this.restoreBackup = (path, {
                ignoreMismatches = this.BackupIgnoreMismatches.none,
                deleteDir = true,
                includeSafetySettings = true,
                include = this.BackupInclude.all } = {}) => {

                if (typeof path !== "string" || path === "") return rejectWithStatus('Invalid path.');
                if (ignoreMismatches !== "all" && ignoreMismatches !== "system-id" && ignoreMismatches !== "template-id" && ignoreMismatches !== "none") return rejectWithStatus("Invalid parameter 'ignoreMismatches'.");
                if (typeof deleteDir !== "boolean") return rejectWithStatus("Invalid parameter 'deleteDir'.");
                if (typeof includeSafetySettings !== "boolean") return rejectWithStatus("Invalid parameter 'includeSafetySettings'.");
                if (include !== "cfg" && include !== "modules" && include !== "all") return rejectWithStatus("Invalid parameter 'include'.");

                let p = `/fileservice/${path}`;
                let body = `backup=${encodeURIComponent(p)}`;
                body += "&ignore=" + encodeURIComponent(ignoreMismatches);
                body += "&delete-dir=" + encodeURIComponent(deleteDir.toString());
                body += "&include-ss=" + encodeURIComponent(includeSafetySettings.toString());
                body += "&include=" + encodeURIComponent(include);

                return o.Mastership.request()
                    .then(() => {
                        return o.Network.post("/ctrl/backup/restore", body)
                            .then(() => Promise.resolve('Restore started.'))       // No need to release mastership as controller will restart.
                            .catch(err => {
                                return o.Mastership.release()
                                    .then(() => Promise.reject("Could not start restore. >>> " + err))
                                    .catch(err => Promise.reject("Could not start restore and failed to release mastership. >>> " + err));
                            });                            
                    })
                    .catch(err => rejectWithStatus('Failed to restore backup.', err));
            }

            /**
             * Compress file or directory
             * 
             * @param   {string}            srcPath     The path for the file or directory to be compressed
             * @param   {string}            destPath    The path where the compressed result is placed
             * @param   {number}            timeout     The time (in seconds) to wait for the process to finish
             * @returns {Promise<{}>}                   A Promise with a status 
             */
            this.compress = (srcPath, destPath, timeout = 60) => {
                if (typeof srcPath !== 'string' || srcPath === '') return rejectWithStatus("Invalid 'srcPath'.");
                if (typeof destPath !== 'string' || destPath === '') return rejectWithStatus("Invalid 'destPath'.");
                if (isNaN(timeout) == true || timeout < 0) return rejectWithStatus("Invalid 'timeout'.");

                let p1 = `/fileservice/${srcPath}`;
                let p2 = `/fileservice/${destPath}`;
                let body = `srcpath=${encodeURIComponent(p1)}&dstpath=${encodeURIComponent(p2)}`;

                return o.Network.post("/ctrl/compress", body)
                    .then(res => {
                        let location = res.getResponseHeader('Location');
                        if (location !== null) {
                            return waitProgressCompletion(location, timeout)
                                .then(code => getStatusCode(code))
                                .then(status => {
                                    if (status.severity.toLowerCase() === 'error') return Promise.reject({ message: 'Progress resource reported error.', controllerStatus: status });
                                    return Promise.resolve();
                                })
                                .catch(err => Promise.reject(err));
                        }

                        o.writeDebug('compress: Failed to get the location of progress resource. The file will be compressed but the call returns before it has completed.', 2);
                        return Promise.resolve();
                    })
                    .catch(err => rejectWithStatus('Failed to compress file.', err));
            }

            /**
             * Decompress file or directory
             * 
             * @param   {string}            srcPath     The path for the file or directory to be compressed
             * @param   {string}            destPath    The path where the compressed result is placed
             * @param   {number}            timeout     The time (in seconds) to wait for the process to finish
             * @returns {Promise<{}>}                   A Promise with a status
             */
            this.decompress = (srcPath, destPath, timeout = 60) => {
                if (typeof srcPath !== 'string' || srcPath === '') return Promise.reject("Invalid srcPath.");
                if (typeof destPath !== 'string' || destPath === '') return Promise.reject("Invalid destPath.");
                if (isNaN(timeout) == true || timeout < 0) return Promise.reject("timeout not valid.");

                let p1 = `/fileservice/${srcPath}`;
                let p2 = `/fileservice/${destPath}`;
                let body = `srcpath=${encodeURIComponent(p1)}&dstpath=${encodeURIComponent(p2)}`;

                return o.Network.post("/ctrl/decompress", body)
                    .then(res => {
                        let location = res.getResponseHeader('Location');
                        if (location !== null) {
                            return waitProgressCompletion(location, timeout)
                                .then(code => getStatusCode(code))
                                .then(status => {
                                    if (status.severity.toLowerCase() === 'error') return Promise.reject({ message: 'Progress resource reported error.', controllerStatus: status });
                                    return Promise.resolve();
                                })
                                .catch(err => Promise.reject(err));
                        }

                        o.writeDebug('decompress: Failed to get the location of progress resource. The file will be decompressed but the call returns before it has completed.', 2);
                        return Promise.resolve();
                    })
                    .catch(err => rejectWithStatus('Failed to decompress file.', err));
            }

            /**
             * Saves system diagnostics log
             * 
             * @param   {string}            destPath    The path where the diagnostics log is placed
             * @param   {number}            timeout     The time (in seconds) to wait for the process to finish
             * @returns {Promise<{}>}                   A Promise with a status
             */
            this.saveDiagnostics = (destPath, timeout = 60) => {
                if (isVirtual === true) return Promise.reject(VC_NOT_SUPPORTED);

                if (typeof destPath !== 'string' || destPath === '') return rejectWithStatus("Invalid 'destPath'.");
                if (isNaN(timeout) == true || timeout < 0) return rejectWithStatus("Invalid 'timeout'.");

                let p = `/fileservice/${destPath}`;
                let body = `dstpath=${encodeURIComponent(p)}`;

                return o.Network.post("/ctrl/diagnostics/save", body)
                    .then(res => {
                        let location = res.getResponseHeader('Location');
                        if (location !== null) {
                            return waitProgressCompletion(location, timeout)
                                .then(code => getStatusCode(code))
                                .then(status => {
                                    if (status.severity.toLowerCase() === 'error') return Promise.reject({ message: 'Progress resource reported error.', controllerStatus: status });
                                    return Promise.resolve();
                                })
                                .catch(err => Promise.reject(err));
                        }

                        o.writeDebug('saveDiagnostics: Failed to get the location of progress resource. The diagnostics will be saved but the call returns before it has completed.', 2);
                        return Promise.resolve();
                    })
                    .catch(err => rejectWithStatus('Failed to save diagnostics.', err));
            }
        }

        /**
         * The domain for file system related functionality.
         */
        o.FileSystem = new function () {

            const toDate = function (text) {
                try {
                    let t = text.replace(/[T]/g, '-');
                    t = t.replace(/[ ]/g, '');
                    t = t.replace(/[:]/g, '-');
                    let splits = t.split('-');

                    if (splits.length !== 6) {
                        throw new Error('Incorrect number of fields.');
                    }

                    for (let iii = 0; iii < splits.length; iii++) {
                        if (splits[iii] === '') {
                            throw new Error(`Field ${iii} is empty.`);
                        }
                    }

                    return new Date(splits[0], splits[1] - 1, splits[2], splits[3], splits[4], splits[5]);
                } catch (error) {
                    RWS.writeDebug(`Failed to convert '${text}' to date. >>> ${error}`);

                    return new Date();
                }
            }


            /**
             * Directory object
             * 
             * @param   {string}    path    The path for the directory object
             */
            function Directory(path = '$HOME') {
                let dirPath = path;
                let dirContents = {
                    directories: [],
                    files: []
                };
                let isDeleted = false;

                /**
                 * Gets the path of the directory.
                 * 
                 * @returns {string}    The path of the directory
                 */
                this.getPath = function () {
                    return dirPath;
                }

                /**
                 * Gets the properties of the file.
                 * 
                 * @returns {Promise<{}>}    The properties of the file
                 */
                this.getProperties = function () {
                    if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');

                    let path = dirPath.substring(0, dirPath.lastIndexOf("/"));
                    let dir = dirPath.substring(dirPath.lastIndexOf("/") + 1);

                    if (isNonEmptyString(path) === false) return rejectWithStatus('Could not get directory.');

                    return RWS.FileSystem.getDirectory(path)
                        .then(x1 => x1.getContents())
                        .then(x2 => {
                            for (let item of x2.directories) {
                                if (item.name === dir) return Promise.resolve(item);
                            }

                            return Promise.reject('Directory not found.');
                        })
                        .catch(err => rejectWithStatus(err));
                }

                /**
                 * Gets the contents of the directory.
                 * 
                 * @returns {Promise<{}>}    The contents of the directory
                 */
                this.getContents = function () {
                    if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');
                    if (dirContents !== null) return Promise.resolve(dirContents);
                    return this.fetch()
                        .then(() => Promise.resolve(dirContents))
                        .catch(err => rejectWithStatus(err));
                }
                
                /**
                 * Deletes the directory.
                 * 
                 * @returns {Promise<{}>}           A Promise with a status
                 */
                this.delete = function () {
                    if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');
                    if (isNonEmptyString(dirPath) === false) return rejectWithStatus("Directory's path is not a valid string.");

                    let path = `/fileservice/${encodePath(dirPath)}`;

                    return o.Network.delete(path)
                        .then(() => {
                            isDeleted = true;
                            return Promise.resolve();
                        })
                        .catch(err => rejectWithStatus('Failed deleting directory.', err));
                }

                /**
                 * Creates a directory.
                 * 
                 * @param {string}                  newDirectory    The name of the new directory
                 * @returns {Promise<Directory>}                    A Promise with the new Directory object
                 */
                this.create = function (newDirectory) {
                    if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');
                    if (isNonEmptyString(newDirectory) === false) return rejectWithStatus("New directory's name is not a valid string.");
                    if (isNonEmptyString(dirPath) === false) return rejectWithStatus("Directory's path is not a valid string.");

                    let path = `/fileservice/${encodePath(dirPath)}/create`;
                    let body = `fs-newname=${encodeURIComponent(newDirectory)}`;

                    return o.Network.post(path, body)
                        .then(() => this.fetch())
                        .then(() => RWS.FileSystem.getDirectory(`${dirPath}/${newDirectory}`))
                        .then(dir => Promise.resolve(dir))
                        .catch(err => rejectWithStatus('Failed creating directory.', err));
                }

                /**
                 * Creates a File object 
                 * 
                 * NOTE! This does not create the file physically on the file system, neither does it verify whether the file already exists or is valid in any respect. 
                 * Once the contents have been created it can be saved, which will create the file on the file system.
                 * 
                 * @param       {string}        fileName    The file's name
                 * @returns     {File}                      The File object 
                 */
                this.createFileObject = function (fileName) {
                    if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');
                    if (isNonEmptyString(fileName) === false) return rejectWithStatus("New file's name is not a valid string.");
                    if (isNonEmptyString(dirPath) === false) return rejectWithStatus("Directory's path is not a valid string.");

                    return RWS.FileSystem.createFileObject(`${dirPath}/${fileName}`);
                }

                /**
                 * Renames the directory.
                 * 
                 * @param {string}          newName     The new name of the directory
                 * @returns {Promise<{}>}               A Promise with a status
                 */
                this.rename = function (newName) {
                    if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');
                    if (isNonEmptyString(newName) === false) return rejectWithStatus("New directory's name is not a valid string.");
                    if (isNonEmptyString(dirPath) === false) return rejectWithStatus("Directory's path is not a valid string.");

                    let path = `/fileservice/${encodePath(dirPath)}/rename`;
                    let body = `fs-newname=${encodeURIComponent(newName)}`;

                    return o.Network.post(path, body)
                        .then(() => {
                            let splits = dirPath.split('/');
                            let path = '';

                            for (let iii = 0; iii < splits.length - 1; iii++) {
                                path += splits[iii] + '/';
                            }
                            dirPath = path + newName;
                            return Promise.resolve();
                        })
                        .catch(err => rejectWithStatus('Failed renaming directory.', err));
                }

                /**
                 * Copies the directory.
                 * 
                 * @param {string}          copyPath        The path and name of the new directory
                 * @param {boolean}         overwrite       A flag indicating if an existing file should be overwritten.
                 * @param {boolean}         relativePath    A flag indicating if the path is relative to the file copied or absolute.
                 * @returns {Promise<{}>}                   A Promise with a status
                 */
                this.copy = function (copyPath, overwrite, isRelativePath = true) {
                    if (isDeleted === true) return rejectWithStatus('Directory has been deleted.');
                    if (isNonEmptyString(copyPath) === false) return rejectWithStatus("New directory's name is not a valid string.");
                    if (isNonEmptyString(dirPath) === false) return rejectWithStatus("Directory's path is not a valid string.");
                    if (typeof overwrite !== 'boolean') return rejectWithStatus("Parameter 'overwrite' is not of valid type.");
                    if (typeof isRelativePath !== 'boolean') return rejectWithStatus("Parameter 'isRelativePath' is not of valid type.");

                    let path = `/fileservice/${encodePath(dirPath)}/copy`;
                    let body = '';

                    if (isRelativePath === true) {
                        body = `fs-newname=${encodeURIComponent(copyPath)}&fs-overwrite=${overwrite}`;
                    } else {
                        let p = `/fileservice/${copyPath}`;
                        body = `fs-newname=${encodeURIComponent(p)}&fs-overwrite=${overwrite}`;
                    }

                    return o.Network.post(path, body)
                        .then(() => Promise.resolve())
                        .catch(err => rejectWithStatus('Failed copying directory.', err));
                }

                /**
                 * Updates the contents of the Directory object.
                 * 
                 * @returns {Promise<{}>}           A Promise with a status
                 */
                this.fetch = function () {
                    if (isNonEmptyString(dirPath) === false) return rejectWithStatus("Directory's path is not a valid string.");

                    const getFile = (item) => {

                        let file = {};

                        if (item.hasOwnProperty('_title')) {
                            file['name'] = item['_title'];
                        } else {
                            file['name'] = '';
                            return file;
                        }

                        if (item.hasOwnProperty('fs-cdate')) {
                            file['created'] = toDate(item['fs-cdate']);
                        } else {
                            file['created'] = new Date();
                        }

                        if (item.hasOwnProperty('fs-mdate')) {
                            file['modified'] = toDate(item['fs-mdate']);
                        } else {
                            file['modified'] = new Date();
                        }

                        if (item.hasOwnProperty('fs-size')) {
                            file['size'] = parseFloat(item['fs-size']);
                        } else {
                            file['size'] = -1;
                        }

                        if (item.hasOwnProperty('fs-readonly')) {
                            file['isReadOnly'] = item['fs-readonly'].toUpperCase() == 'TRUE';
                        } else {
                            file['isReadOnly'] = false;
                        }

                        return file;
                    }

                    const getDirectory = (item) => {

                        let directory = {};

                        if (item.hasOwnProperty('_title')) {
                            directory['name'] = item['_title'];
                        } else {
                            directory['name'] = '';
                            return directory;
                        }

                        if (item.hasOwnProperty('fs-cdate')) {
                            directory['created'] = toDate(item['fs-cdate']);
                        } else {
                            directory['created'] = new Date();
                        }

                        if (item.hasOwnProperty('fs-mdate')) {
                            directory['modified'] = toDate(item['fs-mdate']);
                        } else {
                            directory['modified'] = new Date();
                        }

                        return directory;
                    }

                    const getContent = (url, content) => {
                        if (url === '') return Promise.resolve(content);

                        return o.Network.get(url)
                            .then(res => {
                                let obj = parseJSON(res.responseText);
                                if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                                if (obj._links.hasOwnProperty('next')) {
                                    url = `/fileservice/${encodePath(dirPath)}/${obj._links['next'].href}`;
                                } else {
                                    url = '';
                                }

                                for (const item of obj._embedded.resources) {
                                    if (item['_type'] === 'fs-file') {
                                        let file = getFile(item);
                                        content.files.push(file);
                                    } else if (item['_type'] === 'fs-dir') {
                                        let directory = getDirectory(item);
                                        content.directories.push(directory); 
                                    }
                                }

                                return getContent(url, content);
                            })
                            .catch(err => Promise.reject(err));
                    }

                    let content = { directories: [], files: [] };
                    let url = `/fileservice/${encodePath(dirPath)}`;

                    return getContent(url, content)
                        .then(res => {
                            dirContents = res;
                            isDeleted = false;
                            return Promise.resolve();
                        })
                        .catch(err => rejectWithStatus('Failed to fetch directory contents.', err));
                }
            }

            /**
             * File object
             * 
             * @param   {string}    path    The path for the file object
             */
            function File(path) {
                let filePath = path;
                let contentType = '';
                let contents = null;
                let isDeleted = false;

                /**
                 * Gets the type of the content.
                 * 
                 * NOTE! If content has not been retrieved, this will return an empty string.
                 * 
                 * @returns {string}    The type of the content
                 */
                this.getContentType = function () {
                    return contentType;
                }

                /**
                 * Gets the properties of the file.
                 * 
                 * @returns {Promise<{}>}    The properties of the file
                 */
                this.getProperties = function () {
                    if (isDeleted === true) return rejectWithStatus('File has been deleted.');

                    let dir = filePath.substring(0, filePath.lastIndexOf("/"));
                    let file = filePath.substring(filePath.lastIndexOf("/") + 1);

                    if (isNonEmptyString(dir) === false) return rejectWithStatus('Could not get directory.');

                    return RWS.FileSystem.getDirectory(dir)
                        .then(x1 => x1.getContents())
                        .then(x2 => {
                            for (let item of x2.files) {
                                if (item.name === file) return Promise.resolve(item);
                            }

                            return Promise.reject('File not found.');
                        })
                        .catch(err => rejectWithStatus(err));
                }

                /**
                 * Gets the contents of the file.
                 * 
                 * @returns {Promise<>}    The contents of the file
                 */
                this.getContents = function () {
                    if (isDeleted === true) return rejectWithStatus('File has been deleted.');
                    if (contents !== null) return Promise.resolve(contents);
                    return this.fetch()
                        .then(() => Promise.resolve(contents))
                        .catch(err => rejectWithStatus(err));
                }

                /**
                 * Sets the contents of the file.
                 * 
                 * @param   {any}       newContents     The contents of the file
                 * @returns {boolean}                   The status of the call
                 */
                this.setContents = function (newContents = '') {
                    if (isDeleted === true) {
                        writeDebug('File has been deleted.');
                        return false;
                    }
                    if (newContents === null) {
                        writeDebug('Contents can not be null.');
                        return false;
                    } 

                    contents = newContents;
                    return true;
                }

                /**
                 * Verifies if a file exists without downloading its contents.
                 * 
                 * @returns {Promise<boolean>}           A Promise with a boolean which is true if file exists, otherwise false.
                 */
                this.fileExists = function () {
                    let url = `/fileservice/${encodePath(filePath)}`;

                    return o.Network.head(url)
                        .then(() => {
                            isDeleted = false;
                            return Promise.resolve(true);
                        })
                        .catch(err => {
                            if (err.hasOwnProperty('httpStatus') === true && err.httpStatus.code === 404) {
                                return Promise.resolve(false);
                            }

                            return rejectWithStatus('Failed checking file exist.', err);
                        });
                }

                /**
                 * Saves the contents of the file.
                 * 
                 * @param {boolean}         overwrite   flag indicating whether existing file should be overwritten
                 * @param {boolean}         isBinary    flag indicating whether content is binary or text 
                 * @returns {Promise<{}>}               A Promise with a status
                 */
                this.save = async function (overwrite, isBinary = false) {
                    if (isDeleted === true) return rejectWithStatus('File has been deleted.');
                    if (isNonEmptyString(filePath) === false) return rejectWithStatus("File's path is not a valid string.");
                    if (typeof overwrite !== 'boolean') return rejectWithStatus("Parameter 'overwrite' is not of valid type.");
                    if (typeof isBinary !== 'boolean') return rejectWithStatus("Parameter 'isBinary' is not of valid type.");

                    let url = `/fileservice/${encodePath(filePath)}`;
                    let body = contents;

                    if (overwrite === false) {
                        let status = await this.fileExists()
                            .then(x1 => Promise.resolve(x1))
                            .catch(err => rejectWithStatus(`Save file failed.`, err));

                        if (status === true) return rejectWithStatus(`File '${filePath}' already exists.`);
                    }

                    let contentType = {};
                    if (isBinary === true) {
                        contentType['Content-Type'] = 'application/octet-stream;v=2.0';
                    } else {
                        contentType['Content-Type'] = 'text/plain;v=2.0';
                    }

                    return o.Network.send("PUT", url, contentType, body)                                                       
                        .then(() => Promise.resolve())
                        .catch(err => rejectWithStatus('Failed saving file.', err));
                }

                /**
                 * Deletes the file.
                 * 
                 * @returns {Promise<{}>}           A Promise with a status
                 */
                this.delete = function () {
                    if (isDeleted === true) return rejectWithStatus('File has been deleted.');
                    if (isNonEmptyString(filePath) === false) return rejectWithStatus("File's path is not a valid string.");

                    let path = `/fileservice/${encodePath(filePath)}`;

                    return o.Network.delete(path)
                        .then(() => {
                            isDeleted = true;
                            return Promise.resolve();
                        })
                        .catch(err => rejectWithStatus('Failed deleting file.', err));
                }

                /**
                 * Renames the file.
                 * 
                 * @param {string}          newName     The new name of the file
                 * @returns {Promise<{}>}               A Promise with a status
                 */
                this.rename = function (newName) {
                    if (isDeleted === true) return rejectWithStatus('File has been deleted.');
                    if (isNonEmptyString(newName) === false) return rejectWithStatus("New file's name is not a valid string.");
                    if (isNonEmptyString(filePath) === false) return rejectWithStatus("File's path is not a valid string.");

                    let path = `/fileservice/${encodePath(filePath)}/rename`;
                    let body = `fs-newname=${encodeURIComponent(newName)}`;

                    return o.Network.post(path, body)
                        .then(() => Promise.resolve())
                        .catch(err => rejectWithStatus('Failed renaming file.', err));
                }

                /**
                 * Copies the file.
                 * 
                 * @param {string}          copyName        The new name of the file
                 * @param {boolean}         overwrite       A flag indicating if an existing file should be overwritten.
                 * @param {boolean}         relativePath    A flag indicating if the path is relative to the file copied or absolute.
                 * @returns {Promise<{}>}                   A Promise with a status
                 */
                this.copy = function (copyName, overwrite, isRelativePath = true) {
                    if (isDeleted === true) return rejectWithStatus('File has been deleted.');
                    if (isNonEmptyString(copyName) === false) return rejectWithStatus("New file's name is not a valid string.");
                    if (typeof overwrite !== 'boolean') return rejectWithStatus("Parameter 'overwrite' is not of valid type.");
                    if (typeof isRelativePath !== 'boolean') return rejectWithStatus("Parameter 'isRelativePath' is not of valid type.");
                    if (isNonEmptyString(filePath) === false) return rejectWithStatus("File's path is not a valid string.");

                    let path = `/fileservice/${encodePath(filePath)}/copy`;
                    let body = '';

                    if (isRelativePath === true) {
                        body = `fs-newname=${encodeURIComponent(copyName)}&fs-overwrite=${overwrite}`;
                    } else {
                        let p = `/fileservice/${copyName}`;
                        body = `fs-newname=${encodeURIComponent(p)}&fs-overwrite=${overwrite}`;
                    }

                    return o.Network.post(path, body)
                        .then(() => Promise.resolve())
                        .catch(err => rejectWithStatus('Failed copying file.', err));
                }

                /**
                 * Updates the contents of the File
                 * 
                 * @returns {Promise<{}>}           A Promise with a status
                 */
                this.fetch = function () {
                    if (isNonEmptyString(filePath) === false) return rejectWithStatus("File's path is not a valid string.");

                    let path = `/fileservice/${encodePath(filePath)}`;

                    return o.Network.get(path)
                        .then(res => {
                            contentType = res.getResponseHeader('content-type');
                            contents = res.responseText;
                            isDeleted = false;
                            return Promise.resolve();
                        })
                        .catch(err => rejectWithStatus('Failed fetching contents.', err));
                }
            }

            /**
             * Gets a Directory object 
             * 
             * @param   {string}                directoryPath   The path to the directory, including directory's name
             * @returns {Promise<Directory>}                    A Promise with the Directory object with it's contents retrieved
             */
            this.getDirectory = function (directoryPath) {
                if (isNonEmptyString(directoryPath) === false) return rejectWithStatus(`Parameter 'directoryPath' is not a valid string.`);

                let directory = new Directory(directoryPath);
                return directory.fetch()
                    .then(() => Promise.resolve(directory))
                    .catch(err => Promise.reject(err));
            }

            /**
             * Creates a Directory 
             * 
             * @param   {string}                directoryPath   The path to the directory, including directory's name
             * @returns {Promise<Directory>}                    A Promise with the Directory object
             */
            this.createDirectory = function (directoryPath) {
                if (isNonEmptyString(directoryPath) === false) return rejectWithStatus(`Parameter 'directoryPath' is not a valid string.`);

                let replaced = directoryPath.replace('\\', '/');
                let path = replaced.substring(0, replaced.lastIndexOf('/'));
                let newDirectory = replaced.substring(replaced.lastIndexOf('/') + 1);

                let directory = new Directory(path);
                return directory.create(newDirectory);
            }

            /**
             * Gets a File object 
             * 
             * @param   {string}            filePath    The path to the file, including file's name
             * @returns {Promise<File>}                 A Promise with the File object with it's contents retrieved 
             */
            this.getFile = function (filePath) {
                if (isNonEmptyString(filePath) === false) return rejectWithStatus(`Parameter 'filePath' is not a valid string.`);

                let file = new File(filePath);
                return file.fetch()
                    .then(() => Promise.resolve(file))
                    .catch(err => Promise.reject(err));
            }

            /**
             * Creates a File object 
             * 
             * NOTE! This does not create the file physically on the file system, neither does it verify whether the file already exists or is valid in any respect. 
             * Once the contents have been created it can be saved, which will create the file on the file system.
             * 
             * @param       {string}            filePath    The path to the file, including file's name
             * @returns     {File}                          The File object
             */
            this.createFileObject = function (filePath) {
                if (isNonEmptyString(filePath) === false) return rejectWithStatus(`Parameter 'filePath' is not a valid string.`);

                return new File(filePath);
            }

        }

        /**
         * The domain used for Elog handling
         */
        o.Elog = new function () {

            /**
            * Enum for elog domains.
            */
            this.DomainId = {
                common: 0,
                operational: 1,
                system: 2,
                hardware: 3,
                program: 4,
                motion: 5,
                io: 7,
                user: 8,
                safety: 9,
                internal: 10,
                process: 11,
                configuration: 12,
                rapid: 15,
                connectedServices: 17,
            }
            /**
             * Elog-message object
             * 
             * @param   {number}    number      The event sequnce number
             * @param   {string}    language    The preferred language for texts, e.g. 'en', 'de', 'sv', ...
             */
            function Event(number, language = 'en') {
                var sequenceNumber = number;
                var languageId = language;
                var eventType = null;
                var timeStamp = null;
                var code = null;
                var title = null;
                var description = null;
                var consequences = null;
                var causes = null;
                var actions = null;
                var args = [];

                /**
                 * Gets the contents of the message
                 * NOTE! To save time this is not populated when the object is created, it is deferred until first use.
                 * 
                 * @returns {Promise<{}>}    The contents of the message
                 */
                this.getContents = function () {
                    if (this.isValid() === true) {
                        return Promise.resolve({
                            sequenceNumber: sequenceNumber,
                            eventType: eventType,
                            timeStamp: timeStamp,
                            code: code,
                            title: title,
                            description: description,
                            consequences: consequences,
                            causes: causes,
                            actions: actions,
                            arguments: args
                        });
                    }

                    return fetch()
                        .then(() => {
                            return Promise.resolve({
                                sequenceNumber: sequenceNumber,
                                eventType: eventType,
                                timeStamp: timeStamp,
                                code: code,
                                title: title,
                                description: description,
                                consequences: consequences,
                                causes: causes,
                                actions: actions,
                                arguments: args
                            });
                        })
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Gets the validity of the message's fields
                 * 
                 * @returns {boolean}    The verified state of the message
                 */
                this.isValid = function () {
                    if (typeof sequenceNumber !== 'number' || sequenceNumber < 0) return false;
                    if (typeof languageId !== 'string' || languageId === '') return false;
                    if (typeof eventType !== 'string' || eventType === null) return false;
                    if ((timeStamp instanceof Date) === false || timeStamp === null) return false;
                    if (typeof code !== 'number' || code === null) return false;
                    if (typeof title !== 'string' || title === null) return false;
                    if (typeof description !== 'string' || description === null) return false;
                    if (typeof consequences !== 'string' || consequences === null) return false;
                    if (typeof causes !== 'string' || causes === null) return false;
                    if (typeof actions !== 'string' || actions === null) return false;

                    return true;
                }

                /**
                 * Parses a string containing a date and time in the format "YYYY-MM-dd T hh:mm:ss" to a Date object.
                 * 
                 * @returns {Date}    The Date, null if parsing fails
                 */
                function parseDateTime(text) {
                    if (typeof text !== 'string' || text === '') return null;

                    try {
                        let s = text.replace(/[T]/g, '-');
                        s = s.replace(/[ ]/g, '');
                        s = s.replace(/[:]/g, '-');
                        let splits = s.split('-');

                        return new Date(splits[0], splits[1] - 1, splits[2], splits[3], splits[4], splits[5])
                    } catch (error) {
                        o.writeDebug("Failed parsing date.")
                        return null;
                    }
                }

                /**
                 * Reloads the event
                 * NOTE! The event does usually not need to be loaded more than once as the data is not dynamic
                 * 
                 * @returns {Promise<string>}        A Promise with a status message
                 */
                function fetch() {
                    if (typeof sequenceNumber !== 'number' || sequenceNumber < 0) return rejectWithStatus('Illegal sequence number.');
                    let url = `/rw/elog/seqnum/${encodeURIComponent(sequenceNumber)}?lang=${encodeURIComponent(languageId)}`;

                    return o.Network.get(url)
                        .then(res => {

                            if (res.status === 204) return Promise.reject(`Event with sequence number '${sequenceNumber}' not found.`);

                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            for (const item of obj.state) {
                                if (item._type === "elog-message") {
                                    switch (item.msgtype) {
                                        case '1':
                                            eventType = 'informational';
                                            break;
                                        case '2':
                                            eventType = 'warning';
                                            break;
                                        case '3':
                                            eventType = 'error';
                                            break;
                                        default:
                                            eventType = item.msgtype;
                                            break;
                                    }
                                    timeStamp = parseDateTime(item.tstamp);
                                    code = parseInt(item.code);
                                    title = item.title;
                                    description = item.desc;
                                    consequences = item.conseqs;
                                    causes = item.causes;
                                    actions = item.actions;

                                    if (item.hasOwnProperty('argv')) {
                                        for (const argument of item.argv) {
                                            args.push({
                                                type: argument.type,
                                                value: argument.value
                                            });
                                        }
                                    }

                                    break;
                                }
                            }

                            return Promise.resolve();
                        })
                        .catch(err => rejectWithStatus('Failed to get event info.', err));
                }
            }

            /**
             * Elog-domain object
             * 
             * @param   {number}    number    The domain number
             */
            function Domain(number) {
                var domainNumber = number;
                var bufferSize = -1;

                /**
                 * Gets the name of the domain
                 * 
                 * @returns {number}    The domain number
                 */
                this.getDomainNumber = function () {
                    return domainNumber;
                }

                /**
                 * Clear the Elog domain
                 * 
                 * @returns {Promise<{}>}       A Promise with the status
                 */
                this.clearElog = () => {
                    if (typeof domainNumber !== 'number' || domainNumber < 0) return rejectWithStatus('Illegal domain number.');

                    let body = '';
                    let url = `/rw/elog/${encodeURIComponent(domainNumber)}/clear`;

                    return o.Network.post(url, body)
                        .then(() => Promise.resolve())
                        .catch(err => rejectWithStatus('Failed to clear elog.', err));
                }

                /**
                 * Get number of events in the Elog domain
                 * 
                 * @returns {Promise<number>}           Promise with number of events in domain
                 */
                this.getNumberOfEvents = () => {
                    if (typeof domainNumber !== 'number' || domainNumber < 0) return rejectWithStatus('Illegal domain number.');

                    let url = `/rw/elog/${encodeURIComponent(domainNumber)}?resource=info`;

                    return o.Network.get(url)
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            let buffSize = 0;
                            let numOfEvents = 0;

                            for (const item of obj._embedded.resources) {
                                if (item._type === "elog-domain") {
                                    buffSize = item.buffsize;
                                    numOfEvents = item.numevts;
                                    break;
                                }
                            }

                            bufferSize = parseInt(buffSize);
                            numOfEvents = parseInt(numOfEvents);

                            return Promise.resolve(numOfEvents);
                        })
                        .catch(err => rejectWithStatus('Failed getting number of events.', err));
                }

                /**
                 * Gets the buffer size
                 * 
                 * @returns {Promise<number>}    The buffer size
                 */
                this.getBufferSize = function () {
                    if (typeof domainNumber !== 'number' || domainNumber < 0) return rejectWithStatus('Illegal domain number.');
                    if (bufferSize < 0) {
                        return this.getNumberOfEvents()
                            .then(() => Promise.resolve(bufferSize))
                            .catch(err => Promise.reject(err));
                    }

                    return Promise.resolve(bufferSize);
                }

                /**
                 * Get the events in the Elog domain
                 * 
                 * @param   {string}    language              The preferred language for texts, e.g. 'en', 'de', 'sv', ...
                 * @returns {Promise<{{number: Event}}>}      Promise with a dictionary of Events, key is sequence number, value is the Event
                 */
                this.getEvents = (language = 'en') => {
                    if (typeof domainNumber !== 'number' || domainNumber < 0) return rejectWithStatus('Illegal domain number.');

                    let events = {};

                    return this.getEventsPaged(language, 200, 1)
                        .then(x => {
                            for (let item in x.events) {
                                events[item] = x.events[item];
                            }

                            if (x.numberOfPages > 1) {
                                let calls = [];

                                for (let iii = 2; iii <= x.numberOfPages; iii++) {
                                    calls.push(this.getEventsPaged(language, 200, iii));
                                }

                                return Promise.all(calls)
                                    .then(res => {
                                        res.sort((a, b) => {
                                            return a.page - b.page;
                                        });

                                        for (let e of res) {
                                            for (let item in e.events) {
                                                events[item] = e.events[item];
                                            }
                                        }

                                        return Promise.resolve(events);
                                    })
                                    .catch(err => Promise.reject(err));
                            }

                            return Promise.resolve(events);
                        })
                        .catch(err => Promise.reject(err));
                }

                /**
                 * Get the events in the Elog domain
                 * 
                 * @param   {string}    language              The preferred language for texts, e.g. 'en', 'de', 'sv', ...
                 * @param   {num}       count                 The number of events per page, default is 50, max is 200
                 * @param   {num}       page                  The page to return, default is 1
                 * @returns {Promise<{{number: Event}}>}      Promise with a dictionary of Events, key is sequence number, value is the Event
                 */
                this.getEventsPaged = (language = 'en', count = 50, page = 1) => {
                    if (typeof domainNumber !== 'number' || domainNumber < 0) return rejectWithStatus('Illegal domain number.');
                    if (typeof count !== 'number' || count < 0) count = 50;
                    if (count > 200) count = 200;
                    if (typeof page !== 'number' || page < 0) return rejectWithStatus('Illegal page number.');

                    let url = `/rw/elog/${encodeURIComponent(domainNumber)}?start=${encodeURIComponent(page)}&limit=${encodeURIComponent(count)}`;

                    return o.Network.get(url)
                        .then(res => {
                            let obj = parseJSON(res.responseText);
                            if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                            let numOfPages = page;
                            if (obj._links.hasOwnProperty('last') === true) {
                                let splits = obj._links.last.href.split('?')[1].split('&');
                                for (let s of splits) {
                                    if (s.startsWith('start=')) {
                                        numOfPages = parseInt(s.replace('start=', ''));
                                        break;
                                    }
                                }
                            }

                            let events = {};

                            for (const item of obj._embedded.resources) {
                                if (item._type === "elog-message-li") {
                                    let splits = item._links.self.href.split('/');
                                    let seqNum = parseInt(splits[1]);

                                    events[seqNum] = new Event(seqNum, language);
                                }
                            }

                            return Promise.resolve({
                                page: page,
                                numberOfPages: numOfPages,
                                requestedCount: count,
                                events: events
                            });
                        })
                        .catch(err => rejectWithStatus('Failed getting events.', err));
                }

                // 
                // Subscriptions
                //
                var callbacks = [];

                /**
                 * Adds a callback which will be called when the contents of the subscribed elog domain changes.
                 * 
                 * @param   {function}  callback    The callback function which is called when the event occurs
                 */
                this.addCallbackOnChanged = function (callback) {
                    if (typeof callback !== "function") throw new Error("callback is not a valid function");
                    callbacks.push(callback);
                }

                /**
                 * Calls all callback functions with the new value of the data
                 * 
                 * @param   {string}    newValue    Sequence number to the new Event item
                 */
                this.onchanged = function (newValue) {

                    let seqnum = newValue['seqnum'];
                    let num = Number.parseInt(seqnum);
                    for (let iii = 0; iii < callbacks.length; iii++) {
                        try {
                            callbacks[iii](num);
                        } catch (error) {
                            o.writeDebug(`Elog.Domain callback failed. >>> ${error.toString()}`, 3);
                        }
                    }
                }

                /**
                 * Gets the tiltle of the domain
                 * 
                 * @returns {string}       An identifier for the domain
                 */
                this.getTitle = function () {
                    return `/rw/elog/${encodeURIComponent(domainNumber)}`;
                }

                /**
                 * Gets the resource url for this data.
                 * 
                 * @returns {string}       A url to the subscribed resource
                 */
                this.getResourceString = function () {
                    return `/rw/elog/${encodeURIComponent(domainNumber)}`;
                }

                /**
                 * Subscribes to the domain
                 * 
                 * @returns {Promise<{}>}       A Promise with a status
                 */
                this.subscribe = function () {
                    return o.Subscriptions.subscribe([this]);
                }

                /**
                 * Unsubscribes from the domain
                 * 
                 * @returns {Promise<{}>}       A Promise with a status
                 */
                this.unsubscribe = function () {
                    return o.Subscriptions.unsubscribe([this]);
                }
            }

            /**
             * Clear all Elog domains
             * 
             * @returns {Promise<{}>}   A Promise with the status
             */
            this.clearElogAll = () => {
                return o.Network.post("/rw/elog/clearall")
                    .then(() => Promise.resolve())
                    .catch(err => rejectWithStatus('Failed to clear elogs.', err));
            }

            /**
             * Clear Elog domain
             * 
             * @param   {number}            domainNumber    The domain number
             * @returns {Promise<{}>}                   A Promise with the status
             */
            this.clearElog = (domainNumber) => {
                return new Domain(domainNumber).clearElog();
            }

            /**
             * Get buffer size for a domain
             * 
             * @param   {number}            domainNumber    The domain number
             * @returns {Promise<number>}                   A Promise with the buffer size
             */
            this.getBufferSize = (domainNumber) => {
                return new Domain(domainNumber).getBufferSize();
            }

            /**
             * Get number of messages for a domain
             * 
             * @param   {number}    domainNumber        The domain number
             * @returns {Promise}                       A Promise with the number of events
             */
            this.getNumberOfEvents = (domainNumber) => {
                return new Domain(domainNumber).getNumberOfEvents();
            }

            /**
             * Get all events for a domain
             * NOTE! The Event objects returned are not valid until getContents() have been called.
             * 
             * @param   {number}    domainNumber                The domain number
             * @param   {string}    language                    The preferred language for texts, e.g. 'en', 'de', 'sv', ...
             * @returns {Promise<{{number: Event}}>}            A Promise with a dictionary of Events, key is sequence number, value is the Event. 
             */
            this.getEvents = (domainNumber, language = 'en') => {
                return new Domain(domainNumber).getEvents(language);
            }

            /**
             * Get events for a domain
             * 
             * @param   {number}    domainNumber                The domain number
             * @param   {string}    language                    The preferred language for texts, e.g. 'en', 'de', 'sv', ...
             * @param   {number}    count                       The number of events to get, max 200
             * @param   {number}    page                        The number of the page to get
             * @returns {Promise<{{number: Event}}>}            A Promise with a dictionary of Events, key is sequence number, value is the Event
             */
            this.getEventsPaged = (domainNumber, language = 'en', count = 50, page = 1) => {
                return new Domain(domainNumber).getEventsPaged(language, count, page);
            }

            /**
             * Get an event message
             * 
             * @param   {number}    sequenceNumber      The event's sequnce number
             * @param   {string}    language            The preferred language for texts, e.g. 'en', 'de', 'sv', ...
             * @returns {Event}                         A new Event that has not been evaluated
             */
            this.getEvent = (sequenceNumber, language = 'en') => {
                return new Event(sequenceNumber, language);
            }

            /**
             * Gets an object for the domain
             * 
             * @param   {number}    domainNumber        The number of the domain to create object for.
             * @returns {Domain}                        The Domain
             */
            this.getDomain = function (domainNumber) {
                return new Domain(domainNumber);
            }
        }

        /**
         * The domain used for UAS handling
         */
        o.UAS = new function () {

            let currentUserInfo = null;

            /**
             * Gets information about the currently logged in user.
             * NOTE! Currently this operation requires that the logged in user has UAS_UAS_ADMINISTRATION grant.
             *
             * @returns {Promise<{}>}          A Promise with an object containg information
             */
            this.getUser = () => {
                if (currentUserInfo !== null) return Promise.resolve(currentUserInfo);

                return o.Network.get("/users/login-info")
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let info = {};
                        for (const item of obj.state) {
                            if (item._type === "user-login-info") {
                                info['alias'] = item['user-alias'];
                                info['name'] = item['user-name'];
                                info['locale'] = item['user-locale'].toLowerCase();
                                info['application'] = item['user-application'];
                                info['location'] = item['user-location'];
                                break;
                            }
                        }
                        if (Object.keys(info).length !== 5) throw new Error('Could not get complete user info.');

                        currentUserInfo = info;

                        return Promise.resolve(currentUserInfo);
                    })
                    .catch(err => rejectWithStatus('Failed to get user info.', err));
            }


            /**
             * Gets all the defined grants available in the system
             * 
             * @returns {Promise<{}>}   A Promise with a dictionary of grants
             */
            this.getGrants = () => {
                return o.Network.get("/uas/grants")
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let grants = {};
                        for (const item of obj.state) {
                            if (item._type === "grant-info") {

                                let grant = {};
                                grant['reference'] = item['grant-name'];
                                grant['name'] = item['display-name'];
                                grant['description'] = item['grant-description'];

                                grants[item['grant-name']] = grant;
                            }
                        }

                        return Promise.resolve(grants);
                    })
                    .catch(err => rejectWithStatus('Failed to get grants.', err));
            }

            /**
             * Verifies if the currently logged on user has a grant
             * NOTE! Currently this operation requires that the logged in user has UAS_UAS_ADMINISTRATION grant.
             * 
             * @param   {string}                grant       The grant to check
             * @returns {Promise<boolean>}                  A Promise with the response
             */
            this.hasGrant = (grant) => {
                if (isNonEmptyString(grant) === false) return rejectWithStatus("Failed to verify grant", "Inparameter 'grant' is not a valid string.");

                return o.Network.get(`/users/grant-exists?grant=${encodeURIComponent(grant)}`)
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        let status = false;
                        for (const item of obj.state) {
                            if (item._type === "user-grant-status") {
                                status = item['status'].toLowerCase() === 'true';
                                break;
                            }
                        }

                        return Promise.resolve(status);
                    })
                    .catch(err => {
                        if (err.hasOwnProperty('httpStatus') && err.httpStatus.code === 400) {
                            if (err.hasOwnProperty('controllerStatus') && err.controllerStatus.name === 'SYS_CTRL_E_INVALID_GRANT') {
                                return Promise.resolve(false);
                            }
                        }
                        return rejectWithStatus('Failed to verify grant.', err);
                    });
            }

            /**
             * Verifies if the currently logged on user has a role.
             * NOTE! Currently this operation requires that the logged in user has UAS_UAS_ADMINISTRATION grant.
             *
             * @param   {string}            role    The role to check.
             * @returns {Promise<boolean>}          A Promise with the response
             */
            this.hasRole = (role) => {
                if (isNonEmptyString(role) === false) return rejectWithStatus("Failed to verify role", "Inparameter 'role' is not a valid string.");

                return this.getUser()
                    .then(() => o.Network.get(`/uas/users/${encodeURIComponent(currentUserInfo.name)}/roles`))
                    .then(res => {
                        let obj = parseJSON(res.responseText);
                        if (typeof obj === 'undefined') return Promise.reject('Could not parse JSON.');

                        for (const item of obj.state) {
                            if (item._type === "user-role") {
                                if (item['rolename'].toLowerCase() === role.toLowerCase()) return Promise.resolve(true);
                            }
                        }

                        return Promise.resolve(false);
                    })
                    .catch(err => rejectWithStatus('Failed to verify role.', err));
            }
        }

        /**
         * The domain used for Subscription handling
         */
        o.Subscriptions = new function () {
            var websocket = null;
            var websocketLocation = null;
            var subscriptionGroup = null;
            var currentSubscriptions = {};
            var timeoutID = null;

            const SOCKET_CLOSE_INTERVAL = 500;
            const SOCKET_CLOSE_RETRY_COUNT = 20;

            const wait = (time) => new Promise(resolve => setTimeout(resolve, time));
            const waitSocketRemoved = async (loops) => {
                if (loops <= 0) return Promise.reject("WebSocket closing timeout.");
                if (websocket === null) return Promise.resolve();

                if (websocket !== null && (websocket.readyState === WebSocket.CLOSED || websocket.readyState === WebSocket.CLOSING)) {
                    await wait(SOCKET_CLOSE_INTERVAL)
                        .then(() => waitSocketRemoved(loops - 1));
                }
            }

            this.connectWebsocket = () => {
                return new Promise((resolve, reject) => {
                    if (websocketLocation == null || subscriptionGroup == null) {
                        reject("No websocket location");
                        return;
                    }
                    websocket = new WebSocket(websocketLocation, "rws_subscription");

                    /**
                     * Is called when the websocket opens
                     */
                    websocket.onopen = function (evt) {
                        o.writeDebug("WebSocket connected");
                        clearTimeout(timeoutID);
                        timeoutID = null;
                        resolve("Created Websocket!");
                    };

                    /**
                     * Is called when the websocket receives a message from the server
                     */
                    websocket.onmessage = function (evt) {

                        let parser = new DOMParser();
                        let data = parser.parseFromString(evt.data, 'text/xml');

                        let listitems = data.getElementsByTagName('li');
                        if (listitems.length <= 0) return;

                        for (let iii = 0; iii < listitems.length; iii++) {
                            let event = listitems[iii];

                            let itemClass = event.getAttribute('class');
                            if (itemClass === null) continue;

                            let subResource = '';
                            // ToDo hides RWS uiinstr event inconsistency
                            if (itemClass === 'rap-ui-ev') {
                                subResource = '/rw/rapid/uiinstr;uievent';
                            }
                            else {
                                subResource = event.getElementsByTagName("a")[0].getAttribute("href");
                            }

                            let newValue = {};
                            let items = event.getElementsByTagName("span");
                            for (let iii = 0; iii < items.length; iii++) {
                                let className = items[iii].getAttribute('class');
                                newValue[className] = items[iii].innerHTML;
                            }

                            // ToDo The following if statements are needed because RWS returns href=self inconsistently. When RWS has fixed this issue these needs to be removed.
                            if (subResource.startsWith('/rw/rapid/symbol/RAPID/')) {
                                subResource += ";value";
                            }
                            if (subResource.startsWith('/rw/elog/')) {
                                subResource = subResource.substring(0, subResource.lastIndexOf("/"));
                            }

                            if (currentSubscriptions.hasOwnProperty(subResource)) {
                                for (let iii = 0; iii < currentSubscriptions[subResource].length; iii++) {
                                    if (currentSubscriptions[subResource][iii].onchanged !== undefined)
                                        currentSubscriptions[subResource][iii].onchanged(newValue);
                                }
                            }

                        }
                    };

                    /**
                     * Is called when the websocket closes
                     */
                    websocket.onclose = function (evt) {
                        o.writeDebug("WebSocket closing " + subscriptionGroup);
                        if (Object.keys(currentSubscriptions).length != 0) {-
                            o.writeDebug("Subscriptions found on close!")
                            o.Subscriptions.unsubscribeToAll();
                        }
                        websocket = null;
                        websocketLocation = null;
                        subscriptionGroup = null;
                        currentSubscriptions = {};
                        clearTimeout(timeoutID);
                        timeoutID = null;
                    };

                    /**
                     * Is called when there is an error with the websocket connection
                     */
                    websocket.onerror = function (evt) {
                        o.writeDebug("WebSocket reports Error");
                    };

                    timeoutID = setTimeout(() => {
                        if (websocket !== null && websocket.readyState !== WebSocket.OPEN) {
                            websocket = null;
                            websocketLocation = null;
                            subscriptionGroup = null;
                            currentSubscriptions = {};
                            timeoutID = null;
                            reject("Error: Trying to connect websocket!");
                        }
                    }, 15000)
                });
            }

            const processSubscribe = async (newSubscriptions) => {

                let priority = "1";

                if (websocket !== null && (websocket.readyState === WebSocket.CLOSED || websocket.readyState === WebSocket.CLOSING)) {
                    await waitSocketRemoved(SOCKET_CLOSE_RETRY_COUNT)
                        .catch(err => reject(err));
                }

                if (websocket !== null && (websocket.readyState === WebSocket.CONNECTING || websocket.readyState === WebSocket.OPEN)) {
                    //
                    // PUT a new subscription to existing group (websocket already open)
                    //
                    let body = "";
                    for (let iii = 0; iii < newSubscriptions.length; iii++) {
                        if (newSubscriptions[iii].getResourceString === undefined || newSubscriptions[iii].getResourceString() === '') {
                            let title = newSubscriptions[iii].getTitle() !== undefined ? newSubscriptions[iii].getTitle() : '<Unknown>';

                            o.writeDebug(`Subscribe on '${title}' rejected as subscription resource string not set.`, 2);
                            continue;
                        }

                        let subscription = newSubscriptions[iii];
                        let resource = subscription.getResourceString();

                        if (currentSubscriptions[resource] !== undefined && currentSubscriptions[resource].length !== 0) {
                            currentSubscriptions[resource].push(subscription);
                        } else {
                            currentSubscriptions[resource] = [subscription];
                            if (iii != 0) body += "&";

                            let idx = (iii + 1).toString();
                            body += `resources=${idx}&${idx}=${encodeURIComponent(resource)}&${idx}-p=${priority}`
                        }
                    }
                    if (body === "") {
                        return Promise.resolve("OK");
                    }

                    let url = "/subscription/" + encodeURIComponent(subscriptionGroup);
                    o.writeDebug(`Subscribe on '${url}', ${body}`, 0);
                    return o.Network.put(url, body)
                        .then(() => Promise.resolve())
                        .catch(err => rejectWithStatus('Failed to add subscription(s).', err));

                } else {
                    //
                    // POST a new subscription to a new group and create websocket
                    //

                    currentSubscriptions = {};
                    websocketLocation = null;
                    websocket = null;

                    let body = "";
                    for (let iii = 0; iii < newSubscriptions.length; iii++) {
                        if (newSubscriptions[iii].getResourceString === undefined || newSubscriptions[iii].getResourceString() === '') {
                            let title = newSubscriptions[iii].getTitle() !== undefined ? newSubscriptions[iii].getTitle() : '<Unknown>';

                            o.writeDebug(`Subscription on '${title}' rejected as subscription resource string not set.`, 2);
                            continue;
                        }

                        let subscription = newSubscriptions[iii];
                        let resource = subscription.getResourceString();

                        if (currentSubscriptions[resource] !== undefined && currentSubscriptions[resource].length !== 0) {
                            currentSubscriptions[resource].push(subscription);
                        } else {
                            currentSubscriptions[resource] = [subscription];
                            if (iii != 0) body += "&";

                            let idx = (iii + 1).toString();
                            body += `resources=${idx}&${idx}=${encodeURIComponent(resource)}&${idx}-p=${priority}`;
                        }
                    }

                    o.writeDebug(`Subscribe on '/subscription', ${body}`, 0);
                    return o.Network.post("/subscription", body)
                        .then(res => {
                            websocketLocation = res.getResponseHeader("location");

                            subscriptionGroup = websocketLocation.substring(websocketLocation.indexOf("poll/") + 5); // ToDo Currently the only way to retrieve the group-id
                            return this.connectWebsocket()
                                .then(() => {
                                    return Promise.resolve("Subscribed");
                                })
                                .catch(err => {
                                    return Promise.reject(err);
                                });
                        })
                        .catch(err => rejectWithStatus('Failed to add subscription(s).', err));
                }                
            }

            const processUnsubscribe = (removedSubscription) => {

                if (websocket !== null && websocket.readyState !== WebSocket.OPEN) {
                    return rejectWithStatus("WebSocket not open.");
                }

                if (removedSubscription.getResourceString === undefined || removedSubscription.getResourceString() === '') {
                    let title = removedSubscription.getTitle() !== undefined ? removedSubscription.getTitle() : '<Unknown>';
                    return rejectWithStatus(`Unsubscribe on '${title}' rejected as subscription resource not set.`, 2);
                }

                let resource = removedSubscription.getResourceString();
                let array = currentSubscriptions[resource];
                if (array === undefined) {
                    return rejectWithStatus("Cannot unsubscribe from " + removedSubscription.getTitle() + " because there are no subscriptions to that signal!");
                }

                var index = array.indexOf(removedSubscription);
                if (index > -1) {
                    array.splice(index, 1);
                } else {
                    return rejectWithStatus("Cannot unsubscribe from " + removedSubscription.getTitle() + " because there are no subscriptions to that signal data object!");
                }
                if (currentSubscriptions[resource].length == 0) {
                    delete currentSubscriptions[resource];

                    let url = `/subscription/${encodeURIComponent(subscriptionGroup)}/${resource}`;
                    o.writeDebug(`Unsubscribe on '${url}'`, 0);
                    return o.Network.delete(url)
                        .then(() => {
                            if (Object.keys(currentSubscriptions) <= 0) {
                                if (websocket !== null) {
                                    websocket.close();
                                }
                            }
                            return Promise.resolve();
                        })
                        .catch(err => rejectWithStatus('Failed to unsubscribe to subscription(s).', err));
                }

                return Promise.resolve();
            }

            //  Queue item is an object as follows:
            //
            //  {
            //      resolve: ,              // resolve function of parent Promise
            //      reject: ,               // reject function of parent Promise
            //      operation1: ,           // routine 1 to execute, must return Promise
            //      operation2: ,           // routine 2 to execute, will be executed if the first operation resolves
            //      indata:                 // input to operation1
            //  }

            var opQueue = [];           
            var opBusy = false;

            function processOperation() {

                if (!opBusy && opQueue.length > 0) {
                    opBusy = true;
                    let item = opQueue.pop();

                    if (RWS.isDebugActive(0)) {

                        let op = item.operation1 === processUnsubscribe ? 'Unsubscribe' : 'Subscribe';
                        let d = '';
                        if (item.operation1 === processUnsubscribe) {
                            d = item.indata.getResourceString();
                        } else {
                            for (let iii = 0; iii < item.indata.length; iii++) {
                                d += item.indata[iii].getResourceString();
                                if (iii < item.indata.length - 1) d += ",";
                            }
                        }
                        o.writeDebug(`Add ${op}, '${d}'`, 0);
                    }

                    item.operation1(item.indata)
                        .then(() => {
                            if (typeof item.operation2 !== 'undefined' && item.operation2 !== null) {
                                return item.operation2();
                            }
                            return Promise.resolve();
                        })
                        .then(() => {
                            if (typeof item.resolve !== 'undefined') {
                                item.resolve();
                            }
                            opBusy = false;
                            setTimeout(() => { processOperation(); }, 0);
                        })
                        .catch(err => {
                            o.writeDebug(`processOperation failed to run operation. >>> ${err.message}`);
                            if (typeof item.reject !== 'undefined') {
                                item.reject(err);
                            }
                            opBusy = false;
                            setTimeout(() => { processOperation(); }, 0);
                        });
                }
            }

            /**
             * Subscribe to change events for controller resources.
             * 
             * NOTE! First subscription will connect the WebSocket and this may take a bit longer.
             *       The service (RWS) will close the WebSocket if all subscriptions are unsubscribed.
             * 
             * @param   {[{}]}              newSubscriptions    List of resources to subscribe to
             * @param   {}                  initialEvent        Function to call to raise initial event.
             * @returns {Promise<string>}                       A status message
             */
            this.subscribe = (newSubscriptions, initialEvent = null) => {
                return new Promise((resolve, reject) => {

                    opQueue.unshift({
                        resolve: resolve,
                        reject: reject,
                        operation1: processSubscribe,
                        operation2: initialEvent,
                        indata: newSubscriptions
                    });

                    setTimeout(() => { processOperation(); }, 0);
                })
            }

            /**
             * Unsubscribe to change events for controller resources.
             * 
             * @param   {number}            removedSubscriptions    List of resources to unsubscribe
             * @returns {Promise<{}>}                               A Promise with a status
             */
            this.unsubscribe = (removedSubscriptions) => {
                return new Promise((resolve, reject) => {

                    for (let iii = 0; iii < removedSubscriptions.length; iii++) {

                        opQueue.unshift({
                            resolve: resolve,
                            reject: reject,
                            operation1: processUnsubscribe,
                            indata: removedSubscriptions[iii]
                        });
                    }
                    setTimeout(() => { processOperation(); }, 0);
                });
            }

            /**
             * Unsubscribes all active subscriptions.
             * 
             * @returns {Promise<{}>}                               A Promise with a status
             */
            this.unsubscribeToAll = () => {
                if (websocket !== null && websocket.readyState !== WebSocket.OPEN) {
                    return Promise.reject("Error: Trying to connect websocket!");
                }
                if (subscriptionGroup != null) {
                    let subscriptionGroup_temp = subscriptionGroup;
                    websocket = null;
                    websocketLocation = null;
                    subscriptionGroup = null;
                    currentSubscriptions = {};

                    if (typeof (window.external) !== 'undefined' && ('notify' in window.external)){
                        if (o.__unload === true) {
        
                            // When unloading the page on the FlexP, to guarantee successful unsubscription.
                            // Let the FlexP shell handle the unsubscription

                            window.external.notify("DeleteSubscriptionGroup " + subscriptionGroup_temp);
                            return Promise.resolve();
                        } else {
                            
                            // When calling unsubscribeAll from any other context, on the FlexP. The method above cannot
                            // be used, since we need to resolve the returned Promise when done.
                            
                            return o.Network.delete("/subscription/" + encodeURIComponent(subscriptionGroup_temp))
                            .then(() => {
                                Promise.resolve();
                            }).catch((err) => {
                                rejectWithStatus('Failed to unsubscribe to all.', err)
                            });
                        }
                    } else {
                        if(navigator.userAgent.toLowerCase().indexOf('firefox') < 0){
            
                            // When unloading the page on a generic browser outside of the FlexP (other than FireFox)
                            // XHR cannot be used due to deprecation.

                            return fetch("/subscription/" + encodeURIComponent(subscriptionGroup_temp), {
                                method: "DELETE",
                                keepalive: true,
                                headers: {"Accept" : "application/hal+json;v=2.0;",}
                            }).then(() => {
                                Promise.resolve();
                            }).catch((err) => {
                                `Failed to unsubscribe to all : ${JSON.stringify(err)}`;
                            });
                        } else {

                            // When unloading the page on FireFox browser outside of the FlexP.
                            // XHR must be used (due to bug with fetch/keepalive in FireFox).

                            return o.Network.delete("/subscription/" + encodeURIComponent(subscriptionGroup_temp))
                            .then(() => {
                                Promise.resolve();
                            }).catch((err) => {
                                rejectWithStatus('Failed to unsubscribe to all.', err)
                            });
                        }
                    }

                } else {
                    // o.writeDebug('Tried to unsubscribe to all - but there is no subscription group.');
                    return Promise.resolve();
                }
            }

        }

        /**
         * The domain used for Mastership handling
         */
        o.Mastership = new function () {

            var mastershipCounter = 0;          // mastershipCounter for requests from external entities, do not use with FlexPendant requests 
            var opBusy = false;

            var onRequestedListeners = [];
            var onReleasedListeners = [];

            /**
             * Requests mastership
             * 
             * @returns {Promise<{}>}       A Promise with a status
             */
            this.request = () => {
                try {
                    o.writeDebug("Requesting mastership..");
                    let listener = {
                        promise: null,
                        resolve: null,
                        reject: null
                    };

                    listener.promise = new Promise((resolve, reject) => {
                        listener.resolve = resolve;
                        listener.reject = reject;
                    });
                    onRequestedListeners.push(listener);

                    if (typeof (window.external) !== 'undefined' && ('notify' in window.external)) {
                        window.external.notify("RequestMastership");
                    } else {
                        setTimeout(() => { processMastership() }, 0);
                    }

                    return listener.promise;
                } catch (error) {
                    return rejectWithStatus('Failed to get mastership.', error);
                }
            }

            /**
             * Releases mastership
             * 
             * @returns {Promise<{}>}       A Promise with a status
             */
            this.release = () => {
                try {
                    o.writeDebug("Releasing mastership..");
                    let listener = {
                        promise: null,
                        resolve: null,
                        reject: null
                    };

                    listener.promise = new Promise((resolve, reject) => {
                        listener.resolve = resolve;
                        listener.reject = reject;
                    });
                    onReleasedListeners.push(listener);

                    if (typeof (window.external) !== 'undefined' && ('notify' in window.external)) {
                        window.external.notify("ReleaseMastership");
                    } else {
                        setTimeout(() => { processMastership() }, 0);
                    }

                    return listener.promise;
                } catch (error) {
                    return rejectWithStatus('Failed to release mastership.', error);
                }
            }

            /**
             * Is called from external application to notify the status on the mastership request
             * NOTE: The function is called from external application and should not be called explicitly
             * 
             * @param   {string}    data    A JSON-string with a 'success'-value as a boolean to indicate if the mastership request was successful
             */
            this.onRequested = async (data) => {
                let length = onRequestedListeners.length;
                try {
                    if (JSON.parse(data).success === true) {
                        for (let iii = 0; iii < length; iii++) {
                            mastershipCounter++;
                            onRequestedListeners.shift().resolve("Mastership acquired!");
                        }
                    } else {
                        for (let iii = 0; iii < length; iii++) {
                            onRequestedListeners.shift().reject("Could not acquire Mastership!");
                        }
                        o.writeDebug("Could not acquire Mastership!", 3);
                    }
                }
                catch (exception) {
                    for (let iii = 0; iii < length; iii++) {
                        onRequestedListeners.shift().reject(exception.message);
                    }
                    o.writeDebug("Exception: " + exception.message, 3);
                }

            }

            /**
             * Is called from external application to notify the status on the mastership release
             * NOTE: The function is called from external application and should not be called explicitly
             * 
             * @param   {string}    data    A JSON-string with a 'success'-value as a boolean to indicate if the mastership release was successful
             */
            this.onReleased = async (data) => {
                let length = onReleasedListeners.length;
                try {
                    if (JSON.parse(data).success === true) {
                        for (let iii = 0; iii < length; iii++) {
                            mastershipCounter = mastershipCounter <= 1 ? 0 : mastershipCounter - 1;
                            onReleasedListeners.shift().resolve("Mastership released!");
                        }
                    } else {
                        for (let iii = 0; iii < length; iii++) {
                            onReleasedListeners.shift().reject("Could not release Mastership!");
                        }
                        o.writeDebug("Could not release Mastership!", 3);
                    }
                }
                catch (exception) {
                    for (let iii = 0; iii < length; iii++) {
                        onReleasedListeners.shift().reject(exception.message);
                    }
                    o.writeDebug("Exception: " + exception.message, 3);
                }
            }

            /**
             * Is called internally to process a mastership operation
             * NOTE: The function is called internally and should not be called explicitly
             */
            async function processMastership() {
                try {
                    if (opBusy === false && onRequestedListeners.length > 0) {
                        opBusy = true;

                        let item = onRequestedListeners.pop();

                        if (++mastershipCounter > 1) {
                            item.resolve();
                        } else {
                            await o.Network.send("POST", "/rw/mastership/edit/request", { "Content-Type": "application/x-www-form-urlencoded;v=2.0" })
                                .then(() => item.resolve())
                                .catch(err => {
                                    mastershipCounter = mastershipCounter <= 1 ? 0 : mastershipCounter - 1;

                                    o.writeDebug("Could not acquire Mastership. >>> " + err.message);
                                    item.reject(createStatusObject('Could not acquire Mastership.', err));
                                });
                        }

                        opBusy = false;
                        setTimeout(() => processMastership(), 0);

                    } else if (opBusy === false && onReleasedListeners.length > 0) {
                        opBusy = true;

                        let item = onReleasedListeners.pop();

                        if (mastershipCounter < 1) {
                            o.writeDebug('Releasing mastership, though counter is 0.', 1);
                        }

                        mastershipCounter = mastershipCounter <= 1 ? 0 : mastershipCounter - 1;

                        if (mastershipCounter > 0) {
                            item.resolve();
                        } else {
                            await o.Network.send("POST", "/rw/mastership/edit/release", { "Content-Type": "application/x-www-form-urlencoded;v=2.0" })
                                .then(() => item.resolve())
                                .catch(err => {
                                    o.writeDebug("Could not release Mastership. >>> " + err.message);
                                    item.reject(createStatusObject('Could not release Mastership.', err));
                                });
                        }

                        opBusy = false;
                        setTimeout(() => processMastership(), 0);
                    }
                } catch (error) {
                    o.writeDebug(`Failed to process mastership operation. >>> ${error}`, 2);

                    opBusy = false;
                    setTimeout(() => processMastership(), 0);
                }
            }

            /**
             * Releases all requests for mastership.
             * Should only be used when unloading the page.
             * 
             * @returns {Promise<{}>}       A Promise with a status
             */
            this.releaseAll = () => {
                try {
                    let count = mastershipCounter;
                    if (typeof (window.external) !== 'undefined' && ('notify' in window.external)) {
                        // When unloading the page on the FlexP.
                        // Let the FlexP do te job.
                        for (let iii = 0; iii < count; iii++) {
                            window.external.notify("ReleaseMastership");
                        }
                    } else {
                        mastershipCounter = 0;
                        if(navigator.userAgent.toLowerCase().indexOf('firefox') >= 0){
                            // When unloading the page on FireFox browser outside of the FlexP.
                            // XHR must be used (due to bug with fetch/keepalive in FireFox).
                            o.Network.post("/rw/mastership/edit/release");
                       } else {
                            // When unloading the page on a generic browser outside of the FlexP (other than FireFox)
                            // XHR cannot be used due to deprecation.
                            return fetch("/rw/mastership/edit/release", {
                                method: "POST",
                                keepalive: true,
                                headers: {"Accept" : "application/hal+json;v=2.0;", "Content-Type" : "application/x-www-form-urlencoded;v=2.0"}
                            }).then(() => {
                                Promise.resolve();
                            }).catch((err) => {
                                `Failed to release all mastership: ${JSON.stringify(err)}`;
                            });
                       }                        
                        
                    }

                    return Promise.resolve();

                } catch (error) {
                    return rejectWithStatus('Failed to release all mastership requests.', error);
                }
            }

        }

        /**
         * The domain used for Network handling
         */
        o.Network = new function () {

            /**
             * Sets the cookies
             * 
             * @param   {string}    data    A JSON-string with a 'cookies'-value as a string  
             */
            this.setCookies = (data) => {
                let cookies = JSON.parse(data).cookies;
                let index = 0;
                while ((index = cookies.indexOf(";")) != -1) {
                    let cookie = cookies.substr(0, index);
                    document.cookie = cookie;
                    if (cookies.length < index + 3)
                        break;
                    cookies = cookies.substr(index + 2);
                }
                return "Cookies updated!";
            }

            /**
             * Sets up a heartbeat that sends a request to the server every 30 seconds to keep the connection alive.
             * NOTE: The function is called on load by this script and should not be called explicitly
             */
            this.heartBeat = () => {
                this.get("/").then(
                    (msg) => { },
                    (error) => o.writeDebug(`Heartbeat Failed.  >>>  ${error.httpStatus.code} ${error.httpStatus.text}`, 3)
                )
                setTimeout(this.heartBeat, 30000);
            }

            /**
             * Sends a HTTP-request to the RWS-server
             * 
             * @param   {string}                                    method          The name of the HTTP-method ("GET", "POST", "PUT"...)
             * @param   {string}                                    path            The path URL of the HTTP-request
             * @param   {{"<Header Name>":"<Header Value>", ...}}   requestHeaders  The requestHeaders of the HTTP-request (Optional)
             * @param   {string}                                    body            The body of the HTTP-request
             * @returns {Promise<XMLHttpRequest>}                                   A Promise with the HTTP-response
             */
            this.send = (method, path, requestHeaders = {}, body = null) => {

                return new Promise((resolve, reject) => {

                    let req = new XMLHttpRequest();
                    if (o.__unload !== true) {
                        req.timeout = HTTP_REQUEST_TIMEOUT;
                    }

                    req.ontimeout = () => {
                        o.writeDebug('Request timed out.', 2);
                        reject('RWS request timed out.');
                    }

                    req.onerror = () => {
                        o.writeDebug(`Send error. ${method + " " + path}`, 2);
                        reject('Send error.');
                    }

                    req.onreadystatechange = () => {
                        if (req.readyState === 4) {
                            if (req.status === 0) return;

                            if (Math.floor(req.status / 100) !== 2) {
                                let r = {
                                    message: '',
                                    httpStatus: { code: req.status, text: req.statusText}
                                };
                                
                                if (req.responseText !== null && req.responseText !== '') {
                                    return verfifyErrorCode(req.responseText)
                                        .then(x => {
                                            let call = body === null ? path : `${path} ${body}`;
                                            if (x.severity.toLowerCase() === 'error') {
                                                o.writeDebug(`RWS call '${call}', ${x.severity}: ${x.name}, '${x.description}'`, 1);
                                            }
                                            r.controllerStatus = x;

                                            return reject(r);
                                        })
                                        .catch(() => reject(r));
                                }

                                return reject(r);
                            } else {
                                if (path === '/') {
                                    resolve(req);
                                    return;
                                }

                                if (req.responseText === null || req.responseText === '') return resolve(req);
                                if (req.getResponseHeader('Content-Type') !== 'application/hal+json;v=2.0') return resolve(req);

                                let json = parseJSON(req.responseText);
                                if (json === undefined) return resolve(req);

                                return verifyReturnCode(json)
                                    .then(() => resolve(req))
                                    .catch(errors => {
                                        let s = body === null ? path : `${path} ${body}`;
                                        for (let item in errors) {
                                            if (errors[item].severity.toLowerCase() === 'error') {
                                                o.writeDebug(`RWS call '${s}', ${errors[item].severity}: '${item}' - ${errors[item].name}, '${errors[item].description}'`, 1);
                                            }
                                        }
                                        resolve(req)
                                        return;
                                    });
                            }
                        }
                    };

                    try {
                        req.open(method, path, o.__unload === true ? false : true);

                        for (var key in requestHeaders) {
                            var value = requestHeaders[key];
                            req.setRequestHeader(key, value);
                        }
                        if (body !== null)
                            req.send(body);
                        else
                            req.send();
                    } catch (exception) {
                        reject("Error during communication with RWS! Exception: " + exception.message);
                        return;
                    }

                }).catch((err) => Promise.reject(err));

            }


            /**
             * Sends a HTTP-request with method "GET" and "Accept"-header with value "application/hal+json;v=2.0" to the RWS-server
             * 
             * @param   {string}                                    path                        The path URL of the HTTP-request
             * @param   {{"<Header Name>":"<Header Value>", ...}}   additionalRequestHeaders    The requestHeaders of the HTTP-request (Optional)
             * @returns {Promise<XMLHttpRequest>}                                               A Promise with the HTTP-response
             */
            this.get = (path, additionalRequestHeaders = {}) => {
                return this.send("GET", path, Object.assign({ "Accept": "application/hal+json;v=2.0" }, additionalRequestHeaders));
            }

            /**
             * Sends a HTTP-request with method "POST", "Content-Type"-header with value "application/x-www-form-urlencoded;v=2.0" and "Accept"-header with value "application/hal+json;v=2.0" to the RWS-server
             * 
             * @param   {string}                                    path                        The path URL of the HTTP-request
             * @param   {string}                                    body                        The body of the HTTP-request
             * @param   {{"<Header Name>":"<Header Value>", ...}}   additionalRequestHeaders    The requestHeaders of the HTTP-request (Optional)
             * @returns {Promise<XMLHttpRequest>}                                               A Promise with the HTTP-response
             */
            this.post = (path, body, additionalRequestHeaders = {}) => {
                return this.send("POST", path, Object.assign({ "Content-Type": "application/x-www-form-urlencoded;v=2.0", "Accept": "application/hal+json;v=2.0" }, additionalRequestHeaders), body);
            }

            /**
             * Sends a HTTP-request with method "PUT" and "Content-Type"-header with value "application/x-www-form-urlencoded;v=2.0" to the RWS-server
             * 
             * @param   {string}                                    path                        The path URL of the HTTP-request
             * @param   {string}                                    body                        The body of the HTTP-request
             * @param   {{"<Header Name>":"<Header Value>", ...}}   additionalRequestHeaders    The requestHeaders of the HTTP-request (Optional)
             * @returns {Promise<XMLHttpRequest>}                                               A Promise with the HTTP-response
             */
            this.put = (path, body, additionalRequestHeaders = {}) => {
                return this.send("PUT", path, Object.assign({ "Content-Type": "application/x-www-form-urlencoded;v=2.0" }, additionalRequestHeaders), body);
            }

            /**
             * Sends a HTTP-request with method "GET" and "Accept"-header with value "application/hal+json;v=2.0" to the RWS-server
             * 
             * @param   {string}                                    path                        The path URL of the HTTP-request
             * @param   {{"<Header Name>":"<Header Value>", ...}}   additionalRequestHeaders    The requestHeaders of the HTTP-request (Optional)
             * @returns {Promise<XMLHttpRequest>}                                               A Promise with the HTTP-response
             */
            this.delete = (path, additionalRequestHeaders = {}) => {
                return this.send("DELETE", path, Object.assign({ "Accept": "application/hal+json;v=2.0" }, additionalRequestHeaders));
            }

            /**
             * Sends a HTTP-request with method "OPTIONS" and "Accept"-header with value "application/xhtml+xml;v=2.0" to the RWS-server
             * 
             * @param   {string}                                    path                        The path URL of the HTTP-request
             * @param   {{"<Header Name>":"<Header Value>", ...}}   additionalRequestHeaders    The requestHeaders of the HTTP-request (Optional)
             * @returns {Promise<XMLHttpRequest>}                                               A Promise with the HTTP-response
             */
            this.options = (path, additionalRequestHeaders = {}) => {
                return this.send("OPTIONS", path, Object.assign({ "Accept": "application/xhtml+xml;v=2.0" }, additionalRequestHeaders));
            }

            /**
             * Sends a HTTP-request with method "HEAD" and "Accept"-header with value "application/xhtml+xml;v=2.0" to the RWS-server
             * 
             * @param   {string}                                    path                        The path URL of the HTTP-request
             * @param   {{"<Header Name>":"<Header Value>", ...}}   additionalRequestHeaders    The requestHeaders of the HTTP-request (Optional)
             * @returns {Promise<XMLHttpRequest>}                                               A Promise with the HTTP-response
             */
            this.head = (path, additionalRequestHeaders = {}) => {
                return this.send("HEAD", path, Object.assign({ "Accept": "application/xhtml+xml;v=2.0" }, additionalRequestHeaders));
            }
        }

        o.constructedMain = true;

    })(RWS);
    var _onMastershipRequested = RWS.Mastership.onRequested;
    var _onMastershipReleased = RWS.Mastership.onReleased;
    var _setCookies = RWS.Network.setCookies;
}

