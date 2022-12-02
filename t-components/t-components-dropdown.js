var TComponents = TComponents || {};
(function (o) {
  if (!o.hasOwnProperty('Dropdown_A')) {
    /**
     * @class TComponents.Dropdown_A
     * @extends TComponents.Component_A
     * @param {HTMLElement} container - HTMLElement that is going to be the parent of the component
     * @param {string[]} [itemList] - List of dropdown items
     * @param {string} [selected] - item that shall be shown as selected after first render
     * @param {string} [label] - label text
     * @example
     * const ddMenu = new TComponents.Dropdown_A(
     *    document.querySelector('.comp2-dd-menu'),
     *    ['a', 'b', 'c'],
     *    'b',
     *    'ABC'
     * );
     * ddMenu.render();
     */
    o.Dropdown_A = class Dropdown extends TComponents.Component_A {
      constructor(container, itemList = [], selected = '', label = '') {
        super(container);

        this._dropDownMenu = new FPComponents.Dropdown_A();
        this._dropDownMenu.model = { items: itemList };
        this._dropDownMenu.onselection = this.onChange.bind(this);
        const foundSelected = itemList.indexOf(selected);
        this._dropDownMenu.selected = foundSelected === -1 ? 0 : foundSelected;
        this._dropDownMenu.desc = label;
      }

      /**
       * Contains component specific asynchronous implementation (like access to controller).
       * This method is called internally during initialization process orchestrated by {@link init() init}.
       * @private
       */
      onRender() {
        this._dropDownMenu.attachToElement(this.find('.tc-dropdown-menu'));
      }

      /**
       * Generates the HTML definition corresponding to the component.
       * @private
       * @param {TComponents.Component_A} self - The instance on which this method was called.
       * @returns {string}
       */
      markup({}) {
        return `
        <div>
          <div class="tc-dropdown-menu tc-item"></div>
        </div>
      `;
      }

      /**
       * Callback function called when a item is selected, this method calls the callback funciton added with {@link TComponents.Dropdown_A#onSelection |onSelection}
       * @alias onChange
       * @memberof TComponents.Dropdown_A
       * @param {number}  index - Index of selected item
       * @param {string}  selection - Selected item
       * @private
       * @todo Currently only one function is possible. Change the method to accept multiple callbacks
       */
      onChange(index, selection) {
        if (this.handler !== undefined) this.handler(selection);
      }

      /**
       * Adds a callback function to be called when an item is selected
       * @alias onSelection
       * @memberof TComponents.Dropdown_A
       * @param {function} func
       * @todo Currently only one function is possible. Change the method to accept multiple callbacks
       */
      onSelection(func) {
        this.handler = func;
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
        if (!itemList.includes(this._dropDownMenu.model.items[this._dropDownMenu.selected])) {
          this._dropDownMenu.selected = 0;
        }
      }

      /**
       * Dropdown label
       * @alias lable
       * @type {string}
       * @memberof TComponents.Dropdown_A
       */
      get label() {
        return this._dropDownMenu.desc;
      }

      /**
       */
      set label(text) {
        this._dropDownMenu.desc = text;
      }
    };
  }
})(TComponents);

var roundedStyle = document.createElement('style');
roundedStyle.innerHTML = `

.tc-dropdown-menu {
  min-width: 150px;
}

`;

var ref = document.querySelector('script');
ref.parentNode.insertBefore(roundedStyle, ref);
