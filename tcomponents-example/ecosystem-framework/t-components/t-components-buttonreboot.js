import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Button_A } from './t-components-button.js';

/**
 * @typedef TComponents.ButtonRebootProps
 * @prop {boolean} confirm - Popup an confirmation message before restarting
 * @prop {function|null} [callback] - Function to be called when button is pressed
 * @prop {string|null} [icon] - Path to image file
 * @prop {string} [label] - label text
 */

/**
 * Button to restart the controller.
 * @class TComponents.ButtonReboot_A
 * @extends TComponents.Button_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ButtonRebootProps} props -
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-reboot"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const btnReboot = new ButtonReboot_A(document.querySelector('.btn-reboot'), {
 *  confirm: true
 * });
 * btnRebbot.render();
 */
export class ButtonReboot_A extends Button_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonRebootProps}
     */

    if (!this._props.label) this._props.label = 'Reboot';
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonReboot_A
   * @returns {TComponents.ButtonRebootProps}
   */
  defaultProps() {
    return { confirm: false };
  }

  async onInit() {
    // await super.onInit();

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
      if (this._props.confirm) {
        Popup_A.confirm(
          'Reboot',
          `You are about to reboot the controller.
               Do you want to proceed?`,
          async (value) => {
            if (value === 'ok') {
              try {
                await API.CONTROLLER.restart();
              } catch (e) {
                Popup_A.error(e, 'TComponents.Reboot_A ');
              }
            }
          }
        );
      } else {
        await API.CONTROLLER.restart();
      }
    } catch (e) {
      Popup_A.error(e, 'TComponents.Reboot_A ');
    }
  }
}
