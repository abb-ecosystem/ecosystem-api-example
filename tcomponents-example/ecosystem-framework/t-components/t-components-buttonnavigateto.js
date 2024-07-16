import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';
import { Button_A } from './t-components-button.js';

/**
 * @typedef TComponents.ButtonNavigateToProps
 * @prop {boolean} confirm - Popup a confirmation message before closing
 * @prop {function|null} [onClick] - Function to be called when button is pressed
 * @prop {string|null} [icon] - Path to image file
 * @prop {string} [label] - label text
 * @prop {string} [text] Button text
 * @prop {string} appName - Name of the webapp to navigate to
 * @prop {string} appPage - Name of the page to navigate to
 * @prop {string} url - URL to pass infos to the webapp
 */

/**
 * Button to navigate to other Flexpendant WebApp.
 * @class TComponents.ButtonNavigateTo_A
 * @extends TComponents.Button_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ButtonNavigateToProps} props -
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-navigate"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const btnWebApp = new ButtonNavigateTo_A(document.querySelector('.btn-namigate'), {
 *  appName: Jog,
 *  appPage: 'JoystikJog',
 * });
 * btnWebApp.render();
 */
export class ButtonNavigateTo_A extends Button_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonNavigateToProps}
     */
    this._info = { AppName: this._props.appName, Message: '' };
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonNavigateTo_A
   * @returns {TComponents.ButtonNavigateToProps}
   */
  defaultProps() {
    return { appName: '', appPage: '', url: '' };
  }

  async onInit() {
    this.onClick(this._navigateTo.bind(this));
    this.highlight = true;

    // if not yet available create a global funciton called appNavigateTo
    if (!window.appNavigateTo) {
      window.appNavigateTo = (info) => {
        return Promise.resolve();
      };
    }

    // if not yet available create a global funciton called onMessageReceived
    if (!window.onMessageReceived) {
      window.onMessageReceived = (info) => {
        return Promise.resolve();
      };
    }
  }

  onRender() {
    // workaround
    window['_onNavigateToResponse'] = ButtonNavigateTo_A._onNavigateToResponse;
    Component_A.globalEvents.on('navigate-to-response', (info) => {
      console.log('🚀 ~ on navigate-to-response', info);
    });
    if (!this._props.text) this._props.text = this._props.appName ? this._props.appName : 'Navigate';
    this._generateInfo();
    super.onRender();
  }
  /**
   * Navigate to webapp
   * @alias _navigateTo
   * @memberof TComponents.ButtonNavigateTo_A
   * @private
   */
  async _navigateTo() {
    try {
      this._isFlexpendant = typeof window.external !== 'undefined' && 'notify' in window.external;
      if (this._isFlexpendant) {
        App.Interaction.sendNavigateToRequest(this._info);

        // workaround for I/O app, since it does not response to navigateToRequest
        if (this._info.AppName === 'I/O' || this._info.AppName === 'Calibrate') {
          API.sleep(2000);
          window._onNavigateToResponse('{"Success": true}');
        }
      } else {
        Popup_A.info('ButtonNavigateTo_A', 'Not running on Flexpendant, cannot navigate to other webapp.');
      }
    } catch (e) {
      Popup_A.error(e, 'TComponents.NavigateTo_A');
    }
  }

  _generateInfo() {
    const msg = `navigateToPage = ${this._props.appPage ? this._props.appPage : this._props.appName} & url = ${
      !this._props.url ? 'None' : this._props.url
    }`;
    this._info = { AppName: this._props.appName, Message: msg };
  }

  static _onNavigateToResponse(info) {
    console.log('🚀 ~ file: t-components-buttonnavigateto.js ~ info', info);

    Component_A.globalEvents.trigger('navigate-to-response', info);
    window.App.Interaction.onNavigateToResponse(info);
  }
}
