// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('ButtonReboot_A')) {
    /**
     * Button to restart the controller.
     * @class TComponents.ButtonReboot_A
     * @extends TComponents.Button_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {boolean} confirm - Popup an confirmation message before restarting
     * @param {function|null} [callback] - Function to be called when button is pressed
     * @param {string} [label] - Label of the component
     * @param {string|null} [icon] - Path to image file
     * @example
     * const btnReboot = new TComponents.ButtonReboot_A(document.querySelector('.reboot-view'));
     * btnRebbot.render();
     */
    o.ButtonReboot_A = class ButtonReboot extends TComponents.Button_A {
      constructor(parent, confirm = false, label = '', callback = null, icon = null) {
        super(parent, callback, label, icon);
        this.confirm = confirm;
      }

      async onInit() {
        await super.onInit();
        if (!this.label) this.label = 'Reboot';
        this.onClick(this.reboot.bind(this));
        this.highlight = true;
      }

      /**
       * Restarts the controller
       * @alias reboot
       * @memberof TComponents.ButtonReboot_A
       * @private
       */
      async reboot() {
        try {
          if (this.confirm) {
            TComponents.Popup_A.confirm(
              'Reboot',
              `You are about to reboot the controller.
               Do you want to proceed?`,
              async (value) => {
                if (value === 'ok') {
                  try {
                    await API.CONTROLLER.restart();
                  } catch (e) {
                    TComponents.Popup_A.error(e, 'TComponents.Reboot_A ');
                  }
                }
              }
            );
          } else {
            await API.CONTROLLER.restart();
          }
        } catch (e) {
          TComponents.Popup_A.error(e, 'TComponents.Reboot_A ');
        }
      }
    };
  }
})(TComponents);
