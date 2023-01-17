/**
 * Load a CSS file
 * @param {string} href - path of css file
 */
function tComponentsLoadCSS(href) {
  let head = document.getElementsByTagName('head')[0];
  let link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = href;
  head.appendChild(link);
}
const T_COMPONENTS_BASE_VERSION = '0.3';

tComponentsLoadCSS('t-components/t-components.css');

/**
 * TComponents Namespace
 * @namespace TComponents
 */

var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('Component_A')) {
    /**
     * Event manager base class
     * @class TComponents.Eventing_A
     * @memberof TComponents
     */
    o.Eventing_A = class Eventing {
      constructor() {
        this.events = {};
      }

      /**
       * Subscribe to an event
       * @alias on
       * @memberof TComponents.Eventing_A
       * @param {string} eventName - name of the triggering event
       * @param {function} callback -function to be called when event is triggered
       */
      on(eventName, callback) {
        if (typeof callback !== 'function') throw new Error('callback is not a valid function');
        const handlers = this.events[eventName] || [];
        if (handlers.includes(callback)) return;

        handlers.push(callback);
        this.events[eventName] = handlers;
      }

      /**
       * Triggers all callback fuction that have subscribe to an event
       * @alias trigger
       * @memberof TComponents.Eventing_A
       * @param {string} eventName - Name of the event to be triggered
       * @param {any} data - Data passed to the callback as input parameter
       */
      trigger(eventName, data = null) {
        const handlers = this.events[eventName];
        if (!handlers || handlers.length === 0) {
          return;
        }
        handlers.forEach((callback) => {
          callback(data);
        });
      }
    };

    /**
     * Creates an instance of TComponents.Component class.
     * This is the base parent class of all TComponent.
     * @class TComponents.Component_A
     * @memberof TComponents
     * @extends TComponents.Eventing_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component.
     * @param {string} [label] - Label text.
     * @property {HTMLElement} container - Container element where the component is to be attached
     * @property {object} child - object containing all instances returned by {@link TComponents.Component_A.mapComponents} method.
     * @property {string} _compId - Component UUID
     * @property {string} _label - internal variable to store the label.
     */
    o.Component_A = class Component extends TComponents.Eventing_A {
      constructor(parent, label = '') {
        super();

        if (!Component._isHTMLElement(parent))
          throw new Error(`HTML element container required but not detected`);
        this._compId = `${this.constructor.name}-${API.generateUUID()}`;

        this.child = [];

        this._anchor = parent;
        this.container = document.createElement('div');
        this.container.id = this._compId;
        this._anchor.appendChild(this.container);

        this.template = null;
        this.initDone = false;
        this._compId = `${this.constructor.name}-${API.generateUUID()}`;
        this._label = label;
        this._enabled = true;
      }

      /**
       * Initialization of a component. Any asynchronous operaiton (like access to controller) is done here.
       * @async
       * @private
       * @returns {Promise<object>} The TComponents instance on which this method was called.
       */
      async init() {
        try {
          await this.onInit();
          this.initDone = true;
          return await this.render();
        } catch (e) {
          console.log(e);
        }
      }

      /**
       * Synchronously initializes all child TComponents returned by {@link #mapComponents() mapComponents} method.
       * This method is internally called by {@link #render() render} method.
       * @private
       * @async
       */
      async initChildrenComponents() {
        const childArray = [];
        const componentsMap = this.mapComponents();

        for (let key in componentsMap) {
          const child = componentsMap[key];

          if (Array.isArray(child)) {
            child.forEach((component) => childArray.push(component));
          } else {
            childArray.push(child);
          }

          this.child[key] = child;
        }

        const status = await Promise.all(
          childArray.map((child) => {
            return child instanceof TComponents.Component_A
              ? child.init()
              : Promise.resolve('not a TComponents.Component, nothing to do.'); // ToDo check for undefined
          })
        );

        // status.forEach((result) => {
        //   if (result.status === 'rejected') console.error(result.reason);
        // });
      }

      /**
       * Update the content of the instance into the Document Object Model (DOM).
       * @async
       * @param {object} [data] data - Data that can be passed to the component, which may be required for the rendering process.
       * @returns {Promise<object>} The TComponents instance on which this method was called.
       */
      async render(data = null) {
        if (data) {
          const overwrite = function (key) {
            this._data[key] = data[key];
          };
          Object.keys(data).forEach(overwrite.bind(this));
        }

        if (this.initDone === false) {
          return await this.init();
        } else {
          this.template = document.createElement('template');
          this.template.innerHTML = this.markup(this);

          // this.container.innerHTML = '';
          // this.container.innerHTML = this.markup(this);

          const labelEl = this.find('.tc-container-label');
          this._label && labelEl
            ? labelEl && labelEl.querySelector('p').classList.remove('tc-hidden')
            : labelEl && labelEl.querySelector('p').classList.add('tc-hidden');

          this.container.innerHTML = '';
          this.container.appendChild(this.template.content);

          await this.initChildrenComponents();
          this.onRender();

          return this;
        }
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {object} self - The TComponents instance on which this method was called.
       * @returns {string}
       */
      markup(self) {
        return '';
      }

      /**
       * Instantiation of TComponents sub-components that shall be initialized in a synchronous way.
       * All this components are then accessible within {@link onRender() onRender} method by using this.child.<component-instance>
       * @abstract
       * @returns {object} Contains all child TComponents instances used within the component.
       */
      mapComponents() {
        return {};
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @abstract
       * @async
       * @alias onInit
       * @memberof TComponents.Component_A
       */
      async onInit() {}

      /**
       * Contians all synchronous operations/setups that may be required for any sub-component after its initialization and/or manipulation of the DOM.
       * This method is called internally during rendering process orchestrated by {@link render() render}.
       * @abstract
       * @alias onRender
       * @memberof TComponents.Component_A
       */
      onRender() {}

      /**
       * Component label text
       * @alias label
       * @type {string}
       * @memberof TComponents.Component_A
       */
      get label() {
        return this._label;
      }

      set label(text) {
        this._label = text;
        this.render();
      }

      /**
       * Enables or disables any FPComponent component (see Omnicore App SDK) declared within the component as an own property (e.g. this.btn = new FPComponent()).
       * @alias enabled
       * @type {boolean}
       * @memberof TComponents.Component_A
       * @see {@link https://developercenter.robotstudio.com/omnicore-sdk|Omnicore-SDK}
       */
      get enabled() {
        return this._enabled;
      }

      set enabled(en) {
        this._enabled = en;
        const objects = Component._hasChildOwnProperty(this, '_enabled');
        objects.forEach((o) => {
          o.enabled = en;
        });
      }

      /**
       * Changes the DOM element in which this component is to be inserted.
       * @alias attachToElement
       * @memberof TComponents.Component_A
       * @param {HTMLElement} element - Container DOM element
       */
      attachToElement(element) {
        if (!Component._isHTMLElement(element))
          throw new Error(`HTML element container required but not detected`);

        this._anchor.removeChild(this.container);
        this._anchor = element;
        this._anchor.appendChild(this.container);
      }

      /**
       * Recursively search for property of an object and underlying objects.
       * @alias _hasChildOwnProperty
       * @memberof TComponents.Component_A
       * @static
       * @private
       * @param {object} obj
       * @param {string} property
       * @param {object[]} [result=[]] result - Array of objects already found during the recursively execution
       * @returns {object[]} Array of objects found or empty array if nothing found
       */
      static _hasChildOwnProperty(obj, property, result = []) {
        if (typeof obj === 'object' && obj !== null) {
          for (const val of Object.values(obj)) {
            if (
              typeof val === 'object' &&
              val !== null &&
              val !== obj &&
              !this._isHTMLElement(val)
            ) {
              if (val.hasOwnProperty(property)) {
                result.push(val);
              }
              Component._hasChildOwnProperty(val, property, result);
            }
          }
        }
        return result;
      }

      /**
       * Check if an entry is
       * @alias _isHTMLElement
       * @memberof TComponents.Component_A
       * @static
       * @private
       * @param {any} o
       * @returns {boolean} true if entry is an HTMLElement, false otherwise
       */
      static _isHTMLElement(o) {
        return typeof HTMLElement === 'object'
          ? o instanceof HTMLElement //DOM2
          : o &&
              typeof o === 'object' &&
              o !== null &&
              o.nodeType === 1 &&
              typeof o.nodeName === 'string';
      }

      /**
       * Returns the first Element within the component that matches the specified selector. If no matches are found, null is returned.
       * @alias find
       * @memberof TComponents.Component_A
       * @param {string} selector - A string containing one selector to match. This string must be a valid CSS selector string
       * @returns {HTMLElement} An Element object representing the first element wthin the component that matches the specified set of CSS selectors, or null is returned if there are no matches.
       */
      find(selector) {
        // var el = null;
        // if (this.container.hasChildNodes()) {
        //   el = this.container.querySelector(selector);
        // }
        // return el ? el : this.template && this.template.content.querySelector(selector);

        return this.container.querySelector(selector);
      }

      /**
       * Returns an Array representing the component's elemenst that matches the specified selector. If no matches are found, an empty Array is returned.
       * @alias all
       * @memberof TComponents.Component_A
       * @param {string} selector - A string containing one selector to match. This string must be a valid CSS selector string
       * @returns {HTMLElement[]} An Array of Elements that matches the specified CSS selector, or empty array is returned if there are no matches.
       */
      all(selector) {
        // var aContainer = Array.from(this.container.querySelectorAll(selector));
        // var nlTemplate = this.template && this.template.content.querySelectorAll(selector);

        // if (nlTemplate) {
        //   Array.from(nlTemplate).forEach(function (ele) {
        //     var isDuplicate = aContainer.some((ele2) => ele === ele2);
        //     if (!isDuplicate) {
        //       aContainer[aContainer.length] = ele;
        //     }
        //   });
        // }
        // return aContainer;

        return Array.from(this.container.querySelectorAll(selector));
      }

      /**
       * Chages visibility of the component to not show it in the view.
       * @alias hide
       * @memberof TComponents.Component_A
       */
      hide() {
        this.container.classList.add('tc-hidden');
      }

      /**
       * Changes visibility of the component to show it in the view.
       * @alias show
       * @memberof TComponents.Component_A
       */
      show() {
        this.container.classList.remove('tc-hidden');
      }

      /**
       * Toggles visibility of component. Shows it when hidden, hides it when shown
       * @alias toggle
       * @memberof TComponents.Component_A
       */
      toggle() {
        this.container.classList.toggle('tc-hidden');
      }

      /**
       * Changes the background color of the component
       * @alias backgroundColor
       * @memberof TComponents.Component_A
       * @param {string} param - Parameter: There are four parameter accepted by backgroundColor property: "color|transparent|initial|inherit"
       *                            color: This property holds the background color.
       *                            transparent: By default the background color is transparent.
       *                            initial: Set this property to it’s default
       *                            inherit: Inherits the property from it’s parent element
       */
      backgroundColor(param) {
        this.container.style.backgroundColor = param;
      }

      /**
       * Changes apperance of the component (border and background color) to frame it or not.
       * @alias cssContainer
       * @memberof TComponents.Component_A
       * @param {boolean} enable - if true, the component is framed, if false, not frame is shown
       */
      cssContainer(enable = true) {
        enable
          ? this.container.classList.add('tc-container-box')
          : this.container.classList.remove('tc-container-box');
      }

      /**
       * Changes the position of the label
       * @alias cssLabelAside
       * @memberof TComponents.Component_A
       * @param {*} enable - if true, the labels appears at the left side, otherwise on the top-left corner
       */
      cssLabelAside(enable = true) {
        enable
          ? this.find('.tc-container-label').classList.add('tc-container-row')
          : this.find('.tc-container-label').classList.remove('tc-container-row');
      }

      /**
       * Sets or returns the contents of a style declaration as a string.
       * @alias css
       * @memberof TComponents.Component_A
       * @param {string|Array} properties - Specifies the content of a style declaration.
       * E.g.: "background-color:pink;font-size:55px;border:2px dashed green;color:white;"
       */
      css(properties) {
        if (!properties) {
          this.container.style.cssText = '';
          return;
        }

        let s = '';
        if (typeof properties === 'string') s = properties;
        else if (Array.isArray(properties)) {
          s = properties.join(';');
          s += ';';
        } else if (typeof properties === 'object') {
          for (const [key, val] of Object.entries(properties)) {
            s += `${key} : ${val};`;
          }
        }
        this.container.style.cssText = s;
      }

      /**
       * Adds a class to underlying element(s) containing the input selector
       * @alias cssAddClass
       * @memberof TComponents.Component_A
       * @param {string} selector - CSS selector, if class: ".selector", if identifier: "#selector"
       * @param {string} newClass - name of the class to appy (without dot)
       * @param {boolean} [all] - if true it will apply the class to all selector found, otherwise it applies to the first one found
       */
      cssAddClass(selector, className, all = false) {
        if (className) {
          const c = className.replace(/^\s/g, '');
          const el = all ? this.find(selector) : this.all(selector);
          Array.isArray(el) ? el.forEach((el) => el.classList.add(c)) : el.classList.add(c);
        }
      }

      /**
       * Adds a class to underlying element(s) containing the input selector
       * @alias cssAddClass
       * @memberof TComponents.Component_A
       * @param {string} selector - CSS selector, if class: ".selector", if identifier: "#selector"
       * @param {string} className - name of the class to appy (without dot)
       * @param {boolean} [all] - if true it will apply the class to all selector found, otherwise it applies to the first one found
       */
      cssRemoveClass(selector, className, all = false) {
        if (className) {
          const c = className.replace(/^\s/g, '');
          const el = all ? this.find(selector) : this.all(selector);
          Array.isArray(el) ? el.forEach((el) => el.classList.remove(c)) : el.classList.add(c);
        }
      }
    };
  }
})(TComponents);
