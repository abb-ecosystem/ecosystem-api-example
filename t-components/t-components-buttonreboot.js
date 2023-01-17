// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('ButtonReboot_A')) {
    /**
     * Button to restart the controller.
     * @class TComponents.ButtonReboot_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @example
     * const btnReboot = new TComponents.ButtonReboot_A(document.querySelector('.reboot-view'));
     * btnRebbot.render();
     */
    o.ButtonReboot_A = class ButtonReboot extends TComponents.Component_A {
      constructor(parent) {
        super(parent);
        this.btnReboot = new FPComponents.Button_A();
        this.btnReboot.text = 'Reboot';
        this.btnReboot.onclick = this.reboot.bind(this);
        this.btnReboot.highlight = true;
        this.btnReboot.attachToElement(this.container);
      }

      /**
       * Restarts the controller
       * @alias reboot
       * @memberof TComponents.ButtonReboot_A
       * @private
       */
      reboot() {
        API.CONTROLLER.restart();
      }
    };
  }
})(TComponents);
