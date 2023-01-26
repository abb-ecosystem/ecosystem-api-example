// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('ButtonTeach_A')) {
    /**
     * Button to teach the current position into a RAPID robtarget variable
     * @class TComponents.ButtonTeach_A
     * @extends TComponents.Button_A
     * @param {HTMLElement} container
     * @param {string} rapid_variable - Rapid variable to subpscribe to
     * @param {string} module - Module containig the rapid variable
     * @param {string} [label] - label text
     * @param {function|null} [callback] - Function to be called when button is pressed
     * @param {string|null} [img] - Path to image file
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
    o.ButtonTeach_A = class ButtonTeach extends TComponents.Button_A {
      constructor(parent, rapid_variable, module, label = '', callback = null, icon = null) {
        super(parent, callback, label, icon);
        this._rapidVariable = rapid_variable;
        this._module = module;
        this._value = null;
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

          this.task = await API.RAPID.getTask();
          this._value = await this.task.getValue(this._module, this._rapidVariable);
          if (!this.label) this.label = 'Teach';
          this.onClick(this.teach.bind(this));
        } catch (e) {
          this._btn.enabled = false;
          TComponents.Popup_A.warning(`Teach button`, [
            `Error when gettin variable ${this._rapidVariable}`,
            e.message,
          ]);
        }
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
          TComponents.Popup_A.error(e, `ButtonTeach: robtarget: ${this._rapidVariable}`);
        }
      }
    };
  }
})(TComponents);
