'use strict';
import { Base_A } from './t-components-base.js';
import state from './services/processing-queue.js';

/**
 * @typedef TComponents.ComponentProps
 * @prop {string} [label] Label text
 * @prop {object} [options] Set of options to modify the behaviour of the component
 * - async : if true, the subcomponents are instantiated asynchronously and onRender is executed inmediatelly without
 * waiting for the subcomponents to finish.
 */

/**
 * Creates an instance of TComponents.Component class.
 * This is the base parent class of all TComponent.
 * @class Component_A
 * @memberof TComponents
 * @extends TComponents.Base_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component.
 * @param {TComponents.ComponentProps} props Object containing {label} text paramenter
 * @property {HTMLElement} container - Container element where the component content is to be attached, this is then attached to the parent element
 * @property {TComponents.ComponentProps} props
 * @property {object} child - object containing all instances returned by {@link TComponents.Component_A.mapComponents} method.
 * @property {string} _compId - Component UUID
 *
 */
export class Component_A extends Base_A {
  constructor(parent, props = {}) {
    super(props);

    /**
     * @type {TComponents.ComponentProps}
     */
    this._props;

    if (!Component_A._isHTMLElement(parent))
      throw new Error(`HTML element container required but not detected`);
    this._compId = `${this.constructor.name}-${API.generateUUID()}`;

    this.child = [];

    /**
     * Parent HTML element where the component is attached to.
     */
    this.parent = parent;
    this.container = document.createElement('div');
    this.container.id = this._compId;

    this.template = null;
    this._initCalled = false;
    this._enabled = true;
    this._parentComponent = '';
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Component_A
   * @returns {TComponents.ComponentProps}
   */
  defaultProps() {
    return { label: '' };
  }

  /**
   * Initialization of a component. Any asynchronous operaiton (like access to controller) is done here.
   * The {@link onInit()} method of the component is triggered by this method.
   * @alias init
   * @memberof TComponents.Component_A
   * @async
   * @returns {Promise<object>} The TComponents instance on which this method was called.
   */
  async init() {
    // console.log('😛 - init() JUST CALLED...', this._compId);

    try {
      /**
       * Parent HTML element where the component is attached to.
       */
      this.parent;

      /**
       * Initialization of internal states
       * @private
       */
      this.initialized = false;
      this._initCalled = true;
      /**
       * Set to true if an error ocurrs during initialization.
       */
      this.error = false;

      /**
       * Enables or disables any FPComponent component (see Omnicore App SDK) declared
       * within the component as an own property (e.g. this.btn = new FPComponent()).
       */
      this.enabled = true;

      try {
        await this.onInit();
      } catch (e) {
        this.error = true;
      }

      return await this.render();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Update the content of the instance into the Document Object Model (DOM).
   * The {@link onRender()} method of this component and eventual initialization
   * of sub-components are managed by this method.
   * @alias render
   * @memberof TComponents.Component_A
   * @async
   * @param {object} [data] data - Data that can be passed to the component, which may be required for the rendering process.
   * @returns {Promise<object>} The TComponents instance on which this method was called.
   */
  async render(data = null) {
    // console.log('😛 - render() JUST CALLED...', this._compId);
    this._handleData(data);

    if (this._initCalled === false) return await this.init();

    this._createTemplate();

    await this.initChildrenComponents();

    this.container.innerHTML = '';
    this.container.appendChild(this.template.content);

    if (this._props.label) {
      this.label = this._props.label;
    }

    this.attachToElement(this.parent);

    this.error && (this.enabled = false);

    this.onRender();

    this.initialized = true;
    return this;
  }

  /**
   * Contains component specific asynchronous implementation (like access to controller).
   * This method is called internally during initialization process orchestrated by {@link init() init}.
   * @alias onInit
   * @memberof TComponents.Component_A
   * @abstract
   * @async
   * @alias onInit
   * @memberof TComponents.Component_A
   */
  async onInit() {}

  /**
   * Contians all synchronous operations/setups that may be required for any sub-component after its initialization and/or manipulation of the DOM.
   * This method is called internally during rendering process orchestrated by {@link render() render}.
   * @alias onRender
   * @memberof TComponents.Component_A
   * @abstract
   * @alias onRender
   * @memberof TComponents.Component_A
   */
  onRender() {}

  /**
   * Synchronously initializes all child TComponents returned by {@link #mapComponents() mapComponents} method.
   * This method is internally called by {@link #render() render} method.
   * @alias initChildrenComponents
   * @memberof TComponents.Component_A
   * @private
   * @async
   */
  async initChildrenComponents() {
    let arrAll = [];

    this.child = this.mapComponents();

    if (Object.keys(this.child).length === 0) return;

    const [arrSync, arrAsync] = Object.entries(this.child).reduce(
      (acc, [key, value]) => {
        if (value instanceof Promise)
          throw new Error(
            `Promise detected but not expected at ${this._compId} mapComponent element ${key}...`
          );

        const sortComponent = (value) => {
          if (value instanceof Component_A) {
            value._parentComponent = this._compId;
            value._props.options.async ? acc[0].push(value) : acc[1].push(value);
          }
        };

        if (Array.isArray(value)) {
          value.forEach((v) => {
            sortComponent(v);
          });
        } else {
          sortComponent(value);
        }
        return acc;
      },
      [[], []]
    );

    // console.log('😊', this.child, arrSync, arrAsync);

    arrAll = [...arrSync, ...arrAsync];

    const initChildren = function () {
      return arrAll.map((child) => {
        return child.init();
      });
    };

    const status = this._props.options.async ? initChildren() : await Promise.all(initChildren());

    // status.forEach((result) => {
    //   if (result.status === 'rejected') console.error(result.reason);
    // });
  }

  /**
   * Instantiation of TComponents sub-components that shall be initialized in a synchronous way.
   * All this components are then accessible within {@link onRender() onRender} method by using this.child.<component-instance>
   * @alias mapComponents
   * @memberof TComponents.Component_A
   * @abstract
   * @returns {object} Contains all child TComponents instances used within the component.
   */
  mapComponents() {
    return {};
  }

  _handleData(data) {
    if (data) {
      const overwrite = function (key) {
        this._data[key] = data[key];
      };
      Object.keys(data).forEach(overwrite.bind(this));
    }
  }

  _createTemplate() {
    this.template = document.createElement('template');
    this.template.innerHTML = this.markup(this);
  }

  /**
   * Generates the HTML definition corresponding to the component.
   * @alias markup
   * @memberof TComponents.Component_A
   * @param {object} self - The TComponents instance on which this method was called.
   * @returns {string}
   */
  markup(self) {
    return '';
  }

  /**
   * Changes the DOM element in which this component is to be inserted.
   * @alias attachToElement
   * @memberof TComponents.Component_A
   * @param {HTMLElement} element - Container DOM element
   */
  attachToElement(element) {
    if (!Component_A._isHTMLElement(element))
      throw new Error(`HTML element container required but not detected`);

    if (this.parent === element) {
      this.parent.contains(this.container) === false && this.parent.appendChild(this.container);
    } else {
      this.parent.contains(this.container) && this.parent.removeChild(this.container);
      this.parent = element;
      this.parent.appendChild(this.container);
    }
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
        if (typeof val === 'object' && val !== null && val !== obj && !this._isHTMLElement(val)) {
          if (val.hasOwnProperty(property)) {
            result.push(val);
          }
          Component_A._hasChildOwnProperty(val, property, result);
        }
      }
    }
    return result;
  }

  /**
   * Check if an entry is HTML Element
   * @alias _isHTMLElement
   * @memberof TComponents.Component_A
   * @static
   * @param {any} o
   * @private
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
   * @returns {Element} An Element object representing the first element wthin the component that matches the specified set of CSS selectors, or null is returned if there are no matches.
   */
  find(selector) {
    const el = this.template.content.querySelector(selector);

    return el ? el : this.container.querySelector(selector);
  }

  /**
   * Returns an Array representing the component's elemenst that matches the specified selector. If no matches are found, an empty Array is returned.
   * @alias all
   * @memberof TComponents.Component_A
   * @param {string} selector - A string containing one selector to match. This string must be a valid CSS selector string
   * @returns {Element[]} An Array of Elements that matches the specified CSS selector, or empty array is returned if there are no matches.
   */
  all(selector) {
    var aContainer = Array.from(this.container.querySelectorAll(selector));
    var nlTemplate = this.template && this.template.content.querySelectorAll(selector);

    if (nlTemplate) {
      Array.from(nlTemplate).forEach(function (tElem) {
        var isDuplicate = aContainer.some((cElem) => tElem === cElem);
        if (!isDuplicate) {
          aContainer[aContainer.length] = tElem;
        }
      });
    }

    return aContainer;
  }

  /**
   * Component label text
   * @alias label
   * @type {string}
   * @memberof TComponents.Component_A
   */
  get label() {
    return this._props.label;
  }

  set label(text) {
    let pLabel = document.createElement('p');
    pLabel.innerHTML = this._props.label;
    this.container.insertBefore(pLabel, this.container.firstChild);
    this._props.label = text;
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
    // const callerName = new Error().stack.split('\n')[2].trim().split(' ')[1];

    this._enabled = en;
    const objects = Component_A._hasChildOwnProperty(this, '_enabled');
    objects.forEach((o) => {
      o.enabled = en;
    });
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
   * @param {string} className - name of the class to appy (without dot)
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
   * Removes a class to underlying element(s) containing the input selector
   * @alias cssRemoveClass
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
}
