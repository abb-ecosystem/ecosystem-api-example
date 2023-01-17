// @ts-ignore
var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('Selector_A')) {
    /**
     * Base class used by the different TComponents selectors:

     * @class TComponents.Selector_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     * @param {string[]} [itemList]
     * @todo Apply filter to the item list
     * @see TComponents.SelectorVariables_A
     * @see TComponents.SelectorProcedures_A
     * @see TComponents.SelectorModules_A
     * @see TComponents.SelectorEthernetIPDevices_A
     * @see TComponents.SelectorSignals_A
     */
    o.Selector_A = class Selector extends TComponents.Component_A {
      constructor(parent, selected = '', label = '', itemList = ['']) {
        super(parent, label);
        this._selected = selected;
        this._itemList = itemList;
        this.handler = null;
      }

      /**
       * Instantiation of TComponents sub-components that shall be initialized in a synchronous way.
       * All this components are then accessible within {@link onRender() onRender} method by using this.child.<component-instance>
       * @private
       * @returns {object} Contains all child TComponents instances used within the component.
       */
      mapComponents() {
        return {
          ddMenu: new TComponents.Dropdown_A(
            // this.find(".dd-menu"),
            this.container,
            this._itemList,
            this._selected,
            this._label
          ),
        };
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        this.child.ddMenu.onSelection(this.cbOnSelection.bind(this));
      }

      /**
       *
       * @param {*} selection
       */
      async cbOnSelection(selection) {
        if (this.handler !== null) this.handler(selection);
      }

      /**
       * Selected item
       * @alias selected
       * @type {string}
       * @memberof TComponents.Selector_A
       */
      get selected() {
        return this.child.ddMenu.selected;
      }

      set selected(value) {
        if (this.child.ddMenu) {
          this.child.ddMenu.selected = value;
        }
      }

      /**
       * List of items
       * @alias items
       * @type {string[]}
       * @memberof TComponents.Selector_A
       */
      get items() {
        // return this._itemList;
        return this.child.ddMenu.model.items;
      }

      set items(itemList) {
        this.child.ddMenu.items = itemList;
      }

      /**
       * Selector label
       * @alias lable
       * @type {string}
       * @memberof TComponents.Dropdown_A
       */
      get label() {
        return this.child.ddMenu.label;
      }

      /**
       */
      set label(text) {
        this.child.ddMenu.label = text;
      }

      /**
       * Add a callback on selection
       * @alias onSelection
       * @param {function} func - callback function
       * @memberof TComponents.Selector_A
       */
      onSelection(func) {
        if (typeof func !== 'function' && func !== null)
          throw new Error('callback is not a valid function');
        this.handler = func;
      }

      /**
       * Update list of items, only used internally.
       * @param {string[]} itemsList - list of paramenters
       * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
       * @protected
       */
      _updateItemList(itemsList, addNoSelection = true) {
        if (addNoSelection) {
          this._itemList = [''];
          this._itemList = this._itemList.concat(itemsList);
        } else {
          this._itemList = itemsList;
        }

        if (this._selected === '') {
          this._selected = this._itemList[0];
        }
      }
    };

    /**
     * Selector displaying variables available inside a module at the controller
     * @class TComponents.SelectorVariables_A
     * @extends TComponents.Selector_A
     * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
     * @param {string} module - module to seach for variables
     * @param {boolean} [isInUse] - only return symbols that are used in a Rapid program, i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
     * @param {object} [filter] - The following filters can be applied:
     * <br>&emsp;name - name of the data symbol (not casesensitive)
     * <br>&emsp;symbolType - valid values: 'constant', 'variable', 'persistent' (array with multiple values is supported)
     * <br>&emsp;dataType - type of the data, e.g. 'num'(only one data type is supported)
     * i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
     * @example
     *  const selectorVar = new TComponents.SelectorVariables_A(
     *     document.querySelector('.selector-var'),
     *     'Ecosystem_BASE',
     *     true,
     *     '',
     *     'Select a variable:'
     *   );
     * @todo Apply filter to the item list
     */
    o.SelectorVariables_A = class SelectorVariables extends TComponents.Selector_A {
      constructor(
        parent,
        module = null,
        isInUse = false,
        selected = '',
        label = '',
        addNoSelection = true,
        filter = {}
      ) {
        super(parent, selected, label);
        this.module = module;
        this.isInUse = isInUse;
        this._addNoSelection = addNoSelection;
        this._filter = filter;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        if (this.module) {
          try {
            if (!this.task) this.task = await API.RAPID.getTask();
            const vars = await this.task.searchVariables(this.module, this.isInUse, this._filter);
            this._updateItemList(
              vars.map((v) => v.name),
              this._addNoSelection
            );
          } catch (e) {
            console.error(e);
            TComponents.Popup_A.error(e);
          }
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
        this.module = module;
        this._filter = filter;
        await this.init();
      }
    };

    /**
     * Selector displaying procedures available inside a module at the controller
     * @class TComponents.SelectorProcedures_A
     * @extends TComponents.Selector_A
     * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
     * @param {string} module - module to search for procedures
     * @param {boolean} isInUse - only return symbols that are used in a Rapid program, i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
     * @param {string} [filter] - only procedures containing the filter patern (not casesensitive)
     * @example
     *  const procSelector = new TComponents.SelectorProcedures_A(
     *     document.querySelector('.proc-dropdown'),
     *     'Ecosystem_BASE',
     *     false,
     *     '',
     *     'Select a procedure:'
     *   );
     *
     * @todo Apply filter to the item list
     */
    o.SelectorProcedures_A = class SelectorProcedures extends TComponents.Selector_A {
      constructor(
        parent,
        module = null,
        isInUse = false,
        selected = '',
        label = '',
        addNoSelection = true,
        filter = ''
      ) {
        super(parent, selected, label);
        this.module = module;
        this.isInUse = isInUse;
        this._addNoSelection = addNoSelection;
        this._filter = filter;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        if (this.module) {
          try {
            if (!this.task) this.task = await API.RAPID.getTask();
            const procs = await this.task.searchProcedures(this.module, this.isInUse, this._filter);
            this._updateItemList(
              procs.map((p) => p.name),
              this._addNoSelection
            );
          } catch (e) {
            console.error(e);
            TComponents.Popup_A.error(e);
          }
        }
      }

      /**
       * Updates the content of selector based on {@link module} parameter
       * @alias updateSearch
       * @param {string} module - Module to search for procedures
       * @param {string} [filter] - only procedures containing the filter patern (not casesensitive)
       * @memberof TComponents.SelectorProcedures_A
       */
      async updateSearch(module, filter) {
        this.module = module;
        this._filter = filter;
        await this.init();
      }
    };

    /**
     * Selector displaying modules available at the controller
     * @class TComponents.SelectorModules_A
     * @extends TComponents.Selector_A
     * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
     * @param {boolean} isInUse - only return symbols that are used in a Rapid program, i.e. a type declaration that has no declared variable will not be returned when this flag is set true.
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
     * @param {string} [filter] - only modules containing the filter patern (not casesensitive)
     * @example
     * const modSelector = new TComponents.SelectorModules_A(
     *    document.querySelector('.module-dropdown'),
     *    false,
     *    '',
     *    'Select a module:'
     *  );
     * @todo Apply filter to the item list
     */
    o.SelectorModules_A = class SelectorModules extends TComponents.Selector_A {
      constructor(
        parent,
        isInUse = false,
        selected = '',
        label = '',
        addNoSelection = true,
        filter = ''
      ) {
        super(parent, selected, label);
        this.isInUse = isInUse;
        this._addNoSelection = addNoSelection;
        this._filter = filter;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        if (!this.task) this.task = await API.RAPID.getTask();
        const modules = await this.task.searchModules(this.isInUse, this._filter);
        this._updateItemList(
          modules.map((m) => m.name),
          this._addNoSelection
        );
      }

      /**
       * Updates the content of selector based available modules
       * @alias updateSearch
       * @param {string} [filter] - only modules containing the filter patern (not casesensitive)
       * @memberof TComponents.SelectorModules_A
       */
      async updateSearch(filter = '') {
        this._filter = filter;
        await this.init();
      }
    };

    /**
     * Selector displaying Ethernet/IP devices available at the controller
     * @class TComponents.SelectorEthernetIPDevices_A
     * @extends TComponents.Selector_A
     * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
     * @example
     *  const selectorDevice = new TComponents.SelectorEthernetIPDevices_A(
     *     document.querySelector('.selector-device'),
     *     '',
     *     'Select a device:'
     *   );
     * @todo Apply filter to the item list
     */
    o.SelectorEthernetIPDevices_A = class SelectorEthernetIPDevices extends TComponents.Selector_A {
      constructor(parent, selected = '', label = '', addNoSelection = true) {
        super(parent, selected, label);
        this._addNoSelection = addNoSelection;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        this._updateItemList(await API.DEVICE.searchEthernetIPDevices(), this._addNoSelection);
      }

      /**
       * Updates the content of selector based available Ethernet/IP devices
       * @alias updateSearch
       * @memberof TComponents.SelectorEthernetIPDevices_A
       */
      async updateSearch() {
        await this.init();
      }
    };

    /**
     * Selector displaying modules available at the controller
     * @class TComponents.SelectorSignals_A
     * @extends TComponents.Selector_A
     * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
     * @param {object} filter - An object with filter information:
     * <br>&emsp;(string) name signal name
     * <br>&emsp;(string) device device name
     * <br>&emsp;(string) network network name
     * <br>&emsp;(string) category category string
     * <br>&emsp;(string) type type of signal, valid values: 'DI', 'DO', 'AI', 'AO', 'GI' or 'GO'
     * <br>&emsp;(boolean) invert inverted signals
     * <br>&emsp;(boolean) blocked blocked signals
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     * @param {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
     * @example
     * const signalSelector = new TComponents.SelectorSignals_A(
     *   document.querySelector('.signal-dropdown'),
     *   { name: 'di_', category: 'EcoSystem' },
     *   'di_is_gripper_opened',
     *   'Select a signal:'
     * )
     */
    o.SelectorSignals_A = class SelectorSignals extends TComponents.Selector_A {
      constructor(parent, filter = {}, selected = '', label = '', addNoSelection = true) {
        super(parent, selected, label);
        this._filter = filter;
        this._addNoSelection = addNoSelection;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       * @async
       */
      async onInit() {
        this._updateItemList(await API.SIGNAL.search(this._filter, true), this._addNoSelection);
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
        this._filter = filter;
        await this.init();
      }
    };
  }
})(TComponents);
