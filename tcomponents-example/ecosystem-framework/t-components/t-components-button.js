import { Component_A } from './t-components-component.js';

/**
 * @typedef TComponents.ButtonProps
 * @prop {Function} [onClick] Function to be called when button is pressed
 * @prop {string|null} [icon] - Path to image file
 * @prop {string} [text] Button text
 */

/**
 * Rounded button that triggers a callback when pressed. Additional callbacks can be added with the {@link TComponents.Button_A#onClick|onClick} method.
 * @class TComponents.Button_A
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
 *  const btnExecute = new Button_A(document.querySelector('.btn-container'), {
 *     onClick: () => {
 *       console.log('execute');
 *     },
 *     text: 'Execute',
 *   });
 */
export class Button_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.ButtonProps}
     */
    this._props;

    this._btn = new FPComponents.Button_A();
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Button_A
   * @returns {TComponents.ButtonProps}
   */
  defaultProps() {
    return {
      onClick: null,
      icon: null,
      text: 'Click me',
    };
  }

  async onInit() {}

  onRender() {
    this._btn.text = this._props.text;
    this._btn.icon = this._props.icon;
    this._btn.onclick = this.cbOnClick.bind(this);
    if (this._props.onClick) this.on('click', this._props.onClick);

    const btnContainer = this.find('.tc-button');
    if (btnContainer) this._btn.attachToElement(btnContainer);
  }

  markup() {
    return /*html*/ `<div class="tc-button"></div>`;
  }

  get highlight() {
    return this._btn.highlight;
  }

  set highlight(value) {
    this._btn.highlight = value;
  }

  get icon() {
    return this._btn.icon;
  }

  set icon(value) {
    this._btn.icon = value;
  }

  get text() {
    return this._props.text;
  }

  set text(value) {
    this.setProps({ text: value });
  }

  /**
   * Adds a callback funciton to the component. This will be called after the button is pressed and released
   * @alias onClick
   * @memberof TComponents.Button_A
   * @param   {function}  func    The callback function which is called when the button is pressed
   */
  onClick(func) {
    this.on('click', func);
  }

  /**
   * Callback function which is called when the button is pressed, it trigger any function registered with {@link onClick() onClick}
   * @alias cbOnClick
   * @memberof TComponents.Button_A
   * @param   {any}  value
   * @private
   * @async
   */
  async cbOnClick(value) {
    this.trigger('click', value);
  }
}
