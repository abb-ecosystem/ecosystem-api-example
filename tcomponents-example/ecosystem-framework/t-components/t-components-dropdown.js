import { Component_A } from './t-components-component.js';

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
    if (this._props.itemList.length === 0) this._dropDownMenu.enabled = false;

    this._dropDownMenu.model = { items: this._props.itemList };
    this._dropDownMenu.onselection = this.cbOnSelection.bind(this);
    const foundSelected = this._props.itemList.indexOf(this._props.selected);
    this._dropDownMenu.selected = foundSelected === -1 ? 0 : foundSelected;
    this._dropDownMenu.attachToElement(this.find('.tc-dropdown-container'));

    this.find('.fp-components-dropdown').style.setProperty('min-height', '40px');
  }

  /**
   * Update list of items, only used internally.
   * @param {string[]} ilist - list of paramenters
   * @protected
   */
  _updateItemList(ilist) {
    let itemList = this._props.addNoSelection ? [''] : [];
    itemList = itemList.concat(ilist);

    let selected = this._props.selected === '' ? itemList[0] : this._props.selected;
    this.setProps({ itemList, selected });
  }

  markup(self) {
    return /*html*/ `
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
   */
  cbOnSelection(index, selection) {
    this.trigger('selection', selection);
  }

  /**
   * Adds a callback function to be called when an item is selected
   * @alias onSelection
   * @memberof TComponents.Dropdown_A
   * @param {function} func
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

  set selected(selected) {
    this.setProps({ selected });
  }

  /**
   * Array of all possible items
   * @alias items
   * @type {string[]}
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

Dropdown_A.loadCssClassFromString(/*css*/ `

.tc-dropdown-menu {
  min-width: 150px;
}

`);
