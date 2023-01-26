'use strict';
// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('VarInput_A')) {
    /**
     * Input field connected to a RAPID variable
     * @class TComponents.VarInput_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} parent - DOM element in which this component is to be inserted
     * @param {string} [module] - module to seach for variables
     * @param {string} [variable] - Rapid variable to subpscribe to
     * @param {string} [label] - label text
     */
    o.VarInput_A = class VarInput extends TComponents.Component_A {
      constructor(parent, module = '', variable = '', label = '') {
        super(parent);
        this._module = module;
        this._variable = variable;
        this.inputField = new FPComponents.Input_A();
        this.inputField.desc = label;
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
            this.varElement = await this.task.getVariable(this._module, this._variable);
            this.varElement.onChanged(this.cbUpdateInputField.bind(this));
            this.inputField.text = await this.varElement.getValue();
            this.inputField.onchange = this.cbOnChange.bind(this);
            if (this.varElement.type === 'num' || this.varElement.type === 'dnum')
              this.inputField.regex = /^-?[0-9]+(\.[0-9]+)?$/;
            if (this.varElement.type === 'bool')
              this.inputField.regex = /^([Tt][Rr][Uu][Ee]|[Ff][Aa][Ll][Ss][Ee])$/;
          } catch (e) {
            console.error(e);
            TComponents.Popup_A.error(e, 'TComponents.VarInput_A.onInit');
          }
        }
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        this.inputField.attachToElement(this.find('.tc-varindicator-input'));
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup(self) {
        return `
            <div class="tc-varindicator-input" ></div>
          `;
      }

      /**
       * RAPID variable
       * @alias variable
       * @type {string}
       * @memberof TComponents.VarInput_A
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
       * @memberof TComponents.VarInput_A
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
       * @memberof TComponents.VarInput_A
       */
      get label() {
        return this.inputField.desc ? this.inputField.desc : '';
      }

      /**
       * @private
       */
      set label(text) {
        this.inputField.desc = text;
      }

      /**
       * @alias validator
       * @type {function}
       * @memberof TComponents.VarInput_A
       */
      set validator(func) {
        this.inputField.validator = func;
      }

      /**
       * Callback function to update variable when input field state changes
       * @alias cbOnChange
       * @memberof TComponents.VarInput_A
       * @async
       */
      async cbOnChange(value) {
        try {
          if (this.varElement.type === 'bool') {
            if (value.toLowerCase() === 'true') await this.varElement.setValue(true);
            else if (value.toLowerCase() === 'false') await this.varElement.setValue(false);
            else throw new Error('Boolean value not recognized');
          } else await this.varElement.setValue(value);
        } catch (e) {
          console.error(e);
          TComponents.Popup_A.error(e, 'TComponents.VarInput_A.cbOnChange');
        }
      }

      /**
       * Callback function to update input field when variable changes
       * @alias cbUpdateInputField
       * @memberof TComponents.VarInput_A
       * @async
       */
      async cbUpdateInputField(value) {
        this.inputField.text = value;
        this.trigger('change' + this._compId, value);
      }

      /**
       * Adds a callback function that will be called when the RAPID variable value changes
       * @alias onChange
       * @memberof TComponents.VarInput_A
       * @param {function} func
       */
      onChange(func) {
        this.on('change' + this._compId, func);
      }
    };
  }
})(TComponents);

var tComponentStyle = document.createElement('style');
tComponentStyle.innerHTML = `

.tc-varindicator-input {
  min-width: 100px;
}

`;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(tComponentStyle, ref);
