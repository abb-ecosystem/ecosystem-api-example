import API from '../api/index.js';
import { Base_A } from './t-components-base.js';

const maxGap = 16;
const maxPadding = 16;
const maxMargin = 16;

/**
 * Load a CSS file
 * @alias tComponentsLoadCSS
 * @param {string} href - path of css file
 * @memberof TComponents
 */
function tComponentsLoadCSS(href) {
  let head = document.getElementsByTagName('head')[0];
  let link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = href;
  head.appendChild(link);
}

tComponentsLoadCSS('ecosystem-framework/t-components/t-components.css');

/**
 * @typedef TComponents.ComponentProps
 * @prop {string} [label] Label text
 * @prop {string} [labelPos] Label position: "top|bottom|left|right"
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
 * @property {string} compId - Component UUID
 *
 */
export class Component_A extends Base_A {
  constructor(parent, props = {}) {
    super(props);

    /**
     * @type {TComponents.ComponentProps}
     */
    this._props;

    if (!Component_A._isHTMLElement(parent) && parent !== null)
      throw new Error(`HTML parent element not detected. Set parent input argument to null if you want to attach the component later.`);

    this.compId = `${this.constructor.name}_${API.generateUUID()}`;

    this.child = null;

    /**
     * Parent HTML element where the component is attached to.
     */
    this.parent = parent;
    this.container = document.createElement('div');
    this.container.id = this.compId;
    this.container.classList.add('t-component');
    this.parentComponentId = '';

    this.template = null;
    this._initCalled = false;
    this._enabled = true;

    this._deinstallFunction = null;
    this._eventListeners = new Map();
    this._fUpdate = false;
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Component_A
   * @returns {TComponents.ComponentProps}
   */
  defaultProps() {
    return { label: '', labelPos: 'top' };
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
    try {
      this.trigger('before:init', this);

      if (typeof this._deinstallFunction === 'function') this._deinstallFunction();
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
        this._deinstallFunction = await this.onInit();
      } catch (e) {
        console.error(e);
        this.error = true;
      }

      this.trigger('init', this);

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
    try {
      this.trigger('before:render', this);

      if (this._initCalled === false) return await this.init();

      this._handleData(data);
      this._createTemplate();

      await this.initChildrenComponents();
    } catch (e) {
      this.error = true;
      console.error(e);
    }

    this.container.innerHTML = '';
    this.container.appendChild(this.template.content);

    if (this._props.label) {
      const labelEl = this.find(`#${this.compId}__label`);
      labelEl.innerHTML = this._props.label;
      if (this._props.labelPos === 'top' || this._props.labelPos === 'bottom') {
        this.container.classList.add('flex-col');
        this.container.classList.remove('flex-row', 'gap-2', 'items-center');
      } else {
        this.container.classList.remove('flex-col');
        this.container.classList.add('flex-row', 'gap-2', 'items-center');
      }
    }

    this.parent && this.attachToElement(this.parent);

    this.error && (this.enabled = false);

    this.onRender();

    this.initialized = true;
    this.trigger('render', this);
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
    const newChildren = this.mapComponents();
    const toDispose = [];
    if (Object.keys(newChildren).length === 0) return;

    // Initialize this.child if it's not already initialized
    if (!this.child) {
      this.child = newChildren;
    } else {
      for (const key in newChildren) {
        const newChild = newChildren[key];
        const oldChild = this.child[key];

        if (Component_A._isTComponent(oldChild)) {
          const shouldUpdate = !Base_A._equalProps(oldChild._props, newChild._props) || oldChild._fUpdate;

          if (shouldUpdate) {
            // If the properties are not equal or if _fUpdate is true,
            // Ensure old child is properly distroyed
            toDispose.push(oldChild);
            //replace the existing child
            this.child[key] = newChild;
          } else {
            // If the properties are equal and _fUpdate is false, just attach the old child to the new DOM element
            oldChild.attachToElement(newChild.parent);
            newChild.destroy();
          }
        } else {
          // If not a TComponent, replace the existing child anyway
          this.child[key] = newChild;
        }
      }
    }

    const arrAll = Object.entries(this.child).reduce((acc, [key, value]) => {
      if (value instanceof Promise) throw new Error(`Promise detected but not expected at ${this.compId}--mapComponent element ${key}...`);

      const sortComponent = (value) => {
        if (value instanceof Component_A) {
          value.parentComponentId = this.compId;
          acc.push(value);
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
    }, []);

    const initChildren = function () {
      return arrAll.map((child) => {
        return child._initCalled ? child : child.init();
      });
    };

    const status = this._props.options.async ? initChildren() : await Promise.all(initChildren());

    // clean up the replaced old children objects
    toDispose.forEach((child) => child.destroy());

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

  /**
   * Generates the HTML definition corresponding to the component.
   * @alias markup
   * @memberof TComponents.Component_A
   * @param {object} self - The TComponents instance on which this method was called.
   * @abstract
   * @returns {string}
   */
  markup(self) {
    return /*html*/ '';
  }

  addEventListener(element, eventType, listener, options) {
    element.addEventListener(eventType, listener, options);

    if (!this._eventListeners.has(element)) {
      this._eventListeners.set(element, []);
    }
    this._eventListeners.get(element).push({ eventType, listener });
  }

  removeAllEventListeners() {
    if (!this._eventListeners) return;
    this._eventListeners.forEach((entry, element) => {
      element.removeEventListener(entry.eventType, entry.listener);
    });
    this._eventListeners.clear();
  }

  destroy() {
    // clean reference to attached callbacks
    this.cleanUpEvents();

    // deinstall function (returned by onInit method)
    if (this._deinstallFunction && typeof this._deinstallFunction === 'function') this._deinstallFunction();

    if (this.container.parentElement) this.container.parentElement.removeChild(this.container);
    this.removeAllEventListeners();
    if (this.child) {
      Object.keys(this.child).forEach((key) => {
        if (Component_A._isTComponent(key)) this.child[key].destroy();
      });
    }
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
    this._props.label = text;
  }

  _markupWithLabel() {
    return /*html*/ `
        ${Component_A.mIf(
          this._props.label && (this._props.labelPos === 'top' || this._props.labelPos === 'left'),
          /*html*/ `<p id="${this.compId}__label"></p>`
        )}
        ${this.markup(this)}
        ${Component_A.mIf(
          this._props.label && (this._props.labelPos === 'bottom' || this._props.labelPos === 'right'),
          /*html*/ `<p id="${this.compId}__label"></p>`
        )}
    `;
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
   * Changes the DOM element in which this component is to be inserted.
   * @alias attachToElement
   * @memberof TComponents.Component_A
   * @param {HTMLElement | Element} element - Container DOM element
   */
  attachToElement(element) {
    if (!Component_A._isHTMLElement(element)) return;
    // throw new Error(`HTML element container required but not detected`);

    if (!this.parent) {
      this.parent = element;
      this.parent.appendChild(this.container);
    } else if (this.parent === element) {
      // only add if it not already exists
      this.parent.contains(this.container) === false && this.parent.appendChild(this.container);
    } else {
      // remove from old parent to attach to new one
      this.parent.contains(this.container) && this.parent.removeChild(this.container);
      this.parent = element;
      this.parent.appendChild(this.container);
    }
  }

  /**
   * Returns the first Element within the component that matches the specified selector. If no matches are found, null is returned.
   * @alias find
   * @memberof TComponents.Component_A
   * @param {string} selector - A string containing one selector to match. This string must be a valid CSS selector string
   * @returns {HTMLElement | Element} An Element object representing the first element wthin the component that matches the specified set of CSS selectors, or null is returned if there are no matches.
   */
  find(selector) {
    const el = this.template && this.template.content.querySelector(selector);

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
   * @alias cssBox
   * @memberof TComponents.Component_A
   * @param {boolean} enable - if true, the component is framed, if false, not frame is shown
   */
  cssBox(enable = true) {
    enable ? this.container.classList.add('tc-container-box') : this.container.classList.remove('tc-container-box');
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
   * @param {string | string[]} classNames - name of the class to appy (without dot)
   * @param {boolean} [all] - if true it will apply the class to all selector found, otherwise it applies to the first one found
   */
  cssAddClass(selector, classNames, all = false) {
    if (!selector || !classNames) return;
    let arrClassNames = Array.isArray(classNames) ? classNames : [...classNames.replace(/^\s/g, '').split(' ')];

    // check if array is empty
    if (arrClassNames.length === 0) return;
    // filter out emmpty strings
    arrClassNames = arrClassNames.filter((c) => c !== '');

    if (selector === 'this') this.container.classList.add(...arrClassNames);
    else {
      const el = all ? this.all(selector) : this.find(selector);
      if (el) Array.isArray(el) ? el.forEach((el) => el.classList.add(...arrClassNames)) : el.classList.add(...arrClassNames);
    }
  }

  /**
   * Removes a class to underlying element(s) containing the input selector
   * @alias cssRemoveClass
   * @memberof TComponents.Component_A
   * @param {string} selector - CSS selector, if class: ".selector", if identifier: "#selector"
   * @param {string} classNames - name of the class to appy (without dot)
   * @param {boolean} [all] - if true it will apply the class to all selector found, otherwise it applies to the first one found
   */
  cssRemoveClass(selector, classNames, all = false) {
    if (!selector || !classNames) return;
    let arrClassNames = Array.isArray(classNames) ? classNames : [...classNames.replace(/^\s/g, '').split(' ')];

    // check if array is empty
    if (arrClassNames.length === 0) return;
    // filter out emmpty strings
    arrClassNames = arrClassNames.filter((c) => c !== '');

    if (selector === 'this') this.container.classList.remove(...arrClassNames);
    else {
      const el = all ? this.all(selector) : this.find(selector);
      if (el) Array.isArray(el) ? el.forEach((el) => el.classList.remove(...arrClassNames)) : el.classList.remove(...arrClassNames);
    }
  }

  /**
   * Force a rerender when a component is handled inside the mapComponents method of a higher order component.
   * Normally this happens only when the props has changed. If this function is called inside a component.
   * @alias forceUpdate
   * @private
   */
  forceUpdate() {
    this._fUpdate = true;
  }

  _handleData(data) {
    if (data) {
      if (!this._data) this._data = {};
      Object.keys(data).forEach((key) => (this._data[key] = data[key]));
    }
  }

  _createTemplate() {
    this.template = document.createElement('template');
    this.template.innerHTML = this._markupWithLabel();
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
        if (typeof val === 'object' && val !== null && val !== obj && !Component_A._isHTMLElement(val)) {
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
   * Check if an entry is a TComponent (of type TComponent.Component_A)
   * @alias _isTComponent
   * @memberof TComponents.Component_A
   * @static
   * @param {any} o Oject to check
   * @returns {boolean} true if entry is an TComponent, false otherwise
   */
  static _isTComponent(o) {
    return o instanceof Component_A;
  }

  /**
   * Check if an entry is HTML Element
   * @alias _isHTMLElement
   * @memberof TComponents.Component_A
   * @static
   * @param {any} o
   * @returns {boolean} true if entry is an HTMLElement, false otherwise
   */
  static _isHTMLElement(o) {
    return typeof HTMLElement === 'object'
      ? o instanceof HTMLElement //DOM2
      : o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName === 'string';
  }

  static loadCssClassFromString(css) {
    if (typeof css !== 'string') throw new Error('css must be a string');
    const tComponentStyle = document.createElement('style');
    tComponentStyle.innerHTML = css;
    const ref = document.querySelector('script');
    ref.parentNode.insertBefore(tComponentStyle, ref);
  }

  static mIf(condition, markup, elseMarkup = '') {
    return condition ? markup : elseMarkup;
  }

  static mFor(array, markup) {
    return array.map((item, index) => markup(item, index)).join('');
  }
}

const generatePaddingStyles = () => {
  let styles = '';
  for (let i = 1; i <= maxPadding; i++) {
    const paddingValue = (i * 0.25).toFixed(2); // Calculate padding value based on class number.
    styles += `
      .pl-${i} { padding-left: ${paddingValue}rem; /* ${i * 4}px */ }
      .pr-${i} { padding-right: ${paddingValue}rem; /* ${i * 4}px */ }
      .pt-${i} { padding-top: ${paddingValue}rem; /* ${i * 4}px */ }
      .pb-${i} { padding-bottom: ${paddingValue}rem; /* ${i * 4}px */ }
    `;
  }
  return styles;
};

function generateMarginStyles() {
  let styles = '';

  for (let i = 1; i <= maxMargin; i++) {
    const value = i * 0.25;
    styles += `
      .ml-${i} { margin-left: ${value}rem; /* ${i * 4}px */ }
      .mr-${i} { margin-right: ${value}rem; /* ${i * 4}px */ }
      .mt-${i} { margin-top: ${value}rem; /* ${i * 4}px */ }
      .mb-${i} { margin-bottom: ${value}rem; /* ${i * 4}px */ }
    `;
  }

  return styles;
}

function generateGapStyles() {
  let styles = '';

  for (let i = 0; i <= maxGap; i++) {
    const value = i * 0.25;
    styles += `
      .flex-row.gap-${i} > * + * { margin-left: ${value}rem; /* ${i * 4}px */ }
      .flex-col.gap-${i} > * + * { margin-top: ${value}rem; /* ${i * 4}px */ }
    `;
  }

  return styles;
}

Component_A.loadCssClassFromString(/*css*/ `
  ${generatePaddingStyles()}
  ${generateMarginStyles()}
  ${generateGapStyles()}
`);
