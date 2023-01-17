// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('ButtonTeach_A')) {
    /**
     * Button to teach the current position into a RAPID robtarget variable
     * @class TComponents.ButtonTeach_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} container
     * @param {string} rapid_variable - Rapid variable to subpscribe to
     * @param {string} module - Module containig the rapid variable
     * @param {string} [label] - label text
     * @example
     *
     * const btnTeach = new TComponents.ButtonTeach_A(
     *    document.querySelector('.btn-teach'),
     *    'esTarget02',
     *    'Ecosystem_BASE',
     *    'teach'
     *  );
     *  await btnTeach.render();
     */
    o.ButtonTeach_A = class ButtonTeach extends TComponents.Component_A {
      constructor(parent, rapid_variable, module, label = '') {
        super(parent, label);
        this._rapidVariable = rapid_variable;
        this._module = module;
        this._value = null;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        // this._btn = new FPComponents.Button_A();
        // this._btn.text = label ? label : `Teach rapid_variable`;
        // this._btn.onclick = this.teach.bind(this);

        try {
          this.task = await API.RAPID.getTask();
          this._value = await this.task.getValue(this._module, this._rapidVariable);
        } catch (e) {
          this.child._btn.enabled = false;
          TComponents.Popup_A.warning(`Teach button`, [
            `Error when gettin variable ${this._rapidVariable}`,
            e.message,
          ]);
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
          _btn: new TComponents.Button_A(
            this.container,
            this.teach.bind(this),
            this._label ? this._label : `Teach`
          ),
        };
      }

      /**
       * Saves the current robot position in to rapid_variable. This method is called when pressing the instance button.
       * @alias teach
       * @memberof TComponents.ButtonTeach_A
       * @async
       */
      async teach() {
        this._value = await API.MOTION.getRobotPosition();
        try {
          await this.task.setValue(this._module, this._rapidVariable, this._value);
        } catch (e) {
          TComponents.Popup_A.error(e);
        }
      }

      get highlight() {
        return this.child._btn.highlight;
      }

      set highlight(value) {
        this.child._btn.highlight = value;
      }

      get icon() {
        return this.child._btn.icon;
      }

      set icon(value) {
        this.child._btn.icon = value;
      }
    };
  }
})(TComponents);
