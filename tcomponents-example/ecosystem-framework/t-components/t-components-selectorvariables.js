import API from '../api/index.js';
import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';
import { Dropdown_A } from './t-components-dropdown.js';

/**
 * @typedef TComponents.SelectorVariablesProps
 * @prop {string} module - module to seach for variables
 * @prop {boolean} [isInUse] - only return symbols that are used in a Rapid program, i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
 * @prop {object} [filter] - The following filters can be applied:
 * <br>&emsp;name - name of the data symbol (not casesensitive)
 * <br>&emsp;symbolType - valid values: 'constant', 'variable', 'persistent' (array with multiple values is supported)
 * <br>&emsp;dataType - type of the data, e.g. 'num' or ['num', 'dnum']
 * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
 * @prop {string} [selected] item that shall be shown as selected after first render
 * @prop {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
 * @prop {Function} [onSelection] Function to be called when button is pressed
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
export class SelectorVariables_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SelectorVariablesProps}
     */
    this._props;

    this.initPropsDep(['task', 'module', 'isInUse', 'filter']);
    this._variables = [];
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
      task: 'T_ROB1',
      module: '',
      isInUse: false,
      selected: '',
      label: '',
      addNoSelection: false,
      filter: { name: '', symbolType: '', dataType: '' },
      onSelection: null,
    };
  }

  async onInit() {
    try {
      this.task = await API.RAPID.getTask(this._props.task);

      let vars = [];
      if (Array.isArray(this._props.filter.dataType)) {
        const dataType = this._props.filter.dataType;
        const getVars = dataType.map(async (type) => {
          const filter = Object.assign({}, this._props.filter);
          filter.dataType = type;
          return await this.task.searchVariables(this._props.module, this._props.isInUse, filter);
        });

        const results = await Promise.all(getVars);
        vars = results.flat();
      } else {
        vars = await this.task.searchVariables(this._props.module, this._props.isInUse, this._props.filter);
      }

      this._variables = vars.map((v) => v.name);
    } catch (e) {
      this.error = true;
      Popup_A.error(e, 'TComponents.SelectorVariables_A');
    }
  }

  mapComponents() {
    const ret = {
      selector: new Dropdown_A(this.container, {
        itemList: this._variables,
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
   * @param {object} [filter] - The following filters can be applied:
   * <br>&emsp;name - name of the data symbol (not casesensitive)
   * <br>&emsp;symbolType - valid values: 'constant', 'variable', 'persistent' (array with multiple values is supported)
   * <br>&emsp;dataType - type of the data, e.g. 'num'(only one data type is supported)
   * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
   * @memberof TComponents.SelectorVariables_A
   */
  async updateSearch(module, task = 'T_ROB1', filter = {}) {
    await this.setProps({ task, module, filter }, null, true);
  }

  /**
   * Adds a callback function to be called when an item is selected
   * @alias onSelection
   * @memberof TComponents.SelectorVariables_A
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
