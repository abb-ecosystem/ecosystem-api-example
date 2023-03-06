'use strict';
import { Eventing_A } from './t-components-event.js';
import state from './services/processing-queue.js';

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

tComponentsLoadCSS('t-components/t-components.css');

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

    this.initialized = false;
    this.noCheck = [];

    this.initPropsDependencies = [];

    this._props = this._getAllProps(props);
    this._prevProps = Object.assign({}, this._props);
  }

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
   * Method used to update one ore multiple component input properties. A change of property using this method
   * will trigger at least a {@link render()} call, If at least one of the given properties is listed in
   * the {@link initPropsDependencies} array, then a {@link init()} before the {@link render()}.
   * @alias setProps
   * @param {object} newProps Object including the property or properties to be updated.
   * @memberof TComponents.Base_A
   * @public
   */
  setProps(newProps) {
    const { props, modified } = this._updateProps(newProps, this._prevProps);

    /**
     * Internal element containing the component properties. A copy of it can be obtained
     * outside the component with {@link getProps} method. To modify the props from outside the method
     * {@link setProps} can be used.
     * @private
     */
    this._props = props;

    if (modified) {
      this._componentDidUpdate();
    }
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
   * @public
   * @returns {Promise<object>} The TComponents instance on which this method was called.
   */
  async init() {}

  /**
   * Abstract function for DOM rendering. This function is overwriten  at {@link TComponents.Component_A}
   * @alias render
   * @memberof TComponents.Base_A
   * @abstract
   * @public
   * @async
   */
  async render() {}

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
        if (
          !Array.isArray(prevProps[key]) &&
          !this.noCheck.includes(key) &&
          typeof prevProps[key] === 'object' &&
          prevProps[key] !== null
        ) {
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
  _componentDidUpdate() {
    function areDepsDiff(deps, props, prevProps) {
      for (let i = 0; i < deps.length; i++) {
        const dep = deps[i];
        if (props[dep] !== prevProps[dep]) {
          return true;
        }
      }
      return false;
    }

    const depsDiff =
      this.initPropsDependencies &&
      areDepsDiff(this.initPropsDependencies, this._props, this._prevProps);

    if (depsDiff) {
      this.init();
    } else {
      this.render();
    }
    // Update previous props
    this._prevProps = Object.assign({}, this._props);
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

    let clone = {};

    for (let key in obj) {
      clone[key] = Base_A._deepClone(obj[key]);
    }

    return clone;
  }

  /**
   * Creates a Proxy wrapping the component (this). Also the given {@link props} paramenter is wrapped with a proxy.
   * @param {object} props Gets the component internal {@link props (this._props)} to wrap them with a proxy.
   * @private
   * @returns {object} Proxy containing the component itself.
   */
  _observerProps(props) {
    const outerHandler = {
      set: function (target, property, value, receiver) {
        let rerender = false;
        if (property === 'props') {
          const { props, modified } = this._updateProps(value, target[property], true);
          rerender = modified;

          // console.log('😀', `outerHandler - SET ${property} to `, props);

          value = new Proxy(props, innerHandler);
        }
        const ret = Reflect.set(target, property, value, receiver);

        if (property === 'props' && rerender && this.initialized) {
          console.log(`PROPERTY ${property} CHANGED TO ${JSON.stringify(value)}, LETS RERENDER`);
          state.q.push(this._componentDidUpdate.bind(this));
        }

        return ret;
      }.bind(this),
    };

    const innerHandler = {
      get: function (target, property, receiver) {
        const value = Reflect.get(target, property, receiver);

        if (typeof value === 'object' && value !== null) {
          return new Proxy(value, innerHandler);
        }
        return value;
      },

      set: function (target, property, value, receiver) {
        let rerender = false;

        if (typeof value !== 'function' && this.initialized) {
          console.log('😴', `INNERHandler - SET ${property} to `, value);
          if (value !== target[property]) {
            rerender = true;
          }
        }

        const ret = Reflect.set(target, property, value, receiver);

        if (rerender && this.initialized && value !== 'object') {
          console.log(
            `ONE PROPERTY ${property} CHANGED TO ${JSON.stringify(
              value
            )}, RERENDERING... ${JSON.stringify(target)}`
          );
          state.q.push(this._componentDidUpdate.bind(this));
        }

        return ret;
      }.bind(this),
    };

    const proxy = new Proxy(this, outerHandler);
    proxy._props = new Proxy(props, innerHandler);

    return proxy;
  }

  // static isNonEmptyObject(value) {
  //   return typeof value === 'object' && value !== null && Object.keys(value).length > 0;
  // }
}
