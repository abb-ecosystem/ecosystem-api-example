'use strict';

var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('VarButton_A')) {
    /**
     * Creates a button that triggers registered callback functions and pass them the value of a RAPID variable
     * @class TComponents.VarButton_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} container - DOM element in which this component is to be inserted
     * @param {string} module - RAPID module containig the variable
     * @param {string} variable - RAPID variable
     * @param {function} [callback] Callback function
     * @param {string} [label] - Label text
     * @param {string} [img] - Path to image file
     * @param {string} [task] - RAPID Task in which the variable is contained (default = "T_ROB1" )
     * @example
     * const upButton = await new TComponents.VarButton_A(
     *    document.querySelector('#button-moveUp'),
     *    'Wizard',
     *    'UpLimit',
     *    async function (value) {
     *      Set_Pos(value);
     *    },
     *    'Up'
     *  ).render();
     */
    o.VarButton_A = class VarButton extends TComponents.Component_A {
      constructor(
        container,
        module,
        variable,
        callback = null,
        label = '',
        img = null,
        task = 'T_ROB1'
      ) {
        super(container, label);
        this._module = module;
        this._variable = variable;
        this._taskName = task;
        this.img = img;
        // this.handler = handler;
        this.callbacks = [];
        if (callback) this.onClick(callback);
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        try {
          if (!this.task) this.task = await API.RAPID.getTask(this._taskName);
          this.varElement = await API.RAPID.getVariable(
            this.task.name,
            this._module,
            this._variable
          );
        } catch (e) {}
        this._btn = new FPComponents.Button_A();
        this._btn.text = this._label;
        if (this.img !== null) this._btn.icon = this.img;

        const cb = async () => {
          for (let i = 0; i < this.callbacks.length; i++) {
            try {
              const value = await this.varElement.getValue();
              this.callbacks[i](value);
            } catch (e) {
              TComponents.Popup_A.warning(`TComponents.Button callback failed.`, [
                e.message,
                e.description,
              ]);
            }
          }
        };
        this._btn.onclick = cb.bind(this);
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        const btnEl = this.find('.tc-button');
        this._btn.attachToElement(btnEl);

        const btnElem = this.find('.fp-components-button');
        btnElem.classList.add('tc-button-style');
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup({ _label }) {
        return `
            <div class="tc-button tc-item"></div>
          `;
      }

      /**
       * Component label text
       * @alias label
       * @type {string}
       * @memberof TComponents.VarButton_A
       * @private
       */
      get label() {
        return this._btn.text;
      }

      /**
       * @private
       */
      set label(t) {
        this._btn.text = t;
      }

      /**
       * Adds a callback to be called when the button is pressed. Multiple callbacks can be registered by calling this method multiple times.
       * @alias onClick
       * @memberof TComponents.VarButton_A
       * @param   {function}  callback    The callback function which is called when the button is pressed
       */
      onClick(callback) {
        if (typeof callback !== 'function') throw new Error('callback is not a valid function');
        this.callbacks.push(callback);
      }
    };
  }
})(TComponents);

var tComponentStyle = document.createElement('style');
tComponentStyle.innerHTML = `

.tc-button-style {
  border-radius: 25px !important;
}

`;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(tComponentStyle, ref);
