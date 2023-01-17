'use strict';
// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('VarIncrDecr_A')) {
    /**
     * Component connected to a variable together with increment and decrement buttons.
     * @class TComponents.VarIncrDecr_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} parent - DOM element in which this component is to be inserted
     * @param {string} [module] - module to seach for variables
     * @param {string} [variable] - Rapid variable to subpscribe to
     * @param {boolean} [readOnly] - if true, variable value is displayed and can only be modified with the increment and decrement buttons. If false, the value can also be directly modified
     * @param {number} [steps] - Increments/decrements steps applied at a button click (default = 1)
     * @param {string} [label] - label text
     */
    o.VarIncrDecr_A = class VarIncrDecr extends TComponents.Component_A {
      constructor(parent, module = '', variable = '', readOnly = false, steps = 1, label = '') {
        super(parent, label);
        this._module = module;
        this._variable = variable;
        this._readOnly = readOnly;
        this._steps = steps;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        if (this._module && this._variable)
          try {
            if (!this.task) this.task = await API.RAPID.getTask();
            this._var = await this.task.getVariable(this._module, this._variable);

            this._isNum = this._var.type === 'num' ? true : false;
            if (!this._isNum)
              TComponents.Popup_A.warning('VarIncrDecr view', [
                `${this._variable} is of type "${this._var.type}"`,
                'Only variables of type "num" are fully supported',
              ]);
          } catch (e) {
            console.error('VarIncrDerc: error occurr');
            TComponents.Popup_A.danger('VarIncrDecr view', [e.message, e.description]);
          }
      }

      /**
       * Instantiation of TComponents sub-components that shall be initialized in a synchronous way.
       * All this components are then accessible within {@link onRender() onRender} method by using this.child.<component-instance>
       * @private
       * @returns {object} Contains all child TComponents instances used within the component.
       */
      mapComponents() {
        return {
          var: this._readOnly
            ? new TComponents.VarIndicator_A(
                this.find('.tc-varincrdecr-var'),
                this._module,
                this._variable
              )
            : new TComponents.VarInput_A(
                this.find('.tc-varincrdecr-var'),
                this._module,
                this._variable
              ),
          incrValue: new TComponents.Button_A(
            this.find('.tc-varincrdecr-incr'),
            this.cbIncr.bind(this),
            '+'
          ),
          decrValue: new TComponents.Button_A(
            this.find('.tc-varincrdecr-decr'),
            this.cbDecr.bind(this),
            '-'
          ),
        };
      }

      onRender() {
        if (!this._isNum) {
          this.child.incrValue.enabled = false;
          this.child.decrValue.enabled = false;
        }
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
          <div class="tc-container-row">
            <div class="tc-varincrdecr-decr tc-item"></div>
            <div class="tc-varincrdecr-var tc-item"></div>
            <div class="tc-varincrdecr-incr tc-item"></div>
          </div>
        </div>
          `;
      }

      /**
       * RAPID variable
       * @alias variable
       * @type {string}
       * @memberof TComponents.VarIncrDecr_A
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
       * @memberof TComponents.VarIncrDecr_A
       */
      get module() {
        return this._module;
      }

      set module(m) {
        this._module = m;
      }

      /**
       * Increments/decrements steps applied at a button click (default = 1)
       * @alias steps
       * @type {number}
       * @memberof TComponents.VarIncrDecr_A
       */
      get steps() {
        return this._steps;
      }

      set steps(s) {
        this._steps = s;
      }

      /**
       * If true value can only be modified with the increment/decrement buttons. If false, the value can be directly modified by the user by clicking on it.
       * @alias readOnly
       * @type {boolean}
       * @memberof TComponents.VarIncrDecr_A
       */
      get readOnly() {
        return this._readOnly;
      }

      set readOnly(is) {
        this._readOnly = is;
        this.render();
      }

      /**
       * Callback function to update variable when increment button is clicked
       * @alias cbIncr
       * @memberof TComponents.VarIncrDecr_A
       * @async
       * @private
       */
      async cbIncr() {
        try {
          let cv = Number.parseInt(await this._var.getValue());
          cv += this._steps;
          this._var.setValue(cv);
        } catch (e) {
          TComponents.Popup_A.error(e);
        }
      }

      /**
       * Callback function to update variable when decrement button is clicked
       * @alias cbDecr
       * @memberof TComponents.VarIncrDecr_A
       * @async
       * @private
       */
      async cbDecr() {
        try {
          let cv = Number.parseInt(await this._var.getValue());
          cv -= this._steps;
          this._var.setValue(cv);
        } catch (e) {
          TComponents.Popup_A.error(e);
        }
      }

      /**
       * Adds a callback function that will be called when the RAPID variable value changes
       * @alias onChange
       * @memberof TComponents.VarIncrDecr_A
       * @param {function} func
       */
      onChange(func) {
        this.child.var.onChange(func);
      }
    };
  }
})(TComponents);

var tComponentStyle = document.createElement('style');
tComponentStyle.innerHTML = `

.tc-varincrdecr-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  min-width: fit-content;
}

`;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(tComponentStyle, ref);
