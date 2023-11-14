import { Component_A } from './t-components-component.js';

/**
 * @typedef TComponents.DigitalProps
 * @prop {Function} [onClick] Function to be called when indicator is pressed
 * @prop {string} [label] Label text
 */

/**
 * Rounded button that triggers a callback when pressed. Additional callbacks can be added with the {@link TComponents.Digital_A#onClick|onClick} method.
 * @class TComponents.Digital_A
 * @extends TComponents.Component_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.DigitalProps} [props]
 * @property {DigitalProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="digital-container"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 *  const btnExecute = new Digital_A(document.querySelector('.digital-container'), {
 *     onClick: (value) => {
 *       console.log('state changed to ${value}');
 *     },
 *     label: 'Signal indicator',
 *   });
 */
export class Digital_A extends Component_A {
  constructor(parent, props = {}) {
    super(parent, props);

    /**
     * @type {TComponents.DigitalProps}
     */
    this._props;

    this._dig = new FPComponents.Digital_A();
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.Digital_A
   * @returns {TComponents.DigitalProps}
   */
  defaultProps() {
    return {
      onClick: null,
    };
  }

  onRender() {
    this._dig.onclick = this.cbOnClick.bind(this);
    if (this._props.onClick) this.onClick(this._props.onClick);
    this._dig.attachToElement(this.find('.tc-digital-container'));
  }

  markup() {
    return /*html*/ `
          <div class="tc-digital-container flex"></div>
        `;
  }

  /**
   * Set this attribute to true to make the digital indicator activated (1), or false to deactivate it (0).
   * @alias active
   * @type {boolean}
   * @memberof TComponents.Digital_A
   */
  get active() {
    return this._dig.active;
  }

  /**
   * @protected
   */
  set active(value) {
    this._dig.active = value;
  }

  /**
   * Adds a callback funciton to the component. This will be called after the indicator is pressed and released
   * @alias onClick
   * @memberof TComponents.Digital_A
   * @param   {Function}  func    The callback function which is called when the indicator is pressed
   */
  onClick(func) {
    this.on('click', func);
  }

  /**
   * Callback function which is called when the indicator is pressed, it trigger any function registered with {@link onClick() onClick}
   * @alias cbOnClick
   * @memberof TComponents.Digital_A
   * @param   {any}  value
   * @async
   * @private
   */
  async cbOnClick(value) {
    this.trigger('click', value);
  }
}
