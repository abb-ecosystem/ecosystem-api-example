import { Popup_A } from './t-components-popup.js';
import { Button_A } from './t-components-button.js';

/**
 * @typedef TComponents.ButtonCloseProps
 * @prop {boolean} confirm - Popup a confirmation message before closing
 * @prop {function|null} [callback] - Function to be called when button is pressed
 * @prop {string|null} [icon] - Path to image file
 * @prop {string} [label] - label text
 */

/**
 * Button to close this WebApp.
 * @class TComponents.ButtonClose_A
 * @extends TComponents.Button_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ButtonCloseProps} props -
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-close"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const btnClose = new ButtonClose_A(document.querySelector('.btn-close'), {
 *  confirm: true
 * });
 * btnClose.render();
 */
export class ButtonClose_A extends Button_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonCloseProps}
     */

    if (!this._props.label) this._props.label = 'Close App';
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonClose_A
   * @returns {TComponents.ButtonCloseProps}
   */
  defaultProps() {
    return { confirm: false };
  }

  async onInit() {
    // await super.onInit();

    this.onClick(this.close.bind(this));
    this.highlight = true;
  }

  /**
   * Closes this webapp
   * @alias close
   * @memberof TComponents.ButtonClose_A
   * @private
   */
  async close() {
    try {
      if (this._props.confirm) {
        Popup_A.confirm(
          'Close',
          `You are about to close this App.
               Do you want to proceed?`,
          async (value) => {
            if (value === 'ok') {
              try {
                App.Interaction.closeApp();
              } catch (e) {
                Popup_A.error(e, 'TComponents.Close_A ');
              }
            }
          },
        );
      } else {
        App.Interaction.closeApp();
      }
    } catch (e) {
      Popup_A.error(e, 'TComponents.Close_A ');
    }
  }
}
