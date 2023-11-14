import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Dropdown_A } from './t-components-dropdown.js';

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

    this.initPropsDep(['filter']);
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
      addNoSelection: false,
    };
  }

  async onInit() {
    try {
      this._updateItemList(await API.SIGNAL.search(this._props.filter, true));
    } catch (e) {
      this.error = true;
      Popup_A.error(e, 'TComponents.SelectorSignal_A');
    }
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
    await this.setProps({ filter }, null, true);
  }
}
