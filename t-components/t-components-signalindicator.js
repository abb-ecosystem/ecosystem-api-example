'use strict';
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('SignalIndicator_A')) {
    /**
     * @class TComponents.SignalIndicator_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {string} signal
     * @param {string} [label] - label text
     */
    o.SignalIndicator_A = class SignalIndicator extends TComponents.Component_A {
      constructor(container, signal, label = '') {
        super(container);
        this._signal = signal;
        this._label = label;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        this._indicator = new FPComponents.Digital_A();
        const cbUpdateIndicator = function (value) {
          this._indicator.active = value;
        };
        try {
          if (typeof this._signal === 'string')
            this._signal = await API.SIGNAL.getSignal(this._signal);

          this._signal.addCallbackOnChanged(cbUpdateIndicator.bind(this));
          this._signal.subscribe();
          this._indicator.text = this._signal;
          this._indicator.active = await this._signal.getValue();
        } catch (e) {
          TComponents.Popup_A.error(e);
        }
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        this._indicator.attachToElement(this.find(`.signal-indicator`));
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup({ _label }) {
        return `
          <div class="tc-container-row">
            <div class="signal-indicator tc-item"></div>
            <div class="signal-name tc-item">${_label}</div>
          </div>
        `;
      }

      get signal() {
        return this._signal;
      }
    };
  }
})(TComponents);
