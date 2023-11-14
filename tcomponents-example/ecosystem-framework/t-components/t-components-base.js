import { Eventing_A } from './t-components-event.js';
import state from './services/processing-queue.js';

/**
 * TComponents Namespace
 * @namespace TComponents
 * @public
 */

/**
 * Base class for handling objects
 * @class TComponents.Base_A
 * @memberof TComponents
 * @extends TComponents.Eventing_A
 * @public
 */
export class Base_A extends Eventing_A {
  constructor(props = {}) {
    super();

    if (typeof props !== 'object') throw new Error('props must be an object');

    this.initialized = false;
    this.noCheck = [];

    this._initPropsDependencies = [];

    this._props = this._getAllProps(props);
    this._prevProps = Object.assign({}, this._props);
  }

  /**
   * Returns an object with expected input properties together with their initial value.
   * Every child class shall have a {@link defaultProps} to register its corresponding input properties.
   * @alias defaultProps
   * @memberof TComponents.Base_A
   * @protected
   * @example
   * class MyComponent extends TComponents.Component_A {
   *  constructor(parent, props){}
   *  defaultProps(){
   *    return {
   *      myProp1: '',
   *      myProp2: 0,
   *      myProp3: false,
   *      myProp4: { a: 'A', b: 'B'}
   *    }
   *  }
   * }
   * @returns {object}
   */
  defaultProps() {
    return { options: { async: false } };
  }

  /**
   * Register the properties that trigger an onInit when changed with setProps().
   * Input value is a string or array of strings with the name of the corresponding props
   * @alias initPropsDep
   * @initPropsDep
   * @memberof TComponents.Base_A
   * @protected
   * @example
   *     this.initPropsDep(['module', 'variable']);
   */
  initPropsDep(props) {
    if (typeof props === 'string') {
      props = [props];
    } else if (!Array.isArray(props)) {
      throw new Error('The new value should be a string or an array of strings.');
    }

    this._initPropsDependencies = [...this._initPropsDependencies, ...props];
  }

  /**
   * Method used to update one ore multiple component input properties. A change of property using this method
   * will trigger at least a {@link render()} call, If at least one of the given properties is listed in
   * the {@link initPropsDependencies} array, then a {@link init()} before the {@link render()}.
   * @alias setProps
   * @param {object} newProps Object including the property or properties to be updated.
   * @param {Function | null} [onRender=null] Function to be executed once after the component has been rendered.
   * @memberof TComponents.Base_A
   * @public
   * @returns {boolean} - true if the component has been updated, false otherwise
   */
  async setProps(newProps, onRender = null, sync = false) {
    const { props, modified } = this._updateProps(newProps, this._props);

    /**
     * Internal element containing the component properties. A copy of it can be obtained
     * outside the component with {@link getProps} method. To modify the props from outside the method
     * {@link setProps} can be used.
     * @private
     */
    this._props = props;

    // if onRender is a function, register event listener to be executed after render
    if (onRender && typeof onRender === 'function') this.once('render', onRender);

    if (modified && this.initialized) {
      if (sync) {
        await this._componentDidUpdate();
      } else {
        // Put the update in the queue so that every rendering is done synchronously
        // one after the other
        state.q.push(this._componentDidUpdate.bind(this));
      }

      return true;
    }

    return false;
  }

  /**
   * Returns a copy of the component properties. Notice that the returning value does not has a
   * reference to the internal properties of the component. i.e. changing a value to that object
   * does not affect the component itself. To change the properties of the component use the {@link setProps} method.
   * @alias getProps
   * @memberof TComponents.Base_A
   * @public
   * @returns {object}
   */
  getProps() {
    return Base_A._deepClone(this._props);
  }

  /**
   * Abstract function for asynchronous initialization of the component. This function is overwriten  at {@link TComponents.Component_A}
   * @alias init
   * @memberof TComponents.Base_A
   * @async
   * @abstract
   * @protected
   * @returns {Promise<object>} The TComponents instance on which this method was called.
   */
  async init() {}

  /**
   * Abstract function for DOM rendering. This function is overwriten  at {@link TComponents.Component_A}
   * @alias render
   * @memberof TComponents.Base_A
   * @abstract
   * @protected
   * @async
   */
  async render() {}

  /**
   * @alias props
   * @memberof Base_A
   */
  get props() {
    return this.getProps();
  }

  set props(props) {
    this.setProps(props);
  }

  /**
   *
   * @param {object} p
   * @private
   * @returns {object}
   */
  _getAllProps(p) {
    const { props } = this._updateProps(p, this._getAllDefaultProps(), true);
    return props;
  }

  /**
   *
   * @returns {object}
   * @private
   */
  _getAllDefaultProps() {
    let props = {};
    let proto = this;

    const noCheck = [];

    // Traverse up the prototype chain and merge all defaultProps
    while (proto) {
      if (proto.defaultProps) {
        props = Object.assign({}, proto.defaultProps(), props);
        if (proto.noCheck) {
          proto.noCheck.forEach((element) => {
            if (!noCheck.includes(element)) {
              noCheck.push(element);
            }
          });
        }
      }
      proto = Object.getPrototypeOf(proto);
    }
    this.noCheck = noCheck;

    return props;
  }

  /**
   * @alias _updateProps
   * @memberof TComponents.Base_A
   * @static
   * @private
   */
  _updateProps(newProps = {}, prevProps = {}, restError = false) {
    let modified = false;

    let props = Object.keys(prevProps).reduce((acc, key) => {
      if (newProps.hasOwnProperty(key)) {
        if (!Array.isArray(prevProps[key]) && !this.noCheck.includes(key) && typeof prevProps[key] === 'object' && prevProps[key] !== null) {
          const nestedProps = this._updateProps(newProps[key], prevProps[key], restError);
          modified = modified || nestedProps.modified;
          acc[key] = nestedProps.props;
        } else {
          acc[key] = newProps[key];
          modified = modified || newProps[key] !== prevProps[key];
        }
      } else {
        acc[key] = prevProps[key];
      }
      return acc;
    }, {});

    const rest = Object.keys(newProps).reduce((acc, key) => {
      if (!prevProps.hasOwnProperty(key)) {
        acc[key] = newProps[key];
      }
      return acc;
    }, {});

    if (restError && Object.keys(rest).length !== 0) {
      throw new Error(`Unexpected props: ${JSON.stringify(rest)}`);
    }

    return { props, modified };
  }

  /**
   * @alias _componentDidUpdate
   * @memberof TComponents.Base_A
   * @private
   */
  async _componentDidUpdate() {
    function checkDepsDiff(deps, props, prevProps) {
      for (let i = 0; i < deps.length; i++) {
        const dep = deps[i];
        if (props[dep] !== prevProps[dep]) {
          return true;
        }
      }
      return false;
    }

    const isDepsDiff = this._initPropsDependencies && checkDepsDiff(this._initPropsDependencies, this._props, this._prevProps);

    // Update previous props
    this._prevProps = Object.assign({}, this._props);

    // Trigger update of the component
    if (isDepsDiff) {
      await this.init();
    } else {
      await this.render();
    }
  }

  /**
   * @alias _equalProps
   * @memberof TComponents.Base_A
   * @static
   * @param {object} newProps
   * @param {object} prevProps
   * @returns {boolean}
   * @private
   */
  static _equalProps(newProps, prevProps) {
    // use JSON.stringify with helper function to convert function to string to compare objects
    const stringify = (obj) => {
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'function') {
          return value.toString();
        }
        return value;
      });
    };

    return stringify(newProps) === stringify(prevProps);
  }

  /**
   * Creates a clone of an object, including objects with circular references,
   * functions, and non-enumerable properties.
   * @alias _componentDidUpdate
   * @memberof TComponents.Base_A
   * @static
   * @private
   */
  static _deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    let clone;

    if (obj instanceof Date) {
      clone = new Date(obj.getTime());
    } else if (obj instanceof RegExp) {
      clone = new RegExp(obj.source, obj.flags);
    } else if (obj instanceof Set) {
      clone = new Set(obj);
    } else if (obj instanceof Map) {
      clone = new Map(obj);
    } else if (obj instanceof Error) {
      clone = new Error(obj.message);
    } else if (obj instanceof Array) {
      clone = [];
      for (let i = 0; i < obj.length; i++) {
        clone[i] = Base_A._deepClone(obj[i]);
      }
    } else if (obj instanceof HTMLElement) {
      clone = obj.cloneNode(true);
      if (obj.id && clone.id) {
        clone.id = API.generateUUID(); // Replace generateUniqueID() with your own logic to generate a unique ID
      }
    } else {
      // clone = Object.create(Object.getPrototypeOf(obj));
      clone = {};
      for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clone[key] = Base_A._deepClone(obj[key]);
        }
        // clone[key] = Base_A._deepClone(obj[key]);
      }
    }

    return clone;
  }
}
