(function (o) {
  if (!o.hasOwnProperty('Popup_A')) {
    const OK = 'ok';
    const CANCEL = 'cancel';

    /**
     * @class TComponents.Popup_A
     */
    o.Popup_A = class Popup {
      /**
       * 'ok'
       * @alias OK
       * @type {string}
       * @memberof TComponents.Popup_A
       * @static
       */
      static get OK() {
        return OK;
      }

      /**
       * 'cancel'
       * @alias CANCEL
       * @type {string}
       * @memberof TComponents.Popup_A
       * @static
       */
      static get CANCEL() {
        return CANCEL;
      }
      /**
       * A popup dialog is a modal window that provides the user with information messages.
       * @alias message
       * @memberof TComponents.Popup_A
       * @param {string} msg1 - A string, describing the topic of the message.
       * @param {string|string[]} [msg_array] - The actual message. Can be either a simple string or,
       * if several lines are required, an array where each element is a string with a message line.
       * @param {function(string): void} [callback] - A function that will be called when the user dismisses by pressing the 'OK' or 'Cancel' button.
       * @example
       * TComponents.Popup_A.message(
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
      static message(msg1, msg_array = [], callback = null) {
        FPComponents.Popup_A.message(msg1, msg_array, callback);
      }

      /**
       * A popup dialog is a modal window that provides the user with information messages.
       * The main difference with TComponents.Popup_A.message is that TComponents.Popup_A.info includes a "i" image in the modal window.
       * @alias info
       * @memberof TComponents.Popup_A
       * @param {string} msg1 - A string, describing the topic of the message.
       * @param {string|string[]} [msg_array] - The actual message. Can be either a simple string or,
       * if several lines are required, an array where each element is a string with a message line.
       * @param {function(string): void} [callback] - A function that will be called when the user dismisses by pressing the 'OK' or 'Cancel' button.
       * @example
       * TComponents.Popup_A.info(
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
      static info(msg1, msg_array = [], callback = null) {
        FPComponents.Popup_A.message(
          msg1,
          msg_array,
          callback,
          FPComponents.Popup_A.STYLE.INFORMATION
        );
      }

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
       *    TComponents.Popup_A.waring('Something went wrong', [e.message, e.description]);
       *  }
       */
      static warning(msg1, msg_array = [], callback = null) {
        FPComponents.Popup_A.message(msg1, msg_array, callback, FPComponents.Popup_A.STYLE.WARNING);
      }

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
       *    TComponents.Popup_A.danger('Something went wrong', [e.message, e.description]);
       *  }
       */
      static danger(msg1, msg_array = [], callback = null) {
        FPComponents.Popup_A.message(msg1, msg_array, callback, FPComponents.Popup_A.STYLE.DANGER);
      }

      /**
       * A popup dialog is a modal window that provides the user with error messages.
       * @alias error
       * @memberof TComponents.Popup_A
       * @param {object} e - Error object thrown by Omnicore RWS
       * @private
       * @example
       *  try {
       *    throw new Error("Whoops!");
       *  } catch (e) {
       *    TComponents.Popup_A.error(e);
       *  };
       * @todo Optimize the parsing of error object
       */
      static error(e, callback = null) {
        const entries = Object.entries(e);
        const msgArray = [];
        entries.forEach(([key, value]) => {
          if (key !== 'message') {
            const json = JSON.stringify(value, null, 2)
              .replace(/"([^"]+)":/g, '$1:')
              .replace(/[{}]/g, '');

            const msg = `${key} -- ${json}`;
            msgArray.push(msg);
          }
        });

        const severity =
          e.controllerStatus !== undefined && e.controllerStatus.severity === 'Error'
            ? FPComponents.Popup_A.STYLE.DANGER
            : FPComponents.Popup_A.STYLE.WARNING;

        FPComponents.Popup_A.message(e.message, msgArray, callback, severity);
      }

      /**
       * TA popup dialog is a modal window that provides "OK/Cancel" confirmation dialog.
       * @param {string} msg1 - A string, describing the topic of the message.
       * @param {string|string[]} [msg_array] - The actual message. Can be either a simple string or,
       * if several lines are required, an array where each element is a string with a message line.
       * @param {function(string): void} [callback] - A function that will be called when the user dismisses by pressing the 'OK' or 'Cancel' button.
       * @example
       * TComponents.Popup_A.confirm(
       *   `${moduleName} module not yet loaded on the controller`,
       *   ['This module is required for this WebApp.', 'Do you want to load the module?'],
       *   if (action === TComponents.Popup_A.OK) {
       *     console.log("Load the module here...")
       *   } else if (action == FPComponents.Popup_A.CANCEL) {
       *     console.log("Abort mission!");
       *   }
       * );
       */
      static confirm(msg1, msg_array, callback = null) {
        FPComponents.Popup_A.confirm(msg1, msg_array, callback);
      }
    };
  }
})(TComponents);
