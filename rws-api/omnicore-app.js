
// (c) Copyright 2020-2023 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.2

'use strict';

var App = App || {};
if (typeof App.constructed === "undefined") {
    (function (o) {

        // VERSION INFO
        o.APP_LIB_VERSION = "1.2";        

        /**
         * Initializes the App object
         */
        o.init = () => {


        }
        window.addEventListener("load", o.init, false);

        /**
         * Notifies the app framework that the script is busy. This will enable a spinner and disable all input for app.
         * 
         * @param   {boolean}           state   The busy-state, state == true is busy, otherwise not busy
         */
        o.setBusyState = function (state) {
            let busyFlag = 'false';
            if (state == true) {
                busyFlag = 'true';
            }

            if (typeof (window.external) !== 'undefined' && ('notify' in window.external)) {
                window.external.notify(`IsBusy ${busyFlag}`);
            }
        }

        var onGetAppTypeListeners = [];

        /**
         * 
         */
        o.getTpuType = function () {
 
            if (typeof (window.external) !== 'undefined' && ('notify' in window.external)) {

                let listener = {
                    promise: null,
                    resolve: null,
                    reject: null
                };

                listener.promise = new Promise((resolve, reject) => {
                    listener.resolve = resolve;
                    listener.reject = reject;

                    setTimeout(() => {
                        var temp = [];
                        let length = onGetAppTypeListeners.length;
                        for (let iii = 0; iii < length; iii++) {
                            let item = onGetAppTypeListeners.shift();
                            if (item !== listener) {
                                temp.push(item);
                            } 
                        }
                        onGetAppTypeListeners = temp;

                        reject('Request timed out.');
                    }, 3000);
                });

                onGetAppTypeListeners.push(listener);
                window.external.notify("GetTpuType");

                return listener.promise;
            } else {
                let response = JSON.stringify({ 'isTpu': false, 'machineName': '' });

                return Promise.resolve(response);
            }
        }

        o.onGetTpuType = async (data) => {
            let length = onGetAppTypeListeners.length;
            for (let iii = 0; iii < length; iii++) {
                onGetAppTypeListeners.shift().resolve(data);
            }
        }

        /**
         * The "interface" for WebApp interaction related events.
         * 
         * NOTE! Implement global functions 'appMessageReceived' and 'appNavigateTo' in your script to enable interaction events.
         * The functions must return a Promise which if resolved will return true to the app framework, reject will return false.  
         * 
         */

        o.Interaction = new function () {

            this.closeApp = function () {
                if (typeof (window.external) !== 'undefined' && ('notify' in window.external)) {
                    window.external.notify('CloseApp');
                }
            }
            
            let activeMessage = null;

            this.onSendMessageResponse = async (data) => {

                if (activeMessage === null) {
                    console.log('No active message.');
                }

                activeMessage.resolve(data);
                activeMessage = null;
            }

            this.sendMessage = function (message) {
                const checkMessage = (msg) => {
                    if (msg.hasOwnProperty('AppName') === false) {
                        console.error(`'AppName' not present in message.`);
                        return false;
                    }
                    if (msg.hasOwnProperty('Message') === false) {
                        console.error(`'Message' not present in message.`);
                        return false;
                    }
                    return true;
                }

                if (typeof (window.external) !== 'undefined' && ('notify' in window.external)) {

                    if (checkMessage(message) === false) {
                        return Promise.reject('Message is not of supported type.');
                    }

                    let listener = {
                        promise: null,
                        resolve: null,
                        reject: null
                    };

                    listener.promise = new Promise((resolve, reject) => {
                        listener.resolve = resolve;
                        listener.reject = reject;

                        setTimeout(() => {
                            activeMessage = null;
                            reject('Request timed out.');
                        }, 3000);
                    });

                    activeMessage = listener;

                    let messageString = JSON.stringify(message);
                    window.external.notify(`SendMessage ${messageString}`);

                    return listener.promise;
                } else {
                    return Promise.reject('Messages not supported.');
                }
            }

            this.onMessageReceived = async (info) => {

                let status = '';
                if (typeof appMessageReceived === 'function') {
                    try {
                        await Promise.resolve(appMessageReceived(info))
                            .then(x => {
                                if (x == true) return Promise.resolve();

                                return Promise.reject();
                            })
                            .then(() => status = '')
                            .catch(() => status = "'appMessageReceived' failed.");
                    }
                    catch (error) {
                        console.error(`onMessageReceived failed to execute, function 'appMessageReceived' may be faulty. >>> ${error}`);
                        status = "'appMessageReceived' failed to execute.";
                    }
                } else {
                    status = "'appMessageReceived' not found.";
                    console.error(status);
                }

                if (typeof (window.external) !== 'undefined' && ('notify' in window.external)) {
                    window.external.notify(`SendMessageResponse ${status}`);
                }
            }


            let activeRequest = null;

            this.onNavigateToResponse = (data) => {

                if (activeRequest === null) {
                    console.log('No active request.');
                    return Promise.reject('No active request.');
                }

                try {
                    let status = JSON.parse(data);

                    if (status.Success === true) {
                        activeRequest.resolve();
                    } else {
                        let s = `Request failed, '${status.Reason}'.`;
                        console.log(s);
                        activeRequest.reject(s);
                    }
                    activeRequest = null;
                } catch (exception) {
                    activeRequest.reject(exception.message);
                    activeRequest = null;
                    console.error(`Exception: ${exception.message}`);
                }
            }

            this.sendNavigateToRequest = (info) => {

                if (activeRequest !== null) {
                    console.warn('Request already active.');
                    return Promise.reject('Request already active.');
                }

                if (typeof (window.external) !== 'undefined' && ('notify' in window.external)) {

                    let listener = {
                        promise: null,
                        resolve: null,
                        reject: null
                    };

                    listener.promise = new Promise((resolve, reject) => {
                        listener.resolve = resolve;
                        listener.reject = reject;
                    });
                    activeRequest = listener;

                    let infoText = JSON.stringify(info);
                    window.external.notify(`NavigateTo ${infoText}`);

                    return listener.promise;
                } else {
                    return Promise.reject('No external window.');
                }
            }

            this.onNavigateTo = async (info) => {

                let navigateToStatus = '';
                if (typeof appNavigateTo === 'function') {
                    try {
                        await Promise.resolve(appNavigateTo(info))
                            .then(x => {
                                if (x == true) return Promise.resolve();

                                return Promise.reject();
                            })
                            .then(() => navigateToStatus = '')
                            .catch(() => navigateToStatus = "'appNavigateTo' failed.");
                    }
                    catch (error) {
                        console.error("onNavigateTo failed to execute, function 'appNavigateTo' may be faulty.");
                    }
                } else {
                    navigateToStatus = "'appNavigateTo' not found.";
                    console.error(navigateToStatus);
                }

                if (typeof (window.external) !== 'undefined' && ('notify' in window.external)) {
                    window.external.notify(`NavigateToResponse ${navigateToStatus}`);
                }
            }

        }

        /**
         * The "interface" for activation related events.
         * 
         * NOTE! Implement global functions 'appActivate' and 'appDeactivate' in your script to enable activation events.
         * The functions must return a Promise which if resolved will return true to the app framework, reject will return false.  
         * 
         */
        o.Activation = new function () {

            /**
             * Is called from external application to notify that the app is being activated
             * NOTE: The function is called from external application and should not be called explicitly
             * 
             */
            this.onActivate = async () => {

                let activateStatus = 'false';
                if (typeof appActivate === 'function') {
                    try {
                        await Promise.resolve(appActivate())
                            .then(x => {
                                if (x == true) return Promise.resolve();

                                return Promise.reject();
                            })
                            .then(() => activateStatus = 'true')
                            .catch(() => activateStatus = 'false');
                    }
                    catch (error) {
                        console.error("onActivate failed to execute, function 'appActivate' may be faulty.");
                    }
                } else {
                    activateStatus = 'true';
                }

                if (typeof (window.external) !== 'undefined' && ('notify' in window.external)) {
                    window.external.notify(`Activated ${activateStatus}`);
                }
            }

            /**
             * Is called from external application to notify that the app is being deactivated
             * NOTE: The function is called from external application and should not be called explicitly
             * 
             */
            this.onDeactivate = async () => {

                let deactivateStatus = 'false';
                if (typeof appDeactivate === 'function') {
                    try {
                        await Promise.resolve(appDeactivate())
                            .then(x => {
                                if (x == true) return Promise.resolve();

                                return Promise.reject();
                            })
                            .then(() => deactivateStatus = 'true')
                            .catch(() => deactivateStatus = 'false');
                    }
                    catch (error) {
                        console.error("onDeactivate failed to execute, function 'appDeactivate' may be faulty.");
                    }
                } else {
                    deactivateStatus = 'true';
                }

                if (typeof (window.external) !== 'undefined' && ('notify' in window.external)) {
                    window.external.notify(`Deactivated ${deactivateStatus}`);
                }
            }
        }

        o.constructed = true;
    })(App);
    var _onGetTpuType = App.onGetTpuType;
    var _onNavigateTo = App.Interaction.onNavigateTo;
    var _onNavigateToResponse = App.Interaction.onNavigateToResponse;
    var _onSendMessage = App.Interaction.onMessageReceived;
    var _onSendMessageResponse = App.Interaction.onSendMessageResponse;
    var _onActivate = App.Activation.onActivate;
    var _onDeactivate = App.Activation.onDeactivate;
}
