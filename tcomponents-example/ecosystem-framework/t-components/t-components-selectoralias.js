import { Dropdown_A } from './t-components-dropdown.js';

/**
 * @typedef ItemMap
 * @prop {string} item The string value used internally for the item selection
 * @prop {string} alias The string to be displayed on the selector
 * @memberof TComponents.SelectorAlias_A
 */

/**
 * @typedef TComponents.SelectorAliasProps
 * @prop {ItemMap[] } [itemMap] Map of dropdown items objects with item key and alias value, like { item: 'item1', alias: 'alias1' }
 * @prop {string} [selected] item that shall be shown as selected after first render
 * @prop {boolean} [addNoSelection] - if true, and empty selector item is placed as first item
 * @prop {string} [label] Label text
 */

/**
 * Selector displaying variables available inside a module at the controller
 * @class TComponents.SelectorAlias_A
 * @extends TComponents.Dropdown_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.SelectorAliasProps} props
 *
 */
export class SelectorAlias_A extends Dropdown_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.SelectorAliasProps}
     */
    this._props;

    this._validateItemMap(this._props.itemMap);
  }

  defaultProps() {
    return {
      itemMap: [{ item: '', alias: '' }],
    };
  }

  async onInit() {
    const aliasList = this._props.itemMap.reduce((acc, item) => {
      acc.push(item.alias);
      return acc;
    }, []);

    this._updateItemList(aliasList);
  }

  cbOnSelection(index, selection) {
    this.trigger(
      'selection',
      this._props.itemMap.find((item) => item.alias === selection).item,
      selection
    );
  }

  /**
   * Selected item
   * @alias selected
   * @type {string}
   * @memberof TComponents.SelectorAlias_A
   */
  get selected() {
    const s = super.selected;
    const sel = this._props.itemMap.find((item) => item.alias === s).item;
    console.log('SelectorAlias_A: selected', sel);

    return this._props.itemMap.find((item) => item.alias === s).item;
  }

  set selected(value) {
    const s = this._props.itemMap.find((item) => item.item === value);
    if (s) super.selected = s.alias;
  }

  /**
   * Array of all possible items
   * @alias items
   * @type {string[]}
   * @memberof TComponents.SelectorAlias_A
   */
  get items() {
    // get all items from this._props.itemMap
    return this._props.itemMap.map((item) => item.item);
  }

  set items(itemMap) {
    this._validateItemMap(itemMap);

    this._props.itemMap = itemMap;
    this._updateItemList(this._props.itemMap.forEach((item) => item.alias));
  }

  _validateItemMap(itemMap) {
    itemMap.forEach((element) => {
      if (!element.item || !element.alias) {
        throw new Error(
          'SelectorAlias_A: itemMap must be an array of objects with item and alias properties'
        );
      }
    });
  }
}
