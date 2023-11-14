import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Dropdown_A } from './t-components-dropdown.js';

/**
 * @typedef TComponents.SelectorModulesProps
 * @prop {boolean} [isInUse] - only return symbols that are used in a Rapid program, i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
 * @prop {string} [filter] - The following filters can be applied:
 * <br>&emsp;name - name of the data symbol (not casesensitive)
 * <br>&emsp;symbolType - valid values: 'constant', 'variable', 'persistent' (array with multiple values is supported)
 * <br>&emsp;dataType - type of the data, e.g. 'num'(only one data type is supported)
 * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
 * @prop {string[]} [itemList] List of dropdown items
 * @prop {string} [selected] item that shall be shown as selected after first render
 * @prop {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
 * @prop {string} [label] Label text
 */

/**
 * Selector displaying modules available at the controller
 * @class TComponents.SelectorModules_A
 * @extends TComponents.Dropdown_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.SelectorModulesProps} props
 *
 * @example
 * const modSelector = new SelectorModules_A(
 *    document.querySelector('.module-dropdown'),
 *    { isInUse: false, label: 'Select a module:' }
 *  );
 * await modSelector.render();
 */
export class SelectorModules_A extends Dropdown_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SelectorModulesProps}
     */
    this._props;

    this.initPropsDep(['isInUse', 'filter']);
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SelectorModule_A
   * @returns {TComponents.SelectorModulesProps}
   */
  defaultProps() {
    return { isInUse: false, selected: '', label: '', addNoSelection: false, filter: '' };
  }

  async onInit() {
    try {
      if (!this.task) this.task = await API.RAPID.getTask();
      const modules = await this.task.searchModules(this._props.isInUse, this._props.filter);
      this._updateItemList(modules.map((m) => m.name));
    } catch (e) {
      this.error = true;
      Popup_A.error(e, 'TComponents.SelectorModule_A');
    }
  }

  /**
   * Updates the content of selector based available modules
   * @alias updateSearch
   * @param {string} [filter] - only modules containing the filter patern (not casesensitive)
   * @memberof TComponents.SelectorModules_A
   */
  async updateSearch(filter = '') {
    await this.setProps({ filter }, null, true);
  }
}
