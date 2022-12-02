'use strict';
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('ModalWindow_A')) {
    /**
     *
     * @class TComponents.ModalWindow_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {TComponents.Component_A | HTMLElement | null} [content] - Component/Element to be displayed in the modal window
     * @example
     * const editSignal = new TComponents.SignalEdit_A(
     *   document.querySelector('.edit-signal'),
     *   'di_signal'
     * );
     * const modalWindow =  new TComponents.ModalWindow_A(
     *   document.querySelector('.modal-window'),
     *   editSignal
     * );
     * const btnTrigger = new TComponents.Button_A(
     *   document.querySelector('.modal-trigger'),
     *   null,
     *   'trigger'
     * );
     * @see TComponents.SignalEdit_A
     * @see TComponents.SignalView_A
     */
    o.ModalWindow_A = class ModalWindow extends TComponents.Component_A {
      constructor(container, content = null) {
        super(container);
        this.content = content;
        this.handler = [];
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        if (this.content) {
          if (this.content instanceof TComponents.Component_A) {
            this.content.attachToElement(this.find('.tc-modal-window-content'));
          } else if (TComponents.Component_A._isHTMLElement(this.content)) {
            const contentElement = this.find('.tc-modal-window-content');
            contentElement.innerHTML = '';
            contentElement.appendChild(this.content);
          }
        }

        this._window = this.find('.tc-modal');
        this._overlay = this.find('.tc-overlay');
        this._btnClose = this.find('.tc-close-modal');

        this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
        this._overlay.addEventListener('click', this.toggleWindow.bind(this));
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup(self) {
        return `
            <div class="tc-modal tc-hidden">
              <button class="tc-close-modal">&times;</button>
              <div class="tc-modal-window-content"></div>
            </div>
            <div class="tc-overlay tc-hidden"></div>    
          `;
      }

      /**
       * Adds a callback funciton to the component. This will be called after the button is pressed and released
       * @alias onClick
       * @memberof TComponents.ModalWindow_A
       * @param {TComponents.Component_A | HTMLElement}  element    The callback function which is called when the button is pressed
       */
      setContent(element) {
        this.content = element;
        this.render();
      }

      /**
       * Adds openWindow method as event listener of event (default: 'click') to the given elements.
       * @alias triggerElements
       * @memberof TComponents.ModalWindow_A
       * @param {HTMLElement | Array | NodeList } elem - Element(s) where the event listener is to be added
       * @param {string} [event] -  Event used to trigger the openWindow method
       */
      triggerElements(elem, event = 'click') {
        if (elem instanceof NodeList || Array.isArray(elem)) {
          Array.from(elem).forEach((node) => {
            if (!node) return;
            node.classList.add('tc-modal-window-trigger');
            return node.addEventListener(event, this.openWindow.bind(this));
          });
        } else {
          elem.classList.add('tc-modal-window-trigger');
          elem.addEventListener(event, this.openWindow.bind(this));
        }
      }

      /**
       * Registar a function to be called before the window is openned
       * @alias onOpen
       * @memberof TComponents.ModalWindow_A
       * @param {function} func
       */
      onOpen(func) {
        if (typeof func !== 'function') throw new Error('handler is not a valid function');
        this.handler.push(func);
      }

      /**
       * Opens the modal window. All event listener callbacks function called when a trigger element dipatch the registered event
       * @alias openWindow
       * @memberof TComponents.ModalWindow_A
       * @param {Event} e - object based on Event describing the event that has occurred
       * @see TComponents.ModalWindow_A.triggerElements
       */
      openWindow(e) {
        // Calling any registered handler
        for (let i = 0; i < this.handler.length; i++) {
          try {
            this.handler[i]();
          } catch (error) {
            TComponents.Popup_A.warning(`Rapid.Data callback failed.`, [error.toString()]);
          }
        }

        // Passing dataset information if stored in the element
        if (e.target instanceof HTMLElement) {
          const el = e.target.closest('.tc-modal-window-trigger');
          if (el instanceof HTMLElement && el.dataset) {
            this.content.render(Object.assign({}, el.dataset));
          }
        }

        this.toggleWindow();
      }

      /**
       * Toggles visibility of modal window.
       * Different than openWindow method, this method does not trigger any event nor load any data to the content element when oppening.
       * @alias toggleWindow
       * @memberof TComponents.ModalWindow_A
       */
      toggleWindow() {
        this._overlay.classList.toggle('tc-hidden');
        this._window.classList.toggle('tc-hidden');
      }
    };
  }
})(TComponents);
