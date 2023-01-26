// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('VarButton_A')) {
    /**
     * Creates a button that triggers registered callback functions and pass them the value of a RAPID variable
     * @class TComponents.VarButton_A
     * @extends TComponents.Button_A
     * @param {HTMLElement} parent - DOM element in which this component is to be inserted
     * @param {string} module - RAPID module containig the variable
     * @param {string} variable - RAPID variable
     * @param {function} [callback] Callback function
     * @param {string} [label] - Label text
     * @param {string} [icon] - Path to image file
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
    o.VarButton_A = class VarButton extends TComponents.Button_A {
      constructor(
        parent,
        module,
        variable,
        callback = null,
        label = '',
        icon = null,
        task = 'T_ROB1'
      ) {
        super(parent, callback, label, icon);
        this._module = module;
        this._variable = variable;
        this._taskName = task;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @protected
       * @async
       */
      async onInit() {
        try {
          await super.onInit();

          if (!this.task) this.task = await API.RAPID.getTask(this._taskName);
          this.varElement = await API.RAPID.getVariable(
            this.task.name,
            this._module,
            this._variable
          );
        } catch (e) {
          TComponents.Popup_A.error(e, `TComponents.VarButton_A onInit failed.`);
        }
      }

      /**
       * Callback function which is called when the button is pressed, it trigger any function registered with {@link onClick() onClick}
       * @alias cbOnClick
       * @memberof TComponents.Button_A
       * @protected
       * @async
       */
      async cbOnClick() {
        const var_value = await this.varElement.getValue();
        this.trigger('click', var_value);
      }
    };
  }
})(TComponents);
