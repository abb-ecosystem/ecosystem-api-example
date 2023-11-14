import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Dropdown_A } from './t-components-dropdown.js';

/**
 * @typedef TComponents.SelectorVariablesProps
 * @prop {string} module - module to seach for variables
 * @prop {boolean} [isInUse] - only return symbols that are used in a Rapid program, i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
 * @prop {object} [filter] - The following filters can be applied:
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
 * Selector displaying variables available inside a module at the controller
 * @class TComponents.SelectorVariables_A
 * @extends TComponents.Dropdown_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.SelectorVariablesProps} props
 * @example
 *  const selectorVar = new SelectorVariables_A(
 *     document.querySelector('.selector-var'),
 *     { module: 'Ecosystem_BASE', isInUse: true, label: 'Select a variable:' }
 *   );
 * await selectorVar.render();
 *
 */
export class SelectorVariables_A extends Dropdown_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SelectorVariablesProps}
     */
    this._props;

    this.initPropsDep(['module', 'isInUse', 'filter']);
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SelectorVariable_A
   * @returns {TComponents.SelectorVariablesProps}
   */
  defaultProps() {
    // this.noCheck = ['filter']
    return {
      itemList: [],
      module: '',
      isInUse: false,
      selected: '',
      label: '',
      addNoSelection: false,
      filter: { name: '', symbolType: '', dataType: '' },
    };
  }

  async onInit() {
    try {
      if (!this.task) this.task = await API.RAPID.getTask();
      const vars = await this.task.searchVariables(this._props.module, this._props.isInUse, this._props.filter);
      this._updateItemList(vars.map((v) => v.name));
    } catch (e) {
      this.error = true;
      Popup_A.error(e, 'TComponents.SelectorVariables_A');
    }
  }

  /**
   * Updates the content of selector based on {@link module} parameter
   * @alias updateSearch
   * @param {string} module - Module to search for procedures
   * @param {object} [filter] - The following filters can be applied:
   * <br>&emsp;name - name of the data symbol (not casesensitive)
   * <br>&emsp;symbolType - valid values: 'constant', 'variable', 'persistent' (array with multiple values is supported)
   * <br>&emsp;dataType - type of the data, e.g. 'num'(only one data type is supported)
   * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
   * @memberof TComponents.SelectorVariables_A
   */
  async updateSearch(module, filter = {}) {
    await this.setProps({ module, filter }, null, true);
  }
}
