import { Component_A } from './t-components-component.js';

/**
 * @class DropDownButton_A
 * @classdesc DropDownButton component is a combination of a button and a dropdown list.
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - The parent element to which the view will be rendered
 * @param {Object} props - The properties object to be passed to the view
 */
export class DropDownButton_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);
  }

  /**
   * Returns an object with expected input properties together with their initial value.
   * Every child class shall have a {@link defaultProps} to register its corresponding input properties.
   * @alias defaultProps
   * @memberof DropDownButton_A
   * @returns {Object}
   */
  defaultProps() {
    return {
      itemList: [],
      selected: '',
      icon: '',
      label: '',
      onClick: null,
      onSelection: null,
    };
  }

  onInit() {
    if (this._props.onClick) this.on('click', this._props.onClick);
    if (this._props.onSelection) this.on('selection', this._props.onSelection);
  }

  /**
   * Instantiation of DropDownButton sub-components that shall be initialized in a synchronous way.
   * All this components are then accessible within {@link onRender() onRender} method by using this.child.<component-instance>
   * Create base t-components for the incremental/decremental input.
   * @alias mapComponents
   * @memberof DropDownButton_A
   * @returns {object} Contains all child DropDownButton instances used within the component.
   */
  mapComponents() {
    const btn = new TComponents.Button_A(this.find('.button-element'), {
      text: this._props.selected,
      icon: this._props.icon,
    });

    const dropdown = new TComponents.Dropdown_A(this.find('.dropdown-element'), {
      itemList: this._props.itemList,
      selected: this._props.selected,
      addNoSelection: false,
    });
    const dropdownOnSelection = () => {
      btn.text = dropdown.selected;
      this.trigger('selection', dropdown.selected);
    };
    dropdown.onSelection(dropdownOnSelection.bind(this));
    btn.onClick(() => this.trigger('click', dropdown.selected));

    return {
      btn,
      dropdown,
    };
  }

  onRender() {
    this.child.btn.text = this.child.dropdown.selected;
  }

  /**
   * Generates the HTML definition corresponding to the component.
   * div container for the incremental/decremental input
   * @alias markup
   * @memberof DropDownButton_A
   * @returns {string}
   */
  markup() {
    return /*html*/ `
          <div class="element-container flex-row items-center justify-stretch">
            <div class="button-element"></div>
            <div class="dropdown-element"></div>
          </div>
      `;
  }

  /**
   * Set the enable property of the element
   * @alias enable
   * @memberof DropDownButton_A
   * @param {boolean} value - The value to be set
   */
  set enable(value) {
    this.child.btn.enable = value;
    this.child.dropdown.enable = value;
  }

  /**
   * Get the enable property of the element
   * @alias enable
   * @memberof DropDownButton_A
   * @returns {boolean}
   */
  get enable() {
    return this.child.btn.enable;
  }

  /**
   * Set the selected property of the element
   * @alias selected
   * @memberof DropDownButton_A
   * @param {string} value - The value to be set
   */
  set selected(value) {
    this.child.dropdown.selected = value;
    this.child.btn.text = value;
  }

  /**
   * Get the selected property of the element
   * @alias selected
   * @memberof DropDownButton_A
   * @returns {string}
   */
  get selected() {
    return this.child.dropdown.selected;
  }

  /**
   * Set the items property of the element
   * @alias items
   * @memberof DropDownButton_A
   * @param {Array} value - The value to be set
   */
  set items(value) {
    this.child.dropdown.items = value;
  }

  /**
   * Get the items property of the element
   * @alias items
   * @memberof DropDownButton_A
   * @returns {Array}
   */
  get items() {
    return this.child.dropdown.items;
  }
}

/**
 * Add css properties to the component
 * @alias loadCssClassFromString
 * @static
 * @param {string} css - The css string to be loaded into style tag
 * @memberof DropDownButton_A
 */
DropDownButton_A.loadCssClassFromString(/*css*/ `
  .dropdown-element {
    max-width: 40px;
  }
  .dropdown-element .t-component{
    min-width: 40px !important;
  }
  .dropdown-element .fp-components-dropdown{
    border-radius: 0px 20px 20px 0px;
    background-color: var(--t-color-GRAY-10);
    border: none;
    height: 40px;
    margin-left: 2px;
  }
  .dropdown-element .fp-components-dropdown > p {
    display:none;
  }
  .button-element .fp-components-button, .button-element .fp-components-button-disabled{
    border-radius: 20px 0px 0px 20px;
  }
`);
