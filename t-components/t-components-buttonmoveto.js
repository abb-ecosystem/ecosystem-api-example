// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('ButtonMoveTo_A')) {
    /**
     * Button to jog the robot to a position provided by a RAPID robtarget variable.
     * @class TComponents.ButtonMoveTo_A
     * @extends TComponents.Button_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {string} rapid_variable - Rapid variable to subpscribe to
     * @param {string} module - Module containig the rapid variable
     * @param {function|null} [callback] - Function to be called when button is pressed
     * @param {string} [label] - Label of the component
     * @param {string|null} [icon] - Path to image file
     * @example
     *
     * const btnMove = new TComponents.ButtonMoveTo_A(
     *    document.querySelector('.btn-move'),
     *    'esTarget02',
     *    'Ecosystem_BASE',
     *    'move to'
     *  );
     *  await btnMove.render();
     */
    o.ButtonMoveTo_A = class ButtonMoveTo extends TComponents.Button_A {
      constructor(parent, rapid_variable, module, label = '', callback = null, icon = null) {
        super(parent, callback, label, icon);
        this._rapidVariable = rapid_variable;
        this._module = module;
        this._value = null;
        this._isJogging = false;
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
          if (!this.label) this.label = 'Move to';
        } catch (e) {
          this.error = true;

          TComponents.Popup_A.warning(`Move to button`, [
            `Error when gettin variable ${this._rapidVariable}`,
            e.message,
          ]);
        }
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @protected
       */
      onRender() {
        super.onRender();
        if (this.error) this._btn.enabled = false;

        const elemBtnMove = this.container;
        elemBtnMove.addEventListener('pointerdown', this.move.bind(this));
        elemBtnMove.addEventListener('pointerup', this.stop.bind(this));
        elemBtnMove.addEventListener('pointerleave', this.stop.bind(this));
      }

      /**
       * Jogs the robot to the position defined at rapid_variable
       * @alias move
       * @memberof TComponents.ButtonMoveTo_A
       * @async
       */
      async move() {
        if (this._btn.enabled) {
          const jogData = [500, 500, 500, 500, 500, 500];
          this._value = await this.task.getValue(this._module, this._rapidVariable);
          if (!this._value) return;
          try {
            this._isJogging = true;
            await API.MOTION.executeJogging(
              '',
              '',
              '',
              API.MOTION.JOGMODE.GoToPos,
              jogData,
              this._value
            );
          } catch (e) {
            this._isJogging = false;
            TComponents.Popup_A.error(e, 'TComponents.ButtonMoveTo_A');
          }
        }
      }

      /**
       * Stops jogging
       * @alias stop
       * @memberof TComponents.ButtonMoveTo_A
       * @async
       */
      async stop() {
        if (this._btn.enabled) {
          if (this._isJogging) {
            try {
              await API.MOTION.stopJogging();
            } catch (e) {
              TComponents.Popup_A.error(e, 'TComponents.ButtonMoveTo_A');
            }
            this._isJogging = false;
          }
        }
      }
    };
  }
})(TComponents);
