// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('ButtonProcedure_A')) {
    /**
     * Button for procedure execution. The behaviour depends on stopOnRelease value  (default=false).
     * When stopOnRelease equals false, then the procedure is started after press and release of the button.
     * Wehn stopOnRelease equals true, then the procedure is started when pressing, and stopped when releasing the button.
     * @class TComponents.ButtonProcedure_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
     * @param {string} [procedure] - Procedure to be called
     * @param {Boolean} [userLevel] - if true, execution level is set to “user level”, i.e. execute as a service routine.
     * In this case "motor on" is not required in procedures that no motion is executed.
     * @param {string} [label] - label text
     * @param {boolean} [stopOnRelease]
     * @param {string} [task]
     * @example
     * btnProcedure: new TComponents.ButtonProcedure_A(
     *   document.querySelector('.my-class'),
     *   '',
     *   true,
     *   'Execute'
     * ),
     */
    o.ButtonProcedure_A = class ButtonProcedure extends TComponents.Component_A {
      constructor(
        parent,
        procedure = '',
        userLevel = false,
        label = '',
        stopOnRelease = false,
        task = 'T_ROB1'
      ) {
        super(parent, label);
        this._task = task;
        this._procedure = procedure;
        this._userLevel = userLevel;
        this._stopOnRelease = stopOnRelease;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        if (!this.rapidTask) this.rapidTask = await API.RAPID.getTask(this._task);
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
            // this.find(".tc-btn-procedure"),
            this.container,
            this._stopOnRelease ? null : this.cbOnClick.bind(this),
            this._label
          ),
        };
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        if (this._stopOnRelease) {
          const elemBtnMove = this.find('.fp-components-button');
          elemBtnMove.addEventListener('pointerdown', this.cbOnClick.bind(this));
          elemBtnMove.addEventListener('pointerup', this.cbStop.bind(this));
          elemBtnMove.addEventListener('pointerleave', this.cbStop.bind(this));
        }
      }

      /**
       * Excecutes a procedure when button is pressed. The behaviour depends on the constructor stopOnRelease (default=false).
       * When stopOnRelease equals false, then the procedure is started after press and release of the button.
       * Wehn stopOnRelease equals true, then the procedure is started when pressing, and stopped when releasing the button.
       * @alias cbOnClick
       * @memberof TComponents.ButtonProcedure_A
       * @async
       * @private
       */
      async cbOnClick() {
        if (this._enabled) {
          try {
            this.stop = false;
            if (this._procedure) {
              const cb = async () => {
                this._enabled = false;
                await API.sleep(500);
                this._enabled = true;
              };
              setTimeout(cb.bind(this));
              await this.rapidTask.executeProcedure(this._procedure, this._userLevel);
            }
            this.stopped = true;
          } catch (e) {
            this.stopped = true;
            if (!this.stop) TComponents.Popup_A.danger(`Procedure ${this._procedure}`, e.message);
          }
        }
      }

      /**
       * Stops running procedure
       * @alias cbOnClick
       * @memberof TComponents.ButtonProcedure_A
       * @async
       * @private
       */
      async cbStop() {
        try {
          this.stop = true;
          await this.rapidTask.stopExecution();
          // just in case the procedure has not yet started
          await API.sleep(200);
          await this.rapidTask.stopExecution();
        } catch (e) {
          TComponents.Popup_A.danger('Failed to execute procedure', [e.message, e.description]);
        }
      }

      /**
       * Procedure to be executed
       * @alias procedure
       * @type {string}
       * @memberof TComponents.ButtonProcedure_A
       */
      get procedure() {
        return this._procedure;
      }

      set procedure(text) {
        this._procedure = text;
      }

      /**
       * If true, the procedure is executed as service routine, therefore, motor on is not required
       * If false, the procedure is executed
       * @alias userLevel
       * @type {boolean}
       * @memberof TComponents.ButtonProcedure_A
       */
      get userLevel() {
        return this._userLevel;
      }
      set userLevel(userLevel) {
        this._userLevel = userLevel;
      }

      /**
       * Component label text
       * @alias label
       * @type {string}
       * @memberof TComponents.ButtonProcedure_A
       * @private
       */
      get label() {
        return this._label;
      }
      /**
       * @private
       */
      set label(text) {
        this._label = text;
        this.render();
      }

      /**
       * Task containing the procedure (default value "T_ROB1").
       * @alias task
       * @type {string}
       * @memberof TComponents.ButtonProcedure_A
       */
      get task() {
        return this._task;
      }

      set task(text) {
        (async () => {
          this._task = text;
          this.rapidTask = await API.RAPID.getTask(this._task);
          this.render();
        })();
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
