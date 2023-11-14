import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Dropdown_A } from './t-components-dropdown.js';

/**
 * @typedef TComponents.SelectorTasksProps
 * @prop {string} [filter] - The following filters can be applied:
 * @prop {string[]} [itemList] List of dropdown items
 * @prop {string} [selected] item that shall be shown as selected after first render
 * @prop {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
 * @prop {string} [label] Label text
 */

/**
 * Selector displaying tasks available at the controller
 * @class TComponents.SelectorTasks_A
 * @extends TComponents.Dropdown_A
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
export class SelectorTasks_A extends Dropdown_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SelectorTasksProps}
     */
    this._props;

    this.initPropsDep('filter');
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SelectorModule_A
   * @returns {TComponents.SelectorTasksProps}
   */
  defaultProps() {
    return { selected: '', label: '', addNoSelection: false, filter: '' };
  }

  async onInit() {
    try {
      const tasks = await API.RAPID.searchTasks(this._props.filter);
      this._updateItemList(tasks);
    } catch (e) {
      this.error = true;
      Popup_A.error(e, 'TComponents.SelectorModule_A');
    }
  }
}
