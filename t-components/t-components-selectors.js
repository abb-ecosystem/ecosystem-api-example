'use strict';

import { Component_A } from './t-components-component.js';
import { Popup_A } from './t-components-popup.js';

/**
 * @typedef TComponents.DropdownProps
 * @prop {string[]} [itemList] List of dropdown items
 * @prop {string} [selected] item that shall be shown as selected after first render
 * @prop {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
 * @prop {string} [label] Label text
 */

/**
 * @class TComponents.Dropdown_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.DropdownProps} props
 * @example
 * const ddMenu = new Dropdown_A(document.querySelector('.comp2-dd-menu'), {
 *    itemList: ['a', 'b', 'c'],
 *    selected: 'b',
 *    label: 'ABC',
 *  });
 * await ddMenu.render();
 */
export class Dropdown_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.DropdownProps}
     */
    this._props;

    this._dropDownMenu = new FPComponents.Dropdown_A();
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Dropdown_A
   * @returns {TComponents.DropdownProps}
   */
  defaultProps() {
    this.noCheck = ['itemList'];

    return { itemList: [], selected: '', addNoSelection: false, label: '' };
  }

  onRender() {
    // if (this._props.itemList.length === 0) this.error = true;

    this._dropDownMenu.model = { items: this._props.itemList };
    this._dropDownMenu.onselection = this.cbOnSelection.bind(this);
    const foundSelected = this._props.itemList.indexOf(this._props.selected);
    this._dropDownMenu.selected = foundSelected === -1 ? 0 : foundSelected;
    this._dropDownMenu.attachToElement(this.find('.tc-dropdown-container'));

    this.find('.fp-components-dropdown').style.setProperty('min-height', '40px');
  }

  /**
   * Update list of items, only used internally.
   * @param {string[]} itemsList - list of paramenters
   * @protected
   */
  _updateItemList(ilist) {
    let itemList = this._props.addNoSelection ? [''] : [];
    itemList = itemList.concat(ilist);

    let selected = this._props.selected === '' ? itemList[0] : this._props.selected;
    this.setProps({ itemList, selected });

    // if (this._props.addNoSelection) {
    //   const list = [''];
    //   this._props.itemList = list.concat(ilist);
    // } else {
    //   this._props.itemList = ilist;
    // }

    // if (this._props.selected === '') {
    //   this._props.selected = this._props.itemList[0];
    // }
  }

  markup(self) {
    return `
          <div class="tc-dropdown-container"></div>
        `;
  }

  /**
   * Callback function called when a item is selected, this method calls the callback funciton added with {@link TComponents.Dropdown_A#onSelection |onSelection}
   * @alias cbOnSelection
   * @memberof TComponents.Dropdown_A
   * @param {number}  index - Index of selected item
   * @param {string}  selection - Selected item
   * @private
   * @todo Currently only one function is possible. Change the method to accept multiple callbacks
   */
  cbOnSelection(index, selection) {
    this.trigger('selection', selection);
  }

  /**
   * Adds a callback function to be called when an item is selected
   * @alias onSelection
   * @memberof TComponents.Dropdown_A
   * @param {function} func
   * @todo Currently only one function is possible. Change the method to accept multiple callbacks
   */
  onSelection(func) {
    this.on('selection', func);
  }

  /**
   * Selected item
   * @alias selected
   * @type {string}
   * @memberof TComponents.Dropdown_A
   */
  get selected() {
    return this._dropDownMenu.model.items[this._dropDownMenu.selected];
  }

  set selected(value) {
    const newSelection = this._dropDownMenu.model.items.indexOf(value);
    if (newSelection !== -1) {
      this._props.selected = value;
      this._dropDownMenu.selected = newSelection;
      return;
    }
  }

  /**
   * Array of all possible items
   * @alias items
   * @type {string}
   * @memberof TComponents.Dropdown_A
   */
  get items() {
    return this._dropDownMenu.model.items;
  }

  set items(itemList) {
    // if (!items || (Array.isArray(items) && data.length === 0)) return;

    this._dropDownMenu.model = { items: itemList };
    if (
      !this._props.itemList.includes(this._dropDownMenu.model.items[this._dropDownMenu.selected])
    ) {
      this._props.selected = this._dropDownMenu.model.items[0];
      this._dropDownMenu.selected = 0;
    }
  }
}

var roundedStyle = document.createElement('style');
roundedStyle.innerHTML = `

      .tc-dropdown-menu {
        min-width: 150px;
      }

      `;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(roundedStyle, ref);

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

    this.initPropsDependencies = ['module', 'isInUse', 'filter'];
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SelectorVariable_A
   * @returns {TComponents.SelectorVariableProps}
   */
  defaultProps() {
    return {
      module: null,
      isInUse: false,
      selected: '',
      label: '',
      addNoSelection: true,
      filter: {},
    };
  }

  async onInit() {
    try {
      if (!this.task) this.task = await API.RAPID.getTask();
      const vars = await this.task.searchVariables(
        this._props.module,
        this._props.isInUse,
        this._props.filter
      );
      this._updateItemList(vars.map((v) => v.name));
    } catch (e) {
      console.error(e);
      Popup_A.error(e);
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
    this.setProps({ module, filter });
  }
}

/**
 * @typedef TComponents.SelectorProceduresProps
 * @prop {string} module - module to seach for variables
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
 * Selector displaying procedures available inside a module at the controller
 * @class TComponents.SelectorProcedures_A
 * @extends TComponents.Dropdown_A
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
export class SelectorProcedures_A extends Dropdown_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SelectorProceduresProps}
     */
    this._props;

    this.initPropsDependencies = ['module', 'isInUse', 'filter'];
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SelectorProcedure_A
   * @returns {TComponents.SelectorProcedureProps}
   */
  defaultProps() {
    return {
      module: null,
      isInUse: false,
      selected: '',
      label: '',
      addNoSelection: true,
      filter: '',
    };
  }

  async onInit() {
    try {
      if (!this.task) this.task = await API.RAPID.getTask();
      const procs = await this.task.searchProcedures(
        this._props.module,
        this._props.isInUse,
        this._props.filter
      );

      this._updateItemList(procs.map((p) => p.name));
    } catch (e) {
      console.error(e);
      Popup_A.error(e);
    }

    // await super.onInit();
  }

  /**
   * Updates the content of selector based on {@link module} parameter
   * @alias updateSearch
   * @param {string} module - Module to search for procedures
   * @param {string} [filter] - only procedures containing the filter patern (not casesensitive)
   * @memberof TComponents.SelectorProcedures_A
   */
  async updateSearch(module, filter) {
    this.setProps({ module, filter });
  }
}

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

    this.initPropsDependencies = ['isInUse', 'filter'];
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SelectorModule_A
   * @returns {TComponents.SelectorModuleProps}
   */
  defaultProps() {
    return { isInUse: false, selected: '', label: '', addNoSelection: true, filter: '' };
  }

  async onInit() {
    if (!this.task) this.task = await API.RAPID.getTask();
    const modules = await this.task.searchModules(this._props.isInUse, this._props.filter);
    this._updateItemList(modules.map((m) => m.name));
    // await super.onInit();
  }

  /**
   * Updates the content of selector based available modules
   * @alias updateSearch
   * @param {string} [filter] - only modules containing the filter patern (not casesensitive)
   * @memberof TComponents.SelectorModules_A
   */
  async updateSearch(filter = '') {
    this.setProps({ filter });
  }
}

/**
 * Selector displaying Ethernet/IP devices available at the controller
 * @class TComponents.SelectorEthernetIPDevices_A
 * @extends TComponents.Dropdown_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.DropdownProps} props
 * @example
 *  const selectorDevice = new SelectorEthernetIPDevices_A(
 *    document.querySelector('.selector-device'),
 *    { selected: 'ABB_Scalable_IO', label: 'Select a device:' }
 *  );
 *  await selectorDevice.render()
 */
export class SelectorEthernetIPDevices_A extends Dropdown_A {
  constructor(parent, props = {}) {
    super(parent, props);
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SelectorEthernetIPDevices_A
   * @returns {TComponents.DropdownProps}
   */
  defaultProps() {
    return { selected: '', label: '', addNoSelection: true };
  }

  async onInit() {
    this._updateItemList(await API.DEVICE.searchEthernetIPDevices());
    // await super.onInit();
  }

  /**
   * Updates the content of selector based available Ethernet/IP devices
   * @alias updateSearch
   * @memberof TComponents.SelectorEthernetIPDevices_A
   */
  async updateSearch() {
    await this.init();
  }
}

/**
 * @typedef TComponents.SelectorSignalsProps
 * @prop {object} [filter] - An object with filter information:
 * <br>&emsp;(string) name signal name
 * <br>&emsp;(string) device device name
 * <br>&emsp;(string) network network name
 * <br>&emsp;(string) category category string
 * <br>&emsp;(string) type type of signal, valid values: 'DI', 'DO', 'AI', 'AO', 'GI' or 'GO'
 * <br>&emsp;(boolean) invert inverted signals
 * <br>&emsp;(boolean) blocked blocked signals
 * @prop {string[]} [itemList] List of dropdown items
 * @prop {string} [selected] item that shall be shown as selected after first render
 * @prop {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
 * @prop {string} [label] Label text
 */

/**
 * Selector displaying modules available at the controller
 * @class TComponents.SelectorSignals_A
 * @extends TComponents.Dropdown_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.SelectorSignalsProps} props
 * @example
 * const signalSelector = new SelectorSignals_A(
 *    document.querySelector('.signal-dropdown'),
 *    {
 *      filter: { name: 'di_', category: 'EcoSystem' },
 *      selected: 'di_is_gripper_opened',
 *      label: 'Select a signal:',
 *    }
 *  );
 * await signalSelector.render();
 */
export class SelectorSignals_A extends Dropdown_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this.initPropsDependencies = ['filter'];
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SelectorSignal_A
   * @returns {TComponents.SelectorSignalsProps}
   */
  defaultProps() {
    this.noCheck = ['filter'];

    return {
      filter: {},
      selected: '',
      label: '',
      addNoSelection: true,
    };
  }

  async onInit() {
    this._updateItemList(await API.SIGNAL.search(this._props.filter, true));
    // await super.onInit();
  }

  /**
   * Updates the content of selector based on {@link filter} parameter
   * @alias updateSearch
   * @memberof TComponents.SelectorSignals_A
   * @param   {object}  filter - An object with filter information:
   * (string) name signal name
   * (string) device device name
   * (string) network network name
   * (string) category category string
   * (string) type type of signal, valid values: 'DI', 'DO', 'AI', 'AO', 'GI' or 'GO'
   * (boolean) invert inverted signals
   * (boolean) blocked blocked signals
   */
  async updateSearch(filter) {
    this.setProps({ filter });
  }
}
