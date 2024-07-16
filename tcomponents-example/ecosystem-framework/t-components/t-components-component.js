import API from '../api/index.js';
import { Base_A } from './t-components-base.js';
import { Eventing_A } from './t-components-event.js';
import { Popup_A } from './t-components-popup.js';
// import { FPComponents } from '../../omicore-sdk/omnicore-sdk.js';

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
 * @prop {string} [labelPos] Label position: "top|bottom|left|right|top-center|bottom-center"
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
      throw new Error(
        `HTML parent element not detected. Set parent input argument to null if you want to attach the component later.`,
      );

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
    this.initialized = false;
    this._initCalled = false;
    this._enabled = true;

    this._deinstallFunction = null;
    this._eventListeners = new Map();
    this._fUpdate = false;
    Object.defineProperty(this, '_isTComponent', {
      value: true,
      writable: false,
    });

    Object.defineProperty(this, '_isView', {
      value: false,
      writable: true,
    });
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

      /**
       * Clean up before initializing. Relevant from the second time the component is initialized.
       * - Remove all event listeners
       */
      this.removeAllEventListeners();

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
       * Reset values before onInit
       * Reseting enabled only if previously an error occured, for a next try, otherwise it was explicity disabled by the user
       */
      if (this.error) this.enabled = true;
      this.error = false;

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
    this.container.innerHTML = '';
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

    if (this.container.hasChildNodes() && this._labelStart()) {
      // Insert before the first child node
      this.container.insertBefore(this.template.content, this.container.firstChild);
    } else {
      this.container.appendChild(this.template.content);
    }

    if (this._props.label) {
      const labelEl = this.find(`#${this.compId}__label`);
      labelEl.innerHTML = Component_A.t(this._props.label);

      if (this._props.labelPos.includes('top') || this._props.labelPos.includes('bottom')) {
        this.container.classList.add('flex-col');
        this.container.classList.remove('flex-row', 'gap-2', 'items-center', 'content-start');
      } else {
        this.container.classList.remove('flex-col');
        this.container.classList.add('flex-row', 'gap-2', 'items-center', 'content-start');
      }
      if (this._props.labelPos.includes('center')) {
        labelEl.classList.add('text-center');
      } else if (this._props.labelPos.includes('end')) {
        labelEl.classList.add('text-right');
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

        if (Component_A.isTComponent(oldChild) && Component_A.isTComponent(newChild)) {
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
      if (value instanceof Promise)
        throw new Error(`Promise detected but not expected at ${this.compId}--mapComponent element ${key}...`);

      const sortComponent = (value) => {
        if (Component_A.isTComponent(value)) {
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
    if (!element) throw new Error('Element not found');
    element.addEventListener(eventType, listener, options);

    if (!this._eventListeners.has(element)) {
      this._eventListeners.set(element, []);
    }
    this._eventListeners.get(element).push({ eventType, listener });
  }

  removeAllEventListeners() {
    if (!this._eventListeners) return;
    this._eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ eventType, listener }) => {
        element.removeEventListener(eventType, listener);
      });
    });
    this._eventListeners.clear();
  }

  /**
   * Clean up before initializing. Relevant from the second time the component is initialized.
   * - Call onDestroy method
   * - Call return function from onInit method if it exists
   * - Detach the component from the parent element
   * - Remove all local events, like this.on('event', callback)
   * - Remove all event listeners attached with this.addEventListener
   * @alias destroy
   * @memberof TComponents.Component_A
   * @private
   */
  destroy() {
    // calling instance specific onDestroy method
    try {
      this.onDestroy();
    } catch (error) {
      console.warn('Error during onDestroy method. Continue anyway...', error);
    }

    // clean reference to attached callbacks
    this.cleanUpEvents();

    // deinstall function (returned by onInit method)
    if (this._deinstallFunction && typeof this._deinstallFunction === 'function') this._deinstallFunction();

    if (this.container.parentElement) this.container.parentElement.removeChild(this.container);

    this.removeAllEventListeners();
    if (this.child) {
      Object.keys(this.child).forEach((key) => {
        if (Component_A.isTComponent(this.child[key])) this.child[key].destroy();
      });
    }
  }

  onDestroy() {}

  get propsEnums() {
    return {};
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

  static isTComponent(obj) {
    return obj && obj._isTComponent ? true : false;
  }

  static isView(obj) {
    return obj && obj._isView ? true : false;
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
   * Get Set the hidden state of the component.
   * @alias hidden
   * @memberof TComponents.Component_A
   * @returns {boolean} True if the component is hidden, false otherwise.
   */
  get hidden() {
    return this.container.classList.contains('tc-hidden');
  }

  set hidden(hide) {
    hide ? this.hide() : this.show();
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
      if (el)
        Array.isArray(el) ? el.forEach((el) => el.classList.add(...arrClassNames)) : el.classList.add(...arrClassNames);
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
      if (el)
        Array.isArray(el)
          ? el.forEach((el) => el.classList.remove(...arrClassNames))
          : el.classList.remove(...arrClassNames);
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

  _labelStart() {
    return this._props.label && (this._props.labelPos.includes('top') || this._props.labelPos.includes('left'));
  }

  _labelEnd() {
    return this._props.label && (this._props.labelPos.includes('bottom') || this._props.labelPos.includes('right'));
  }

  _markupWithLabel() {
    const markup = this.markup(this);

    return /*html*/ `
        ${Component_A.mIf(this._labelStart(), /*html*/ `<p id="${this.compId}__label"></p>`)}
        ${markup}
        ${Component_A.mIf(this._labelEnd(), /*html*/ `<p id="${this.compId}__label"></p>`)}
    `;
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
   * Recursively search for property of an object and underlying objects of type TComponents and FPComponents.
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
          if (val.hasOwnProperty(property) && (Component_A.isTComponent(val) || Component_A._isFPComponent(val))) {
            result.push(val);
          }
          Component_A._hasChildOwnProperty(val, property, result);
        }
      }
    }
    return result;
  }

  /**
   * Recursively check for instances of type TComponent and FPComponent
   */
  static _hasChildComponent(obj, result = []) {}

  static _isFPComponent(o) {
    return Object.values(FPComponents).some((FPComponent) => o instanceof FPComponent);
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
    // Query all existing <style> tags
    const existingStyles = document.querySelectorAll('style');
    // Check if any existing <style> tag has the same CSS content
    for (let style of existingStyles) {
      if (style.innerHTML === css) {
        // A matching <style> tag is found, so we don't need to insert a new one
        return;
      }
    }
    // No matching <style> tag found, proceed to insert a new one
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

  static async handleComponentOn(self, { resource, instance, state }, action) {
    let varInstances = [];
    const actions = {
      disable: (condition) => (condition ? (self.enabled = false) : (self.enabled = true)),
      hide: (condition) => (condition ? self.hide() : self.show()),
    };

    const eventHandlers = {
      OpMode: {
        event: 'op-mode',
        monitorFn: API.CONTROLLER.monitorOperationMode,
        callback: monitorOpMode,
        states: [API.CONTROLLER.OPMODE.Auto, API.CONTROLLER.OPMODE.ManualR],
      },
      Execution: {
        event: 'execution-state',
        monitorFn: API.RAPID.monitorExecutionState,
        callback: monitorExecutionState,
        states: [API.RAPID.EXECUTIONSTATE.Running, API.RAPID.EXECUTIONSTATE.Stopped],
      },
      Motor: {
        event: 'controller-state',
        monitorFn: API.CONTROLLER.monitorControllerState,
        callback: monitorControllerState,
        states: [API.CONTROLLER.STATE.MotorsOn, API.CONTROLLER.STATE.MotorsOff],
      },
      Error: {
        event: 'controller-state',
        monitorFn: API.CONTROLLER.monitorControllerState,
        callback: monitorControllerState,
        states: [API.CONTROLLER.STATE.SysFailure, API.CONTROLLER.STATE.EStop, API.CONTROLLER.STATE.GuardStop],
      },
      Signal: {
        event: `signal-state-${instance}`,
        monitorFn: API.SIGNAL.monitorSignal,
        callback: monitorDigitalSignal,
        states: [true, false],
        instance: instance,
      },
      Variable: {
        event: `variable-state-${instance}`,
        monitorFn: API.RAPID.monitorVariableInstance,
        callback: monitorBooleanVariable,
        states: [true, false],
        instance: instance,
      },
    };

    const handler = eventHandlers[resource];

    try {
      if (handler) {
        const promises = handler.states.map(async (s) => {
          const cb = (state) => {
            actions[action](state === s);
          };

          if (state === s) {
            Component_A.globalEvents.on(handler.event, cb);

            if (Component_A.globalEvents.count(handler.event) <= 1) {
              if (handler.instance) {
                if (varInstances.length === 3) {
                  await handler.monitorFn(varInstances[0], varInstances[1], varInstances[2], handler.callback);
                } else {
                  await handler.monitorFn(handler.instance, handler.callback);
                }
              } else {
                await handler.monitorFn(handler.callback);
              }
            }

            // trigger once the callback depending on the event
            let currentState;

            if (handler.event === 'op-mode') {
              currentState = await RWS.Controller.getOperationMode();
            } else if (handler.event === 'execution-state') {
              currentState = await RWS.Rapid.getExecutionState();
            } else if (handler.event === 'controller-state') {
              currentState = await RWS.Controller.getControllerState();
            } else if (handler.event.includes('signal-state')) {
              const signal = await API.SIGNAL.getSignal(instance);
              currentState = (await signal.getValue()) ? true : false;
            } else if (handler.event.includes('variable-state')) {
              varInstances = instance.split('/');
              if (varInstances.length !== 3 || !varInstances[0] || !varInstances[1] || !varInstances[2])
                throw new Error('Variable instance must be of the form task/module/variable');
              const variable = await API.RAPID.getVariable(varInstances[0], varInstances[1], varInstances[2]);
              if (variable.type !== 'bool') throw new Error('Variable must be of type bool');

              currentState = (await variable.getValue()) ? true : false;
            }
            cb(currentState);
          }
        });
        await Promise.all(promises);
      }
    } catch (e) {
      Popup_A.error(e, 'TComponents.Component_A.handleComponentOn');
    }
  }

  static disableComponentOn(self, condition) {
    this.handleComponentOn(self, condition, 'disable');
  }

  static hideComponentOn(self, condition) {
    this.handleComponentOn(self, condition, 'hide');
  }

  static setLanguageAdapter(adapter) {
    if (typeof adapter !== 'function') throw new Error('adapter must be a function');

    // load in a static variable the language function
    Component_A.languageAdapter = adapter;
  }

  static t(key) {
    if (Component_A.languageAdapter) return Component_A.languageAdapter(key);
    return key;
  }
}

Component_A.languageAdapter = null;

Component_A.globalEvents = new Eventing_A();

const monitorOpMode = async (value) => {
  Component_A.globalEvents.trigger('op-mode', value);
};

const monitorExecutionState = async (value) => {
  Component_A.globalEvents.trigger('execution-state', value);
};

const monitorControllerState = async (value) => {
  Component_A.globalEvents.trigger('controller-state', value);
};

const monitorDigitalSignal = async (value, signal_name) => {
  const boolValue = value ? true : false;
  Component_A.globalEvents.trigger(`signal-state-${signal_name}`, boolValue);
};

const monitorBooleanVariable = async (value, variable_name) => {
  const boolValue = value ? true : false;
  Component_A.globalEvents.trigger(`variable-state-${variable_name}`, boolValue);
};

const maxGap = 16;
const maxPadding = 16;
const maxMargin = 16;

const generatePaddingStyles = () => {
  let styles = '';
  for (let i = 1; i <= maxPadding; i++) {
    const paddingValue = (i * 0.25).toFixed(2); // Calculate padding value based on class number.
    styles += `
      .pl-${i} { padding-left: ${paddingValue}rem; /* ${i * 4}px */ }
      .pr-${i} { padding-right: ${paddingValue}rem; /* ${i * 4}px */ }
      .pt-${i} { padding-top: ${paddingValue}rem; /* ${i * 4}px */ }
      .pb-${i} { padding-bottom: ${paddingValue}rem; /* ${i * 4}px */ }
      .px-${i} { padding-left: ${paddingValue}rem; padding-right: ${paddingValue}rem; /* ${i * 4}px */ }
      .py-${i} { padding-top: ${paddingValue}rem; padding-bottom: ${paddingValue}rem; /* ${i * 4}px */ }
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
      .mx-${i} { margin-left: ${value}rem; margin-right: ${value}rem; /* ${i * 4}px */ }
      .my-${i} { margin-top: ${value}rem; margin-bottom: ${value}rem; /* ${i * 4}px */ }
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
