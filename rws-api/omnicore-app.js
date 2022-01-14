
// (c) Copyright 2020-2021 ABB
//
// Any unauthorized use, reproduction, distribution,
// or disclosure to third parties is strictly forbidden.
// ABB reserves all rights regarding Intellectual Property Rights

// OmniCore App SDK 1.1

'use strict';

var App = App || {};
if (typeof App.constructed === "undefined") {
    (function (o) {

        // VERSION INFO
        o.APP_LIB_VERSION = "1.1";        

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
    var _onActivate = App.Activation.onActivate;
    var _onDeactivate = App.Activation.onDeactivate;
}
