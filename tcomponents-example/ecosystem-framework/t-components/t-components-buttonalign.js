import API from '../api/index.js';
import { Popup_A } from './t-components-popup.js';
import { Button_A } from './t-components-button.js';
import { Dropdown_A } from './t-components-dropdown.js';

/**
 * @typedef TComponents.ButtonAlignProps
 * @prop {string} [tool] Active tool - default='', which means current tool,
 * @prop {string} [wobj] Active working object - defaut='', which means current working object,
 * @prop {string} [coords] Active coordinate system {@link API.MOTION.COORDS} , defaut=API.MOTION.COORDS.Current,
 * @prop {boolean} [selector] Show coordinate selector - default=false,
 * @prop {Function} [callback] Function to be called when button is pressed
 * @prop {string} [label] Label text
 * @prop {string|null} [icon] - Path to image file
 */

/**
 * Button to align the tool center point with respect to the coordinate system provided within the {@link TComponents.ButtonAlignProps}.
 * If the {@link TComponents.ButtonAlignProps.selector} is set to true, a coordinate selector element will be added to the button.
 * @class TComponents.ButtonAlign_A
 * @extends TComponents.Button_A
 * @param {HTMLElement} parent - HTMLElement that is going to be the parent of the component
 * @param {TComponents.ButtonAlignProps} props
 * @example
 * // index.html
 * ...
 * &lt;div class="btn-align"&gt;&lt;/div&gt;
 * ...
 *
 * // index.js
 * const btnMove = new ButtonAlign_A(
 *    document.querySelector('.btn-align'),
 *    {text: 'Align'}
 *  );
 *  await btnMove.render();
 */
export class ButtonAlign_A extends Button_A {
  constructor(parent, props = {}) {
    super(parent, props);

    this._isJogging = false;
    if (!this._props.text) this._props.text = 'Align';
  }

  /**
   * Returns class properties default values. Notice that parent properties are not included.
   * @alias defaultProps
   * @memberof TComponents.ButtonAlign_A
   * @returns {TComponents.ButtonAlignProps}
   */
  defaultProps() {
    return {
      tool: '',
      wobj: '',
      coords: API.MOTION.COORDS.Current,
      selector: false,
    };
  }

  mapComponents() {
    return this._props.selector
      ? {
          selector: new Dropdown_A(this.find('.btn-align__coords'), {
            itemList: ['Base', 'Work Object', 'World'],
            selected: 'Base',
          }),
        }
      : {};
  }

  onRender() {
    super.onRender();

    const elemBtnMove = this.find('.btn-align__btn');
    this.addEventListener(elemBtnMove, 'pointerdown', this.align.bind(this));
    this.addEventListener(elemBtnMove, 'pointerup', this.stop.bind(this));
    this.addEventListener(elemBtnMove, 'pointerleave', this.stop.bind(this));

    // relocating the fpcomponent button inside the markup
    const btnEl = this.container.querySelector('.fp-components-button');
    if (btnEl) this.container.removeChild(btnEl);
    this._btn.attachToElement(this.find('.btn-align__btn'));
  }

  markup() {
    return /*html*/ `
      <div class="tc-btn-align flex-row gap-2 justify-stretch">
        <div class="btn-align__btn"></div>
        ${this._props.selector ? '<div class="btn-align__coords"></div>' : ''}
      </div>
    `;
  }

  /**
   * Align the robot TCP
   * @alias align
   * @memberof TComponents.ButtonAlign_A
   * @async
   */
  async align() {
    if (this._btn.enabled) {
      const jogData = [500, 500, 500, 500, 500, 500];

      if (this._props.selector) {
        const coord = this.child.selector.selected;
        switch (coord) {
          case 'Base':
            this._props.coords = API.MOTION.COORDS.Base;
            break;
          case 'Work Object':
            this._props.coords = API.MOTION.COORDS.Wobj;
            break;
          case 'World':
            this._props.coords = API.MOTION.COORDS.World;
            break;
        }
      }

      const wobj = await API.MOTION.getWobj();

      try {
        let props = {
          jogMode: API.MOTION.JOGMODE.Align,
          jogData: jogData,
          wobj,
        };
        if (this._props.tool) props = Object.assign(props, { tool: this._props.tool });
        if (this._props.wobj) props = Object.assign(props, { wobj: this._props.wobj });
        if (this._props.coords) props = Object.assign(props, { coords: this._props.coords });

        this._isJogging = true;
        await API.MOTION.executeJogging(props);
      } catch (e) {
        this._isJogging = false;
        Popup_A.error(e, 'TComponents.ButtonAlign_A');
      }
    }
  }

  /**
   * Stops align
   * @alias stop
   * @memberof TComponents.ButtonAlign_A
   * @async
   */
  async stop() {
    if (this._btn.enabled) {
      if (this._isJogging) {
        try {
          await API.MOTION.stopJogging();
        } catch (e) {
          Popup_A.error(e, 'TComponents.ButtonAlign_A');
        }
        this._isJogging = false;
      }
    }
  }
}

ButtonAlign_A.loadCssClassFromString(
  /*css*/
  `
.tc-btn-align .btn-align__coords {
  min-width: 136px;
}

`
);
