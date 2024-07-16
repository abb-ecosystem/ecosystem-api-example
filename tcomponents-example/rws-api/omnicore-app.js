
// (c) Copyright 2020-2024 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights.

// OmniCore App SDK 1.4.1



"use strict";

var App = App || {};

if (typeof App.constructed === "undefined") {
    (function(o) {
        o.APP_LIB_VERSION = "1.4.1";
        const init = () => {};
        window.addEventListener("load", init, false);
        const isWebView = () => {
            return "chrome" in window && "webview" in window.chrome && "postMessage" in window.chrome.webview || "external" in window && "notify" in window.external;
        };
        const postWebViewMessage = message => {
            if ("chrome" in window && "webview" in window.chrome && "postMessage" in window.chrome.webview) {
                window.chrome.webview.postMessage(message);
            } else if ("external" in window && "notify" in window.external) {
                window.external.notify(message);
            } else {
                throw new Error("Could not post WebView message, WebView not recognized.");
            }
        };
        o.setBusyState = function(state) {
            let busyFlag = "false";
            if (state == true) {
                busyFlag = "true";
            }
            if (isWebView()) {
                postWebViewMessage(`IsBusy ${busyFlag}`);
            }
        };
        let onGetAppTypeListeners = [];
        o.getTpuType = function() {
            if (isWebView()) {
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
                        reject("Request timed out.");
                    }, 3e3);
                });
                onGetAppTypeListeners.push(listener);
                postWebViewMessage("GetTpuType");
                return listener.promise;
            } else {
                let response = JSON.stringify({
                    isTpu: false,
                    machineName: ""
                });
                return Promise.resolve(response);
            }
        };
        o.onGetTpuType = async data => {
            let length = onGetAppTypeListeners.length;
            for (let iii = 0; iii < length; iii++) {
                onGetAppTypeListeners.shift().resolve(data);
            }
        };
        o.Interaction = new function() {
            this.closeApp = function() {
                if (isWebView()) {
                    postWebViewMessage("CloseApp");
                }
            };
            let activeMessage = null;
            this.onSendMessageResponse = async data => {
                if (activeMessage === null) {
                    console.log("No active message.");
                }
                activeMessage.resolve(data);
                activeMessage = null;
            };
            this.sendMessage = function(message) {
                const checkMessage = msg => {
                    if (msg.hasOwnProperty("AppName") === false) {
                        console.error(`'AppName' not present in message.`);
                        return false;
                    }
                    if (msg.hasOwnProperty("Message") === false) {
                        console.error(`'Message' not present in message.`);
                        return false;
                    }
                    return true;
                };
                if (isWebView()) {
                    if (checkMessage(message) === false) {
                        return Promise.reject("Message is not of supported type.");
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
                            reject("Request timed out.");
                        }, 3e3);
                    });
                    activeMessage = listener;
                    let messageString = JSON.stringify(message);
                    postWebViewMessage(`SendMessage ${messageString}`);
                    return listener.promise;
                } else {
                    return Promise.reject("Messages not supported.");
                }
            };
            this.onMessageReceived = async info => {
                let status = "";
                if (typeof appMessageReceived === "function") {
                    try {
                        await Promise.resolve(appMessageReceived(info)).then(x => {
                            if (x == true) return Promise.resolve();
                            return Promise.reject();
                        }).then(() => status = "").catch(() => status = "'appMessageReceived' failed.");
                    } catch (error) {
                        console.error(`onMessageReceived failed to execute, function 'appMessageReceived' may be faulty. >>> ${error}`);
                        status = "'appMessageReceived' failed to execute.";
                    }
                } else {
                    status = "'appMessageReceived' not found.";
                    console.error(status);
                }
                if (isWebView()) {
                    postWebViewMessage(`SendMessageResponse ${status}`);
                }
            };
            let activeRequest = null;
            this.onNavigateToResponse = data => {
                if (activeRequest === null) {
                    console.log("No active request.");
                    return Promise.reject("No active request.");
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
            };
            this.sendNavigateToRequest = info => {
                if (activeRequest !== null) {
                    console.warn("Request already active.");
                    return Promise.reject("Request already active.");
                }
                if (isWebView()) {
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
                    postWebViewMessage(`NavigateTo ${infoText}`);
                    return listener.promise;
                } else {
                    return Promise.reject("No external window.");
                }
            };
            this.onNavigateTo = async info => {
                let navigateToStatus = "";
                if (typeof appNavigateTo === "function") {
                    try {
                        await Promise.resolve(appNavigateTo(info)).then(x => {
                            if (x == true) return Promise.resolve();
                            return Promise.reject();
                        }).then(() => navigateToStatus = "").catch(() => navigateToStatus = "'appNavigateTo' failed.");
                    } catch (error) {
                        console.error("onNavigateTo failed to execute, function 'appNavigateTo' may be faulty.");
                    }
                } else {
                    navigateToStatus = "'appNavigateTo' not found.";
                    console.error(navigateToStatus);
                }
                if (isWebView()) {
                    postWebViewMessage(`NavigateToResponse ${navigateToStatus}`);
                }
            };
        }();
        o.Activation = new function() {
            this.onActivate = async () => {
                let activateStatus = "false";
                if (typeof appActivate === "function") {
                    try {
                        await Promise.resolve(appActivate()).then(x => {
                            if (x == true) return Promise.resolve();
                            return Promise.reject();
                        }).then(() => activateStatus = "true").catch(() => activateStatus = "false");
                    } catch (error) {
                        console.error("onActivate failed to execute, function 'appActivate' may be faulty.");
                    }
                } else {
                    activateStatus = "true";
                }
                if (isWebView()) {
                    postWebViewMessage(`Activated ${activateStatus}`);
                }
            };
            this.onDeactivate = async () => {
                let deactivateStatus = "false";
                if (typeof appDeactivate === "function") {
                    try {
                        await Promise.resolve(appDeactivate()).then(x => {
                            if (x == true) return Promise.resolve();
                            return Promise.reject();
                        }).then(() => deactivateStatus = "true").catch(() => deactivateStatus = "false");
                    } catch (error) {
                        console.error("onDeactivate failed to execute, function 'appDeactivate' may be faulty.");
                    }
                } else {
                    deactivateStatus = "true";
                }
                if (isWebView()) {
                    postWebViewMessage(`Deactivated ${deactivateStatus}`);
                }
            };
        }();
        o.constructed = true;
    })(App);
    window["_onGetTpuType"] = App.onGetTpuType;
    window["_onNavigateTo"] = App.Interaction.onNavigateTo;
    window["_onNavigateToResponse"] = App.Interaction.onNavigateToResponse;
    window["_onSendMessage"] = App.Interaction.onMessageReceived;
    window["_onSendMessageResponse"] = App.Interaction.onSendMessageResponse;
    window["_onActivate"] = App.Activation.onActivate;
    window["_onDeactivate"] = App.Activation.onDeactivate;
}