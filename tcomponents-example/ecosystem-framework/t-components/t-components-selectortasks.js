import API from '../api/index.js';
import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';
import { Dropdown_A } from './t-components-dropdown.js';

/**
 * @typedef TComponents.SelectorTasksProps
 * @prop {string} [filter] - The following filters can be applied:
 * @prop {string} [selected] item that shall be shown as selected after first render
 * @prop {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
 * @prop {Function} [onSelection] Function to be called when button is pressed
 * @prop {string} [label] Label text
 */

/**
 * Selector displaying tasks available at the controller
 * @class TComponents.SelectorTasks_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.SelectorTasksProps} props
 *
 * @example
 * const taskSelector = new SelectorTasks_A(
 *    document.querySelector('.task-dropdown'),
 *    { label: 'Select a task:' }
 *  );
 * await taskSelector.render();
 */
export class SelectorTasks_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SelectorTasksProps}
     */
    this._props;

    this.initPropsDep('filter');

    this._tasks = [];
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SelectorModule_A
   * @returns {TComponents.SelectorTasksProps}
   */
  defaultProps() {
    return { selected: '', label: '', addNoSelection: false, filter: '', onSelection: null };
  }

  async onInit() {
    try {
      this._tasks = await API.RAPID.searchTasks(this._props.filter);
    } catch (e) {
      this.error = true;
      Popup_A.error(e, 'TComponents.SelectorModule_A');
    }
  }

  mapComponents() {
    const ret = {
      selector: new Dropdown_A(this.container, {
        itemList: this._tasks,
        selected: this._props.selected,
        addNoSelection: this._props.addNoSelection,
        onSelection: this.cbOnSelection.bind(this),
      }),
    };

    return ret;
  }

  onRender() {
    this.container.classList.add('justify-stretch');
  }

  // markup() {
  //   return /*html*/ `<div class="selector-tasks flex-row"></div>`;
  // }

  /**
   * Adds a callback function to be called when an item is selected
   * @alias onSelection
   * @memberof TComponents.SelectorTasks_A
   * @param {function} func
   * @todo Currently only one function is possible. Change the method to accept multiple callbacks
   */
  onSelection(cb) {
    this.on('selection', cb);
  }

  cbOnSelection(value) {
    if (this._props.onSelection && typeof this._props.onSelection === 'function') {
      this._props.onSelection(value);
    }
    this.trigger('selection', value);
  }

  get selected() {
    return this.child.selector.selected;
  }

  set selected(value) {
    this.child.selector.selected = value;
  }

  get items() {
    return this.child.selector.items;
  }

  set items(value) {
    this.child.selector.items = value;
  }
}
