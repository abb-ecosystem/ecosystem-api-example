import API from '../api/index.js';
import { Component_A } from './t-components-component.js';

import { Popup_A } from './t-components-popup.js';
import { Dropdown_A } from './t-components-dropdown.js';

/**
 * Selector displaying Ethernet/IP devices available at the controller
 * @class TComponents.SelectorEthernetIPDevices_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.DropdownProps} props
 * @example
 *  const selectorDevice = new SelectorEthernetIPDevices_A(
 *    document.querySelector('.selector-device'),
 *    { selected: 'ABB_Scalable_IO', label: 'Select a device:' }
 *  );
 *  await selectorDevice.render()
 */
export class SelectorEthernetIPDevices_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this._devices = [];
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.SelectorEthernetIPDevices_A
   * @returns {TComponents.DropdownProps}
   */
  defaultProps() {
    return { selected: '', addNoSelection: false };
  }

  async onInit() {
    try {
      this._devices = await API.DEVICE.searchEthernetIPDevices();
    } catch (e) {
      this.error = true;
      Popup_A.error(e, 'TComponents.SelectorEthernetIPDevices_A');
    }
  }

  mapComponents() {
    const ret = {
      selector: new Dropdown_A(this.container, {
        itemList: this._devices,
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
   * Updates the content of selector based available Ethernet/IP devices
   * @alias updateSearch
   * @memberof TComponents.SelectorEthernetIPDevices_A
   */
  async updateSearch() {
    await this.init();
  }

  /**
   * Adds a callback function to be called when an item is selected
   * @alias onSelection
   * @memberof TComponents.SelectorEthernetIPDevices_A
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
