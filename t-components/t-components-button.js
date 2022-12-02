'use strict';
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('Button_A')) {
    /**
     * Rounded button that triggers a callback when pressed. Additional callbacks can be added with the {@link TComponents.Button_A#onClick|onClick} method.
     * @class TComponents.Button_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {function|null} [callback] - Function to be called when button is pressed
     * @param {string} [label] - Label of the component
     * @param {string|null} [img] - Path to image file
     * @example
     *        const btnExecute = new TComponents.Button_A(
     *          document.querySelector('.btn-render'),
     *          () => { console.log('execute')},
     *          'Execute'
     *        )
     */
    o.Button_A = class Button extends TComponents.Component_A {
      constructor(container, callback = null, label = '', img = null) {
        super(container, label);
        this.img = img;
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
        this._btn = new FPComponents.Button_A();
        this._btn.text = this._label;
        if (this.img !== null) this._btn.icon = this.img;

        const cb = async (value) => {
          for (let i = 0; i < this.callbacks.length; i++) {
            try {
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
        btnElem.style.setProperty('border-radius', '25px');
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup({}) {
        return `
          <div class="tc-button tc-item"></div>
          `;
      }

      get label() {
        return this._btn.text;
      }

      set label(text) {
        this._btn.text = text;
      }

      /**
       * Adds a callback funciton to the component. This will be called after the button is pressed and released
       * @alias onClick
       * @memberof TComponents.Button_A
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

`;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(tComponentStyle, ref);
