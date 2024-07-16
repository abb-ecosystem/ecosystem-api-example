import API from '../api/index.js';
import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';
import { Dropdown_A } from './t-components-dropdown.js';

/**
 * @typedef TComponents.SelectorProceduresProps
 * @prop {string} module - module to seach for variables
 * @prop {boolean} [isInUse] - only return symbols that are used in a Rapid program, i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
 * @prop {string} [filter] - The following filters can be applied:
 * <br>&emsp;name - name of the data symbol (not casesensitive)
 * <br>&emsp;symbolType - valid values: 'constant', 'variable', 'persistent' (array with multiple values is supported)
 * <br>&emsp;dataType - type of the data, e.g. 'num'(only one data type is supported)
 * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
 * @prop {string} [selected] item that shall be shown as selected after first render
 * @prop {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
 * @prop {Function} [onSelection] Function to be called when button is pressed
 * @prop {string} [label] Label text

 */

/**
 * Selector displaying procedures available inside a module at the controller
 * @class TComponents.SelectorProcedures_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.SelectorProceduresProps} props
 *
 * @example
 * const procSelector = new SelectorProcedures_A(
 *    document.querySelector('.proc-dropdown'),
 *    { module: 'Ecosystem_BASE', isInUse: false, label: 'Select a procedure:' }
 *  );
 *  await procSelector.render()
 */
export class SelectorProcedures_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SelectorProceduresProps}
     */
    this._props;

    this.initPropsDep(['module', 'isInUse', 'filter']);

    this._procedures = [];
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SelectorProcedure_A
   * @returns {TComponents.SelectorProceduresProps}
   */
  defaultProps() {
    return {
      task: 'T_ROB1',
      module: '',
      isInUse: false,
      selected: '',
      addNoSelection: false,
      filter: '',
      onSelection: null,
    };
  }

  async onInit() {
    try {
      this.task = await API.RAPID.getTask(this._props.task);
      const procs = await this.task.searchProcedures(this._props.module, this._props.isInUse, this._props.filter);
      this._procedures = procs.map((p) => p.name);
    } catch (e) {
      this.error = true;
      Popup_A.error(e, 'TComponents.SelectorProcedure_A');
    }
  }

  mapComponents() {
    const ret = {
      selector: new Dropdown_A(this.container, {
        itemList: this._procedures,
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

  /**
   * Updates the content of selector based on {@link module} parameter
   * @alias updateSearch
   * @param {string} module - Module to search for procedures
   * @param {string} [filter] - only procedures containing the filter patern (not casesensitive)
   * @memberof TComponents.SelectorProcedures_A
   */
  async updateSearch(module, task = 'T_ROB1', filter) {
    await this.setProps({ task, module, filter }, null, true);
  }

  /**
   * Adds a callback function to be called when an item is selected
   * @alias onSelection
   * @memberof TComponents.SelectorProcedures_A
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
