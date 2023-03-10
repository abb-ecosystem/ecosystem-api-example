'use strict';

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
}
