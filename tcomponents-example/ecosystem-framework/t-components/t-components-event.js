/**
 * Event manager base class
 * @class TComponents.Eventing_A
 * @memberof TComponents
 */
export class Eventing_A {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   * @alias on
   * @memberof TComponents.Eventing_A
   * @param {string} eventName - name of the triggering event
   * @param {function} callback - function to be called when event is triggered
   * @param {boolean} [strict] - if true (default), checking wether the function has been added is done by function object comparison,
   * otherwise the comparison is done only by function.name
   */
  on(eventName, callback, strict = true) {
    if (typeof callback !== 'function') throw new Error('callback is not a valid function');
    const handlers = this.events[eventName] || [];

    if (handlers.some((cb) => cb.name === callback.name) && !strict) return;
    if (handlers.includes(callback)) return;
    handlers.push(callback);
    this.events[eventName] = handlers;
  }

  /**
   * Unsubscribe from an event
   * @alias off
   * @memberof TComponents.Eventing_A
   * @param {string} eventName - name of the triggering event
   * @param {function} callback -function to be called when event is triggered
   * @returns {boolean} - true if the callback was removed, false if it was not found
   */
  off(eventName, callback) {
    const handlers = this.events[eventName];
    if (!handlers || handlers.length === 0) {
      return false;
    }
    const index = handlers.indexOf(callback);
    if (index > -1) {
      handlers.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Callback function to be called when an event is triggered only once, then it is removed
   * @alias once
   * @memberof TComponents.Eventing_A
   * @param {string} eventName - name of the triggering event
   * @param {function} callback -function to be called when event is triggered
   * @returns {boolean} - true if the callback was added, false if it was already added
   */
  once(eventName, callback) {
    if (typeof callback !== 'function') throw new Error('callback is not a valid function');
    const handlers = this.events[eventName] || [];
    if (handlers.includes(callback)) return false;

    const onceCallback = (...data) => {
      callback(...data);
      this.off(eventName, onceCallback);
    };
    handlers.push(onceCallback);
    this.events[eventName] = handlers;
    return true;
  }

  /**
   * Triggers all callback fuction that have subscribe to an event
   * @alias trigger
   * @memberof TComponents.Eventing_A
   * @param {string} eventName - Name of the event to be triggered
   * @param {...any} data - Data passed to the callback as input parameter
   */
  trigger(eventName, ...data) {
    const handlers = this.events[eventName];
    if (!handlers || handlers.length === 0) {
      return;
    }
    handlers.forEach((callback) => {
      callback(...data);
    });
  }

  /**
   * Clean up all registered events
   * @alias cleanUpEvents
   * @memberof TComponents.Eventing_A
   *
   */
  cleanUpEvents() {
    for (const eventName in this.events) {
      if (this.events.hasOwnProperty(eventName)) {
        const handlers = this.events[eventName];
        handlers.forEach((callback) => {
          this.off(eventName, callback);
        });
      }
    }
  }
}
