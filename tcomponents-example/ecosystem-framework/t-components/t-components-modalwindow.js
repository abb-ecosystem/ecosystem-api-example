import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';

/**
 * @typedef TComponents.ModalWindowProps
 * @prop {TComponents.Component_A | HTMLElement | null} [content] - Component/Element to be displayed in the modal window
 */

/**
 *
 * @class TComponents.ModalWindow_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ModalWindowProps} [props]
 * @example
 * // index.html
 * ...
 * &lt;div class="edit-signal"&gt;&lt;/div&gt;
 * &lt;div class="modal-window"&gt;&lt;/div&gt;
 * &lt;div class="modal-trigger-field"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const editSignal = new SignalEdit_A(
 *   document.querySelector('.edit-signal'),
 *   { signal: 'di_signal' }
 * );
 * const modalWindow =  new ModalWindow_A(
 *   document.querySelector('.modal-window'),
 *   { content: editSignal }
 * );
 * const btnTrigger = new Button_A(
 *   document.querySelector('.modal-trigger'),
 *   { label: 'trigger' }
 * );
 * @see TComponents.SignalEdit_A
 * @see TComponents.SignalView_A
 */
export class ModalWindow_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ModalWindowProps}
     */
    this._props;

    this.handler = [];
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ModalWindow_A
   * @returns {TComponents.ModalWindowProps}
   */
  defaultProps() {
    return {
      content: null,
    };
  }

  mapComponents() {
    return { content: this._props.content };
  }

  onRender() {
    if (this._props.content) {
      if (this._props.content instanceof Component_A) {
        this._props.content.attachToElement(this.find('.tc-modal-window-content'));
      } else if (Component_A._isHTMLElement(this._props.content)) {
        const contentElement = this.find('.tc-modal-window-content');
        contentElement.innerHTML = '';
        contentElement.appendChild(this._props.content);
      }
    }

    this._window = this.find('.tc-modal-window');
    this._overlay = this.find('.tc-overlay');
    const _btnClose = this.find('.tc-close-modal');

    this.addEventListener(this._window, 'click', (e) => {
      e.stopPropagation();
    });
    this.addEventListener(_btnClose, 'click', this.toggleWindow.bind(this));
    this.addEventListener(this._overlay, 'click', this.toggleWindow.bind(this));
  }

  /**
   * Generates the HTML definition corresponding to the component.
   * @private
   * @returns {string}
   */
  markup() {
    return /*html*/ `
          <div class="tc-overlay tc-hidden">
            <div class="tc-modal-window tc-hidden">
              <button class="tc-close-modal">&times;</button>
              <div class="tc-modal-window-content"></div>
            </div>
          </div>    
          `;
  }

  get isOpen() {
    return !this._window.classList.contains('tc-hidden');
  }

  /**
   * Content of the modal window
   * @memberof TComponents.ModalWindow_A
   */
  get content() {
    return this._props.content;
  }

  set content(content) {
    this.setProps({ content });
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
    this.on('open', func);
    // if (typeof func !== 'function') throw new Error('handler is not a valid function');
    // this.handler.push(func);
  }

  onClose(func) {
    this.on('close', func);
  }

  /**
   * Opens the modal window. All event listener callbacks function called when a trigger element dipatch the registered event
   * @alias openWindow
   * @memberof TComponents.ModalWindow_A
   * @param {Event} e - object based on Event describing the event that has occurred
   * @see TComponents.ModalWindow_A.triggerElements
   */
  openWindow(e) {
    console.log('openWindow called...');

    // Calling any registered handler
    // for (let i = 0; i < this.handler.length; i++) {
    //   try {
    //     this.handler[i]();
    //   } catch (error) {
    //     Popup_A.warning(`Rapid.Data callback failed.`, [error.toString()]);
    //   }
    // }

    // Passing dataset information if stored in the element
    if (e.target instanceof HTMLElement) {
      const el = e.target.closest('.tc-modal-window-trigger');
      if (el instanceof HTMLElement && el.dataset) {
        this._props.content.render(Object.assign({}, el.dataset));
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

    document.body.style.overflow === 'hidden' ? (document.body.style.overflow = 'auto') : (document.body.style.overflow = 'hidden');

    this.isOpen ? this.trigger('open') : this.trigger('close');
  }
}

ModalWindow_A.loadCssClassFromString(/*css*/ `

.tc-modal-window {
  margin: auto;
  width: 70%;
  background-color: white;
  padding: 4rem;
  border-radius: 5px;
  box-shadow: 0 3rem 5rem rgba(0, 0, 0, 0.3);
  z-index: 10;
  max-height: 70vh;
}

.tc-modal-window-content{
  max-height: 70vh;
  overflow-y: auto;
}
`);
