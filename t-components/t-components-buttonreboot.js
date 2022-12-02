'use strict';
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
      constructor(container) {
        super(container);
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        this.btnReboot = new FPComponents.Button_A();

        this.btnReboot.text = 'Reboot';
        this.btnReboot.onclick = this.reboot.bind(this);
        this.btnReboot.highlight = true;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        this.btnReboot.attachToElement(this.find('.tc-btn-reboot'));
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup({}) {
        return `
          <div class="tc-row">
            <div class="tc-btn-reboot"></div>
          </div>
          `;
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
