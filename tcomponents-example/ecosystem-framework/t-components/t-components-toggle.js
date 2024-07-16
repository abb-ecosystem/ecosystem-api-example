import { Component_A } from './t-components-component.js';

/**
 * @typedef TComponents.ButtonProps
 * @prop {Function} [onClick] callback function that should be called when any button in the component is toggled.
 * This callback function will not be called when the user clicks on a button that does not change state, for example when clicking already toggled button and singleAllowNone is true.
 * The function will return a state object containing which buttons changed and what they changed to, as well as current state of all buttons.
 * Example of state object: { all: [false, true, false], changed: [ [1, true], [2, false] ] }the all property represents all toggle buttons and their current state, so in the example above the first button is untoggled, second is toggled and third is untoggled. The changed property represents what changed when the user clicked a button, it’s an array containing one array per changed button. Each button array with index of button changed, and what state it changed to. In the example above it says that button with index 1 changed to true, and button with index 2 changed to false, which can be verified in the all array as well.
 * @prop {boolean} [multi] Set this attribute to true to allow selection of multiple options in toggle. When set to true will ignore singleAllowNone setting, since all toggles will be toggled independently from each other.
 * Set this attribute to false (default) to allow selection of only one option at a time.
 * @prop {boolean} [singleAllowNone] Set this attribute to true to allow removing all selections and leaving toggle component without selected option.
 * Set this attribute to false (default) to force at least one option to be selected. Only works if multi is set to false as well.
 * @prop {object} model This attribute represents the buttons in the toggle component. Contains a list of objects where each object represents a button.
 * The following attributes can be used on each element object:
 * - text (mandatory): Text displayed on button
 * - icon (optional): The path (relative to the web root, i.e. where the WebApp manifest is located) to an image to be displayed on the button.
 * The optimal size for the icon image is 24x24 pixels, but it will be automatically resized.
 * - toggledIcon (optional): Same requirements as icon attribute.
 * When set will display the icon only when button is in toggled state. Will override icon attribute when button is toggled if both are set.
 */

/**
 * The toggle component works as a group of buttons that allows the user to select only one or multiple values, depending on configuration of toggle component.
 * Each item in the toggle component can be configured separately to have different text, and different icons for both toggled and untoggled states.
 * @class TComponents.Toggle_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ButtonProps} [props]
 * @property {ButtonProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 *  const btnExecute = new Toggle_A(document.querySelector('.btn-container'), {
 *     onClick: () => {
 *       console.log('execute');
 *     },
 *     text: 'Execute',
 *   });
 */
export class Toggle_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonProps}
     */
    this._props;

    this._toggle = new FPComponents.Toggle_A();

    this.initPropsDep('modal');
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Toggle_A
   * @returns {TComponents.ButtonProps}
   */
  defaultProps() {
    return {
      model: [{ text: 'Option 1' }, { text: 'Option 2' }, { text: 'Option 3' }],
      multi: false,
      singleAllowNone: false,
      onClick: null,
      asColumn: false,
      transparent: false,
    };
  }

  async onInit() {
    // check modal to see if it is valid
    if (!this._props.model || !Array.isArray(this._props.model)) {
      throw new Error('Model is not valid');
    }
    //check if each element is valid
    for (let i = 0; i < this._props.model.length; i++) {
      if (!this._props.model[i].text) throw new Error('Model is not valid');
    }
  }

  onRender() {
    try {
      this._toggle.model = this._props.model;
      this._toggle.multi = this._props.multi;
      this._toggle.singleAllowNone = this._props.singleAllowNone;

      this._toggle.onclick = this.cbOnClick.bind(this);
      if (this._props.onClick) this.on('click', this._props.onClick);

      const elContainer = this.find('.tc-toggle');
      if (elContainer) this._toggle.attachToElement(elContainer);

      const elToggle = this.find('.fp-components-toggle');
      if (this._props.asColumn) elToggle.classList.add('flex-col');
      else elToggle.classList.add('flex-row');

      if (this._props.transparent) elToggle.classList.add('fp-transparent');
    } catch (e) {
      console.error('Error setting icon', e);
    }
  }

  markup() {
    return /*html*/ `<div class="tc-toggle"></div>`;
  }

  /**
   * Will set button with specified index to the provided toggled state. This operation will not cause onclick callbacks to be fired when used.
   * By default, this method will follow the limitations on toggled state (multi, singleAllowNone). Setting the optional noLimitations argument to true will force the toggle regardless of usage limitations.
   * @param {number} index - The index of the component.
   * @param {boolean} toggled - The toggled state to set.
   * @param {boolean} [noLimitations=false] - Whether to apply any limitations.
   * @throws {Error} Throws an error if the toggle component is not initialized.
   */
  setToggled(index, toggled, noLimitations = false) {
    if (!this._toggle) throw new Error('Toggle component not initialized');
    this._toggle.setToggled(index, toggled);
  }

  /**
   * Returns true if button with provided index is toggled and returns false otherwise. if index is not valid ( out of range, or not a number ) will return undefined.
   */
  getToggledList() {
    if (!this._toggle) throw new Error('Toggle component not initialized');
    this._toggle.getToggledList();
  }

  /**
   * Returns true if button with provided index is toggled and returns false otherwise. if index is not valid ( out of range, or not a number ) will return undefined.
   *
   * @param {number} index - The index of the toggle component.
   * @returns {boolean} - Returns `true` if the toggle component is toggled at the specified index, otherwise `false`.
   * @throws {Error} - Throws an error if the toggle component is not initialized.
   */
  isToggled(index) {
    if (!this._toggle) throw new Error('Toggle component not initialized');
    return this._toggle.isToggled(index);
  }

  /**
   * Callback function that should be called when any button in the component is toggled.
   * This callback function will not be called when the user clicks on a button that does not change state,
   * for example when clicking already toggled button and singleAllowNone is true.
   * The function will return a state object containing which buttons changed and what they changed to, as well as current state of all buttons.
   * Example of state object: { all: [false, true, false], changed: [ [1, true], [2, false] ] }
   * the all property represents all toggle buttons and their current state, so in the example above the first button is untoggled, second is toggled and third is untoggled.
   * The changed property represents what changed when the user clicked a button, it’s an array containing one array per changed button.
   * Each button array with index of button changed, and what state it changed to.
   * In the example above it says that button with index 1 changed to true, and button with index 2 changed to false, which can be verified in the all array as well.
   * @memberof TComponents.Toggle_A
   * @param   {function}  func    The callback function which is called when the button is pressed
   */
  onClick(func) {
    this.on('click', func);
  }

  /**
   * Callback function which is called when the button is pressed, it trigger any function registered with {@link onClick() onClick}
   * @alias cbOnClick
   * @memberof TComponents.Toggle_A
   * @param   {any}  value
   * @private
   * @async
   */
  async cbOnClick(value) {
    this.trigger('click', value);
  }
}

Toggle_A.loadCssClassFromString(/*css*/ `

.fp-components-toggle.flex-col > .fp-components-toggle-on + *,
.fp-components-toggle.flex-col > .fp-components-toggle-on:hover + *:not(.fp-components-toggle-on),
.fp-components-toggle.flex-col > *:hover:not(.fp-components-toggle-on) + *:not(.fp-components-toggle-on)  {
  border-left-color: transparent;
}



.fp-components-toggle.fp-transparent > *:not(.fp-components-toggle-on) {
  background-color: transparent;
  border-color: transparent;
}

.fp-components-toggle.fp-transparent > *:hover:not(.fp-components-toggle-on){
  background-color: var(--fp-color-BLACK-OPACITY-4);
  border-left-color: var(--fp-color-BLUE-PRIMARY-HIGHLIGHT);
}


`);
