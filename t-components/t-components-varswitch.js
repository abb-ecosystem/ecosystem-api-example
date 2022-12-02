'use strict';
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('VarSwitch_A')) {
    /**
     * Switch connected to a RAPID variable. The variable must be of type boolean, otherwise an Error is thrown during initialization.
     * @class TComponents.VarSwitch_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @param {string} [module] - module to seach for variables
     * @param {string} [variable] - Rapid variable to subpscribe to
     * @param {string} [label] - label text
     */
    o.VarSwitch_A = class VarInput extends TComponents.Component_A {
      constructor(container, module = '', variable = '', label = '') {
        super(container, label);
        this._module = module;
        this._variable = variable;
        this.switchBtn = new FPComponents.Switch_A();
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        if (this._module && this._variable) {
          try {
            if (!this.task) this.task = await API.RAPID.getTask();
            this.varElement = await API.RAPID.getVariable(
              this.task.name,
              this._module,
              this._variable
            );
            // this.varElement.addCallbackOnChanged(this.cbUpdateSwitch.bind(this));
            this.varElement.onChanged(this.cbUpdateSwitch.bind(this));

            this.switchBtn.desc = this._label;
            this.switchBtn.active = await this.varElement.getValue();
            this.switchBtn.onchange = this.cbOnChange.bind(this);
            if (this.varElement.type !== 'bool')
              throw new Error(`TComponents.VarSwitch_A : ${this._variable} is not a bool variable`);
          } catch (e) {
            console.error(e);
            TComponents.Popup_A.error(e);
          }
        }
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        this.switchBtn.attachToElement(this.find('.switch-btn'));
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup(self) {
        return `
            <div class="switch-btn" ></div>
          `;
      }

      /**
       * RAPID variable
       * @alias variable
       * @type {string}
       * @memberof TComponents.VarSwitch_A
       */
      get variable() {
        return this._variable;
      }

      set variable(v) {
        (async () => {
          this._variable = v;
          await this.init();
        })();
      }

      /**
       * RAPID module
       * @alias module
       * @type {string}
       * @memberof TComponents.VarSwitch_A
       */
      get module() {
        return this._module;
      }

      set module(m) {
        this._module = m;
      }

      /**
       * Component label text
       * @alias label
       * @type {string}
       * @memberof TComponents.VarSwitch_A
       * @private
       */
      get label() {
        return this.switchBtn.desc ? this.switchBtn.desc : '';
      }

      /**
       * @private
       */
      set label(text) {
        this.switchBtn.desc = text;
      }

      /**
       * Callback function to update variable when switch state changes
       * @alias cbOnChange
       * @memberof TComponents.VarSwitch_A
       * @async
       * @private
       */
      async cbOnChange(value) {
        try {
          await this.varElement.setValue(value);
        } catch (e) {
          console.error(e);
          TComponents.Popup_A.danger('VarSwitch_A.cbOnChange', [e.message, e.description]);
        }
      }

      /**
       * Callback function to update switch when variable changes
       * @alias cbUpdateSwitch
       * @memberof TComponents.VarSwitch_A
       * @async
       * @private
       */
      cbUpdateSwitch(value) {
        this.switchBtn.active = value;
      }
    };
  }
})(TComponents);
