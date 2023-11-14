import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Dropdown_A } from './t-components-dropdown.js';

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
    return { selected: '', label: '', addNoSelection: false };
  }

  async onInit() {
    try {
      this._updateItemList(await API.DEVICE.searchEthernetIPDevices());
    } catch (e) {
      this.error = true;
      Popup_A.error(e, 'TComponents.SelectorEthernetIPDevices_A');
    }
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
