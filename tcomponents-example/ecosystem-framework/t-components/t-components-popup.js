'use strict';

/**
 * @class Popup_A
 * @memberof TComponents
 */
export const Popup_A = (function () {
  let _enabled = true;
  let _show = true;

  const OK = 'ok';
  const CANCEL = 'cancel';

  return {
    /**
     * @alias show
     * @memberof TComponents.Popup_A
     */
    get show() {
      return _show;
    },

    set show(value) {
      _show = value;
    },

    /**
     * @alias enabled
     * @memberof TComponents.Popup_A
     */
    get enabled() {
      return _enabled;
    },

    set enabled(value) {
      _enabled = value;
    },

    /**
     * 'ok'
     * @alias OK
     * @type {string}
     * @memberof TComponents.Popup_A
     * @static
     */
    get OK() {
      return OK;
    },

    /**
     * 'cancel'
     * @alias CANCEL
     * @type {string}
     * @memberof TComponents.Popup_A
     * @static
     */
    get CANCEL() {
      return CANCEL;
    },

    /**
     * A popup dialog is a modal window that provides the user with information messages.
     * @alias message
     * @memberof TComponents.Popup_A
     * @param {string} msg1 - A string, describing the topic of the message.
     * @param {string|string[]} [msg_array] - The actual message. Can be either a simple string or,
     * if several lines are required, an array where each element is a string with a message line.
     * @param {function(string): void} [callback] - A function that will be called when the user dismisses by pressing the 'OK' or 'Cancel' button.
     * @example
     * Popup_A.message(
     *   "Important message!",
     *   [
     *     "For your information, this is a popup dialog.",
     *     "",
     *     "Further information can be given here!"
     *   ],
     *  function (action) {
     *    console.log("OK button was clicked")
     *  });
     */
    message: function (msg1, msg_array = [], callback = null) {
      if (!_enabled) return;

      _show ? FPComponents.Popup_A.message(msg1, msg_array, callback) : console.log(msg1, ...msg_array);
    },

    /**
     * A popup dialog is a modal window that provides the user with information messages.
     * The main difference with Popup_A.message is that Popup_A.info includes a "i" image in the modal window.
     * @alias info
     * @memberof TComponents.Popup_A
     * @param {string} msg1 - A string, describing the topic of the message.
     * @param {string|string[]} [msg_array] - The actual message. Can be either a simple string or,
     * if several lines are required, an array where each element is a string with a message line.
     * @param {function(string): void} [callback] - A function that will be called when the user dismisses by pressing the 'OK' or 'Cancel' button.
     * @example
     * Popup_A.info(
     *   "Important information!",
     *   [
     *     "For your information, this is a popup dialog.",
     *     "",
     *     "Further information can be given here!"
     *   ],
     *  function (action) {
     *    console.log("OK button was clicked")
     *  });
     */
    info: function (msg1, msg_array = [], callback = null) {
      if (!_enabled) return;

      _show ? FPComponents.Popup_A.message(msg1, msg_array, callback, FPComponents.Popup_A.STYLE.INFORMATION) : console.log(msg1, ...msg_array);
    },

    /**
     * A popup dialog is a modal window that provides the user with warning messages.
     * @alias warning
     * @memberof TComponents.Popup_A
     * @param {string} msg1 - A string, describing the topic of the message.
     * @param {string|string[]} [msg_array] - The actual message. Can be either a simple string or,
     * if several lines are required, an array where each element is a string with a message line.
     * @param {function(string): void} [callback] - A function that will be called when the user dismisses by pressing the 'OK' or 'Cancel' button.
     *  try {
     *    // do something
     *  } catch (e) {
     *    Popup_A.waring('Something went wrong', [e.message, e.description]);
     *  }
     */
    warning: function (msg1, msg_array = [], callback = null) {
      if (!_enabled) return;

      _show ? FPComponents.Popup_A.message(msg1, msg_array, callback, FPComponents.Popup_A.STYLE.WARNING) : console.log(msg1, ...msg_array);
    },

    /**
     * A popup dialog is a modal window that provides the user with error messages.
     * @alias danger
     * @memberof TComponents.Popup_A
     * @param {string} msg1 - A string, describing the topic of the message.
     * @param {string|string[]} [msg_array] - The actual message. Can be either a simple string or,
     * if several lines are required, an array where each element is a string with a message line.
     * @param {function(string): void} [callback] - A function that will be called when the user dismisses by pressing the 'OK' or 'Cancel' button.
     * @example
     *  try {
     *    // do something
     *  } catch (e) {
     *    Popup_A.danger('Something went wrong', [e.message, e.description]);
     *  }
     */
    danger: function (msg1, msg_array = [], callback = null) {
      console.group('Popup_A.danger');
      msg1 && console.error(msg1);
      console.error(...msg_array);
      console.groupEnd();

      if (!_enabled) return;

      _show ? FPComponents.Popup_A.message(msg1, msg_array, callback, FPComponents.Popup_A.STYLE.DANGER) : console.log(msg1, ...msg_array);
    },

    /**
     * A popup dialog is a modal window that provides the user with error messages.
     * @alias error
     * @memberof TComponents.Popup_A
     * @param {object} e - Error object thrown by Omnicore RWS
     * @example
     *  try {
     *    throw new Error("Whoops!");
     *  } catch (e) {
     *    Popup_A.error(e, 'Custom title');
     *  };
     * @todo Optimize the parsing of error object
     * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-App-SDK}
     */
    error: function (e, msg1 = '', callback = null) {
      console.group('Popup_A.error');
      msg1 && console.error(msg1);
      console.error(e);
      console.groupEnd();

      if (!_enabled) return;

      const entries = Object.entries(e);
      const msgArray = msg1 === '' ? [] : [e.message];
      entries.forEach(([key, value]) => {
        if (key !== 'message') {
          if (Array.isArray(value)) {
            const msg = `${key}: `;
            msgArray.push(msg);
            value.forEach((element) => {
              const json = JSON.stringify(element, null, 2);

              msgArray.push(json.replace(/"([^"]+)"/g, '$1').replace(/[{}]/g, ''));
            });
          } else {
            const json = JSON.stringify(value, null, 2)
              .replace(/"([^"]+)"/g, '$1')
              .replace(/[{}]/g, '');

            const msg = `${key}: ${json}`;
            msgArray.push(msg);
          }
        }
      });

      const severity =
        e.controllerStatus !== undefined && e.controllerStatus.severity === 'Error'
          ? FPComponents.Popup_A.STYLE.DANGER
          : FPComponents.Popup_A.STYLE.WARNING;

      if (msg1 === '') {
        _show && FPComponents.Popup_A.message(e.message, msgArray, callback, severity);
      } else {
        _show && FPComponents.Popup_A.message(msg1, msgArray, callback, severity);
      }
    },

    /**
     * TA popup dialog is a modal window that provides "OK/Cancel" confirmation dialog.
     * @alias confirm
     * @memberof TComponents.Popup_A
     * @param {string} msg1 - A string, describing the topic of the message.
     * @param {string|string[]} [msg_array] - The actual message. Can be either a simple string or,
     * if several lines are required, an array where each element is a string with a message line.
     * @param {function(string): void} [callback] - A function that will be called when the user dismisses by pressing the 'OK' or 'Cancel' button.
     * @example
     * Popup_A.confirm(
     *   `${moduleName} module not yet loaded on the controller`,
     *   ['This module is required for this WebApp.', 'Do you want to load the module?'],
     *   if (action === Popup_A.OK) {
     *     console.log("Load the module here...")
     *   } else if (action == Popup_A.CANCEL) {
     *     console.log("Abort mission!");
     *   }
     * );
     */
    confirm: function (msg1, msg_array, callback = null) {
      if (!_enabled) return;

      _show ? FPComponents.Popup_A.confirm(msg1, msg_array, callback) : console.log(msg1, ...msg_array);
    },
  };
})();
