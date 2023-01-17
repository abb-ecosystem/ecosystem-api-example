'use strict';
// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('SignalSwitch_A')) {
    /**
     * Creates an instance of a switch connected to a signal
     * @class TComponents.SignalSwitch_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} parent - DOM element in which this component is to be inserted
     * @param {string | object} signal - Signal name, or API.CONFIG.SIGNAL.Signal object
     * @param {*} label
     */
    o.SignalSwitch_A = class SignalSwitch extends TComponents.Component_A {
      constructor(parent, signal, label = null) {
        super(parent, label);
        this._signal = signal;
        this._switch = new FPComponents.Switch_A();
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        try {
          if (typeof this._signal === 'string')
            this._signal = await API.SIGNAL.getSignal(this._signal);
          this._switch.active = await this._signal.getValue();
          this._signal.onChanged(this.cbUpdateSwitch.bind(this));
          this._signal.subscribe();
        } catch (e) {
          console.error(e);
          TComponents.Popup_A.error(e);
        }

        this._switch.onchange = this.cbOnChange.bind(this);
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        this._switch.attachToElement(this.find('.signal-switch'));
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup({ _label }) {
        return `
        <div class="tc-container-label">
          <p>${_label}</p>
          <div class="signal-switch tc-item"></div>
        </div>  
    `;
      }

      async cbUpdateSwitch(value) {
        value ? (this._switch.active = true) : (this._switch.active = false);
      }

      async cbOnChange(value) {
        try {
          this._switch.active ? await this._signal.setValue(1) : await this._signal.setValue(0);
        } catch (e) {
          console.error(e);
          TComponents.Popup_A.error(e);
        }
      }

      active(value = true) {
        this._switch.active = value;
      }

      set scale(value) {
        this._switch.scale = value;
      }
    };
  }
})(TComponents);
