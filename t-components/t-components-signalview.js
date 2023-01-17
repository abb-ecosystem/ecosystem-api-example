'use strict';
// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('SignalView_A')) {
    /**
     * Instance of a Signal view containing an indicator, signal information (name, type, device, map) and a optional connection to TComponents.SignalEdit_A component for editing the signal.
     * @class TComponents.SignalView_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} parent - DOM element in which this component is to be inserted
     * @param {string | object} signal - Signal name, or API.CONFIG.SIGNAL.Signal object
     * @param {boolean} hasSwitch - To enable/disable the precense of a swith
     * @param {boolean} hasEditButton - To enable/disable the editing button
     * @example
     * const signal = new TComponents.SignalView_A(
     *    document.querySelector('.signal-container'),
     *    'signal_name',
     *    true, //hasSwitch
     *    true //hasEditButton
     *  );
     *  await signal.render();
     *
     * const editSignal = new TComponents.SignalEdit_A(
     *   document.querySelector('.edit-signal'),
     *   'di_signal'
     * );
     *
     * // Modal window will contain the signal editor
     * const modalWindow =  new TComponents.ModalWindow_A(
     *   document.querySelector('.modal-window'),
     *   editSignal
     * );
     * await modalWindow.render();
     *
     * // In order to connect the signal to the modal window
     * // this is automatically forwarded to the signal editor
     * modalWindow.triggerElements(signal.getEditButton())
     * @see TComponents.SignalEdit_A
     */
    o.SignalView_A = class SignalView extends TComponents.Component_A {
      constructor(parent, signal, hasSwitch = false, hasEditButton = true) {
        super(parent);
        this._signal = signal;
        this._id = `signal-view-${API.generateUUID()}`;
        this._hasSwitch = hasSwitch;
        this._hasEdit = hasEditButton;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        try {
          if (typeof this._signal === 'string') {
            this._signal = await API.SIGNAL.getSignal(this._signal);
          }
          this._signal.modified ? (this.modified = true) : (this.modified = false);
        } catch (e) {
          TComponents.Popup_A.error(e);
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
          indicator: new TComponents.SignalIndicator_A(
            this.find(`.tc-signal-view-ind`),
            this._signal.name,
            ''
          ),
          switch: this._hasSwitch
            ? new TComponents.SignalSwitch_A(
                this.find('.tc-signal-view-switch'),
                this._signal.name,
                ''
              )
            : '',
        };
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        this._hasEdit
          ? this.find(`.tc-edit-btn`).classList.remove('tc-hidden')
          : this.find(`.tc-edit-btn`).classList.add('tc-hidden');

        this._device = this.find(`.tc-signal-view-device`);
        this._btnEdit = this.find(`.tc-edit-btn`);
        this._FPCompAttached = true;
        this._msg = this.find(`.${this._id}`).querySelector('.message');
        this.modified
          ? this._msg.classList.add('tc-warning')
          : this._msg.classList.remove('tc-warning');
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup({ _id, _signal }) {
        return `
          <div class="${_id} tc-container-row ">
            <div class="tc-signal-view-ind tc-signalview-ind tc-item"></div>
            <div class="tc-signal-view-switch tc-signalview-switch tc-item"></div>
            <p class="tc-signalview-name tc-item">${_signal.name}</p>
            <p class="tc-signal-view-device tc-signalview-device tc-item message">${
              _signal.device ? _signal.device : ''
            }</p>
            <p class="tc-signal-view-device tc-signalview-map tc-item message">${
              _signal.map ? _signal.map : ''
            }</p>
            <button class="tc-signal-view-edit btn tc-edit-btn tc-edit-icon"
              data-name="${_signal.name}"
              data-type="${_signal.type}"
              data-device="${_signal.device ? _signal.device : ''}"
              data-map="${_signal.map ? _signal.map : ''}">
            </button>
          </div>
        `;
      }

      get name() {
        return this._signal.name;
      }

      get type() {
        return this._signal.type;
      }

      get device() {
        return this._signal.device;
      }

      get map() {
        return this._signal.map;
      }

      updateAttributes(attr) {
        this._device &&
          (this._device.textContent = `${attr.Device ? attr.Device : ''}: ${
            attr.DeviceMap ? attr.DeviceMap : ''
          }`);

        if (
          this._btnEdit.dataset.device !== attr.Device ||
          this._btnEdit.dataset.map !== attr.DeviceMap
        ) {
          this.modified = true;
          this._msg.classList.add('tc-warning');
          this._device.classList.add('tc-warning');
        } else {
          this.modified = false;
          this._msg.classList.remove('tc-warning');
          this._device.classList.remove('tc-warning');
        }
      }

      /**
       * Provides the edit button element. Then it is possible to add an event listener for triggering the edit window).
       * The signal information will be passed as data-set of this button element
       * @returns {HTMLElement} - Button element
       */
      getEditButton() {
        return this._hasEdit ? this.find(`.tc-edit-btn`) : null;
      }
    };
  }
})(TComponents);

var tcomponentSignalViewStyle = document.createElement('style');
tcomponentSignalViewStyle.innerHTML = `

.tc-signalview-ind {
  width:2rem
}

.tc-signalview-switch {
  width:4rem
}
.tc-signalview-name {
  width:10rem
}
.tc-signalview-device {
  width:10rem
}
.tc-signalview-map {
  width:2rem
}

.tc-edit-btn {
  background-color: var(--t-color-GRAY-20);
  border: none;
  height: 40px;
  width: 40px;
  border-radius: 25%;
  margin-right: 4px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
}

.tc-edit-btn:hover,
.tc-edit-btn:active {
  background-color: var(--t-color-GRAY-40);
}

.tc-edit-btn:active {
  transform: scale(0.96, 0.96);
}

`;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(tcomponentSignalViewStyle, ref);
