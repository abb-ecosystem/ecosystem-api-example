'use strict';
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('ButtonMoveTo_A')) {
    /**
     * Button to jog the robot to a position provided by a RAPID robtarget variable.
     * @class TComponents.ButtonMoveTo_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {string} rapid_variable - Rapid variable to subpscribe to
     * @param {string} module - Module containig the rapid variable
     * @param {string} [label] - label text
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
    o.ButtonMoveTo_A = class ButtonMoveTo extends TComponents.Component_A {
      constructor(container, rapid_variable, module, label = '') {
        super(container, label);
        this._name = label;
        this._rapidVariable = rapid_variable;
        this._module = module;
        this._value = null;
        this._isJogging = false;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        try {
          this.task = await API.RAPID.getTask();
          this._value = await this.task.getValue(this._module, this._rapidVariable);
        } catch (e) {
          this.error = true;
          this._name = this._name;
          TComponents.Popup_A.warning(`Move to button`, [
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
          _btnMove: new TComponents.Button_A(
            this.find('.tc-button-move'),
            null,
            this._label ? this._label : `Move to rapid_variable`
          ),
        };
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        if (this.error) this.child._btnMove.enabled = false;

        const elemBtnMove = this.find('.fp-components-button');
        elemBtnMove.addEventListener('pointerdown', this.move.bind(this));
        elemBtnMove.addEventListener('pointerup', this.stop.bind(this));
        elemBtnMove.addEventListener('pointerleave', this.stop.bind(this));
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup({}) {
        return `
          <div>
            <div class="tc-button-move"></div>
          </div>
        `;
      }

      /**
       * Jogs the robot to the position defined at rapid_variable
       * @alias move
       * @memberof TComponents.ButtonMoveTo_A
       * @async
       */
      async move() {
        if (this.child._btnMove.enabled) {
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
            TComponents.Popup_A.error(e);
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
        if (this.child._btnMove.enabled) {
          if (this._isJogging) {
            try {
              await API.MOTION.stopJogging();
            } catch (e) {
              TComponents.Popup_A.error(e);
            }
            this._isJogging = false;
          }
        }
      }
    };
  }
})(TComponents);
