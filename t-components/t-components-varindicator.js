'use strict';
// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('VarIndicator_A')) {
    /**
     * Display field connected to a RAPID variable. It supports variables of type "num", "bool" and "strings".
     * @class TComponents.VarIndicator_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} parent - DOM element in which this component is to be inserted
     * @param {string} [module] - module to seach for variables
     * @param {string} [variable] - Rapid variable to subpscribe to
     * @param {string} [label] - label text
     * @param {boolean} [useIndicatorBorder] - if true, creates a border around the value
     * @todo add restriction to association to not supported variables, liek robtarget
     */
    o.VarIndicator_A = class VarIndicator extends TComponents.Component_A {
      constructor(parent, module = '', variable = '', label = '', useIndicatorBorder = false) {
        super(parent, label);
        this._module = module;
        this._variable = variable;
        this._id = `tc-varindicator-${API.generateUUID()}`;
        this._useIndicatorBorder = useIndicatorBorder;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        try {
          if (this._module && this._variable) {
            if (!this.task) this.task = await API.RAPID.getTask();

            this.varElement = await API.RAPID.getVariable(
              this.task.name,
              this._module,
              this._variable
            );
            this.varElement.onChanged(this.cbVarChanged.bind(this));

            this._varValue = await this.varElement.getValue();
          }
        } catch (e) {
          TComponents.Popup_A.danger('VarIndicator_A', [e.message, e.description]);
        }
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        this.useIndicatorBorder(this._useIndicatorBorder);
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup({ _label, _id, _varValue }) {
        return `
        <div class="tc-container-label">
          <p>${_label}</p>
          <div class="tc-container">
            <div id="${_id}" class="tc-varindicator-ind">${_varValue}</div>
          </div>
        </div>
          `;
      }

      /**
       * RAPID variable
       * @alias variable
       * @type {string}
       * @memberof TComponents.VarIndicator_A
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
       * @memberof TComponents.VarIndicator_A
       */
      get module() {
        return this._module;
      }

      set module(m) {
        this._module = m;
      }

      /**
       * Callback function to update input field when variable changes
       * @alias cbUpdateInputField
       * @memberof TComponents.VarIndicator_A
       * @async
       * @private
       */
      cbVarChanged(value) {
        const elem = this.find(`#${this._id}`);
        elem && (elem.textContent = value);

        this.trigger('change', value);
      }

      /**
       * Adds a callback function that will be called when the RAPID variable value changes
       * @alias onChange
       * @memberof TComponents.VarIndicator_A
       * @param {function} func
       */
      onChange(func) {
        this.on('change', func);
      }

      /**
       * if true, displays a border around the variable value, otherwise no border is displayed
       * @alias useIndicatorBorder
       * @memberof TComponents.VarIndicator_A
       * @async
       */
      useIndicatorBorder(value = true) {
        const indicator = this.find('.tc-varindicator-ind');
        if (value) {
          if (indicator.style.border) indicator.style.removeProperty('border');
        } else {
          indicator.style.setProperty('border', 'none');
        }
      }
    };
  }
})(TComponents);

var tComponentStyle = document.createElement('style');
tComponentStyle.innerHTML = `

.tc-varindicator-label {
  display: block;
  margin-bottom: 6px;
  font-size: inherit;
}

.tc-varindicator-ind {
  display: flex;
  border:2px solid;
  border-color: var(--t-color-GRAY-40);
  min-width: 90px;
  min-height: 35px;
  align-self: flex-start;
  line-height: 30px;
  padding-left: 6px;
  margin: 8px;
}

`;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(tComponentStyle, ref);
